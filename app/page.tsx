"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import type {
  BuyScenario,
  LeaseScenario,
  UserProfile,
  DecisionResult,
} from "@/types";

// ============================================================================
// TYPES
// ============================================================================

type Step = "landing" | "profile" | "scenarios" | "results";

type ApiState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: DecisionResult }
  | { status: "error"; message: string };

// ============================================================================
// UTILITIES
// ============================================================================

function toNumber(v: string): number {
  const n = Number(v.replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatNumber(amount: number): string {
  return new Intl.NumberFormat("en-US").format(amount);
}

function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

// ============================================================================
// ICONS (inline SVG for zero dependencies)
// ============================================================================

function IconCar({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-3-5H9L6 10l-2.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
      <path d="M9 17h6" />
    </svg>
  );
}

function IconShield({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function IconTrendingUp({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" />
      <polyline points="16,7 22,7 22,13" />
    </svg>
  );
}

function IconArrowRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function IconArrowLeft({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconAlertTriangle({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function IconRefresh({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

function IconDollar({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function IconKey({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
}

function IconFileText({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin", className)}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// ============================================================================
// UI COMPONENTS
// ============================================================================

function QuirkHeader() {
  return (
    <div className="w-full py-4 flex justify-center">
      
        href="https://www.quirkcars.com"
        target="_blank"
        rel="noopener noreferrer"
        className="transition-opacity hover:opacity-80"
      >
        <Image
          src="/quirk-logo.png"
          alt="Quirk Auto Dealers"
          width={180}
          height={50}
          priority
          className="h-10 sm:h-12 w-auto"
        />
      </a>
    </div>
  );
}

function Button({
  variant = "secondary",
  size = "md",
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900";

  const variants = {
    primary:
      "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-400 hover:to-teal-400 focus:ring-emerald-500 shadow-lg shadow-emerald-500/25",
    secondary:
      "bg-slate-800 text-slate-100 hover:bg-slate-700 focus:ring-slate-500 border border-slate-700",
    ghost:
      "bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 focus:ring-slate-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded-lg gap-1.5",
    md: "px-5 py-2.5 text-sm rounded-xl gap-2",
    lg: "px-8 py-4 text-base rounded-xl gap-3",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}

function Input({
  label,
  hint,
  prefix,
  suffix,
  error,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  prefix?: string;
  suffix?: string;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-baseline justify-between gap-2">
          <label className="text-sm font-medium text-slate-300">{label}</label>
          {hint && <span className="text-xs text-slate-500">{hint}</span>}
        </div>
      )}
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
            {prefix}
          </span>
        )}
        <input
          className={cn(
            "w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 text-sm",
            "placeholder:text-slate-500",
            "focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500",
            "transition-all duration-200",
            prefix && "pl-8",
            suffix && "pr-12",
            error && "border-red-500 focus:ring-red-500/50 focus:border-red-500",
            className
          )}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

function Select({
  label,
  hint,
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-baseline justify-between gap-2">
          <label className="text-sm font-medium text-slate-300">{label}</label>
          {hint && <span className="text-xs text-slate-500">{hint}</span>}
        </div>
      )}
      <select
        className={cn(
          "w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 text-sm",
          "focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500",
          "transition-all duration-200 cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6",
        className
      )}
    >
      {children}
    </div>
  );
}

function ProgressSteps({
  currentStep,
  steps,
}: {
  currentStep: number;
  steps: string[];
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center gap-2">
          <div
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-all duration-300",
              i < currentStep
                ? "bg-emerald-500 text-white"
                : i === currentStep
                  ? "bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500"
                  : "bg-slate-800 text-slate-500"
            )}
          >
            {i < currentStep ? <IconCheck className="w-4 h-4" /> : i + 1}
          </div>
          <span
            className={cn(
              "text-sm font-medium hidden sm:block transition-colors duration-300",
              i <= currentStep ? "text-slate-200" : "text-slate-500"
            )}
          >
            {step}
          </span>
          {i < steps.length - 1 && (
            <div
              className={cn(
                "w-8 sm:w-12 h-0.5 rounded-full transition-colors duration-300",
                i < currentStep ? "bg-emerald-500" : "bg-slate-700"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function StressMeter({
  score,
  label,
  size = "md",
}: {
  score: number;
  label: string;
  size?: "sm" | "md" | "lg";
}) {
  const getColor = (s: number) => {
    if (s >= 70) return { bg: "bg-red-500", text: "text-red-400", label: "High Stress" };
    if (s >= 40) return { bg: "bg-amber-500", text: "text-amber-400", label: "Moderate" };
    return { bg: "bg-emerald-500", text: "text-emerald-400", label: "Low Stress" };
  };

  const color = getColor(score);
  const sizes = {
    sm: { bar: "h-2", text: "text-xs" },
    md: { bar: "h-3", text: "text-sm" },
    lg: { bar: "h-4", text: "text-base" },
  };

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className={cn("font-medium text-slate-300", sizes[size].text)}>
          {label}
        </span>
        <span className={cn("font-semibold", color.text, sizes[size].text)}>
          {color.label}
        </span>
      </div>
      <div
        className={cn(
          "w-full bg-slate-700/50 rounded-full overflow-hidden",
          sizes[size].bar
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-out",
            color.bg
          )}
          style={{ width: `${Math.min(100, score)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-500">
        <span>Lower stress</span>
        <span>Higher stress</span>
      </div>
    </div>
  );
}

// ============================================================================
// LANDING PAGE
// ============================================================================

function LandingPage({ onStart }: { onStart: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Quirk Logo Header */}
      <QuirkHeader />

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 text-center">
        <div
          className={cn(
            "transition-all duration-1000 ease-out",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <IconCar className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <div className="text-xl font-bold text-white tracking-tight">
                DriveDecision
              </div>
              <div className="text-xs text-slate-400 tracking-widest uppercase">
                by Quirk AI
              </div>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            Should you{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              buy
            </span>{" "}
            or{" "}
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              lease
            </span>
            ?
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Get a clear, personalized answer in under 2 minutes. We analyze your
            financial situation—not just the monthly payment.
          </p>

          {/* CTA */}
          <Button variant="primary" size="lg" onClick={onStart}>
            Get Your Answer
            <IconArrowRight className="w-5 h-5" />
          </Button>

          <p className="text-sm text-slate-500 mt-4">Free • No account needed</p>
        </div>

        {/* Feature Cards */}
        <div
          className={cn(
            "grid grid-cols-1 sm:grid-cols-3 gap-4 mt-20 max-w-4xl w-full transition-all duration-1000 delay-300 ease-out",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          {[
            {
              icon: IconShield,
              title: "Risk-First Analysis",
              desc: "We calculate what you can actually afford, not just the cheapest option.",
            },
            {
              icon: IconTrendingUp,
              title: "Cash Flow Stress Test",
              desc: "See how each option affects your monthly finances and savings buffer.",
            },
            {
              icon: IconAlertTriangle,
              title: "Downside Protection",
              desc: "Know which option is safer if your income drops 10%.",
            },
          ].map((feature) => (
            <Card key={feature.title} className="text-left">
              <feature.icon className="w-8 h-8 text-emerald-400 mb-3" />
              <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
              <p className="text-sm text-slate-400">{feature.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 px-4 text-center border-t border-slate-800">
        <p className="text-xs text-slate-500">
          Educational decision support only. Not financial, legal, or tax
          advice.
        </p>
      </footer>
    </div>
  );
}

// ============================================================================
// STEP 1: USER PROFILE
// ============================================================================

function ProfileStep({
  user,
  setUser,
  onNext,
  onBack,
}: {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  onNext: () => void;
  onBack: () => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback(() => {
    const e: Record<string, string> = {};
    if (user.monthlyNetIncome <= 0) e.income = "Enter your monthly income";
    if (user.monthlyFixedExpenses < 0) e.expenses = "Invalid amount";
    if (user.currentSavings < 0) e.savings = "Invalid amount";
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [user]);

  const handleNext = () => {
    if (validate()) onNext();
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Your Financial Profile
        </h2>
        <p className="text-slate-400">
          Help us understand your current situation
        </p>
      </div>

      <Card className="space-y-5">
        <Input
          label="Monthly take-home pay"
          hint="After taxes"
          prefix="$"
          type="text"
          inputMode="numeric"
          value={user.monthlyNetIncome === 0 ? "" : formatNumber(user.monthlyNetIncome)}
          onChange={(e) =>
            setUser({ ...user, monthlyNetIncome: toNumber(e.target.value) })
          }
          error={errors.income}
          placeholder="6,500"
        />

        <Input
          label="Monthly fixed expenses"
          hint="Rent, utilities, subscriptions, etc."
          prefix="$"
          type="text"
          inputMode="numeric"
          value={user.monthlyFixedExpenses === 0 ? "" : formatNumber(user.monthlyFixedExpenses)}
          onChange={(e) =>
            setUser({ ...user, monthlyFixedExpenses: toNumber(e.target.value) })
          }
          error={errors.expenses}
          placeholder="3,800"
        />

        <Input
          label="Current savings"
          hint="Emergency fund / liquid assets"
          prefix="$"
          type="text"
          inputMode="numeric"
          value={user.currentSavings === 0 ? "" : formatNumber(user.currentSavings)}
          onChange={(e) =>
            setUser({ ...user, currentSavings: toNumber(e.target.value) })
          }
          error={errors.savings}
          placeholder="12,000"
        />

        <Select
          label="Credit score range"
          value={user.creditScoreBand}
          onChange={(e) =>
            setUser({
              ...user,
              creditScoreBand: e.target.value as UserProfile["creditScoreBand"],
            })
          }
        >
          <option value="below_620">Below 620 (Rebuilding)</option>
          <option value="620_679">620–679 (Fair)</option>
          <option value="680_739">680–739 (Good)</option>
          <option value="740_plus">740+ (Excellent)</option>
        </Select>

        <Select
          label="Risk tolerance"
          hint="How much financial uncertainty can you handle?"
          value={user.riskTolerance}
          onChange={(e) =>
            setUser({
              ...user,
              riskTolerance: e.target.value as UserProfile["riskTolerance"],
            })
          }
        >
          <option value="low">Low — I prefer maximum safety</option>
          <option value="medium">Medium — Balanced approach</option>
          <option value="high">High — I can handle some risk</option>
        </Select>
      </Card>

      <div className="flex justify-between mt-8">
        <Button variant="ghost" onClick={onBack}>
          <IconArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button variant="primary" onClick={handleNext}>
          Continue
          <IconArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 2: SCENARIOS (BUY vs LEASE)
// ============================================================================

function ScenariosStep({
  buy,
  setBuy,
  lease,
  setLease,
  onSubmit,
  onBack,
  isLoading,
}: {
  buy: BuyScenario;
  setBuy: React.Dispatch<React.SetStateAction<BuyScenario>>;
  lease: LeaseScenario;
  setLease: React.Dispatch<React.SetStateAction<LeaseScenario>>;
  onSubmit: () => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  const [activeTab, setActiveTab] = useState<"buy" | "lease">("buy");

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Compare Your Options
        </h2>
        <p className="text-slate-400">
          Enter the details for both scenarios
        </p>
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
        <Card
          className={cn(
            "space-y-4",
            activeTab !== "buy" && "hidden sm:block"
          )}
        >
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
            onChange={(e) =>
              setBuy({ ...buy, vehiclePrice: toNumber(e.target.value) })
            }
            placeholder="42,000"
          />

          <Input
            label="Down payment"
            prefix="$"
            type="text"
            inputMode="numeric"
            value={buy.downPayment === 0 ? "" : formatNumber(buy.downPayment)}
            onChange={(e) =>
              setBuy({ ...buy, downPayment: toNumber(e.target.value) })
            }
            placeholder="4,000"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="APR"
              suffix="%"
              type="number"
              step="0.1"
              value={buy.aprPercent || ""}
              onChange={(e) =>
                setBuy({ ...buy, aprPercent: toNumber(e.target.value) })
              }
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
        <Card
          className={cn(
            "space-y-4",
            activeTab !== "lease" && "hidden sm:block"
          )}
        >
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
            onChange={(e) =>
              setLease({ ...lease, msrp: toNumber(e.target.value) })
            }
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
              value={lease.mileageAllowancePerYear === 0 ? "" : formatNumber(lease.mileageAllowancePerYear)}
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
              value={lease.estMonthlyInsurance === 0 ? "" : formatNumber(lease.estMonthlyInsurance)}
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
              value={lease.estMonthlyMaintenance === 0 ? "" : formatNumber(lease.estMonthlyMaintenance)}
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

// ============================================================================
// STEP 3: RESULTS
// ============================================================================

function ResultsPage({
  result,
  buy,
  onStartOver,
}: {
  result: DecisionResult;
  buy: BuyScenario;
  lease: LeaseScenario;
  onStartOver: () => void;
}) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const isBuy = result.verdict === "buy";
  const verdictColor = isBuy
    ? "from-emerald-500 to-teal-500"
    : "from-amber-500 to-orange-500";
  const verdictBg = isBuy ? "bg-emerald-500/10" : "bg-amber-500/10";
  const verdictText = isBuy ? "text-emerald-400" : "text-amber-400";
  const verdictRing = isBuy ? "ring-emerald-500" : "ring-amber-500";

  const monthlyDiff = Math.abs(result.buyMonthlyAllIn - result.leaseMonthlyAllIn);
  const totalDiff = Math.abs(result.buyTotalCost - result.leaseTotalCost);
  const buyIsCheaper = result.buyTotalCost <= result.leaseTotalCost;

  const confidenceLabel = {
    high: { text: "High Confidence", color: "text-emerald-400" },
    medium: { text: "Moderate Confidence", color: "text-amber-400" },
    low: { text: "Low Confidence", color: "text-slate-400" },
  }[result.confidence];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Verdict Card */}
      <div
        className={cn(
          "text-center mb-10 transition-all duration-700 ease-out",
          revealed ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}
      >
        <div
          className={cn(
            "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6",
            verdictBg,
            verdictText
          )}
        >
          <IconShield className="w-4 h-4" />
          <span className={confidenceLabel.color}>{confidenceLabel.text}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
          <span
            className={cn(
              "bg-gradient-to-r bg-clip-text text-transparent",
              verdictColor
            )}
          >
            {isBuy ? "Buying" : "Leasing"}
          </span>{" "}
          is safer for you
        </h1>

        <p className="text-lg text-slate-400 max-w-xl mx-auto">
          {result.summary}
        </p>
      </div>

      {/* Comparison Cards */}
      <div
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 transition-all duration-700 delay-200 ease-out",
          revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}
      >
        {/* Buy Card */}
        <Card
          className={cn(
            "relative overflow-hidden",
            isBuy && `ring-2 ${verdictRing}`
          )}
        >
          {isBuy && (
            <div className="absolute top-3 right-3">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <IconCheck className="w-3 h-3" />
                Recommended
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <IconKey className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-white">Buy</h3>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                Monthly all-in
              </div>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(result.buyMonthlyAllIn)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                Total cost ({buy.ownershipMonths}mo)
              </div>
              <div className="text-xl font-semibold text-slate-300">
                {formatCurrency(result.buyTotalCost)}
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-700/50">
            <StressMeter score={result.buyStressScore} label="Financial Stress" size="sm" />
          </div>
        </Card>

        {/* Lease Card */}
        <Card
          className={cn(
            "relative overflow-hidden",
            !isBuy && `ring-2 ${verdictRing}`
          )}
        >
          {!isBuy && (
            <div className="absolute top-3 right-3">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold">
                <IconCheck className="w-3 h-3" />
                Recommended
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <IconFileText className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="font-semibold text-white">Lease</h3>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                Monthly all-in
              </div>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(result.leaseMonthlyAllIn)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                Total cost ({buy.ownershipMonths}mo)
              </div>
              <div className="text-xl font-semibold text-slate-300">
                {formatCurrency(result.leaseTotalCost)}
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-700/50">
            <StressMeter score={result.leaseStressScore} label="Financial Stress" size="sm" />
          </div>
        </Card>
      </div>

      {/* Key Insights */}
      <div
        className={cn(
          "transition-all duration-700 delay-400 ease-out",
          revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}
      >
        <Card className="mb-8">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <IconDollar className="w-5 h-5 text-emerald-400" />
            Cost Breakdown
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
              <span className="text-slate-400">Monthly difference</span>
              <span className="font-semibold text-white">
                {formatCurrency(monthlyDiff)}{" "}
                <span className="text-slate-500 font-normal">
                  more to {result.buyMonthlyAllIn > result.leaseMonthlyAllIn ? "buy" : "lease"}
                </span>
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
              <span className="text-slate-400">
                Total over {buy.ownershipMonths} months
              </span>
              <span className="font-semibold text-white">
                {formatCurrency(totalDiff)}{" "}
                <span className="text-slate-500 font-normal">
                  {buyIsCheaper ? "savings to buy" : "savings to lease"}
                </span>
              </span>
            </div>

            <div className="flex items-center justify-between py-3">
              <span className="text-slate-400">Stress score difference</span>
              <span className="font-semibold text-white">
                {Math.abs(result.buyStressScore - result.leaseStressScore).toFixed(0)} points{" "}
                <span className="text-slate-500 font-normal">
                  lower for {result.buyStressScore < result.leaseStressScore ? "buying" : "leasing"}
                </span>
              </span>
            </div>
          </div>
        </Card>

        {/* Risk Flags */}
        {result.riskFlags.length > 0 && (
          <Card className="mb-8">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <IconAlertTriangle className="w-5 h-5 text-amber-400" />
              Things to Consider
            </h3>
            <ul className="space-y-2">
              {result.riskFlags.map((flag, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-slate-400"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  {flag}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button variant="secondary" onClick={onStartOver}>
            <IconRefresh className="w-4 h-4" />
            Start Over
          </Button>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-slate-500 mt-8">
          This analysis is for educational purposes only and is not financial,
          legal, or tax advice. Always consult with qualified professionals
          before making major financial decisions.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN APP
// ============================================================================

export default function Page() {
  const [step, setStep] = useState<Step>("landing");
  const [api, setApi] = useState<ApiState>({ status: "idle" });

  const [user, setUser] = useState<UserProfile>({
    monthlyNetIncome: 0,
    monthlyFixedExpenses: 0,
    currentSavings: 0,
    creditScoreBand: "680_739",
    riskTolerance: "medium",
  });

  const [buy, setBuy] = useState<BuyScenario>({
    vehiclePrice: 0,
    downPayment: 0,
    aprPercent: 0,
    termMonths: 72,
    estMonthlyInsurance: 0,
    estMonthlyMaintenance: 0,
    ownershipMonths: 48,
  });

  const [lease, setLease] = useState<LeaseScenario>({
    msrp: 0,
    monthlyPayment: 0,
    dueAtSigning: 0,
    termMonths: 36,
    mileageAllowancePerYear: 12000,
    estMilesPerYear: 12000,
    estExcessMileFee: 0.25,
    estMonthlyInsurance: 0,
    estMonthlyMaintenance: 0,
    leaseEndPlan: "return",
  });

  const payload = useMemo(() => ({ user, buy, lease }), [user, buy, lease]);

  const runDecision = useCallback(async () => {
    setApi({ status: "loading" });

    try {
      const res = await fetch("/api/decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = data?.error ?? `Request failed (${res.status})`;
        setApi({ status: "error", message: msg });
        return;
      }

      setApi({ status: "success", result: data as DecisionResult });
      setStep("results");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Network error";
      setApi({ status: "error", message: msg });
    }
  }, [payload]);

  const handleStartOver = useCallback(() => {
    setStep("landing");
    setApi({ status: "idle" });
    setUser({
      monthlyNetIncome: 0,
      monthlyFixedExpenses: 0,
      currentSavings: 0,
      creditScoreBand: "680_739",
      riskTolerance: "medium",
    });
    setBuy({
      vehiclePrice: 0,
      downPayment: 0,
      aprPercent: 0,
      termMonths: 72,
      estMonthlyInsurance: 0,
      estMonthlyMaintenance: 0,
      ownershipMonths: 48,
    });
    setLease({
      msrp: 0,
      monthlyPayment: 0,
      dueAtSigning: 0,
      termMonths: 36,
      mileageAllowancePerYear: 12000,
      estMilesPerYear: 12000,
      estExcessMileFee: 0.25,
      estMonthlyInsurance: 0,
      estMonthlyMaintenance: 0,
      leaseEndPlan: "return",
    });
  }, []);

  const currentStepIndex = { landing: -1, profile: 0, scenarios: 1, results: 2 }[step];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {step === "landing" ? (
          <LandingPage onStart={() => setStep("profile")} />
        ) : (
          <div className="px-4 py-8 sm:py-12">
            {/* Quirk Logo Header */}
            <QuirkHeader />

            {/* App Header */}
            <header className="max-w-4xl mx-auto mb-8">
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <IconCar className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">DriveDecision</span>
              </div>

              {step !== "results" && (
                <ProgressSteps
                  currentStep={currentStepIndex}
                  steps={["Your Profile", "Compare Options", "Your Decision"]}
                />
              )}
            </header>

            {/* Error Banner */}
            {api.status === "error" && (
              <div className="max-w-xl mx-auto mb-6">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <IconAlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <span>{api.message}</span>
                </div>
              </div>
            )}

            {/* Step Content */}
            {step === "profile" && (
              <ProfileStep
                user={user}
                setUser={setUser}
                onNext={() => setStep("scenarios")}
                onBack={() => setStep("landing")}
              />
            )}

            {step === "scenarios" && (
              <ScenariosStep
                buy={buy}
                setBuy={setBuy}
                lease={lease}
                setLease={setLease}
                onSubmit={runDecision}
                onBack={() => setStep("profile")}
                isLoading={api.status === "loading"}
              />
            )}

            {step === "results" && api.status === "success" && (
              <ResultsPage
                result={api.result}
                buy={buy}
                lease={lease}
                onStartOver={handleStartOver}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
