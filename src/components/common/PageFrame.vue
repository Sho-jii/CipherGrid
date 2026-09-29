<script setup lang="ts">
import { IonContent, IonHeader, IonPage, IonIcon } from '@ionic/vue';
import { RouterLink } from 'vue-router';
import { gridOutline, homeOutline, scanOutline, analyticsOutline, libraryOutline, settingsOutline, informationCircleOutline, arrowBackOutline, compassOutline } from 'ionicons/icons';
import { useRoute } from 'vue-router';
import ThemeToggle from '@/components/common/ThemeToggle.vue';

withDefaults(defineProps<{ title: string; eyebrow?: string; back?: boolean; backTo?: string; backLabel?: string; wide?: boolean }>(), {
  eyebrow: 'CIPHERGRID / FIELD TERMINAL',
  back: false,
  backTo: '/home',
  backLabel: 'Home',
  wide: false,
});
const route = useRoute();
const navigation = [
  { path: '/home', label: 'Home', icon: homeOutline }, { path: '/workspace', label: 'Workspace', icon: gridOutline },
  { path: '/scan', label: 'Scan', icon: scanOutline }, { path: '/analyze', label: 'Analyze', icon: analyticsOutline },
  { path: '/library', label: 'Library', icon: libraryOutline },
];

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
          <RouterLink v-if="back" :to="backTo" class="back-control" :aria-label="`Go to ${backLabel}`"><IonIcon :icon="arrowBackOutline" /><span>{{ backLabel }}</span></RouterLink>
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
      <RouterLink v-for="item in navigation" :key="item.path" :to="item.path" :class="{ active: route.path === item.path }">
        <IonIcon :icon="item.icon" /><span>{{ item.label }}</span>
      </RouterLink>
    </nav>
  </IonPage>
</template>
