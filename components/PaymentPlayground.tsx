"use client";

import { useState, useEffect, useCallback } from "react";
import { cn, formatNumber } from "@/lib/utils";
import { Card } from "@/components/ui";
import { IconDollar, IconCalendar, IconTrendingUp, IconShield } from "@/components/icons";

interface PaymentPlaygroundProps {
  initialVehiclePrice: number;
  initialDownPayment: number;
  initialTerm: number;
  apr: number;
  monthlyIncome: number;
  monthlyExpenses: number;
}

export function PaymentPlayground({
  initialVehiclePrice,
  initialDownPayment,
  initialTerm,
  apr,
  monthlyIncome,
  monthlyExpenses,
}: PaymentPlaygroundProps) {
  const [vehiclePrice, setVehiclePrice] = useState(initialVehiclePrice);
  const [downPayment, setDownPayment] = useState(initialDownPayment);
  const [term, setTerm] = useState(initialTerm);
  const [isAnimating, setIsAnimating] = useState(false);

  // Derived calculations
  const amountFinanced = Math.max(0, vehiclePrice - downPayment);
  const monthlyRate = apr / 100 / 12;
  
  const monthlyPayment = amountFinanced > 0 && monthlyRate > 0
    ? (amountFinanced * monthlyRate * Math.pow(1 + monthlyRate, term)) / 
      (Math.pow(1 + monthlyRate, term) - 1)
    : amountFinanced / term;
  
  const totalCost = monthlyPayment * term + downPayment;
  const totalInterest = totalCost - vehiclePrice;
  
  // Budget analysis
  const discretionaryIncome = monthlyIncome - monthlyExpenses;
  const paymentToIncomeRatio = (monthlyPayment / monthlyIncome) * 100;
  const leftOverMonthly = discretionaryIncome - monthlyPayment;
  
  // Stress score (0-100, lower is better)
  const stressScore = Math.min(100, Math.max(0, 
    (paymentToIncomeRatio * 2) + 
    (leftOverMonthly < 200 ? 30 : leftOverMonthly < 500 ? 15 : 0)
  ));

  const getStressLevel = (score: number) => {
    if (score <= 30) return { label: "Comfortable", color: "text-emerald-600", bg: "bg-emerald-500", barColor: "from-emerald-400 to-emerald-600" };
    if (score <= 50) return { label: "Manageable", color: "text-cyan-600", bg: "bg-cyan-500", barColor: "from-cyan-400 to-cyan-600" };
    if (score <= 70) return { label: "Stretched", color: "text-amber-600", bg: "bg-amber-500", barColor: "from-amber-400 to-amber-600" };
    return { label: "High Stress", color: "text-red-600", bg: "bg-red-500", barColor: "from-red-400 to-red-600" };
  };

  const stressLevel = getStressLevel(stressScore);

  // Animate on value change
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [vehiclePrice, downPayment, term]);

  // Slider configurations
  const priceMin = 15000;
  const priceMax = 100000;
  const priceStep = 1000;
  
  const downMin = 0;
  const downMax = Math.min(vehiclePrice * 0.5, 50000);
  const downStep = 500;

  const terms = [48, 60, 72, 78, 84];

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
          <IconTrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">Payment Playground</h3>
          <p className="text-xs text-slate-500">Adjust the sliders to see how it affects your payment</p>
        </div>
      </div>

      {/* Live Results Display */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className={cn(
          "p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 transition-all duration-300",
          isAnimating && "scale-105"
        )}>
          <div className="text-xs text-emerald-600 font-medium mb-1">Monthly Payment</div>
          <div className="text-2xl font-bold text-emerald-700">
            ${formatNumber(Math.round(monthlyPayment))}
          </div>
        </div>
        
        <div className={cn(
          "p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 transition-all duration-300",
          isAnimating && "scale-105"
        )}>
          <div className="text-xs text-slate-600 font-medium mb-1">Total Cost</div>
          <div className="text-2xl font-bold text-slate-700">
            ${formatNumber(Math.round(totalCost))}
          </div>
        </div>
        
        <div className={cn(
          "p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 transition-all duration-300",
          isAnimating && "scale-105"
        )}>
          <div className="text-xs text-amber-600 font-medium mb-1">Total Interest</div>
          <div className="text-2xl font-bold text-amber-700">
            ${formatNumber(Math.round(totalInterest))}
          </div>
        </div>
        
        <div className={cn(
          "p-4 rounded-xl border transition-all duration-300",
          stressScore <= 30 ? "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200" :
          stressScore <= 50 ? "bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200" :
          stressScore <= 70 ? "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200" :
          "bg-gradient-to-br from-red-50 to-rose-50 border-red-200",
          isAnimating && "scale-105"
        )}>
          <div className={cn("text-xs font-medium mb-1", stressLevel.color)}>Budget Stress</div>
          <div className={cn("text-2xl font-bold", stressLevel.color)}>
            {stressLevel.label}
          </div>
        </div>
      </div>

      {/* Stress Meter */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-slate-500 mb-2">
          <span>Lower stress</span>
          <span>Higher stress</span>
        </div>
        <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
          {/* Background gradient showing zones */}
          <div className="absolute inset-0 flex">
            <div className="w-[30%] bg-gradient-to-r from-emerald-400 to-emerald-500" />
            <div className="w-[20%] bg-gradient-to-r from-cyan-400 to-cyan-500" />
            <div className="w-[20%] bg-gradient-to-r from-amber-400 to-amber-500" />
            <div className="w-[30%] bg-gradient-to-r from-red-400 to-red-500" />
          </div>
          {/* Indicator */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-slate-700 rounded-full shadow-lg transition-all duration-500 ease-out"
            style={{ left: `calc(${Math.min(100, stressScore)}% - 8px)` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
          <span>Comfortable</span>
          <span>Manageable</span>
          <span>Stretched</span>
          <span>High</span>
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-6">
        {/* Vehicle Price Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <IconCar className="w-4 h-4 text-slate-500" />
              Vehicle Price
            </label>
            <span className="text-sm font-bold text-slate-900">${formatNumber(vehiclePrice)}</span>
          </div>
          <input
            type="range"
            min={priceMin}
            max={priceMax}
            step={priceStep}
            value={vehiclePrice}
            onChange={(e) => {
              const newPrice = Number(e.target.value);
              setVehiclePrice(newPrice);
              // Adjust down payment if it exceeds new max
              if (downPayment > newPrice * 0.5) {
                setDownPayment(Math.round(newPrice * 0.1));
              }
            }}
            className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer slider-purple"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>${formatNumber(priceMin)}</span>
            <span>${formatNumber(priceMax)}</span>
          </div>
        </div>

        {/* Down Payment Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <IconDollar className="w-4 h-4 text-slate-500" />
              Down Payment
            </label>
            <div className="text-right">
              <span className="text-sm font-bold text-slate-900">${formatNumber(downPayment)}</span>
              <span className="text-xs text-slate-500 ml-1">
                ({Math.round((downPayment / vehiclePrice) * 100)}%)
              </span>
            </div>
          </div>
          <input
            type="range"
            min={downMin}
            max={downMax}
            step={downStep}
            value={downPayment}
            onChange={(e) => setDownPayment(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer slider-emerald"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>$0</span>
            <span>${formatNumber(downMax)}</span>
          </div>
        </div>

        {/* Term Selector */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <IconCalendar className="w-4 h-4 text-slate-500" />
              Loan Term
            </label>
            <span className="text-sm font-bold text-slate-900">{term} months ({(term / 12).toFixed(1)} years)</span>
          </div>
          <div className="flex gap-2">
            {terms.map((t) => (
              <button
                key={t}
                onClick={() => setTerm(t)}
                className={cn(
                  "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200",
                  term === t
                    ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {t}mo
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-slate-500 mb-1">Payment % of Income</div>
            <div className={cn(
              "text-lg font-bold",
              paymentToIncomeRatio <= 10 ? "text-emerald-600" :
              paymentToIncomeRatio <= 15 ? "text-cyan-600" :
              paymentToIncomeRatio <= 20 ? "text-amber-600" : "text-red-600"
            )}>
              {paymentToIncomeRatio.toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">Left Over Monthly</div>
            <div className={cn(
              "text-lg font-bold",
              leftOverMonthly >= 500 ? "text-emerald-600" :
              leftOverMonthly >= 200 ? "text-amber-600" : "text-red-600"
            )}>
              ${formatNumber(Math.max(0, Math.round(leftOverMonthly)))}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">Interest Rate</div>
            <div className="text-lg font-bold text-slate-700">
              {apr}%
            </div>
          </div>
        </div>
      </div>

      {/* Tip */}
      <div className="mt-6 p-3 rounded-lg bg-purple-50 border border-purple-200">
        <p className="text-xs text-purple-700">
          💡 <strong>Tip:</strong> Increasing your down payment by ${formatNumber(5000)} would save you ~${formatNumber(Math.round(5000 * (apr / 100) * (term / 24)))} in interest and lower your monthly payment by ~${formatNumber(Math.round(5000 / term * 1.1))}.
        </p>
      </div>
    </Card>
  );
}

// Icon component for car
function IconCar({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
    </svg>
  );
}
