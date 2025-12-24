import type { BuyScenario, DecisionResult, LeaseScenario, RiskTolerance } from "@/types";
import type { ExplainPayload } from "@/lib/ai/promptTemplates";

export function buildExplainPayload(args: {
  result: DecisionResult;
  buy?: BuyScenario;
  lease?: LeaseScenario;
  riskTolerance?: RiskTolerance;
}): ExplainPayload {
  const { result, buy, lease, riskTolerance } = args;

  return {
    ...result,
    context: {
      ownershipMonths: buy?.ownershipMonths,
      leaseTermMonths: lease?.termMonths,
      riskTolerance,
      mileageAllowancePerYear: lease?.mileageAllowancePerYear,
      estMilesPerYear: lease?.estMilesPerYear
    }
  };
}

