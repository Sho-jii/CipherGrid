<script setup lang="ts">
import { ref } from 'vue';
import { IonIcon } from '@ionic/vue';
import { lockClosedOutline, copyOutline, shareOutline, downloadOutline } from 'ionicons/icons';
import { Clipboard } from '@capacitor/clipboard';
import { Share } from '@capacitor/share';
import PageFrame from '@/components/common/PageFrame.vue';
import { decryptAesGcm, encryptAesGcm } from '@/services/secure/crypto';
import { exportTextFile } from '@/services/files/export';

const mode = ref<'encrypt' | 'decrypt'>('encrypt'); const input = ref(''); const passphrase = ref(''); const output = ref(''); const error = ref(''); const busy = ref(false); const notice = ref('');
async function process() {
  busy.value = true; error.value = ''; output.value = ''; notice.value = '';
  try { output.value = mode.value === 'encrypt' ? await encryptAesGcm(input.value, passphrase.value) : await decryptAesGcm(input.value, passphrase.value); }
  catch (cause) { error.value = cause instanceof Error ? cause.message : 'Secure operation failed.'; }
  finally { passphrase.value = ''; busy.value = false; }
}
async function copy() { await Clipboard.write({ string: output.value }); notice.value = 'Output copied.'; }
async function share() { await Share.share({ title: 'CipherGrid secure payload', text: output.value }); }
function download() { void exportTextFile(output.value, mode.value === 'encrypt' ? 'ciphergrid-secure-payload.json' : 'ciphergrid-decrypted.txt', mode.value === 'encrypt' ? 'application/json' : 'text/plain'); }
</script>

<template>
  <PageFrame title="Secure Lab" eyebrow="MODERN CRYPTOGRAPHY / AES" back>
    <section class="secure-hero terminal-panel--dark"><IonIcon :icon="lockClosedOutline" /><span class="kicker">Authenticated encryption</span><h1>AES-256<br />GCM.</h1><p>Fresh 128-bit salt + 96-bit IV on every encryption. PBKDF2-HMAC-SHA-256 with 310,000 iterations. The passphrase is never stored.</p></section>
    <p class="notice secure-note">Secure Lab is technically and visually separate from classical ciphers. Confidentiality depends on a strong, unique passphrase and a trusted device.</p>
    <section class="terminal-panel stack">
      <div class="segmented"><button type="button" :class="{ active: mode === 'encrypt' }" @click="mode = 'encrypt'; output = ''; error = ''">Encrypt</button><button type="button" :class="{ active: mode === 'decrypt' }" @click="mode = 'decrypt'; output = ''; error = ''">Decrypt</button></div>
      <div class="field"><label for="secure-input">{{ mode === 'encrypt' ? 'Plaintext' : 'Versioned CipherGrid JSON payload' }}</label><textarea id="secure-input" v-model="input" :placeholder="mode === 'encrypt' ? 'Enter confidential text…' : '{&quot;v&quot;:1,&quot;alg&quot;:&quot;AES-256-GCM&quot;,…}'" spellcheck="false" /></div>
      <div class="field"><label for="passphrase">Passphrase (cleared after processing)</label><input id="passphrase" v-model="passphrase" type="password" autocomplete="new-password" /></div>
      <button class="button button--signal" type="button" :disabled="busy || !input || !passphrase" @click="process">{{ busy ? 'Deriving key…' : `${mode === 'encrypt' ? 'Encrypt' : 'Authenticate + decrypt'}` }}</button>
      <p v-if="error" class="notice error" role="alert">{{ error }}</p>
    </section>
    <section v-if="output" class="terminal-panel output-panel"><div class="panel-header"><div><span class="kicker">{{ mode === 'encrypt' ? 'Portable authenticated payload' : 'Authenticated plaintext' }}</span><h2>Output</h2></div></div><pre>{{ output }}</pre><div class="grid-3"><button class="button" type="button" @click="copy"><IonIcon :icon="copyOutline" />Copy</button><button class="button" type="button" @click="share"><IonIcon :icon="shareOutline" />Share</button><button class="button" type="button" @click="download"><IonIcon :icon="downloadOutline" />Download</button></div><p v-if="notice" class="notice">{{ notice }}</p></section>
  </PageFrame>
</template>

<style scoped>
.secure-hero { position: relative; min-height: 350px; padding: 28px; overflow: hidden; }.secure-hero > ion-icon { position: absolute; right: -30px; bottom: -40px; font-size: 17rem; color: #1e2834; }.secure-hero .kicker { color: #ff6c32; }.secure-hero h1 { position: relative; margin: 12px 0 20px; }.secure-hero p { position: relative; max-width: 48ch; color: #b9c3ce; line-height: 1.5; }.secure-note { margin: 12px 0; }.output-panel { margin-top: 12px; }.output-panel pre { max-height: 300px; padding: 14px; overflow: auto; white-space: pre-wrap; overflow-wrap: anywhere; background: var(--cg-dark); color: #fff; font: .78rem/1.5 ui-monospace, monospace; }
</style>
