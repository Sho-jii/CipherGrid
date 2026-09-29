import type { CipherDefinition, CipherMode, CipherOptions, CipherResult, ValidationResult } from '@/models/cipher';
import { affineCipher, atbashCipher, autokeyCipher, caesarCipher, vigenereCipher } from './simple';
import { columnarCipher, railFenceCipher } from './transposition';
import { hillCipher, playfairCipher } from './polygraphic';

export const cipherRegistry = [caesarCipher, vigenereCipher, atbashCipher, affineCipher, railFenceCipher, columnarCipher, playfairCipher, hillCipher, autokeyCipher] as const;

export function cipherById(id: CipherOptions['kind']): CipherDefinition {
  const cipher = cipherRegistry.find((entry) => entry.id === id);
  if (!cipher) throw new Error(`Unknown cipher: ${id}`);
  return cipher as CipherDefinition;
}

export function validateCipher(options: CipherOptions): ValidationResult {
  switch (options.kind) {
    case 'caesar': return caesarCipher.validate(options);
    case 'vigenere': return vigenereCipher.validate(options);
    case 'atbash': return atbashCipher.validate(options);
    case 'affine': return affineCipher.validate(options);
    case 'rail-fence': return railFenceCipher.validate(options);
    case 'columnar': return columnarCipher.validate(options);
    case 'playfair': return playfairCipher.validate(options);
    case 'hill': return hillCipher.validate(options);
    case 'autokey': return autokeyCipher.validate(options);
  }
}

export function runCipher(input: string, options: CipherOptions, mode: CipherMode): CipherResult {
  const validation = validateCipher(options);
  if (!validation.valid) throw new Error(validation.errors.join(' '));
  switch (options.kind) {
    case 'caesar': return caesarCipher[mode](input, options);
    case 'vigenere': return vigenereCipher[mode](input, options);
    case 'atbash': return atbashCipher[mode](input, options);
    case 'affine': return affineCipher[mode](input, options);
    case 'rail-fence': return railFenceCipher[mode](input, options);
    case 'columnar': return columnarCipher[mode](input, options);
    case 'playfair': return playfairCipher[mode](input, options);
    case 'hill': return hillCipher[mode](input, options);
    case 'autokey': return autokeyCipher[mode](input, options);
  }
}
