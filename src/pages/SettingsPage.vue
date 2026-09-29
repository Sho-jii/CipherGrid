<script setup lang="ts">
import { ref } from 'vue';
import { IonIcon } from '@ionic/vue';
import { trashOutline, shieldCheckmarkOutline } from 'ionicons/icons';
import PageFrame from '@/components/common/PageFrame.vue';
import { useSettingsStore } from '@/stores/settings';
import { clearStore } from '@/services/storage/database';
const settings = useSettingsStore(); const notice = ref('');
async function save() { await settings.save(); notice.value = 'Preferences saved on this device.'; }
async function clearHistory() { if (!window.confirm('Delete all local history?')) return; await clearStore('history'); notice.value = 'Local history cleared.'; }
async function clearAll() { if (!window.confirm('Delete local history, recipes, and batch summaries? Settings will remain.')) return; await Promise.all([clearStore('history'), clearStore('recipes'), clearStore('batchJobs')]); notice.value = 'Structured local records cleared.'; }
</script>

<template>
  <PageFrame title="Settings + privacy" eyebrow="LOCAL CONTROL" back>
    <section><span class="kicker">Your device / your records</span><h1>Control the<br />footprint.</h1><p class="lead">CipherGrid works without an account or backend. Preferences are small device settings; structured records live in the local browser database.</p></section>
    <section class="settings-grid">
      <div class="terminal-panel stack"><div class="panel-header"><div><span class="kicker">Display</span><h2>Interface</h2></div></div><div class="field"><label for="theme">Color theme</label><select id="theme" v-model="settings.theme"><option value="system">Follow system</option><option value="light">Light</option><option value="dark">Dark</option></select></div></div>
      <div class="terminal-panel stack"><div class="panel-header"><div><span class="kicker">History / opt-in</span><h2>Retention</h2></div></div><label class="check-row"><input v-model="settings.historyEnabled" type="checkbox" />Allow explicit “Save” actions to write local history</label><div class="field"><label for="retention">Automatic retention</label><select id="retention" v-model.number="settings.retentionDays"><option :value="7">7 days</option><option :value="30">30 days</option><option :value="90">90 days</option><option :value="0">Keep until deleted</option></select></div><small>Expired records are removed when the Library opens; records can always be removed individually or cleared below.</small></div>
      <button class="button button--primary save-settings" type="button" @click="save">Save preferences</button><p v-if="notice" class="notice" role="status">{{ notice }}</p>
    </section>
    <section class="privacy-section"><div><IonIcon :icon="shieldCheckmarkOutline" /><span class="kicker">Privacy behavior</span><h2>Nothing is uploaded by the standard workflow.</h2></div><ul><li>Native OCR uses bundled ML Kit on Android or Apple Vision on iOS.</li><li>Browser OCR runs Tesseract locally with a bundled English recognition model.</li><li>AES passphrases are used in memory, cleared from the interface after processing, and never saved.</li><li>Imported text is treated as plain text and is never rendered as HTML.</li><li>Camera, gallery, clipboard, file, and sharing access happen only after an explicit action.</li></ul></section>
    <section class="terminal-panel danger-zone"><div><span class="kicker">Destructive local actions</span><h2>Data controls</h2></div><div class="grid-2"><button class="button button--danger" type="button" @click="clearHistory"><IonIcon :icon="trashOutline" />Clear history</button><button class="button button--danger" type="button" @click="clearAll"><IonIcon :icon="trashOutline" />Clear all structured records</button></div></section>
  </PageFrame>
</template>

<style scoped>
h1 { margin: 8px 0 18px; }.settings-grid { display: grid; gap: 12px; margin-top: 30px; }.check-row { display: flex; gap: 10px; align-items: center; line-height: 1.4; }.check-row input { min-height: auto; }.settings-grid small { color: var(--cg-muted); line-height: 1.4; }.privacy-section { display: grid; gap: 20px; margin: 44px 0; padding: 22px; background: var(--cg-dark); color: #fff; }.privacy-section ion-icon { font-size: 2rem; color: #ff6c32; }.privacy-section .kicker { color: #9faaba; margin: 10px 0; }.privacy-section li { margin-bottom: 10px; color: #c4ccd5; line-height: 1.45; }.danger-zone { border-color: var(--cg-danger); }.danger-zone h2 { margin: 7px 0 18px; }
@media (min-width: 760px) { .settings-grid { grid-template-columns: repeat(2, 1fr); }.save-settings, .settings-grid > .notice { grid-column: 1 / -1; }.privacy-section { grid-template-columns: 1fr 1.4fr; } }
</style>
