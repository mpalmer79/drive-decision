import { NextResponse } from "next/server";
import { decideBuyVsLease, type BuyScenario, type LeaseScenario, type UserProfile } from "@/lib/decisionEngine";

export async function POST(req: Request) {
  const body = await req.json();

  const user = body.user as UserProfile;
  const buy = body.buy as BuyScenario;
  const lease = body.lease as LeaseScenario;

  // Basic shape checks (we’ll harden this later)
  if (!user || !buy || !lease) {
    return NextResponse.json({ error: "Missing user, buy, or lease payload" }, { status: 400 });
  }

  const result = decideBuyVsLease(user, buy, lease);
  return NextResponse.json(result);
}
