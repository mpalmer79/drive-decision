"use client";

import { useState, useEffect } from "react";
import type { BuyScenario, LeaseScenario } from "@/types";
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
  Spinner,
} from "@/components/icons";

interface ScenariosStepProps {
  buy: BuyScenario;
  setBuy: React.Dispatch<React.SetStateAction<BuyScenario>>;
  lease: LeaseScenario;
  setLease: React.Dispatch<React.SetStateAction<LeaseScenario>>;
  onSubmit: () => void;
  onBack: () => void;
  isLoading: boolean;
}

type TermOption = 72 | 75 | 84 | "explore";
type OwnershipType = "new-often" | "long-term" | "undecided";

export function ScenariosStep({
  buy,
  setBuy,
  lease,
  setLease,
  onSubmit,
  onBack,
  isLoading,
}: ScenariosStepProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [vehiclePrice, setVehiclePrice] = useState<number>(buy.vehiclePrice || 0);
  const [downPayment, setDownPayment] = useState<number>(buy.downPayment || 0);
  const [selectedTerm, setSelectedTerm] = useState<TermOption | null>(null);
  const [ownershipType, setOwnershipType] = useState<OwnershipType | null>(null);
  const [animating, setAnimating] = useState(false);

  // Calculate suggested down payment (10%)
  const suggestedDown = Math.round(vehiclePrice * 0.1);

  // Sync values back to buy/lease scenarios
  useEffect(() => {
    setBuy(prev => ({
      ...prev,
      vehiclePrice: vehiclePrice,
      downPayment: downPayment,
      termMonths: selectedTerm === "explore" ? 72 : (selectedTerm || 72),
      ownershipMonths: ownershipType === "new-often" ? 36 : ownershipType === "long-term" ? 72 : 48,
      // Set reasonable defaults for removed fields
      aprPercent: prev.aprPercent || 7.5,
      estMonthlyInsurance: prev.estMonthlyInsurance || 180,
      estMonthlyMaintenance: prev.estMonthlyMaintenance || 75,
    }));
    
    setLease(prev => ({
      ...prev,
      msrp: vehiclePrice,
      dueAtSigning: downPayment,
      monthlyPayment: prev.monthlyPayment || Math.round(vehiclePrice * 0.015), // Estimate ~1.5% of price
      termMonths: ownershipType === "new-often" ? 36 : 36,
      estMonthlyInsurance: prev.estMonthlyInsurance || 180,
      estMonthlyMaintenance: prev.estMonthlyMaintenance || 40,
    }));
  }, [vehiclePrice, downPayment, selectedTerm, ownershipType, setBuy, setLease]);

  const goToQuestion = (index: number) => {
    setAnimating(true);
    setTimeout(() => {
      setCurrentQuestion(index);
      setAnimating(false);
    }, 300);
  };

  const canProceed = () => {
    switch (currentQuestion) {
      case 0: return vehiclePrice > 0;
      case 1: return downPayment >= 0;
      case 2: return selectedTerm !== null;
      case 3: return ownershipType !== null;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentQuestion < 3) {
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

  const questions = [
    {
      number: 1,
      icon: IconCar,
      iconBg: "from-emerald-500/20 to-teal-500/20",
      iconColor: "text-emerald-400",
      title: "What is the price of the vehicle you're looking at?",
      subtitle: "This helps us calculate both financing and leasing options for you.",
    },
    {
      number: 2,
      icon: IconDollar,
      iconBg: "from-amber-500/20 to-orange-500/20",
      iconColor: "text-amber-400",
      title: "What amount are you applying to your purchase today?",
      subtitle: "Most lenders like to see at least 10% as your initial investment for money down.",
    },
    {
      number: 3,
      icon: IconCalendar,
      iconBg: "from-cyan-500/20 to-blue-500/20",
      iconColor: "text-cyan-400",
      title: "If you are financing, what term are you considering?",
      subtitle: "Select the loan length that fits your budget.",
    },
    {
      number: 4,
      icon: IconUser,
      iconBg: "from-purple-500/20 to-pink-500/20",
      iconColor: "text-purple-400",
      title: "What type of vehicle owner are you?",
      subtitle: "This helps us tailor our recommendation to your lifestyle.",
    },
  ];

  const currentQ = questions[currentQuestion];

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
                  ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 cursor-pointer hover:scale-105"
                  : i === currentQuestion
                    ? "bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 ring-2 ring-emerald-500"
                    : "bg-slate-800/50 text-slate-500 border border-slate-700/50 cursor-not-allowed"
              )}
            >
              {i < currentQuestion ? <IconCheck className="w-5 h-5" /> : i + 1}
            </button>
            {i < questions.length - 1 && (
              <div className={cn(
                "w-8 sm:w-12 h-1 rounded-full transition-all duration-500",
                i < currentQuestion 
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500" 
                  : "bg-slate-700/50"
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Question Card */}
      <div className={cn(
        "transition-all duration-300",
        animating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
      )}>
        <div className="question-card rounded-3xl p-8 sm:p-10">
          {/* Question Header */}
          <div className="flex items-start gap-5 mb-8">
            <div className={cn(
              "step-number flex-shrink-0",
              "bg-gradient-to-br",
              currentQ.iconBg
            )}>
              <currentQ.icon className={cn("w-6 h-6", currentQ.iconColor)} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight">
                {currentQ.title}
              </h2>
              <p className="text-slate-400 text-sm sm:text-base">
                {currentQ.subtitle}
              </p>
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
                  value={vehiclePrice === 0 ? "" : formatNumber(vehiclePrice)}
                  onChange={(e) => setVehiclePrice(toNumber(e.target.value))}
                  placeholder="42,000"
                  className="text-2xl font-bold py-5"
                />
                
                {/* Quick Select Buttons */}
                <div className="flex flex-wrap gap-2">
                  {[25000, 35000, 45000, 55000, 65000].map((price) => (
                    <button
                      key={price}
                      onClick={() => setVehiclePrice(price)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                        vehiclePrice === price
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50"
                          : "bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:border-slate-600 hover:text-white"
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
                  value={downPayment === 0 ? "" : formatNumber(downPayment)}
                  onChange={(e) => setDownPayment(toNumber(e.target.value))}
                  placeholder={formatNumber(suggestedDown)}
                  className="text-2xl font-bold py-5"
                />
                
                {/* Suggestion Banner */}
                {vehiclePrice > 0 && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Suggested (10%)</p>
                        <p className="text-xl font-bold text-emerald-400">${formatNumber(suggestedDown)}</p>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setDownPayment(suggestedDown)}
                      >
                        Use This
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Quick Select */}
                <div className="flex flex-wrap gap-2">
                  {[0, 2000, 5000, 10000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setDownPayment(amount)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                        downPayment === amount
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/50"
                          : "bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:border-slate-600 hover:text-white"
                      )}
                    >
                      {amount === 0 ? "$0 Down" : `$${formatNumber(amount)}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Question 3: Term Selection */}
            {currentQuestion === 2 && (
              <div className="grid grid-cols-2 gap-4">
                {([
                  { value: 72 as TermOption, label: "72 Months", sublabel: "6 years • Lower payments" },
                  { value: 75 as TermOption, label: "75 Months", sublabel: "6.25 years • Flexible" },
                  { value: 84 as TermOption, label: "84 Months", sublabel: "7 years • Lowest payments" },
                  { value: "explore" as TermOption, label: "Explore All", sublabel: "Show me all options" },
                ]).map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedTerm(option.value)}
                    className={cn(
                      "choice-button rounded-2xl p-5 text-left transition-all duration-300",
                      selectedTerm === option.value && "selected"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-white">{option.label}</span>
                      {selectedTerm === option.value && (
                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                          <IconCheck className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-slate-400">{option.sublabel}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Question 4: Ownership Type */}
            {currentQuestion === 3 && (
              <div className="space-y-4">
                {([
                  {
                    value: "new-often" as OwnershipType,
                    emoji: "🚗",
                    title: "I prefer a new vehicle every 3-5 years",
                    description: "Without the long-term cost of ownership concerns like depreciation and major repairs.",
                  },
                  {
                    value: "long-term" as OwnershipType,
                    emoji: "🔧",
                    title: "I hold onto vehicles long-term",
                    description: "For as long as it makes financial sense, considering mechanical expenses and repairs.",
                  },
                  {
                    value: "undecided" as OwnershipType,
                    emoji: "🤔",
                    title: "I haven't decided yet",
                    description: "It depends on the difference in monthly payment between buying and leasing.",
                  },
                ]).map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setOwnershipType(option.value)}
                    className={cn(
                      "choice-button w-full rounded-2xl p-5 text-left transition-all duration-300",
                      ownershipType === option.value && "selected"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">{option.emoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-white">{option.title}</span>
                          {ownershipType === option.value && (
                            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                              <IconCheck className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-slate-400 leading-relaxed">{option.description}</span>
                      </div>
                    </div>
                  </button>
                ))}
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
          ) : currentQuestion === 3 ? (
            <>
              <IconSparkles className="w-5 h-5" />
              Get My Decision
            </>
          ) : (
            <>
              Continue
              <IconArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </div>

      {/* Summary Preview (shows after question 2) */}
      {currentQuestion >= 2 && vehiclePrice > 0 && (
        <div className="mt-8 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">Your Selection</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-white">${formatNumber(vehiclePrice)}</div>
              <div className="text-xs text-slate-500">Vehicle Price</div>
            </div>
            <div>
              <div className="text-lg font-bold text-emerald-400">${formatNumber(downPayment)}</div>
              <div className="text-xs text-slate-500">Down Payment</div>
            </div>
            {selectedTerm && (
              <div>
                <div className="text-lg font-bold text-cyan-400">
                  {selectedTerm === "explore" ? "All" : `${selectedTerm}mo`}
                </div>
                <div className="text-xs text-slate-500">Term</div>
              </div>
            )}
            {ownershipType && (
              <div>
                <div className="text-lg font-bold text-purple-400">
                  {ownershipType === "new-often" ? "🚗" : ownershipType === "long-term" ? "🔧" : "🤔"}
                </div>
                <div className="text-xs text-slate-500">Owner Type</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
