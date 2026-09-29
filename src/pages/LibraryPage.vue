<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { IonIcon } from '@ionic/vue';
import { RouterLink } from 'vue-router';
import { bookOutline, gitNetworkOutline, documentsOutline, trashOutline, timeOutline, settingsOutline } from 'ionicons/icons';
import PageFrame from '@/components/common/PageFrame.vue';
import { clearStore, deleteRecord, getRecords } from '@/services/storage/database';
import { useSettingsStore } from '@/stores/settings';

interface HistoryRecord { id: string; algorithm: string; mode: string; input: string; output: string; createdAt: string }
interface BatchSummary { id: string; filename: string; total: number; success: number; warning: number; failed: number; createdAt: string }
const history = ref<HistoryRecord[]>([]); const error = ref('');
const batchJobs = ref<BatchSummary[]>([]);
const settings = useSettingsStore();
async function load() {
  try {
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
}
async function remove(id: string) { await deleteRecord('history', id); await load(); }
async function clearHistory() { if (!window.confirm('Clear all locally saved history? This cannot be undone.')) return; await clearStore('history'); await load(); }
onMounted(load);
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
      <p v-if="error" class="notice error">{{ error }}</p>
      <div v-else-if="history.length" class="history-list"><article v-for="record in history" :key="record.id"><div class="history-meta"><span class="badge">{{ record.algorithm }} / {{ record.mode }}</span><time><IonIcon :icon="timeOutline" />{{ new Date(record.createdAt).toLocaleString() }}</time></div><p class="mono">{{ record.output }}</p><details><summary>Show source</summary><pre>{{ record.input }}</pre></details><button class="square-icon" type="button" aria-label="Delete this saved result" @click="remove(record.id)"><IonIcon :icon="trashOutline" /></button></article></div>
      <div v-else class="empty-library"><span class="mono">[ EMPTY INDEX ]</span><h3>No saved results yet</h3><p>Enable history in Settings, then save a Workspace result.</p><RouterLink to="/workspace" class="button button--primary">Open workspace</RouterLink></div>
    </section>
    <section v-if="batchJobs.length" class="terminal-panel batch-history"><div class="panel-header"><div><span class="kicker">Recent job summaries</span><h2>Batch index</h2></div></div><div class="scroll-x"><table class="data-table"><thead><tr><th>File</th><th>Rows</th><th>Success</th><th>Review</th><th>Failed</th><th>Date</th></tr></thead><tbody><tr v-for="job in batchJobs" :key="job.id"><td>{{ job.filename }}</td><td>{{ job.total }}</td><td>{{ job.success }}</td><td>{{ job.warning }}</td><td>{{ job.failed }}</td><td>{{ new Date(job.createdAt).toLocaleString() }}</td></tr></tbody></table></div></section>
  </PageFrame>
</template>

<style scoped>
.library-hero { padding: 16px 0 34px; }.library-hero h1 { margin: 8px 0 18px; }.library-links { margin-bottom: 42px; }.library-links ion-icon { font-size: 1.5rem; }.history-list { display: grid; gap: 9px; }.history-list article { position: relative; padding: 14px 62px 14px 14px; border: 1px solid var(--cg-line); }.history-list article > .square-icon { position: absolute; right: 10px; top: 10px; }.history-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 9px; }.history-meta time { color: var(--cg-muted); font-size: .7rem; }.history-list p { max-height: 94px; overflow: auto; }.history-list details { color: var(--cg-muted); font-size: .78rem; }.history-list pre { white-space: pre-wrap; }.empty-library { display: grid; min-height: 300px; place-items: center; align-content: center; gap: 8px; text-align: center; }.empty-library p { color: var(--cg-muted); }.empty-library .mono { color: var(--cg-line); }
.batch-history { margin-top: 12px; }
</style>
