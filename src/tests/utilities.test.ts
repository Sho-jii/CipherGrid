import { beforeAll, describe, expect, it } from 'vitest';
import { webcrypto } from 'node:crypto';
import { base64Decode, base64Encode, binaryToText, hexToText, sha256, textToBinary, textToHex } from '@/services/utilities/encoding';

beforeAll(() => { Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true }); });

describe('encoding and hashing utilities', () => {
  it('round-trips Unicode through UTF-8 Base64', () => {
    const text = 'Mabuhay, mundo 🌏';
    expect(base64Decode(base64Encode(text))).toBe(text);
  });
  it('round-trips UTF-8 hexadecimal and binary representations', () => {
    const text = 'CipherGrid ñ';
    expect(hexToText(textToHex(text))).toBe(text);
    expect(binaryToText(textToBinary(text))).toBe(text);
  });
  it('rejects malformed complete-byte input', () => {
    expect(() => hexToText('abc')).toThrow('byte pairs');
    expect(() => binaryToText('101')).toThrow('8-bit');
  });
  it('matches the SHA-256 digest of abc', async () => {
    expect(await sha256('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });
});
