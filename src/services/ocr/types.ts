export interface OcrRegion {
  id: string;
  text: string;
  confidence?: number;
}

export interface OcrResult {
  text: string;
  regions: OcrRegion[];
  engine: 'ml-kit' | 'apple-vision' | 'tesseract';
  orientation: number;
  warnings: string[];
}

export type OcrProgress = (progress: number, status: string) => void;

export interface OcrService {
  process(image: string | File, onProgress?: OcrProgress): Promise<OcrResult>;
}
