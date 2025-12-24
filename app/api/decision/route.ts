import { NextResponse } from "next/server";
import type {
  UserProfile,
  BuyScenario,
  LeaseScenario
} from "@/types";

import { decideBuyVsLease } from "@/lib/decisionEngine";

/**
 * POST /api/decision
 *
 * Accepts a user profile and buy/lease scenarios.
 * Returns a deterministic decision result.
 */
export async function POST(req: Request) {
  let payload: {
    user: UserProfile;
    buy: BuyScenario;
    lease: LeaseScenario;
  };

  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  const { user, buy, lease } = payload ?? {};

  if (!user || !buy || !lease) {
    return NextResponse.json(
      { error: "Missing user, buy, or lease data" },
      { status: 400 }
    );
  }

  try {
    const result = decideBuyVsLease(user, buy, lease);
    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Decision evaluation failed";

    return NextResponse.json(
      { error: message },
      { status: 422 }
    );
  }
}
