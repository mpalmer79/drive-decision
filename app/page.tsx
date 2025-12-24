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
    <main style={{ padding: 24, maxWidth: 980, margin: "0 auto", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif" }}>
      <h1 style={{ margin: 0 }}>DriveDecision</h1>
      <p style={{ marginTop: 8 }}>
        Minimal test UI. Run <code>/api/decision</code>, then <code>/api/explain</code>.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 16 }}>
        <section style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
          <h2 style={{ marginTop: 0, fontSize: 16 }}>User</h2>

          <label style={{ display: "block", marginBottom: 8 }}>
            Monthly net income
            <input
              value={String(user.monthlyNetIncome)}
              onChange={(e) => setUser({ ...user, monthlyNetIncome: toNumber(e.target.value) })}
              type="number"
              style={{ width: "100%" }}
            />
          </label>

          <label style={{ display: "block", marginBottom: 8 }}>
            Monthly fixed expenses
            <input
              value={String(user.monthlyFixedExpenses)}
              onChange={(e) => setUser({ ...user, monthlyFixedExpenses: toNumber(e.target.value) })}
              type="number"
              style={{ width: "100%" }}
            />
          </label>

          <label style={{ display: "block", marginBottom: 8 }}>
            Current savings
            <input
              value={String(user.currentSavings)}
              onChange={(e) => setUser({ ...user, currentSavings: toNumber(e.target.value) })}
              type="number"
              style={{ width: "100%" }}
            />
          </label>

          <label style={{ display: "block", marginBottom: 8 }}>
            Credit score band
            <select
              value={user.creditScoreBand}
              onChange={(e) => setUser({ ...user, creditScoreBand: e.target.value as UserProfile["creditScoreBand"] })}
              style={{ width: "100%" }}
            >
              <option value="below_620">below_620</option>
              <option value="620_679">620_679</option>
              <option value="680_739">680_739</option>
              <option value="740_plus">740_plus</option>
            </select>
          </label>

          <label style={{ display: "block", marginBottom: 0 }}>
            Risk tolerance
            <select
              value={user.riskTolerance}
              onChange={(e) => setUser({ ...user, riskTolerance: e.target.value as UserProfile["riskTolerance"] })}
              style={{ width: "100%" }}
            >
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
          </label>
        </section>

        <section style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
          <h2 style={{ marginTop: 0, fontSize: 16 }}>Buy</h2>

          <label style={{ display: "block", marginBottom: 8 }}>
            Vehicle price
            <input
              value={String(buy.vehiclePrice)}
              onChange={(e) => setBuy({ ...buy, vehiclePrice: toNumber(e.target.value) })}
              type="number"
              style={{ width: "100%" }}
            />
          </label>

          <label style={{ display: "block", marginBottom: 8 }}>
            Down payment
            <input
              value={String(buy.downPayment)}
              onChange={(e) => setBuy({ ...buy, downPayment: toNumber(e.target.value) })}
              type="number"
              style={{ width: "100%" }}
            />
          </label>

          <label style={{ display: "block", marginBottom: 8 }}>
            APR (%)
            <input
              value={String(buy.aprPercent)}
              onChange={(e) => setBuy({ ...buy, aprPercent: toNumber(e.target.value) })}
              type="number"
              step="0.01"
              style={{ width: "100%" }}
            />
          </label>

          <label style={{ display: "block", marginBottom: 8 }}>
            Term (months)
            <input
              value={String(buy.termMonths)}
              onChange={(e) => setBuy({ ...buy, termMonths: Math.floor(toNumber(e.target.value)) })}
              type="number"
              style={{ width: "100%" }}
            />
          </label>

          <label style={{ display: "block", marginBottom: 8 }}>
            Est. monthly insurance
            <input
              value={String(buy.estMonthlyInsurance)}
              onChange={(e) => setBuy({ ...buy, estMonthlyInsurance: toNumber(e.target.value) })}
              type="number"
              style={{ width: "100%" }}
            />
          </label>

          <label style={{ display: "block", marginBottom: 8 }}>
            Est. monthly maintenance
            <input
              value={String(buy.estMonthlyMaintenance)}
              onChange={(e) => setBuy({ ...buy, estMonthlyMaintenance: toNumber(e.target.value) })}
              type="number"
              style={{ width: "100%" }}
            />
          </label>

          <label style={{ display: "block", marginBottom: 0 }}>
            Ownership horizon (months)
            <input
              value={String(buy.ownershipMonths)}
              onChange={(e) => setBuy({ ...buy, ownershipMonths: Math.floor(toNumber(e.target.value)) })}
              type="number"
              style={{ width: "100%" }}
            />
          </label>
        </section>

        <section style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
          <h2 style={{ marginTop: 0, fontSize: 16 }}>Lease</h2>

          <label style={{ display: "block", marginBottom: 8 }}>
            MSRP
            <input
              value={String(lease.msrp)}
              onChange={(e) => setLease({ ...lease, msrp: toNumber(e.target.value) })}
              type="number"
              style={{ width: "100%" }}
            />
          </label>

          <label style={{ display: "block", marginBottom: 8 }}>
            Monthly payment
            <input
              value={String(lease.monthlyPayment)}
              onChange={(e) => setLease({ ...lease, monthlyPayment: toNumber(e.target.value) })}
              type="number"
              style={{ width: "100%" }}
            />
          </label>

          <label style={{ display: "block", marginBottom: 8 }}>
            Due at signing
            <input
              value={String(lease.dueAtSigning)}
              onChange={(e) => setLease({ ...lease, dueAtSigning: toNumber(e.target.value) })}
              type="number"
              style={{ width: "100%" }}
            />
          </label>

          <label style={{ display: "block", marginBottom: 8 }}>
            Term (months)
            <input
              value={String(lease.termMonths)}
              onChange={(e) => setLease({ ...lease, termMonths: Math.floor(toNumber(e.target.value)) })}
              type="number"
              style={{ width: "100%" }}
            />
          </label>

          <label style={{ display: "block", marginBottom: 8 }}>
            Mileage allowance / year
            <input
              value={String(lease.mileageAllowancePerYear)}
              onChange={(e) => setLease({ ...lease, mileageAllowancePerYear: Math.floor(toNumber(e.target.value)) })}
              type="number"
              style={{ width: "100%" }}
            />
          </label>

          <label style={{ display: "block", marginBottom: 8 }}>
            Estimated miles / year
            <input
              value={String(lease.estMilesPerYear)}
              onChange={(e) => setLease({ ...lease, estMilesPerYear: Math.floor(toNumber(e.target.value)) })}
              type="number"
              style={{ width: "100%" }}
            />
          </label>

          <label style={{ display: "block", marginBottom: 8 }}>
            Excess mile fee ($/mile)
            <input
              value={String(lease.estExcessMileFee)}
              onChange={(e) => setLease({ ...lease, estExcessMileFee: toNumber(e.target.value) })}
              type="number"
              step="0.01"
              style={{ width: "100%" }}
            />
          </label>

          <label style={{ display: "block", marginBottom: 8 }}>
            Est. monthly insurance
            <input
              value={String(lease.estMonthlyInsurance)}
              onChange={(e) => setLease({ ...lease, estMonthlyInsurance: toNumber(e.target.value) })}
              type="number"
              style={{ width: "100%" }}
            />
          </label>

          <label style={{ display: "block", marginBottom: 8 }}>
            Est. monthly maintenance
            <input
              value={String(lease.estMonthlyMaintenance)}
              onChange={(e) => setLease({ ...lease, estMonthlyMaintenance: toNumber(e.target.value) })}
              type="number"
              style={{ width: "100%" }}
            />
          </label>

          <label style={{ display: "block", marginBottom: 0 }}>
            Lease end plan
            <select
              value={lease.leaseEndPlan}
              onChange={(e) => setLease({ ...lease, leaseEndPlan: e.target.value as LeaseScenario["leaseEndPlan"] })}
              style={{ width: "100%" }}
            >
              <option value="return">return</option>
              <option value="buyout">buyout</option>
            </select>
          </label>

          {lease.leaseEndPlan === "buyout" ? (
            <label style={{ display: "block", marginTop: 8 }}>
              Estimated buyout price
              <input
                value={String(lease.estBuyoutPrice ?? 0)}
                onChange={(e) => setLease({ ...lease, estBuyoutPrice: toNumber(e.target.value) })}
                type="number"
                style={{ width: "100%" }}
              />
            </label>
          ) : null}
        </section>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <button onClick={runDecision} disabled={api.status === "loading"} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #333", cursor: "pointer" }}>
          Run /api/decision
        </button>

        <button onClick={runExplain} disabled={api.status !== "success" || api.status === "loading"} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #333", cursor: "pointer" }}>
          Run /api/explain
        </button>
      </div>

      <section style={{ marginTop: 18 }}>
        <h2 style={{ fontSize: 16, marginBottom: 8 }}>Payload</h2>
        <pre style={{ background: "#f7f7f7", padding: 12, borderRadius: 8, overflowX: "auto" }}>
          {JSON.stringify(payload, null, 2)}
        </pre>
      </section>

      <section style={{ marginTop: 18 }}>
        <h2 style={{ fontSize: 16, marginBottom: 8 }}>Result</h2>

        {api.status === "idle" ? <div style={{ color: "#666" }}>Click Run to test.</div> : null}
        {api.status === "loading" ? <div>Loading...</div> : null}
        {api.status === "error" ? <div style={{ color: "crimson" }}>{api.message}</div> : null}

        {api.status === "success" ? (
          <>
            <pre style={{ background: "#f7f7f7", padding: 12, borderRadius: 8, overflowX: "auto" }}>
              {JSON.stringify(api.result, null, 2)}
            </pre>

            {api.explain ? (
              <>
                <h3 style={{ fontSize: 14, marginTop: 14 }}>Explain</h3>
                <pre style={{ background: "#f7f7f7", padding: 12, borderRadius: 8, overflowX: "auto" }}>
                  {JSON.stringify(api.explain, null, 2)}
                </pre>
              </>
            ) : null}
          </>
        ) : null}
      </section>
    </main>
  );
}

