import type { CipherDefinition, CipherResult, ExplanationStep } from '@/models/cipher';
import { gcd, lettersOnly, mod, modularInverse } from './math';

export function playfairSquare(keyValue: string): string[] {
  const combined = (lettersOnly(keyValue).replace(/J/g, 'I') + 'ABCDEFGHIKLMNOPQRSTUVWXYZ');
  return [...new Set(combined)].slice(0, 25);
}

function playfairPairs(input: string): string[] {
  const chars = [...lettersOnly(input).replace(/J/g, 'I')];
  const pairs: string[] = [];
  for (let index = 0; index < chars.length;) {
    const first = chars[index] ?? 'X';
    const second = chars[index + 1];
    if (!second) { pairs.push(`${first}X`); index += 1; }
    else if (first === second) { pairs.push(`${first}${first === 'X' ? 'Q' : 'X'}`); index += 1; }
    else { pairs.push(`${first}${second}`); index += 2; }
  }
  return pairs;
}

function playfairTransform(input: string, key: string, decrypt: boolean): CipherResult {
  const square = playfairSquare(key);
  const pairs = decrypt ? (lettersOnly(input).replace(/J/g, 'I').match(/.{1,2}/g) ?? []) : playfairPairs(input);
  if (pairs.some((pair) => pair.length !== 2)) throw new Error('Playfair ciphertext must contain an even number of letters.');
  const steps: ExplanationStep[] = [];
  const direction = decrypt ? -1 : 1;
  const output = pairs.map((pair, index) => {
    const a = square.indexOf(pair[0] ?? 'X'); const b = square.indexOf(pair[1] ?? 'X');
    const ar = Math.floor(a / 5); const ac = a % 5; const br = Math.floor(b / 5); const bc = b % 5;
    let result: string; let rule: string;
    if (ar === br) { result = `${square[ar * 5 + mod(ac + direction, 5)]}${square[br * 5 + mod(bc + direction, 5)]}`; rule = 'Same row: shift horizontally.'; }
    else if (ac === bc) { result = `${square[mod(ar + direction, 5) * 5 + ac]}${square[mod(br + direction, 5) * 5 + bc]}`; rule = 'Same column: shift vertically.'; }
    else { result = `${square[ar * 5 + bc]}${square[br * 5 + ac]}`; rule = 'Rectangle: take opposite corners.'; }
    steps.push({ index, title: `Digraph ${pair}`, input: pair, output: result, detail: rule });
    return result;
  }).join('');
  return { output, steps, warnings: decrypt ? ['Filler X/Q characters are retained. Review them manually; cleanup is only a suggestion.'] : ['I and J share one square cell; formatting is not preserved.'], metadata: { square, pairs } };
}

export const playfairCipher: CipherDefinition<'playfair'> = {
  id: 'playfair', name: 'Playfair', family: 'substitution', securityLevel: 'educational',
  description: 'Transforms prepared digraphs with a 5×5 I/J key square.',
  validate: ({ key }) => ({ valid: lettersOnly(key).length > 0, errors: lettersOnly(key).length ? [] : ['Key must contain at least one Latin letter.'] }),
  encrypt: (input, { key }) => playfairTransform(input, key, false), decrypt: (input, { key }) => playfairTransform(input, key, true),
};

function keyMatrix(key: string, size: 2 | 3): number[][] {
  return Array.from({ length: size }, (_, row) => Array.from({ length: size }, (_, column) => (lettersOnly(key)[row * size + column]?.charCodeAt(0) ?? 65) - 65));
}

function determinant(matrix: number[][]): number {
  if (matrix.length === 2) return (matrix[0]?.[0] ?? 0) * (matrix[1]?.[1] ?? 0) - (matrix[0]?.[1] ?? 0) * (matrix[1]?.[0] ?? 0);
  const [a, b, c] = matrix[0] ?? [0, 0, 0];
  const [d, e, f] = matrix[1] ?? [0, 0, 0];
  const [g, h, i] = matrix[2] ?? [0, 0, 0];
  return (a ?? 0) * ((e ?? 0) * (i ?? 0) - (f ?? 0) * (h ?? 0)) - (b ?? 0) * ((d ?? 0) * (i ?? 0) - (f ?? 0) * (g ?? 0)) + (c ?? 0) * ((d ?? 0) * (h ?? 0) - (e ?? 0) * (g ?? 0));
}

function inverseMatrix(matrix: number[][]): number[][] | null {
  const size = matrix.length as 2 | 3;
  const detInverse = modularInverse(determinant(matrix));
  if (detInverse === null) return null;
  if (size === 2) return [[mod(detInverse * (matrix[1]?.[1] ?? 0)), mod(-detInverse * (matrix[0]?.[1] ?? 0))], [mod(-detInverse * (matrix[1]?.[0] ?? 0)), mod(detInverse * (matrix[0]?.[0] ?? 0))]];
  return Array.from({ length: 3 }, (_, row) => Array.from({ length: 3 }, (_, column) => {
    const minor = matrix.filter((_, r) => r !== column).map((line) => line.filter((_, c) => c !== row));
    const cofactor = ((row + column) % 2 ? -1 : 1) * determinant(minor);
    return mod(cofactor * detInverse);
  }));
}

function hillTransform(input: string, key: string, size: 2 | 3, decrypt: boolean): CipherResult {
  const source = lettersOnly(input);
  const padding = decrypt ? 0 : (size - source.length % size) % size;
  const prepared = source + 'X'.repeat(padding);
  const matrix = keyMatrix(key, size);
  const active = decrypt ? inverseMatrix(matrix) : matrix;
  if (!active) throw new Error('Key matrix determinant is not invertible modulo 26.');
  const blocks = prepared.match(new RegExp(`.{${size}}`, 'g')) ?? [];
  const steps: ExplanationStep[] = [];
  const output = blocks.map((block, index) => {
    const vector = [...block].map((char) => char.charCodeAt(0) - 65);
    const result = active.map((row) => mod(row.reduce((sum, value, column) => sum + value * (vector[column] ?? 0), 0)));
    const text = result.map((value) => String.fromCharCode(65 + value)).join('');
    steps.push({ index, title: `Vector [${vector.join(', ')}]`, input: block, output: text, detail: `${JSON.stringify(active)} × [${vector.join(', ')}] mod 26 = [${result.join(', ')}].` });
    return text;
  }).join('');
  return { output, steps, warnings: [padding ? `${padding} visible X padding character(s) added.` : 'Formatting is normalized to A–Z for matrix processing.'], metadata: { matrix, activeMatrix: active.flat(), padding } };
}

export const hillCipher: CipherDefinition<'hill'> = {
  id: 'hill', name: 'Hill', family: 'matrix', securityLevel: 'educational',
  description: 'Multiplies letter vectors by an invertible matrix modulo 26.',
  validate: ({ key, size }) => {
    const normalized = lettersOnly(key);
    const errors: string[] = [];
    if (normalized.length !== size * size) errors.push(`A ${size}×${size} key requires exactly ${size * size} letters.`);
    else if (gcd(determinant(keyMatrix(key, size)), 26) !== 1) errors.push('The key determinant must be coprime with 26 so the matrix can be inverted.');
    return { valid: errors.length === 0, errors };
  },
  encrypt: (input, { key, size }) => hillTransform(input, key, size, false), decrypt: (input, { key, size }) => hillTransform(input, key, size, true),
};
