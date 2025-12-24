export type RiskTolerance = "low" | "medium" | "high";

export type UserProfile = {
  monthlyNetIncome: number; // after tax
  monthlyFixedExpenses: number;
  currentSavings: number;
  creditScoreBand: "below_620" | "620_679" | "680_739" | "740_plus";
  riskTolerance: RiskTolerance;
};

export type BuyScenario = {
  vehiclePrice: number;
  downPayment: number;
  aprPercent: number;
  termMonths: number;
  estMonthlyInsurance: number;
  estMonthlyMaintenance: number;
  ownershipMonths: number; // how long you plan to keep it
};

export type LeaseScenario = {
  msrp: number;
  monthlyPayment: number;
  dueAtSigning: number;
  termMonths: number;
  mileageAllowancePerYear: number;
  estMilesPerYear: number;
  estExcessMileFee: number; // dollars per mile
  estMonthlyInsurance: number;
  estMonthlyMaintenance: number;
  leaseEndPlan: "return" | "buyout";
  estBuyoutPrice?: number; // required if leaseEndPlan === "buyout"
};

export type DecisionVerdict = "buy" | "lease";

export type DecisionResult = {
  verdict: DecisionVerdict;
  confidence: "low" | "medium" | "high";
  summary: string;

  // core numbers
  buyTotalCost: number;
  leaseTotalCost: number;
  buyMonthlyAllIn: number;
  leaseMonthlyAllIn: number;

  // risk scoring
  buyStressScore: number;  // 0-100 higher = worse
  leaseStressScore: number; // 0-100 higher = worse
  riskFlags: string[];
};

export function decideBuyVsLease(
  user: UserProfile,
  buy: BuyScenario,
  lease: LeaseScenario
): DecisionResult {
  // TODO: implement deterministic math, no AI here.
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

