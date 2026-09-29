<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { IonAlert, IonContent, IonHeader, IonIcon, IonModal, IonTitle, IonToolbar, onIonViewWillEnter, useIonRouter } from '@ionic/vue';
import { RouterLink } from 'vue-router';
import { arrowForwardOutline, bookOutline, closeOutline, createOutline, documentsOutline, gitNetworkOutline, saveOutline, settingsOutline, timeOutline, trashOutline } from 'ionicons/icons';
import PageFrame from '@/components/common/PageFrame.vue';
import { clearStore, deleteRecord, getRecords, putRecord } from '@/services/storage/database';
import { cipherById, cipherRegistry } from '@/services/ciphers/registry';
import { useSettingsStore } from '@/stores/settings';
import { createDefaultCipherOptions, snapshotCipherOptions, useWorkspaceStore } from '@/stores/workspace';
import { HISTORY_CHANGED_EVENT, notifyHistoryChanged, type HistoryRecord } from '@/models/history';
import type { CipherMode, CipherOptions } from '@/models/cipher';

interface BatchSummary { id: string; filename: string; total: number; success: number; warning: number; failed: number; createdAt: string }
type HistoryDraft = Omit<HistoryRecord, 'algorithmId' | 'options'> & { algorithmId: CipherOptions['kind']; options: CipherOptions };

const history = ref<HistoryRecord[]>([]); const error = ref(''); const notice = ref(''); const loading = ref(true);
const batchJobs = ref<BatchSummary[]>([]); const editing = ref<HistoryDraft | null>(null); const deleteTarget = ref<HistoryRecord | null>(null);
const settings = useSettingsStore(); const workspace = useWorkspaceStore(); const ionRouter = useIonRouter();

function algorithmIdFor(record: HistoryRecord): CipherOptions['kind'] {
  if (record.algorithmId && cipherRegistry.some((cipher) => cipher.id === record.algorithmId)) return record.algorithmId;
  return cipherRegistry.find((cipher) => cipher.name.toLowerCase() === record.algorithm.toLowerCase())?.id ?? 'caesar';
}
function optionsFor(record: HistoryRecord, algorithmId = algorithmIdFor(record)): CipherOptions {
  return record.options?.kind === algorithmId ? snapshotCipherOptions(record.options) : createDefaultCipherOptions(algorithmId);
}
async function load() {
  try {
    error.value = '';
    if (!settings.loaded) await settings.load();
    const records = await getRecords<HistoryRecord>('history');
    batchJobs.value = (await getRecords<BatchSummary>('batchJobs')).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8);
    if (settings.retentionDays > 0) {
      const cutoff = Date.now() - settings.retentionDays * 86_400_000;
      const expired = records.filter((record) => new Date(record.createdAt).getTime() < cutoff);
      await Promise.all(expired.map((record) => deleteRecord('history', record.id)));
      history.value = records.filter((record) => !expired.includes(record)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } else history.value = records.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (cause) { error.value = cause instanceof Error ? cause.message : 'Could not load local history.'; }
  finally { loading.value = false; }
}
function openDetails(record: HistoryRecord) {
  const algorithmId = algorithmIdFor(record);
  editing.value = {
    id: record.id,
    algorithm: cipherById(algorithmId).name,
    algorithmId,
    mode: record.mode,
    input: record.input,
    output: record.output,
    options: optionsFor(record, algorithmId),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}
function changeAlgorithm(kind: CipherOptions['kind']) {
  if (!editing.value) return;
  editing.value.algorithmId = kind;
  editing.value.algorithm = cipherById(kind).name;
  editing.value.options = createDefaultCipherOptions(kind);
}
async function saveEdits() {
  if (!editing.value) return;
  const draft = editing.value;
  const record: HistoryRecord = {
    id: draft.id,
    algorithm: cipherById(draft.algorithmId).name,
    algorithmId: draft.algorithmId,
    mode: draft.mode,
    input: draft.input,
    output: draft.output,
    options: snapshotCipherOptions(draft.options),
    createdAt: draft.createdAt,
    updatedAt: new Date().toISOString(),
  };
  await putRecord('history', record);
  editing.value = null;
  notice.value = 'Saved result updated.';
  notifyHistoryChanged();
  await load();
}
function openInWorkspace(useOutput = false) {
  if (!editing.value) return;
  const mode: CipherMode = useOutput ? (editing.value.mode === 'encrypt' ? 'decrypt' : 'encrypt') : editing.value.mode;
  workspace.loadSaved(useOutput ? editing.value.output : editing.value.input, useOutput ? '' : editing.value.output, mode, editing.value.options);
  editing.value = null;
  ionRouter.navigate('/workspace', 'back', 'push');
}
async function confirmRemove() {
  const target = deleteTarget.value;
  if (!target) return;
  await deleteRecord('history', target.id);
  if (editing.value?.id === target.id) editing.value = null;
  deleteTarget.value = null;
  notifyHistoryChanged();
  await load();
}
async function clearHistory() {
  if (!window.confirm('Clear all locally saved history? This cannot be undone.')) return;
  await clearStore('history'); editing.value = null; notifyHistoryChanged(); await load();
}
const deleteButtons = [
  { text: 'Cancel', role: 'cancel' },
  { text: 'Delete permanently', role: 'destructive', handler: () => { void confirmRemove(); } },
];
const handleHistoryChange = () => { void load(); };
onMounted(() => {
  window.addEventListener(HISTORY_CHANGED_EVENT, handleHistoryChange);
  void load();
});
onBeforeUnmount(() => window.removeEventListener(HISTORY_CHANGED_EVENT, handleHistoryChange));
onIonViewWillEnter(() => { void load(); });
</script>

<template>
  <PageFrame title="Local library">
    <section class="library-hero"><span class="kicker">Saved on this device</span><h1>Your work,<br />indexed.</h1><p class="lead">History is opt-in. Recipes and batch summaries use structured local storage and never include AES passphrases.</p></section>
    <section class="grid-2 library-links">
      <RouterLink to="/recipes" class="link-panel"><IonIcon :icon="gitNetworkOutline" /><strong>Recipes</strong><span>Visible, reusable transformation flows</span></RouterLink>
      <RouterLink to="/batch" class="link-panel"><IonIcon :icon="documentsOutline" /><strong>Batch jobs</strong><span>Import, process, retry, export</span></RouterLink>
      <RouterLink to="/learn" class="link-panel"><IonIcon :icon="bookOutline" /><strong>Learning</strong><span>Interactive algorithm guides</span></RouterLink>
      <RouterLink to="/settings" class="link-panel"><IonIcon :icon="settingsOutline" /><strong>History settings</strong><span>Enable saving and choose local retention</span></RouterLink>
    </section>
    <section class="terminal-panel history-panel">
      <div class="panel-header"><div><span class="kicker">History / {{ history.length }}</span><h2>Saved results</h2></div><button v-if="history.length" class="button button--danger" type="button" @click="clearHistory"><IonIcon :icon="trashOutline" />Clear all</button></div>
      <p v-if="notice" class="notice" role="status">{{ notice }}</p>
      <div v-if="loading" class="library-loading" role="status"><span class="mono">[ READING LOCAL INDEX ]</span><p>Loading saved results&hellip;</p></div>
      <p v-else-if="error" class="notice error">{{ error }}</p>
      <div v-else-if="history.length" class="history-list">
        <article v-for="record in history" :key="record.id">
          <div class="history-meta"><span class="badge">{{ record.algorithm }} / {{ record.mode }}</span><time><IonIcon :icon="timeOutline" />{{ new Date(record.updatedAt ?? record.createdAt).toLocaleString() }}</time></div>
          <p class="mono">{{ record.output }}</p>
          <div class="history-actions"><button class="button" type="button" @click="openDetails(record)"><IonIcon :icon="createOutline" />View / edit</button><button class="square-icon" type="button" aria-label="Delete this saved result" @click="deleteTarget = record"><IonIcon :icon="trashOutline" /></button></div>
        </article>
      </div>
      <div v-else class="empty-library"><span class="mono">[ EMPTY INDEX ]</span><h3>No saved results yet</h3><p>Enable history in Settings, then save a Workspace result.</p><RouterLink to="/workspace" class="button button--primary">Open workspace</RouterLink></div>
    </section>
    <section v-if="batchJobs.length" class="terminal-panel batch-history"><div class="panel-header"><div><span class="kicker">Recent job summaries</span><h2>Batch index</h2></div></div><div class="scroll-x"><table class="data-table"><thead><tr><th>File</th><th>Rows</th><th>Success</th><th>Review</th><th>Failed</th><th>Date</th></tr></thead><tbody><tr v-for="job in batchJobs" :key="job.id"><td>{{ job.filename }}</td><td>{{ job.total }}</td><td>{{ job.success }}</td><td>{{ job.warning }}</td><td>{{ job.failed }}</td><td>{{ new Date(job.createdAt).toLocaleString() }}</td></tr></tbody></table></div></section>
    <IonModal class="saved-result-modal" :is-open="Boolean(editing)" @did-dismiss="editing = null">
      <IonHeader><IonToolbar><IonTitle>Saved result details</IonTitle><button class="square-icon modal-close" type="button" aria-label="Close saved result details" @click="editing = null"><IonIcon :icon="closeOutline" /></button></IonToolbar></IonHeader>
      <IonContent v-if="editing" class="saved-result-content">
        <div class="saved-editor stack">
          <div><span class="kicker">Local record / editable</span><h1>{{ editing.algorithm }}</h1><p class="lead">Review the complete transformation, correct it, or load it back into the workspace.</p></div>
          <div class="grid-2">
            <div class="field"><label for="saved-algorithm">Algorithm</label><select id="saved-algorithm" :value="editing.algorithmId" @change="changeAlgorithm(($event.target as HTMLSelectElement).value as CipherOptions['kind'])"><option v-for="cipher in cipherRegistry" :key="cipher.id" :value="cipher.id">{{ cipher.name }}</option></select></div>
            <div class="field"><label for="saved-mode">Operation</label><select id="saved-mode" v-model="editing.mode"><option value="encrypt">Encrypt</option><option value="decrypt">Decrypt</option></select></div>
          </div>
          <div class="terminal-panel saved-options">
            <span class="kicker">Saved parameters</span>
            <div v-if="editing.options.kind === 'caesar'" class="field"><label for="saved-shift">Shift</label><input id="saved-shift" v-model.number="editing.options.shift" type="number" /></div>
            <div v-else-if="editing.options.kind === 'vigenere' || editing.options.kind === 'autokey' || editing.options.kind === 'columnar' || editing.options.kind === 'playfair'" class="field"><label for="saved-key">Keyword</label><input id="saved-key" v-model="editing.options.key" /></div>
            <div v-else-if="editing.options.kind === 'affine'" class="grid-2"><div class="field"><label for="saved-a">a</label><input id="saved-a" v-model.number="editing.options.a" type="number" /></div><div class="field"><label for="saved-b">b</label><input id="saved-b" v-model.number="editing.options.b" type="number" /></div></div>
            <div v-else-if="editing.options.kind === 'rail-fence'" class="field"><label for="saved-rails">Rails</label><input id="saved-rails" v-model.number="editing.options.rails" type="number" min="2" /></div>
            <div v-else-if="editing.options.kind === 'hill'" class="grid-2"><div class="field"><label for="saved-size">Matrix size</label><select id="saved-size" v-model.number="editing.options.size"><option :value="2">2×2</option><option :value="3">3×3</option></select></div><div class="field"><label for="saved-matrix-key">Matrix key</label><input id="saved-matrix-key" v-model="editing.options.key" /></div></div>
            <p v-else class="notice">Atbash has no configurable key.</p>
          </div>
          <div class="field"><label for="saved-input">Full input</label><textarea id="saved-input" v-model="editing.input" /></div>
          <div class="field"><label for="saved-output">Full output</label><textarea id="saved-output" v-model="editing.output" /></div>
          <div class="saved-record-meta"><span>Created {{ new Date(editing.createdAt).toLocaleString() }}</span><span v-if="editing.updatedAt">Updated {{ new Date(editing.updatedAt).toLocaleString() }}</span></div>
          <div class="saved-editor-actions"><button class="button button--primary" type="button" @click="saveEdits"><IonIcon :icon="saveOutline" />Save changes</button><button class="button" type="button" @click="openInWorkspace(false)">Open source in workspace <IonIcon :icon="arrowForwardOutline" /></button><button class="button" type="button" @click="openInWorkspace(true)">Use result as new input <IonIcon :icon="arrowForwardOutline" /></button><button class="button button--danger" type="button" @click="deleteTarget = editing"><IonIcon :icon="trashOutline" />Delete result</button></div>
        </div>
      </IonContent>
    </IonModal>
    <IonAlert :is-open="Boolean(deleteTarget)" header="Delete saved result?" message="This result will be permanently removed from this device. This action cannot be undone." :buttons="deleteButtons" @did-dismiss="deleteTarget = null" />
  </PageFrame>
</template>

<style scoped>
.library-hero { padding: 16px 0 34px; }.library-hero h1 { margin: 8px 0 18px; }.library-links { margin-bottom: 42px; }.library-links ion-icon { font-size: 1.5rem; }.library-loading { display: grid; min-height: 220px; place-items: center; align-content: center; gap: 8px; color: var(--cg-muted); text-align: center; }.library-loading p { margin: 0; }.history-list { display: grid; gap: 9px; }.history-list article { display: grid; min-width: 0; gap: 12px; padding: 14px; border: 1px solid var(--cg-line); }.history-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 9px; }.history-meta time { color: var(--cg-muted); font-size: .7rem; }.history-list p { max-height: 94px; margin: 0; overflow: auto; }.history-actions { display: grid; grid-template-columns: 1fr 44px; gap: 8px; }.empty-library { display: grid; min-height: 300px; place-items: center; align-content: center; gap: 8px; text-align: center; }.empty-library p { color: var(--cg-muted); }.empty-library .mono { color: var(--cg-line); }.batch-history { margin-top: 12px; }
.modal-close { position: absolute; z-index: 2; top: 6px; right: 8px; }.saved-editor { width: min(100%, 760px); margin: 0 auto; padding: 24px 16px calc(36px + env(safe-area-inset-bottom)); }.saved-editor h1 { margin: 7px 0 14px; font-size: clamp(2.1rem, 9vw, 4rem); }.saved-options { display: grid; gap: 14px; box-shadow: none; }.saved-record-meta { display: flex; flex-wrap: wrap; gap: 8px 18px; color: var(--cg-muted); font: .7rem ui-monospace, monospace; }.saved-editor-actions { display: grid; gap: 8px; }
:global(.saved-result-modal) { --width: min(760px, 100%); --height: min(900px, 100%); --border-radius: 0; --background: var(--cg-canvas); }
:global(.saved-result-modal ion-toolbar) { --background: var(--cg-surface); --color: var(--cg-ink); --border-color: var(--cg-line); }
@media (min-width: 700px) { .saved-editor-actions { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
