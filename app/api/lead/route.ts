import { NextResponse } from "next/server";

type LeadPayload = {
  name: string;
  email: string;
  phone: string;
  contactMethod: "phone" | "email" | "text";
  notes: string;
  verdict: "buy" | "lease";
  vehiclePrice: number;
  monthlyPayment: number;
  submittedAt: string;
};

export async function POST(req: Request) {
  let payload: LeadPayload;

  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const { name, email, phone } = payload;

  // Validation
  if (!name || (!email && !phone)) {
    return NextResponse.json(
      { error: "Name and at least one contact method (email or phone) required" },
      { status: 422 }
    );
  }

  // Log the lead (replace with your CRM/email integration)
  console.log("=== NEW LEAD ===");
  console.log(JSON.stringify(payload, null, 2));
  console.log("================");

  // TODO: Integrate with your systems:
  // - Send to CRM (VIN Solutions, etc.)
  // - Send email notification to sales team
  // - Store in database
  // - Send confirmation email to customer

  // For now, just return success
  return NextResponse.json({
    success: true,
    message: "Lead received",
  });
}
