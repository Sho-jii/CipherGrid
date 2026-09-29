import type { CipherMode, CipherOptions } from './cipher';

export interface HistoryRecord {
  id: string;
  algorithm: string;
  algorithmId?: CipherOptions['kind'];
  mode: CipherMode;
  input: string;
  output: string;
  options?: CipherOptions;
  createdAt: string;
  updatedAt?: string;
}

export const HISTORY_CHANGED_EVENT = 'ciphergrid:history-changed';

export function notifyHistoryChanged(): void {
  window.dispatchEvent(new CustomEvent(HISTORY_CHANGED_EVENT));
}
