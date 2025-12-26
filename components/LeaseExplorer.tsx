"use client";

import { useState } from "react";
import { cn, formatNumber } from "@/lib/utils";
import { Card, Button, Input } from "@/components/ui";
import {
  IconCheck,
  IconAlertTriangle,
  IconSparkles,
  IconCar,
  IconShield,
  IconCalendar,
  IconDollar,
  IconArrowRight,
} from "@/components/icons";

interface LeaseExplorerProps {
  vehiclePrice: number;
  annualMiles: number;
  onLeadCapture: (data: LeadData) => void;
}

interface LeadData {
  name: string;
  email: string;
  phone: string;
  preferredContact: "email" | "phone" | "text";
  notes: string;
}

export function LeaseExplorer({ vehiclePrice, annualMiles, onLeadCapture }: LeaseExplorerProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<LeadData>({
    name: "",
    email: "",
    phone: "",
    preferredContact: "email",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (formData.name && (formData.email || formData.phone)) {
      onLeadCapture(formData);
      setSubmitted(true);
    }
  };

  const benefits = [
    {
      icon: IconDollar,
      title: "Lower Monthly Payments",
      description: "Lease payments are typically lower than finance payments for the same vehicle.",
      color: "emerald",
    },
    {
      icon: IconShield,
      title: "Warranty Coverage",
      description: "Most repairs are covered under factory warranty for the entire lease term.",
      color: "cyan",
    },
    {
      icon: IconCar,
      title: "New Car Every Few Years",
      description: "Upgrade to the latest models with new technology and safety features.",
      color: "purple",
    },
    {
      icon: IconCalendar,
      title: "Predictable Costs",
      description: "No surprise repair bills or depreciation concerns during your lease.",
      color: "amber",
    },
  ];

  const considerations = [
    "Mileage limits typically range from 10,000 to 15,000 miles per year",
    "Excess mileage fees apply if you go over your allowance (usually $0.15-$0.25/mile)",
    "Excess wear and tear charges may apply at lease end",
    "You won't build equity in the vehicle",
    "Early termination fees apply if you end the lease early",
  ];

  const mileageWarning = annualMiles > 15000;

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-amber-500 rounded-xl blur-lg opacity-40" />
          <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-500/30">
            <IconSparkles className="w-6 h-6 text-amber-400" />
          </div>
        </div>
        <div>
          <h3 className="font-bold text-white text-xl">Explore Leasing</h3>
          <p className="text-sm text-slate-400">
            Leasing could be a great fit for your lifestyle
          </p>
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {benefits.map((benefit, index) => {
          const colorClasses = {
            emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
            cyan: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
            purple: "bg-purple-500/10 border-purple-500/20 text-purple-400",
            amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
          }[benefit.color];

          return (
            <div
              key={index}
              className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:border-slate-600/50 transition-all duration-300"
            >
              <div className="flex items-start gap-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", colorClasses)}>
                  <benefit.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">{benefit.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mileage Warning */}
      {mileageWarning && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6">
          <div className="flex items-start gap-3">
            <IconAlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-300 mb-1">High Mileage Consideration</h4>
              <p className="text-sm text-amber-200/80">
                You indicated you drive {formatNumber(annualMiles)} miles per year. Standard lease
                mileage allowances are 10,000-15,000 miles/year. Our specialists can help you find
                high-mileage lease options or determine if financing is better for your situation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Considerations */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-slate-400 mb-3">Things to Know About Leasing</h4>
        <ul className="space-y-2">
          {considerations.map((item, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-2 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Why We Can't Show Payment */}
      <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/30 mb-6">
        <h4 className="font-semibold text-white mb-2">Why We Need a Specialist</h4>
        <p className="text-sm text-slate-400 leading-relaxed">
          Lease payments are calculated using manufacturer-specific factors including the money
          factor (like an interest rate), residual value (predicted end-of-lease value), and
          current incentives. These vary by vehicle model, lease term, and change frequently.
          Our specialists have access to real-time data to build an accurate quote for you.
        </p>
      </div>

      {/* CTA Section */}
      {!showForm && !submitted && (
        <div className="text-center">
          <Button
            variant="primary"
            size="lg"
            onClick={() => setShowForm(true)}
            className="group w-full sm:w-auto"
          >
            <IconSparkles className="w-5 h-5" />
            Get Your Personalized Lease Quote
            <IconArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
          <p className="text-xs text-slate-500 mt-3">
            A Quirk specialist will contact you with accurate pricing for your specific vehicle.
          </p>
        </div>
      )}

      {/* Lead Capture Form */}
      {showForm && !submitted && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <IconCheck className="w-5 h-5" />
              <span className="font-semibold">Great choice!</span>
            </div>
            <p className="text-sm text-slate-300">
              Fill out the form below and a Quirk lease specialist will contact you with a
              personalized quote for a ${formatNumber(vehiclePrice)} vehicle.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Your Name"
              placeholder="John Smith"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            />
            <Input
              label="Phone Number"
              type="tel"
              placeholder="(555) 123-4567"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
            />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Preferred Contact Method
              </label>
              <div className="flex gap-2">
                {(["email", "phone", "text"] as const).map((method) => (
                  <button
                    key={method}
                    onClick={() => setFormData((prev) => ({ ...prev, preferredContact: method }))}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize",
                      formData.preferredContact === method
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50"
                        : "bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:border-slate-600"
                    )}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              placeholder="Specific vehicle you're interested in, preferred lease term, questions..."
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!formData.name || (!formData.email && !formData.phone)}
              className="flex-1"
            >
              <IconSparkles className="w-4 h-4" />
              Request My Lease Quote
            </Button>
          </div>
        </div>
      )}

      {/* Success State */}
      {submitted && (
        <div className="text-center py-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <IconCheck className="w-8 h-8 text-emerald-400" />
          </div>
          <h4 className="text-xl font-bold text-white mb-2">Quote Request Submitted!</h4>
          <p className="text-slate-400 max-w-md mx-auto">
            A Quirk lease specialist will contact you within 1 business day with a personalized
            quote. Check your {formData.preferredContact} for updates.
          </p>
        </div>
      )}
    </Card>
  );
}
