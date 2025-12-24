"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button, Card, QuirkHeader } from "@/components/ui";
import {
  IconCar,
  IconShield,
  IconTrendingUp,
  IconAlertTriangle,
  IconArrowRight,
} from "@/components/icons";

interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Quirk Logo Header */}
      <QuirkHeader />

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 text-center">
        <div
          className={cn(
            "transition-all duration-1000 ease-out",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <IconCar className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <div className="text-xl font-bold text-white tracking-tight">
                DriveDecision
              </div>
              <div className="text-xs text-slate-400 tracking-widest uppercase">
                by Quirk AI
              </div>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            Should you{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              buy
            </span>{" "}
            or{" "}
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              lease
            </span>
            ?
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Get a clear, personalized answer in under 2 minutes. We analyze your
            financial situation—not just the monthly payment.
          </p>

          {/* CTA */}
          <Button variant="primary" size="lg" onClick={onStart}>
            Get Your Answer
            <IconArrowRight className="w-5 h-5" />
          </Button>

          <p className="text-sm text-slate-500 mt-4">Free • No account needed</p>
        </div>

        {/* Feature Cards */}
        <div
          className={cn(
            "grid grid-cols-1 sm:grid-cols-3 gap-4 mt-20 max-w-4xl w-full transition-all duration-1000 delay-300 ease-out",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          {[
            {
              icon: IconShield,
              title: "Risk-First Analysis",
              desc: "We calculate what you can actually afford, not just the cheapest option.",
            },
            {
              icon: IconTrendingUp,
              title: "Cash Flow Stress Test",
              desc: "See how each option affects your monthly finances and savings buffer.",
            },
            {
              icon: IconAlertTriangle,
              title: "Downside Protection",
              desc: "Know which option is safer if your income drops 10%.",
            },
          ].map((feature) => (
            <Card key={feature.title} className="text-left">
              <feature.icon className="w-8 h-8 text-emerald-400 mb-3" />
              <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
              <p className="text-sm text-slate-400">{feature.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 px-4 text-center border-t border-slate-800">
        <p className="text-xs text-slate-500">
          Educational decision support only. Not financial, legal, or tax
          advice.
        </p>
      </footer>
    </div>
  );
}
