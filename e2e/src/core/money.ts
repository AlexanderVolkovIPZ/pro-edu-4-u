// Core Layer: utility. "1 550 ₴" -> 1550
export function parseMoney(text: string | null): number {
  const digits = (text ?? '').replace(/[^\d]/g, '');
  if (!digits) throw new Error(`Failed to read an amount from "${text}"`);
  return Number(digits);
}
