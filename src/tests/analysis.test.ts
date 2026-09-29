import { describe, expect, it } from 'vitest';
import { bruteForceCaesar } from '@/services/analysis/scoring';
import { estimateVigenereKeyLengths, indexOfCoincidence, kasiskiExamination, textStatistics } from '@/services/analysis/statistics';

describe('classical analysis', () => {
  it('ranks a Caesar plaintext candidate and includes all shifts', () => {
    const candidates = bruteForceCaesar('WKH TXLFN EURZQ IRA MXPSV RYHU WKH ODCB GRJ');
    expect(candidates).toHaveLength(26);
    expect(candidates.find((candidate) => candidate.options.shift === 3)?.output).toContain('THE QUICK BROWN FOX');
  });
  it('computes text statistics and coincidence', () => {
    expect(indexOfCoincidence('AAAAAAAAAA')).toBe(1);
    expect(textStatistics('ABBA ABBA').letters).toBe(8);
  });
  it('finds Kasiski repetitions and returns key length estimates', () => {
    expect(kasiskiExamination('ABCXYZABCXYZ').some((match) => match.sequence === 'ABC')).toBe(true);
    expect(estimateVigenereKeyLengths('LXFOPVEFRNHRLXFOPVEFRNHR').length).toBeGreaterThan(1);
  });
});
