import Image from "next/image";
import { cn } from "@/lib/utils";
import { IconCheck } from "@/components/icons";

// ============================================================================
// QUIRK HEADER
// ============================================================================

export function QuirkHeader() {
  return (
    <div className="w-full pt-12 pb-4 flex justify-center">
      
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

// ============================================================================
// BUTTON
// ============================================================================

export function Button({
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

// ============================================================================
// INPUT
// ============================================================================

export function Input({
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
          <label className="text-sm font-medium text-white">{label}</label>
          {hint && <span className="text-xs text-white/70">{hint}</span>}
        </div>
      )}
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 text-sm">
            {prefix}
          </span>
        )}
        <input
          className={cn(
            "w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm",
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
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 text-sm">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// ============================================================================
// SELECT
// ============================================================================

export function Select({
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
          <label className="text-sm font-medium text-white">{label}</label>
          {hint && <span className="text-xs text-white/70">{hint}</span>}
        </div>
      )}
      <select
        className={cn(
          "w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm",
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

// ============================================================================
// CARD
// ============================================================================

export function Card({
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

// ============================================================================
// PROGRESS STEPS
// ============================================================================

export function ProgressSteps({
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
              i <= currentStep ? "text-white" : "text-slate-500"
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

// ============================================================================
// STRESS METER
// ============================================================================

export function StressMeter({
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
        <span className={cn("font-medium text-white", sizes[size].text)}>
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
      <div className="flex justify-between text-xs text-white/70">
        <span>Lower stress</span>
        <span>Higher stress</span>
      </div>
    </div>
  );
}
