// app/api/lead/route.ts
// Lead submission API with VIN Solutions CRM integration

import { NextResponse } from "next/server";
import { vinSolutions } from "@/lib/vinSolutions";

type LeadPayload = {
  name: string;
  email: string;
  phone: string;
  contactMethod: "phone" | "email" | "text";
  notes: string;
  verdict: "buy" | "lease";
  vehiclePrice: number;
  monthlyPayment: number;
  downPayment?: number;
  financeTerm?: number;
  submittedAt: string;
  // Optional vehicle info
  vehicleYear?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleVin?: string;
  // Optional dealer routing
  dealerId?: string;
};

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // requests
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 60 * 1000);

export async function POST(req: Request) {
  // Get client IP for rate limiting
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0] ?? req.headers.get("x-real-ip") ?? "unknown";

  // Check rate limit
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  let payload: LeadPayload;

  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const { name, email, phone } = payload;

  // Validation
  if (!name?.trim()) {
    return NextResponse.json(
      { error: "Name is required" },
      { status: 422 }
    );
  }

  if (!email?.trim() && !phone?.trim()) {
    return NextResponse.json(
      { error: "At least one contact method (email or phone) is required" },
      { status: 422 }
    );
  }

  // Email validation
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Invalid email format" },
      { status: 422 }
    );
  }

  // Phone validation (basic - at least 10 digits)
  if (phone && phone.replace(/\D/g, "").length < 10) {
    return NextResponse.json(
      { error: "Phone number must have at least 10 digits" },
      { status: 422 }
    );
  }

  // Vehicle price validation
  if (!payload.vehiclePrice || payload.vehiclePrice <= 0) {
    return NextResponse.json(
      { error: "Invalid vehicle price" },
      { status: 422 }
    );
  }

  try {
    // Submit lead to VIN Solutions
    const result = await vinSolutions.submitLead({
      name: name.trim(),
      email: email?.trim() || "",
      phone: phone?.trim() || "",
      contactMethod: payload.contactMethod,
      notes: payload.notes?.trim() || "",
      verdict: payload.verdict,
      vehiclePrice: payload.vehiclePrice,
      monthlyPayment: payload.monthlyPayment,
      downPayment: payload.downPayment,
      financeTerm: payload.financeTerm,
      dealerId: payload.dealerId,
      vehicleYear: payload.vehicleYear,
      vehicleMake: payload.vehicleMake,
      vehicleModel: payload.vehicleModel,
      vehicleVin: payload.vehicleVin,
      submittedAt: payload.submittedAt || new Date().toISOString(),
    });

    if (!result.success && result.errors.length > 0) {
      console.error("Lead submission errors:", result.errors);
      
      // Still return success if at least notification was sent
      // This ensures the user experience is not degraded even if CRM is down
      if (result.notificationSent) {
        return NextResponse.json({
          success: true,
          leadId: result.leadId,
          message: "Lead received - our team will contact you shortly",
          partial: true,
        });
      }

      return NextResponse.json(
        { error: "Failed to submit lead. Please try again or call us directly." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      leadId: result.leadId,
      message: "Lead received successfully",
      crmSubmitted: result.crmSubmitted,
      notificationSent: result.notificationSent,
    });

  } catch (error) {
    console.error("Lead submission error:", error);

    // Log the lead data for manual recovery
    console.log("=== FAILED LEAD (Manual Recovery Required) ===");
    console.log(JSON.stringify(payload, null, 2));
    console.log("==============================================");

    return NextResponse.json(
      { error: "An error occurred. Please try again or call us directly." },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "DriveDecision Lead API",
    timestamp: new Date().toISOString(),
    features: {
      crmIntegration: process.env.ENABLE_CRM_SUBMISSION === "true",
      notifications: process.env.ENABLE_NOTIFICATIONS !== "false",
    },
  });
}
