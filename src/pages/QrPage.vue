<script setup lang="ts">
import { ref } from 'vue';
import { IonIcon } from '@ionic/vue';
import { qrCodeOutline, scanOutline, warningOutline, arrowForwardOutline } from 'ionicons/icons';
import PageFrame from '@/components/common/PageFrame.vue';
import { createCipherQrPayload, generateQrDataUrl, scanQrImage } from '@/services/qr/qr';
import { useWorkspaceStore } from '@/stores/workspace';
import { useRouter } from 'vue-router';

const algorithm = ref(sessionStorage.getItem('cg-qr-algorithm') ?? 'text'); const text = ref(sessionStorage.getItem('cg-qr-text') ?? ''); const key = ref(''); const includeKey = ref(false); const qrUrl = ref(''); const decoded = ref(''); const error = ref(''); const workspace = useWorkspaceStore(); const router = useRouter();
async function generate() { error.value = ''; try { qrUrl.value = await generateQrDataUrl(createCipherQrPayload(algorithm.value, text.value, includeKey.value ? key.value : undefined)); } catch (cause) { error.value = cause instanceof Error ? cause.message : 'QR generation failed.'; } }
async function scan(event: Event) { const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return; error.value = ''; try { decoded.value = await scanQrImage(file); } catch (cause) { error.value = cause instanceof Error ? cause.message : 'QR scan failed.'; } }
function sendDecoded() {
  try { const payload = JSON.parse(decoded.value) as { ciphertext?: unknown }; workspace.setInput(typeof payload.ciphertext === 'string' ? payload.ciphertext : decoded.value); workspace.mode = 'decrypt'; void router.push('/workspace'); }
  catch { workspace.setInput(decoded.value); void router.push('/workspace'); }
}
</script>

<template>
  <PageFrame title="QR exchange" eyebrow="VERSIONED PORTABLE PAYLOADS" back>
    <section><span class="kicker">CipherGrid QR / v1</span><h1>Move text.<br />Not trust.</h1><p class="lead">Ciphertext and algorithm metadata can travel together. Secret keys remain separate by default.</p></section>
    <section class="grid-2 qr-grid">
      <div class="terminal-panel stack"><div class="panel-header"><div><span class="kicker">Generator</span><h2>Create QR</h2></div><IonIcon :icon="qrCodeOutline" /></div><div class="field"><label for="qr-algorithm">Algorithm identifier</label><input id="qr-algorithm" v-model="algorithm" /></div><div class="field"><label for="qr-text">Ciphertext / data</label><textarea id="qr-text" v-model="text" /></div><label class="key-toggle"><input v-model="includeKey" type="checkbox" /> Include sensitive key material</label><div v-if="includeKey" class="field warning-field"><label for="qr-key"><IonIcon :icon="warningOutline" />Sensitive key</label><input id="qr-key" v-model="key" type="password" /><small>Anyone who scans this QR can read the embedded key. Prefer sharing it through a separate trusted channel.</small></div><button class="button button--primary" type="button" :disabled="!text" @click="generate">Generate versioned QR</button><img v-if="qrUrl" :src="qrUrl" alt="Generated QR code" class="qr-image" /><a v-if="qrUrl" class="button" :href="qrUrl" download="ciphergrid-qr.png">Download PNG</a></div>
      <div class="terminal-panel stack"><div class="panel-header"><div><span class="kicker">Scanner</span><h2>Read compatible QR</h2></div><IonIcon :icon="scanOutline" /></div><label class="file-drop"><input type="file" accept="image/*" @change="scan" /><strong>Choose a QR image</strong><span>Uses the platform BarcodeDetector when available</span></label><div class="field"><label for="decoded">Decoded payload (or paste manually)</label><textarea id="decoded" v-model="decoded" /></div><button class="button button--signal" type="button" :disabled="!decoded" @click="sendDecoded">Send to decrypt workspace <IonIcon :icon="arrowForwardOutline" /></button></div>
    </section>
    <p v-if="error" class="notice error">{{ error }}</p>
  </PageFrame>
</template>

<style scoped>
h1 { margin: 8px 0 18px; }.qr-grid { margin-top: 30px; }.panel-header ion-icon { font-size: 1.7rem; }.key-toggle { display: flex; gap: 9px; align-items: center; min-height: 44px; }.key-toggle input { min-height: auto; }.warning-field { padding: 12px; border: 1px solid var(--cg-signal); }.warning-field small { color: var(--cg-muted); line-height: 1.35; }.qr-image { width: min(100%, 360px); justify-self: center; image-rendering: crisp-edges; border: 1px solid var(--cg-line); }
</style>
