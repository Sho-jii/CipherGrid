import type { CipherDefinition, CipherResult, ExplanationStep } from '@/models/cipher';

function railPath(length: number, rails: number): number[] {
  const path: number[] = [];
  let rail = 0;
  let direction = 1;
  for (let index = 0; index < length; index += 1) {
    path.push(rail);
    if (rail === 0) direction = 1;
    else if (rail === rails - 1) direction = -1;
    rail += direction;
  }
  return path;
}

export const railFenceCipher: CipherDefinition<'rail-fence'> = {
  id: 'rail-fence', name: 'Rail Fence', family: 'transposition', securityLevel: 'educational',
  description: 'Writes text along a zigzag and reads across the rails.',
  validate: ({ rails }) => ({ valid: Number.isInteger(rails) && rails >= 2, errors: Number.isInteger(rails) && rails >= 2 ? [] : ['Rails must be an integer of at least 2.'] }),
  encrypt(input, { rails }) {
    const path = railPath(input.length, rails);
    const rows = Array.from({ length: rails }, () => [] as string[]);
    [...input].forEach((char, index) => rows[path[index] ?? 0]?.push(char));
    const output = rows.flat().join('');
    return railResult(input, output, path, rows);
  },
  decrypt(input, { rails }) {
    const path = railPath(input.length, rails);
    const counts = Array.from({ length: rails }, (_, rail) => path.filter((entry) => entry === rail).length);
    const rows: string[][] = [];
    let cursor = 0;
    for (const count of counts) { rows.push([...input.slice(cursor, cursor + count)]); cursor += count; }
    const positions = Array(rails).fill(0) as number[];
    const output = path.map((rail) => {
      const position = positions[rail] ?? 0;
      positions[rail] = position + 1;
      return rows[rail]?.[position] ?? '';
    }).join('');
    return railResult(input, output, path, rows);
  },
};

function railResult(input: string, output: string, path: number[], rows: string[][]): CipherResult {
  const diagram = rows.map((_, rail) => [...input].map((char, index) => path[index] === rail ? char : '·').join('')).join('\n');
  return { output, warnings: ['Transposition preserves character frequencies and is not secure.'], metadata: { path, diagram }, steps: path.map((rail, index): ExplanationStep => ({ index, title: `Rail ${rail + 1}`, input: input[index], detail: `Character follows zigzag position ${index + 1}.` })) };
}

function keyOrder(key: string): number[] {
  return [...key.toUpperCase()].map((char, index) => ({ char, index })).sort((a, b) => a.char.localeCompare(b.char) || a.index - b.index).map(({ index }) => index);
}

export const columnarCipher: CipherDefinition<'columnar'> = {
  id: 'columnar', name: 'Columnar Transposition', family: 'transposition', securityLevel: 'educational',
  description: 'Writes a grid by rows and reads columns in stable keyword order.',
  validate: ({ key }) => ({ valid: /^[A-Za-z]+$/.test(key), errors: /^[A-Za-z]+$/.test(key) ? [] : ['Keyword must contain Latin letters A–Z only.'] }),
  encrypt(input, { key }) {
    const columns = key.length;
    const order = keyOrder(key);
    const output = order.map((column) => [...input].filter((_, index) => index % columns === column).join('')).join('');
    return columnarResult(input, output, key, order);
  },
  decrypt(input, { key }) {
    const columns = key.length;
    const rows = Math.ceil(input.length / columns);
    const longColumns = input.length % columns;
    const lengths = Array.from({ length: columns }, (_, column) => rows - (longColumns > 0 && column >= longColumns ? 1 : 0));
    const order = keyOrder(key);
    const data = Array(columns).fill('') as string[];
    let cursor = 0;
    for (const column of order) { const length = lengths[column] ?? 0; data[column] = input.slice(cursor, cursor + length); cursor += length; }
    const output = Array.from({ length: input.length }, (_, index) => data[index % columns]?.[Math.floor(index / columns)] ?? '').join('');
    return columnarResult(input, output, key, order);
  },
};

function columnarResult(input: string, output: string, key: string, order: number[]): CipherResult {
  const rows = Array.from({ length: Math.ceil(input.length / key.length) }, (_, row) => input.slice(row * key.length, (row + 1) * key.length));
  return { output, warnings: ['Duplicate key letters are ordered left-to-right deterministically.'], metadata: { order: order.map((value) => value + 1), grid: [key.toUpperCase(), ...rows] }, steps: order.map((column, index) => ({ index, title: `Read column ${column + 1}`, detail: `Key rank ${index + 1}; ties retain their original left-to-right order.` })) };
}
