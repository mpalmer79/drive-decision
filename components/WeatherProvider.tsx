"use client";

import { WeatherOverlay } from "@/components/WeatherOverlay";

export function WeatherProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <WeatherOverlay zipCode="03103" />
      {children}
    </>
  );
}
