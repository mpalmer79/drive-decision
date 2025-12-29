// hooks/useSessionPersistence.ts
// Persist user progress to localStorage to recover from accidental refresh

import { useEffect, useCallback, useRef } from "react";
import type { UserProfile, VehiclePreferences } from "@/types";

const STORAGE_KEY = "drivedecision_session";
const SESSION_EXPIRY_HOURS = 24;

export interface SavedSession {
  step: "landing" | "profile" | "scenarios" | "results";
  profile: UserProfile;
  preferences: VehiclePreferences;
  savedAt: number; // timestamp
}

/**
 * Check if a saved session exists and is still valid
 */
export function getSavedSession(): SavedSession | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const session: SavedSession = JSON.parse(stored);

    // Check if session has expired
    const expiryTime = SESSION_EXPIRY_HOURS * 60 * 60 * 1000;
    if (Date.now() - session.savedAt > expiryTime) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    // Don't restore if they were on landing or already completed (results)
    if (session.step === "landing" || session.step === "results") {
      return null;
    }

    // Validate that we have meaningful data to restore
    const hasProfileData =
      session.profile.monthlyIncome > 0 ||
      session.profile.monthlyExpenses > 0 ||
      session.profile.currentSavings > 0;

    const hasPreferencesData =
      session.preferences.vehiclePrice > 0 ||
      session.preferences.downPayment > 0;

    if (!hasProfileData && !hasPreferencesData) {
      return null;
    }

    return session;
  } catch {
    // Invalid JSON or other error
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

/**
 * Save session to localStorage
 */
export function saveSession(session: Omit<SavedSession, "savedAt">): void {
  if (typeof window === "undefined") return;

  try {
    const data: SavedSession = {
      ...session,
      savedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage might be full or disabled
    console.warn("Failed to save session to localStorage");
  }
}

/**
 * Clear saved session
 */
export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Hook to automatically persist session state
 */
export function useSessionPersistence(
  step: SavedSession["step"],
  profile: UserProfile,
  preferences: VehiclePreferences,
  enabled: boolean = true
) {
  // Use ref to track if we should save (avoid saving on initial load)
  const hasInteracted = useRef(false);

  // Mark as interacted after first render
  useEffect(() => {
    const timer = setTimeout(() => {
      hasInteracted.current = true;
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-save on state changes (debounced)
  useEffect(() => {
    if (!enabled || !hasInteracted.current) return;

    // Don't save landing or results
    if (step === "landing" || step === "results") return;

    const timer = setTimeout(() => {
      saveSession({ step, profile, preferences });
    }, 500); // Debounce saves

    return () => clearTimeout(timer);
  }, [step, profile, preferences, enabled]);

  // Clear session handler
  const clearSavedSession = useCallback(() => {
    clearSession();
  }, []);

  return { clearSavedSession };
}

/**
 * Format the saved session for display
 */
export function getSessionSummary(session: SavedSession): string {
  const parts: string[] = [];

  if (session.preferences.vehiclePrice > 0) {
    parts.push(`$${session.preferences.vehiclePrice.toLocaleString()} vehicle`);
  }

  if (session.step === "scenarios") {
    parts.push("preferences step");
  } else if (session.step === "profile") {
    parts.push("profile step");
  }

  if (parts.length === 0) {
    return "your previous session";
  }

  return parts.join(" • ");
}
