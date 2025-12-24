import type { CreditScoreBand, RiskTolerance, Money } from "./finance";

export type UserProfile = {
  monthlyNetIncome: Money;
  monthlyFixedExpenses: Money;
  currentSavings: Money;
  creditScoreBand: CreditScoreBand;
  riskTolerance: RiskTolerance;
};

export type BuyScenario = {
  vehiclePrice: Money;
  downPayment: Money;
  aprPercent: number;
  termMonths: number;
  estMonthlyInsurance: Money;
  estMonthlyMaintenance: Money;
  ownershipMonths: number;
};

export type LeaseScenario = {
  msrp: Money;
  monthlyPayment: Money;
  dueAtSigning: Money;
  termMonths: number;
  mileageAllowancePerYear: number;
  estMilesPerYear: number;
  estExcessMileFee: Money;
  estMonthlyInsurance: Money;
  estMonthlyMaintenance: Money;
  leaseEndPlan: "return" | "buyout";
  estBuyoutPrice?: Money;
};

export type DecisionVerdict = "buy" | "lease";

export type ConfidenceLevel = "low" | "medium" | "high";

export type DecisionResult = {
  verdict: DecisionVerdict;
  confidence: ConfidenceLevel;
  summary: string;

  buyTotalCost: Money;
  leaseTotalCost: Money;

  buyMonthlyAllIn: Money;
  leaseMonthlyAllIn: Money;

  buyStressScore: number;    // 0–100
  leaseStressScore: number;  // 0–100

  riskFlags: string[];
};

