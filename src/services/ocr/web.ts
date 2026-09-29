import type { OcrResult, OcrService, OcrProgress } from './types';

export class WebTesseractOcrService implements OcrService {
  async process(image: string | File, onProgress?: OcrProgress): Promise<OcrResult> {
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker('eng', undefined, {
      langPath: `${window.location.origin}${import.meta.env.BASE_URL}tessdata`,
      logger: (message) => onProgress?.(Math.round((message.progress ?? 0) * 100), message.status),
    });
    try {
      const { data } = await worker.recognize(image);
      const lines = data.text.split(/\r?\n/).map((text) => text.trim()).filter(Boolean);
      return {
        text: data.text.trim(),
        regions: lines.map((text, index) => ({ id: `web-${index}`, text, confidence: data.confidence })),
        engine: 'tesseract', orientation: 0,
        warnings: lines.length ? [] : ['No printed text was recognized. Try a sharper, well-lit image.'],
      };
    } finally { await worker.terminate(); }
  }
}
