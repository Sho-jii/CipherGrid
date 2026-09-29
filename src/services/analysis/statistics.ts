export interface TextStatistics {
  characters: number;
  letters: number;
  words: number;
  uniqueLetters: number;
  indexOfCoincidence: number;
  frequencies: { letter: string; count: number; percent: number }[];
  ngrams: { value: string; count: number }[];
}

export function indexOfCoincidence(text: string): number {
  const letters = text.toUpperCase().replace(/[^A-Z]/g, '');
  if (letters.length < 2) return 0;
  const counts = Array(26).fill(0) as number[];
  for (const char of letters) counts[char.charCodeAt(0) - 65] = (counts[char.charCodeAt(0) - 65] ?? 0) + 1;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) / (letters.length * (letters.length - 1));
}

export function textStatistics(text: string): TextStatistics {
  const letters = text.toUpperCase().replace(/[^A-Z]/g, '');
  const counts = Array(26).fill(0) as number[];
  for (const char of letters) counts[char.charCodeAt(0) - 65] = (counts[char.charCodeAt(0) - 65] ?? 0) + 1;
  const grams = new Map<string, number>();
  for (const size of [2, 3]) for (let i = 0; i <= letters.length - size; i += 1) {
    const value = letters.slice(i, i + size);
    grams.set(value, (grams.get(value) ?? 0) + 1);
  }
  return {
    characters: text.length, letters: letters.length,
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    uniqueLetters: counts.filter(Boolean).length,
    indexOfCoincidence: indexOfCoincidence(letters),
    frequencies: counts.map((count, index) => ({ letter: String.fromCharCode(65 + index), count, percent: letters.length ? count / letters.length * 100 : 0 })),
    ngrams: [...grams].filter(([, count]) => count > 1).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([value, count]) => ({ value, count })),
  };
}

export interface KeyLengthEstimate { length: number; averageIc: number; distance: number }

export function estimateVigenereKeyLengths(text: string, maximum = 12): KeyLengthEstimate[] {
  const letters = text.toUpperCase().replace(/[^A-Z]/g, '');
  return Array.from({ length: Math.max(1, Math.min(maximum, Math.floor(letters.length / 2))) }, (_, index) => {
    const length = index + 1;
    const columns = Array.from({ length }, (_, column) => [...letters].filter((_, i) => i % length === column).join(''));
    const averageIc = columns.reduce((sum, column) => sum + indexOfCoincidence(column), 0) / length;
    return { length, averageIc, distance: Math.abs(0.0667 - averageIc) };
  }).sort((a, b) => a.distance - b.distance);
}

export interface KasiskiMatch { sequence: string; positions: number[]; distances: number[]; likelyFactors: number[] }

export function kasiskiExamination(text: string): KasiskiMatch[] {
  const letters = text.toUpperCase().replace(/[^A-Z]/g, '');
  const occurrences = new Map<string, number[]>();
  for (let size = 3; size <= 5; size += 1) for (let index = 0; index <= letters.length - size; index += 1) {
    const sequence = letters.slice(index, index + size);
    const positions = occurrences.get(sequence) ?? [];
    positions.push(index); occurrences.set(sequence, positions);
  }
  return [...occurrences].filter(([, positions]) => positions.length > 1).map(([sequence, positions]) => {
    const distances = positions.slice(1).map((position, index) => position - (positions[index] ?? 0));
    const likelyFactors = Array.from({ length: 11 }, (_, index) => index + 2).filter((factor) => distances.some((distance) => distance % factor === 0));
    return { sequence, positions, distances, likelyFactors };
  }).sort((a, b) => b.sequence.length - a.sequence.length || b.positions.length - a.positions.length).slice(0, 20);
}

export function suggestVigenereKey(text: string, keyLength: number): string {
  const letters = text.toUpperCase().replace(/[^A-Z]/g, '');
  return Array.from({ length: keyLength }, (_, column) => {
    const values = [...letters].filter((_, index) => index % keyLength === column);
    const counts = Array(26).fill(0) as number[];
    values.forEach((char) => { counts[char.charCodeAt(0) - 65] = (counts[char.charCodeAt(0) - 65] ?? 0) + 1; });
    const common = counts.indexOf(Math.max(...counts));
    return String.fromCharCode(65 + ((common - 4 + 26) % 26));
  }).join('');
}

export function suggestCipherFamily(text: string): { label: string; confidence: 'low' | 'medium'; rationale: string } {
  const stats = textStatistics(text);
  if (stats.letters < 20) return { label: 'Insufficient sample', confidence: 'low', rationale: 'At least 20 letters are recommended for a cautious heuristic.' };
  if (stats.indexOfCoincidence < 0.045) return { label: 'Possible polyalphabetic cipher', confidence: 'medium', rationale: 'The Index of Coincidence is relatively flat; short samples can be misleading.' };
  if (/\s/.test(text) && stats.indexOfCoincidence > 0.055) return { label: 'Possible substitution cipher', confidence: 'low', rationale: 'Spacing and letter distribution resemble a monoalphabetic transformation.' };
  return { label: 'Possible transposition or substitution', confidence: 'low', rationale: 'Frequency evidence overlaps across multiple classical families.' };
}
