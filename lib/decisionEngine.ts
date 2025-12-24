import type {
  BuyScenario,
  DecisionResult,
  LeaseScenario,
  UserProfile
} from "../types";

export function decideBuyVsLease(
  user: UserProfile,
  buy: BuyScenario,
  lease: LeaseScenario
): DecisionResult {
  // Guardrails that prevent obviously invalid inputs from silently producing nonsense.
  // Keep these lightweight. Deeper validation can be added later.
  if (user.monthlyNetIncome <= 0) {
    throw new Error("monthlyNetIncome must be > 0");
  }

  if (buy.termMonths <= 0 || lease.termMonths <= 0) {
    throw new Error("termMonths must be > 0");
  }

  if (lease.leaseEndPlan === "buyout" && (lease.estBuyoutPrice == null || lease.estBuyoutPrice <= 0)) {
    throw new Error("estBuyoutPrice is required and must be > 0 when leaseEndPlan is 'buyout'");
  }

  // TODO: implement deterministic math (total cost, stress scoring, downside risk) here.
  // IMPORTANT: keep AI out of this function. AI only explains results, it never calculates them.

  return {
    verdict: "lease",
    confidence: "low",
    summary: "Placeholder result. Decision engine not implemented yet.",

    buyTotalCost: 0,
    leaseTotalCost: 0,

    buyMonthlyAllIn: 0,
    leaseMonthlyAllIn: 0,

    buyStressScore: 0,
    leaseStressScore: 0,

    riskFlags: ["Decision engine not implemented"]
  };
}
