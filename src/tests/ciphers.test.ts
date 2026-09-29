import { describe, expect, it } from 'vitest';
import { runCipher, validateCipher } from '@/services/ciphers/registry';

describe('classical cipher vectors', () => {
  it('matches the Caesar vector and normalizes shifts', () => {
    expect(runCipher('HELLO', { kind: 'caesar', shift: 3 }, 'encrypt').output).toBe('KHOOR');
    expect(runCipher('Khoor, Zruog!', { kind: 'caesar', shift: 29 }, 'decrypt').output).toBe('Hello, World!');
    expect(runCipher('ABC', { kind: 'caesar', shift: -1 }, 'encrypt').output).toBe('ZAB');
  });

  it('matches Vigenère and preserves punctuation/case', () => {
    expect(runCipher('ATTACKATDAWN', { kind: 'vigenere', key: 'LEMON' }, 'encrypt').output).toBe('LXFOPVEFRNHR');
    const cipher = runCipher('Attack at dawn!', { kind: 'vigenere', key: 'LEMON' }, 'encrypt').output;
    expect(runCipher(cipher, { kind: 'vigenere', key: 'LEMON' }, 'decrypt').output).toBe('Attack at dawn!');
  });

  it('matches Atbash and Affine vectors', () => {
    expect(runCipher('HELLO', { kind: 'atbash' }, 'encrypt').output).toBe('SVOOL');
    expect(runCipher('AFFINECIPHER', { kind: 'affine', a: 5, b: 8 }, 'encrypt').output).toBe('IHHWVCSWFRCP');
    expect(runCipher('IHHWVCSWFRCP', { kind: 'affine', a: 5, b: 8 }, 'decrypt').output).toBe('AFFINECIPHER');
    expect(validateCipher({ kind: 'affine', a: 2, b: 4 }).valid).toBe(false);
  });

  it('matches Rail Fence and round-trips formatting', () => {
    const input = 'WEAREDISCOVEREDFLEEATONCE';
    const encrypted = runCipher(input, { kind: 'rail-fence', rails: 3 }, 'encrypt').output;
    expect(encrypted).toBe('WECRLTEERDSOEEFEAOCAIVDEN');
    expect(runCipher(encrypted, { kind: 'rail-fence', rails: 3 }, 'decrypt').output).toBe(input);
  });

  it('round-trips Columnar with duplicate key letters and uneven length', () => {
    const input = 'Meet at 5:30, gate B.'; const options = { kind: 'columnar' as const, key: 'BALLOON' };
    expect(runCipher(runCipher(input, options, 'encrypt').output, options, 'decrypt').output).toBe(input);
  });

  it('matches the documented Playfair convention and retains fillers', () => {
    const options = { kind: 'playfair' as const, key: 'PLAYFAIR EXAMPLE' };
    const encrypted = runCipher('HIDETHEGOLDINTHETREESTUMP', options, 'encrypt').output;
    expect(encrypted).toBe('BMODZBXDNABEKUDMUIXMMOUVIF');
    expect(runCipher(encrypted, options, 'decrypt').output).toBe('HIDETHEGOLDINTHETREXESTUMP');
  });

  it('matches the 3x3 Hill vector and supports a 2x2 round trip', () => {
    expect(runCipher('ACT', { kind: 'hill', key: 'GYBNQKURP', size: 3 }, 'encrypt').output).toBe('POH');
    expect(runCipher('POH', { kind: 'hill', key: 'GYBNQKURP', size: 3 }, 'decrypt').output).toBe('ACT');
    const options = { kind: 'hill' as const, key: 'HILL', size: 2 as const };
    expect(runCipher(runCipher('TEST', options, 'encrypt').output, options, 'decrypt').output).toBe('TEST');
    expect(validateCipher({ kind: 'hill', key: 'AAAA', size: 2 }).valid).toBe(false);
  });

  it('round-trips plaintext autokey while preserving punctuation', () => {
    const input = 'Attack at dawn!'; const options = { kind: 'autokey' as const, key: 'QUEENLY' };
    expect(runCipher(runCipher(input, options, 'encrypt').output, options, 'decrypt').output).toBe(input);
  });

  it('handles empty and Unicode input without corrupting non-ASCII characters', () => {
    expect(runCipher('', { kind: 'caesar', shift: 3 }, 'encrypt').output).toBe('');
    expect(runCipher('Mabuhay, ñ!', { kind: 'caesar', shift: 1 }, 'encrypt').output).toBe('Nbcvibz, ñ!');
  });
});
