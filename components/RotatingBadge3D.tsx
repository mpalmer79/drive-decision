"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface RotatingBadge3DProps {
  icon: React.ReactNode;
  color: "emerald" | "amber";
  isActive: boolean;
}

export function RotatingBadge3D({ icon, color, isActive }: RotatingBadge3DProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isActive) {
      setTimeout(() => setMounted(true), 100);
    }
  }, [isActive]);

  const colorClasses = {
    emerald: {
      gradient: "from-emerald-100 via-teal-50 to-emerald-100",
      border: "border-emerald-400/50",
      glow: "bg-emerald-500",
      shadow: "shadow-emerald-500/30",
      shine: "from-emerald-200/50 via-white/80 to-transparent",
    },
    amber: {
      gradient: "from-amber-100 via-orange-50 to-amber-100",
      border: "border-amber-400/50",
      glow: "bg-amber-500",
      shadow: "shadow-amber-500/30",
      shine: "from-amber-200/50 via-white/80 to-transparent",
    },
  }[color];

  return (
    <div className="perspective-1000 relative">
      {/* Outer glow ring */}
      <div className={cn(
        "absolute inset-[-20px] rounded-full blur-2xl transition-all duration-1000",
        colorClasses.glow,
        mounted ? "opacity-20 scale-100" : "opacity-0 scale-50"
      )} />
      
      {/* Pulsing ring */}
      <div className={cn(
        "absolute inset-[-8px] rounded-[2rem] border-2 transition-all duration-500",
        colorClasses.border,
        mounted ? "opacity-100 animate-pulse-ring" : "opacity-0"
      )} />

      {/* Main 3D badge */}
      <div
        className={cn(
          "relative w-28 h-28 rounded-3xl transition-all duration-700 transform-gpu",
          "preserve-3d cursor-pointer",
          mounted ? "animate-float-rotate" : "scale-0"
        )}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Front face */}
        <div
          className={cn(
            "absolute inset-0 rounded-3xl border-2 bg-gradient-to-br flex items-center justify-center",
            "backface-hidden shadow-2xl",
            colorClasses.gradient,
            colorClasses.border,
            colorClasses.shadow
          )}
          style={{
            backfaceVisibility: "hidden",
            transform: "translateZ(20px)",
          }}
        >
          {/* Shine effect */}
          <div 
            className={cn(
              "absolute inset-0 rounded-3xl bg-gradient-to-br opacity-60 pointer-events-none",
              colorClasses.shine
            )}
            style={{
              clipPath: "polygon(0 0, 100% 0, 60% 40%, 0 100%)",
            }}
          />
          
          {/* Icon */}
          <div className={cn(
            "relative z-10 transition-transform duration-500",
            mounted ? "scale-100 rotate-0" : "scale-0 rotate-180"
          )}>
            {icon}
          </div>
        </div>

        {/* Back face (shadow/depth) */}
        <div
          className={cn(
            "absolute inset-0 rounded-3xl bg-gradient-to-br from-slate-200 to-slate-300",
            "shadow-inner"
          )}
          style={{
            backfaceVisibility: "hidden",
            transform: "translateZ(-5px)",
          }}
        />

        {/* Side edges for 3D depth */}
        <div
          className={cn(
            "absolute inset-y-2 -right-1 w-2 rounded-r-lg",
            color === "emerald" ? "bg-emerald-300" : "bg-amber-300"
          )}
          style={{
            transform: "rotateY(90deg) translateZ(54px)",
          }}
        />
      </div>

      {/* Floating particles */}
      {mounted && (
        <>
          <div className={cn(
            "absolute -top-2 -right-2 w-2 h-2 rounded-full animate-float-particle-1",
            colorClasses.glow
          )} />
          <div className={cn(
            "absolute -bottom-1 -left-3 w-1.5 h-1.5 rounded-full animate-float-particle-2",
            colorClasses.glow
          )} />
          <div className={cn(
            "absolute top-1/2 -right-4 w-1 h-1 rounded-full animate-float-particle-3",
            colorClasses.glow
          )} />
        </>
      )}
    </div>
  );
}
