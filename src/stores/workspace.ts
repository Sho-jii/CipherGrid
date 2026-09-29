import { defineStore } from 'pinia';
import type { CipherMode, CipherOptions, CipherResult } from '@/models/cipher';
import { runCipher } from '@/services/ciphers/registry';

const defaultOptions: CipherOptions = { kind: 'caesar', shift: 3 };

export const useWorkspaceStore = defineStore('workspace', {
  state: () => ({
    input: sessionStorage.getItem('cg-draft-input') ?? '',
    output: '', mode: 'encrypt' as CipherMode,
    options: defaultOptions as CipherOptions,
    result: null as CipherResult | null, error: '',
  }),
  actions: {
    setInput(value: string) { this.input = value; sessionStorage.setItem('cg-draft-input', value); },
    select(kind: CipherOptions['kind']) {
      const defaults: Record<CipherOptions['kind'], CipherOptions> = {
        caesar: { kind: 'caesar', shift: 3 }, vigenere: { kind: 'vigenere', key: 'LEMON' }, atbash: { kind: 'atbash' },
        affine: { kind: 'affine', a: 5, b: 8 }, 'rail-fence': { kind: 'rail-fence', rails: 3 }, columnar: { kind: 'columnar', key: 'ZEBRAS' },
        playfair: { kind: 'playfair', key: 'PLAYFAIR EXAMPLE' }, hill: { kind: 'hill', key: 'GYBNQKURP', size: 3 }, autokey: { kind: 'autokey', key: 'QUEENLY' },
      };
      this.options = defaults[kind]; this.result = null; this.output = ''; this.error = '';
    },
    process() {
      this.error = '';
      try { this.result = runCipher(this.input, this.options, this.mode); this.output = this.result.output; }
      catch (error) { this.result = null; this.output = ''; this.error = error instanceof Error ? error.message : 'Processing failed.'; }
    },
    swap() { const previous = this.input; this.setInput(this.output); this.output = previous; this.mode = this.mode === 'encrypt' ? 'decrypt' : 'encrypt'; this.result = null; },
  },
});
