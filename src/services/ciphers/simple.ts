import type { CipherDefinition, CipherResult, ExplanationStep } from '@/models/cipher';
import { gcd, mod, modularInverse, transformAsciiLetter, lettersOnly } from './math';

const step = (index: number, title: string, input: string, output: string, detail: string): ExplanationStep => ({ index, title, input, output, detail });

export const caesarCipher: CipherDefinition<'caesar'> = {
  id: 'caesar', name: 'Caesar', family: 'substitution', securityLevel: 'educational',
  description: 'Rotates each Latin letter by a fixed amount.',
  validate: ({ shift }) => ({ valid: Number.isFinite(shift), errors: Number.isFinite(shift) ? [] : ['Shift must be a number.'] }),
  encrypt(input, { shift }) { return caesar(input, shift); },
  decrypt(input, { shift }) { return caesar(input, -shift); },
};

function caesar(input: string, shiftValue: number): CipherResult {
  const amount = mod(Math.trunc(shiftValue));
  const output = [...input].map((char) => transformAsciiLetter(char, amount)).join('');
  const steps = [...input].map((char, index) => step(index, `Character ${index + 1}`, char, transformAsciiLetter(char, amount), /[A-Za-z]/.test(char) ? `Rotate ${amount} places modulo 26.` : 'Non-letter preserved.'));
  return { output, steps, warnings: ['Classical ciphers are educational and are not secure for secrets.'], metadata: { normalizedShift: amount } };
}

export const atbashCipher: CipherDefinition<'atbash'> = {
  id: 'atbash', name: 'Atbash', family: 'substitution', securityLevel: 'educational',
  description: 'Mirrors A↔Z, B↔Y, and so on.', validate: () => ({ valid: true, errors: [] }),
  encrypt: (input) => atbash(input), decrypt: (input) => atbash(input),
};

function atbash(input: string): CipherResult {
  const output = [...input].map((char) => {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCharCode(90 - (code - 65));
    if (code >= 97 && code <= 122) return String.fromCharCode(122 - (code - 97));
    return char;
  }).join('');
  return { output, warnings: ['Atbash is a historical teaching cipher, not secure encryption.'], steps: [...input].map((char, index) => step(index, 'Alphabet mirror', char, output[index] ?? '', /[A-Za-z]/.test(char) ? 'Index n becomes 25 − n.' : 'Non-letter preserved.')) };
}

function keywordValidation(key: string) {
  const valid = /^[A-Za-z]+$/.test(key);
  return { valid, errors: valid ? [] : ['Key must contain Latin letters A–Z only.'] };
}

export const vigenereCipher: CipherDefinition<'vigenere'> = {
  id: 'vigenere', name: 'Vigenère', family: 'polyalphabetic', securityLevel: 'educational',
  description: 'Uses a repeated keyword to apply changing Caesar shifts.', validate: ({ key }) => keywordValidation(key),
  encrypt: (input, { key }) => vigenere(input, key, false), decrypt: (input, { key }) => vigenere(input, key, true),
};

function vigenere(input: string, keyValue: string, decrypt: boolean): CipherResult {
  const key = lettersOnly(keyValue);
  let keyIndex = 0;
  let visualIndex = 0;
  const steps: ExplanationStep[] = [];
  const output = [...input].map((char, index) => {
    if (!/[A-Za-z]/.test(char)) return char;
    const keyChar = key[keyIndex % key.length] ?? 'A';
    const shiftValue = (keyChar.charCodeAt(0) - 65) * (decrypt ? -1 : 1);
    const transformed = transformAsciiLetter(char, shiftValue);
    steps.push(step(index, `Key ${keyChar}`, char, transformed, `${decrypt ? 'Subtract' : 'Add'} ${Math.abs(shiftValue)} modulo 26; punctuation does not advance the key.`));
    keyIndex += 1;
    return transformed;
  }).join('');
  const runningKey = [...input].map((char) => {
    if (!/[A-Za-z]/.test(char)) return char;
    const value = key[visualIndex % key.length] ?? '';
    visualIndex += 1;
    return value;
  }).join('');
  return { output, steps, warnings: ['Repeated-key Vigenère is vulnerable to classical cryptanalysis.'], metadata: { runningKey } };
}

export const autokeyCipher: CipherDefinition<'autokey'> = {
  id: 'autokey', name: 'Autokey', family: 'polyalphabetic', securityLevel: 'educational',
  description: 'Extends a seed keyword with recovered plaintext.', validate: ({ key }) => keywordValidation(key),
  encrypt: (input, { key }) => autokey(input, key, false), decrypt: (input, { key }) => autokey(input, key, true),
};

function autokey(input: string, seedValue: string, decrypt: boolean): CipherResult {
  const seed = lettersOnly(seedValue);
  const sourceLetters = lettersOnly(input);
  const recovered: string[] = [];
  const running = [...seed];
  let position = 0;
  const steps: ExplanationStep[] = [];
  const output = [...input].map((char, index) => {
    if (!/[A-Za-z]/.test(char)) return char;
    const keyChar = running[position] ?? 'A';
    const shiftValue = keyChar.charCodeAt(0) - 65;
    const transformed = transformAsciiLetter(char, decrypt ? -shiftValue : shiftValue);
    const plain = decrypt ? transformed.toUpperCase() : sourceLetters[position] ?? '';
    recovered.push(plain);
    running.push(plain);
    steps.push(step(index, `Running key ${keyChar}`, char, transformed, `Seed expands with plaintext character ${plain}.`));
    position += 1;
    return transformed;
  }).join('');
  return { output, steps, warnings: ['Autokey remains a classical educational cipher.'], metadata: { runningKey: running.slice(0, recovered.length).join('') } };
}

export const affineCipher: CipherDefinition<'affine'> = {
  id: 'affine', name: 'Affine', family: 'substitution', securityLevel: 'educational',
  description: 'Maps letters with E(x) = (ax + b) mod 26.',
  validate: ({ a, b }) => {
    const errors: string[] = [];
    if (!Number.isInteger(a) || gcd(a, 26) !== 1) errors.push('a must be an integer coprime with 26 (1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, or 25).');
    if (!Number.isInteger(b)) errors.push('b must be an integer.');
    return { valid: errors.length === 0, errors };
  },
  encrypt: (input, options) => affine(input, options.a, options.b, false),
  decrypt: (input, options) => affine(input, options.a, options.b, true),
};

function affine(input: string, a: number, b: number, decrypt: boolean): CipherResult {
  const inverse = modularInverse(a);
  if (inverse === null) throw new Error('a has no modular inverse modulo 26.');
  const output = [...input].map((char) => {
    const code = char.charCodeAt(0);
    const base = code >= 97 && code <= 122 ? 97 : code >= 65 && code <= 90 ? 65 : -1;
    if (base < 0) return char;
    const x = code - base;
    const y = decrypt ? mod(inverse * (x - b)) : mod(a * x + b);
    return String.fromCharCode(base + y);
  }).join('');
  return { output, warnings: ['Affine has only a small keyspace and is not secure.'], steps: [...input].map((char, index) => step(index, decrypt ? 'Apply inverse' : 'Apply affine map', char, output[index] ?? '', decrypt ? `D(y) = ${inverse}(y − ${b}) mod 26.` : `E(x) = (${a}x + ${b}) mod 26.`)) };
}
