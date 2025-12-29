"use client";

import { useState, useCallback, useEffect } from "react";
import type {
  UserProfile,
  VehiclePreferences,
  DecisionResult,
} from "@/types";

import { generateDecision } from "@/lib/decisionEngine";
import {
  useSessionPersistence,
  getSavedSession,
  clearSession,
  getSessionSummary,
  type SavedSession,
} from "@/hooks/useSessionPersistence";
import { QuirkHeader, ProgressSteps, Card, Button } from "@/components/ui";
import { IconCar, IconAlertTriangle, IconRefresh } from "@/components/icons";
import { LandingPage } from "@/components/steps/LandingPage";
import { ProfileStep } from "@/components/steps/ProfileStep";
import { ScenariosStep } from "@/components/steps/ScenariosStep";
import { ResultsPage } from "@/components/steps/ResultsPage";

type Step = "landing" | "profile" | "scenarios" | "results";

type AppState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: DecisionResult }
  | { status: "error"; message: string };

const DEFAULT_USER: UserProfile = {
  monthlyIncome: 0,
  monthlyExpenses: 0,
  currentSavings: 0,
  savingsGoalMonths: 6,
};

const DEFAULT_PREFERENCES: VehiclePreferences = {
  vehiclePrice: 0,
  downPayment: 0,
  creditTier: "good",
  annualMiles: 12000,
  ownershipStyle: "undecided",
  priorities: [],
  financeTerm: 72,
};

export default function Page() {
  const [step, setStep] = useState<Step>("landing");
  const [appState, setAppState] = useState<AppState>({ status: "idle" });
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER);
  const [preferences, setPreferences] = useState<VehiclePreferences>(DEFAULT_PREFERENCES);

  // Session recovery state
  const [savedSession, setSavedSession] = useState<SavedSession | null>(null);
  const [showRecoveryPrompt, setShowRecoveryPrompt] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Auto-save progress
  const { clearSavedSession } = useSessionPersistence(
    step,
    profile,
    preferences,
    isHydrated && step !== "landing" && step !== "results"
  );

  // Check for saved session on mount
  useEffect(() => {
    const session = getSavedSession();
    if (session) {
      setSavedSession(session);
      setShowRecoveryPrompt(true);
    }
    setIsHydrated(true);
  }, []);

  // Handle restoring saved session
  const handleResumeSession = useCallback(() => {
    if (savedSession) {
      setProfile(savedSession.profile);
      setPreferences(savedSession.preferences);
      setStep(savedSession.step);
      setShowRecoveryPrompt(false);
      setSavedSession(null);
    }
  }, [savedSession]);

  // Handle dismissing recovery prompt
  const handleStartFresh = useCallback(() => {
    clearSession();
    setShowRecoveryPrompt(false);
    setSavedSession(null);
  }, []);

  const runDecision = useCallback(() => {
    setAppState({ status: "loading" });

    try {
      const result = generateDecision(profile, preferences);
      setAppState({ status: "success", result });
      setStep("results");
      // Clear saved session on successful completion
      clearSavedSession();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      setAppState({ status: "error", message: msg });
    }
  }, [profile, preferences, clearSavedSession]);

  const handleStartOver = useCallback(() => {
    setStep("landing");
    setAppState({ status: "idle" });
    setProfile(DEFAULT_USER);
    setPreferences(DEFAULT_PREFERENCES);
    clearSavedSession();
  }, [clearSavedSession]);

  const currentStepIndex = { landing: -1, profile: 0, scenarios: 1, results: 2 }[step];

  return (
    <div className="min-h-screen bg-[#030712] relative overflow-hidden">
      {/* Animated Mesh Gradient Background */}
      <div className="mesh-gradient" />
      <div className="grain-overlay" />
      
      {/* Floating Orbs - Different positions for inner pages */}
      {step !== "landing" && (
        <>
          <div className="absolute top-10 left-[5%] w-64 h-64 bg-emerald-500/15 rounded-full blur-[100px] floating-orb" />
          <div className="absolute bottom-20 right-[10%] w-80 h-80 bg-teal-500/10 rounded-full blur-[120px] floating-orb" style={{ animationDelay: '-3s' }} />
          <div className="absolute top-1/3 right-[5%] w-48 h-48 bg-cyan-500/10 rounded-full blur-[80px] floating-orb" style={{ animationDelay: '-5s' }} />
        </>
      )}

      {/* Session Recovery Prompt */}
      {showRecoveryPrompt && savedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md animate-fade-in-up">
            <Card className="!p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center flex-shrink-0">
                  <IconRefresh className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Welcome back!
                  </h3>
                  <p className="text-slate-400 text-sm mb-4">
                    We found {getSessionSummary(savedSession)}. Would you like to continue where you left off?
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleResumeSession}
                      className="flex-1"
                    >
                      Continue
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={handleStartFresh}
                      className="flex-1"
                    >
                      Start Fresh
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {step === "landing" ? (
          <LandingPage onStart={() => setStep("profile")} />
        ) : (
          <div className="px-4 py-8 sm:py-12">
            {/* Quirk Logo Header */}
            <QuirkHeader />

            {/* App Header */}
            <header className="max-w-4xl mx-auto mb-10">
              {/* Brand */}
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl blur-md opacity-50" />
                  <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                    <IconCar className="w-5 h-5 text-white" />
                  </div>
                </div>
                <span className="text-xl font-bold text-white tracking-tight">DriveDecision</span>
              </div>

              {/* Progress Steps */}
              {step !== "results" && (
                <ProgressSteps
                  currentStep={currentStepIndex}
                  steps={["Your Profile", "Your Preferences", "Your Decision"]}
                />
              )}
            </header>

            {/* Error Banner */}
            {appState.status === "error" && (
              <div className="max-w-xl mx-auto mb-8 animate-fade-in-up">
                <Card className="!p-4 border-red-500/30 bg-red-500/5">
                  <div className="flex items-center gap-3 text-red-400">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                      <IconAlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">Something went wrong</p>
                      <p className="text-sm text-red-400/70">{appState.message}</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Step Content */}
            <div className="animate-fade-in-up">
              {step === "profile" && (
                <ProfileStep
                  profile={profile}
                  setProfile={setProfile}
                  onNext={() => setStep("scenarios")}
                  onBack={() => setStep("landing")}
                />
              )}

              {step === "scenarios" && (
                <ScenariosStep
                  preferences={preferences}
                  setPreferences={setPreferences}
                  onSubmit={runDecision}
                  onBack={() => setStep("profile")}
                  isLoading={appState.status === "loading"}
                />
              )}

              {step === "results" && appState.status === "success" && (
                <ResultsPage
                  result={appState.result}
                  onStartOver={handleStartOver}
                  onBack={() => setStep("scenarios")}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
