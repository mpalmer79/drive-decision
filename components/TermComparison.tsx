// components/TermComparison.tsx
"use client";

import { useState } from "react";
import { cn, formatNumber } from "@/lib/utils";
import { Card } from "@/components/ui";
import { IconCheck, IconCalendar } from "@/components/icons";
import type { CreditTier } from "@/types";
import { calculateFinancing } from "@/lib/decisionEngine";

interface TermComparisonProps {
  vehiclePrice: number;
  downPayment: number;
  creditTier: CreditTier;
  onSelectTerm?: (term: 72 | 78 | 84) => void;
}

export function TermComparison({
  vehiclePrice,
  downPayment,
  creditTier,
  onSelectTerm,
}: TermComparisonProps) {
  const [selectedTerm, setSelectedTerm] = useState<72 | 78 | 84 | null>(null);

  // Calculate for all three terms
  const term72 = calculateFinancing(vehiclePrice, downPayment, 72, creditTier);
  const term78 = calculateFinancing(vehiclePrice, downPayment, 78, creditTier);
  const term84 = calculateFinancing(vehiclePrice, downPayment, 84, creditTier);

  const options = [
    {
      term: 72 as const,
      label: "72 Months",
      years: "6 years",
      calc: term72,
      highlight: "Lowest Total Cost",
      highlightColor: "emerald",
    },
    {
      term: 78 as const,
      label: "78 Months",
      years: "6.5 years",
      calc: term78,
      highlight: "Balanced Option",
      highlightColor: "cyan",
    },
    {
      term: 84 as const,
      label: "84 Months",
      years: "7 years",
      calc: term84,
      highlight: "Lowest Payment",
      highlightColor: "amber",
      popular: true,
    },
  ];

  const handleSelect = (term: 72 | 78 | 84) => {
    setSelectedTerm(term);
    onSelectTerm?.(term);
  };

  // Calculate savings/cost difference from 72-month baseline
  const getInterestDiff = (interest: number) => {
    const diff = interest - term72.totalInterest;
    return diff;
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center">
          <IconCalendar className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-lg">Compare Your Options</h3>
          <p className="text-xs text-slate-500">
            See how term length affects your payment at {term72.aprUsed}% APR
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {options.map((option) => {
          const isSelected = selectedTerm === option.term;
          const interestDiff = getInterestDiff(option.calc.totalInterest);

          const highlightColors = {
            emerald: {
              bg: "bg-emerald-100",
              text: "text-emerald-600",
              border: "border-emerald-300",
              ring: "ring-emerald-500",
            },
            cyan: {
              bg: "bg-cyan-100",
              text: "text-cyan-600",
              border: "border-cyan-500/30",
              ring: "ring-cyan-500",
            },
            amber: {
              bg: "bg-amber-100",
              text: "text-amber-600",
              border: "border-amber-300",
              ring: "ring-amber-500",
            },
          }[option.highlightColor as "emerald" | "cyan" | "amber"]!;

          return (
            <button
              key={option.term}
              onClick={() => handleSelect(option.term)}
              className={cn(
                "relative p-5 rounded-2xl border-2 text-left transition-all duration-300",
                "bg-slate-50 hover:bg-slate-100",
                isSelected
                  ? `${highlightColors.border} ${highlightColors.bg} ring-2 ${highlightColors.ring}`
                  : "border-slate-300 hover:border-slate-400"
              )}
            >
              {/* Popular Badge */}
              {option.popular && !isSelected && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full">
                  <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Selected Check */}
              {isSelected && (
                <div className={cn(
                  "absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center",
                  highlightColors.bg
                )}>
                  <IconCheck className={cn("w-4 h-4", highlightColors.text)} />
                </div>
              )}

              {/* Term Label */}
              <div className="mb-4">
                <div className="text-lg font-bold text-slate-900">{option.label}</div>
                <div className="text-xs text-slate-500">{option.years}</div>
              </div>

              {/* Monthly Payment */}
              <div className="mb-4">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                  Monthly Payment
                </div>
                <div className={cn(
                  "text-3xl font-bold",
                  isSelected ? highlightColors.text : "text-slate-900"
                )}>
                  ${formatNumber(option.calc.monthlyPayment)}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  ${formatNumber(option.calc.monthlyAllIn)} all-in
                </div>
              </div>

              {/* Total Interest */}
              <div className="pt-3 border-t border-slate-300">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-500">Total Interest</span>
                  <span className="text-sm font-semibold text-amber-600">
                    ${formatNumber(option.calc.totalInterest)}
                  </span>
                </div>
                {interestDiff > 0 && (
                  <div className="text-xs text-slate-500">
                    +${formatNumber(interestDiff)} vs 72mo
                  </div>
                )}
                {interestDiff === 0 && (
                  <div className="text-xs text-emerald-600">
                    Lowest interest cost
                  </div>
                )}
              </div>

              {/* Highlight Tag */}
              <div className={cn(
                "mt-4 py-1.5 px-3 rounded-lg text-xs font-medium text-center",
                highlightColors.bg,
                highlightColors.text
              )}>
                {option.highlight}
              </div>
            </button>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="mt-6 p-4 rounded-xl bg-slate-100 border border-slate-200">
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="text-slate-500 mb-1">Payment Range</div>
            <div className="font-semibold text-slate-900">
              ${formatNumber(term84.monthlyPayment)} – ${formatNumber(term72.monthlyPayment)}
            </div>
          </div>
          <div>
            <div className="text-slate-500 mb-1">Interest Spread</div>
            <div className="font-semibold text-amber-600">
              ${formatNumber(term84.totalInterest - term72.totalInterest)}
            </div>
          </div>
          <div>
            <div className="text-slate-500 mb-1">APR</div>
            <div className="font-semibold text-violet-400">
              {term72.aprUsed}%
            </div>
          </div>
        </div>
      </div>

      {selectedTerm && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-100 border border-emerald-200 text-center">
          <span className="text-sm text-emerald-600">
            ✓ {selectedTerm}-month term selected — this will be included in your quote request
          </span>
        </div>
      )}
    </Card>
  );
}
