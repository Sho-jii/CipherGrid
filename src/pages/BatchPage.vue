<script setup lang="ts">
import { computed, ref } from 'vue';
import { IonIcon } from '@ionic/vue';
import { downloadOutline, stopOutline, playOutline, refreshOutline } from 'ionicons/icons';
import PageFrame from '@/components/common/PageFrame.vue';
import { batchTemplate, exportBatchCsv, parseCsv, processBatch, textFileRows, type BatchRow } from '@/services/files/batch';
import { exportTextFile } from '@/services/files/export';
import { putRecord } from '@/services/storage/database';
import type { CipherOptions } from '@/models/cipher';

const rows = ref<BatchRow[]>([]); const filename = ref(''); const error = ref(''); const progress = ref(0); const processing = ref(false); const retainOutputs = ref(false); const fallback = ref<CipherOptions>({ kind: 'caesar', shift: 3 }); const defaultMode = ref<'encrypt' | 'decrypt'>('encrypt'); let controller: AbortController | null = null;
const counts = computed(() => ({ pending: rows.value.filter((row) => row.status === 'pending').length, success: rows.value.filter((row) => row.status === 'success').length, warning: rows.value.filter((row) => row.status === 'warning').length, failed: rows.value.filter((row) => row.status === 'failed').length }));
async function importFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return; error.value = ''; filename.value = file.name;
  try { const content = await file.text(); rows.value = file.name.toLowerCase().endsWith('.csv') ? parseCsv(content) : textFileRows(content); } catch (cause) { error.value = cause instanceof Error ? cause.message : 'File could not be imported.'; rows.value = []; }
}
async function run(targetRows = rows.value) {
  processing.value = true; controller = new AbortController(); progress.value = 0;
  sessionStorage.setItem('cg-batch-active', JSON.stringify({ filename: filename.value, progress: 0, total: targetRows.length }));
  const completed = await processBatch(targetRows, fallback.value, defaultMode.value, (done, total) => {
    progress.value = Math.round(done / total * 100);
    sessionStorage.setItem('cg-batch-active', JSON.stringify({ filename: filename.value, progress: progress.value, total }));
  }, controller.signal);
  if (targetRows.length === rows.value.length) rows.value = completed;
  else { const replacements = new Map(completed.map((row) => [row.id, row])); rows.value = rows.value.map((row) => replacements.get(row.id) ?? row); }
  const current = rows.value;
  await putRecord('batchJobs', {
    id: crypto.randomUUID(), filename: filename.value, total: current.length,
    success: current.filter((row) => row.status === 'success').length,
    warning: current.filter((row) => row.status === 'warning').length,
    failed: current.filter((row) => row.status === 'failed').length,
    retainedOutputs: retainOutputs.value ? current.map((row) => ({ text: row.text, result: row.result, status: row.status })) : undefined,
    createdAt: new Date().toISOString(),
  });
  processing.value = false; controller = null; sessionStorage.removeItem('cg-batch-active');
}
function cancel() { controller?.abort(); processing.value = false; sessionStorage.removeItem('cg-batch-active'); }
function retryFailed() { const failed = rows.value.filter((row) => row.status === 'failed').map((row) => ({ ...row, status: 'pending' as const, error: undefined })); void run(failed); }
function downloadTemplate() { void exportTextFile(batchTemplate, 'ciphergrid-batch-template.csv', 'text/csv'); }
function exportCsv() { void exportTextFile(exportBatchCsv(rows.value), `${filename.value.replace(/\.[^.]+$/, '') || 'ciphergrid'}-results.csv`, 'text/csv'); }
function exportTxt() { void exportTextFile(rows.value.map((row) => row.result ?? `ERROR: ${row.error ?? 'not processed'}`).join('\r\n'), `${filename.value.replace(/\.[^.]+$/, '') || 'ciphergrid'}-results.txt`, 'text/plain'); }
function setAlgorithm(kind: CipherOptions['kind']) {
  const defaults: Record<CipherOptions['kind'], CipherOptions> = { caesar: { kind: 'caesar', shift: 3 }, vigenere: { kind: 'vigenere', key: 'LEMON' }, atbash: { kind: 'atbash' }, affine: { kind: 'affine', a: 5, b: 8 }, 'rail-fence': { kind: 'rail-fence', rails: 3 }, columnar: { kind: 'columnar', key: 'ZEBRAS' }, playfair: { kind: 'playfair', key: 'KEYWORD' }, hill: { kind: 'hill', key: 'GYBNQKURP', size: 3 }, autokey: { kind: 'autokey', key: 'QUEENLY' } }; fallback.value = defaults[kind];
}
</script>

<template>
  <PageFrame title="Batch jobs" eyebrow="FILES / CHUNKED PROCESSING" back wide>
    <section class="batch-hero"><div><span class="kicker">TXT + CSV</span><h1>Rows in.<br />Results out.</h1></div><div class="terminal-panel"><strong>Original files are never overwritten.</strong><p>Every row is validated independently. Processing yields to the interface every 40 rows and can be cancelled.</p><button class="button" type="button" @click="downloadTemplate"><IonIcon :icon="downloadOutline" />Download CSV template</button></div></section>
    <label v-if="!rows.length" class="file-drop"><input type="file" accept=".txt,.csv,text/plain,text/csv" @change="importFile" /><strong>Choose a .txt or .csv file</strong><span>CSV columns: text, algorithm, operation, key, shift, rails, a, b</span></label>
    <p v-if="error" class="notice error">{{ error }}</p>
    <template v-if="rows.length">
      <section class="terminal-panel batch-config"><div class="panel-header"><div><span class="kicker">{{ filename }} / {{ rows.length }} rows</span><h2>Mapping preview</h2></div><label class="button">Replace file<input class="hidden-input" type="file" accept=".txt,.csv" @change="importFile" /></label></div><div class="config-grid"><div class="field"><label for="batch-algorithm">Fallback algorithm</label><select id="batch-algorithm" :value="fallback.kind" @change="setAlgorithm(($event.target as HTMLSelectElement).value as CipherOptions['kind'])"><option v-for="id in ['caesar','vigenere','atbash','affine','rail-fence','columnar','playfair','hill','autokey']" :key="id" :value="id">{{ id }}</option></select></div><div class="field"><label for="batch-mode">Fallback operation</label><select id="batch-mode" v-model="defaultMode"><option value="encrypt">Encrypt</option><option value="decrypt">Decrypt</option></select></div><div v-if="fallback.kind === 'caesar'" class="field"><label for="batch-shift">Shift</label><input id="batch-shift" v-model.number="fallback.shift" type="number" /></div><div v-else-if="fallback.kind === 'vigenere' || fallback.kind === 'columnar' || fallback.kind === 'playfair' || fallback.kind === 'autokey'" class="field"><label for="batch-key">Keyword</label><input id="batch-key" v-model="fallback.key" /></div><label class="retain-toggle"><input v-model="retainOutputs" type="checkbox" />Retain row outputs in the local job summary</label><button v-if="!processing" class="button button--primary" type="button" @click="run()"><IonIcon :icon="playOutline" />Process all rows</button><button v-else class="button button--danger" type="button" @click="cancel"><IonIcon :icon="stopOutline" />Cancel</button></div></section>
      <section class="metric-grid batch-metrics"><div class="metric"><strong>{{ counts.pending }}</strong><span>Pending</span></div><div class="metric"><strong>{{ counts.success }}</strong><span>Success</span></div><div class="metric"><strong>{{ counts.warning }}</strong><span>Warnings</span></div><div class="metric"><strong>{{ counts.failed }}</strong><span>Failed</span></div></section>
      <div v-if="processing || progress" class="progress-track" role="progressbar" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100"><span :style="{ width: `${progress}%` }" /></div>
      <section class="terminal-panel batch-results"><div class="panel-header"><div><span class="kicker">Editable row data</span><h2>Results</h2></div><button v-if="counts.failed" class="button" type="button" @click="retryFailed"><IonIcon :icon="refreshOutline" />Retry failed</button></div><div class="scroll-x"><table class="data-table"><thead><tr><th>#</th><th>Text</th><th>Algorithm</th><th>Operation</th><th>Key/shift</th><th>Status</th><th>Result / error</th></tr></thead><tbody><tr v-for="(row, index) in rows" :key="row.id"><td>{{ index + 1 }}</td><td><input v-model="row.text" aria-label="Row text" /></td><td><input v-model="row.algorithm" aria-label="Row algorithm" placeholder="fallback" /></td><td><input v-model="row.operation" aria-label="Row operation" placeholder="fallback" /></td><td><input v-model="row.key" aria-label="Row key" placeholder="key" /><input v-model="row.shift" aria-label="Row shift" placeholder="shift" /></td><td><span :class="['badge', row.status === 'failed' ? 'error' : row.status === 'success' ? 'badge--success' : '']">{{ row.status }}</span></td><td class="mono">{{ row.result ?? row.error ?? '—' }}</td></tr></tbody></table></div><div class="grid-2 export-actions"><button class="button" type="button" @click="exportCsv"><IonIcon :icon="downloadOutline" />Export CSV</button><button class="button" type="button" @click="exportTxt"><IonIcon :icon="downloadOutline" />Export TXT</button></div></section>
    </template>
  </PageFrame>
</template>

<style scoped>
.batch-hero { display: grid; gap: 20px; padding-bottom: 30px; }.batch-hero h1 { margin: 8px 0 0; }.batch-hero .terminal-panel { align-self: end; }.batch-hero p { color: var(--cg-muted); line-height: 1.4; }.batch-config { margin-bottom: 12px; }.hidden-input { position: absolute; opacity: 0; width: 1px; }.config-grid { display: grid; gap: 10px; }.config-grid .button { align-self: end; }.batch-metrics { margin: 12px 0; }.batch-results { margin-top: 12px; }.batch-results input { width: 150px; min-height: 36px; padding: 6px; border: 1px solid var(--cg-line); background: var(--cg-surface); color: var(--cg-ink); }.batch-results td:last-child { min-width: 230px; max-width: 400px; overflow-wrap: anywhere; }.export-actions { margin-top: 14px; }
.retain-toggle { display: flex; align-items: center; gap: 8px; min-height: 44px; font-size: .78rem; }.retain-toggle input { min-height: auto; }
@media (min-width: 800px) { .batch-hero { grid-template-columns: 1fr 1fr; }.config-grid { grid-template-columns: 1fr 180px 180px 200px; } }
</style>
