import type { DecisionResult } from "@/types";

export type AIExplainResponse = {
  headline: string;
  explanation: string;
  bullets: string[];
  cautions: string[];
};

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function validateExplainResponseShape(v: unknown): v is AIExplainResponse {
  if (!isPlainObject(v)) return false;

  const headline = v["headline"];
  const explanation = v["explanation"];
  const bullets = v["bullets"];
  const cautions = v["cautions"];

  if (typeof headline !== "string") return false;
  if (typeof explanation !== "string") return false;

  if (!Array.isArray(bullets) || bullets.length < 3 || bullets.length > 5) return false;
  if (!bullets.every((x) => typeof x === "string")) return false;

  if (!Array.isArray(cautions) || cautions.length < 1 || cautions.length > 3) return false;
  if (!cautions.every((x) => typeof x === "string")) return false;

  // Reject extra keys to keep the response contract tight
  const keys = Object.keys(v);
  const allowed = new Set(["headline", "explanation", "bullets", "cautions"]);
  if (keys.some((k) => !allowed.has(k))) return false;

  return true;
}

/**
 * Extract numeric tokens from strings, like:
 * "$1,234", "25%", "72", "0.25"
 */
export function extractNumericTokens(text: string): string[] {
  const matches = text.match(/[-+]?\d[\d,]*(\.\d+)?/g);
  return matches ?? [];
}

function normalizeNumericToken(token: string): string {
  // Remove commas. Caller should have already stripped $/% by extracting only digits+commas+dot.
  return token.replace(/,/g, "");
}

function buildAllowlistNumbers(args: {
  result: DecisionResult;
  context?: {
    ownershipMonths?: number;
    leaseTermMonths?: number;
    mileageAllowancePerYear?: number;
    estMilesPerYear?: number;
  };
}): Set<string> {
  const { result, context } = args;

  const nums: number[] = [
    result.buyTotalCost,
    result.leaseTotalCost,
    result.buyMonthlyAllIn,
    result.leaseMonthlyAllIn,
    result.buyStressScore,
    result.leaseStressScore
  ];

  if (context?.ownershipMonths != null) nums.push(context.ownershipMonths);
  if (context?.leaseTermMonths != null) nums.push(context.leaseTermMonths);
  if (context?.mileageAllowancePerYear != null) nums.push(context.mileageAllowancePerYear);
  if (context?.estMilesPerYear != null) nums.push(context.estMilesPerYear);

  // Allow both integer and fixed representations by stringifying in a few forms.
  const allow = new Set<string>();
  for (const n of nums) {
    if (!Number.isFinite(n)) continue;
    allow.add(String(n));
    allow.add(String(Math.round(n)));
    allow.add(n.toFixed(2));
    allow.add(n.toFixed(0));
  }

  return allow;
}

/**
 * Rejects hallucinated numbers by ensuring every numeric token in the AI response
 * appears in the allowlist derived from the provided DecisionResult + optional context.
 */
export function passesNumberAllowlist(args: {
  ai: AIExplainResponse;
  result: DecisionResult;
  context?: {
    ownershipMonths?: number;
    leaseTermMonths?: number;
    mileageAllowancePerYear?: number;
    estMilesPerYear?: number;
  };
}): { ok: true } | { ok: false; reason: string; offending: string[] } {
  const { ai, result, context } = args;

  const allow = buildAllowlistNumbers({ result, context });

  const allText =
    `${ai.headline} ${ai.explanation} ${ai.bullets.join(" ")} ${ai.cautions.join(" ")}`;

  const tokens = extractNumericTokens(allText).map(normalizeNumericToken);

  // If no numbers are present, it's safe from numeric hallucinations.
  if (tokens.length === 0) return { ok: true };

  const offending = tokens.filter((t) => !allow.has(t));

  if (offending.length > 0) {
    return {
      ok: false,
      reason: "AI response contained numbers not present in allowlist",
      offending: Array.from(new Set(offending))
    };
  }

  return { ok: true };
}

