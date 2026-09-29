<script setup lang="ts">
import { computed, ref } from 'vue';
import { IonIcon } from '@ionic/vue';
import { RouterLink, useRouter } from 'vue-router';
import { copyOutline, swapVerticalOutline, saveOutline, shareOutline, qrCodeOutline, analyticsOutline, playOutline } from 'ionicons/icons';
import { Clipboard } from '@capacitor/clipboard';
import { Share } from '@capacitor/share';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import PageFrame from '@/components/common/PageFrame.vue';
import { cipherRegistry, cipherById } from '@/services/ciphers/registry';
import { useWorkspaceStore } from '@/stores/workspace';
import { useSettingsStore } from '@/stores/settings';
import { putRecord } from '@/services/storage/database';
import { notifyHistoryChanged, type HistoryRecord } from '@/models/history';
const workspace = useWorkspaceStore(); const settings = useSettingsStore(); const router = useRouter();
const notice = ref(''); const historyDisabled = ref(false); const selected = computed(() => cipherById(workspace.options.kind));
function run() { workspace.process(); if (!workspace.error) void Haptics.impact({ style: ImpactStyle.Light }).catch(() => undefined); }
async function copy() { await Clipboard.write({ string: workspace.output }); historyDisabled.value = false; notice.value = 'Output copied.'; }
async function share() { await Share.share({ title: `${selected.value.name} output`, text: workspace.output, dialogTitle: 'Share CipherGrid output' }); }
async function save() {
  if (!settings.historyEnabled) { historyDisabled.value = true; notice.value = 'History is off. Enable it in Settings before saving.'; return; }
  const record: HistoryRecord = {
    id: crypto.randomUUID(), algorithm: selected.value.name, algorithmId: selected.value.id,
    mode: workspace.mode, input: workspace.input, output: workspace.output,
    options: structuredClone(workspace.options), createdAt: new Date().toISOString(),
  };
  await putRecord('history', record);
  notifyHistoryChanged();
  historyDisabled.value = false;
  notice.value = 'Saved locally.';
}
function toQr() { sessionStorage.setItem('cg-qr-text', workspace.output); sessionStorage.setItem('cg-qr-algorithm', workspace.options.kind); void router.push('/qr'); }
function toAnalyzer() { sessionStorage.setItem('cg-analyze-text', workspace.output); void router.push('/analyze'); }
</script>

<template>
  <PageFrame title="Cipher workspace" wide>
    <section class="workspace-top">
      <div><span class="kicker">{{ selected.family }} / {{ selected.id }}</span><h1>{{ selected.name }}</h1><p class="lead">{{ selected.description }}</p></div>
      <div class="classification"><span class="badge badge--warning">Educational only</span><p>Classical cipher. Do not use it for real secrets.</p></div>
    </section>
    <div class="segmented mode-tabs" aria-label="Operation">
      <button type="button" :class="{ active: workspace.mode === 'encrypt' }" @click="workspace.mode = 'encrypt'">Encrypt</button>
      <button type="button" :class="{ active: workspace.mode === 'decrypt' }" @click="workspace.mode = 'decrypt'">Decrypt</button>
    </div>
    <section class="workspace-grid">
      <div class="stack">
        <div class="terminal-panel stack">
          <div class="field"><label for="algorithm">Algorithm</label><select id="algorithm" :value="workspace.options.kind" @change="workspace.select(($event.target as HTMLSelectElement).value as typeof workspace.options.kind)"><option v-for="cipher in cipherRegistry" :key="cipher.id" :value="cipher.id">{{ cipher.name }} · {{ cipher.family }}</option></select></div>
          <div class="field"><label for="source">{{ workspace.mode === 'encrypt' ? 'Plaintext' : 'Ciphertext' }}</label><textarea id="source" :value="workspace.input" placeholder="Enter or scan text…" spellcheck="false" @input="workspace.setInput(($event.target as HTMLTextAreaElement).value)" /><span class="char-count">{{ workspace.input.length }} chars</span></div>
        </div>
        <div class="terminal-panel options-panel">
          <div class="panel-header"><div><span class="kicker">Parameters</span><h3>Key configuration</h3></div></div>
          <div v-if="workspace.options.kind === 'caesar'" class="field"><label for="shift">Shift (any integer; normalized mod 26)</label><input id="shift" v-model.number="workspace.options.shift" type="number" /></div>
          <div v-else-if="workspace.options.kind === 'vigenere' || workspace.options.kind === 'autokey' || workspace.options.kind === 'columnar' || workspace.options.kind === 'playfair'" class="field"><label for="key">Keyword</label><input id="key" v-model="workspace.options.key" type="text" spellcheck="false" /></div>
          <div v-else-if="workspace.options.kind === 'affine'" class="grid-2"><div class="field"><label for="affine-a">a (coprime with 26)</label><input id="affine-a" v-model.number="workspace.options.a" type="number" /></div><div class="field"><label for="affine-b">b</label><input id="affine-b" v-model.number="workspace.options.b" type="number" /></div></div>
          <div v-else-if="workspace.options.kind === 'rail-fence'" class="field"><label for="rails">Rails</label><input id="rails" v-model.number="workspace.options.rails" type="number" min="2" /></div>
          <div v-else-if="workspace.options.kind === 'hill'" class="grid-2"><div class="field"><label for="matrix-size">Matrix size</label><select id="matrix-size" v-model.number="workspace.options.size"><option :value="2">2×2</option><option :value="3">3×3</option></select></div><div class="field"><label for="matrix-key">{{ workspace.options.size ** 2 }}-letter key</label><input id="matrix-key" v-model="workspace.options.key" type="text" spellcheck="false" /></div></div>
          <p v-else class="notice">Atbash needs no key: the same mapping encrypts and decrypts.</p>
        </div>
        <button class="button button--primary process-button" type="button" :disabled="!workspace.input" @click="run"><IonIcon :icon="playOutline" /> Process {{ workspace.mode }}</button>
      </div>

      <div class="stack">
        <div :class="['terminal-panel', 'result-panel', { error: workspace.error }]">
          <div class="panel-header"><div><span class="kicker">Output / {{ workspace.output.length }} chars</span><h2>{{ workspace.error ? 'Check configuration' : 'Result' }}</h2></div><button class="square-icon" type="button" :disabled="!workspace.output" aria-label="Swap input and output" @click="workspace.swap"><IonIcon :icon="swapVerticalOutline" /></button></div>
          <p v-if="workspace.error" role="alert">{{ workspace.error }}</p>
          <pre v-else-if="workspace.output" class="result-output">{{ workspace.output }}</pre>
          <div v-else class="empty-result"><span>00</span><p>Your transformed text and explanation will appear here.</p></div>
          <div v-if="workspace.output" class="result-actions">
            <button type="button" @click="copy"><IonIcon :icon="copyOutline" />Copy</button><button type="button" @click="save"><IonIcon :icon="saveOutline" />Save</button><button type="button" @click="share"><IonIcon :icon="shareOutline" />Share</button><button type="button" @click="toQr"><IonIcon :icon="qrCodeOutline" />QR</button><button type="button" @click="toAnalyzer"><IonIcon :icon="analyticsOutline" />Analyze</button>
          </div>
          <p v-if="notice" class="notice" role="status">{{ notice }} <RouterLink v-if="historyDisabled" to="/settings" class="notice-settings">Open Settings</RouterLink></p>
        </div>
        <div v-if="workspace.result" class="terminal-panel">
          <div class="panel-header"><div><span class="kicker">Step inspector</span><h2>How it moved</h2></div><span class="badge">{{ workspace.result.steps.length }} steps</span></div>
          <p v-for="warning in workspace.result.warnings" :key="warning" class="notice">{{ warning }}</p>
          <div class="steps"><article v-for="item in workspace.result.steps.slice(0, 60)" :key="`${item.index}-${item.title}`" class="step"><strong>{{ item.title }}</strong><p class="mono">{{ item.input }} <span v-if="item.output">→ {{ item.output }}</span></p><small>{{ item.detail }}</small></article></div>
          <p v-if="workspace.result.steps.length > 60" class="notice">Showing the first 60 steps; the complete output is preserved above.</p>
        </div>
      </div>
    </section>
  </PageFrame>
</template>

<style scoped>
.workspace-top { display: grid; gap: 20px; padding-bottom: 24px; }.workspace-top h1 { margin: 8px 0 16px; }.classification { align-self: end; padding: 14px; border: 1px solid var(--cg-line); background: var(--cg-surface); box-shadow: 4px 4px 0 var(--cg-line); }.classification p { color: var(--cg-muted); font-size: .8rem; margin: 8px 0 0; }
.mode-tabs { margin-bottom: 12px; }.workspace-grid { display: grid; gap: 12px; }.options-panel { min-height: 135px; }.process-button { width: 100%; min-height: 58px; text-transform: uppercase; letter-spacing: .04em; }
.result-panel { min-height: 310px; }.result-output { min-height: 148px; margin: 0; padding: 16px; white-space: pre-wrap; overflow-wrap: anywhere; background: var(--cg-dark); color: #f3f5f7; font: .95rem/1.6 ui-monospace, monospace; }.empty-result { display: grid; min-height: 180px; place-items: center; align-content: center; color: var(--cg-muted); text-align: center; }.empty-result span { font: 800 3rem ui-monospace, monospace; color: var(--cg-line); }.result-actions { display: grid; grid-template-columns: repeat(5, 1fr); border: 1px solid var(--cg-line); border-top: 0; }.result-actions button { display: grid; place-items: center; gap: 3px; padding: 7px 2px; border: 0; border-right: 1px solid var(--cg-line); background: var(--cg-surface); color: var(--cg-ink); font-size: .66rem; }.result-actions button:last-child { border: 0; }.step p { margin: 4px 0; }.step small { color: var(--cg-muted); }
.notice-settings { display: inline-flex; min-height: 44px; align-items: center; margin-left: 8px; color: inherit; font-weight: 800; text-decoration: underline; text-underline-offset: 3px; }
@media (min-width: 900px) { .workspace-top { grid-template-columns: 1fr 260px; }.workspace-grid { grid-template-columns: minmax(0, .85fr) minmax(0, 1.15fr); align-items: start; } }
</style>
