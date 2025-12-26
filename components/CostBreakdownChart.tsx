"use client";

import { useState, useEffect } from "react";
import { cn, formatNumber } from "@/lib/utils";
import { Card } from "@/components/ui";
import {
  IconDollar,
  IconShield,
  IconWrench,
  IconTrendingUp,
  IconCar,
} from "@/components/icons";

interface CostCategory {
  id: string;
  label: string;
  amount: number;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface CostBreakdownChartProps {
  buyMonthly: number;
  leaseMonthly: number;
  termMonths: number;
  ownershipMonths: number;
  downPayment: number;
  insurance: number;
  maintenance: number;
  verdict: "buy" | "lease";
}

export function CostBreakdownChart({
  buyMonthly,
  leaseMonthly,
  termMonths,
  ownershipMonths,
  downPayment,
  insurance = 180,
  maintenance = 75,
  verdict,
}: CostBreakdownChartProps) {
  const [animationProgress, setAnimationProgress] = useState(0);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<"buy" | "lease">(verdict);

  // Animate on mount
  useEffect(() => {
    const duration = 1500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimationProgress(eased);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [selectedView]);

  // Calculate cost breakdowns
  const monthlyPayment = selectedView === "buy" 
    ? buyMonthly - insurance - maintenance 
    : leaseMonthly - insurance - maintenance;

  const buyCategories: CostCategory[] = [
    {
      id: "payment",
      label: "Loan Payment",
      amount: Math.round(monthlyPayment * ownershipMonths),
      color: "#10B981", // emerald
      icon: IconDollar,
    },
    {
      id: "down",
      label: "Down Payment",
      amount: downPayment,
      color: "#14B8A6", // teal
      icon: IconCar,
    },
    {
      id: "insurance",
      label: "Insurance",
      amount: Math.round(insurance * ownershipMonths),
      color: "#06B6D4", // cyan
      icon: IconShield,
    },
    {
      id: "maintenance",
      label: "Maintenance",
      amount: Math.round(maintenance * ownershipMonths),
      color: "#8B5CF6", // purple
      icon: IconWrench,
    },
  ];

  const leaseCategories: CostCategory[] = [
    {
      id: "payment",
      label: "Lease Payment",
      amount: Math.round(monthlyPayment * ownershipMonths),
      color: "#F59E0B", // amber
      icon: IconDollar,
    },
    {
      id: "down",
      label: "Due at Signing",
      amount: downPayment,
      color: "#F97316", // orange
      icon: IconCar,
    },
    {
      id: "insurance",
      label: "Insurance",
      amount: Math.round(insurance * ownershipMonths),
      color: "#06B6D4", // cyan
      icon: IconShield,
    },
    {
      id: "maintenance",
      label: "Maintenance",
      amount: Math.round((maintenance * 0.5) * ownershipMonths), // Lease typically less maintenance
      color: "#8B5CF6", // purple
      icon: IconWrench,
    },
  ];

  const categories = selectedView === "buy" ? buyCategories : leaseCategories;
  const totalCost = categories.reduce((sum, cat) => sum + cat.amount, 0);

  // Calculate SVG donut chart values
  const size = 200;
  const strokeWidth = 32;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;
  const segments = categories.map((cat) => {
    const percentage = cat.amount / totalCost;
    const length = percentage * circumference * animationProgress;
    const offset = currentOffset;
    currentOffset += percentage * circumference;

    return {
      ...cat,
      percentage,
      length,
      offset,
    };
  });

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={cn(
              "absolute inset-0 rounded-xl blur-lg opacity-40",
              selectedView === "buy" ? "bg-emerald-500" : "bg-amber-500"
            )} />
            <div className={cn(
              "relative w-12 h-12 rounded-xl flex items-center justify-center border",
              selectedView === "buy" 
                ? "bg-emerald-500/20 border-emerald-500/30" 
                : "bg-amber-500/20 border-amber-500/30"
            )}>
              <IconDollar className={cn(
                "w-6 h-6",
                selectedView === "buy" ? "text-emerald-400" : "text-amber-400"
              )} />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Where Your Money Goes</h3>
            <p className="text-sm text-slate-400">
              Total cost breakdown over {ownershipMonths} months
            </p>
          </div>
        </div>

        {/* Toggle */}
        <div className="flex bg-slate-800/50 rounded-xl p-1">
          <button
            onClick={() => setSelectedView("buy")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
              selectedView === "buy"
                ? "bg-emerald-500/20 text-emerald-400"
                : "text-slate-400 hover:text-white"
            )}
          >
            Buy
          </button>
          <button
            onClick={() => setSelectedView("lease")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
              selectedView === "lease"
                ? "bg-amber-500/20 text-amber-400"
                : "text-slate-400 hover:text-white"
            )}
          >
            Lease
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Donut Chart */}
        <div className="relative">
          <svg width={size} height={size} className="-rotate-90">
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="rgb(30, 41, 59)"
              strokeWidth={strokeWidth}
            />

            {/* Segments */}
            {segments.map((segment, index) => (
              <circle
                key={segment.id}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${segment.length} ${circumference}`}
                strokeDashoffset={-segment.offset}
                strokeLinecap="round"
                className={cn(
                  "transition-all duration-300 cursor-pointer",
                  hoveredSegment === segment.id && "opacity-100",
                hoveredSegment !== null && hoveredSegment !== segment.id && "opacity-40"  
                )}
                style={{
                  filter: hoveredSegment === segment.id ? `drop-shadow(0 0 8px ${segment.color})` : undefined,
                }}
                onMouseEnter={() => setHoveredSegment(segment.id)}
                onMouseLeave={() => setHoveredSegment(null)}
              />
            ))}
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {hoveredSegment ? (
              <>
                <div className="text-2xl font-bold text-white">
                  ${formatNumber(segments.find(s => s.id === hoveredSegment)?.amount || 0)}
                </div>
                <div className="text-xs text-slate-400">
                  {segments.find(s => s.id === hoveredSegment)?.label}
                </div>
              </>
            ) : (
              <>
                <div className="text-3xl font-bold text-white">
                  ${formatNumber(Math.round(totalCost))}
                </div>
                <div className="text-xs text-slate-400">Total Cost</div>
              </>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-3 w-full lg:w-auto">
          {segments.map((segment) => (
            <div
              key={segment.id}
              className={cn(
                "flex items-center gap-4 p-3 rounded-xl transition-all duration-300 cursor-pointer",
                "hover:bg-slate-800/50",
                hoveredSegment === segment.id && "bg-slate-800/50 ring-1 ring-slate-700"
              )}
              onMouseEnter={() => setHoveredSegment(segment.id)}
              onMouseLeave={() => setHoveredSegment(null)}
            >
              {/* Color dot */}
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: segment.color }}
              />

              {/* Icon */}
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${segment.color}20` }}
              >
                <segment.icon className="w-4 h-4" style={{ color: segment.color }} />
              </div>

              {/* Label & Amount */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white truncate">
                    {segment.label}
                  </span>
                  <span className="text-sm font-bold text-white ml-2">
                    ${formatNumber(segment.amount)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden mr-3">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        backgroundColor: segment.color,
                        width: `${segment.percentage * 100 * animationProgress}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 w-12 text-right">
                    {Math.round(segment.percentage * 100)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="mt-8 pt-6 border-t border-slate-700/50">
        <h4 className="text-sm font-medium text-slate-400 mb-4">Monthly Breakdown</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-xs text-slate-500">{cat.label}</span>
              </div>
              <div className="text-lg font-bold text-white">
                ${formatNumber(Math.round(cat.amount / ownershipMonths))}
              </div>
              <div className="text-xs text-slate-500">/month</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
