import { Capacitor } from '@capacitor/core';
import type { OcrService } from './types';
import { NativeMlKitOcrService } from './native';
import { WebTesseractOcrService } from './web';

export function createOcrService(): OcrService {
  return Capacitor.isNativePlatform() ? new NativeMlKitOcrService() : new WebTesseractOcrService();
}

export function resolveOcrSource(isNative: boolean, nativePath: string, sourceFile: File | null, previewUrl: string): string | File | null {
  if (isNative) return nativePath || null;
  return sourceFile ?? (previewUrl || null);
}
export type { OcrResult, OcrRegion, OcrProgress, OcrService } from './types';
