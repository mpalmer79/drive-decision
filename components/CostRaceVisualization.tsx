"use client";

import { useState, useEffect, useRef } from "react";
import { cn, formatNumber } from "@/lib/utils";
import { Card } from "@/components/ui";

interface CostRaceProps {
  buyMonthlyPayment: number;
  leaseMonthlyPayment: number;
  buyDownPayment: number;
  leaseDownPayment: number;
  loanTermMonths: number;
  leaseTermMonths?: number;
  vehicleValue: number;
  isVisible: boolean;
}

export function CostRaceVisualization({
  buyMonthlyPayment,
  leaseMonthlyPayment,
  buyDownPayment,
  leaseDownPayment,
  loanTermMonths,
  leaseTermMonths = 36,
  vehicleValue,
  isVisible,
}: CostRaceProps) {
  const [currentMonth, setCurrentMonth] = useState(0);
  const [isRacing, setIsRacing] = useState(false);
  const [showCrossover, setShowCrossover] = useState(false);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate costs at each month
  const totalMonths = Math.max(loanTermMonths, leaseTermMonths * 2); // Show at least 2 lease cycles
  
  const getBuyCost = (month: number) => {
    const payments = Math.min(month, loanTermMonths) * buyMonthlyPayment;
    return buyDownPayment + payments;
  };

  const getLeaseCost = (month: number) => {
    // Multiple lease cycles
    const cyclesPassed = Math.floor(month / leaseTermMonths);
    const monthsInCurrentCycle = month % leaseTermMonths;
    const totalDown = leaseDownPayment * (cyclesPassed + 1);
    const totalPayments = cyclesPassed * leaseTermMonths * leaseMonthlyPayment + 
                          monthsInCurrentCycle * leaseMonthlyPayment;
    return totalDown + totalPayments;
  };

  // Find crossover point (where buying becomes cheaper per month of ownership)
  const findCrossoverMonth = () => {
    for (let m = 1; m <= totalMonths; m++) {
      const buyCostPerMonth = getBuyCost(m) / m;
      const leaseCostPerMonth = getLeaseCost(m) / m;
      if (buyCostPerMonth < leaseCostPerMonth && m > loanTermMonths * 0.6) {
        return m;
      }
    }
    return loanTermMonths;
  };

  const crossoverMonth = findCrossoverMonth();

  // Start animation when visible
  useEffect(() => {
    if (isVisible && !isRacing) {
      setIsRacing(true);
      setCurrentMonth(0);
      
      let month = 0;
      animationRef.current = setInterval(() => {
        month += 1;
        setCurrentMonth(month);
        
        if (month >= crossoverMonth && !showCrossover) {
          setShowCrossover(true);
        }
        
        if (month >= totalMonths) {
          if (animationRef.current) clearInterval(animationRef.current);
        }
      }, 50); // Speed of animation
    }

    return () => {
      if (animationRef.current) clearInterval(animationRef.current);
    };
  }, [isVisible]);

  const buyCost = getBuyCost(currentMonth);
  const leaseCost = getLeaseCost(currentMonth);
  const maxCost = Math.max(getBuyCost(totalMonths), getLeaseCost(totalMonths));

  // Calculate positions (as percentage)
  const buyPosition = (buyCost / maxCost) * 100;
  const leasePosition = (leaseCost / maxCost) * 100;

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-slate-900">Cost Over Time</h3>
          <p className="text-xs text-slate-500">Watch how costs compare as time passes</p>
        </div>
      </div>

      {/* Month counter */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200">
          <span className="text-sm text-slate-600">Month</span>
          <span className="text-2xl font-bold text-slate-900 tabular-nums w-12">{currentMonth}</span>
          <span className="text-sm text-slate-400">/ {totalMonths}</span>
        </div>
      </div>

      {/* Race tracks */}
      <div className="space-y-6 mb-6">
        {/* Buy track */}
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-emerald-600 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              Buy / Finance
            </span>
            <span className="text-sm font-bold text-slate-900 tabular-nums">
              ${formatNumber(Math.round(buyCost))}
            </span>
          </div>
          <div className="relative h-12 bg-slate-100 rounded-full overflow-hidden">
            {/* Track background pattern */}
            <div className="absolute inset-0 flex">
              {Array.from({ length: 20 }).map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex-1 border-r border-slate-200/50",
                    i % 2 === 0 && "bg-slate-50"
                  )} 
                />
              ))}
            </div>
            
            {/* Progress bar */}
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-100 ease-linear"
              style={{ width: `${Math.min(100, buyPosition)}%` }}
            />
            
            {/* Car icon */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 transition-all duration-100 ease-linear"
              style={{ left: `calc(${Math.min(95, buyPosition)}% - 16px)` }}
            >
              <div className="w-10 h-10 rounded-full bg-white shadow-lg border-2 border-emerald-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                </svg>
              </div>
            </div>
          </div>
          {currentMonth >= loanTermMonths && (
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full animate-bounce">
              PAID OFF! 🎉
            </div>
          )}
        </div>

        {/* Lease track */}
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-amber-600 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              Lease (Repeated)
            </span>
            <span className="text-sm font-bold text-slate-900 tabular-nums">
              ${formatNumber(Math.round(leaseCost))}
            </span>
          </div>
          <div className="relative h-12 bg-slate-100 rounded-full overflow-hidden">
            {/* Track background pattern */}
            <div className="absolute inset-0 flex">
              {Array.from({ length: 20 }).map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex-1 border-r border-slate-200/50",
                    i % 2 === 0 && "bg-slate-50"
                  )} 
                />
              ))}
            </div>
            
            {/* Progress bar */}
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-100 ease-linear"
              style={{ width: `${Math.min(100, leasePosition)}%` }}
            />
            
            {/* Car icon */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 transition-all duration-100 ease-linear"
              style={{ left: `calc(${Math.min(95, leasePosition)}% - 16px)` }}
            >
              <div className="w-10 h-10 rounded-full bg-white shadow-lg border-2 border-amber-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Crossover indicator */}
      {showCrossover && (
        <div className="animate-fade-in-up p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-bold text-emerald-700">Buying Wins!</span>
          </div>
          <p className="text-sm text-emerald-600">
            After month {crossoverMonth}, buying becomes the better value. You save{" "}
            <span className="font-bold">${formatNumber(Math.round(leaseCost - buyCost))}</span> by financing!
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-slate-200 grid grid-cols-2 gap-4 text-center">
        <div>
          <div className="text-xs text-slate-500 mb-1">Buy ends at</div>
          <div className="font-bold text-slate-900">Month {loanTermMonths}</div>
          <div className="text-xs text-emerald-600">Then $0/mo forever</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Lease renews every</div>
          <div className="font-bold text-slate-900">{leaseTermMonths} months</div>
          <div className="text-xs text-amber-600">Payments continue</div>
        </div>
      </div>
    </Card>
  );
}
