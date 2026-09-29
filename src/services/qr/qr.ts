import QRCode from 'qrcode';

export interface CipherQrPayload { v: 1; type: 'ciphergrid'; algorithm: string; ciphertext: string; key?: string }

export function createCipherQrPayload(algorithm: string, ciphertext: string, key?: string): string {
  const payload: CipherQrPayload = { v: 1, type: 'ciphergrid', algorithm, ciphertext };
  if (key) payload.key = key;
  return JSON.stringify(payload);
}

export async function generateQrDataUrl(payload: string): Promise<string> {
  return QRCode.toDataURL(payload, { errorCorrectionLevel: 'M', margin: 2, width: 768, color: { dark: '#111318', light: '#ffffff' } });
}

interface BarcodeDetectorLike { detect(source: ImageBitmapSource): Promise<{ rawValue: string }[]> }
type BarcodeDetectorConstructor = new (options: { formats: string[] }) => BarcodeDetectorLike;

export async function scanQrImage(file: File): Promise<string> {
  const Detector = (globalThis as typeof globalThis & { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;
  if (!Detector) throw new Error('QR image scanning is not supported by this browser. Use a current Chromium browser or paste the payload.');
  const bitmap = await createImageBitmap(file); const results = await new Detector({ formats: ['qr_code'] }).detect(bitmap);
  bitmap.close();
  if (!results[0]?.rawValue) throw new Error('No QR code was found in the selected image.');
  return results[0].rawValue;
}
