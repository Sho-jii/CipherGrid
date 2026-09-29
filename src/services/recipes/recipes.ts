import type { CipherOptions } from '@/models/cipher';
import { runCipher } from '@/services/ciphers/registry';

export type RecipeStep =
  | { id: string; kind: 'normalize'; label: string }
  | { id: string; kind: 'cipher'; label: string; mode: 'encrypt' | 'decrypt'; options: CipherOptions }
  | { id: string; kind: 'qr'; label: string }
  | { id: string; kind: 'share'; label: string };

export interface Recipe { id: string; name: string; description: string; steps: RecipeStep[]; updatedAt: string }
export interface RecipeOutput { stepId: string; label: string; preview: string }

export const presetRecipes: Recipe[] = [
  { id: 'preset-vigenere', name: 'Reviewed text → Vigenère → QR', description: 'Normalize reviewed OCR text, encrypt, then prepare a versioned QR payload.', updatedAt: new Date(0).toISOString(), steps: [{ id: 'normalize', kind: 'normalize', label: 'Normalize whitespace' }, { id: 'cipher', kind: 'cipher', label: 'Vigenère encrypt', mode: 'encrypt', options: { kind: 'vigenere', key: 'LEMON' } }, { id: 'qr', kind: 'qr', label: 'Create QR payload' }] },
  { id: 'preset-caesar', name: 'Caesar decrypt → inspect', description: 'Decrypt a pasted Caesar sample while keeping every output visible.', updatedAt: new Date(0).toISOString(), steps: [{ id: 'cipher', kind: 'cipher', label: 'Caesar decrypt', mode: 'decrypt', options: { kind: 'caesar', shift: 3 } }] },
  { id: 'preset-share', name: 'Normalize → Atbash → share', description: 'Normalize text, apply Atbash, and hand off to the system share sheet.', updatedAt: new Date(0).toISOString(), steps: [{ id: 'normalize', kind: 'normalize', label: 'Normalize whitespace' }, { id: 'cipher', kind: 'cipher', label: 'Atbash transform', mode: 'encrypt', options: { kind: 'atbash' } }, { id: 'share', kind: 'share', label: 'Share output' }] },
];

export function validateRecipe(recipe: Recipe): string[] {
  const errors: string[] = [];
  if (!recipe.steps.length) errors.push('Recipe needs at least one step.');
  if (recipe.steps[0]?.kind === 'qr' || recipe.steps[0]?.kind === 'share') errors.push('A recipe cannot begin with an output action.');
  recipe.steps.slice(0, -1).forEach((step) => { if (step.kind === 'share') errors.push('Share must be the last step.'); });
  return errors;
}

export function executeRecipe(recipe: Recipe, input: string): RecipeOutput[] {
  const errors = validateRecipe(recipe); if (errors.length) throw new Error(errors.join(' '));
  let current = input;
  return recipe.steps.map((step) => {
    if (step.kind === 'normalize') current = current.replace(/\s+/g, ' ').trim();
    else if (step.kind === 'cipher') current = runCipher(current, step.options, step.mode).output;
    else if (step.kind === 'qr') current = JSON.stringify({ v: 1, type: 'ciphergrid-text', text: current });
    return { stepId: step.id, label: step.label, preview: current };
  });
}
