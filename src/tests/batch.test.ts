import { describe, expect, it } from 'vitest';
import { exportBatchCsv, parseCsv, processBatch } from '@/services/files/batch';

describe('batch parsing and processing', () => {
  it('maps quoted CSV fields and per-row configuration', async () => {
    const rows = parseCsv('text,algorithm,operation,shift\n"HELLO,\nWORLD",caesar,encrypt,3\nKHOOR,caesar,decrypt,3');
    expect(rows[0]?.text).toBe('HELLO,\nWORLD');
    const output = await processBatch(rows, { kind: 'caesar', shift: 1 }, 'encrypt', () => undefined);
    expect(output[0]?.result).toBe('KHOOR,\nZRUOG');
    expect(output[1]?.result).toBe('HELLO');
    expect(exportBatchCsv(output)).toContain('result,status');
  });
  it('fails rows independently', async () => {
    const rows = parseCsv('text,algorithm,operation,key\nHELLO,vigenere,encrypt,123\nHELLO,atbash,encrypt,');
    const output = await processBatch(rows, { kind: 'caesar', shift: 3 }, 'encrypt', () => undefined);
    expect(output[0]?.status).toBe('failed');
    expect(output[1]?.result).toBe('SVOOL');
  });
});
