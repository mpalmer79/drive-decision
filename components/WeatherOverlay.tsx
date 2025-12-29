"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface WeatherOverlayProps {
  zipCode?: string;
}

export function WeatherOverlay({ zipCode = "03103" }: WeatherOverlayProps) {
  const [mounted, setMounted] = useState(false);
  
  // Get current weather based on time (demo mode)
  const hour = new Date().getHours();
  const isDay = hour >= 6 && hour < 18;
  
  // Determine weather type based on hour
  // 0-5: snow, 6-11: clear, 12-17: partly cloudy, 18-23: rain
  const getWeatherType = () => {
    if (hour >= 0 && hour < 6) return "snow";
    if (hour >= 6 && hour < 12) return "clear";
    if (hour >= 12 && hour < 18) return "clouds";
    return "rain";
  };
  
  const weatherType = getWeatherType();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything on server
  if (!mounted) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 1, opacity: 0.5 }}
    >
      {/* Background tint based on weather */}
      <div className={cn(
        "absolute inset-0",
        weatherType === "clear" && isDay && "bg-gradient-to-b from-sky-300/40 via-sky-200/20 to-transparent",
        weatherType === "clear" && !isDay && "bg-gradient-to-b from-indigo-900/30 via-slate-800/20 to-transparent",
        weatherType === "clouds" && "bg-gradient-to-b from-slate-400/30 via-slate-300/20 to-transparent",
        weatherType === "rain" && "bg-gradient-to-b from-slate-500/40 via-slate-400/25 to-transparent",
        weatherType === "snow" && "bg-gradient-to-b from-slate-200/40 via-white/20 to-transparent"
      )} />

      {/* Sun - Clear daytime */}
      {weatherType === "clear" && isDay && (
        <div className="absolute top-12 right-12 sm:top-16 sm:right-20">
          <div className="relative">
            <div className="absolute -inset-4 bg-yellow-300/60 rounded-full blur-2xl animate-pulse" />
            <div className="relative w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-yellow-200 via-yellow-300 to-orange-400 rounded-full shadow-2xl" />
          </div>
        </div>
      )}

      {/* Moon - Clear nighttime */}
      {weatherType === "clear" && !isDay && (
        <div className="absolute top-12 right-12 sm:top-16 sm:right-20">
          <div className="relative">
            <div className="absolute -inset-2 bg-slate-200/40 rounded-full blur-xl" />
            <div className="relative w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 rounded-full shadow-lg">
              <div className="absolute top-2 left-3 w-2 h-2 bg-slate-300/60 rounded-full" />
              <div className="absolute top-6 left-2 w-1.5 h-1.5 bg-slate-300/50 rounded-full" />
              <div className="absolute bottom-3 right-2 w-3 h-3 bg-slate-300/40 rounded-full" />
            </div>
          </div>
        </div>
      )}

      {/* Clouds */}
      {(weatherType === "clouds" || weatherType === "rain") && (
        <>
          <Cloud className="top-[5%] animate-cloud-1" size="lg" />
          <Cloud className="top-[12%] animate-cloud-2" size="md" />
          <Cloud className="top-[8%] animate-cloud-3" size="sm" />
        </>
      )}

      {/* Rain drops */}
      {weatherType === "rain" && (
        <div className="absolute inset-0">
          {Array.from({ length: 80 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 bg-gradient-to-b from-sky-400/60 to-sky-600/80 rounded-full animate-rain"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-20px`,
                height: `${15 + Math.random() * 15}px`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${0.5 + Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Snow flakes */}
      {weatherType === "snow" && (
        <div className="absolute inset-0">
          {Array.from({ length: 60 }).map((_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full animate-snow shadow-sm"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10px`,
                width: `${3 + Math.random() * 4}px`,
                height: `${3 + Math.random() * 4}px`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 8}s`,
                opacity: 0.4 + Math.random() * 0.4,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Cloud component
function Cloud({ className, size }: { className?: string; size: "sm" | "md" | "lg" }) {
  const sizeStyles = {
    sm: "w-20 h-8",
    md: "w-32 h-12", 
    lg: "w-44 h-16",
  };

  return (
    <div className={cn("absolute left-0", sizeStyles[size], className)}>
      <div className="relative w-full h-full">
        <div className="absolute bottom-0 left-[10%] w-[35%] h-[70%] bg-white/70 rounded-full" />
        <div className="absolute bottom-0 left-[25%] w-[45%] h-full bg-white/70 rounded-full" />
        <div className="absolute bottom-0 right-[15%] w-[40%] h-[65%] bg-white/70 rounded-full" />
      </div>
    </div>
  );
}
