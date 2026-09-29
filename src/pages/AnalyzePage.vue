<script setup lang="ts">
import { computed, ref } from 'vue';
import PageFrame from '@/components/common/PageFrame.vue';
import { bruteForceAffine, bruteForceCaesar, rankRailFence, type AnalysisCandidate, type LanguageProfileId } from '@/services/analysis/scoring';
import { estimateVigenereKeyLengths, kasiskiExamination, suggestCipherFamily, suggestVigenereKey, textStatistics } from '@/services/analysis/statistics';
import { runCipher } from '@/services/ciphers/registry';
import { useWorkspaceStore } from '@/stores/workspace';
import { useRouter } from 'vue-router';

type Tool = 'overview' | 'caesar' | 'affine' | 'vigenere' | 'rail';
const input = ref(sessionStorage.getItem('cg-analyze-text') ?? ''); const tool = ref<Tool>('overview'); const language = ref<LanguageProfileId>('english');
const candidates = ref<AnalysisCandidate[]>([]); const keyLength = ref(3); const manualKey = ref(''); const error = ref(''); const workspace = useWorkspaceStore(); const router = useRouter();
const stats = computed(() => textStatistics(input.value)); const family = computed(() => suggestCipherFamily(input.value));
const estimates = computed(() => estimateVigenereKeyLengths(input.value)); const kasiski = computed(() => kasiskiExamination(input.value));
const maximumFrequency = computed(() => Math.max(0, ...stats.value.frequencies.map((item) => item.percent)));
const vigenereOutput = computed(() => manualKey.value ? (() => { try { return runCipher(input.value, { kind: 'vigenere', key: manualKey.value }, 'decrypt').output; } catch { return ''; } })() : '');
function frequencyBarHeight(percent: number): number {
  if (maximumFrequency.value <= 0) return 2;
  return Math.max(2, Math.round((percent / maximumFrequency.value) * 92));
}
function analyze() {
  error.value = ''; candidates.value = [];
  if (!input.value) { error.value = 'Enter ciphertext to analyze.'; return; }
  if (tool.value === 'caesar') candidates.value = bruteForceCaesar(input.value, language.value);
  else if (tool.value === 'affine') candidates.value = bruteForceAffine(input.value, language.value).slice(0, 40);
  else if (tool.value === 'rail') candidates.value = rankRailFence(input.value, 10, language.value);
  else if (tool.value === 'vigenere') { keyLength.value = estimates.value[0]?.length ?? 3; manualKey.value = suggestVigenereKey(input.value, keyLength.value); }
}
function applyLength() { manualKey.value = suggestVigenereKey(input.value, keyLength.value); }
function useCandidate(candidate: AnalysisCandidate) { workspace.setInput(candidate.output); workspace.mode = 'encrypt'; void router.push('/workspace'); }
</script>

<template>
  <PageFrame title="Cryptanalysis" wide>
    <section class="analysis-hero"><div><span class="kicker">Deterministic tools / no ML claims</span><h1>Test the<br />evidence.</h1></div><div class="metric-grid"><div class="metric"><strong>{{ stats.characters }}</strong><span>Characters</span></div><div class="metric"><strong>{{ stats.letters }}</strong><span>Letters</span></div><div class="metric"><strong>{{ stats.indexOfCoincidence.toFixed(4) }}</strong><span>Index of coincidence</span></div><div class="metric"><strong>{{ stats.uniqueLetters }}</strong><span>Unique letters</span></div></div></section>
    <section class="terminal-panel stack analyzer-input">
      <div class="field"><label for="analysis-source">Ciphertext sample</label><textarea id="analysis-source" v-model="input" placeholder="Paste or send ciphertext from Workspace or Scan…" /></div>
      <div class="analysis-controls"><div class="field"><label for="tool">Tool</label><select id="tool" v-model="tool"><option value="overview">Statistics + heuristic</option><option value="caesar">Caesar brute force (26 shifts)</option><option value="affine">Affine exhaustive ranking</option><option value="vigenere">Vigenère IC + Kasiski</option><option value="rail">Rail Fence comparison</option></select></div><div class="field"><label for="language">Scoring profile</label><select id="language" v-model="language"><option value="english">English</option><option value="filipino">Filipino</option></select></div><button class="button button--primary" type="button" @click="analyze">Run analysis</button></div>
      <p v-if="error" class="notice error" role="alert">{{ error }}</p>
    </section>

    <section v-if="tool === 'overview'" class="grid-2 result-section">
      <div class="terminal-panel"><span class="kicker">Cautious heuristic / {{ family.confidence }}</span><h2>{{ family.label }}</h2><p class="lead">{{ family.rationale }}</p><p class="notice">This is a pattern-based suggestion, not a definitive cipher identification.</p></div>
      <div class="terminal-panel"><div class="panel-header"><div><span class="kicker">Repeated sequences</span><h2>N-gram summary</h2></div></div><div v-if="stats.ngrams.length" class="ngram-list"><span v-for="gram in stats.ngrams" :key="gram.value"><strong>{{ gram.value }}</strong> ×{{ gram.count }}</span></div><p v-else class="lead">No repeated bigrams or trigrams in this sample.</p></div>
      <div class="terminal-panel frequency-panel"><div class="panel-header"><div><span class="kicker">A–Z distribution</span><h2>Letter frequency</h2></div></div><div class="frequency-bars"><div v-for="item in stats.frequencies" :key="item.letter" class="frequency-bar" :aria-label="`${item.letter}: ${item.percent.toFixed(1)} percent`" :title="`${item.percent.toFixed(1)}%`"><i :style="{ height: `${frequencyBarHeight(item.percent)}px` }" /><span>{{ item.letter }}</span></div></div></div>
    </section>

    <section v-else-if="tool === 'vigenere'" class="grid-2 result-section">
      <div class="terminal-panel stack"><div class="panel-header"><div><span class="kicker">IC by column</span><h2>Key-length estimates</h2></div></div><div class="scroll-x"><table class="data-table"><thead><tr><th>Length</th><th>Average IC</th><th>Distance from English</th></tr></thead><tbody><tr v-for="item in estimates.slice(0, 10)" :key="item.length"><td>{{ item.length }}</td><td>{{ item.averageIc.toFixed(4) }}</td><td>{{ item.distance.toFixed(4) }}</td></tr></tbody></table></div><div class="grid-2"><div class="field"><label for="key-length">Selected length</label><input id="key-length" v-model.number="keyLength" type="number" min="1" max="20" @change="applyLength" /></div><div class="field"><label for="manual-key">Suggested/editable key</label><input id="manual-key" v-model="manualKey" type="text" /></div></div><div v-if="vigenereOutput" class="candidate-preview mono">{{ vigenereOutput }}</div></div>
      <div class="terminal-panel"><div class="panel-header"><div><span class="kicker">Repeated sequences</span><h2>Kasiski examination</h2></div></div><div v-if="kasiski.length" class="steps"><article v-for="match in kasiski" :key="match.sequence" class="step"><strong class="mono">{{ match.sequence }}</strong><p>Distances: {{ match.distances.join(', ') }}</p><small>Likely factors: {{ match.likelyFactors.join(', ') || 'none in 2–12' }}</small></article></div><p v-else class="lead">No repeated 3–5 character sequences found. A longer sample may help.</p></div>
    </section>

    <section v-else-if="candidates.length" class="terminal-panel result-section"><div class="panel-header"><div><span class="kicker">Ranked by frequency + common words</span><h2>Candidate comparison</h2></div><span class="badge">{{ candidates.length }} candidates</span></div><div class="candidate-list"><article v-for="candidate in candidates" :key="candidate.label"><div><strong>{{ candidate.label }}</strong><span>{{ candidate.confidence }}% relative score</span></div><p class="mono">{{ candidate.output }}</p><button class="button" type="button" @click="useCandidate(candidate)">Open in workspace</button></article></div></section>
  </PageFrame>
</template>

<style scoped>
.analysis-hero { display: grid; gap: 26px; padding-bottom: 30px; }.analysis-hero h1 { margin: 8px 0 0; }.analysis-controls { display: grid; gap: 10px; }.analysis-controls .button { align-self: end; }.result-section { margin-top: 16px; }.frequency-panel { grid-column: 1 / -1; }.ngram-list { display: flex; flex-wrap: wrap; gap: 8px; }.ngram-list span { padding: 8px; border: 1px solid var(--cg-line); font-family: ui-monospace, monospace; }.candidate-preview { min-height: 100px; padding: 13px; background: var(--cg-dark); color: #fff; white-space: pre-wrap; overflow-wrap: anywhere; }.candidate-list { display: grid; gap: 8px; }.candidate-list article { display: grid; gap: 10px; padding: 13px; border: 1px solid var(--cg-line); }.candidate-list article > div { display: flex; justify-content: space-between; gap: 10px; }.candidate-list span { color: var(--cg-muted); font: .7rem ui-monospace, monospace; }.candidate-list p { margin: 0; overflow-wrap: anywhere; }.candidate-list .button { justify-self: start; }
@media (min-width: 800px) { .analysis-hero { grid-template-columns: .9fr 1.1fr; align-items: end; }.analysis-controls { grid-template-columns: 1fr 180px 190px; }.candidate-list article { grid-template-columns: 180px 1fr auto; align-items: center; }.candidate-list article > div { display: grid; } }
</style>
