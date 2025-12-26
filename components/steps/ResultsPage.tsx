"use client";

import { useState, useEffect } from "react";
import type { BuyScenario, LeaseScenario, DecisionResult } from "@/types";
import { cn, formatCurrency } from "@/lib/utils";
import { Button, Card, StressMeter, Badge, Divider } from "@/components/ui";
import {
  IconShield,
  IconCheck,
  IconKey,
  IconFileText,
  IconDollar,
  IconAlertTriangle,
  IconRefresh,
  Spinner,
  IconTrophy,
  IconSparkles,
} from "@/components/icons";
import { Confetti, ConfettiBurst } from "@/components/Confetti";
import { AnimatedCounter, PercentageRing } from "@/components/AnimatedCounter";
import { WhatIfSliders } from "@/components/WhatIfSliders";
import { useWhatIfCalculation } from "@/hooks/useWhatIfCalculation";
import { ProtectionPackages } from "@/components/steps/ProtectionPackages";
import { LeadCapture } from "@/components/steps/LeadCapture";

interface ResultsPageProps {
  result: DecisionResult;
  buy: BuyScenario;
  lease: LeaseScenario;
  onStartOver: () => void;
}

type ExplainState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; headline: string; explanation: string }
  | { status: "error"; message: string };

export function ResultsPage({ result, buy, lease, onStartOver }: ResultsPageProps) {
  const [revealStage, setRevealStage] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [explain, setExplain] = useState<ExplainState>({ status: "idle" });

  // What-If Calculator State
  const { result: whatIfResult, recalculate, isCalculating } = useWhatIfCalculation(
    buy,
    lease,
    result
  );

  // Use what-if results for display (allows real-time updates)
  const displayResult = {
    ...result,
    buyMonthlyAllIn: whatIfResult.buyMonthlyAllIn,
    leaseMonthlyAllIn: whatIfResult.leaseMonthlyAllIn,
    buyTotalCost: whatIfResult.buyTotalCost,
    leaseTotalCost: whatIfResult.leaseTotalCost,
    buyStressScore: whatIfResult.buyStressScore,
    leaseStressScore: whatIfResult.leaseStressScore,
    verdict: whatIfResult.verdict,
  };

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

  const fetchExplanation = async (verbosity: "short" | "detailed") => {
    setExplain({ status: "loading" });

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result: displayResult, buy, lease, verbosity }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = data?.error ?? `Request failed (${res.status})`;
        setExplain({ status: "error", message: msg });
        return;
      }

      setExplain({
        status: "success",
        headline: data.headline,
        explanation: data.explanation,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Network error";
      setExplain({ status: "error", message: msg });
    }
  };

  const isBuy = displayResult.verdict === "buy";
  const verdictGradient = isBuy
    ? "from-emerald-500 via-emerald-400 to-teal-400"
    : "from-amber-500 via-amber-400 to-orange-400";
  const verdictBgGlow = isBuy ? "bg-emerald-500" : "bg-amber-500";
  const verdictText = isBuy ? "text-emerald-400" : "text-amber-400";

  const monthlyDiff = Math.abs(displayResult.buyMonthlyAllIn - displayResult.leaseMonthlyAllIn);
  const totalDiff = Math.abs(displayResult.buyTotalCost - displayResult.leaseTotalCost);
  const buyIsCheaper = displayResult.buyTotalCost <= displayResult.leaseTotalCost;

  const confidenceConfig = {
    high: { text: "High Confidence", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", value: 95 },
    medium: { text: "Moderate Confidence", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", value: 70 },
    low: { text: "Low Confidence", color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20", value: 45 },
  }[displayResult.confidence];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Confetti */}
      <Confetti active={showConfetti} pieceCount={150} duration={5000} />

      {/* Verdict Hero */}
      <div className="text-center mb-12 relative">
        <div className={cn(
          "transition-all duration-700",
          revealStage >= 3 ? "opacity-100" : "opacity-0"
        )}>
          <ConfettiBurst active={revealStage >= 3} />
        </div>

        {/* Trophy Icon */}
        <div className={cn(
          "flex justify-center mb-6 transition-all duration-700",
          revealStage >= 1 ? "opacity-100 scale-100" : "opacity-0 scale-50"
        )}>
          <div className="relative">
            <div className={cn(
              "absolute inset-0 rounded-3xl transition-all duration-1000",
              revealStage >= 2 ? "animate-ping opacity-20" : "opacity-0",
              verdictBgGlow
            )} />
            <div className={cn(
              "absolute -inset-4 rounded-[2rem] blur-xl transition-all duration-700",
              revealStage >= 2 ? "opacity-40" : "opacity-0",
              verdictBgGlow
            )} />
            <div className={cn(
              "relative w-24 h-24 rounded-3xl flex items-center justify-center",
              "bg-gradient-to-br",
              isBuy ? "from-emerald-500/20 to-teal-500/20" : "from-amber-500/20 to-orange-500/20",
              "border-2",
              isBuy ? "border-emerald-500/50" : "border-amber-500/50"
            )}>
              <IconTrophy className={cn(
                "w-12 h-12 transition-all duration-500",
                revealStage >= 2 ? "scale-100" : "scale-0",
                verdictText
              )} />
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
            color={isBuy ? "rgb(16, 185, 129)" : "rgb(245, 158, 11)"}
          />
        </div>

        {/* Confidence Badge */}
        <div className={cn(
          "transition-all duration-500 delay-500",
          revealStage >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <div
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6",
              confidenceConfig.bg,
              confidenceConfig.border,
              "border backdrop-blur-sm"
            )}
          >
            <IconShield className={cn("w-4 h-4", confidenceConfig.color)} />
            <span className={confidenceConfig.color}>{confidenceConfig.text}</span>
          </div>
        </div>

        {/* Main Verdict */}
        <h1 className={cn(
          "text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 tracking-tight transition-all duration-700",
          revealStage >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          <span className={cn("bg-gradient-to-r bg-clip-text text-transparent", verdictGradient)}>
            {isBuy ? "Buying" : "Leasing"}
          </span>{" "}
          is safer for you
        </h1>

        <p className={cn(
          "text-lg text-slate-400 max-w-xl mx-auto leading-relaxed transition-all duration-700 delay-200",
          revealStage >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          {result.summary}
        </p>
      </div>

      {/* Comparison Cards */}
      <div className={cn(
        "grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-10 transition-all duration-700",
        revealStage >= 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      )}>
        {/* Buy Card */}
        <div className={cn(
          "relative group transition-all duration-300",
          isBuy && "ring-glow-emerald rounded-2xl",
          isCalculating && "opacity-70"
        )}>
          <Card className={cn(
            "relative overflow-hidden h-full",
            isBuy && "border-emerald-500/30"
          )}>
            {isBuy && (
              <div className={cn(
                "absolute top-4 right-4 transition-all duration-500",
                revealStage >= 5 ? "opacity-100 scale-100" : "opacity-0 scale-0"
              )}>
                <Badge variant="success" size="sm" icon={<IconCheck className="w-3 h-3" />}>
                  Recommended
                </Badge>
              </div>
            )}
            
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                <IconKey className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Buy</h3>
                <p className="text-xs text-slate-500">Own the vehicle</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                  Monthly all-in
                </div>
                <div className={cn(
                  "text-3xl font-bold text-white transition-all duration-300",
                  isCalculating && "blur-sm"
                )}>
                  ${Math.round(displayResult.buyMonthlyAllIn).toLocaleString()}
                </div>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-slate-700/30">
                <span className="text-sm text-slate-400">Total cost ({buy.ownershipMonths}mo)</span>
                <span className={cn(
                  "text-lg font-semibold text-slate-200 transition-all duration-300",
                  isCalculating && "blur-sm"
                )}>
                  ${Math.round(displayResult.buyTotalCost).toLocaleString()}
                </span>
              </div>
            </div>

            <div className={cn(
              "mt-5 pt-5 border-t border-slate-700/30 transition-all duration-700",
              revealStage >= 5 ? "opacity-100" : "opacity-0"
            )}>
              <StressMeter 
                score={displayResult.buyStressScore} 
                label="Financial Stress" 
                size="sm" 
              />
            </div>
          </Card>
        </div>

        {/* Lease Card */}
        <div className={cn(
          "relative group transition-all duration-300",
          !isBuy && "ring-glow-amber rounded-2xl",
          isCalculating && "opacity-70"
        )}>
          <Card className={cn(
            "relative overflow-hidden h-full",
            !isBuy && "border-amber-500/30"
          )}>
            {!isBuy && (
              <div className={cn(
                "absolute top-4 right-4 transition-all duration-500",
                revealStage >= 5 ? "opacity-100 scale-100" : "opacity-0 scale-0"
              )}>
                <Badge variant="warning" size="sm" icon={<IconCheck className="w-3 h-3" />}>
                  Recommended
                </Badge>
              </div>
            )}
            
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                <IconFileText className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Lease</h3>
                <p className="text-xs text-slate-500">Rent with options</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                  Monthly all-in
                </div>
                <div className={cn(
                  "text-3xl font-bold text-white transition-all duration-300",
                  isCalculating && "blur-sm"
                )}>
                  ${Math.round(displayResult.leaseMonthlyAllIn).toLocaleString()}
                </div>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-slate-700/30">
                <span className="text-sm text-slate-400">Total cost ({buy.ownershipMonths}mo)</span>
                <span className={cn(
                  "text-lg font-semibold text-slate-200 transition-all duration-300",
                  isCalculating && "blur-sm"
                )}>
                  ${Math.round(displayResult.leaseTotalCost).toLocaleString()}
                </span>
              </div>
            </div>

            <div className={cn(
              "mt-5 pt-5 border-t border-slate-700/30 transition-all duration-700",
              revealStage >= 5 ? "opacity-100" : "opacity-0"
            )}>
              <StressMeter 
                score={displayResult.leaseStressScore} 
                label="Financial Stress" 
                size="sm" 
              />
            </div>
          </Card>
        </div>
      </div>

      {/* What-If Calculator */}
      <div className={cn(
        "mb-10 transition-all duration-700",
        revealStage >= 6 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}>
        <WhatIfSliders
          initialVehiclePrice={buy.vehiclePrice}
          initialDownPayment={buy.downPayment}
          initialTermMonths={buy.termMonths}
          initialApr={buy.aprPercent}
          onRecalculate={recalculate}
          isCalculating={isCalculating}
          buyMonthly={displayResult.buyMonthlyAllIn}
          leaseMonthly={displayResult.leaseMonthlyAllIn}
          buyTotal={displayResult.buyTotalCost}
          leaseTotal={displayResult.leaseTotalCost}
        />
      </div>

      {/* Savings Highlight */}
      <div className={cn(
        "mb-10 transition-all duration-700",
        revealStage >= 6 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}>
        <div className={cn(
          "relative p-6 rounded-2xl overflow-hidden",
          "bg-gradient-to-r",
          isBuy 
            ? "from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20" 
            : "from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20"
        )}>
          <div className={cn(
            "absolute inset-0 opacity-30",
            "bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))]",
            isBuy ? "from-emerald-500/20 via-transparent to-transparent" : "from-amber-500/20 via-transparent to-transparent"
          )} />
          
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center",
                isBuy ? "bg-emerald-500/20" : "bg-amber-500/20"
              )}>
                <IconDollar className={cn("w-8 h-8", verdictText)} />
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">
                  {isBuy ? "By buying" : "By leasing"}, you could save
                </p>
                <p className={cn("text-3xl sm:text-4xl font-bold", verdictText)}>
                  ${Math.round(totalDiff).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-sm text-slate-500">Over {buy.ownershipMonths} months</p>
              <p className="text-lg font-semibold text-slate-300">
                ${Math.round(monthlyDiff).toLocaleString()}/mo less
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rest of content */}
      <div className={cn(
        "space-y-6 transition-all duration-700",
        revealStage >= 6 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}>
        {/* Cost Breakdown */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <IconDollar className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="font-bold text-white text-lg">Cost Comparison</h3>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between py-4 border-b border-slate-700/30">
              <span className="text-slate-400">Monthly difference</span>
              <div className="text-right">
                <span className="font-bold text-white text-lg">
                  ${Math.round(monthlyDiff).toLocaleString()}
                </span>
                <span className="text-slate-500 text-sm ml-2">
                  more to {displayResult.buyMonthlyAllIn > displayResult.leaseMonthlyAllIn ? "buy" : "lease"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between py-4 border-b border-slate-700/30">
              <span className="text-slate-400">Total over {buy.ownershipMonths} months</span>
              <div className="text-right">
                <span className="font-bold text-white text-lg">
                  ${Math.round(totalDiff).toLocaleString()}
                </span>
                <span className="text-slate-500 text-sm ml-2">
                  {buyIsCheaper ? "savings to buy" : "savings to lease"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between py-4">
              <span className="text-slate-400">Stress score difference</span>
              <div className="text-right">
                <span className="font-bold text-white text-lg">
                  {Math.abs(displayResult.buyStressScore - displayResult.leaseStressScore).toFixed(0)} points
                </span>
                <span className="text-slate-500 text-sm ml-2">
                  lower for {displayResult.buyStressScore < displayResult.leaseStressScore ? "buying" : "leasing"}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Risk Flags */}
        {result.riskFlags.length > 0 && (
          <Card className="border-amber-500/20 bg-amber-500/5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <IconAlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="font-bold text-white text-lg">Things to Consider</h3>
            </div>
            <ul className="space-y-3">
              {result.riskFlags.map((flag, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Protection Packages */}
        <ProtectionPackages
          verdict={displayResult.verdict}
          termMonths={buy.ownershipMonths}
          baseTotal={isBuy ? displayResult.buyTotalCost : displayResult.leaseTotalCost}
          baseMonthly={isBuy ? displayResult.buyMonthlyAllIn : displayResult.leaseMonthlyAllIn}
        />

        {/* Lead Capture */}
        <LeadCapture
          verdict={displayResult.verdict}
          vehiclePrice={buy.vehiclePrice}
          monthlyPayment={isBuy ? displayResult.buyMonthlyAllIn : displayResult.leaseMonthlyAllIn}
        />

        {/* AI Explanation Section */}
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center">
              <IconSparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">AI Explanation</h3>
              <p className="text-xs text-slate-500">Get a personalized breakdown</p>
            </div>
          </div>

          {explain.status === "idle" && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fetchExplanation("short")}
                className="group"
              >
                <IconSparkles className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300" />
                Quick Summary
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fetchExplanation("detailed")}
                className="group"
              >
                <IconFileText className="w-4 h-4 text-teal-400 group-hover:text-teal-300" />
                Full Breakdown
              </Button>
            </div>
          )}

          {explain.status === "loading" && (
            <div className="flex items-center gap-3 py-4">
              <Spinner className="w-5 h-5 text-cyan-400" />
              <span className="text-slate-400">Generating explanation...</span>
            </div>
          )}

          {explain.status === "error" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-red-400 text-sm p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <IconAlertTriangle className="w-4 h-4" />
                {explain.message}
              </div>
              <Button variant="ghost" size="sm" onClick={() => setExplain({ status: "idle" })}>
                Try Again
              </Button>
            </div>
          )}

          {explain.status === "success" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                <h4 className="text-lg font-semibold text-white mb-3">{explain.headline}</h4>
                <p className="text-slate-300 leading-relaxed">{explain.explanation}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setExplain({ status: "idle" })}>
                <IconRefresh className="w-4 h-4" />
                Get Another Explanation
              </Button>
            </div>
          )}
        </Card>

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
          This analysis is for educational purposes only and is not financial, legal, or tax
          advice. Always consult with qualified professionals before making major financial
          decisions.
        </p>
      </div>
    </div>
  );
}
