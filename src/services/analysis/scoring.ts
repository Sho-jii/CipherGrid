import { runCipher } from '@/services/ciphers/registry';
import { gcd } from '@/services/ciphers/math';

export type LanguageProfileId = 'english' | 'filipino';

interface LanguageProfile {
  id: LanguageProfileId;
  frequencies: readonly number[];
  commonWords: readonly string[];
}

export const languageProfiles: Record<LanguageProfileId, LanguageProfile> = {
  english: {
    id: 'english',
    frequencies: [8.17, 1.49, 2.78, 4.25, 12.7, 2.23, 2.02, 6.09, 6.97, 0.15, 0.77, 4.03, 2.41, 6.75, 7.51, 1.93, 0.1, 5.99, 6.33, 9.06, 2.76, 0.98, 2.36, 0.15, 1.97, 0.07],
    commonWords: ['THE', 'AND', 'THAT', 'THIS', 'WITH', 'YOU', 'FOR', 'ARE', 'IS', 'OF', 'TO', 'IN'],
  },
  filipino: {
    id: 'filipino',
    frequencies: [14.0, 1.0, 0.8, 1.8, 5.5, 0.4, 5.0, 1.0, 7.0, 0.5, 2.5, 6.0, 3.2, 10.5, 7.0, 3.0, 0.2, 5.0, 5.5, 9.0, 3.0, 1.0, 0.3, 0.3, 5.0, 0.2],
    commonWords: ['ANG', 'NG', 'MGA', 'SA', 'AT', 'AY', 'NA', 'ITO', 'PARA', 'HINDI', 'AKO', 'IKAW'],
  },
};

export interface AnalysisCandidate {
  label: string;
  output: string;
  score: number;
  confidence: number;
  options: Record<string, number | string>;
}

export function scoreLanguage(text: string, profileId: LanguageProfileId = 'english'): number {
  const profile = languageProfiles[profileId];
  const letters = text.toUpperCase().replace(/[^A-Z]/g, '');
  if (!letters.length) return Number.POSITIVE_INFINITY;
  const counts = Array(26).fill(0) as number[];
  for (const char of letters) counts[char.charCodeAt(0) - 65] = (counts[char.charCodeAt(0) - 65] ?? 0) + 1;
  const chi = counts.reduce((sum, observed, index) => {
    const expected = ((profile.frequencies[index] ?? 0.1) / 100) * letters.length;
    return sum + ((observed - expected) ** 2) / Math.max(expected, 0.01);
  }, 0);
  const upper = ` ${text.toUpperCase().replace(/[^A-Z]+/g, ' ')} `;
  const wordBonus = profile.commonWords.reduce((sum, word) => sum + (upper.includes(` ${word} `) ? Math.max(3, word.length) : 0), 0);
  return chi - wordBonus * 4;
}

function ranked(candidates: Omit<AnalysisCandidate, 'confidence'>[]): AnalysisCandidate[] {
  const ordered = [...candidates].sort((a, b) => a.score - b.score);
  const best = ordered[0]?.score ?? 0;
  const worst = ordered.at(-1)?.score ?? best + 1;
  return ordered.map((candidate) => ({ ...candidate, confidence: Math.round(100 * (1 - (candidate.score - best) / Math.max(1, worst - best))) }));
}

export function bruteForceCaesar(text: string, profile: LanguageProfileId = 'english'): AnalysisCandidate[] {
  return ranked(Array.from({ length: 26 }, (_, shift) => {
    const output = runCipher(text, { kind: 'caesar', shift }, 'decrypt').output;
    return { label: `Shift ${shift}`, output, score: scoreLanguage(output, profile), options: { shift } };
  }));
}

export function bruteForceAffine(text: string, profile: LanguageProfileId = 'english'): AnalysisCandidate[] {
  const candidates: Omit<AnalysisCandidate, 'confidence'>[] = [];
  for (let a = 1; a < 26; a += 1) for (let b = 0; b < 26; b += 1) if (gcd(a, 26) === 1) {
    const output = runCipher(text, { kind: 'affine', a, b }, 'decrypt').output;
    candidates.push({ label: `a=${a}, b=${b}`, output, score: scoreLanguage(output, profile), options: { a, b } });
  }
  return ranked(candidates);
}

export function rankRailFence(text: string, maxRails = 10, profile: LanguageProfileId = 'english'): AnalysisCandidate[] {
  return ranked(Array.from({ length: Math.max(1, Math.min(maxRails, text.length) - 1) }, (_, index) => {
    const rails = index + 2;
    const output = runCipher(text, { kind: 'rail-fence', rails }, 'decrypt').output;
    return { label: `${rails} rails`, output, score: scoreLanguage(output, profile), options: { rails } };
  }));
}
