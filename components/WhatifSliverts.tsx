"use client";

import { useState, useEffect, useCallback } from "react";
import { cn, formatNumber } from "@/lib/utils";
import { Card, Button } from "@/components/ui";
import {
  IconDollar,
  IconCalendar,
  IconTrendingUp,
  IconRefresh,
  IconSparkles,
  IconArrowRight,
  IconArrowLeft,
} from "@/components/icons";

interface WhatIfSlidersProps {
  initialVehiclePrice: number;
  initialDownPayment: number;
  initialTermMonths: number;
  initialApr: number;
  onRecalculate: (params: {
    vehiclePrice: number;
    downPayment: number;
    termMonths: number;
    apr: number;
  }) => void;
  isCalculating?: boolean;
  buyMonthly: number;
  leaseMonthly: number;
  buyTotal: number;
  leaseTotal: number;
}

interface SliderConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  min: number;
  max: number;
  step: number;
  value: number;
  format: (val: number) => string;
  gradientFrom: string;
  gradientTo: string;
}

export function WhatIfSliders({
  initialVehiclePrice,
  initialDownPayment,
  initialTermMonths,
  initialApr,
  onRecalculate,
  isCalculating = false,
  buyMonthly,
  leaseMonthly,
  buyTotal,
  leaseTotal,
}: WhatIfSlidersProps) {
  const [vehiclePrice, setVehiclePrice] = useState(initialVehiclePrice);
  const [downPayment, setDownPayment] = useState(initialDownPayment);
  const [termMonths, setTermMonths] = useState(initialTermMonths);
  const [apr, setApr] = useState(initialApr);
  const [hasChanges, setHasChanges] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Track if values have changed from initial
  useEffect(() => {
    const changed =
      vehiclePrice !== initialVehiclePrice ||
      downPayment !== initialDownPayment ||
      termMonths !== initialTermMonths ||
      apr !== initialApr;
    setHasChanges(changed);
  }, [vehiclePrice, downPayment, termMonths, apr, initialVehiclePrice, initialDownPayment, initialTermMonths, initialApr]);

  // Auto-recalculate on change (debounced)
  useEffect(() => {
    if (!hasChanges) return;
    
    const timer = setTimeout(() => {
      onRecalculate({ vehiclePrice, downPayment, termMonths, apr });
    }, 300);

    return () => clearTimeout(timer);
  }, [vehiclePrice, downPayment, termMonths, apr, hasChanges, onRecalculate]);

  const resetToInitial = () => {
    setVehiclePrice(initialVehiclePrice);
    setDownPayment(initialDownPayment);
    setTermMonths(initialTermMonths);
    setApr(initialApr);
  };

  // Calculate differences from initial
  const priceDiff = vehiclePrice - initialVehiclePrice;
  const downDiff = downPayment - initialDownPayment;
  const termDiff = termMonths - initialTermMonths;
  const aprDiff = apr - initialApr;

  const sliders: SliderConfig[] = [
    {
      id: "price",
      label: "Vehicle Price",
      icon: IconDollar,
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/10",
      min: Math.max(10000, initialVehiclePrice - 20000),
      max: initialVehiclePrice + 30000,
      step: 1000,
      value: vehiclePrice,
      format: (val) => `$${formatNumber(val)}`,
      gradientFrom: "from-emerald-500",
      gradientTo: "to-teal-500",
    },
    {
      id: "down",
      label: "Down Payment",
      icon: IconDollar,
      iconColor: "text-amber-400",
      iconBg: "bg-amber-500/10",
      min: 0,
      max: Math.min(vehiclePrice * 0.5, 50000),
      step: 500,
      value: downPayment,
      format: (val) => `$${formatNumber(val)}`,
      gradientFrom: "from-amber-500",
      gradientTo: "to-orange-500",
    },
    {
      id: "term",
      label: "Loan Term",
      icon: IconCalendar,
      iconColor: "text-cyan-400",
      iconBg: "bg-cyan-500/10",
      min: 36,
      max: 84,
      step: 12,
      value: termMonths,
      format: (val) => `${val} months`,
      gradientFrom: "from-cyan-500",
      gradientTo: "to-blue-500",
    },
    {
      id: "apr",
      label: "Interest Rate (APR)",
      icon: IconTrendingUp,
      iconColor: "text-purple-400",
      iconBg: "bg-purple-500/10",
      min: 0,
      max: 15,
      step: 0.25,
      value: apr,
      format: (val) => `${val.toFixed(2)}%`,
      gradientFrom: "from-purple-500",
      gradientTo: "to-pink-500",
    },
  ];

  const handleSliderChange = (id: string, value: number) => {
    switch (id) {
      case "price":
        setVehiclePrice(value);
        // Adjust down payment if it exceeds new price
        if (downPayment > value * 0.5) {
          setDownPayment(Math.round(value * 0.1));
        }
        break;
      case "down":
        setDownPayment(value);
        break;
      case "term":
        setTermMonths(value);
        break;
      case "apr":
        setApr(value);
        break;
    }
  };

  const getDiffDisplay = (id: string) => {
    switch (id) {
      case "price":
        return priceDiff !== 0 ? (
          <span className={cn("text-xs font-medium", priceDiff > 0 ? "text-red-400" : "text-emerald-400")}>
            {priceDiff > 0 ? "+" : ""}{formatNumber(priceDiff)}
          </span>
        ) : null;
      case "down":
        return downDiff !== 0 ? (
          <span className={cn("text-xs font-medium", downDiff > 0 ? "text-emerald-400" : "text-red-400")}>
            {downDiff > 0 ? "+" : ""}{formatNumber(downDiff)}
          </span>
        ) : null;
      case "term":
        return termDiff !== 0 ? (
          <span className={cn("text-xs font-medium", termDiff > 0 ? "text-amber-400" : "text-emerald-400")}>
            {termDiff > 0 ? "+" : ""}{termDiff} mo
          </span>
        ) : null;
      case "apr":
        return aprDiff !== 0 ? (
          <span className={cn("text-xs font-medium", aprDiff > 0 ? "text-red-400" : "text-emerald-400")}>
            {aprDiff > 0 ? "+" : ""}{aprDiff.toFixed(2)}%
          </span>
        ) : null;
      default:
        return null;
    }
  };

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-800/30 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl blur-lg opacity-40" />
            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center border border-violet-500/30">
              <IconSparkles className="w-6 h-6 text-violet-400" />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              What If Calculator
              {hasChanges && (
                <span className="px-2 py-0.5 text-xs font-medium bg-violet-500/20 text-violet-400 rounded-full">
                  Modified
                </span>
              )}
            </h3>
            <p className="text-sm text-slate-400">Adjust values to see how they affect your decision</p>
          </div>
        </div>
        <div className={cn(
          "w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center transition-transform duration-300",
          isExpanded && "rotate-90"
        )}>
          <IconArrowRight className="w-4 h-4 text-slate-400" />
        </div>
      </button>

      {/* Expandable Content */}
      <div className={cn(
        "overflow-hidden transition-all duration-500 ease-in-out",
        isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="px-6 pb-6 space-y-6">
          {/* Live Comparison Preview */}
          <div className="grid grid-cols-2 gap-4">
            <div className={cn(
              "p-4 rounded-xl transition-all duration-300",
              "bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20",
              isCalculating && "animate-pulse"
            )}>
              <div className="text-xs text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                Buy Monthly
                {hasChanges && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
              </div>
              <div className="text-2xl font-bold text-white">
                ${formatNumber(Math.round(buyMonthly))}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Total: ${formatNumber(Math.round(buyTotal))}
              </div>
            </div>
            
            <div className={cn(
              "p-4 rounded-xl transition-all duration-300",
              "bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20",
              isCalculating && "animate-pulse"
            )}>
              <div className="text-xs text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                Lease Monthly
                {hasChanges && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
              </div>
              <div className="text-2xl font-bold text-white">
                ${formatNumber(Math.round(leaseMonthly))}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Total: ${formatNumber(Math.round(leaseTotal))}
              </div>
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-6">
            {sliders.map((slider) => (
              <div key={slider.id} className="space-y-3">
                {/* Label Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", slider.iconBg)}>
                      <slider.icon className={cn("w-4 h-4", slider.iconColor)} />
                    </div>
                    <span className="text-sm font-medium text-slate-300">{slider.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {getDiffDisplay(slider.id)}
                    <span className="text-lg font-bold text-white min-w-[100px] text-right">
                      {slider.format(slider.value)}
                    </span>
                  </div>
                </div>

                {/* Slider Track */}
                <div className="relative h-10 flex items-center">
                  {/* Background Track */}
                  <div className="absolute inset-x-0 h-2 bg-slate-800 rounded-full overflow-hidden">
                    {/* Filled Track */}
                    <div
                      className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-150", slider.gradientFrom, slider.gradientTo)}
                      style={{
                        width: `${((slider.value - slider.min) / (slider.max - slider.min)) * 100}%`,
                      }}
                    />
                  </div>

                  {/* Input Range */}
                  <input
                    type="range"
                    min={slider.min}
                    max={slider.max}
                    step={slider.step}
                    value={slider.value}
                    onChange={(e) => handleSliderChange(slider.id, parseFloat(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />

                  {/* Custom Thumb */}
                  <div
                    className={cn(
                      "absolute w-6 h-6 rounded-full bg-white shadow-lg transition-all duration-150 pointer-events-none",
                      "ring-4",
                      slider.id === "price" && "ring-emerald-500/30",
                      slider.id === "down" && "ring-amber-500/30",
                      slider.id === "term" && "ring-cyan-500/30",
                      slider.id === "apr" && "ring-purple-500/30"
                    )}
                    style={{
                      left: `calc(${((slider.value - slider.min) / (slider.max - slider.min)) * 100}% - 12px)`,
                    }}
                  >
                    <div className={cn(
                      "absolute inset-1 rounded-full bg-gradient-to-br",
                      slider.gradientFrom,
                      slider.gradientTo
                    )} />
                  </div>
                </div>

                {/* Min/Max Labels */}
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{slider.format(slider.min)}</span>
                  <span>{slider.format(slider.max)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Adjustments */}
          <div className="pt-4 border-t border-slate-700/50">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Quick Adjustments</p>
            <div className="flex flex-wrap gap-2">
              <QuickButton
                label="+$2K Down"
                onClick={() => setDownPayment(Math.min(downPayment + 2000, vehiclePrice * 0.5))}
                color="amber"
              />
              <QuickButton
                label="+$5K Down"
                onClick={() => setDownPayment(Math.min(downPayment + 5000, vehiclePrice * 0.5))}
                color="amber"
              />
              <QuickButton
                label="60mo Term"
                onClick={() => setTermMonths(60)}
                color="cyan"
              />
              <QuickButton
                label="72mo Term"
                onClick={() => setTermMonths(72)}
                color="cyan"
              />
              <QuickButton
                label="5% APR"
                onClick={() => setApr(5)}
                color="purple"
              />
              <QuickButton
                label="7% APR"
                onClick={() => setApr(7)}
                color="purple"
              />
            </div>
          </div>

          {/* Reset Button */}
          {hasChanges && (
            <div className="flex justify-center pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetToInitial}
                className="group"
              >
                <IconRefresh className="w-4 h-4 transition-transform duration-300 group-hover:-rotate-180" />
                Reset to Original Values
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function QuickButton({
  label,
  onClick,
  color,
}: {
  label: string;
  onClick: () => void;
  color: "emerald" | "amber" | "cyan" | "purple";
}) {
  const colorClasses = {
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/40",
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20 hover:border-cyan-500/40",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/40",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200",
        colorClasses[color]
      )}
    >
      {label}
    </button>
  );
}

// Compact inline slider for simple adjustments
export function InlineSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
  color = "emerald",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  format: (val: number) => string;
  color?: "emerald" | "amber" | "cyan" | "purple";
}) {
  const colorClasses = {
    emerald: { gradient: "from-emerald-500 to-teal-500", ring: "ring-emerald-500/30" },
    amber: { gradient: "from-amber-500 to-orange-500", ring: "ring-amber-500/30" },
    cyan: { gradient: "from-cyan-500 to-blue-500", ring: "ring-cyan-500/30" },
    purple: { gradient: "from-purple-500 to-pink-500", ring: "ring-purple-500/30" },
  };

  const colors = colorClasses[color];
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">{label}</span>
        <span className="text-sm font-semibold text-white">{format(value)}</span>
      </div>
      <div className="relative h-8 flex items-center">
        <div className="absolute inset-x-0 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-150", colors.gradient)}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div
          className={cn(
            "absolute w-4 h-4 rounded-full bg-white shadow-md transition-all duration-150 pointer-events-none ring-2",
            colors.ring
          )}
          style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>
    </div>
  );
}
