import { Capacitor } from '@capacitor/core';
import type { OcrService } from './types';
import { NativeMlKitOcrService } from './native';
import { WebTesseractOcrService } from './web';

export function createOcrService(): OcrService {
  return Capacitor.isNativePlatform() ? new NativeMlKitOcrService() : new WebTesseractOcrService();
}
export type { OcrResult, OcrRegion, OcrProgress, OcrService } from './types';
