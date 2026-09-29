<script setup lang="ts">
import PageFrame from '@/components/common/PageFrame.vue';
import { IonIcon } from '@ionic/vue';
import { RouterLink } from 'vue-router';
import { arrowForwardOutline, cameraOutline, flaskOutline, lockClosedOutline, documentTextOutline } from 'ionicons/icons';
import { cipherRegistry } from '@/services/ciphers/registry';
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { useWorkspaceStore } from '@/stores/workspace';
const router = useRouter(); const workspace = useWorkspaceStore();
const batchStatus = ref<{ filename: string; progress: number; total: number } | null>(null);
try { batchStatus.value = JSON.parse(sessionStorage.getItem('cg-batch-active') ?? 'null') as typeof batchStatus.value; } catch { batchStatus.value = null; }
function choose(id: typeof cipherRegistry[number]['id']) { workspace.select(id); void router.push('/workspace'); }
</script>

<template>
  <PageFrame title="Home terminal">
    <section class="home-hero">
      <div class="hero-copy"><span class="hero-status"><i /> Local engines ready</span><span class="kicker">Offline / private / explainable</span><h1>Decode the<br /><em>pattern.</em></h1><p class="lead">A vivid mobile cipher laboratory built for learning the mechanics—not hiding the method.</p><div class="hero-cta"><RouterLink to="/workspace" class="button button--signal">Start transforming <IonIcon :icon="arrowForwardOutline" /></RouterLink><RouterLink to="/learn" class="button hero-learn">Explore lessons</RouterLink></div></div>
      <figure class="hero-visual"><img src="/assets/ciphergrid-hero-v2.jpg" alt="Abstract cipher laboratory with alphabet grids, code wheels, and blue and orange illuminated blocks" /><figcaption><span>CG / VISUAL INDEX 01</span><strong>Classical systems, made tangible.</strong></figcaption><div class="hero-coordinate" aria-hidden="true">26 × 26<br />MOD / FIELD</div></figure>
    </section>

    <section class="action-grid home-actions" aria-label="Quick actions">
      <RouterLink to="/scan" class="link-panel action-blue"><IonIcon :icon="cameraOutline" /><strong>Scan text</strong><span>Camera or gallery → offline OCR</span></RouterLink>
      <RouterLink to="/workspace" class="link-panel action-violet"><IonIcon :icon="flaskOutline" /><strong>Open workspace</strong><span>Encrypt, decrypt, and inspect steps</span></RouterLink>
      <RouterLink to="/secure" class="link-panel action-dark"><IonIcon :icon="lockClosedOutline" /><strong>Secure Lab</strong><span>AES-256-GCM · modern confidentiality</span></RouterLink>
      <RouterLink to="/batch" class="link-panel action-signal"><IonIcon :icon="documentTextOutline" /><strong>Batch jobs</strong><span>Import TXT/CSV and export results</span></RouterLink>
    </section>
    <section v-if="batchStatus" class="terminal-panel active-job"><div><span class="kicker">Active batch / {{ batchStatus.total }} rows</span><strong>{{ batchStatus.filename }}</strong></div><div class="progress-track"><span :style="{ width: `${batchStatus.progress}%` }" /></div><span class="mono">{{ batchStatus.progress }}%</span></section>

    <section class="stack home-section">
      <div class="panel-header"><div><span class="kicker">Algorithm registry / 09</span><h2>Choose a method</h2></div><IonIcon :icon="arrowForwardOutline" /></div>
      <div class="algorithm-grid">
        <button v-for="(cipher, index) in cipherRegistry" :key="cipher.id" type="button" @click="choose(cipher.id)">
          <span class="algorithm-index">{{ String(index + 1).padStart(2, '0') }}</span><strong>{{ cipher.name }}</strong><small>{{ cipher.family }}</small><span>{{ cipher.description }}</span>
        </button>
      </div>
    </section>

    <section class="grid-3 home-section">
      <RouterLink to="/analyze" class="link-panel"><span class="kicker">Cryptanalysis</span><strong>Rank candidates</strong><span>Frequency, IC, Kasiski, n-grams</span></RouterLink>
      <RouterLink to="/utilities" class="link-panel"><span class="kicker">Not encryption</span><strong>Encoding + hashing</strong><span>Base64, UTF-8, hex, binary, SHA-256</span></RouterLink>
      <RouterLink to="/learn" class="link-panel"><span class="kicker">Interactive</span><strong>Learning mode</strong><span>Simple explanations and technical steps</span></RouterLink>
    </section>
  </PageFrame>
</template>

<style scoped>
.home-hero { display: grid; gap: 0; border: 1px solid var(--cg-line); background-color: #111925; background-image: linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px), linear-gradient(180deg, #17233a, #0b111b); background-size: 36px 36px, 36px 36px, 100% 100%; color: #fff; box-shadow: 9px 9px 0 var(--cg-line); overflow: hidden; }
.hero-copy { position: relative; z-index: 2; display: grid; align-content: center; padding: 28px 22px 34px; }
.home-hero .kicker { color: #aeb8cc; }.home-hero .lead { color: #cbd3df; }.home-hero h1 { margin: 12px 0 20px; }
.home-hero em { color: #ff7442; font-style: normal; text-shadow: 3px 3px 0 rgba(35, 71, 255, .7); }
.hero-status { justify-self: start; display: inline-flex; align-items: center; gap: 7px; margin-bottom: 30px; padding: 7px 9px; border: 1px solid #42506a; color: #d8dfeb; font: 700 .66rem ui-monospace, monospace; text-transform: uppercase; letter-spacing: .06em; }.hero-status i { width: 8px; height: 8px; background: #43e394; box-shadow: 0 0 12px #43e394; }
.hero-cta { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 12px; }.hero-learn { color: #fff; background: rgba(255,255,255,.06); border-color: #647087; }
.hero-visual { position: relative; min-height: 420px; margin: 0; overflow: hidden; background: #080c12; }.hero-visual::after { content: ''; position: absolute; inset: 0; background: linear-gradient(0deg, rgba(8,12,18,.9), transparent 48%), linear-gradient(90deg, rgba(13,20,31,.25), transparent 40%); }
.hero-visual img { width: 100%; height: 100%; object-fit: cover; object-position: 58% 58%; filter: saturate(1.06) contrast(1.03); }
.hero-visual figcaption { position: absolute; z-index: 2; right: 18px; bottom: 18px; left: 18px; display: grid; gap: 5px; color: #fff; }.hero-visual figcaption span { color: #ffb091; font: 700 .64rem ui-monospace, monospace; letter-spacing: .1em; }.hero-visual figcaption strong { font-size: 1.08rem; }
.hero-coordinate { position: absolute; z-index: 2; top: 16px; right: 16px; padding: 8px; border: 1px solid rgba(255,255,255,.5); color: #fff; text-align: right; font: .62rem/1.4 ui-monospace, monospace; }
.home-actions { margin-top: 18px; }
.active-job { display: grid; grid-template-columns: 1fr 2fr auto; gap: 12px; align-items: center; margin-top: 12px; }.active-job strong { display: block; margin-top: 4px; }
.home-actions ion-icon { font-size: 1.5rem; }
.action-blue { background: #3157f4; color: #fff; border-color: var(--cg-line); }.action-blue span { color: #dfe4ff; }
.action-violet { background: #f3f0ff; color: #111318; border-color: var(--cg-line); }.action-violet span { color: #555964; }.action-violet ion-icon { color: #7547ff; }
.action-dark { background: #111925; color: #fff; border-color: var(--cg-line); }.action-dark span { color: #b9c1cc; }
.action-signal { background: #ff7a36; color: #17130f; border-color: var(--cg-line); }.action-signal span { color: #512812; }
.home-section { margin-top: 48px; }
.algorithm-grid { display: grid; grid-template-columns: repeat(2, 1fr); border-top: 1px solid var(--cg-line); border-left: 1px solid var(--cg-line); }
.algorithm-grid button { position: relative; display: grid; gap: 7px; min-height: 172px; padding: 18px 13px 13px; overflow: hidden; text-align: left; border: 0; border-right: 1px solid var(--cg-line); border-bottom: 1px solid var(--cg-line); background: var(--cg-surface); color: var(--cg-ink); cursor: pointer; }
.algorithm-grid button:hover { background: var(--cg-surface-2); transform: translateY(-3px); box-shadow: 0 4px 0 var(--cg-line); }
.algorithm-grid strong { font-size: 1rem; align-self: end; }.algorithm-grid small { color: var(--cg-primary); font: 700 .65rem ui-monospace, monospace; text-transform: uppercase; }.algorithm-grid button > span:last-child { color: var(--cg-muted); font-size: .72rem; line-height: 1.35; }
.algorithm-index { color: var(--cg-muted); font: 700 .7rem ui-monospace, monospace; }
@media (min-width: 760px) { .home-hero { grid-template-columns: minmax(0, 1fr) minmax(360px, .86fr); min-height: 600px; } .hero-copy { padding: 54px 44px; }.hero-visual { min-height: 600px; } .algorithm-grid { grid-template-columns: repeat(3, 1fr); } }
</style>
