import type { ConfidenceLevel, DecisionVerdict } from "../types";

/**
 * Formats a number as USD currency (no cents).
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Formats a number as USD currency with cents.
 */
export function formatCurrencyWithCents(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Formats a ratio (0–1) as a percentage string.
 */
export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}

/**
 * Formats a stress score (0–100) into a readable label.
 */
export function formatStressLabel(score: number): string {
  if (score >= 70) return "High financial stress";
  if (score >= 40) return "Moderate financial stress";
  return "Low financial stress";
}

/**
 * Formats a confidence level into a user-facing phrase.
 */
export function formatConfidence(confidence: ConfidenceLevel): string {
  switch (confidence) {
    case "high":
      return "High confidence";
    case "medium":
      return "Moderate confidence";
    case "low":
    default:
      return "Low confidence";
  }
}

/**
 * Formats the verdict into a headline-safe string.
 */
export function formatVerdict(verdict: DecisionVerdict): string {
  return verdict === "buy" ? "Buying is the safer option" : "Leasing is the safer option";
}

/**
 * Formats months into a readable duration.
 */
export function formatMonths(months: number): string {
  if (months < 12) return `${months} months`;

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (remainingMonths === 0) return `${years} year${years > 1 ? "s" : ""}`;
  return `${years}y ${remainingMonths}m`;
}
