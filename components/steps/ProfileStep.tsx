"use client";

import { useState, useCallback } from "react";
import type { UserProfile } from "@/types";
import { formatNumber, toNumber } from "@/lib/utils";
import { Button, Card, Input, Select } from "@/components/ui";
import { IconArrowLeft, IconArrowRight } from "@/components/icons";

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
    if (user.monthlyNetIncome <= 0) e.income = "Enter your monthly income";
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
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Your Financial Profile
        </h2>
        <p className="text-white">
          Help us understand your current situation
        </p>
      </div>

      <Card className="space-y-5">
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
      </Card>

      <div className="flex justify-between mt-8">
        <Button variant="ghost" onClick={onBack}>
          <IconArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button variant="primary" onClick={handleNext}>
          Continue
          <IconArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
