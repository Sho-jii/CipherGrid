const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', { fatal: true });

function bytesToBase64(bytes: Uint8Array): string {
  let value = '';
  for (const byte of bytes) value += String.fromCharCode(byte);
  return btoa(value);
}

export function base64Encode(text: string): string { return bytesToBase64(encoder.encode(text)); }
export function base64Decode(value: string): string {
  try { return decoder.decode(Uint8Array.from(atob(value.replace(/\s/g, '')), (char) => char.charCodeAt(0))); }
  catch { throw new Error('Invalid Base64 or UTF-8 input.'); }
}
export function textToHex(text: string): string { return [...encoder.encode(text)].map((value) => value.toString(16).padStart(2, '0')).join(' '); }
export function hexToText(value: string): string {
  const clean = value.replace(/\s/g, '');
  if (!/^(?:[0-9a-fA-F]{2})*$/.test(clean)) throw new Error('Hex input must contain complete byte pairs.');
  return decoder.decode(Uint8Array.from(clean.match(/.{2}/g) ?? [], (byte) => Number.parseInt(byte, 16)));
}
export function textToBinary(text: string): string { return [...encoder.encode(text)].map((value) => value.toString(2).padStart(8, '0')).join(' '); }
export function binaryToText(value: string): string {
  const clean = value.replace(/\s/g, '');
  if (!/^(?:[01]{8})*$/.test(clean)) throw new Error('Binary input must contain complete 8-bit bytes.');
  return decoder.decode(Uint8Array.from(clean.match(/.{8}/g) ?? [], (byte) => Number.parseInt(byte, 2)));
}
export async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(text));
  return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, '0')).join('');
}
