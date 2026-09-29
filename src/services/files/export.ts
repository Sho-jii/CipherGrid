import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export async function exportTextFile(content: string, rawName: string, mimeType: string): Promise<void> {
  const name = rawName.replace(/[^a-zA-Z0-9._-]/g, '_');
  if (Capacitor.isNativePlatform()) {
    const file = await Filesystem.writeFile({ path: name, data: content, directory: Directory.Cache, encoding: Encoding.UTF8, recursive: true });
    await Share.share({ title: name, url: file.uri, dialogTitle: 'Export CipherGrid result' });
    return;
  }
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; anchor.click(); URL.revokeObjectURL(url);
}
