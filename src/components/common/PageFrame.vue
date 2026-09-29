<script setup lang="ts">
import { IonContent, IonHeader, IonPage, IonIcon, useIonRouter } from '@ionic/vue';
import { RouterLink } from 'vue-router';
import { gridOutline, homeOutline, scanOutline, analyticsOutline, libraryOutline, settingsOutline, informationCircleOutline, arrowBackOutline, compassOutline, menuOutline } from 'ionicons/icons';
import { useRoute } from 'vue-router';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
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
const menuOpen = ref(false);
const utilityMenu = ref<HTMLElement | null>(null);
const menuButton = ref<HTMLButtonElement | null>(null);
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
  ionRouter.navigate(path, direction, 'replace');
}
function closeMenu() { menuOpen.value = false; }
function handleOutsidePress(event: PointerEvent) {
  if (menuOpen.value && !utilityMenu.value?.contains(event.target as Node)) closeMenu();
}
function handleEscape(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !menuOpen.value) return;
  closeMenu();
  menuButton.value?.focus();
}
onMounted(() => {
  document.addEventListener('pointerdown', handleOutsidePress);
  document.addEventListener('keydown', handleEscape);
});
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleOutsidePress);
  document.removeEventListener('keydown', handleEscape);
});
watch(() => route.fullPath, closeMenu);

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
          <div ref="utilityMenu" class="utility-menu">
            <button ref="menuButton" type="button" class="square-icon utility-menu__trigger" aria-controls="utility-menu-panel" :aria-expanded="menuOpen" aria-label="Open system menu" @click="menuOpen = !menuOpen"><IonIcon :icon="menuOutline" /></button>
            <div v-if="menuOpen" id="utility-menu-panel" class="utility-menu__panel" role="menu">
              <div class="utility-menu__heading"><span>CG / SYSTEM MENU</span><b>03</b></div>
              <div class="utility-menu__theme"><div><span class="utility-menu__index">00</span><strong>Display mode</strong><small>Light / dark interface</small></div><ThemeToggle /></div>
              <RouterLink to="/onboarding" role="menuitem" @click="closeMenu"><span class="utility-menu__index">01</span><IonIcon :icon="compassOutline" /><span><strong>Introduction</strong><small>Review the field guide</small></span></RouterLink>
              <RouterLink to="/settings" role="menuitem" @click="closeMenu"><span class="utility-menu__index">02</span><IonIcon :icon="settingsOutline" /><span><strong>Settings</strong><small>Theme, history, privacy</small></span></RouterLink>
              <RouterLink to="/about" role="menuitem" @click="closeMenu"><span class="utility-menu__index">03</span><IonIcon :icon="informationCircleOutline" /><span><strong>About CipherGrid</strong><small>Purpose and platform notes</small></span></RouterLink>
            </div>
          </div>
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
