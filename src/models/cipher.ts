export type CipherFamily = 'substitution' | 'polyalphabetic' | 'transposition' | 'matrix';
export type CipherMode = 'encrypt' | 'decrypt';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ExplanationStep {
  index: number;
  title: string;
  detail: string;
  input?: string;
  output?: string;
}

export interface CipherResult {
  output: string;
  steps: ExplanationStep[];
  warnings: string[];
  metadata?: Record<string, string | number | boolean | number[] | number[][] | string[]>;
}

export type CipherOptions =
  | { kind: 'caesar'; shift: number }
  | { kind: 'vigenere'; key: string }
  | { kind: 'atbash' }
  | { kind: 'affine'; a: number; b: number }
  | { kind: 'rail-fence'; rails: number }
  | { kind: 'columnar'; key: string }
  | { kind: 'playfair'; key: string }
  | { kind: 'hill'; key: string; size: 2 | 3 }
  | { kind: 'autokey'; key: string };

export interface CipherDefinition<K extends CipherOptions['kind'] = CipherOptions['kind']> {
  id: K;
  name: string;
  description: string;
  family: CipherFamily;
  securityLevel: 'educational';
  encrypt(input: string, options: Extract<CipherOptions, { kind: K }>): CipherResult;
  decrypt(input: string, options: Extract<CipherOptions, { kind: K }>): CipherResult;
  validate(options: Extract<CipherOptions, { kind: K }>): ValidationResult;
}
