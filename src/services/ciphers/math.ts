export const mod = (value: number, modulus = 26): number => ((value % modulus) + modulus) % modulus;

export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x;
}

export function modularInverse(value: number, modulus = 26): number | null {
  const normalized = mod(value, modulus);
  for (let x = 1; x < modulus; x += 1) if (mod(normalized * x, modulus) === 1) return x;
  return null;
}

export function transformAsciiLetter(char: string, amount: number): string {
  const code = char.charCodeAt(0);
  const base = code >= 97 && code <= 122 ? 97 : code >= 65 && code <= 90 ? 65 : -1;
  return base < 0 ? char : String.fromCharCode(base + mod(code - base + amount));
}

export const lettersOnly = (value: string): string => value.toUpperCase().replace(/[^A-Z]/g, '');
