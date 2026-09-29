<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { IonIcon } from '@ionic/vue';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { cameraOutline, imageOutline, refreshOutline, scanOutline, arrowForwardOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import PageFrame from '@/components/common/PageFrame.vue';
import { createOcrService, type OcrRegion } from '@/services/ocr';
import { useWorkspaceStore } from '@/stores/workspace';

const router = useRouter(); const workspace = useWorkspaceStore();
const imageUrl = ref(''); const nativePath = ref(''); const sourceFile = ref<File | null>(null); const text = ref(''); const regions = ref<OcrRegion[]>([]);
const selected = ref(new Set<string>()); const progress = ref(0); const status = ref(''); const error = ref(''); const rotation = ref(0); const processing = ref(false);
const selectedText = computed(() => regions.value.length && selected.value.size ? regions.value.filter((region) => selected.value.has(region.id)).map((region) => region.text).join('\n') : text.value);

async function acquire(source: CameraSource) {
  error.value = ''; rotation.value = 0;
  try {
    const photo = await Camera.getPhoto({ source, resultType: CameraResultType.Uri, quality: 92, correctOrientation: true, allowEditing: true });
    imageUrl.value = photo.webPath ?? photo.path ?? ''; nativePath.value = photo.path ?? photo.webPath ?? ''; sourceFile.value = null;
  } catch (cause) { error.value = cause instanceof Error ? cause.message : 'Image access was cancelled or denied.'; }
}
function chooseFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return;
  if (imageUrl.value.startsWith('blob:')) URL.revokeObjectURL(imageUrl.value);
  sourceFile.value = file; nativePath.value = ''; imageUrl.value = URL.createObjectURL(file); error.value = ''; rotation.value = 0;
}
async function recognize() {
  const source = Capacitor.isNativePlatform() ? nativePath.value : sourceFile.value ?? imageUrl.value;
  if (!source) { error.value = 'Choose or capture an image first.'; return; }
  processing.value = true; progress.value = 0; status.value = 'Preparing offline OCR'; error.value = '';
  try {
    const result = await createOcrService().process(source, (value, label) => { progress.value = value; status.value = label; });
    text.value = result.text; regions.value = result.regions; selected.value = new Set(result.regions.map((region) => region.id)); status.value = `${result.engine} · ${result.regions.length} region(s)`;
    if (result.warnings.length) error.value = result.warnings.join(' ');
  } catch (cause) { error.value = cause instanceof Error ? cause.message : 'Text recognition failed.'; }
  finally { processing.value = false; }
}
function toggle(id: string) { const next = new Set(selected.value); if (next.has(id)) next.delete(id); else next.add(id); selected.value = next; }
function send(destination: 'workspace' | 'analyze', mode?: 'encrypt' | 'decrypt') {
  if (destination === 'workspace') { workspace.setInput(selectedText.value); if (mode) workspace.mode = mode; void router.push('/workspace'); }
  else { sessionStorage.setItem('cg-analyze-text', selectedText.value); void router.push('/analyze'); }
}
onBeforeUnmount(() => { if (imageUrl.value.startsWith('blob:')) URL.revokeObjectURL(imageUrl.value); });
</script>

<template>
  <PageFrame title="Scan / OCR" wide>
    <section class="scan-intro"><div><span class="kicker">On-device text capture</span><h1>Image in.<br />Text out.</h1></div><p class="lead">ML Kit on Android, Apple Vision on iOS, and lazy-loaded Tesseract in the browser. No cloud OCR or account required.</p></section>
    <section v-if="!imageUrl" class="scan-actions">
      <button class="scan-action scan-action--primary" type="button" @click="acquire(CameraSource.Camera)"><IonIcon :icon="cameraOutline" /><strong>Capture image</strong><span>Open the device camera</span></button>
      <label class="scan-action"><input type="file" accept="image/*" @change="chooseFile" /><IonIcon :icon="imageOutline" /><strong>Choose from gallery</strong><span>JPG, PNG, HEIC when supported</span></label>
    </section>
    <section v-else class="scan-workbench">
      <div class="terminal-panel stack">
        <div class="panel-header"><div><span class="kicker">Source frame</span><h2>Image preview</h2></div><button class="square-icon" type="button" aria-label="Rotate preview 90 degrees" @click="rotation = (rotation + 90) % 360"><IonIcon :icon="refreshOutline" /></button></div>
        <div class="image-stage"><img :src="imageUrl" alt="Selected source for text recognition" :style="{ transform: `rotate(${rotation}deg)` }" /></div>
        <div class="grid-2"><button class="button" type="button" @click="imageUrl = ''; text = ''; regions = []"><IonIcon :icon="imageOutline" />Change image</button><button class="button button--primary" type="button" :disabled="processing" @click="recognize"><IonIcon :icon="scanOutline" />{{ processing ? status : 'Extract text offline' }}</button></div>
        <div v-if="processing" class="progress-track" role="progressbar" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100"><span :style="{ width: `${progress}%` }" /></div>
      </div>
      <div class="terminal-panel stack">
        <div class="panel-header"><div><span class="kicker">Review / correct</span><h2>Recognized text</h2></div><span v-if="status" class="badge">{{ status }}</span></div>
        <p v-if="error" class="notice" role="alert">{{ error }}</p>
        <div class="field"><label for="recognized">Editable OCR result</label><textarea id="recognized" v-model="text" placeholder="Recognized text appears here. You can also type or paste corrections." /></div>
        <fieldset v-if="regions.length" class="region-list"><legend>Select recognized blocks</legend><label v-for="region in regions" :key="region.id"><input type="checkbox" :checked="selected.has(region.id)" @change="toggle(region.id)" /><span>{{ region.text }}</span><small v-if="region.confidence != null">{{ Math.round(region.confidence) }}%</small></label></fieldset>
        <div class="send-grid"><button class="button" type="button" :disabled="!selectedText" @click="send('workspace', 'encrypt')">Encrypt <IonIcon :icon="arrowForwardOutline" /></button><button class="button" type="button" :disabled="!selectedText" @click="send('workspace', 'decrypt')">Decrypt <IonIcon :icon="arrowForwardOutline" /></button><button class="button button--signal" type="button" :disabled="!selectedText" @click="send('analyze')">Analyze <IonIcon :icon="arrowForwardOutline" /></button></div>
      </div>
    </section>
    <p class="notice privacy-note">Images and recognized plaintext remain on this device unless you explicitly export or share them.</p>
  </PageFrame>
</template>

<style scoped>
.scan-intro { display: grid; gap: 18px; padding-bottom: 34px; }.scan-intro h1 { margin: 8px 0 0; }.scan-intro .lead { align-self: end; }
.scan-actions { display: grid; gap: 12px; }.scan-action { position: relative; display: grid; place-items: start; align-content: end; gap: 8px; min-height: 220px; padding: 20px; border: 1px solid var(--cg-line); background: var(--cg-surface); color: var(--cg-ink); text-align: left; cursor: pointer; }.scan-action--primary { background: var(--cg-primary); color: #fff; border-color: var(--cg-primary); }.scan-action ion-icon { font-size: 2.2rem; align-self: start; }.scan-action strong { font-size: 1.45rem; }.scan-action span { opacity: .75; }.scan-action input { position: absolute; opacity: 0; width: 1px; height: 1px; }
.scan-workbench { display: grid; gap: 12px; }.image-stage { display: grid; place-items: center; min-height: 280px; overflow: hidden; background: #0b0f14; }.image-stage img { max-width: 100%; max-height: 480px; transition: transform .2s ease; }.region-list { display: grid; gap: 0; padding: 0; border: 1px solid var(--cg-line); }.region-list legend { margin-left: 8px; padding: 0 5px; color: var(--cg-muted); font: 700 .68rem ui-monospace, monospace; text-transform: uppercase; }.region-list label { display: grid; grid-template-columns: 24px 1fr auto; gap: 8px; align-items: center; min-height: 48px; padding: 8px; border-bottom: 1px solid var(--cg-line); }.region-list label:last-child { border: 0; }.region-list input { min-height: auto; }.region-list small { color: var(--cg-muted); }.send-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }.privacy-note { margin-top: 14px; }
@media (min-width: 800px) { .scan-intro { grid-template-columns: 1fr 1fr; }.scan-actions { grid-template-columns: 1.2fr .8fr; }.scan-workbench { grid-template-columns: 1fr 1fr; align-items: start; } }
</style>
