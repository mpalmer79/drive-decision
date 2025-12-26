"use client";

import { useState, useCallback } from "react";
import type { UserProfile } from "@/types";
import { cn, formatNumber, toNumber } from "@/lib/utils";
import { Button, Card, Input, Select, Divider } from "@/components/ui";
import { IconArrowLeft, IconArrowRight, IconUser, IconShield, IconDollar } from "@/components/icons";

interface ProfileStepProps {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  onNext: () => void;
  onBack: () => void;
}

export function ProfileStep({ user, setUser, onNext, onBack }: ProfileStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback(() => {
    const e: Record<string, string> = {};
    if (user.monthlyNetIncome <= 0) e.income = "Please enter your monthly income";
    if (user.monthlyFixedExpenses < 0) e.expenses = "Invalid amount";
    if (user.currentSavings < 0) e.savings = "Invalid amount";
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [user]);

  const handleNext = () => {
    if (validate()) onNext();
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex justify-center mb-5">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl blur-xl opacity-30" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/20">
              <IconUser className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 tracking-tight">
          Your Financial Profile
        </h2>
        <p className="text-slate-400 text-lg">
          Help us understand your current situation for a personalized analysis
        </p>
      </div>

      <Card className="space-y-6">
        {/* Income Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <IconDollar className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Income & Expenses</span>
          </div>
          
          <div className="space-y-4">
            <Input
              label="Monthly take-home pay"
              hint="After taxes"
              prefix="$"
              type="text"
              inputMode="numeric"
              value={user.monthlyNetIncome === 0 ? "" : formatNumber(user.monthlyNetIncome)}
              onChange={(e) =>
                setUser({ ...user, monthlyNetIncome: toNumber(e.target.value) })
              }
              error={errors.income}
              placeholder="6,500"
            />

            <Input
              label="Monthly fixed expenses"
              hint="Rent, utilities, subscriptions, etc."
              prefix="$"
              type="text"
              inputMode="numeric"
              value={user.monthlyFixedExpenses === 0 ? "" : formatNumber(user.monthlyFixedExpenses)}
              onChange={(e) =>
                setUser({ ...user, monthlyFixedExpenses: toNumber(e.target.value) })
              }
              error={errors.expenses}
              placeholder="3,800"
            />

            <Input
              label="Current savings"
              hint="Emergency fund / liquid assets"
              prefix="$"
              type="text"
              inputMode="numeric"
              value={user.currentSavings === 0 ? "" : formatNumber(user.currentSavings)}
              onChange={(e) =>
                setUser({ ...user, currentSavings: toNumber(e.target.value) })
              }
              error={errors.savings}
              placeholder="12,000"
            />
          </div>
        </div>

        <Divider />

        {/* Risk Profile Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <IconShield className="w-5 h-5 text-teal-400" />
            <span className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Risk Profile</span>
          </div>

          <div className="space-y-4">
            <Select
              label="Credit score range"
              value={user.creditScoreBand}
              onChange={(e) =>
                setUser({
                  ...user,
                  creditScoreBand: e.target.value as UserProfile["creditScoreBand"],
                })
              }
            >
              <option value="below_620">Below 620 (Rebuilding)</option>
              <option value="620_679">620–679 (Fair)</option>
              <option value="680_739">680–739 (Good)</option>
              <option value="740_plus">740+ (Excellent)</option>
            </Select>

            <Select
              label="Risk tolerance"
              hint="How much financial uncertainty can you handle?"
              value={user.riskTolerance}
              onChange={(e) =>
                setUser({
                  ...user,
                  riskTolerance: e.target.value as UserProfile["riskTolerance"],
                })
              }
            >
              <option value="low">Low — I prefer maximum safety</option>
              <option value="medium">Medium — Balanced approach</option>
              <option value="high">High — I can handle some risk</option>
            </Select>
          </div>
        </div>

        {/* Quick Stats Preview */}
        {user.monthlyNetIncome > 0 && (
          <>
            <Divider />
            <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">Quick Preview</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Monthly Discretionary</div>
                  <div className={cn(
                    "text-lg font-bold",
                    (user.monthlyNetIncome - user.monthlyFixedExpenses) > 0 
                      ? "text-emerald-400" 
                      : "text-red-400"
                  )}>
                    ${formatNumber(Math.max(0, user.monthlyNetIncome - user.monthlyFixedExpenses))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Savings Months</div>
                  <div className="text-lg font-bold text-teal-400">
                    {user.monthlyFixedExpenses > 0 
                      ? (user.currentSavings / user.monthlyFixedExpenses).toFixed(1)
                      : "—"
                    } mo
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center mt-10">
        <Button variant="ghost" onClick={onBack}>
          <IconArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        <Button variant="primary" onClick={handleNext} className="group">
          Continue
          <IconArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Button>
      </div>
    </div>
  );
}
