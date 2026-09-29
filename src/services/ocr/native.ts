import { Capacitor } from '@capacitor/core';
import { Ocr } from '@jcesarmobile/capacitor-ocr';
import type { OcrResult, OcrService } from './types';

export class NativeMlKitOcrService implements OcrService {
  async process(image: string | File): Promise<OcrResult> {
    if (typeof image !== 'string') throw new Error('Native OCR requires a local image URI.');
    const response = await Ocr.process({ image });
    const regions = response.results.map((result, index) => ({ id: `native-${index}`, text: result.text, confidence: result.confidence }));
    return {
      text: regions.map((region) => region.text).join('\n'), regions,
      engine: Capacitor.getPlatform() === 'ios' ? 'apple-vision' : 'ml-kit', orientation: 0,
      warnings: regions.length ? [] : ['No printed text was recognized. Try a sharper, well-lit image.'],
    };
  }
}
