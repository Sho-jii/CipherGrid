import { describe, expect, it } from 'vitest';
import { resolveOcrSource } from '@/services/ocr';

describe('OCR image source selection', () => {
  it('uses the native local URI supplied by Camera Photos on mobile', () => {
    expect(resolveOcrSource(true, 'file:///gallery/photo.jpg', null, 'capacitor://preview/photo.jpg')).toBe('file:///gallery/photo.jpg');
  });

  it('uses a browser-selected file for the Tesseract fallback', () => {
    const file = new File(['image'], 'cipher.png', { type: 'image/png' });
    expect(resolveOcrSource(false, '', file, 'blob:preview')).toBe(file);
  });

  it('returns null when the required native URI is unavailable', () => {
    expect(resolveOcrSource(true, '', null, 'blob:preview')).toBeNull();
  });
});
