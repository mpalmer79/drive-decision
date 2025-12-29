"use client";

import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";

interface WeatherData {
  condition: string;
  description: string;
  temp: number;
  icon: string;
  isDay: boolean;
}

interface WeatherOverlayProps {
  zipCode?: string;
  className?: string;
}

export function WeatherOverlay({ zipCode = "03103", className }: WeatherOverlayProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch weather data
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Using OpenWeatherMap API - requires API key in env
        const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
        
        if (!apiKey) {
          // Fallback to demo mode with simulated weather
          console.log("No API key found, using demo mode");
          setWeather(getDemoWeather());
          return;
        }

        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?zip=${zipCode},us&appid=${apiKey}&units=imperial`
        );

        if (!response.ok) {
          throw new Error("Weather fetch failed");
        }

        const data = await response.json();
        
        // Determine if it's daytime based on sunrise/sunset
        const now = Date.now() / 1000;
        const isDay = now > data.sys.sunrise && now < data.sys.sunset;

        setWeather({
          condition: data.weather[0].main.toLowerCase(),
          description: data.weather[0].description.toLowerCase(),
          temp: Math.round(data.main.temp),
          icon: data.weather[0].icon,
          isDay,
        });
      } catch (err) {
        console.error("Weather fetch error:", err);
        setError("Could not fetch weather");
        // Use demo weather on error
        setWeather(getDemoWeather());
      }
    };

    fetchWeather();
    
    // Refresh every hour
    const interval = setInterval(fetchWeather, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [zipCode]);

  // Demo weather for testing (cycles through conditions)
  const getDemoWeather = (): WeatherData => {
    const hour = new Date().getHours();
    const isDay = hour >= 6 && hour < 18;
    
    // For demo, use current time to simulate different weather
    // In production, this would be real API data
    const conditions = [
      { condition: "clouds", description: "partly cloudy" },
      { condition: "clear", description: "clear sky" },
      { condition: "rain", description: "light rain" },
      { condition: "snow", description: "light snow" },
    ];
    
    // Use hour to pick a condition for demo variety
    const conditionIndex = Math.floor(hour / 6) % conditions.length;
    
    return {
      ...conditions[conditionIndex],
      temp: 35,
      icon: isDay ? "01d" : "01n",
      isDay,
    };
  };

  // Generate particles based on weather
  const particles = useMemo(() => {
    if (!weather) return [];

    const { condition, description } = weather;
    
    // Determine particle count and type
    let count = 0;
    let type: "snow" | "rain" | "none" = "none";

    if (condition === "snow" || description.includes("snow")) {
      type = "snow";
      if (description.includes("heavy")) {
        count = 150;
      } else if (description.includes("light")) {
        count = 50;
      } else {
        count = 80;
      }
    } else if (condition === "rain" || description.includes("rain") || description.includes("drizzle") || description.includes("shower")) {
      type = "rain";
      if (description.includes("heavy")) {
        count = 200;
      } else if (description.includes("light") || description.includes("drizzle")) {
        count = 60;
      } else {
        count = 100;
      }
    }

    return Array.from({ length: count }, (_, i) => ({
      id: i,
      type,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: type === "snow" 
        ? 5 + Math.random() * 10 
        : 0.5 + Math.random() * 1,
      size: type === "snow"
        ? (description.includes("heavy") ? 4 + Math.random() * 4 : 2 + Math.random() * 3)
        : 1 + Math.random() * 2,
      opacity: 0.3 + Math.random() * 0.5,
    }));
  }, [weather]);

  if (!weather) return null;

  const { condition, description, isDay } = weather;

  // Determine background style based on weather
  const getBackgroundStyle = () => {
    if (condition === "clear") {
      return isDay 
        ? "bg-gradient-to-b from-sky-200/50 via-sky-100/30 to-transparent"
        : "bg-gradient-to-b from-slate-800/30 via-slate-700/20 to-transparent";
    }
    if (condition === "clouds" || description.includes("cloudy") || description.includes("overcast")) {
      return "bg-gradient-to-b from-slate-400/40 via-slate-300/30 to-transparent";
    }
    if (condition === "rain" || description.includes("rain") || description.includes("shower")) {
      return "bg-gradient-to-b from-slate-500/40 via-slate-400/30 to-transparent";
    }
    if (condition === "snow") {
      return "bg-gradient-to-b from-slate-300/50 via-white/30 to-transparent";
    }
    if (condition === "thunderstorm") {
      return "bg-gradient-to-b from-slate-700/50 via-slate-600/40 to-transparent";
    }
    if (condition === "mist" || condition === "fog" || condition === "haze") {
      return "bg-gradient-to-b from-slate-300/60 via-slate-200/40 to-transparent";
    }
    return "bg-transparent";
  };

  const showSun = (condition === "clear" || (description.includes("partly") && description.includes("cloud"))) && isDay;
  const showMoon = condition === "clear" && !isDay;
  const showClouds = condition === "clouds" || description.includes("cloud") || description.includes("overcast");
  const isPartlyCloudy = description.includes("partly") || description.includes("few") || description.includes("scattered");

  return (
    <div 
      className={cn(
        "fixed inset-0 pointer-events-none overflow-hidden z-[1]",
        getBackgroundStyle(),
        className
      )}
      style={{ opacity: 0.5 }}
    >
      {/* Sun */}
      {showSun && (
        <div className="absolute top-16 right-16 sm:top-20 sm:right-24">
          <div className="relative">
            {/* Sun glow */}
            <div className="absolute inset-0 w-24 h-24 sm:w-32 sm:h-32 bg-yellow-300 rounded-full blur-2xl animate-pulse-slow" />
            {/* Sun body */}
            <div className="relative w-20 h-20 sm:w-28 sm:h-28 bg-gradient-to-br from-yellow-200 via-yellow-300 to-orange-300 rounded-full shadow-lg">
              {/* Sun rays */}
              <div className="absolute inset-0 animate-spin-slow">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-1/2 left-1/2 w-1 bg-gradient-to-t from-yellow-300 to-transparent"
                    style={{
                      height: "140%",
                      transformOrigin: "center bottom",
                      transform: `translateX(-50%) translateY(-100%) rotate(${i * 30}deg)`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Moon */}
      {showMoon && (
        <div className="absolute top-16 right-16 sm:top-20 sm:right-24">
          <div className="relative">
            {/* Moon glow */}
            <div className="absolute inset-0 w-20 h-20 sm:w-24 sm:h-24 bg-slate-200 rounded-full blur-xl opacity-60" />
            {/* Moon body */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 rounded-full shadow-lg">
              {/* Moon craters */}
              <div className="absolute top-3 left-4 w-3 h-3 bg-slate-300/50 rounded-full" />
              <div className="absolute top-8 left-2 w-2 h-2 bg-slate-300/40 rounded-full" />
              <div className="absolute bottom-4 right-3 w-4 h-4 bg-slate-300/30 rounded-full" />
            </div>
          </div>
        </div>
      )}

      {/* Clouds */}
      {showClouds && (
        <div className="absolute inset-0">
          {/* Cloud 1 - Large, slow */}
          <div 
            className={cn(
              "absolute animate-cloud-drift-1",
              isPartlyCloudy ? "opacity-60" : "opacity-80"
            )}
            style={{ top: "8%", left: "-20%" }}
          >
            <Cloud size="large" />
          </div>
          
          {/* Cloud 2 - Medium, different speed */}
          <div 
            className={cn(
              "absolute animate-cloud-drift-2",
              isPartlyCloudy ? "opacity-50" : "opacity-70"
            )}
            style={{ top: "15%", left: "-15%" }}
          >
            <Cloud size="medium" />
          </div>
          
          {/* Cloud 3 - Small, faster */}
          <div 
            className={cn(
              "absolute animate-cloud-drift-3",
              isPartlyCloudy ? "opacity-40" : "opacity-60"
            )}
            style={{ top: "5%", left: "-10%" }}
          >
            <Cloud size="small" />
          </div>

          {/* Additional clouds for heavy overcast */}
          {!isPartlyCloudy && (
            <>
              <div className="absolute animate-cloud-drift-4 opacity-70" style={{ top: "20%", left: "-25%" }}>
                <Cloud size="large" />
              </div>
              <div className="absolute animate-cloud-drift-5 opacity-50" style={{ top: "12%", left: "-18%" }}>
                <Cloud size="medium" />
              </div>
            </>
          )}
        </div>
      )}

      {/* Snow particles */}
      {particles.map((particle) => particle.type === "snow" && (
        <div
          key={particle.id}
          className="absolute animate-snowfall"
          style={{
            left: `${particle.left}%`,
            top: "-10px",
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        >
          <div 
            className="bg-white rounded-full shadow-sm"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              boxShadow: "0 0 3px rgba(255,255,255,0.8)",
            }}
          />
        </div>
      ))}

      {/* Rain particles */}
      {particles.map((particle) => particle.type === "rain" && (
        <div
          key={particle.id}
          className="absolute animate-rainfall"
          style={{
            left: `${particle.left}%`,
            top: "-20px",
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        >
          <div 
            className="bg-gradient-to-b from-sky-300 to-sky-500 rounded-full"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size * 8}px`,
              opacity: particle.opacity,
            }}
          />
        </div>
      ))}

      {/* Fog/Mist effect */}
      {(condition === "mist" || condition === "fog" || condition === "haze") && (
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-white/20 to-transparent animate-fog-drift-1" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-200/30 via-slate-100/15 to-transparent animate-fog-drift-2" />
        </div>
      )}

      {/* Lightning for thunderstorms */}
      {condition === "thunderstorm" && (
        <div className="absolute inset-0">
          <div className="animate-lightning-flash" />
        </div>
      )}
    </div>
  );
}

// Cloud component
function Cloud({ size }: { size: "small" | "medium" | "large" }) {
  const sizeClasses = {
    small: "w-24 h-12",
    medium: "w-36 h-16",
    large: "w-48 h-20",
  };

  return (
    <div className={cn("relative", sizeClasses[size])}>
      {/* Cloud shape using multiple circles */}
      <div className="absolute bottom-0 left-[10%] w-[40%] h-[80%] bg-white/80 rounded-full" />
      <div className="absolute bottom-0 left-[30%] w-[50%] h-full bg-white/80 rounded-full" />
      <div className="absolute bottom-0 right-[10%] w-[45%] h-[70%] bg-white/80 rounded-full" />
      <div className="absolute bottom-0 left-[20%] w-[60%] h-[50%] bg-white/80 rounded-full" />
    </div>
  );
}
