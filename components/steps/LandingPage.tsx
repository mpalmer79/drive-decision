"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button, Card, QuirkHeader } from "@/components/ui";
import {
  IconShield,
  IconTrendingUp,
  IconAlertTriangle,
  IconArrowRight,
  IconSparkles,
  IconCheck,
  IconCar,
} from "@/components/icons";

interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="mesh-gradient" />
      <div className="grain-overlay" />
      
      {/* Floating Orbs */}
      <div className="absolute top-20 left-[10%] w-72 h-72 bg-emerald-200/50 rounded-full blur-[100px] floating-orb" />
      <div className="absolute bottom-20 right-[15%] w-96 h-96 bg-teal-200/40 rounded-full blur-[120px] floating-orb" style={{ animationDelay: '-2s' }} />
      <div className="absolute top-1/2 left-[60%] w-64 h-64 bg-amber-100 rounded-full blur-[80px] floating-orb" style={{ animationDelay: '-4s' }} />
      
      {/* Quirk Logo Header */}
      <div className="relative z-10">
        <QuirkHeader />
      </div>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12 text-center relative z-10">
        <div
          className={cn(
            "transition-all duration-1000 ease-out",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          )}
        >
          
          {/* Logo */}
          <div 
            className={cn(
              "flex items-center justify-center gap-4 mb-10",
              "transition-all duration-700 delay-200",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl blur-xl opacity-50 animate-pulse-glow" />
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-white to-slate-100 border border-slate-300 flex items-center justify-center shadow-2xl overflow-hidden">
                <Image
                  src="/favicon.png"
                  alt="DriveDecision"
                  width={64}
                  height={64}
                  className="w-12 h-12 sm:w-14 sm:h-14"
                />
              </div>
            </div>
            <div className="text-left">
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                DriveDecision
              </div>
              <div className="text-xs sm:text-sm text-slate-500 tracking-widest font-medium">
                powered by Quirk AI
              </div>
            </div>
          </div>

          {/* Headline */}
          <h1 
            className={cn(
              "text-4xl sm:text-5xl lg:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight leading-[1.1]",
              "transition-all duration-700 delay-300",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            Should you{" "}
            <span className="gradient-text-animated">
              buy
            </span>{" "}
            or{" "}
            <span className="gradient-text-amber-animated">
              lease
            </span>
            ?
          </h1>

          <p 
            className={cn(
              "text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed",
              "transition-all duration-700 delay-400",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            Get a clear, personalized answer in under{" "}
            <span className="text-slate-900 font-semibold">2 minutes</span>. 
            We analyze your complete financial picture—not just the monthly payment.
          </p>

          {/* CTA Button */}
          <div
            className={cn(
              "transition-all duration-700 delay-500",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            <Button 
              variant="primary" 
              size="lg" 
              onClick={onStart}
              className="group text-lg px-10 py-5"
            >
              <span>Get Your Answer</span>
              <IconArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
            
            <div className="flex items-center justify-center gap-6 mt-6 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <IconCheck className="w-4 h-4 text-emerald-500" />
                Free
              </span>
              <span className="flex items-center gap-1.5">
                <IconCheck className="w-4 h-4 text-emerald-500" />
                No account needed
              </span>
              <span className="flex items-center gap-1.5">
                <IconCheck className="w-4 h-4 text-emerald-500" />
                2 min analysis
              </span>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div
          className={cn(
            "grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-16 sm:mt-24 max-w-5xl w-full",
            "transition-all duration-1000 delay-700 ease-out",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          )}
        >
          {[
            {
              icon: IconShield,
              title: "Risk-First Analysis",
              desc: "We calculate what you can actually afford, factoring in your complete financial situation.",
              gradient: "from-emerald-500 to-teal-500",
              iconBg: "bg-emerald-100",
              iconColor: "text-emerald-600",
              delay: "delay-[800ms]",
              bgImage: "/b.png",
            },
            {
              icon: IconTrendingUp,
              title: "Cash Flow Stress Test",
              desc: "See how each option impacts your monthly finances and emergency savings buffer.",
              gradient: "from-cyan-500 to-blue-500",
              iconBg: "bg-cyan-100",
              iconColor: "text-cyan-600",
              delay: "delay-[900ms]",
              bgImage: "/a.png",
            },
            {
              icon: IconAlertTriangle,
              title: "Downside Protection",
              desc: "Know which option keeps you safer if your income drops unexpectedly.",
              gradient: "from-amber-500 to-orange-500",
              iconBg: "bg-amber-100",
              iconColor: "text-amber-600",
              delay: "delay-[1000ms]",
              bgImage: "/c.png",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className={cn(
                "group relative",
                "transition-all duration-700",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
                feature.delay
              )}
            >
              {/* Card glow effect on hover */}
              <div className={cn(
                "absolute -inset-px rounded-2xl bg-gradient-to-r opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-50",
                feature.gradient
              )} />
              
              <div 
                className="relative h-full rounded-2xl border border-slate-300 overflow-hidden"
                style={{ 
                  backgroundImage: `url(${feature.bgImage})`, 
                  backgroundSize: 'cover', 
                  backgroundPosition: 'center' 
                }}
              >
                {/* Dark overlay for readability */}
                <div className="absolute inset-0 bg-slate-900/75" />
                
                {/* Content */}
                <div className="relative z-10 flex flex-col items-center text-center p-6 sm:p-8">
                  {/* Icon */}
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center mb-5",
                    "transition-transform duration-300 group-hover:scale-110",
                    feature.iconBg
                  )}>
                    <feature.icon className={cn("w-7 h-7", feature.iconColor)} />
                  </div>
                  
                  {/* Content */}
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div
          className={cn(
            "mt-16 sm:mt-24 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-6 sm:gap-12",
            "transition-all duration-1000 delay-[1100ms]",
            mounted ? "opacity-100" : "opacity-0"
          )}
        >
          <div className="flex items-center gap-3 w-48 sm:w-auto">
            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center flex-shrink-0">
              <IconCar className="w-6 h-6 text-slate-500" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-slate-900">18</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">Dealerships</div>
            </div>
          </div>
          
          <div className="h-12 w-px bg-slate-200 hidden sm:block" />
          
          <div className="flex items-center gap-3 w-48 sm:w-auto">
            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center flex-shrink-0">
              <IconCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-slate-900">40+</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">Years Experience</div>
            </div>
          </div>
          
          <div className="h-12 w-px bg-slate-200 hidden sm:block" />
          
          <div className="flex items-center gap-3 w-48 sm:w-auto">
            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center flex-shrink-0">
              <IconSparkles className="w-6 h-6 text-amber-600" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-slate-900">AI</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">Powered Analysis</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-6 px-4 text-center border-t border-slate-800/50 bg-slate-950/50 backdrop-blur-sm">
        <p className="text-xs text-slate-500">
          Educational decision support only. Not financial, legal, or tax advice. 
          <span className="mx-2">•</span>
          © {new Date().getFullYear()} Quirk Auto Dealers
        </p>
      </footer>
    </div>
  );
}
