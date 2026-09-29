import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { reactive } from 'vue';
import { createDefaultCipherOptions, snapshotCipherOptions, useWorkspaceStore } from '@/stores/workspace';

describe('workspace saved-result loading', () => {
  beforeEach(() => {
    sessionStorage.clear();
    setActivePinia(createPinia());
  });

  it('creates independent default option objects', () => {
    const first = createDefaultCipherOptions('caesar');
    const second = createDefaultCipherOptions('caesar');
    expect(first).toEqual({ kind: 'caesar', shift: 3 });
    expect(first).not.toBe(second);
  });

  it('creates a serializable snapshot from reactive options before persistence', () => {
    const options = reactive({ kind: 'caesar' as const, shift: 9 });
    const snapshot = snapshotCipherOptions(options);

    expect(snapshot).toEqual({ kind: 'caesar', shift: 9 });
    expect(snapshot).not.toBe(options);
  });

  it('restores saved input, output, mode, and algorithm options', () => {
    const workspace = useWorkspaceStore();
    workspace.loadSaved('ATTACKATDAWN', 'LXFOPVEFRNHR', 'encrypt', { kind: 'vigenere', key: 'LEMON' });

    expect(workspace.input).toBe('ATTACKATDAWN');
    expect(workspace.output).toBe('LXFOPVEFRNHR');
    expect(workspace.mode).toBe('encrypt');
    expect(workspace.options).toEqual({ kind: 'vigenere', key: 'LEMON' });
    expect(sessionStorage.getItem('cg-draft-input')).toBe('ATTACKATDAWN');
  });
});
