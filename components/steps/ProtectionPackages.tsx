"use client";

import { useState } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import { Button, Card } from "@/components/ui";
import {
  IconShield,
  IconCheck,
  IconTire,
  IconKey,
  IconDent,
  IconWindshield,
  IconSeat,
  IconWrench,
  IconCalendar,
  IconInfo,
} from "@/components/icons";
import {
  getRecommendedPackages,
  calculatePackageTotal,
  calculateMonthlyImpact,
} from "@/lib/protectionPackages";

interface ProtectionPackagesProps {
  verdict: "buy" | "lease";
  termMonths: number;
  baseTotal: number;
  baseMonthly: number;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  gap: IconShield,
  "tire-wheel": IconTire,
  "key-replacement": IconKey,
  "dent-ding": IconDent,
  windshield: IconWindshield,
  interior: IconSeat,
  "extended-warranty": IconWrench,
  maintenance: IconCalendar,
};

export function ProtectionPackages({
  verdict,
  termMonths,
  baseTotal,
  baseMonthly,
}: ProtectionPackagesProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const recommendedPackages = getRecommendedPackages(verdict, termMonths);
  const packageTotal = calculatePackageTotal(selectedIds);
  const monthlyImpact = calculateMonthlyImpact(selectedIds, termMonths);

  const togglePackage = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const selectRecommended = () => {
    const topThree = recommendedPackages.slice(0, 3).map((p) => p.id);
    setSelectedIds(topThree);
  };

  const isBuy = verdict === "buy";

  return (
    <Card className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-white flex items-center gap-2">
            <IconShield className="w-5 h-5 text-emerald-400" />
            Protect Your Investment
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Recommended coverage for your {isBuy ? "purchase" : "lease"}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={selectRecommended}>
          Select Top 3
        </Button>
      </div>

      {/* Package Grid */}
      <div className="space-y-3 mb-6">
        {recommendedPackages.map((pkg) => {
          const isSelected = selectedIds.includes(pkg.id);
          const isExpanded = expandedId === pkg.id;
          const Icon = ICON_MAP[pkg.id] || IconShield;

          return (
            <div
              key={pkg.id}
              className={cn(
                "border rounded-xl transition-all duration-200",
                isSelected
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "border-slate-700 bg-slate-800/30 hover:border-slate-600"
              )}
            >
              {/* Main Row */}
              <div
                className="flex items-center gap-4 p-4 cursor-pointer"
                onClick={() => togglePackage(pkg.id)}
              >
                {/* Checkbox */}
                <div
                  className={cn(
                    "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                    isSelected
                      ? "bg-emerald-500 border-emerald-500"
                      : "border-slate-600"
                  )}
                >
                  {isSelected && <IconCheck className="w-4 h-4 text-white" />}
                </div>

                {/* Icon */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    isSelected ? "bg-emerald-500/20" : "bg-slate-700/50"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5",
                      isSelected ? "text-emerald-400" : "text-slate-400"
                    )}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{pkg.name}</span>
                    {pkg.recommended === verdict && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 truncate">
                    {isBuy ? pkg.buyBenefit : pkg.leaseBenefit}
                  </p>
                </div>

                {/* Price */}
                <div className="text-right">
                  <div className="font-semibold text-white">
                    {formatCurrency(pkg.price)}
                  </div>
                  <div className="text-xs text-slate-500">
                    ~{formatCurrency(pkg.monthlyEquivalent)}/mo
                  </div>
                </div>

                {/* Expand Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(pkg.id);
                  }}
                  className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <IconInfo className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-0 border-t border-slate-700/50 mt-0">
                  <div className="pt-4">
                    <p className="text-sm text-slate-300 mb-3">{pkg.description}</p>
                    <div className="text-sm text-slate-400">
                      <span className="font-medium text-white">Coverage includes:</span>
                      <ul className="mt-2 space-y-1">
                        {pkg.coverage.map((item, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <IconCheck className="w-3 h-3 text-emerald-400" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="border-t border-slate-700/50 pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400">Selected packages</span>
          <span className="font-semibold text-white">
            {selectedIds.length} of {recommendedPackages.length}
          </span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400">Protection total</span>
          <span className="font-semibold text-white">
            {formatCurrency(packageTotal)}
          </span>
        </div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-slate-400">Impact on monthly</span>
          <span className="font-semibold text-emerald-400">
            +{formatCurrency(monthlyImpact)}/mo
          </span>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-300">New total cost</span>
            <span className="text-xl font-bold text-white">
              {formatCurrency(baseTotal + packageTotal)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">New monthly all-in</span>
            <span className="font-semibold text-slate-300">
              {formatCurrency(baseMonthly + monthlyImpact)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
