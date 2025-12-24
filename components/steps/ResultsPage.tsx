"use client";

import { useState, useEffect } from "react";
import type { BuyScenario, LeaseScenario, DecisionResult } from "@/types";
import { cn, formatCurrency } from "@/lib/utils";
import { Button, Card, StressMeter } from "@/components/ui";
import {
  IconShield,
  IconCheck,
  IconKey,
  IconFileText,
  IconDollar,
  IconAlertTriangle,
  IconRefresh,
  Spinner,
} from "@/components/icons";
import { ProtectionPackages } from "@/components/steps/ProtectionPackages";

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
  const verdictColor = isBuy
    ? "from-emerald-500 to-teal-500"
    : "from-amber-500 to-orange-500";
  const verdictBg = isBuy ? "bg-emerald-500/10" : "bg-amber-500/10";
  const verdictText = isBuy ? "text-emerald-400" : "text-amber-400";
  const verdictRing = isBuy ? "ring-emerald-500" : "ring-amber-500";

  const monthlyDiff = Math.abs(result.buyMonthlyAllIn - result.leaseMonthlyAllIn);
  const totalDiff = Math.abs(result.buyTotalCost - result.leaseTotalCost);
  const buyIsCheaper = result.buyTotalCost <= result.leaseTotalCost;

  const confidenceLabel = {
    high: { text: "High Confidence", color: "text-emerald-400" },
    medium: { text: "Moderate Confidence", color: "text-amber-400" },
    low: { text: "Low Confidence", color: "text-slate-400" },
  }[result.confidence];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Verdict Card */}
      <div
        className={cn(
          "text-center mb-10 transition-all duration-700 ease-out",
          revealed ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}
      >
        <div
          className={cn(
            "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6",
            verdictBg,
            verdictText
          )}
        >
          <IconShield className="w-4 h-4" />
          <span className={confidenceLabel.color}>{confidenceLabel.text}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
          <span
            className={cn(
              "bg-gradient-to-r bg-clip-text text-transparent",
              verdictColor
            )}
          >
            {isBuy ? "Buying" : "Leasing"}
          </span>{" "}
          is safer for you
        </h1>

        <p className="text-lg text-slate-400 max-w-xl mx-auto">{result.summary}</p>
      </div>

      {/* Comparison Cards */}
      <div
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 transition-all duration-700 delay-200 ease-out",
          revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}
      >
        {/* Buy Card */}
        <Card className={cn("relative overflow-hidden", isBuy && `ring-2 ${verdictRing}`)}>
          {isBuy && (
            <div className="absolute top-3 right-3">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <IconCheck className="w-3 h-3" />
                Recommended
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <IconKey className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-white">Buy</h3>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                Monthly all-in
              </div>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(result.buyMonthlyAllIn)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                Total cost ({buy.ownershipMonths}mo)
              </div>
              <div className="text-xl font-semibold text-slate-300">
                {formatCurrency(result.buyTotalCost)}
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-700/50">
            <StressMeter score={result.buyStressScore} label="Financial Stress" size="sm" />
          </div>
        </Card>

        {/* Lease Card */}
        <Card className={cn("relative overflow-hidden", !isBuy && `ring-2 ${verdictRing}`)}>
          {!isBuy && (
            <div className="absolute top-3 right-3">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold">
                <IconCheck className="w-3 h-3" />
                Recommended
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <IconFileText className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="font-semibold text-white">Lease</h3>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                Monthly all-in
              </div>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(result.leaseMonthlyAllIn)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                Total cost ({buy.ownershipMonths}mo)
              </div>
              <div className="text-xl font-semibold text-slate-300">
                {formatCurrency(result.leaseTotalCost)}
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-700/50">
            <StressMeter score={result.leaseStressScore} label="Financial Stress" size="sm" />
          </div>
        </Card>
      </div>

      {/* Key Insights */}
      <div
        className={cn(
          "transition-all duration-700 delay-400 ease-out",
          revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}
      >
        <Card className="mb-8">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <IconDollar className="w-5 h-5 text-emerald-400" />
            Cost Breakdown
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
              <span className="text-slate-400">Monthly difference</span>
              <span className="font-semibold text-white">
                {formatCurrency(monthlyDiff)}{" "}
                <span className="text-slate-500 font-normal">
                  more to {result.buyMonthlyAllIn > result.leaseMonthlyAllIn ? "buy" : "lease"}
                </span>
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
              <span className="text-slate-400">Total over {buy.ownershipMonths} months</span>
              <span className="font-semibold text-white">
                {formatCurrency(totalDiff)}{" "}
                <span className="text-slate-500 font-normal">
                  {buyIsCheaper ? "savings to buy" : "savings to lease"}
                </span>
              </span>
            </div>

            <div className="flex items-center justify-between py-3">
              <span className="text-slate-400">Stress score difference</span>
              <span className="font-semibold text-white">
                {Math.abs(result.buyStressScore - result.leaseStressScore).toFixed(0)} points{" "}
                <span className="text-slate-500 font-normal">
                  lower for {result.buyStressScore < result.leaseStressScore ? "buying" : "leasing"}
                </span>
              </span>
            </div>
          </div>
        </Card>

        {/* Risk Flags */}
        {result.riskFlags.length > 0 && (
          <Card className="mb-8">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <IconAlertTriangle className="w-5 h-5 text-amber-400" />
              Things to Consider
            </h3>
            <ul className="space-y-2">
              {result.riskFlags.map((flag, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  {flag}
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

        {/* Detailed Explanation Section */}
        <Card className="mb-8">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <IconFileText className="w-5 h-5 text-teal-400" />
            Detailed Explanation
          </h3>

          {explain.status === "idle" && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fetchExplanation("short")}
              >
                Quick Summary
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fetchExplanation("detailed")}
              >
                Full Breakdown
              </Button>
            </div>
          )}

          {explain.status === "loading" && (
            <div className="flex items-center gap-3 text-slate-400">
              <Spinner className="w-5 h-5" />
              <span>Generating explanation...</span>
            </div>
          )}

          {explain.status === "error" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-red-400 text-sm">
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
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  {explain.headline}
                </h4>
                <p className="text-slate-400 leading-relaxed">
                  {explain.explanation}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExplain({ status: "idle" })}
              >
                Get Another Explanation
              </Button>
            </div>
          )}
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button variant="secondary" onClick={onStartOver}>
            <IconRefresh className="w-4 h-4" />
            Start Over
          </Button>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-slate-500 mt-8">
          This analysis is for educational purposes only and is not financial, legal, or tax
          advice. Always consult with qualified professionals before making major financial
          decisions.
        </p>
      </div>
    </div>
  );
}
