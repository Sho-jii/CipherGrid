<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { onMounted, ref } from 'vue';
import { useSettingsStore } from '@/stores/settings';

const settings = useSettingsStore();
const booting = ref(true);

onMounted(async () => {
  const startedAt = Date.now();
  await settings.load();
  window.setTimeout(() => { booting.value = false; }, Math.max(0, 950 - (Date.now() - startedAt)));
});
</script>

<template>
  <IonApp :class="`theme-${settings.theme}`">
    <IonRouterOutlet />
    <Transition name="boot-fade">
      <div v-if="booting" class="boot-screen" role="status" aria-live="polite" aria-label="CipherGrid is loading">
        <div class="boot-logo-plaque"><img src="/assets/ciphergrid-logo.png" alt="" /></div>
        <div class="boot-copy"><span>CIPHERGRID</span><small>Preparing local field terminal</small></div>
        <div class="boot-progress" aria-hidden="true"><i /></div>
      </div>
    </Transition>
  </IonApp>
</template>
