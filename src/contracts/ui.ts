import type { Key } from './keys';

/** Logische Pixel der Display-Zeichenfläche. */
export const DISPLAY_CANVAS = { width: 120, height: 48 } as const;

export interface DisplayView {
  showText(main: string, sub?: string): void;
  showLines(lines: string[]): void;
  showCanvas(): CanvasRenderingContext2D | null;
  hideCanvas(): void;
}

export interface KeypadView {
  /** Registriert einen Handler; Rückgabe: Funktion zum Abmelden. */
  onKey(handler: (key: Key) => void): () => void;
}

export interface CalculatorView {
  display: DisplayView;
  keypad: KeypadView;
}

export type CreateCalculatorView = (root: HTMLElement) => CalculatorView;
