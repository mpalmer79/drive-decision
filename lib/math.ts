export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function assertFinite(name: string, value: number): void {
  if (!Number.isFinite(value)) throw new Error(`${name} must be a finite number`);
}

export function monthlyPaymentFromLoan(
  principal: number,
  aprPercent: number,
  termMonths: number
): number {
  assertFinite("principal", principal);
  assertFinite("aprPercent", aprPercent);
  assertFinite("termMonths", termMonths);

  if (termMonths <= 0) throw new Error("termMonths must be > 0");
  if (principal <= 0) return 0;

  const r = (aprPercent / 100) / 12;
  if (r === 0) return principal / termMonths;

  const pow = Math.pow(1 + r, termMonths);
  return principal * (r * pow) / (pow - 1);
}
