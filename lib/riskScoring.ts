
import type { RiskTolerance } from "@/types";
import { clamp } from "@/lib/math";

export type StressBreakdown = {
  // Core ratios
  carToIncomeRatio: number; // monthly all-in / monthly net income (0..1+)
  postCarBuffer: number;    // leftover cash after fixed expenses + car all-in

  // Score + interpretation
  stressScore: number;      // 0..100 higher = worse
  stressLevel: "low" | "medium" | "high";

  // Human-readable flags (UI + AI explanation can use these)
  flags: string[];
};

type Thresholds = {
  // Ratio thresholds for monthly all-in cost relative to net income.
  // Lower is better. Exceeding high is a red flag.
  ratioLowMax: number;
  ratioMedMax: number;
  ratioHighMax: number;

  // Minimum recommended cash buffer after paying fixed expenses + car all-in.
  // Higher is better. Falling below 0 is a hard red flag.
  bufferLowMin: number;
  bufferMedMin: number;
  bufferHighMin: number;
};

function thresholdsForRiskTolerance(risk: RiskTolerance): Thresholds {
  // These are intentionally conservative and easy to reason about.
  // They can be tuned after you have real user data.
  switch (risk) {
    case "low":
      return {
        ratioLowMax: 0.10,
        ratioMedMax: 0.15,
        ratioHighMax: 0.20,
        bufferLowMin: 1200,
        bufferMedMin: 600,
        bufferHighMin: 0
      };
    case "high":
      return {
        ratioLowMax: 0.15,
        ratioMedMax: 0.20,
        ratioHighMax: 0.25,
        bufferLowMin: 800,
        bufferMedMin: 300,
        bufferHighMin: 0
      };
    case "medium":
    default:
      return {
        ratioLowMax: 0.12,
        ratioMedMax: 0.18,
        ratioHighMax: 0.23,
        bufferLowMin: 1000,
        bufferMedMin: 450,
        bufferHighMin: 0
      };
  }
}

function scoreFromRatio(ratio: number, t: Thresholds): { score: number; flags: string[] } {
  const flags: string[] = [];
  let score = 0;

  if (ratio <= t.ratioLowMax) {
    score = 15;
  } else if (ratio <= t.ratioMedMax) {
    score = 40;
    flags.push("Car cost is a meaningful portion of monthly income.");
  } else if (ratio <= t.ratioHighMax) {
    score = 65;
    flags.push("Car cost is high relative to monthly income.");
  } else {
    score = 85;
    flags.push("Car cost is very high relative to monthly income.");
  }

  // Add a continuous penalty as the ratio climbs beyond "high"
  if (ratio > t.ratioHighMax) {
    const over = ratio - t.ratioHighMax;
    score += clamp(over / 0.10, 0, 1) * 15; // up to +15 if 10% over
  }

  return { score: clamp(score, 0, 100), flags };
}

function scoreFromBuffer(buffer: number, t: Thresholds): { score: number; flags: string[] } {
  const flags: string[] = [];
  let score = 0;

  if (buffer >= t.bufferLowMin) {
    score = 15;
  } else if (buffer >= t.bufferMedMin) {
    score = 40;
    flags.push("Monthly cash buffer is getting tight.");
  } else if (buffer >= t.bufferHighMin) {
    score = 70;
    flags.push("Very little monthly cash buffer remains after car costs.");
  } else {
    score = 95;
    flags.push("Negative monthly cash flow after car costs.");
  }

  // Add continuous penalty as buffer drops below zero
  if (buffer < 0) {
    const deficit = Math.abs(buffer);
    score += clamp(deficit / 500, 0, 1) * 5; // up to +5 for $500 deficit
  }

  return { score: clamp(score, 0, 100), flags };
}

function levelFromScore(score: number): "low" | "medium" | "high" {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

/**
 * Computes a 0–100 stress score (higher = worse) for a given monthly all-in car cost.
 * This is deterministic scoring only. No AI. No pricing logic.
 */
export function scoreMonthlyStress(args: {
  monthlyNetIncome: number;
  monthlyFixedExpenses: number;
  monthlyCarAllIn: number;
  riskTolerance: RiskTolerance;
}): StressBreakdown {
  const { monthlyNetIncome, monthlyFixedExpenses, monthlyCarAllIn, riskTolerance } = args;

  if (monthlyNetIncome <= 0) throw new Error("monthlyNetIncome must be > 0");
  if (monthlyFixedExpenses < 0) throw new Error("monthlyFixedExpenses must be >= 0");
  if (monthlyCarAllIn < 0) throw new Error("monthlyCarAllIn must be >= 0");

  const t = thresholdsForRiskTolerance(riskTolerance);

  const carToIncomeRatio = monthlyCarAllIn / monthlyNetIncome;
  const postCarBuffer = monthlyNetIncome - monthlyFixedExpenses - monthlyCarAllIn;

  const ratioPart = scoreFromRatio(carToIncomeRatio, t);
  const bufferPart = scoreFromBuffer(postCarBuffer, t);

  // Weight buffer slightly higher because cash-flow failure is what actually breaks people.
  const stressScore = clamp(ratioPart.score * 0.45 + bufferPart.score * 0.55, 0, 100);

  const flags = Array.from(new Set([...ratioPart.flags, ...bufferPart.flags]));

  // Add extra flags for extreme cases
  if (carToIncomeRatio >= 0.25) flags.push("Car costs exceed 25% of take-home pay.");
  if (postCarBuffer < 0) flags.push("This scenario creates negative monthly cash flow.");

  return {
    carToIncomeRatio,
    postCarBuffer,
    stressScore,
    stressLevel: levelFromScore(stressScore),
    flags
  };
}

/**
 * Simple downside simulation: apply an income drop and recompute stress.
 * This helps quantify fragility without pretending to predict the future.
 */
export function simulateIncomeShock(args: {
  monthlyNetIncome: number;
  monthlyFixedExpenses: number;
  monthlyCarAllIn: number;
  riskTolerance: RiskTolerance;
  incomeDropPercent: number; // e.g., 10 or 20
}): StressBreakdown {
  const { incomeDropPercent, ...rest } = args;

  if (incomeDropPercent < 0 || incomeDropPercent > 80) {
    throw new Error("incomeDropPercent must be between 0 and 80");
  }

  const shockedIncome = rest.monthlyNetIncome * (1 - incomeDropPercent / 100);

  return scoreMonthlyStress({
    monthlyNetIncome: shockedIncome,
    monthlyFixedExpenses: rest.monthlyFixedExpenses,
    monthlyCarAllIn: rest.monthlyCarAllIn,
    riskTolerance: rest.riskTolerance
  });
}
