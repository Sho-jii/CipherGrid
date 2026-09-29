<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { moonOutline, sunnyOutline } from 'ionicons/icons';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useSettingsStore } from '@/stores/settings';

const settings = useSettingsStore();
const colorSchemeQuery = typeof window !== 'undefined' && 'matchMedia' in window ? window.matchMedia('(prefers-color-scheme: dark)') : null;
const prefersDark = ref(colorSchemeQuery?.matches ?? false);
const isDark = computed(() => settings.theme === 'dark' || (settings.theme === 'system' && prefersDark.value));

function updateSystemTheme(event: MediaQueryListEvent) {
  prefersDark.value = event.matches;
}

onMounted(() => colorSchemeQuery?.addEventListener('change', updateSystemTheme));
onBeforeUnmount(() => colorSchemeQuery?.removeEventListener('change', updateSystemTheme));

async function toggleTheme() {
  settings.theme = isDark.value ? 'light' : 'dark';
  await settings.save();
}
</script>

<template>
  <button
    class="theme-switch"
    :class="{ 'theme-switch--dark': isDark }"
    type="button"
    role="switch"
    :aria-checked="isDark"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="toggleTheme"
  >
    <span class="theme-switch__track" aria-hidden="true">
      <span class="theme-switch__thumb">
        <IonIcon :icon="isDark ? moonOutline : sunnyOutline" />
      </span>
    </span>
  </button>
</template>

<style scoped>
.theme-switch { display: grid; width: 58px; height: 44px; min-height: 44px; place-items: center; padding: 0; border: 1px solid var(--cg-line); background: var(--cg-surface); color: var(--cg-ink); cursor: pointer; }
.theme-switch__track { position: relative; width: 44px; height: 24px; border: 1px solid var(--cg-line); background: var(--cg-surface-2); overflow: hidden; }
.theme-switch__thumb { position: absolute; top: 2px; left: 2px; display: grid; width: 18px; height: 18px; place-items: center; background: var(--cg-signal); color: #111318; transform: translateX(0) rotate(0); transition: transform .24s ease, background-color .24s ease, color .24s ease; }
.theme-switch__thumb ion-icon { font-size: 12px; }
.theme-switch--dark .theme-switch__track { background: #0d1521; }
.theme-switch--dark .theme-switch__thumb { background: var(--cg-primary); color: #fff; transform: translateX(20px) rotate(180deg); }
@media (prefers-reduced-motion: reduce) { .theme-switch__thumb { transition: none; } }
</style>
