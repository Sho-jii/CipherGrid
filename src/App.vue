<script setup lang="ts">
import { IonApp, IonRouterOutlet, useBackButton, useIonRouter } from '@ionic/vue';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useSettingsStore } from '@/stores/settings';

const settings = useSettingsStore();
const booting = ref(true);
const route = useRoute();
const ionRouter = useIonRouter();

useBackButton(10, (processNextHandler) => {
  if (!Capacitor.isNativePlatform()) { processNextHandler(); return; }
  const atAppRoot = route.path === '/home' || (route.path === '/onboarding' && localStorage.getItem('cg-onboarding') !== '1');
  if (atAppRoot) { void CapacitorApp.exitApp(); return; }
  if (ionRouter.canGoBack()) ionRouter.back();
  else ionRouter.navigate('/home', 'back', 'replace');
});

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
