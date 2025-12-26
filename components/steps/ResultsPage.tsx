"use client";

import { useState, useEffect } from "react";
import type { DecisionResult } from "@/types";
import { cn, formatNumber } from "@/lib/utils";
import { Button, Card, StressMeter, Badge, Divider } from "@/components/ui";
import {
  IconShield,
  IconCheck,
  IconKey,
  IconAlertTriangle,
  IconRefresh,
  IconSparkles,
  IconTrendingUp,
  IconArrowRight,
  IconArrowLeft,
} from "@/components/icons";
import { Confetti, ConfettiBurst } from "@/components/Confetti";
import { AnimatedCounter, PercentageRing } from "@/components/AnimatedCounter";
import { LeaseExplorer } from "@/components/LeaseExplorer";
import { PaymentTimeline } from "@/components/PaymentTimeline";
import { ProtectionPackages } from "@/components/steps/ProtectionPackages";
import { LeadCapture } from "@/components/steps/LeadCapture";

interface ResultsPageProps {
  result: DecisionResult;
  onStartOver: () => void;
  onBack: () => void;
}

export function ResultsPage({ result, onStartOver, onBack }: ResultsPageProps) {
  const [revealStage, setRevealStage] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const { recommendation, financeCalculation, budgetAnalysis, preferences } = result;
  const isBuyRecommended = recommendation.verdict === "buy";

  // Staged reveal animation
  useEffect(() => {
    const stages = [
      { delay: 100, stage: 1 },
      { delay: 600, stage: 2 },
      { delay: 1000, stage: 3 },
      { delay: 1200, stage: 4 },
      { delay: 1800, stage: 5 },
      { delay: 2500, stage: 6 },
    ];

    stages.forEach(({ delay, stage }) => {
      setTimeout(() => {
        setRevealStage(stage);
        if (stage === 3) setShowConfetti(true);
      }, delay);
    });
  }, []);

  const handleLeaseLeadCapture = (data: any) => {
    console.log("Lease lead captured:", data);
    // TODO: Send to CRM/backend
  };

  const confidenceConfig = {
    high: {
      text: "High Confidence",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      value: 95,
    },
    medium: {
      text: "Moderate Confidence",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      value: 70,
    },
    low: {
      text: "Close Call",
      color: "text-slate-400",
      bg: "bg-slate-500/10",
      border: "border-slate-500/20",
      value: 50,
    },
  }[recommendation.confidence];

  const affordabilityColors = {
    comfortable: { text: "text-emerald-400", bg: "bg-emerald-500/10", label: "Comfortable" },
    manageable: { text: "text-cyan-400", bg: "bg-cyan-500/10", label: "Manageable" },
    stretched: { text: "text-amber-400", bg: "bg-amber-500/10", label: "Stretched" },
    risky: { text: "text-red-400", bg: "bg-red-500/10", label: "Risky" },
  }[budgetAnalysis.affordabilityRating];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Confetti */}
      <Confetti active={showConfetti} pieceCount={150} duration={5000} />

      {/* Verdict Hero */}
      <div className="text-center mb-12 relative">
        <div className={cn("transition-all duration-700", revealStage >= 3 ? "opacity-100" : "opacity-0")}>
          <ConfettiBurst active={revealStage >= 3} />
        </div>

        {/* Trophy/Icon */}
        <div className={cn(
          "flex justify-center mb-6 transition-all duration-700",
          revealStage >= 1 ? "opacity-100 scale-100" : "opacity-0 scale-50"
        )}>
          <div className="relative">
            <div className={cn(
              "absolute inset-0 rounded-3xl transition-all duration-1000",
              revealStage >= 2 ? "animate-ping opacity-20" : "opacity-0",
              isBuyRecommended ? "bg-emerald-500" : "bg-amber-500"
            )} />
            <div className={cn(
              "absolute -inset-4 rounded-[2rem] blur-xl transition-all duration-700",
              revealStage >= 2 ? "opacity-40" : "opacity-0",
              isBuyRecommended ? "bg-emerald-500" : "bg-amber-500"
            )} />
            <div className={cn(
              "relative w-24 h-24 rounded-3xl flex items-center justify-center bg-gradient-to-br border-2",
              isBuyRecommended
                ? "from-emerald-500/20 to-teal-500/20 border-emerald-500/50"
                : "from-amber-500/20 to-orange-500/20 border-amber-500/50"
            )}>
              {isBuyRecommended ? (
                <IconKey className={cn(
                  "w-12 h-12 transition-all duration-500 text-emerald-400",
                  revealStage >= 2 ? "scale-100" : "scale-0"
                )} />
              ) : (
                <IconSparkles className={cn(
                  "w-12 h-12 transition-all duration-500 text-amber-400",
                  revealStage >= 2 ? "scale-100" : "scale-0"
                )} />
              )}
            </div>
          </div>
        </div>

        {/* Confidence Ring */}
        <div className={cn(
          "flex justify-center mb-6 transition-all duration-700 delay-300",
          revealStage >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <PercentageRing
            value={confidenceConfig.value}
            size={80}
            strokeWidth={6}
            duration={1500}
            delay={revealStage >= 2 ? 500 : 10000}
            color={isBuyRecommended ? "rgb(16, 185, 129)" : "rgb(245, 158, 11)"}
          />
        </div>

        {/* Confidence Badge */}
        <div className={cn(
          "transition-all duration-500 delay-500",
          revealStage >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <div className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 border backdrop-blur-sm",
            confidenceConfig.bg,
            confidenceConfig.border
          )}>
            <IconShield className={cn("w-4 h-4", confidenceConfig.color)} />
            <span className={confidenceConfig.color}>{confidenceConfig.text}</span>
          </div>
        </div>

        {/* Main Verdict */}
        <h1 className={cn(
          "text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 tracking-tight transition-all duration-700",
          revealStage >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          {isBuyRecommended ? (
            <>
              <span className="bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Buying
              </span>{" "}
              is the right choice
            </>
          ) : (
            <>
              <span className="bg-gradient-to-r from-amber-500 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                Leasing
              </span>{" "}
              is worth exploring
            </>
          )}
        </h1>

        <p className={cn(
          "text-lg text-slate-400 max-w-xl mx-auto leading-relaxed transition-all duration-700 delay-200",
          revealStage >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          {isBuyRecommended
            ? "Based on your driving habits, ownership preferences, and budget, financing makes the most sense for you."
            : "Based on your preferences and lifestyle, leasing could offer benefits that align with your needs."}
        </p>
      </div>

      {/* Primary Reasons */}
      <div className={cn(
        "mb-10 transition-all duration-700",
        revealStage >= 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      )}>
        <Card>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                isBuyRecommended ? "bg-emerald-500/10" : "bg-amber-500/10"
              )}>
                <IconCheck className={cn("w-5 h-5", isBuyRecommended ? "text-emerald-400" : "text-amber-400")} />
              </div>
              <h3 className="font-bold text-white text-lg">Why This Recommendation</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={onBack} className="group">
              <IconArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Back</span>
            </Button>
          </div>
          <ul className="space-y-3">
            {recommendation.primaryReasons.map((reason, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-slate-300"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <span className={cn(
                  "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                  isBuyRecommended ? "bg-emerald-500" : "bg-amber-500"
                )} />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* BUY RECOMMENDATION: Show Finance Details */}
      {isBuyRecommended && (
        <>
          {/* Finance Calculation Card */}
          <div className={cn(
            "mb-10 transition-all duration-700",
            revealStage >= 5 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            <Card className="ring-glow-emerald border-emerald-500/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                  <IconKey className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Your Finance Details</h3>
                  <p className="text-xs text-slate-500">
                    {preferences.financeTerm === "explore" ? 72 : preferences.financeTerm} month term at 7.5% APR
                  </p>
                </div>
                <Badge variant="success" size="sm" icon={<IconCheck className="w-3 h-3" />} className="ml-auto">
                  Recommended
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Monthly Payment</div>
                  <div className="text-3xl font-bold text-white">
                    {revealStage >= 5 ? (
                      <AnimatedCounter
                        value={financeCalculation.monthlyPayment}
                        prefix="$"
                        duration={1500}
                      />
                    ) : (
                      "$0"
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Principal + Interest</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Monthly All-In</div>
                  <div className="text-3xl font-bold text-emerald-400">
                    {revealStage >= 5 ? (
                      <AnimatedCounter
                        value={financeCalculation.monthlyAllIn}
                        prefix="$"
                        duration={1500}
                        delay={200}
                      />
                    ) : (
                      "$0"
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Inc. insurance & maintenance</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between py-3 border-b border-slate-700/30">
                  <span className="text-slate-400">Vehicle Price</span>
                  <span className="font-semibold text-white">${formatNumber(preferences.vehiclePrice)}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-700/30">
                  <span className="text-slate-400">Down Payment</span>
                  <span className="font-semibold text-white">${formatNumber(preferences.downPayment)}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-700/30">
                  <span className="text-slate-400">Amount Financed</span>
                  <span className="font-semibold text-white">${formatNumber(financeCalculation.loanAmount)}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-700/30">
                  <span className="text-slate-400">Total Interest</span>
                  <span className="font-semibold text-amber-400">${formatNumber(financeCalculation.totalInterest)}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-slate-400">Payoff Date</span>
                  <span className="font-semibold text-emerald-400">{financeCalculation.payoffDate}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Budget Analysis */}
          <div className={cn(
            "mb-10 transition-all duration-700",
            revealStage >= 5 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            <Card>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <IconTrendingUp className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="font-bold text-white text-lg">Budget Analysis</h3>
                <div className={cn("ml-auto px-3 py-1 rounded-full text-xs font-medium", affordabilityColors.bg, affordabilityColors.text)}>
                  {affordabilityColors.label}
                </div>
              </div>

              <div className="mb-6">
                <StressMeter score={budgetAnalysis.stressScore} label="Financial Stress Score" size="lg" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/30 text-center">
                  <div className="text-2xl font-bold text-white">
                    {budgetAnalysis.paymentAsPercentOfIncome}%
                  </div>
                  <div className="text-xs text-slate-500">of Income</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/30 text-center">
                  <div className="text-2xl font-bold text-cyan-400">
                    {budgetAnalysis.monthsOfSavingsBuffer}
                  </div>
                  <div className="text-xs text-slate-500">Months Buffer</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/30 text-center sm:col-span-1 col-span-2">
                  <div className="text-2xl font-bold text-emerald-400">
                    ${formatNumber(budgetAnalysis.discretionaryIncome - financeCalculation.monthlyAllIn)}
                  </div>
                  <div className="text-xs text-slate-500">Left Over Monthly</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Payment Timeline */}
          <div className={cn(
            "mb-10 transition-all duration-700",
            revealStage >= 6 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            <PaymentTimeline
              termMonths={preferences.financeTerm === "explore" ? 72 : preferences.financeTerm}
              ownershipMonths={preferences.financeTerm === "explore" ? 72 : preferences.financeTerm}
              buyMonthly={financeCalculation.monthlyAllIn}
              leaseMonthly={0}
              buyTotal={financeCalculation.totalCost}
              leaseTotal={0}
              downPayment={preferences.downPayment}
              vehiclePrice={preferences.vehiclePrice}
              verdict="buy"
            />
          </div>

          {/* Still Curious About Leasing? */}
          <div className={cn(
            "mb-10 transition-all duration-700",
            revealStage >= 6 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            <Card className="border-amber-500/20 bg-amber-500/5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <IconSparkles className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Still curious about leasing?</h4>
                    <p className="text-sm text-slate-400">
                      Our specialists can show you lease options for comparison.
                    </p>
                  </div>
                </div>
                <Button variant="secondary" size="sm" className="group">
                  Explore Lease Options
                  <IconArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Protection Packages */}
          <div className={cn(
            "mb-10 transition-all duration-700",
            revealStage >= 6 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            <ProtectionPackages
              verdict="buy"
              termMonths={preferences.financeTerm === "explore" ? 72 : preferences.financeTerm}
              baseTotal={financeCalculation.totalCost}
              baseMonthly={financeCalculation.monthlyAllIn}
            />
          </div>
        </>
      )}

      {/* LEASE EXPLORATION: Show Benefits + Lead Capture */}
      {!isBuyRecommended && (
        <>
          {/* Lease Explorer Component */}
          <div className={cn(
            "mb-10 transition-all duration-700",
            revealStage >= 5 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            <LeaseExplorer
              vehiclePrice={preferences.vehiclePrice}
              annualMiles={preferences.annualMiles}
              onLeadCapture={handleLeaseLeadCapture}
            />
          </div>

          {/* Finance Comparison (for reference) */}
          <div className={cn(
            "mb-10 transition-all duration-700",
            revealStage >= 6 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            <Card className="border-slate-700/50">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center">
                  <IconKey className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">For Comparison: Finance Option</h3>
                  <p className="text-xs text-slate-500">If you decide buying is better for you</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
                  <div className="text-xs text-slate-500 mb-1">Monthly Payment</div>
                  <div className="text-xl font-bold text-white">
                    ${formatNumber(financeCalculation.monthlyPayment)}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
                  <div className="text-xs text-slate-500 mb-1">Monthly All-In</div>
                  <div className="text-xl font-bold text-slate-300">
                    ${formatNumber(financeCalculation.monthlyAllIn)}
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-500">
                Based on ${formatNumber(preferences.vehiclePrice)} vehicle, ${formatNumber(preferences.downPayment)} down,{" "}
                {preferences.financeTerm === "explore" ? 72 : preferences.financeTerm} months at 7.5% APR.
              </p>
            </Card>
          </div>
        </>
      )}

      {/* Considerations */}
      {recommendation.considerations.length > 0 && (
        <div className={cn(
          "mb-10 transition-all duration-700",
          revealStage >= 6 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          <Card className="border-amber-500/20 bg-amber-500/5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <IconAlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="font-bold text-white text-lg">Things to Consider</h3>
            </div>
            <ul className="space-y-3">
              {recommendation.considerations.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {/* Lead Capture */}
      <div className={cn(
        "mb-10 transition-all duration-700",
        revealStage >= 6 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}>
        <LeadCapture
          verdict={isBuyRecommended ? "buy" : "lease"}
          vehiclePrice={preferences.vehiclePrice}
          monthlyPayment={financeCalculation.monthlyPayment}
        />
      </div>

      <Divider className="my-8" />

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Button variant="secondary" onClick={onStartOver} className="group">
          <IconRefresh className="w-4 h-4 transition-transform duration-300 group-hover:-rotate-180" />
          Start Over
        </Button>
      </div>

      {/* Disclaimer */}
      <p className="text-center text-xs text-slate-500 mt-8 max-w-lg mx-auto leading-relaxed">
        This analysis is for educational purposes only and is not financial, legal, or tax advice.
        Actual payments may vary based on credit approval and current rates. Always consult with
        qualified professionals before making major financial decisions.
      </p>
    </div>
  );
}
