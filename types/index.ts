// types/index.ts

// ============================================
// USER PROFILE
// ============================================
export interface UserProfile {
  monthlyIncome: number;
  monthlyExpenses: number;
  currentSavings: number;
  savingsGoalMonths: number;
}

// ============================================
// VEHICLE PREFERENCES
// ============================================
export interface VehiclePreferences {
  vehiclePrice: number;
  downPayment: number;
  annualMiles: number;
  ownershipStyle: "new-often" | "long-term" | "undecided";
  priorities: ("lowest-payment" | "ownership" | "flexibility" | "newest-tech" | "customize")[];
  financeTerm: 60 | 72 | 84 | "explore";
}

// ============================================
// FINANCE CALCULATION
// ============================================
export interface FinanceCalculation {
  loanAmount: number;
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  monthlyAllIn: number;
  payoffDate: string;
}

// ============================================
// BUDGET ANALYSIS
// ============================================
export interface BudgetAnalysis {
  discretionaryIncome: number;
  paymentAsPercentOfIncome: number;
  monthsOfSavingsBuffer: number;
  stressScore: number;
  affordabilityRating: "comfortable" | "manageable" | "stretched" | "risky";
}

// ============================================
// DECISION FACTORS
// ============================================
export interface DecisionFactors {
  mileageFit: "buy" | "lease" | "neutral";
  ownershipFit: "buy" | "lease" | "neutral";
  budgetFit: "buy" | "lease" | "neutral";
  prioritiesFit: "buy" | "lease" | "neutral";
  flexibilityFit: "buy" | "lease" | "neutral";
}

// ============================================
// RECOMMENDATION
// ============================================
export interface Recommendation {
  verdict: "buy" | "explore-lease";
  confidence: "high" | "medium" | "low";
  primaryReasons: string[];
  considerations: string[];
  factors: DecisionFactors;
}

// ============================================
// DECISION RESULT (Main output)
// ============================================
export interface DecisionResult {
  recommendation: Recommendation;
  financeCalculation: FinanceCalculation;
  budgetAnalysis: BudgetAnalysis;
  profile: UserProfile;
  preferences: VehiclePreferences;
}

// ============================================
// LEGACY TYPES (for backward compatibility)
// ============================================
export interface BuyScenario {
  vehiclePrice: number;
  downPayment: number;
  aprPercent: number;
  termMonths: number;
  ownershipMonths: number;
  estMonthlyInsurance: number;
  estMonthlyMaintenance: number;
}

export interface LeaseScenario {
  msrp: number;
  monthlyPayment: number;
  dueAtSigning: number;
  termMonths: number;
  mileageAllowancePerYear: number;
  estMilesPerYear: number;
  estExcessMileFee: number;
  estMonthlyInsurance: number;
  estMonthlyMaintenance: number;
  leaseEndPlan: "return" | "buyout" | "undecided";
}
