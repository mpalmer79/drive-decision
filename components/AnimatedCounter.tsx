"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  delay?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  onComplete?: () => void;
}

export function AnimatedCounter({
  value,
  duration = 2000,
  delay = 0,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
  onComplete,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const startDelay = setTimeout(() => {
      setHasStarted(true);
    }, delay);

    return () => clearTimeout(startDelay);
  }, [delay]);

  useEffect(() => {
    if (!hasStarted) return;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = easeOut * value;
      setDisplayValue(currentValue);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
        onComplete?.();
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [hasStarted, value, duration, onComplete]);

  const formattedValue = displayValue.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={cn("tabular-nums", className)}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
}

// Slot machine style counter (digits roll)
interface SlotCounterProps {
  value: number;
  className?: string;
  duration?: number;
  delay?: number;
}

export function SlotCounter({ value, className, duration = 1500, delay = 0 }: SlotCounterProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const valueStr = Math.round(value).toLocaleString("en-US");

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <span className={cn("inline-flex overflow-hidden", className)}>
      {valueStr.split("").map((char, i) => (
        <span
          key={i}
          className={cn(
            "inline-block transition-transform",
            isAnimating ? "translate-y-0" : "translate-y-full"
          )}
          style={{
            transitionDuration: `${duration}ms`,
            transitionDelay: `${i * 50}ms`,
            transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}

// Percentage counter with animated ring
interface PercentageRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  duration?: number;
  delay?: number;
  color?: string;
  bgColor?: string;
  className?: string;
}

export function PercentageRing({
  value,
  size = 120,
  strokeWidth = 8,
  duration = 2000,
  delay = 0,
  color = "rgb(16, 185, 129)",
  bgColor = "rgb(30, 41, 59)",
  className,
}: PercentageRingProps) {
  const [progress, setProgress] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const animProgress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - animProgress, 3);
        
        setProgress(eased * value);
        
        if (animProgress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [value, duration, delay]);

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-100"
          style={{
            filter: `drop-shadow(0 0 6px ${color})`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-white tabular-nums">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}
