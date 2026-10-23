/** Anzahl signifikanter Stellen, auf die Ergebnisse gerundet werden. */
export const SIGNIFICANT_DIGITS = 12;

const EXP_UPPER = 1e12;
const EXP_LOWER = 1e-9;

/** Rundet auf 12 signifikante Stellen; `-0` wird zu `0`. */
export function roundSignificant(value: number): number {
  if (!Number.isFinite(value)) return value;
  const rounded = Number(value.toPrecision(SIGNIFICANT_DIGITS));
  return rounded === 0 ? 0 : rounded;
}

/** Schreibt eine Zahl ohne Exponent aus (für 1e-9 ≤ |x| < 1e-6, wo `String()` Exponenten nutzt). */
function toPlainDecimal(abs: number): string {
  const [mantissa = '0', expPart = '0'] = abs.toExponential(SIGNIFICANT_DIGITS - 1).split('e');
  const exp = Number(expPart);
  const digits = mantissa.replace('.', '');
  if (exp >= 0) return String(abs);
  const plain = '0.' + '0'.repeat(-exp - 1) + digits;
  return plain.replace(/0+$/, '').replace(/\.$/, '');
}

/**
 * Formatiert eine Zahl für die deutsche Anzeige.
 *
 * Rundet auf 12 signifikante Stellen (`0.1 + 0.2` → `0,3`), nutzt das
 * Dezimalkomma und keinen Tausendertrenner. Ab |x| ≥ 1e12 oder für
 * 0 < |x| < 1e-9 wird die Exponentialschreibweise verwendet (`1,5e+15`).
 * `-0` wird als `0` ausgegeben, nicht endliche Werte als `Error`.
 * Negative Zahlen beginnen mit ASCII-`-`.
 */
export function format(value: number): string {
  if (!Number.isFinite(value)) return 'Error';
  const rounded = roundSignificant(value);
  if (rounded === 0) return '0';
  const abs = Math.abs(rounded);
  const sign = rounded < 0 ? '-' : '';
  let body: string;
  if (abs >= EXP_UPPER || abs < EXP_LOWER) {
    body = abs.toExponential();
  } else {
    const s = String(abs);
    body = s.includes('e') ? toPlainDecimal(abs) : s;
  }
  return sign + body.replace('.', ',');
}
