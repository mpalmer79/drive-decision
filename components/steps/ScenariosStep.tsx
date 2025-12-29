"use client";

import { useState } from "react";
import type { VehiclePreferences, CreditTier } from "@/types";
import { cn, formatNumber, toNumber } from "@/lib/utils";
import { Button, Card, Input } from "@/components/ui";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCar,
  IconDollar,
  IconCalendar,
  IconUser,
  IconCheck,
  IconSparkles,
  IconTrendingUp,
  IconShield,
  Spinner,
} from "@/components/icons";

interface ScenariosStepProps {
  preferences: VehiclePreferences;
  setPreferences: React.Dispatch<React.SetStateAction<VehiclePreferences>>;
  onSubmit: () => void;
  onBack: () => void;
  isLoading: boolean;
}

type Priority = "lowest-payment" | "ownership" | "flexibility" | "newest-tech" | "customize";

// Credit score icon
function IconCreditCard({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}

export function ScenariosStep({
  preferences,
  setPreferences,
  onSubmit,
  onBack,
  isLoading,
}: ScenariosStepProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [animating, setAnimating] = useState(false);

  const suggestedDown = Math.round(preferences.vehiclePrice * 0.1);

  const goToQuestion = (index: number) => {
    setAnimating(true);
    setTimeout(() => {
      setCurrentQuestion(index);
      setAnimating(false);
    }, 300);
  };

  const canProceed = () => {
    switch (currentQuestion) {
      case 0:
        return preferences.vehiclePrice > 0;
      case 1:
        return preferences.downPayment >= 0;
      case 2:
        return preferences.creditTier !== null;
      case 3:
        return preferences.annualMiles > 0;
      case 4:
        return preferences.ownershipStyle !== null;
      case 5:
        return preferences.priorities.length > 0;
      case 6:
        return preferences.financeTerm !== null;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentQuestion < 6) {
      goToQuestion(currentQuestion + 1);
    } else {
      onSubmit();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      goToQuestion(currentQuestion - 1);
    } else {
      onBack();
    }
  };

  const togglePriority = (priority: Priority) => {
    setPreferences((prev) => ({
      ...prev,
      priorities: prev.priorities.includes(priority)
        ? prev.priorities.filter((p) => p !== priority)
        : [...prev.priorities, priority],
    }));
  };

  const questions = [
    {
      number: 1,
      icon: IconCar,
      iconBg: "from-emerald-100 to-teal-100",
      iconColor: "text-emerald-600",
      title: "What is the price of the vehicle you're looking at?",
      subtitle: "This helps us calculate your financing options.",
    },
    {
      number: 2,
      icon: IconDollar,
      iconBg: "from-amber-100 to-orange-100",
      iconColor: "text-amber-600",
      title: "What amount are you applying as a down payment?",
      subtitle: "Most lenders like to see at least 10% as your initial investment.",
    },
    {
      number: 3,
      icon: IconCreditCard,
      iconBg: "from-violet-500/20 to-purple-500/20",
      iconColor: "text-violet-400",
      title: "What's your credit situation?",
      subtitle: "This helps us estimate your interest rate. Be honest — it only affects your payment estimate.",
    },
    {
      number: 4,
      icon: IconTrendingUp,
      iconBg: "from-cyan-100 to-blue-100",
      iconColor: "text-cyan-600",
      title: "How many miles do you drive per year?",
      subtitle: "This is important for understanding your driving habits.",
    },
    {
      number: 5,
      icon: IconUser,
      iconBg: "from-purple-500/20 to-pink-500/20",
      iconColor: "text-purple-400",
      title: "What type of vehicle owner are you?",
      subtitle: "This helps us tailor our recommendation to your lifestyle.",
    },
    {
      number: 6,
      icon: IconShield,
      iconBg: "from-rose-500/20 to-red-500/20",
      iconColor: "text-rose-400",
      title: "What matters most to you?",
      subtitle: "Select all that apply to help us understand your priorities.",
    },
    {
      number: 7,
      icon: IconCalendar,
      iconBg: "from-indigo-500/20 to-violet-500/20",
      iconColor: "text-indigo-400",
      title: "If you were to finance, what term would you consider?",
      subtitle: "This affects your monthly payment and total cost.",
    },
  ];

  const currentQ = questions[currentQuestion];

  // Credit tier options
  const creditTierOptions: { value: CreditTier; label: string; score: string; color: string }[] = [
    { value: "excellent", label: "Excellent", score: "750+", color: "emerald" },
    { value: "good", label: "Good", score: "700-749", color: "cyan" },
    { value: "fair", label: "Fair", score: "650-699", color: "amber" },
    { value: "rebuilding", label: "Rebuilding", score: "Below 650", color: "rose" },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {questions.map((q, i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              onClick={() => i < currentQuestion && goToQuestion(i)}
              disabled={i > currentQuestion}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300",
                i < currentQuestion
                  ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-slate-900 shadow-lg shadow-emerald-500/30 cursor-pointer hover:scale-105"
                  : i === currentQuestion
                    ? "bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-600 ring-2 ring-emerald-500"
                    : "bg-slate-100 text-slate-500 border border-slate-300 cursor-not-allowed"
              )}
            >
              {i < currentQuestion ? <IconCheck className="w-5 h-5" /> : i + 1}
            </button>
            {i < questions.length - 1 && (
              <div
                className={cn(
                  "w-4 sm:w-6 h-1 rounded-full transition-all duration-500",
                  i < currentQuestion
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                    : "bg-slate-200"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Question Card */}
      <div
        className={cn(
          "transition-all duration-300",
          animating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        )}
      >
        <div className="question-card rounded-3xl p-8 sm:p-10">
          {/* Question Header */}
          <div className="flex items-start gap-5 mb-8">
            <div
              className={cn(
                "step-number flex-shrink-0",
                "bg-gradient-to-br",
                currentQ.iconBg
              )}
            >
              <currentQ.icon className={cn("w-6 h-6", currentQ.iconColor)} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 leading-tight">
                {currentQ.title}
              </h2>
              <p className="text-slate-500 text-sm sm:text-base">{currentQ.subtitle}</p>
            </div>
          </div>

          {/* Question Content */}
          <div className="space-y-6">
            {/* Question 1: Vehicle Price */}
            {currentQuestion === 0 && (
              <div className="space-y-4">
                <Input
                  prefix="$"
                  type="text"
                  inputMode="numeric"
                  value={preferences.vehiclePrice === 0 ? "" : formatNumber(preferences.vehiclePrice)}
                  onChange={(e) =>
                    setPreferences((prev) => ({ ...prev, vehiclePrice: toNumber(e.target.value) }))
                  }
                  placeholder="42,000"
                  className="text-2xl font-bold py-5"
                />
                <div className="flex flex-wrap gap-2">
                  {[25000, 35000, 45000, 55000, 65000].map((price) => (
                    <button
                      key={price}
                      onClick={() => setPreferences((prev) => ({ ...prev, vehiclePrice: price }))}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                        preferences.vehiclePrice === price
                          ? "bg-emerald-500/20 text-emerald-600 border border-emerald-500/50"
                          : "bg-slate-100 text-slate-500 border border-slate-300 hover:border-slate-400 hover:text-slate-900"
                      )}
                    >
                      ${formatNumber(price)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Question 2: Down Payment */}
            {currentQuestion === 1 && (
              <div className="space-y-4">
                <Input
                  prefix="$"
                  type="text"
                  inputMode="numeric"
                  value={preferences.downPayment === 0 ? "" : formatNumber(preferences.downPayment)}
                  onChange={(e) =>
                    setPreferences((prev) => ({ ...prev, downPayment: toNumber(e.target.value) }))
                  }
                  placeholder={formatNumber(suggestedDown)}
                  className="text-2xl font-bold py-5"
                />
                {preferences.vehiclePrice > 0 && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Suggested (10%)</p>
                        <p className="text-xl font-bold text-emerald-600">
                          ${formatNumber(suggestedDown)}
                        </p>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          setPreferences((prev) => ({ ...prev, downPayment: suggestedDown }))
                        }
                      >
                        Use This
                      </Button>
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {[0, 2000, 5000, 10000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setPreferences((prev) => ({ ...prev, downPayment: amount }))}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                        preferences.downPayment === amount
                          ? "bg-amber-500/20 text-amber-600 border border-amber-500/50"
                          : "bg-slate-100 text-slate-500 border border-slate-300 hover:border-slate-400 hover:text-slate-900"
                      )}
                    >
                      {amount === 0 ? "$0 Down" : `$${formatNumber(amount)}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Question 3: Credit Tier (NEW) */}
            {currentQuestion === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {creditTierOptions.map((option) => {
                    const colorClasses = {
                      emerald: {
                        selected: "bg-emerald-500/20 border-emerald-500/50 ring-2 ring-emerald-500",
                        badge: "bg-emerald-500/20 text-emerald-600",
                        text: "text-emerald-600",
                      },
                      cyan: {
                        selected: "bg-cyan-500/20 border-cyan-500/50 ring-2 ring-cyan-500",
                        badge: "bg-cyan-500/20 text-cyan-600",
                        text: "text-cyan-600",
                      },
                      amber: {
                        selected: "bg-amber-500/20 border-amber-500/50 ring-2 ring-amber-500",
                        badge: "bg-amber-500/20 text-amber-600",
                        text: "text-amber-600",
                      },
                      rose: {
                        selected: "bg-rose-500/20 border-rose-500/50 ring-2 ring-rose-500",
                        badge: "bg-rose-500/20 text-rose-400",
                        text: "text-rose-400",
                      },
                    }[option.color as "emerald" | "cyan" | "amber" | "rose"]!;

                    return (
                      <button
                        key={option.value}
                        onClick={() =>
                          setPreferences((prev) => ({ ...prev, creditTier: option.value }))
                        }
                        className={cn(
                          "choice-button rounded-2xl p-5 text-left transition-all duration-300 relative",
                          preferences.creditTier === option.value
                            ? colorClasses.selected
                            : "hover:border-slate-400"
                        )}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-bold text-slate-900">{option.label}</span>
                          {preferences.creditTier === option.value && (
                            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", colorClasses.badge)}>
                              <IconCheck className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <span className={cn("text-sm font-medium px-2 py-1 rounded-lg", colorClasses.badge)}>
                          {option.score}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-sm text-slate-500">
                  💡 Not sure? Check your score free at Credit Karma or your bank's app. Most people are in the "Good" range.
                </div>
              </div>
            )}

            {/* Question 4: Annual Miles */}
            {currentQuestion === 3 && (
              <div className="space-y-4">
                <Input
                  type="text"
                  inputMode="numeric"
                  suffix="miles/year"
                  value={preferences.annualMiles === 0 ? "" : formatNumber(preferences.annualMiles)}
                  onChange={(e) =>
                    setPreferences((prev) => ({ ...prev, annualMiles: toNumber(e.target.value) }))
                  }
                  placeholder="12,000"
                  className="text-2xl font-bold py-5"
                />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { value: 8000, label: "8,000", desc: "Light" },
                    { value: 12000, label: "12,000", desc: "Average" },
                    { value: 15000, label: "15,000", desc: "Moderate" },
                    { value: 20000, label: "20,000+", desc: "Heavy" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        setPreferences((prev) => ({ ...prev, annualMiles: option.value }))
                      }
                      className={cn(
                        "p-3 rounded-xl text-center transition-all duration-200",
                        preferences.annualMiles === option.value
                          ? "bg-cyan-500/20 text-cyan-600 border-2 border-cyan-500/50"
                          : "bg-slate-100 text-slate-500 border border-slate-300 hover:border-slate-400"
                      )}
                    >
                      <div className="font-bold">{option.label}</div>
                      <div className="text-xs text-slate-500">{option.desc}</div>
                    </button>
                  ))}
                </div>
                {preferences.annualMiles > 15000 && (
                  <div className="p-3 rounded-xl bg-amber-100 border border-amber-500/20 text-sm text-amber-300">
                    💡 High mileage drivers often benefit more from buying to avoid lease mileage penalties.
                  </div>
                )}
              </div>
            )}

            {/* Question 5: Ownership Style */}
            {currentQuestion === 4 && (
              <div className="space-y-4">
                {[
                  {
                    value: "new-often" as const,
                    emoji: "🚗",
                    title: "I like a new vehicle every 3-5 years",
                    description:
                      "I enjoy having the latest features and don't want to worry about long-term maintenance.",
                  },
                  {
                    value: "long-term" as const,
                    emoji: "🔧",
                    title: "I keep vehicles for the long haul",
                    description:
                      "I drive my vehicles until it no longer makes financial sense, typically 7+ years.",
                  },
                  {
                    value: "undecided" as const,
                    emoji: "🤔",
                    title: "I'm not sure yet",
                    description:
                      "It depends on the vehicle and my situation. I want to explore my options.",
                  },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() =>
                      setPreferences((prev) => ({ ...prev, ownershipStyle: option.value }))
                    }
                    className={cn(
                      "choice-button w-full rounded-2xl p-5 text-left transition-all duration-300",
                      preferences.ownershipStyle === option.value && "selected"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">{option.emoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900">{option.title}</span>
                          {preferences.ownershipStyle === option.value && (
                            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                              <IconCheck className="w-4 h-4 text-slate-900" />
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-slate-500 leading-relaxed">
                          {option.description}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Question 6: Priorities (Multi-select) */}
            {currentQuestion === 5 && (
              <div className="space-y-4">
                <p className="text-sm text-slate-500 mb-2">Select all that apply:</p>
                {[
                  {
                    value: "lowest-payment" as Priority,
                    emoji: "💵",
                    title: "Lowest monthly payment",
                    description: "Keeping my monthly costs as low as possible is most important.",
                  },
                  {
                    value: "ownership" as Priority,
                    emoji: "🔑",
                    title: "Owning my vehicle outright",
                    description: "I want to build equity and eventually have no car payment.",
                  },
                  {
                    value: "flexibility" as Priority,
                    emoji: "🔄",
                    title: "Flexibility at the end of term",
                    description: "I want options - to return, buy, or trade when my term ends.",
                  },
                  {
                    value: "newest-tech" as Priority,
                    emoji: "✨",
                    title: "Always having the newest technology",
                    description: "I want the latest safety features, infotainment, and efficiency.",
                  },
                  {
                    value: "customize" as Priority,
                    emoji: "🎨",
                    title: "Ability to customize my vehicle",
                    description: "I want to modify, accessorize, or personalize my vehicle.",
                  },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => togglePriority(option.value)}
                    className={cn(
                      "choice-button w-full rounded-2xl p-4 text-left transition-all duration-300",
                      preferences.priorities.includes(option.value) && "selected"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-2xl">{option.emoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-900">{option.title}</span>
                          {preferences.priorities.includes(option.value) && (
                            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                              <IconCheck className="w-4 h-4 text-slate-900" />
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-slate-500">{option.description}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Question 7: Finance Term */}
            {currentQuestion === 6 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: 72 as const, label: "72 Months", sublabel: "6 years • Standard payments", popular: false },
                    { value: 78 as const, label: "78 Months", sublabel: "6.5 years • Balanced", popular: false },
                    { value: 84 as const, label: "84 Months", sublabel: "7 years • Lower payments", popular: true },
                    { value: "explore" as const, label: "What are my options?", sublabel: "Show me these three payment options", popular: false },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        setPreferences((prev) => ({ ...prev, financeTerm: option.value }))
                      }
                      className={cn(
                        "choice-button rounded-2xl p-5 text-left transition-all duration-300 relative",
                        preferences.financeTerm === option.value && "selected",
                        option.popular && preferences.financeTerm !== option.value && "ring-1 ring-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                      )}
                    >
                      {option.popular && (
                        <div className="absolute -top-2 left-4 px-2 py-0.5 bg-gradient-to-r from-emerald-500/90 to-teal-500/90 rounded-full">
                          <span className="text-[10px] font-semibold text-slate-900 uppercase tracking-wider">Most Popular</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-bold text-slate-900">{option.label}</span>
                        {preferences.financeTerm === option.value && (
                          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                            <IconCheck className="w-4 h-4 text-slate-900" />
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-slate-500">{option.sublabel}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8">
        <Button variant="ghost" onClick={handleBack} disabled={isLoading}>
          <IconArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>

        <Button
          variant="primary"
          size="lg"
          onClick={handleNext}
          disabled={!canProceed() || isLoading}
          className="group min-w-[180px]"
        >
          {isLoading ? (
            <>
              <Spinner className="w-5 h-5" />
              Analyzing...
            </>
          ) : currentQuestion === 6 ? (
            <>
              <IconSparkles className="w-5 h-5" />
              Get My Recommendation
            </>
          ) : (
            <>
              Continue
              <IconArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </div>

      {/* Summary Preview */}
      {currentQuestion >= 3 && preferences.vehiclePrice > 0 && (
        <div className="mt-8 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">Your Selection</div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-slate-900">
                ${formatNumber(preferences.vehiclePrice)}
              </div>
              <div className="text-xs text-slate-500">Vehicle Price</div>
            </div>
            <div>
              <div className="text-lg font-bold text-emerald-600">
                ${formatNumber(preferences.downPayment)}
              </div>
              <div className="text-xs text-slate-500">Down Payment</div>
            </div>
            <div>
              <div className="text-lg font-bold text-cyan-600">
                {formatNumber(preferences.annualMiles)}
              </div>
              <div className="text-xs text-slate-500">Miles/Year</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
