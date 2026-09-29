import type { CipherMode, CipherOptions } from '@/models/cipher';
import { runCipher } from '@/services/ciphers/registry';

export interface BatchRow {
  id: string;
  text: string;
  algorithm?: string;
  operation?: string;
  key?: string;
  shift?: string;
  rails?: string;
  a?: string;
  b?: string;
  status: 'pending' | 'success' | 'warning' | 'failed';
  result?: string;
  error?: string;
}

function parseCsvRecords(content: string): string[][] {
  const records: string[][] = []; let record: string[] = []; let value = ''; let quoted = false;
  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    if (char === '"' && quoted && content[index + 1] === '"') { value += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { record.push(value); value = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && content[index + 1] === '\n') index += 1;
      record.push(value); value = '';
      if (record.some((cell) => cell.length > 0)) records.push(record);
      record = [];
    } else value += char;
  }
  record.push(value);
  if (record.some((cell) => cell.length > 0)) records.push(record);
  if (quoted) throw new Error('CSV contains an unterminated quoted field.');
  return records;
}

export function parseCsv(content: string): BatchRow[] {
  const records = parseCsvRecords(content.replace(/^\uFEFF/, ''));
  if (!records.length) return [];
  const headers = (records[0] ?? []).map((header) => header.trim().toLowerCase());
  if (!headers.includes('text')) throw new Error('CSV must include a text column.');
  return records.slice(1).map((values) => {
    const row: Record<string, string> = {};
    headers.forEach((header, i) => { row[header] = values[i] ?? ''; });
    return { id: crypto.randomUUID(), text: row.text ?? '', algorithm: row.algorithm, operation: row.operation, key: row.key, shift: row.shift, rails: row.rails, a: row.a, b: row.b, status: 'pending' as const };
  });
}

export function textFileRows(content: string): BatchRow[] {
  return content.split(/\r?\n/).filter((line) => line.length).map((text) => ({ id: crypto.randomUUID(), text, status: 'pending' }));
}

function optionsFor(row: BatchRow, fallback: CipherOptions): CipherOptions {
  const algorithm = row.algorithm?.trim().toLowerCase() || fallback.kind;
  switch (algorithm) {
    case 'caesar': return { kind: 'caesar', shift: Number(row.shift ?? (fallback.kind === 'caesar' ? fallback.shift : 3)) };
    case 'vigenere': return { kind: 'vigenere', key: row.key ?? (fallback.kind === 'vigenere' ? fallback.key : '') };
    case 'atbash': return { kind: 'atbash' };
    case 'affine': return { kind: 'affine', a: Number(row.a ?? (fallback.kind === 'affine' ? fallback.a : 5)), b: Number(row.b ?? (fallback.kind === 'affine' ? fallback.b : 8)) };
    case 'rail-fence': case 'rail fence': return { kind: 'rail-fence', rails: Number(row.rails ?? (fallback.kind === 'rail-fence' ? fallback.rails : 3)) };
    case 'columnar': return { kind: 'columnar', key: row.key ?? (fallback.kind === 'columnar' ? fallback.key : '') };
    case 'playfair': return { kind: 'playfair', key: row.key ?? (fallback.kind === 'playfair' ? fallback.key : '') };
    case 'hill': return { kind: 'hill', key: row.key ?? (fallback.kind === 'hill' ? fallback.key : 'GYBNQKURP'), size: row.key?.replace(/[^A-Za-z]/g, '').length === 4 ? 2 : 3 };
    case 'autokey': return { kind: 'autokey', key: row.key ?? (fallback.kind === 'autokey' ? fallback.key : '') };
    default: throw new Error(`Unsupported algorithm: ${algorithm}.`);
  }
}

export async function processBatch(rows: BatchRow[], fallback: CipherOptions, defaultMode: CipherMode, onProgress: (done: number, total: number) => void, signal?: AbortSignal): Promise<BatchRow[]> {
  const output: BatchRow[] = [];
  for (let index = 0; index < rows.length; index += 1) {
    if (signal?.aborted) break;
    const row = rows[index]; if (!row) continue;
    try {
      const mode = row.operation?.toLowerCase() === 'decrypt' ? 'decrypt' : row.operation?.toLowerCase() === 'encrypt' ? 'encrypt' : defaultMode;
      const result = runCipher(row.text, optionsFor(row, fallback), mode);
      const needsReview = result.warnings.some((warning) => /padding|filler|retained/i.test(warning));
      output.push({ ...row, result: result.output, status: needsReview ? 'warning' : 'success' });
    } catch (error) { output.push({ ...row, status: 'failed', error: error instanceof Error ? error.message : 'Processing failed.' }); }
    onProgress(index + 1, rows.length);
    if ((index + 1) % 40 === 0) await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
  }
  return output;
}

const quote = (value: string): string => /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
export function exportBatchCsv(rows: BatchRow[]): string {
  return ['text,algorithm,operation,result,status,error', ...rows.map((row) => [row.text, row.algorithm ?? '', row.operation ?? '', row.result ?? '', row.status, row.error ?? ''].map(quote).join(','))].join('\r\n');
}

export const batchTemplate = 'text,algorithm,operation,key,shift,rails,a,b\n"KHOOR",caesar,decrypt,,3,,,\n"ATTACK AT DAWN",vigenere,encrypt,LEMON,,,,\n';
