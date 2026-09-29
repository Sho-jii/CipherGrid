const encoder = new TextEncoder();
const decoder = new TextDecoder();
const ITERATIONS = 310_000;

export interface SecurePayloadV1 {
  v: 1;
  alg: 'AES-256-GCM';
  kdf: 'PBKDF2-SHA-256';
  iterations: number;
  salt: string;
  iv: string;
  ciphertext: string;
}

const toBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
};

const fromBase64 = (value: string): Uint8Array => {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};

async function derive(passphrase: string, salt: Uint8Array, iterations: number): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey('raw', encoder.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

export async function encryptAesGcm(plaintext: string, passphrase: string): Promise<string> {
  if (!passphrase) throw new Error('A passphrase is required.');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await derive(passphrase, salt, ITERATIONS);
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(plaintext));
  const payload: SecurePayloadV1 = { v: 1, alg: 'AES-256-GCM', kdf: 'PBKDF2-SHA-256', iterations: ITERATIONS, salt: toBase64(salt), iv: toBase64(iv), ciphertext: toBase64(new Uint8Array(encrypted)) };
  return JSON.stringify(payload);
}

function parsePayload(value: string): SecurePayloadV1 {
  let payload: unknown;
  try { payload = JSON.parse(value); } catch { throw new Error('The encrypted payload is malformed.'); }
  if (!payload || typeof payload !== 'object') throw new Error('The encrypted payload is malformed.');
  const candidate = payload as Partial<SecurePayloadV1>;
  if (candidate.v !== 1 || candidate.alg !== 'AES-256-GCM' || candidate.kdf !== 'PBKDF2-SHA-256' || typeof candidate.iterations !== 'number' || typeof candidate.salt !== 'string' || typeof candidate.iv !== 'string' || typeof candidate.ciphertext !== 'string') throw new Error('The encrypted payload is unsupported or malformed.');
  return candidate as SecurePayloadV1;
}

export async function decryptAesGcm(serialized: string, passphrase: string): Promise<string> {
  if (!passphrase) throw new Error('A passphrase is required.');
  const payload = parsePayload(serialized);
  try {
    const salt = fromBase64(payload.salt); const iv = fromBase64(payload.iv); const ciphertext = fromBase64(payload.ciphertext);
    if (salt.length !== 16 || iv.length !== 12 || payload.iterations < 100_000 || payload.iterations > 2_000_000) throw new Error('invalid');
    const key = await derive(passphrase, salt, payload.iterations);
    const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv as BufferSource }, key, ciphertext as BufferSource);
    return decoder.decode(plaintext);
  } catch { throw new Error('Unable to decrypt. The passphrase or authenticated payload is invalid.'); }
}
