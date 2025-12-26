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
  const [revealed, setRevealed] = useState(false);
  const [explain, setExplain] = useState<ExplainState>({ status: "idle" });

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const fetchExplanation = async (verbosity: "short" | "detailed") => {
    setExplain({ status: "loading" });

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result, buy, lease, verbosity }),
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

  const isBuy = result.verdict === "buy";
  const verdictGradient = isBuy
    ? "from-emerald-500 via-emerald-400 to-teal-400"
    : "from-amber-500 via-amber-400 to-orange-400";
  const verdictBgGlow = isBuy ? "bg-emerald-500/20" : "bg-amber-500/20";
  const verdictText = isBuy ? "text-emerald-400" : "text-amber-400";
  const verdictBorder = isBuy ? "border-emerald-500/30" : "border-amber-500/30";

  const monthlyDiff = Math.abs(result.buyMonthlyAllIn - result.leaseMonthlyAllIn);
  const totalDiff = Math.abs(result.buyTotalCost - result.leaseTotalCost);
  const buyIsCheaper = result.buyTotalCost <= result.leaseTotalCost;

  const confidenceConfig = {
    high: { text: "High Confidence", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    medium: { text: "Moderate Confidence", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    low: { text: "Low Confidence", color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20" },
  }[result.confidence];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Verdict Hero */}
      <div
        className={cn(
          "text-center mb-12 transition-all duration-700 ease-out",
          revealed ? "opacity-100 scale-100" : "opacity-0 scale-90"
        )}
      >
        {/* Trophy Icon */}
        <div className="flex justify-center mb-6">
          <div className={cn(
            "relative w-20 h-20 rounded-3xl flex items-center justify-center",
            verdictBgGlow,
            "animate-celebrate"
          )}>
            <div className={cn("absolute inset-0 rounded-3xl blur-xl", verdictBgGlow)} />
            <IconTrophy className={cn("relative w-10 h-10", verdictText)} />
          </div>
        </div>

        {/* Confidence Badge */}
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

        {/* Main Verdict */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 tracking-tight">
          <span className={cn("bg-gradient-to-r bg-clip-text text-transparent", verdictGradient)}>
            {isBuy ? "Buying" : "Leasing"}
          </span>{" "}
          is safer for you
        </h1>

        <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
          {result.summary}
        </p>
      </div>

      {/* Comparison Cards */}
      <div
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-10",
          "transition-all duration-700 delay-200 ease-out",
          revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}
      >
        {/* Buy Card */}
        <div className={cn(
          "relative group",
          isBuy && "ring-glow-emerald rounded-2xl"
        )}>
          <Card 
            className={cn(
              "relative overflow-hidden h-full",
              isBuy && "border-emerald-500/30"
            )}
          >
            {/* Recommended Badge */}
            {isBuy && (
              <div className="absolute top-4 right-4">
                <Badge variant="success" size="sm" icon={<IconCheck className="w-3 h-3" />}>
                  Recommended
                </Badge>
              </div>
            )}
            
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                <IconKey className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Buy</h3>
                <p className="text-xs text-slate-500">Own the vehicle</p>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                  Monthly all-in
                </div>
                <div className="text-3xl font-bold text-white">
                  {formatCurrency(result.buyMonthlyAllIn)}
                </div>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-slate-700/30">
                <span className="text-sm text-slate-400">Total cost ({buy.ownershipMonths}mo)</span>
                <span className="text-lg font-semibold text-slate-200">
                  {formatCurrency(result.buyTotalCost)}
                </span>
              </div>
            </div>

            {/* Stress Meter */}
            <div className="mt-5 pt-5 border-t border-slate-700/30">
              <StressMeter score={result.buyStressScore} label="Financial Stress" size="sm" />
            </div>
          </Card>
        </div>

        {/* Lease Card */}
        <div className={cn(
          "relative group",
          !isBuy && "ring-glow-amber rounded-2xl"
        )}>
          <Card 
            className={cn(
              "relative overflow-hidden h-full",
              !isBuy && "border-amber-500/30"
            )}
          >
            {/* Recommended Badge */}
            {!isBuy && (
              <div className="absolute top-4 right-4">
                <Badge variant="warning" size="sm" icon={<IconCheck className="w-3 h-3" />}>
                  Recommended
                </Badge>
              </div>
            )}
            
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                <IconFileText className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Lease</h3>
                <p className="text-xs text-slate-500">Rent with options</p>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                  Monthly all-in
                </div>
                <div className="text-3xl font-bold text-white">
                  {formatCurrency(result.leaseMonthlyAllIn)}
                </div>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-slate-700/30">
                <span className="text-sm text-slate-400">Total cost ({buy.ownershipMonths}mo)</span>
                <span className="text-lg font-semibold text-slate-200">
                  {formatCurrency(result.leaseTotalCost)}
                </span>
              </div>
            </div>

            {/* Stress Meter */}
            <div className="mt-5 pt-5 border-t border-slate-700/30">
              <StressMeter score={result.leaseStressScore} label="Financial Stress" size="sm" />
            </div>
          </Card>
        </div>
      </div>

      {/* Key Insights */}
      <div
        className={cn(
          "space-y-6 transition-all duration-700 delay-400 ease-out",
          revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}
      >
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
                <span className="font-bold text-white text-lg">{formatCurrency(monthlyDiff)}</span>
                <span className="text-slate-500 text-sm ml-2">
                  more to {result.buyMonthlyAllIn > result.leaseMonthlyAllIn ? "buy" : "lease"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between py-4 border-b border-slate-700/30">
              <span className="text-slate-400">Total over {buy.ownershipMonths} months</span>
              <div className="text-right">
                <span className="font-bold text-white text-lg">{formatCurrency(totalDiff)}</span>
                <span className="text-slate-500 text-sm ml-2">
                  {buyIsCheaper ? "savings to buy" : "savings to lease"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between py-4">
              <span className="text-slate-400">Stress score difference</span>
              <div className="text-right">
                <span className="font-bold text-white text-lg">
                  {Math.abs(result.buyStressScore - result.leaseStressScore).toFixed(0)} points
                </span>
                <span className="text-slate-500 text-sm ml-2">
                  lower for {result.buyStressScore < result.leaseStressScore ? "buying" : "leasing"}
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
          verdict={result.verdict}
          termMonths={buy.ownershipMonths}
          baseTotal={isBuy ? result.buyTotalCost : result.leaseTotalCost}
          baseMonthly={isBuy ? result.buyMonthlyAllIn : result.leaseMonthlyAllIn}
        />

        {/* Lead Capture */}
        <LeadCapture
          verdict={result.verdict}
          vehiclePrice={buy.vehiclePrice}
          monthlyPayment={isBuy ? result.buyMonthlyAllIn : result.leaseMonthlyAllIn}
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExplain({ status: "idle" })}
              >
                Try Again
              </Button>
            </div>
          )}

          {explain.status === "success" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                <h4 className="text-lg font-semibold text-white mb-3">
                  {explain.headline}
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  {explain.explanation}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExplain({ status: "idle" })}
              >
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
