"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button, Card } from "@/components/ui";
import {
  IconCheck,
  IconPhone,
  IconMail,
  IconUser,
  IconCalendar,
  IconAlertTriangle,
  Spinner,
} from "@/components/icons";

interface LeadCaptureProps {
  verdict: "buy" | "lease";
  vehiclePrice: number;
  monthlyPayment: number;
}

type FormState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success" }
  | { status: "error"; message: string };

export function LeadCapture({ verdict, vehiclePrice, monthlyPayment }: LeadCaptureProps) {
  const [formState, setFormState] = useState<FormState>({ status: "idle" });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    contactMethod: "phone" as "phone" | "email" | "text",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState({ status: "submitting" });

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          verdict,
          vehiclePrice,
          monthlyPayment,
          submittedAt: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Submission failed");
      }

      setFormState({ status: "success" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      setFormState({ status: "error", message: msg });
    }
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isValid = formData.name.trim() && (formData.email.trim() || formData.phone.trim());

  if (formState.status === "success") {
    return (
      <Card className="mb-8">
        <div className="text-center py-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <IconCheck className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">We'll Be in Touch!</h3>
          <p className="text-slate-400 max-w-md mx-auto">
            A Quirk specialist will contact you within 1 business day to discuss your {verdict === "buy" ? "purchase" : "lease"} options.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
          <IconCalendar className="w-5 h-5 text-teal-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Ready to Move Forward?</h3>
          <p className="text-sm text-slate-400">Connect with a Quirk specialist</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Your Name
          </label>
          <div className="relative">
            <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="John Smith"
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-100 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
            />
          </div>
        </div>

        {/* Email & Phone Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Email
            </label>
            <div className="relative">
              <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="john@example.com"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-100 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Phone
            </label>
            <div className="relative">
              <IconPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="(555) 123-4567"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-100 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Contact Preference */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Preferred Contact Method
          </label>
          <div className="flex gap-3">
            {[
              { value: "phone", label: "Phone Call" },
              { value: "email", label: "Email" },
              { value: "text", label: "Text Message" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => updateField("contactMethod", option.value)}
                className={cn(
                  "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all",
                  formData.contactMethod === option.value
                    ? "bg-teal-500/20 text-teal-400 ring-2 ring-teal-500"
                    : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Anything else we should know? <span className="text-slate-500">(optional)</span>
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            placeholder="I'm interested in the 2024 Equinox..."
            rows={3}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all resize-none"
          />
        </div>

        {/* Error Message */}
        {formState.status === "error" && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <IconAlertTriangle className="w-4 h-4" />
            {formState.message}
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={!isValid || formState.status === "submitting"}
        >
          {formState.status === "submitting" ? (
            <>
              <Spinner className="w-4 h-4" />
              Submitting...
            </>
          ) : (
            <>
              Connect with Quirk
            </>
          )}
        </Button>

        <p className="text-xs text-slate-500 text-center">
          By submitting, you agree to be contacted by Quirk Auto Dealers. No spam, ever.
        </p>
      </form>
    </Card>
  );
}
