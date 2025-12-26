"use client";

import { useState, useCallback } from "react";
import type { BuyScenario, LeaseScenario, DecisionResult } from "@/types";

interface WhatIfParams {
  vehiclePrice: number;
  downPayment: number;
  termMonths: number;
  apr: number;
}

interface WhatIfResult {
  buyMonthlyAllIn: number;
  leaseMonthlyAllIn: number;
  buyTotalCost: number;
  leaseTotalCost: number;
  buyStressScore: number;
  leaseStressScore: number;
  verdict: "buy" | "lease";
}

// Simple calculation functions (matching your backend logic)
function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termMonths: number
): number {
  if (annualRate === 0) return principal / termMonths;
  
  const monthlyRate = annualRate / 100 / 12;
  const payment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);
  
  return payment;
}

function calculateLeasePayment(
  msrp: number,
  residualPercent: number = 0.55,
  moneyFactor: number = 0.00125,
  termMonths: number = 36
): number {
  const residualValue = msrp * residualPercent;
  const depreciation = (msrp - residualValue) / termMonths;
  const financeCharge = (msrp + residualValue) * moneyFactor;
  return depreciation + financeCharge;
}

export function useWhatIfCalculation(
  initialBuy: BuyScenario,
  initialLease: LeaseScenario,
  initialResult: DecisionResult
) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentResult, setCurrentResult] = useState<WhatIfResult>({
    buyMonthlyAllIn: initialResult.buyMonthlyAllIn,
    leaseMonthlyAllIn: initialResult.leaseMonthlyAllIn,
    buyTotalCost: initialResult.buyTotalCost,
    leaseTotalCost: initialResult.leaseTotalCost,
    buyStressScore: initialResult.buyStressScore,
    leaseStressScore: initialResult.leaseStressScore,
    verdict: initialResult.verdict,
  });

  const recalculate = useCallback((params: WhatIfParams) => {
    setIsCalculating(true);

    // Simulate a brief calculation delay for UX
    setTimeout(() => {
      const { vehiclePrice, downPayment, termMonths, apr } = params;
      
      // Calculate buy scenario
      const loanAmount = vehiclePrice - downPayment;
      const buyLoanPayment = calculateMonthlyPayment(loanAmount, apr, termMonths);
      const buyMonthlyInsurance = initialBuy.estMonthlyInsurance || 180;
      const buyMonthlyMaintenance = initialBuy.estMonthlyMaintenance || 75;
      const buyMonthlyAllIn = buyLoanPayment + buyMonthlyInsurance + buyMonthlyMaintenance;
      
      // Calculate lease scenario (simplified)
      const leaseBasePayment = calculateLeasePayment(vehiclePrice);
      const leaseMonthlyInsurance = initialLease.estMonthlyInsurance || 180;
      const leaseMonthlyMaintenance = initialLease.estMonthlyMaintenance || 40;
      const leaseMonthlyAllIn = leaseBasePayment + leaseMonthlyInsurance + leaseMonthlyMaintenance;
      
      // Calculate totals
      const ownershipMonths = initialBuy.ownershipMonths || 48;
      const buyTotalCost = (buyMonthlyAllIn * ownershipMonths) + downPayment;
      const leaseTotalCost = (leaseMonthlyAllIn * ownershipMonths) + downPayment;
      
      // Simple stress scores (0-100, higher = more stress)
      const buyStressScore = Math.min(100, Math.max(0, (buyMonthlyAllIn / 1000) * 25));
      const leaseStressScore = Math.min(100, Math.max(0, (leaseMonthlyAllIn / 1000) * 25));
      
      // Determine verdict
      const verdict = buyTotalCost <= leaseTotalCost ? "buy" : "lease";

      setCurrentResult({
        buyMonthlyAllIn,
        leaseMonthlyAllIn,
        buyTotalCost,
        leaseTotalCost,
        buyStressScore,
        leaseStressScore,
        verdict,
      });

      setIsCalculating(false);
    }, 150);
  }, [initialBuy, initialLease]);

  return {
    result: currentResult,
    recalculate,
    isCalculating,
  };
}
