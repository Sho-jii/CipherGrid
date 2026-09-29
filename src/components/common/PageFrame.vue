<script setup lang="ts">
import { IonContent, IonHeader, IonPage, IonIcon, useIonRouter } from '@ionic/vue';
import { RouterLink } from 'vue-router';
import { gridOutline, homeOutline, scanOutline, analyticsOutline, libraryOutline, settingsOutline, informationCircleOutline, arrowBackOutline, compassOutline } from 'ionicons/icons';
import { useRoute } from 'vue-router';
import ThemeToggle from '@/components/common/ThemeToggle.vue';

const props = withDefaults(defineProps<{ title: string; eyebrow?: string; back?: boolean; backTo?: string; backLabel?: string; wide?: boolean }>(), {
  eyebrow: 'CIPHERGRID / FIELD TERMINAL',
  back: false,
  backTo: '/home',
  backLabel: 'Home',
  wide: false,
});
const route = useRoute();
const ionRouter = useIonRouter();
const navigation = [
  { path: '/home', label: 'Home', icon: homeOutline }, { path: '/workspace', label: 'Workspace', icon: gridOutline },
  { path: '/scan', label: 'Scan', icon: scanOutline }, { path: '/analyze', label: 'Analyze', icon: analyticsOutline },
  { path: '/library', label: 'Library', icon: libraryOutline },
];
function goBack() {
  if (ionRouter.canGoBack()) ionRouter.back();
  else ionRouter.navigate(props.backTo, 'back', 'replace');
}
function navigatePrimary(path: string) {
  if (route.path === path) return;
  const currentIndex = navigation.findIndex((item) => item.path === route.path);
  const targetIndex = navigation.findIndex((item) => item.path === path);
  const direction = currentIndex >= 0 && targetIndex < currentIndex ? 'back' : 'forward';
  ionRouter.navigate(path, direction, 'push');
}

</script>

<template>
  <IonPage>
    <IonHeader class="app-shell-header">
      <header class="app-header">
        <div class="brand-lockup">
          <RouterLink :to="route.path === '/home' ? '/onboarding' : '/home'" class="brand-mark-shell" :aria-label="route.path === '/home' ? 'Open introduction' : 'Go to home'">
            <img src="/assets/ciphergrid-logo.png" alt="" class="brand-mark" />
          </RouterLink>
          <div class="header-title"><span class="eyebrow">{{ eyebrow }}</span><strong>{{ title }}</strong></div>
        </div>
        <nav aria-label="Utility navigation">
          <button v-if="back" type="button" class="back-control" :aria-label="`Go to ${backLabel}`" @click="goBack"><IonIcon :icon="arrowBackOutline" /><span>{{ backLabel }}</span></button>
          <RouterLink v-if="route.path === '/home'" to="/onboarding" class="header-action" aria-label="Open onboarding guide"><IonIcon :icon="compassOutline" /><span>Intro</span></RouterLink>
          <ThemeToggle />
          <RouterLink to="/settings" class="square-icon header-settings" aria-label="Settings"><IonIcon :icon="settingsOutline" /></RouterLink>
          <RouterLink to="/about" class="square-icon header-secondary" aria-label="About"><IonIcon :icon="informationCircleOutline" /></RouterLink>
        </nav>
      </header>
    </IonHeader>
    <IonContent>
      <main :class="['page-canvas', { 'page-canvas--wide': wide }]">
        <slot />
      </main>
    </IonContent>
    <nav v-if="!back" class="bottom-nav" aria-label="Primary navigation">
      <a v-for="item in navigation" :key="item.path" :href="item.path" :class="{ active: route.path === item.path }" @click.prevent="navigatePrimary(item.path)">
        <IonIcon :icon="item.icon" /><span>{{ item.label }}</span>
      </a>
    </nav>
  </IonPage>
</template>
