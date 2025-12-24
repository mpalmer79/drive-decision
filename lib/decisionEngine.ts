import type {
  BuyScenario,
  DecisionResult,
  LeaseScenario,
  UserProfile
} from "@/types";

import { monthlyPaymentFromLoan, clamp } from "@/lib/math";
import { scoreMonthlyStress, simulateIncomeShock } from "@/lib/riskScoring";

function assertPositive(name: string, v: number): void {
  if (!Number.isFinite(v) || v <= 0) throw new Error(`${name} must be a finite number > 0`);
}

function assertNonNegative(name: string, v: number): void {
  if (!Number.isFinite(v) || v < 0) throw new Error(`${name} must be a finite number >= 0`);
}

function monthsToYears(months: number): number {
  return months / 12;
}

function uniqueStrings(items: string[]): string[] {
  return Array.from(new Set(items.map((s) => s.trim()).filter((s) => s.length > 0)));
}

/**
 * Deterministic buy vs lease decision engine.
 * AI must NEVER be used here. AI only explains the returned DecisionResult.
 */
export function decideBuyVsLease(
  user: UserProfile,
  buy: BuyScenario,
  lease: LeaseScenario
): DecisionResult {
  // ---- Basic validation (keep it strict; bad inputs must fail loudly) ----
  assertPositive("user.monthlyNetIncome", user.monthlyNetIncome);
  assertNonNegative("user.monthlyFixedExpenses", user.monthlyFixedExpenses);
  assertNonNegative("user.currentSavings", user.currentSavings);

  assertPositive("buy.vehiclePrice", buy.vehiclePrice);
  assertNonNegative("buy.downPayment", buy.downPayment);
  if (buy.downPayment > buy.vehiclePrice) {
    throw new Error("buy.downPayment must be <= buy.vehiclePrice");
  }
  assertNonNegative("buy.aprPercent", buy.aprPercent);
  assertPositive("buy.termMonths", buy.termMonths);
  assertNonNegative("buy.estMonthlyInsurance", buy.estMonthlyInsurance);
  assertNonNegative("buy.estMonthlyMaintenance", buy.estMonthlyMaintenance);
  assertPositive("buy.ownershipMonths", buy.ownershipMonths);

  assertPositive("lease.msrp", lease.msrp);
  assertNonNegative("lease.monthlyPayment", lease.monthlyPayment);
  assertNonNegative("lease.dueAtSigning", lease.dueAtSigning);
  assertPositive("lease.termMonths", lease.termMonths);
  assertPositive("lease.mileageAllowancePerYear", lease.mileageAllowancePerYear);
  assertPositive("lease.estMilesPerYear", lease.estMilesPerYear);
  assertNonNegative("lease.estExcessMileFee", lease.estExcessMileFee);
  assertNonNegative("lease.estMonthlyInsurance", lease.estMonthlyInsurance);
  assertNonNegative("lease.estMonthlyMaintenance", lease.estMonthlyMaintenance);

  if (lease.leaseEndPlan === "buyout") {
    if (lease.estBuyoutPrice == null) {
      throw new Error("lease.estBuyoutPrice is required when leaseEndPlan is 'buyout'");
    }
    assertPositive("lease.estBuyoutPrice", lease.estBuyoutPrice);
  }

  // ---- Horizon alignment ----
  // We compare both options over the same horizon so totals are comparable.
  // Use the user's intended ownership horizon as the comparison window.
  const horizonMonths = buy.ownershipMonths;

  // ---- BUY calculations ----
  const buyPrincipal = Math.max(0, buy.vehiclePrice - buy.downPayment);
  const buyMonthlyPayment = monthlyPaymentFromLoan(buyPrincipal, buy.aprPercent, buy.termMonths);

  const buyMonthlyAllIn =
    buyMonthlyPayment + buy.estMonthlyInsurance + buy.estMonthlyMaintenance;

  const buyTotalCost =
    buy.downPayment +
    buyMonthlyPayment * horizonMonths +
    (buy.estMonthlyInsurance + buy.estMonthlyMaintenance) * horizonMonths;

  // ---- LEASE calculations ----
  // Mileage penalty computed as a per-month excess miles based on annual estimates.
  const estMilesPerMonth = lease.estMilesPerYear / 12;
  const allowanceMilesPerMonth = lease.mileageAllowancePerYear / 12;
  const excessMilesPerMonth = Math.max(0, estMilesPerMonth - allowanceMilesPerMonth);
  const excessMilesTotal = excessMilesPerMonth * horizonMonths;
  const excessMileageCostTotal = excessMilesTotal * lease.estExcessMileFee;
  const excessMileageCostMonthly = excessMileageCostTotal / horizonMonths;

  // Amortize due-at-signing across the lease term, not the horizon.
  // This avoids under-penalizing short horizons.
  const dueAtSigningMonthly = lease.dueAtSigning / lease.termMonths;

  const leaseMonthlyAllIn =
    lease.monthlyPayment +
    dueAtSigningMonthly +
    lease.estMonthlyInsurance +
    lease.estMonthlyMaintenance +
    excessMileageCostMonthly;

  // Total lease cost over the horizon:
  // - One-time due at signing (not multiplied by horizon)
  // - Monthly payment across horizon
  // - Insurance + maintenance across horizon
  // - Mileage penalty across horizon
  // - Buyout price only if plan is buyout AND horizon reaches the lease term
  const leaseBuyoutCost =
    lease.leaseEndPlan === "buyout" && horizonMonths >= lease.termMonths
      ? (lease.estBuyoutPrice ?? 0)
      : 0;

  const leaseTotalCost =
    lease.dueAtSigning +
    lease.monthlyPayment * horizonMonths +
    (lease.estMonthlyInsurance + lease.estMonthlyMaintenance) * horizonMonths +
    excessMileageCostTotal +
    leaseBuyoutCost;

  // ---- Stress scoring (base) ----
  const buyStress = scoreMonthlyStress({
    monthlyNetIncome: user.monthlyNetIncome,
    monthlyFixedExpenses: user.monthlyFixedExpenses,
    monthlyCarAllIn: buyMonthlyAllIn,
    riskTolerance: user.riskTolerance
  });

  const leaseStress = scoreMonthlyStress({
    monthlyNetIncome: user.monthlyNetIncome,
    monthlyFixedExpenses: user.monthlyFixedExpenses,
    monthlyCarAllIn: leaseMonthlyAllIn,
    riskTolerance: user.riskTolerance
  });

  // ---- Downside simulation: 10% income drop ----
  const buyShock10 = simulateIncomeShock({
    monthlyNetIncome: user.monthlyNetIncome,
    monthlyFixedExpenses: user.monthlyFixedExpenses,
    monthlyCarAllIn: buyMonthlyAllIn,
    riskTolerance: user.riskTolerance,
    incomeDropPercent: 10
  });

  const leaseShock10 = simulateIncomeShock({
    monthlyNetIncome: user.monthlyNetIncome,
    monthlyFixedExpenses: user.monthlyFixedExpenses,
    monthlyCarAllIn: leaseMonthlyAllIn,
    riskTolerance: user.riskTolerance,
    incomeDropPercent: 10
  });

  // ---- Savings impact flags (down payment / due at signing) ----
  const buyRemainingSavings = user.currentSavings - buy.downPayment;
  const leaseRemainingSavings = user.currentSavings - lease.dueAtSigning;

  const monthsOfFixedExpenses = (savings: number) =>
    user.monthlyFixedExpenses > 0 ? savings / user.monthlyFixedExpenses : Infinity;

  const buySavingsMonths = monthsOfFixedExpenses(buyRemainingSavings);
  const leaseSavingsMonths = monthsOfFixedExpenses(leaseRemainingSavings);

  const savingsFlags: string[] = [];
  if (buyRemainingSavings < 0) savingsFlags.push("Buy down payment exceeds current savings.");
  if (leaseRemainingSavings < 0) savingsFlags.push("Lease due-at-signing exceeds current savings.");

  if (Number.isFinite(buySavingsMonths) && buySavingsMonths < 2) {
    savingsFlags.push("Buying leaves less than ~2 months of fixed-expense buffer in savings.");
  }
  if (Number.isFinite(leaseSavingsMonths) && leaseSavingsMonths < 2) {
    savingsFlags.push("Leasing leaves less than ~2 months of fixed-expense buffer in savings.");
  }

  // ---- Verdict logic ----
  const stressGap = buyStress.stressScore - leaseStress.stressScore; // positive => buy worse
  const absStressGap = Math.abs(stressGap);

  // Also consider fragility under shock
  const shockGap = buyShock10.stressScore - leaseShock10.stressScore;
  const absShockGap = Math.abs(shockGap);

  // Choose by stress if materially different, otherwise by total cost
  let verdict: "buy" | "lease";
  if (absStressGap >= 8) {
    verdict = stressGap < 0 ? "buy" : "lease";
  } else {
    verdict = buyTotalCost <= leaseTotalCost ? "buy" : "lease";
  }

  // Confidence logic
  // - high if large stress gap or one option becomes negative cash flow under shock
  // - medium if moderate stress gap
  // - low otherwise
  const buyNegCash = buyShock10.flags.some((f) => f.toLowerCase().includes("negative monthly cash flow"));
  const leaseNegCash = leaseShock10.flags.some((f) => f.toLowerCase().includes("negative monthly cash flow"));

  let confidence: "low" | "medium" | "high" = "low";

  if (absStressGap >= 15 || absShockGap >= 15 || (buyNegCash !== leaseNegCash)) {
    confidence = "high";
  } else if (absStressGap >= 8 || absShockGap >= 8) {
    confidence = "medium";
  }

  // ---- Summary ----
  const cheaper = buyTotalCost <= leaseTotalCost ? "buy" : "lease";
  const safer = verdict;

  const summaryParts: string[] = [];
  summaryParts.push(`${safer === "buy" ? "Buying" : "Leasing"} is safer based on cash-flow stress for your profile.`);

  if (absStressGap >= 8) {
    summaryParts.push(`Stress difference is ${Math.round(absStressGap)} points (0–100 scale).`);
  } else {
    summaryParts.push(`Stress is similar, so total cost breaks the tie (${cheaper} is cheaper over the chosen horizon).`);
  }

  // ---- Risk flags ----
  const riskFlags = uniqueStrings([
    ...buyStress.flags.map((f) => `Buy: ${f}`),
    ...leaseStress.flags.map((f) => `Lease: ${f}`),
    ...savingsFlags
  ]);

  // Add 10% shock flags if they materially differ
  if (absShockGap >= 8) {
    riskFlags.push(`10% income shock favors ${shockGap < 0 ? "buy" : "lease"} by ~${Math.round(absShockGap)} stress points.`);
  }

  // Mild guardrail: cap risk flags so the UI stays readable
  const cappedRiskFlags = riskFlags.slice(0, 12);

  return {
    verdict,
    confidence,
    summary: summaryParts.join(" "),

    buyTotalCost: clamp(buyTotalCost, 0, Number.MAX_SAFE_INTEGER),
    leaseTotalCost: clamp(leaseTotalCost, 0, Number.MAX_SAFE_INTEGER),

    buyMonthlyAllIn: clamp(buyMonthlyAllIn, 0, Number.MAX_SAFE_INTEGER),
    leaseMonthlyAllIn: clamp(leaseMonthlyAllIn, 0, Number.MAX_SAFE_INTEGER),

    buyStressScore: clamp(buyStress.stressScore, 0, 100),
    leaseStressScore: clamp(leaseStress.stressScore, 0, 100),

    riskFlags: cappedRiskFlags
  };
}
