import { NextResponse } from "next/server";
import type {
  BuyScenario,
  DecisionResult,
  LeaseScenario,
  UserProfile
} from "@/types";
import {
  formatCurrency,
  formatMonths,
  formatVerdict,
  formatConfidence,
  formatStressLabel
} from "@/lib/formatters";

type ExplainRequest = {
  result: DecisionResult;

  // Optional context to improve explanation quality (not required for MVP)
  user?: UserProfile;
  buy?: BuyScenario;
  lease?: LeaseScenario;

  // Optional: "short" for a tight explanation, "detailed"

