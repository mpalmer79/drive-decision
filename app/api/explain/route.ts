import { NextResponse } from "next/server";
import type { BuyScenario, DecisionResult, LeaseScenario, UserProfile } from "../../../types";

import {
  formatConfidence,
  formatCurrency,
  formatMonths,
  formatStressLabel,
  formatVerdict
} from "../../../lib/formatters";

import type { ExplainVerbosity } from "../../../lib/ai/promptTemplates";
import { SYSTEM_PROMPT, buildUserPrompt } from "../../../lib/ai/promptTemplates";
import { buildExplainPayload } from "../../../lib/ai/explainPayload";
import {
  passesNumberAllowlist,
  validateExplainResponseShape,
  type AIExplainResponse
} from "../../../lib/ai/aiValidators";

type ExplainRequest = {
  result: DecisionResult;
  user?: UserProfile;
  buy?: BuyScenario;
  lease?: LeaseScenario;
  verbosity?: ExplainVerbosity;
  useAI?: boolean;
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

function buildDeterministicExplanation(args: {
  result: DecisionResult;
  buy?: BuyScenario;
  lease?: LeaseScenario;
  verbosity: ExplainVerbosity;
}): { headline: string; explanation: string } {
  const { result, buy, lease, verbosity } = args;

  const headline = formatVerdict(result.verdict);

  const monthlyDelta = result.buyMonthlyAllIn - result.leaseMonthlyAllIn;
  const totalDelta = result.buyTotalCost - result.leaseTotalCost;

  const buyStress = formatStressLabel(result.buyStressScore);
  const leaseStress = formatStressLabel(result.leaseStressScore);

  const lines: string[] = [];

  lines.push(`${headline}. ${formatConfidence(result.confidence)}.`);
  if (result.summary && result.summary.trim().length > 0) {
    lines.push(result.summary.trim());
  }

  lines.push(
    `Monthly all-in: Buy ${formatCurrency(result.buyMonthlyAllIn)} vs Lease ${formatCurrency(result.leaseMonthlyAllIn)} (${monthlyDelta === 0
      ? "no difference"
      : monthlyDelta > 0
        ? `${formatCurrency(Math.abs(monthlyDelta))} more to buy`
        : `${formatCurrency(Math.abs(monthlyDelta))} more to lease`
    }).`
  );

  lines.push(
    `Total cost over your horizon: Buy ${formatCurrency(result.buyTotalCost)} vs Lease ${formatCurrency(result.leaseTotalCost)} (${totalDelta === 0
      ? "no difference"
      : totalDelta > 0
        ? `${formatCurrency(Math.abs(totalDelta))} more to buy`
        : `${formatCurrency(Math.abs(totalDelta))} more to lease`
    }).`
  );

  lines.push(`Stress check: Buy = ${buyStress}. Lease = ${leaseStress}.`);

  if (verbosity === "detailed") {
    if (buy?.ownershipMonths && Number.isFinite(buy.ownershipMonths)) {
      lines.push(`Ownership horizon used: ${formatMonths(buy.ownershipMonths)}.`);
    }
    if (lease?.termMonths && Number.isFinite(lease.termMonths)) {
      lines.push(`Lease term used: ${formatMonths(lease.termMonths)}.`);
    }
  }

  const flags = result.riskFlags.filter((f) => f.trim().length > 0);
  if (flags.length > 0) {
    const maxFlags = verbosity === "detailed" ? 6 : 3;
    lines.push(`Risk flags: ${flags.slice(0, maxFlags).join(" ")}`);
  }

  return { headline, explanation: lines.join(" ") };
}

async function tryGenerateAIExplanation(args: {
  result: DecisionResult;
  buy?: BuyScenario;
  lease?: LeaseScenario;
  verbosity: ExplainVerbosity;
}): Promise<AIExplainResponse | null> {
  const payload = buildExplainPayload({
    result: args.result,
    buy: args.buy,
    lease: args.lease,
    riskTolerance: undefined
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const system = SYSTEM_PROMPT;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const user = buildUserPrompt({ verbosity: args.verbosity, payload });

  return null;
}

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

  const resultRaw = (body as Record<string, unknown>)["result"];
  const verbosityRaw = (body as Record<string, unknown>)["verbosity"];
  const useAIraw = (body as Record<string, unknown>)["useAI"];

  if (!validateDecisionResult(resultRaw)) {
    return NextResponse.json(
      { error: "Missing or invalid 'result' object (DecisionResult required)" },
      { status: 422 }
    );
  }

  const verbosity: ExplainVerbosity = verbosityRaw === "detailed" ? "detailed" : "short";
  const useAI = useAIraw === true;

  const buy = (body as Record<string, unknown>)["buy"] as BuyScenario | undefined;
  const lease = (body as Record<string, unknown>)["lease"] as LeaseScenario | undefined;

  const deterministic = buildDeterministicExplanation({
    result: resultRaw,
    buy,
    lease,
    verbosity
  });

  if (!useAI) {
    return NextResponse.json({ ...deterministic, source: "deterministic" });
  }

  try {
    const ai = await tryGenerateAIExplanation({
      result: resultRaw,
      buy,
      lease,
      verbosity
    });

    if (!ai) {
      return NextResponse.json({ ...deterministic, source: "deterministic" });
    }

    if (!validateExplainResponseShape(ai)) {
      return NextResponse.json({ ...deterministic, source: "deterministic" });
    }

    const payload = buildExplainPayload({
      result: resultRaw,
      buy,
      lease,
      riskTolerance: undefined
    });

    const allowCheck = passesNumberAllowlist({
      ai,
      result: resultRaw,
      context: payload.context
    });

    if (!allowCheck.ok) {
      return NextResponse.json({ ...deterministic, source: "deterministic" });
    }

    return NextResponse.json({
      headline: ai.headline,
      explanation: ai.explanation,
      source: "ai"
    });
  } catch {
    return NextResponse.json({ ...deterministic, source: "deterministic" });
  }
}
