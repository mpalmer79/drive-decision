"use client";

import { useState } from "react";
import type { UserProfile } from "@/types";
import { cn, formatNumber, toNumber } from "@/lib/utils";
import { Button, Card, Input, Divider } from "@/components/ui";
import {
  IconArrowLeft,
  IconArrowRight,
  IconDollar,
  IconShield,
  IconTrendingUp,
} from "@/components/icons";

interface ProfileStepProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onNext: () => void;
  onBack: () => void;
}

export function ProfileStep({ profile, setProfile, onNext, onBack }: ProfileStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const discretionaryIncome = profile.monthlyIncome - profile.monthlyExpenses;
  const savingsMonths = profile.monthlyExpenses > 0 
    ? (profile.currentSavings / profile.monthlyExpenses).toFixed(1) 
    : "0";

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (profile.monthlyIncome <= 0) {
      newErrors.monthlyIncome = "Please enter your monthly income";
    }
    if (profile.monthlyExpenses <= 0) {
      newErrors.monthlyExpenses = "Please enter your monthly expenses";
    }
    if (profile.monthlyExpenses >= profile.monthlyIncome) {
      newErrors.monthlyExpenses = "Expenses should be less than income";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  const updateField = (field: keyof UserProfile, value: number) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <Card>
        {/* Income Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <IconDollar className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Monthly Finances</h3>
              <p className="text-xs text-slate-500">Your take-home income and regular expenses</p>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="Monthly Take-Home Income"
              prefix="$"
              type="text"
              inputMode="numeric"
              placeholder="5,000"
              value={profile.monthlyIncome === 0 ? "" : formatNumber(profile.monthlyIncome)}
              onChange={(e) => updateField("monthlyIncome", toNumber(e.target.value))}
              error={errors.monthlyIncome}
            />

            <Input
              label="Monthly Fixed Expenses"
              prefix="$"
              type="text"
              inputMode="numeric"
              placeholder="3,000"
              value={profile.monthlyExpenses === 0 ? "" : formatNumber(profile.monthlyExpenses)}
              onChange={(e) => updateField("monthlyExpenses", toNumber(e.target.value))}
              error={errors.monthlyExpenses}
              hint="Rent, utilities, food, insurance, subscriptions, etc."
            />
          </div>
        </div>

        <Divider />

        {/* Savings Section */}
        <div className="my-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
              <IconShield className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Emergency Fund</h3>
              <p className="text-xs text-slate-500">Your financial safety net</p>
            </div>
          </div>

          <Input
            label="Current Savings"
            prefix="$"
            type="text"
            inputMode="numeric"
            placeholder="10,000"
            value={profile.currentSavings === 0 ? "" : formatNumber(profile.currentSavings)}
            onChange={(e) => updateField("currentSavings", toNumber(e.target.value))}
            hint="Liquid savings you could access in an emergency"
          />
        </div>

        {/* Quick Preview */}
        {profile.monthlyIncome > 0 && profile.monthlyExpenses > 0 && (
          <>
            <Divider />
            <div className="mt-8 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <IconTrendingUp className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-slate-700">Your Snapshot</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Monthly Discretionary</div>
                  <div className={cn(
                    "text-xl font-bold",
                    discretionaryIncome > 0 ? "text-emerald-600" : "text-red-600"
                  )}>
                    ${formatNumber(Math.max(0, discretionaryIncome))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Savings Buffer</div>
                  <div className={cn(
                    "text-xl font-bold",
                    parseFloat(savingsMonths) >= 3 ? "text-cyan-600" : "text-amber-600"
                  )}>
                    {savingsMonths} months
                  </div>
                </div>
              </div>
              {parseFloat(savingsMonths) < 3 && (
                <p className="text-xs text-amber-600 mt-3">
                  💡 Financial experts recommend 3-6 months of expenses in savings.
                </p>
              )}
            </div>
          </>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8">
        <Button variant="ghost" onClick={onBack}>
          <IconArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>

        <Button variant="primary" onClick={handleNext} className="group">
          <span>Continue</span>
          <IconArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Button>
      </div>
    </div>
  );
}
