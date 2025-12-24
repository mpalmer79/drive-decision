"use client";

import { useState, useCallback, useMemo } from "react";
import type {
  BuyScenario,
  LeaseScenario,
  UserProfile,
  DecisionResult,
} from "@/types";

import { QuirkHeader, ProgressSteps } from "@/components/ui";
import { IconCar, IconAlertTriangle } from "@/components/icons";
import { LandingPage } from "@/components/steps/LandingPage";
import { ProfileStep } from "@/components/steps/ProfileStep";
import { ScenariosStep } from "@/components/steps/ScenariosStep";
import { ResultsPage } from "@/components/steps/ResultsPage";

type Step = "landing" | "profile" | "scenarios" | "results";

type ApiState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: DecisionResult }
  | { status: "error"; message: string };

const DEFAULT_USER: UserProfile = {
  monthlyNetIncome: 0,
  monthlyFixedExpenses: 0,
  currentSavings: 0,
  creditScoreBand: "680_739",
  riskTolerance: "medium",
};

const DEFAULT_BUY: BuyScenario = {
  vehiclePrice: 0,
  downPayment: 0,
  aprPercent: 0,
  termMonths: 72,
  estMonthlyInsurance: 0,
  estMonthlyMaintenance: 0,
  ownershipMonths: 48,
};

const DEFAULT_LEASE: LeaseScenario = {
  msrp: 0,
  monthlyPayment: 0,
  dueAtSigning: 0,
  termMonths: 36,
  mileageAllowancePerYear: 12000,
  estMilesPerYear: 12000,
  estExcessMileFee: 0.25,
  estMonthlyInsurance: 0,
  estMonthlyMaintenance: 0,
  leaseEndPlan: "return",
};

export default function Page() {
  const [step, setStep] = useState<Step>("landing");
  const [api, setApi] = useState<ApiState>({ status: "idle" });

  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [buy, setBuy] = useState<BuyScenario>(DEFAULT_BUY);
  const [lease, setLease] = useState<LeaseScenario>(DEFAULT_LEASE);

  const payload = useMemo(() => ({ user, buy, lease }), [user, buy, lease]);

  const runDecision = useCallback(async () => {
    setApi({ status: "loading" });

    try {
      const res = await fetch("/api/decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = data?.error ?? `Request failed (${res.status})`;
        setApi({ status: "error", message: msg });
        return;
      }

      setApi({ status: "success", result: data as DecisionResult });
      setStep("results");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Network error";
      setApi({ status: "error", message: msg });
    }
  }, [payload]);

  const handleStartOver = useCallback(() => {
    setStep("landing");
    setApi({ status: "idle" });
    setUser(DEFAULT_USER);
    setBuy(DEFAULT_BUY);
    setLease(DEFAULT_LEASE);
  }, []);

  const currentStepIndex = { landing: -1, profile: 0, scenarios: 1, results: 2 }[step];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {step === "landing" ? (
          <LandingPage onStart={() => setStep("profile")} />
        ) : (
          <div className="px-4 py-8 sm:py-12">
            {/* Quirk Logo Header */}
            <QuirkHeader />

            {/* App Header */}
            <header className="max-w-4xl mx-auto mb-8">
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <IconCar className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">DriveDecision</span>
              </div>

              {step !== "results" && (
                <ProgressSteps
                  currentStep={currentStepIndex}
                  steps={["Your Profile", "Compare Options", "Your Decision"]}
                />
              )}
            </header>

            {/* Error Banner */}
            {api.status === "error" && (
              <div className="max-w-xl mx-auto mb-6">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <IconAlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <span>{api.message}</span>
                </div>
              </div>
            )}

            {/* Step Content */}
            {step === "profile" && (
              <ProfileStep
                user={user}
                setUser={setUser}
                onNext={() => setStep("scenarios")}
                onBack={() => setStep("landing")}
              />
            )}

            {step === "scenarios" && (
              <ScenariosStep
                buy={buy}
                setBuy={setBuy}
                lease={lease}
                setLease={setLease}
                onSubmit={runDecision}
                onBack={() => setStep("profile")}
                isLoading={api.status === "loading"}
              />
            )}

            {step === "results" && api.status === "success" && (
              <ResultsPage
                result={api.result}
                buy={buy}
                lease={lease}
                onStartOver={handleStartOver}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
