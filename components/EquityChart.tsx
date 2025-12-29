"use client";

import { useState, useEffect, useRef } from "react";
import { cn, formatNumber } from "@/lib/utils";
import { Card } from "@/components/ui";
import { IconTrendingUp, IconKey, IconFileText } from "@/components/icons";

interface EquityChartProps {
  vehiclePrice: number;
  downPayment: number;
  termMonths: number;
  ownershipMonths: number;
  buyMonthly: number;
  leaseMonthly: number;
}

interface DataPoint {
  month: number;
  buyEquity: number;
  buyPaid: number;
  leaseSpent: number;
  carValue: number;
}

export function EquityChart({
  vehiclePrice,
  downPayment,
  termMonths,
  ownershipMonths,
  buyMonthly,
  leaseMonthly,
}: EquityChartProps) {
  const [animationProgress, setAnimationProgress] = useState(0);
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);
  const [selectedLine, setSelectedLine] = useState<"equity" | "lease" | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Generate data points
  const generateData = (): DataPoint[] => {
    const points: DataPoint[] = [];
    const depreciationRate = 0.15; // 15% per year
    const monthlyDepreciation = depreciationRate / 12;

    for (let month = 0; month <= ownershipMonths; month += 3) {
      // Car value depreciates over time
      const yearsOwned = month / 12;
      const carValue = vehiclePrice * Math.pow(1 - depreciationRate, yearsOwned);

      // Buy scenario: equity = car value - remaining loan
      const principalPaid = month <= termMonths 
        ? (buyMonthly * month * 0.6) // Rough estimate: 60% goes to principal
        : vehiclePrice - downPayment;
      const buyEquity = Math.max(0, carValue - (vehiclePrice - downPayment - principalPaid));
      const buyPaid = downPayment + (buyMonthly * month);

      // Lease scenario: no equity, just money spent
      const leaseSpent = downPayment + (leaseMonthly * month);

      points.push({
        month,
        buyEquity,
        buyPaid,
        leaseSpent,
        carValue,
      });
    }

    return points;
  };

  const data = generateData();

  // Animate on mount
  useEffect(() => {
    const duration = 2000;
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
  }, []);

  // Chart dimensions
  const width = 600;
  const height = 300;
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Scales
  const maxY = Math.max(
    ...data.map(d => Math.max(d.buyEquity, d.buyPaid, d.leaseSpent, d.carValue))
  );
  const xScale = (month: number) => padding.left + (month / ownershipMonths) * chartWidth;
  const yScale = (value: number) => padding.top + chartHeight - (value / maxY) * chartHeight;

  // Generate path
  const generatePath = (values: number[]) => {
    const visiblePoints = Math.ceil(data.length * animationProgress);
    return data
      .slice(0, visiblePoints)
      .map((d, i) => {
        const x = xScale(d.month);
        const y = yScale(values[i]);
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  };

  const equityPath = generatePath(data.map(d => d.buyEquity));
  const leasePath = generatePath(data.map(d => d.leaseSpent));
  const carValuePath = generatePath(data.map(d => d.carValue));

  // Generate area fill
  const generateArea = (values: number[]) => {
    const visiblePoints = Math.ceil(data.length * animationProgress);
    const pathData = data.slice(0, visiblePoints);
    if (pathData.length < 2) return "";

    const topPath = pathData
      .map((d, i) => {
        const x = xScale(d.month);
        const y = yScale(values[i]);
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");

    const bottomPath = pathData
      .reverse()
      .map((d) => {
        const x = xScale(d.month);
        const y = yScale(0);
        return `L ${x} ${y}`;
      })
      .join(" ");

    return `${topPath} ${bottomPath} Z`;
  };

  const equityArea = generateArea(data.map(d => d.buyEquity));

  // Find hovered data point
  const hoveredData = hoveredMonth !== null 
    ? data.find(d => d.month === hoveredMonth) 
    : null;

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl blur-lg opacity-40" />
            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center border border-emerald-300">
              <IconTrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Equity Over Time</h3>
            <p className="text-sm text-slate-500">
              Build ownership value vs. lease spending
            </p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => setSelectedLine(selectedLine === "equity" ? null : "equity")}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200",
            selectedLine === "equity" || !selectedLine
              ? "bg-emerald-100 text-emerald-600"
              : "bg-slate-100 text-slate-500"
          )}
        >
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-sm font-medium">Buy Equity</span>
        </button>
        <button
          onClick={() => setSelectedLine(selectedLine === "lease" ? null : "lease")}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200",
            selectedLine === "lease" || !selectedLine
              ? "bg-amber-100 text-amber-600"
              : "bg-slate-100 text-slate-500"
          )}
        >
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-sm font-medium">Lease Spent</span>
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 text-slate-500">
          <div className="w-3 h-0.5 bg-slate-500 rounded" style={{ borderStyle: "dashed" }} />
          <span className="text-sm">Car Value</span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative overflow-x-auto">
        <svg
          ref={svgRef}
          width="100%"
          viewBox={`0 0 ${width} ${height}`}
          className="min-w-[500px]"
          onMouseLeave={() => setHoveredMonth(null)}
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <g key={ratio}>
              <line
                x1={padding.left}
                y1={padding.top + chartHeight * (1 - ratio)}
                x2={width - padding.right}
                y2={padding.top + chartHeight * (1 - ratio)}
                stroke="rgb(51, 65, 85)"
                strokeWidth="1"
                strokeDasharray="4"
              />
              <text
                x={padding.left - 10}
                y={padding.top + chartHeight * (1 - ratio)}
                textAnchor="end"
                alignmentBaseline="middle"
                className="fill-slate-500 text-xs"
              >
                ${formatNumber(Math.round(maxY * ratio / 1000))}k
              </text>
            </g>
          ))}

          {/* X-axis labels */}
          {[0, 12, 24, 36, 48, 60, 72].filter(m => m <= ownershipMonths).map((month) => (
            <text
              key={month}
              x={xScale(month)}
              y={height - 10}
              textAnchor="middle"
              className="fill-slate-500 text-xs"
            >
              {month === 0 ? "Start" : `${month}mo`}
            </text>
          ))}

          {/* Equity area fill */}
          {(!selectedLine || selectedLine === "equity") && (
            <path
              d={equityArea}
              fill="url(#equityGradient)"
              opacity="0.3"
            />
          )}

          {/* Car value line (dashed) */}
          <path
            d={carValuePath}
            fill="none"
            stroke="rgb(100, 116, 139)"
            strokeWidth="2"
            strokeDasharray="6"
            className="transition-opacity duration-300"
            opacity={selectedLine ? 0.3 : 0.5}
          />

   {/* Lease spending line */}
          <path
            d={leasePath}
            fill="none"
            stroke="rgb(245, 158, 11)"
            strokeWidth="3"
            strokeLinecap="round"
            className={cn(
              "transition-opacity duration-300",
              selectedLine === null && "opacity-100",
              selectedLine === "lease" && "opacity-100",
              selectedLine === "equity" && "opacity-30"
            )}
          />

          {/* Equity line */}
          <path
            d={equityPath}
            fill="none"
            stroke="rgb(16, 185, 129)"
            strokeWidth="3"
            strokeLinecap="round"
            className={cn(
              "transition-opacity duration-300",
              selectedLine === null && "opacity-100",
              selectedLine === "equity" && "opacity-100",
              selectedLine === "lease" && "opacity-30"
            )}
          />

          {/* Interactive areas */}
          {data.map((d, i) => (
            <rect
              key={i}
              x={xScale(d.month) - 20}
              y={padding.top}
              width={40}
              height={chartHeight}
              fill="transparent"
              onMouseEnter={() => setHoveredMonth(d.month)}
              className="cursor-crosshair"
            />
          ))}

          {/* Hover indicator */}
          {hoveredData && (
            <g>
              <line
                x1={xScale(hoveredData.month)}
                y1={padding.top}
                x2={xScale(hoveredData.month)}
                y2={padding.top + chartHeight}
                stroke="rgb(148, 163, 184)"
                strokeWidth="1"
                strokeDasharray="4"
              />
              {(!selectedLine || selectedLine === "equity") && (
                <circle
                  cx={xScale(hoveredData.month)}
                  cy={yScale(hoveredData.buyEquity)}
                  r="6"
                  fill="rgb(16, 185, 129)"
                  stroke="white"
                  strokeWidth="2"
                />
              )}
              {(!selectedLine || selectedLine === "lease") && (
                <circle
                  cx={xScale(hoveredData.month)}
                  cy={yScale(hoveredData.leaseSpent)}
                  r="6"
                  fill="rgb(245, 158, 11)"
                  stroke="white"
                  strokeWidth="2"
                />
              )}
            </g>
          )}

          {/* Gradient definition */}
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Tooltip */}
        {hoveredData && (
          <div
            className="absolute pointer-events-none bg-slate-800 border border-slate-300 rounded-xl p-3 shadow-xl z-10"
            style={{
              left: `${(hoveredData.month / ownershipMonths) * 100}%`,
              top: "20%",
              transform: "translateX(-50%)",
            }}
          >
            <div className="text-xs text-slate-500 mb-2">Month {hoveredData.month}</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-slate-500">Equity:</span>
                <span className="text-sm font-bold text-emerald-600">
                  ${formatNumber(Math.round(hoveredData.buyEquity))}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-xs text-slate-500">Lease Spent:</span>
                <span className="text-sm font-bold text-amber-600">
                  ${formatNumber(Math.round(hoveredData.leaseSpent))}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-500" />
                <span className="text-xs text-slate-500">Car Value:</span>
                <span className="text-sm font-bold text-slate-600">
                  ${formatNumber(Math.round(hoveredData.carValue))}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-300">
        <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-200">
          <div className="flex items-center gap-2 mb-1">
            <IconKey className="w-4 h-4 text-emerald-600" />
            <span className="text-xs text-emerald-600">Final Equity</span>
          </div>
          <div className="text-xl font-bold text-slate-900">
            ${formatNumber(Math.round(data[data.length - 1]?.buyEquity || 0))}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-amber-100 border border-amber-200">
          <div className="flex items-center gap-2 mb-1">
            <IconFileText className="w-4 h-4 text-amber-600" />
            <span className="text-xs text-amber-600">Lease Total</span>
          </div>
          <div className="text-xl font-bold text-slate-900">
            ${formatNumber(Math.round(data[data.length - 1]?.leaseSpent || 0))}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-slate-100 border border-slate-200">
          <div className="text-xs text-slate-500 mb-1">Car Value ({ownershipMonths}mo)</div>
          <div className="text-xl font-bold text-slate-900">
            ${formatNumber(Math.round(data[data.length - 1]?.carValue || 0))}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-slate-100 border border-slate-200">
          <div className="text-xs text-slate-500 mb-1">Equity Advantage</div>
          <div className="text-xl font-bold text-emerald-600">
            +${formatNumber(Math.round((data[data.length - 1]?.buyEquity || 0) - 0))}
          </div>
        </div>
      </div>
    </Card>
  );
}
