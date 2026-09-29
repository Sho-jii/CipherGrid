<script setup lang="ts">
import type { Component } from 'vue';
defineProps<{ icon: Component; label?: string }>();
</script>
<template><component :is="icon" aria-hidden="true" /><span v-if="label">{{ label }}</span></template>
