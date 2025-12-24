import { NextResponse } from "next/server";
import type {
  BuyScenario,
  DecisionResult,
  LeaseScenario,
  UserProfile
} from "@/types";
import {
  formatCurrency,
  formatMonths,
  formatVerdict,
  formatConfidence,
  formatStressLabel
} from "@/lib/formatters";

type ExplainRequest = {
  result: DecisionResult;

  // Optional context to improve explanation quality (not required for MVP)
  user?: UserProfile;
  buy?: BuyScenario;
  lease?: LeaseScenario;

  // Optional: "short" for a tight explanation, "detailed" for longer.
  verbosity?: "short" | "detailed";
};

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function validateDecisionResult(result: unknown): result is DecisionResult {
  if (!isPlainObject(result)) return false;

  const requiredNumberFields = [
    "buyTotalCost",
    "leaseTotalCost",
    "buyMonthlyAllIn",
    "leaseMonthlyAllIn",
    "buyStressScore",
    "leaseStressScore"
  ];

  for (const key of requiredNumberFields) {
    const val = (result as Record<string, unknown>)[key];
    if (typeof val !== "number" || !Number.isFinite(val)) return false;
  }

  const verdict = (result as Record<string, unknown>)["verdict"];
  const confidence = (result as Record<string, unknown>)["confidence"];
  const summary = (result as Record<string, unknown>)["summary"];
  const riskFlags = (result as Record<string, unknown>)["riskFlags"];

  if (verdict !== "buy" && verdict !== "lease") return false;
  if (confidence !== "low" && confidence !== "medium" && confidence !== "high") return false;
  if (typeof summary !== "string") return false;
  if (!Array.isArray(riskFlags) || !riskFlags.every((x) => typeof x === "string")) return false;

  return true;
}

function buildExplanation(req: ExplainRequest): { headline: string; explanation: string } {
  const { result, buy, lease } = req;
  const verbosity = req.verbosity ?? "short";

  const headline = formatVerdict(result.verdict);

  const monthlyDelta = result.buyMonthlyAllIn - result.leaseMonthlyAllIn;
  const totalDelta = result.buyTotalCost - result.leaseTotalCost;

  const buyStress = formatStressLabel(result.buyStressScore);
  const leaseStress = formatStressLabel(result.leaseStressScore);

  const lines: string[] = [];

  // Always include a tight summary first.
  lines.push(`${headline}. ${formatConfidence(result.confidence)}.`);
  if (result.summary && result.summary.trim().length > 0) {
    lines.push(result.summary.trim());
  }

  // Core comparison (no recalculations beyond simple diffs of provided results)
  lines.push(
    `Monthly all-in: Buy ${formatCurrency(result.buyMonthlyAllIn)} vs Lease ${formatCurrency(result.leaseMonthlyAllIn)} (${monthlyDelta === 0 ? "no difference" : monthlyDelta > 0 ? `${formatCurrency(Math.abs(monthlyDelta))} more to buy` : `${formatCurrency(Math.abs(monthlyDelta))} more to lease`}).`
  );

  lines.push(
    `Total cost over your horizon: Buy ${formatCurrency(result.buyTotalCost)} vs Lease ${formatCurrency(result.leaseTotalCost)} (${totalDelta === 0 ? "no difference" : totalDelta > 0 ? `${formatCurrency(Math.abs(totalDelta))} more to buy` : `${formatCurrency(Math.abs(totalDelta))} more to lease`}).`
  );

  lines.push(`Stress check: Buy = ${buyStress}. Lease = ${leaseStress}.`);

  // Optional context, only if provided
  if (verbosity === "detailed") {
    if (buy?.ownershipMonths && Number.isFinite(buy.ownershipMonths)) {
      lines.push(`Ownership horizon used: ${formatMonths(buy.ownershipMonths)}.`);
    }
    if (lease?.termMonths && Number.isFinite(lease.termMonths)) {
      lines.push(`Lease term used: ${formatMonths(lease.termMonths)}.`);
    }
  }

  // Risk flags (cap to avoid walls of text)
  const flags = result.riskFlags.filter((f) => f.trim().length > 0);
  if (flags.length > 0) {
    const maxFlags = verbosity === "detailed" ? 6 : 3;
    const shown = flags.slice(0, maxFlags);
    lines.push(`Risk flags: ${shown.join(" ")}`);
  }

  // Simple user guidance
  if (verbosity === "detailed") {
    lines.push(
      "If you want to reduce risk, lower the monthly payment, increase the down payment, shorten the term, or choose a less expensive vehicle."
    );
  }

  return { headline, explanation: lines.join(" ") };
}

/**
 * POST /api/explain
 *
 * Input:
 *  {
 *    "result": DecisionResult,
 *    "verbosity": "short" | "detailed",
 *    "user"?: UserProfile,
 *    "buy"?: BuyScenario,
 *    "lease"?: LeaseScenario
 *  }
 *
 * Output:
 *  { headline: string, explanation: string }
 */
export async function POST(req: Request) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  if (!isPlainObject(body)) {
    return NextResponse.json({ error: "Payload must be a JSON object" }, { status: 400 });
  }

  const result = (body as Record<string, unknown>)["result"];
  const verbosity = (body as Record<string, unknown>)["verbosity"];

  if (!validateDecisionResult(result)) {
    return NextResponse.json(
      { error: "Missing or invalid 'result' object (DecisionResult required)" },
      { status: 422 }
    );
  }

  if (verbosity != null && verbosity !== "short" && verbosity !== "detailed") {
    return NextResponse.json(
      { error: "verbosity must be 'short' or 'detailed' if provided" },
      { status: 422 }
    );
  }

  const explainReq: ExplainRequest = {
    result,
    verbosity: (verbosity as "short" | "detailed" | undefined) ?? "short",
    user: (body as Record<string, unknown>)["user"] as UserProfile | undefined,
    buy: (body as Record<string, unknown>)["buy"] as BuyScenario | undefined,
    lease: (body as Record<string, unknown>)["lease"] as LeaseScenario | undefined
  };

  try {
    const payload = buildExplanation(explainReq);
    return NextResponse.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Explain generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
