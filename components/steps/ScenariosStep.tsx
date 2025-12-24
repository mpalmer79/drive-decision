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
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Compare Your Options
        </h2>
        <p className="text-slate-400">Enter the details for both scenarios</p>
      </div>

      {/* Tab Switcher (Mobile) */}
      <div className="flex gap-2 mb-6 sm:hidden">
        <button
          onClick={() => setActiveTab("buy")}
          className={cn(
            "flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all",
            activeTab === "buy"
              ? "bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500"
              : "bg-slate-800/50 text-slate-400"
          )}
        >
          <IconKey className="w-4 h-4 inline mr-2" />
          Buy
        </button>
        <button
          onClick={() => setActiveTab("lease")}
          className={cn(
            "flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all",
            activeTab === "lease"
              ? "bg-amber-500/20 text-amber-400 ring-2 ring-amber-500"
              : "bg-slate-800/50 text-slate-400"
          )}
        >
          <IconFileText className="w-4 h-4 inline mr-2" />
          Lease
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* BUY Card */}
        <Card className={cn("space-y-4", activeTab !== "buy" && "hidden sm:block")}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <IconKey className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Buy Scenario</h3>
              <p className="text-xs text-slate-400">Finance and own the vehicle</p>
            </div>
          </div>

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

          <div className="grid grid-cols-2 gap-3">
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
              suffix="months"
              type="number"
              value={buy.termMonths || ""}
              onChange={(e) =>
                setBuy({ ...buy, termMonths: Math.floor(toNumber(e.target.value)) })
              }
              placeholder="72"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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
            label="How long do you plan to keep it?"
            suffix="months"
            type="number"
            value={buy.ownershipMonths || ""}
            onChange={(e) =>
              setBuy({ ...buy, ownershipMonths: Math.floor(toNumber(e.target.value)) })
            }
            placeholder="48"
          />
        </Card>

        {/* LEASE Card */}
        <Card className={cn("space-y-4", activeTab !== "lease" && "hidden sm:block")}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <IconFileText className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Lease Scenario</h3>
              <p className="text-xs text-slate-400">Rent with option to buy</p>
            </div>
          </div>

          <Input
            label="Vehicle MSRP"
            prefix="$"
            type="text"
            inputMode="numeric"
            value={lease.msrp === 0 ? "" : formatNumber(lease.msrp)}
            onChange={(e) => setLease({ ...lease, msrp: toNumber(e.target.value) })}
            placeholder="45,000"
          />

          <div className="grid grid-cols-2 gap-3">
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

          <div className="grid grid-cols-2 gap-3">
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

          <div className="grid grid-cols-2 gap-3">
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
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-between mt-8">
        <Button variant="ghost" onClick={onBack} disabled={isLoading}>
          <IconArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button variant="primary" onClick={onSubmit} disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner className="w-4 h-4" />
              Analyzing...
            </>
          ) : (
            <>
              Get My Decision
              <IconArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
