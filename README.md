# Quirk AI - DriveDecision

**DriveDecision** is a decision engine powered by Quirk AI that helps consumers determine whether buying or leasing a vehicle is the financially safer option based on their personal situation.

Unlike generic calculators, DriveDecision focuses on **risk, cash-flow stress, and long-term impact**, not just monthly payments.

---

## 🚗 What Problem This Solves

Car buying decisions are emotionally charged, expensive, and easy to get wrong.

Most tools:
- Show numbers without context
- Focus only on monthly payments
- Avoid making a clear recommendation

DriveDecision by Quirk AI provides a **clear verdict** with an explanation that answers:

> *“Given my situation, should I buy or lease this car?”*

---

## 🧠 How It Works

1. The user enters:
   - Basic financial profile
   - Buy scenario details
   - Lease scenario details

2. A deterministic decision engine calculates:
   - Total cost of use
   - Monthly obligation stress
   - Downside risk if income drops
   - Exit flexibility

3. An explanation layer translates the results into:
   - Plain-language reasoning
   - Risk flags
   - A confidence score

Quirk AI **does not invent numbers or predict markets**.  
It explains verified calculations.

---

## 🎯 Core Principles

- Decision clarity over dashboards
- Deterministic math before AI
- Risk awareness over optimism
- Minimal inputs, maximum insight

---

## 🧱 Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Backend**: Next.js API routes
- **Quirk AI**: LLM API for explanations only
- **Payments**: Stripe (planned)
- **Hosting**: Vercel

---

## 📁 Project Structure

app/
page.tsx
api/
decision/
lib/
decisionEngine.ts
math.ts


- `decisionEngine.ts` contains all deterministic decision logic
- Quirk AI layers never modify core calculations

---

## 🚧 Project Status

This project is in **active development**.

Current focus:
- Implementing buy vs lease decision formulas
- Stress and risk scoring
- Validating outputs against real-world scenarios

UI and monetization come **after correctness**.

---

## ⚠️ Disclaimer

DriveDecision provides educational decision support only.
It is **not financial, legal, or tax advice**.

---

## 📌 Roadmap (High Level)

- [ ] Complete deterministic buy vs lease engine
- [ ] Add AI explanation layer
- [ ] Add pricing and paywall
- [ ] Launch web MVP
- [ ] Expand to additional decision types

---

## 📄 License

Private. All rights reserved.


