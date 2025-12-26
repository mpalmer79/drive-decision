"use client";

import { useState } from "react";
import type { BuyScenario, LeaseScenario } from "@/types";
import { cn, formatNumber, toNumber } from "@/lib/utils";
import { Button, Card, Input, Select } from "@/components/ui";
import {
  IconArrowLeft,
  IconArrowRight,
  IconKey,
  IconFileText,
  Spinner,
  IconSparkles,
} from "@/components/icons";

interface ScenariosStepProps {
  buy: BuyScenario;
  setBuy: React.Dispatch<React.SetStateAction<BuyScenario>>;
  lease: LeaseScenario;
  setLease: React.Dispatch<React.SetStateAction<LeaseScenario>>;
  onSubmit: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export function ScenariosStep({
  buy,
  setBuy,
  lease,
  setLease,
  onSubmit,
  onBack,
  isLoading,
}: ScenariosStepProps) {
  const [activeTab, setActiveTab] = useState<"buy" | "lease">("buy");

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 tracking-tight">
          Compare Your Options
        </h2>
        <p className="text-slate-400 text-lg">
          Enter the details for both scenarios to get your personalized analysis
        </p>
      </div>

      {/* Tab Switcher (Mobile) */}
      <div className="flex gap-3 mb-8 sm:hidden">
        <button
          onClick={() => setActiveTab("buy")}
          className={cn(
            "flex-1 py-4 px-4 rounded-xl font-semibold text-sm transition-all duration-300",
            "flex items-center justify-center gap-2",
            activeTab === "buy"
              ? "bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/10"
              : "bg-slate-800/50 text-slate-400 border border-slate-700/50"
          )}
        >
          <IconKey className="w-4 h-4" />
          Buy
        </button>
        <button
          onClick={() => setActiveTab("lease")}
          className={cn(
            "flex-1 py-4 px-4 rounded-xl font-semibold text-sm transition-all duration-300",
            "flex items-center justify-center gap-2",
            activeTab === "lease"
              ? "bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400 ring-2 ring-amber-500/50 shadow-lg shadow-amber-500/10"
              : "bg-slate-800/50 text-slate-400 border border-slate-700/50"
          )}
        >
          <IconFileText className="w-4 h-4" />
          Lease
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
        {/* BUY Card */}
        <div className={cn(activeTab !== "buy" && "hidden sm:block")}>
          <Card className="space-y-5 h-full border-emerald-500/10 hover:border-emerald-500/30 transition-colors duration-300">
            {/* Card Header */}
            <div className="flex items-center gap-4 pb-4 border-b border-slate-700/50">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-xl blur-md" />
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/20">
                  <IconKey className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Buy Scenario</h3>
                <p className="text-sm text-slate-500">Finance and own the vehicle</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <Input
                label="Vehicle price"
                prefix="$"
                type="text"
                inputMode="numeric"
                value={buy.vehiclePrice === 0 ? "" : formatNumber(buy.vehiclePrice)}
                onChange={(e) => setBuy({ ...buy, vehiclePrice: toNumber(e.target.value) })}
                placeholder="42,000"
              />

              <Input
                label="Down payment"
                prefix="$"
                type="text"
                inputMode="numeric"
                value={buy.downPayment === 0 ? "" : formatNumber(buy.downPayment)}
                onChange={(e) => setBuy({ ...buy, downPayment: toNumber(e.target.value) })}
                placeholder="4,000"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="APR"
                  suffix="%"
                  type="number"
                  step="0.1"
                  value={buy.aprPercent || ""}
                  onChange={(e) => setBuy({ ...buy, aprPercent: toNumber(e.target.value) })}
                  placeholder="7.2"
                />
                <Input
                  label="Loan term"
                  suffix="mo"
                  type="number"
                  value={buy.termMonths || ""}
                  onChange={(e) =>
                    setBuy({ ...buy, termMonths: Math.floor(toNumber(e.target.value)) })
                  }
                  placeholder="72"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Insurance"
                  hint="/month"
                  prefix="$"
                  type="text"
                  inputMode="numeric"
                  value={buy.estMonthlyInsurance === 0 ? "" : formatNumber(buy.estMonthlyInsurance)}
                  onChange={(e) =>
                    setBuy({ ...buy, estMonthlyInsurance: toNumber(e.target.value) })
                  }
                  placeholder="220"
                />
                <Input
                  label="Maintenance"
                  hint="/month"
                  prefix="$"
                  type="text"
                  inputMode="numeric"
                  value={buy.estMonthlyMaintenance === 0 ? "" : formatNumber(buy.estMonthlyMaintenance)}
                  onChange={(e) =>
                    setBuy({ ...buy, estMonthlyMaintenance: toNumber(e.target.value) })
                  }
                  placeholder="90"
                />
              </div>

              <Input
                label="How long will you keep it?"
                suffix="months"
                type="number"
                value={buy.ownershipMonths || ""}
                onChange={(e) =>
                  setBuy({ ...buy, ownershipMonths: Math.floor(toNumber(e.target.value)) })
                }
                placeholder="48"
              />
            </div>
          </Card>
        </div>

        {/* LEASE Card */}
        <div className={cn(activeTab !== "lease" && "hidden sm:block")}>
          <Card className="space-y-5 h-full border-amber-500/10 hover:border-amber-500/30 transition-colors duration-300">
            {/* Card Header */}
            <div className="flex items-center gap-4 pb-4 border-b border-slate-700/50">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-500/20 rounded-xl blur-md" />
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-500/20">
                  <IconFileText className="w-6 h-6 text-amber-400" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Lease Scenario</h3>
                <p className="text-sm text-slate-500">Rent with option to buy</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <Input
                label="Vehicle MSRP"
                prefix="$"
                type="text"
                inputMode="numeric"
                value={lease.msrp === 0 ? "" : formatNumber(lease.msrp)}
                onChange={(e) => setLease({ ...lease, msrp: toNumber(e.target.value) })}
                placeholder="45,000"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Monthly payment"
                  prefix="$"
                  type="text"
                  inputMode="numeric"
                  value={lease.monthlyPayment === 0 ? "" : formatNumber(lease.monthlyPayment)}
                  onChange={(e) =>
                    setLease({ ...lease, monthlyPayment: toNumber(e.target.value) })
                  }
                  placeholder="499"
                />
                <Input
                  label="Due at signing"
                  prefix="$"
                  type="text"
                  inputMode="numeric"
                  value={lease.dueAtSigning === 0 ? "" : formatNumber(lease.dueAtSigning)}
                  onChange={(e) =>
                    setLease({ ...lease, dueAtSigning: toNumber(e.target.value) })
                  }
                  placeholder="2,500"
                />
              </div>

              <Input
                label="Lease term"
                suffix="months"
                type="number"
                value={lease.termMonths || ""}
                onChange={(e) =>
                  setLease({ ...lease, termMonths: Math.floor(toNumber(e.target.value)) })
                }
                placeholder="36"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Miles allowed"
                  hint="/year"
                  type="text"
                  inputMode="numeric"
                  value={
                    lease.mileageAllowancePerYear === 0
                      ? ""
                      : formatNumber(lease.mileageAllowancePerYear)
                  }
                  onChange={(e) =>
                    setLease({
                      ...lease,
                      mileageAllowancePerYear: Math.floor(toNumber(e.target.value)),
                    })
                  }
                  placeholder="12,000"
                />
                <Input
                  label="You'll drive"
                  hint="/year"
                  type="text"
                  inputMode="numeric"
                  value={lease.estMilesPerYear === 0 ? "" : formatNumber(lease.estMilesPerYear)}
                  onChange={(e) =>
                    setLease({
                      ...lease,
                      estMilesPerYear: Math.floor(toNumber(e.target.value)),
                    })
                  }
                  placeholder="14,000"
                />
              </div>

              <Input
                label="Excess mile fee"
                prefix="$"
                suffix="/mile"
                type="number"
                step="0.05"
                value={lease.estExcessMileFee || ""}
                onChange={(e) =>
                  setLease({ ...lease, estExcessMileFee: toNumber(e.target.value) })
                }
                placeholder="0.25"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Insurance"
                  hint="/month"
                  prefix="$"
                  type="text"
                  inputMode="numeric"
                  value={
                    lease.estMonthlyInsurance === 0 ? "" : formatNumber(lease.estMonthlyInsurance)
                  }
                  onChange={(e) =>
                    setLease({ ...lease, estMonthlyInsurance: toNumber(e.target.value) })
                  }
                  placeholder="230"
                />
                <Input
                  label="Maintenance"
                  hint="/month"
                  prefix="$"
                  type="text"
                  inputMode="numeric"
                  value={
                    lease.estMonthlyMaintenance === 0
                      ? ""
                      : formatNumber(lease.estMonthlyMaintenance)
                  }
                  onChange={(e) =>
                    setLease({ ...lease, estMonthlyMaintenance: toNumber(e.target.value) })
                  }
                  placeholder="40"
                />
              </div>

              <Select
                label="At lease end, you plan to..."
                value={lease.leaseEndPlan}
                onChange={(e) =>
                  setLease({
                    ...lease,
                    leaseEndPlan: e.target.value as LeaseScenario["leaseEndPlan"],
                  })
                }
              >
                <option value="return">Return the vehicle</option>
                <option value="buyout">Buy it out</option>
              </Select>

              {lease.leaseEndPlan === "buyout" && (
                <Input
                  label="Buyout price"
                  prefix="$"
                  type="text"
                  inputMode="numeric"
                  value={lease.estBuyoutPrice === 0 ? "" : formatNumber(lease.estBuyoutPrice || 0)}
                  onChange={(e) =>
                    setLease({ ...lease, estBuyoutPrice: toNumber(e.target.value) })
                  }
                  placeholder="28,000"
                />
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mt-10">
        <Button variant="ghost" onClick={onBack} disabled={isLoading}>
          <IconArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        
        <Button 
          variant="primary" 
          size="lg"
          onClick={onSubmit} 
          disabled={isLoading}
          className="group min-w-[200px]"
        >
          {isLoading ? (
            <>
              <Spinner className="w-5 h-5" />
              Analyzing...
            </>
          ) : (
            <>
              <IconSparkles className="w-5 h-5" />
              Get My Decision
              <IconArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
