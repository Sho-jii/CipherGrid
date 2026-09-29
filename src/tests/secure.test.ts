import { beforeAll, describe, expect, it } from 'vitest';
import { webcrypto } from 'node:crypto';
import { decryptAesGcm, encryptAesGcm } from '@/services/secure/crypto';

beforeAll(() => { Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true }); });

describe('AES-256-GCM Secure Lab', () => {
  it('round-trips and uses new salt and IV for every encryption', async () => {
    const first = await encryptAesGcm('Mabuhay 🔐', 'correct horse battery staple');
    const second = await encryptAesGcm('Mabuhay 🔐', 'correct horse battery staple');
    expect(first).not.toBe(second);
    expect(await decryptAesGcm(first, 'correct horse battery staple')).toBe('Mabuhay 🔐');
  });
  it('reports generic authentication failure without leaking details', async () => {
    const payload = await encryptAesGcm('secret', 'right passphrase');
    await expect(decryptAesGcm(payload, 'wrong passphrase')).rejects.toThrow('Unable to decrypt');
  });
  it('rejects malformed portable payloads', async () => {
    await expect(decryptAesGcm('{"v":2}', 'passphrase')).rejects.toThrow('unsupported or malformed');
  });
});
