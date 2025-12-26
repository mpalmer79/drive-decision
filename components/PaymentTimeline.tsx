"use client";

import { useState, useEffect, useRef } from "react";
import { cn, formatNumber } from "@/lib/utils";
import { Card } from "@/components/ui";
import {
  IconCheck,
  IconCar,
  IconKey,
  IconFileText,
  IconDollar,
  IconCalendar,
  IconTrendingUp,
} from "@/components/icons";

interface TimelineMilestone {
  month: number;
  label: string;
  description: string;
  type: "start" | "milestone" | "end" | "warning";
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  amount?: number;
}

interface PaymentTimelineProps {
  termMonths: number;
  ownershipMonths: number;
  buyMonthly: number;
  leaseMonthly: number;
  buyTotal: number;
  leaseTotal: number;
  downPayment: number;
  vehiclePrice: number;
  verdict: "buy" | "lease";
}

export function PaymentTimeline({
  termMonths,
  ownershipMonths,
  buyMonthly,
  leaseMonthly,
  buyTotal,
  leaseTotal,
  downPayment,
  vehiclePrice,
  verdict,
}: PaymentTimelineProps) {
  const [visibleMilestones, setVisibleMilestones] = useState(0);
  const [hoveredMilestone, setHoveredMilestone] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Calculate key milestones
  const leaseTermMonths = 36; // Standard lease
  const breakEvenMonth = Math.round((buyTotal - leaseTotal) / (leaseMonthly - buyMonthly)) || ownershipMonths;
  const equityStartMonth = Math.round(termMonths * 0.4); // When you start building meaningful equity

  const buyMilestones: TimelineMilestone[] = [
    {
      month: 0,
      label: "Purchase Day",
      description: `Down payment of $${formatNumber(downPayment)}`,
      type: "start",
      icon: IconKey,
      color: "emerald",
      amount: downPayment,
    },
    {
      month: 12,
      label: "Year 1 Complete",
      description: `$${formatNumber(Math.round(buyMonthly * 12))} paid so far`,
      type: "milestone",
      icon: IconCalendar,
      color: "cyan",
      amount: Math.round(buyMonthly * 12 + downPayment),
    },
    {
      month: equityStartMonth,
      label: "Equity Building",
      description: "You're building real ownership value",
      type: "milestone",
      icon: IconTrendingUp,
      color: "purple",
    },
    {
      month: Math.min(breakEvenMonth, ownershipMonths),
      label: "Break-Even Point",
      description: "Buying becomes cheaper than leasing",
      type: "milestone",
      icon: IconDollar,
      color: "amber",
    },
    {
      month: termMonths,
      label: "Loan Paid Off! 🎉",
      description: `You own the vehicle outright`,
      type: "end",
      icon: IconCheck,
      color: "emerald",
      amount: buyTotal,
    },
  ];

  const leaseMilestones: TimelineMilestone[] = [
    {
      month: 0,
      label: "Lease Signing",
      description: `Due at signing: $${formatNumber(downPayment)}`,
      type: "start",
      icon: IconFileText,
      color: "amber",
      amount: downPayment,
    },
    {
      month: 12,
      label: "Year 1 Complete",
      description: `$${formatNumber(Math.round(leaseMonthly * 12))} paid`,
      type: "milestone",
      icon: IconCalendar,
      color: "cyan",
      amount: Math.round(leaseMonthly * 12 + downPayment),
    },
    {
      month: 24,
      label: "Mileage Check",
      description: "Review your mileage usage",
      type: "warning",
      icon: IconCar,
      color: "orange",
    },
    {
      month: leaseTermMonths,
      label: "Lease Ends",
      description: "Return vehicle or buy out",
      type: "end",
      icon: IconFileText,
      color: "amber",
      amount: leaseTotal,
    },
  ];

  const milestones = verdict === "buy" ? buyMilestones : leaseMilestones;
  const maxMonth = Math.max(...milestones.map(m => m.month));

  // Animate milestones appearing
  useEffect(() => {
    if (!isExpanded) return;
    
    const timer = setInterval(() => {
      setVisibleMilestones(prev => {
        if (prev >= milestones.length) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 400);

    return () => clearInterval(timer);
  }, [milestones.length, isExpanded]);

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; glow: string }> = {
      emerald: {
        bg: "bg-emerald-500",
        border: "border-emerald-500",
        text: "text-emerald-400",
        glow: "shadow-emerald-500/50",
      },
      amber: {
        bg: "bg-amber-500",
        border: "border-amber-500",
        text: "text-amber-400",
        glow: "shadow-amber-500/50",
      },
      cyan: {
        bg: "bg-cyan-500",
        border: "border-cyan-500",
        text: "text-cyan-400",
        glow: "shadow-cyan-500/50",
      },
      purple: {
        bg: "bg-purple-500",
        border: "border-purple-500",
        text: "text-purple-400",
        glow: "shadow-purple-500/50",
      },
      orange: {
        bg: "bg-orange-500",
        border: "border-orange-500",
        text: "text-orange-400",
        glow: "shadow-orange-500/50",
      },
    };
    return colors[color] || colors.emerald;
  };

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={cn(
              "absolute inset-0 rounded-xl blur-lg opacity-40",
              verdict === "buy" ? "bg-emerald-500" : "bg-amber-500"
            )} />
            <div className={cn(
              "relative w-12 h-12 rounded-xl flex items-center justify-center border",
              verdict === "buy" 
                ? "bg-emerald-500/20 border-emerald-500/30" 
                : "bg-amber-500/20 border-amber-500/30"
            )}>
              <IconCalendar className={cn(
                "w-6 h-6",
                verdict === "buy" ? "text-emerald-400" : "text-amber-400"
              )} />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Your Payment Journey</h3>
            <p className="text-sm text-slate-400">
              {verdict === "buy" ? "Finance" : "Lease"} timeline over {maxMonth} months
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div ref={timelineRef} className="relative">
        {/* Progress Line Background */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-800" />
        
        {/* Animated Progress Line */}
        <div 
          className={cn(
            "absolute left-6 top-0 w-0.5 transition-all duration-1000 ease-out",
            verdict === "buy" 
              ? "bg-gradient-to-b from-emerald-500 to-teal-500" 
              : "bg-gradient-to-b from-amber-500 to-orange-500"
          )}
          style={{
            height: `${(visibleMilestones / milestones.length) * 100}%`,
          }}
        />

        {/* Milestones */}
        <div className="space-y-8">
          {milestones.map((milestone, index) => {
            const colors = getColorClasses(milestone.color);
            const isVisible = index < visibleMilestones;
            const isHovered = hoveredMilestone === index;

            return (
              <div
                key={index}
                className={cn(
                  "relative pl-16 transition-all duration-500",
                  isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                )}
                style={{ transitionDelay: `${index * 100}ms` }}
                onMouseEnter={() => setHoveredMilestone(index)}
                onMouseLeave={() => setHoveredMilestone(null)}
              >
                {/* Node */}
                <div className={cn(
                  "absolute left-3 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300",
                  "border-2 bg-slate-900",
                  colors.border,
                  isHovered && `shadow-lg ${colors.glow}`,
                  milestone.type === "end" && `${colors.bg} border-transparent`
                )}>
                  <milestone.icon className={cn(
                    "w-3.5 h-3.5 transition-all duration-300",
                    milestone.type === "end" ? "text-white" : colors.text,
                    isHovered && "scale-110"
                  )} />
                </div>

                {/* Content Card */}
                <div className={cn(
                  "p-4 rounded-xl transition-all duration-300",
                  "bg-slate-800/30 border border-slate-700/30",
                  isHovered && "bg-slate-800/50 border-slate-600/50 transform scale-[1.02]"
                )}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", `${colors.bg}/20`, colors.text)}>
                          Month {milestone.month}
                        </span>
                        {milestone.type === "end" && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                            Complete
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-white mb-1">{milestone.label}</h4>
                      <p className="text-sm text-slate-400">{milestone.description}</p>
                    </div>
                    {milestone.amount && (
                      <div className="text-right">
                        <div className="text-xs text-slate-500 mb-1">Total Paid</div>
                        <div className={cn("text-lg font-bold", colors.text)}>
                          ${formatNumber(milestone.amount)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Progress bar for this milestone */}
                  {milestone.month > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-700/50">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span>Progress</span>
                        <span>{Math.round((milestone.month / maxMonth) * 100)}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-1000 bg-gradient-to-r",
                            verdict === "buy" ? "from-emerald-500 to-teal-500" : "from-amber-500 to-orange-500"
                          )}
                          style={{
                            width: isVisible ? `${(milestone.month / maxMonth) * 100}%` : "0%",
                            transitionDelay: `${index * 200 + 500}ms`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-8 pt-6 border-t border-slate-700/50">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{maxMonth}</div>
            <div className="text-xs text-slate-500">Total Months</div>
          </div>
          <div className="text-center">
            <div className={cn("text-2xl font-bold", verdict === "buy" ? "text-emerald-400" : "text-amber-400")}>
              ${formatNumber(Math.round(verdict === "buy" ? buyMonthly : leaseMonthly))}
            </div>
            <div className="text-xs text-slate-500">Monthly Payment</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              ${formatNumber(Math.round(verdict === "buy" ? buyTotal : leaseTotal))}
            </div>
            <div className="text-xs text-slate-500">Total Cost</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
