"use client";

import { useMemo, useState } from "react";
import type { BuyScenario, LeaseScenario, UserProfile, DecisionResult } from "@/types";

type ApiState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: DecisionResult; explain?: unknown }
  | { status: "error"; message: string };

function toNumber(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function Card(props: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-zinc-900">{props.title}</h2>
      <div className="mt-3 space-y-3">{props.children}</div>
    </section>
  );
}

function Field(props: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium text-zinc-800">{props.label}</span>
        {props.hint ? <span className="text-[11px] text-zinc-500">{props.hint}</span> : null}
      </div>
      <div className="mt-1">{props.children}</div>
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900",
        "placeholder:text-zinc-400",
        "focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400",
        "disabled:bg-zinc-50 disabled:text-zinc-500",
        props.className ?? ""
      ].join(" ")}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={[
        "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900",
        "focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400",
        "disabled:bg-zinc-50 disabled:text-zinc-500",
        props.className ?? ""
      ].join(" ")}
    />
  );
}

function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" }) {
  const variant = props.variant ?? "secondary";
  const base =
    "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50";

  const styles =
    variant === "primary"
      ? "bg-zinc-900 text-white hover:bg-zinc-800"
      : "border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50";

  const { className, variant: _v, ...rest } = props;

  return <button {...rest} className={[base, styles, className ?? ""].join(" ")} />;
}

export default function Page() {
  const [user, setUser] = useState<UserProfile>({
    monthlyNetIncome: 6500,
    monthlyFixedExpenses: 3800,
    currentSavings: 12000,
    creditScoreBand: "680_739",
    riskTolerance: "medium"
  });

  const [buy, setBuy] = useState<BuyScenario>({
    vehiclePrice: 42000,
    downPayment: 4000,
    aprPercent: 7.2,
    termMonths: 72,
    estMonthlyInsurance: 220,
    estMonthlyMaintenance: 90,
    ownershipMonths: 48
  });

  const [lease, setLease] = useState<LeaseScenario>({
    msrp: 45000,
    monthlyPayment: 499,
    dueAtSigning: 2500,
    termMonths: 36,
    mileageAllowancePerYear: 12000,
    estMilesPerYear: 14000,
    estExcessMileFee: 0.25,
    estMonthlyInsurance: 230,
    estMonthlyMaintenance: 40,
    leaseEndPlan: "return"
  });

  const [api, setApi] = useState<ApiState>({ status: "idle" });

  const payload = useMemo(() => ({ user, buy, lease }), [user, buy, lease]);

  const isLoading = api.status === "loading";
  const canExplain = api.status === "success";

  async function runDecision() {
    setApi({ status: "loading" });

    try {
      const res = await fetch("/api/decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = data?.error ?? `Request failed (${res.status})`;
        setApi({ status: "error", message: msg });
        return;
      }

      setApi({ status: "success", result: data as DecisionResult });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Network error";
      setApi({ status: "error", message: msg });
    }
  }

  async function runExplain() {
    if (api.status !== "success") return;

    setApi({ status: "loading" });

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          result: api.result,
          buy,
          lease,
          verbosity: "short",
          useAI: false
        })
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = data?.error ?? `Request failed (${res.status})`;
        setApi({ status: "error", message: msg });
        return;
      }

      setApi({ status: "success", result: api.result, explain: data });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Network error";
      setApi({ status: "error", message: msg });
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-tight">DriveDecision</h1>
          <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-600 shadow-sm">
            Beta
          </span>
        </div>

        <p className="text-sm text-zinc-600">
          Minimal test UI. Run <span className="font-mono">/api/decision</span>, then{" "}
          <span className="font-mono">/api/explain</span>.
        </p>
      </header>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="User">
          <Field label="Monthly net income">
            <Input
              value={String(user.monthlyNetIncome)}
              onChange={(e) => setUser({ ...user, monthlyNetIncome: toNumber(e.target.value) })}
              type="number"
            />
          </Field>

          <Field label="Monthly fixed expenses">
            <Input
              value={String(user.monthlyFixedExpenses)}
              onChange={(e) => setUser({ ...user, monthlyFixedExpenses: toNumber(e.target.value) })}
              type="number"
            />
          </Field>

          <Field label="Current savings">
            <Input
              value={String(user.currentSavings)}
              onChange={(e) => setUser({ ...user, currentSavings: toNumber(e.target.value) })}
              type="number"
            />
          </Field>

          <Field label="Credit score band">
            <Select
              value={user.creditScoreBand}
              onChange={(e) => setUser({ ...user, creditScoreBand: e.target.value as UserProfile["creditScoreBand"] })}
            >
              <option value="below_620">below_620</option>
              <option value="620_679">620_679</option>
              <option value="680_739">680_739</option>
              <option value="740_plus">740_plus</option>
            </Select>
          </Field>

          <Field label="Risk tolerance">
            <Select
              value={user.riskTolerance}
              onChange={(e) => setUser({ ...user, riskTolerance: e.target.value as UserProfile["riskTolerance"] })}
            >
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </Select>
          </Field>
        </Card>

        <Card title="Buy">
          <Field label="Vehicle price">
            <Input
              value={String(buy.vehiclePrice)}
              onChange={(e) => setBuy({ ...buy, vehiclePrice: toNumber(e.target.value) })}
              type="number"
            />
          </Field>

          <Field label="Down payment">
            <Input
              value={String(buy.downPayment)}
              onChange={(e) => setBuy({ ...buy, downPayment: toNumber(e.target.value) })}
              type="number"
            />
          </Field>

          <Field label="APR (%)" hint="Example: 7.25">
            <Input
              value={String(buy.aprPercent)}
              onChange={(e) => setBuy({ ...buy, aprPercent: toNumber(e.target.value) })}
              type="number"
              step="0.01"
            />
          </Field>

          <Field label="Term (months)">
            <Input
              value={String(buy.termMonths)}
              onChange={(e) => setBuy({ ...buy, termMonths: Math.floor(toNumber(e.target.value)) })}
              type="number"
            />
          </Field>

          <Field label="Est. monthly insurance">
            <Input
              value={String(buy.estMonthlyInsurance)}
              onChange={(e) => setBuy({ ...buy, estMonthlyInsurance: toNumber(e.target.value) })}
              type="number"
            />
          </Field>

          <Field label="Est. monthly maintenance">
            <Input
              value={String(buy.estMonthlyMaintenance)}
              onChange={(e) => setBuy({ ...buy, estMonthlyMaintenance: toNumber(e.target.value) })}
              type="number"
            />
          </Field>

          <Field label="Ownership horizon (months)">
            <Input
              value={String(buy.ownershipMonths)}
              onChange={(e) => setBuy({ ...buy, ownershipMonths: Math.floor(toNumber(e.target.value)) })}
              type="number"
            />
          </Field>
        </Card>

        <Card title="Lease">
          <Field label="MSRP">
            <Input value={String(lease.msrp)} onChange={(e) => setLease({ ...lease, msrp: toNumber(e.target.value) })} type="number" />
          </Field>

          <Field label="Monthly payment">
            <Input
              value={String(lease.monthlyPayment)}
              onChange={(e) => setLease({ ...lease, monthlyPayment: toNumber(e.target.value) })}
              type="number"
            />
          </Field>

          <Field label="Due at signing">
            <Input
              value={String(lease.dueAtSigning)}
              onChange={(e) => setLease({ ...lease, dueAtSigning: toNumber(e.target.value) })}
              type="number"
            />
          </Field>

          <Field label="Term (months)">
            <Input
              value={String(lease.termMonths)}
              onChange={(e) => setLease({ ...lease, termMonths: Math.floor(toNumber(e.target.value)) })}
              type="number"
            />
          </Field>

          <Field label="Mileage allowance / year">
            <Input
              value={String(lease.mileageAllowancePerYear)}
              onChange={(e) => setLease({ ...lease, mileageAllowancePerYear: Math.floor(toNumber(e.target.value)) })}
              type="number"
            />
          </Field>

          <Field label="Estimated miles / year">
            <Input
              value={String(lease.estMilesPerYear)}
              onChange={(e) => setLease({ ...lease, estMilesPerYear: Math.floor(toNumber(e.target.value)) })}
              type="number"
            />
          </Field>

          <Field label="Excess mile fee ($/mile)" hint="Example: 0.25">
            <Input
              value={String(lease.estExcessMileFee)}
              onChange={(e) => setLease({ ...lease, estExcessMileFee: toNumber(e.target.value) })}
              type="number"
              step="0.01"
            />
          </Field>

          <Field label="Est. monthly insurance">
            <Input
              value={String(lease.estMonthlyInsurance)}
              onChange={(e) => setLease({ ...lease, estMonthlyInsurance: toNumber(e.target.value) })}
              type="number"
            />
          </Field>

          <Field label="Est. monthly maintenance">
            <Input
              value={String(lease.estMonthlyMaintenance)}
              onChange={(e) => setLease({ ...lease, estMonthlyMaintenance: toNumber(e.target.value) })}
              type="number"
            />
          </Field>

          <Field label="Lease end plan">
            <Select
              value={lease.leaseEndPlan}
              onChange={(e) => setLease({ ...lease, leaseEndPlan: e.target.value as LeaseScenario["leaseEndPlan"] })}
            >
              <option value="return">return</option>
              <option value="buyout">buyout</option>
            </Select>
          </Field>

          {lease.leaseEndPlan === "buyout" ? (
            <Field label="Estimated buyout price">
              <Input
                value={String(lease.estBuyoutPrice ?? 0)}
                onChange={(e) => setLease({ ...lease, estBuyoutPrice: toNumber(e.target.value) })}
                type="number"
              />
            </Field>
          ) : null}
        </Card>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={runDecision} disabled={isLoading} variant="primary">
          Run /api/decision
        </Button>

        <Button onClick={runExplain} disabled={!canExplain || isLoading}>
          Run /api/explain
        </Button>

        {api.status === "loading" ? (
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700" />
            Working...
          </div>
        ) : null}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">Payload</h2>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-zinc-50 p-3 text-xs leading-relaxed text-zinc-800">
            {JSON.stringify(payload, null, 2)}
          </pre>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">Result</h2>

          <div className="mt-3">
            {api.status === "idle" ? <div className="text-sm text-zinc-600">Click Run to test.</div> : null}
            {api.status === "error" ? <div className="text-sm text-red-600">{api.message}</div> : null}

            {api.status === "success" ? (
              <div className="space-y-4">
                <pre className="overflow-x-auto rounded-lg bg-zinc-50 p-3 text-xs leading-relaxed text-zinc-800">
                  {JSON.stringify(api.result, null, 2)}
                </pre>

                {api.explain ? (
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-700">Explain</h3>
                    <pre className="mt-2 overflow-x-auto rounded-lg bg-zinc-50 p-3 text-xs leading-relaxed text-zinc-800">
                      {JSON.stringify(api.explain, null, 2)}
                    </pre>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <footer className="mt-10 text-xs text-zinc-500">
        Tip: keep deterministic math in <span className="font-mono">/lib</span>. Let AI explain only computed results.
      </footer>
    </main>
  );
}
