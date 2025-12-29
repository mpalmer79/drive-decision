import Image from "next/image";
import { cn } from "@/lib/utils";
import { IconCheck, IconSparkles } from "@/components/icons";

// ============================================================================
// QUIRK HEADER
// ============================================================================

export function QuirkHeader() {
  return (
    <div className="w-full pt-8 pb-4 flex justify-center">
      <a
        href="https://www.quirkchevynh.com"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative transition-all duration-300 hover:scale-105"
      >
        <Image
          src="/quirk-logo.png"
          alt="Quirk Auto Dealers"
          width={180}
          height={50}
          priority
          className="relative h-10 sm:h-12 w-auto drop-shadow-md"
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
    "relative inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white";

  const variants = {
    primary: cn(
      "btn-premium bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
      "hover:from-emerald-600 hover:to-teal-600",
      "focus:ring-emerald-500",
      "shadow-md hover:shadow-lg",
      "active:scale-[0.98]"
    ),
    secondary: cn(
      "bg-white text-slate-700 border border-slate-300",
      "hover:bg-slate-50 hover:border-slate-400",
      "focus:ring-slate-400",
      "shadow-sm",
      "active:scale-[0.98]"
    ),
    ghost: cn(
      "bg-transparent text-slate-600",
      "hover:text-slate-900 hover:bg-slate-100",
      "focus:ring-slate-400",
      "active:scale-[0.98]"
    ),
  };

  const sizes = {
    sm: "px-4 py-2 text-sm rounded-lg gap-2",
    md: "px-6 py-3 text-sm rounded-lg gap-2",
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
    <div className="space-y-2">
      {label && (
        <div className="flex items-baseline justify-between gap-2">
          <label className="text-sm font-medium text-slate-700">{label}</label>
          {hint && <span className="text-xs text-slate-500">{hint}</span>}
        </div>
      )}
      <div className="relative">
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">
            {prefix}
          </span>
        )}
        <input
          className={cn(
            "w-full bg-white border border-slate-300 rounded-lg px-4 py-3.5 text-slate-900 text-sm",
            "placeholder:text-slate-400",
            "focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20",
            "transition-all duration-200",
            "hover:border-slate-400",
            prefix && "pl-9",
            suffix && "pr-16",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            className
          )}
          {...props}
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-500 flex items-center gap-1">{error}</p>}
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
    <div className="space-y-2">
      {label && (
        <div className="flex items-baseline justify-between gap-2">
          <label className="text-sm font-medium text-slate-700">{label}</label>
          {hint && <span className="text-xs text-slate-500">{hint}</span>}
        </div>
      )}
      <div className="relative">
        <select
          className={cn(
            "w-full bg-white border border-slate-300 rounded-lg px-4 py-3.5 text-slate-900 text-sm",
            "focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20",
            "transition-all duration-200 cursor-pointer",
            "hover:border-slate-400",
            className
          )}
          {...props}
        >
          {children}
        </select>
      </div>
    </div>
  );
}

// ============================================================================
// CARD
// ============================================================================

export function Card({
  className,
  variant = "default",
  glow,
  children,
}: {
  className?: string;
  variant?: "default" | "elevated" | "outlined";
  glow?: "emerald" | "amber";
  children: React.ReactNode;
}) {
  const variants = {
    default: "glass-card",
    elevated: "glass-card shadow-xl",
    outlined: cn(
      "bg-transparent",
      "border-2 border-dashed border-slate-300",
      "hover:border-slate-400"
    ),
  };

  const glowStyles = {
    emerald: "ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/10",
    amber: "ring-2 ring-amber-500 shadow-lg shadow-amber-500/10",
  };

  return (
    <div
      className={cn(
        "rounded-2xl p-6 transition-all duration-200",
        variants[variant],
        glow && glowStyles[glow],
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
    <div className="flex items-center justify-center gap-1 sm:gap-2">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center gap-1 sm:gap-2">
          <div className="relative">
            <div
              className={cn(
                "relative flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold transition-all duration-300",
                i < currentStep
                  ? "bg-emerald-500 text-white shadow-md"
                  : i === currentStep
                    ? "bg-emerald-100 text-emerald-600 ring-2 ring-emerald-500"
                    : "bg-slate-200 text-slate-500"
              )}
            >
              {i < currentStep ? (
                <IconCheck className="w-5 h-5" />
              ) : (
                i + 1
              )}
            </div>
          </div>
          
          <span
            className={cn(
              "hidden sm:block text-sm font-medium transition-colors",
              i === currentStep ? "text-slate-900" : "text-slate-500"
            )}
          >
            {step}
          </span>
          
          {i < steps.length - 1 && (
            <div className="relative w-8 sm:w-16 h-0.5 mx-1 sm:mx-2">
              <div className="absolute inset-0 bg-slate-200 rounded-full" />
              <div
                className={cn(
                  "absolute inset-y-0 left-0 bg-emerald-500 rounded-full transition-all duration-500",
                  i < currentStep ? "w-full" : "w-0"
                )}
              />
            </div>
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
  animated = true,
}: {
  score: number;
  label: string;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}) {
  const getColor = (s: number) => {
    if (s >= 70) return { 
      bg: "from-red-500 to-red-600", 
      text: "text-red-600", 
      label: "High Stress"
    };
    if (s >= 40) return { 
      bg: "from-amber-500 to-orange-500", 
      text: "text-amber-600", 
      label: "Moderate"
    };
    return { 
      bg: "from-emerald-500 to-teal-500", 
      text: "text-emerald-600", 
      label: "Low Stress"
    };
  };

  const color = getColor(score);
  const sizes = {
    sm: { bar: "h-2", text: "text-xs" },
    md: { bar: "h-3", text: "text-sm" },
    lg: { bar: "h-4", text: "text-base" },
  };

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className={cn("font-medium text-slate-700", sizes[size].text)}>
          {label}
        </span>
        <div className="flex items-center gap-2">
          <span className={cn("font-bold tabular-nums", color.text, sizes[size].text)}>
            {Math.round(score)}
          </span>
          <span className={cn("font-medium", color.text, sizes[size].text)}>
            {color.label}
          </span>
        </div>
      </div>
      
      <div className="relative">
        <div
          className={cn(
            "w-full bg-slate-200 rounded-full overflow-hidden",
            sizes[size].bar
          )}
        >
          <div
            className={cn(
              "h-full rounded-full bg-gradient-to-r",
              color.bg,
              animated && "transition-all duration-1000 ease-out"
            )}
            style={{ width: `${Math.min(100, score)}%` }}
          />
        </div>
      </div>
      
      <div className="flex justify-between text-xs text-slate-500">
        <span>Lower risk</span>
        <span>Higher risk</span>
      </div>
    </div>
  );
}

// ============================================================================
// BADGE
// ============================================================================

export function Badge({
  variant = "default",
  size = "md",
  icon,
  children,
  className,
}: {
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const variants = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    success: "bg-emerald-100 text-emerald-700 border-emerald-200",
    warning: "bg-amber-100 text-amber-700 border-amber-200",
    error: "bg-red-100 text-red-700 border-red-200",
    info: "bg-cyan-100 text-cyan-700 border-cyan-200",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-3 py-1 text-sm gap-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}

// ============================================================================
// STAT CARD
// ============================================================================

export function StatCard({
  label,
  value,
  subValue,
  icon,
  trend,
  variant = "default",
}: {
  label: string;
  value: string;
  subValue?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  variant?: "default" | "highlight";
}) {
  const trendColors = {
    up: "text-emerald-600",
    down: "text-red-600",
    neutral: "text-slate-500",
  };

  return (
    <div
      className={cn(
        "relative p-4 rounded-xl transition-all duration-200",
        variant === "highlight"
          ? "bg-emerald-50 border border-emerald-200"
          : "bg-slate-50 border border-slate-200 hover:border-slate-300"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        {icon && <span className="text-slate-400">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-slate-900">{value}</span>
        {trend && (
          <span className={cn("text-sm font-medium", trendColors[trend])}>
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
          </span>
        )}
      </div>
      {subValue && (
        <span className="text-sm text-slate-500 mt-1 block">{subValue}</span>
      )}
    </div>
  );
}

// ============================================================================
// DIVIDER
// ============================================================================

export function Divider({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  if (label) {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "h-px bg-slate-200",
        className
      )}
    />
  );
}

// ============================================================================
// TOOLTIP
// ============================================================================

export function Tooltip({
  content,
  children,
}: {
  content: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative group inline-block">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl">
        {content}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
      </div>
    </div>
  );
}
