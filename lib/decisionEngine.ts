// lib/decisionEngine.ts

import type {
  UserProfile,
  VehiclePreferences,
  FinanceCalculation,
  BudgetAnalysis,
  DecisionFactors,
  Recommendation,
  DecisionResult,
  CreditTier,
} from "@/types";

// APR rates by credit tier
const APR_BY_CREDIT_TIER: Record<CreditTier, number> = {
  excellent: 6.5,   // 750+ credit score
  good: 7.5,        // 700-749 credit score
  fair: 8.5,        // 650-699 credit score
  rebuilding: 14.5, // <650 credit score
};

const DEFAULT_INSURANCE = 180;
const DEFAULT_MAINTENANCE = 75;

export function getAprForCreditTier(creditTier: CreditTier): number {
  return APR_BY_CREDIT_TIER[creditTier];
}

export function calculateFinancing(
  vehiclePrice: number,
  downPayment: number,
  termMonths: number,
  creditTier: CreditTier = "good"
): FinanceCalculation {
  const apr = APR_BY_CREDIT_TIER[creditTier];
  const loanAmount = vehiclePrice - downPayment;
  const monthlyRate = apr / 100 / 12;
  
  let monthlyPayment: number;
  if (apr === 0) {
    monthlyPayment = loanAmount / termMonths;
  } else {
    monthlyPayment =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
      (Math.pow(1 + monthlyRate, termMonths) - 1);
  }

  const totalPaid = monthlyPayment * termMonths;
  const totalInterest = totalPaid - loanAmount;
  const totalCost = totalPaid + downPayment;
  const monthlyAllIn = monthlyPayment + DEFAULT_INSURANCE + DEFAULT_MAINTENANCE;

  // Calculate payoff date
  const payoffDate = new Date();
  payoffDate.setMonth(payoffDate.getMonth() + termMonths);

  return {
    loanAmount: Math.round(loanAmount),
    monthlyPayment: Math.round(monthlyPayment),
    totalInterest: Math.round(totalInterest),
    totalCost: Math.round(totalCost),
    monthlyAllIn: Math.round(monthlyAllIn),
    payoffDate: payoffDate.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    aprUsed: apr,
    creditTier,
  };
}

export function analyzeBudget(
  profile: UserProfile,
  monthlyAllIn: number
): BudgetAnalysis {
  const discretionaryIncome = profile.monthlyIncome - profile.monthlyExpenses;
  const paymentAsPercentOfIncome = (monthlyAllIn / profile.monthlyIncome) * 100;
  const remainingAfterPayment = discretionaryIncome - monthlyAllIn;
  const monthsOfSavingsBuffer = profile.currentSavings / monthlyAllIn;

  // Calculate stress score (0-100, lower is better)
  let stressScore = 0;

  // Payment as % of income (ideal: < 15%)
  if (paymentAsPercentOfIncome > 25) stressScore += 35;
  else if (paymentAsPercentOfIncome > 20) stressScore += 25;
  else if (paymentAsPercentOfIncome > 15) stressScore += 15;
  else stressScore += 5;

  // Remaining discretionary after payment
  if (remainingAfterPayment < 200) stressScore += 35;
  else if (remainingAfterPayment < 500) stressScore += 25;
  else if (remainingAfterPayment < 800) stressScore += 15;
  else stressScore += 5;

  // Savings buffer
  if (monthsOfSavingsBuffer < 3) stressScore += 30;
  else if (monthsOfSavingsBuffer < 6) stressScore += 20;
  else if (monthsOfSavingsBuffer < 12) stressScore += 10;
  else stressScore += 0;

  // Determine affordability rating
  let affordabilityRating: BudgetAnalysis["affordabilityRating"];
  if (stressScore <= 30) affordabilityRating = "comfortable";
  else if (stressScore <= 50) affordabilityRating = "manageable";
  else if (stressScore <= 70) affordabilityRating = "stretched";
  else affordabilityRating = "risky";

  return {
    discretionaryIncome: Math.round(discretionaryIncome),
    paymentAsPercentOfIncome: Math.round(paymentAsPercentOfIncome * 10) / 10,
    monthsOfSavingsBuffer: Math.round(monthsOfSavingsBuffer * 10) / 10,
    stressScore: Math.min(100, stressScore),
    affordabilityRating,
  };
}

export function analyzeFactors(
  preferences: VehiclePreferences,
  budgetAnalysis: BudgetAnalysis
): DecisionFactors {
  // Mileage analysis
  let mileageFit: DecisionFactors["mileageFit"] = "neutral";
  if (preferences.annualMiles > 15000) {
    mileageFit = "buy"; // High mileage = buy to avoid lease penalties
  } else if (preferences.annualMiles < 10000) {
    mileageFit = "lease"; // Low mileage = lease works well
  }

  // Ownership style analysis
  let ownershipFit: DecisionFactors["ownershipFit"] = "neutral";
  if (preferences.ownershipStyle === "long-term") {
    ownershipFit = "buy";
  } else if (preferences.ownershipStyle === "new-often") {
    ownershipFit = "lease";
  }

  // Budget analysis
  let budgetFit: DecisionFactors["budgetFit"] = "neutral";
  if (budgetAnalysis.affordabilityRating === "comfortable") {
    budgetFit = "buy"; // Can afford to buy
  } else if (budgetAnalysis.affordabilityRating === "stretched" || budgetAnalysis.affordabilityRating === "risky") {
    budgetFit = "lease"; // Lease might offer lower monthly
  }

  // Priorities analysis
  let prioritiesFit: DecisionFactors["prioritiesFit"] = "neutral";
  const buyPriorities = ["ownership", "customize"];
  const leasePriorities = ["lowest-payment", "flexibility", "newest-tech"];
  
  const buyScore = preferences.priorities.filter(p => buyPriorities.includes(p)).length;
  const leaseScore = preferences.priorities.filter(p => leasePriorities.includes(p)).length;
  
  if (buyScore > leaseScore) prioritiesFit = "buy";
  else if (leaseScore > buyScore) prioritiesFit = "lease";

  // Flexibility analysis (undecided users might benefit from lease flexibility)
  let flexibilityFit: DecisionFactors["flexibilityFit"] = "neutral";
  if (preferences.ownershipStyle === "undecided") {
    flexibilityFit = "lease";
  }

  return {
    mileageFit,
    ownershipFit,
    budgetFit,
    prioritiesFit,
    flexibilityFit,
  };
}

export function generateRecommendation(
  factors: DecisionFactors,
  budgetAnalysis: BudgetAnalysis,
  preferences: VehiclePreferences
): Recommendation {
  // Count factors
  const factorValues = Object.values(factors);
  const buyCount = factorValues.filter(f => f === "buy").length;
  const leaseCount = factorValues.filter(f => f === "lease").length;

  // Strong buy indicators
  const strongBuyIndicators = [
    preferences.annualMiles > 15000,
    preferences.ownershipStyle === "long-term",
    preferences.priorities.includes("ownership"),
    preferences.priorities.includes("customize"),
  ].filter(Boolean).length;

  // Strong lease-explore indicators
  const strongLeaseIndicators = [
    preferences.ownershipStyle === "new-often",
    preferences.priorities.includes("lowest-payment"),
    preferences.priorities.includes("newest-tech"),
    budgetAnalysis.affordabilityRating === "stretched" || budgetAnalysis.affordabilityRating === "risky",
  ].filter(Boolean).length;

  // Determine verdict
  let verdict: Recommendation["verdict"];
  let confidence: Recommendation["confidence"];

  if (buyCount > leaseCount + 1 || strongBuyIndicators >= 2) {
    verdict = "buy";
    confidence = strongBuyIndicators >= 3 ? "high" : buyCount > leaseCount + 2 ? "high" : "medium";
  } else if (leaseCount > buyCount + 1 || strongLeaseIndicators >= 2) {
    verdict = "explore-lease";
    confidence = strongLeaseIndicators >= 3 ? "high" : leaseCount > buyCount + 2 ? "high" : "medium";
  } else {
    // Close call - default based on most impactful factors
    if (preferences.annualMiles > 12000 || preferences.ownershipStyle === "long-term") {
      verdict = "buy";
      confidence = "low";
    } else {
      verdict = "explore-lease";
      confidence = "low";
    }
  }

  // Generate reasons
  const primaryReasons: string[] = [];
  const considerations: string[] = [];

  if (verdict === "buy") {
    if (preferences.annualMiles > 15000) {
      primaryReasons.push("Your high mileage would result in significant lease-end penalties");
    }
    if (preferences.ownershipStyle === "long-term") {
      primaryReasons.push("You prefer to keep vehicles long-term, building equity makes sense");
    }
    if (preferences.priorities.includes("ownership")) {
      primaryReasons.push("Owning your vehicle outright aligns with your priorities");
    }
    if (preferences.priorities.includes("customize")) {
      primaryReasons.push("Buying allows you to customize and modify freely");
    }
    if (budgetAnalysis.affordabilityRating === "comfortable") {
      primaryReasons.push("The finance payment fits comfortably in your budget");
    }

    // Considerations for buy
    considerations.push("You'll be responsible for maintenance after warranty expires");
    considerations.push("Vehicle depreciation affects your equity");
    if (preferences.annualMiles > 12000) {
      considerations.push("Consider GAP insurance to protect against depreciation");
    }
  } else {
    if (preferences.ownershipStyle === "new-often") {
      primaryReasons.push("You enjoy driving the latest vehicles every few years");
    }
    if (preferences.priorities.includes("lowest-payment")) {
      primaryReasons.push("Leasing typically offers lower monthly payments");
    }
    if (preferences.priorities.includes("newest-tech")) {
      primaryReasons.push("Leasing lets you upgrade to the latest technology regularly");
    }
    if (budgetAnalysis.affordabilityRating === "stretched" || budgetAnalysis.affordabilityRating === "risky") {
      primaryReasons.push("A lease payment may better fit your current budget");
    }
    if (preferences.ownershipStyle === "undecided") {
      primaryReasons.push("Leasing offers flexibility while you decide your long-term needs");
    }

    // Considerations for lease-explore
    considerations.push("Lease payments depend on vehicle model, term, and current incentives");
    considerations.push("Mileage limits typically range from 10,000-15,000 per year");
    considerations.push("Excess wear and mileage fees may apply at lease end");
  }

  // Add fallback reasons if empty
  if (primaryReasons.length === 0) {
    primaryReasons.push(
      verdict === "buy"
        ? "Based on your overall profile, financing offers the best long-term value"
        : "Based on your preferences, leasing may offer benefits worth exploring"
    );
  }

  return {
    verdict,
    confidence,
    primaryReasons: primaryReasons.slice(0, 4),
    considerations: considerations.slice(0, 3),
    factors,
  };
}

export function generateDecision(
  profile: UserProfile,
  preferences: VehiclePreferences
): DecisionResult {
  const termMonths = preferences.financeTerm === "explore" ? 72 : preferences.financeTerm;
  
  const financeCalculation = calculateFinancing(
    preferences.vehiclePrice,
    preferences.downPayment,
    termMonths,
    preferences.creditTier
  );

  const budgetAnalysis = analyzeBudget(profile, financeCalculation.monthlyAllIn);
  const factors = analyzeFactors(preferences, budgetAnalysis);
  const recommendation = generateRecommendation(factors, budgetAnalysis, preferences);

  return {
    recommendation,
    financeCalculation,
    budgetAnalysis,
    profile,
    preferences,
  };
}
