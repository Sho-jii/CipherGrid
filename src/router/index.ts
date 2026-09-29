import { createRouter, createWebHistory } from '@ionic/vue-router';
import type { RouteRecordRaw } from 'vue-router';
import type { RouteLocationNormalized } from 'vue-router';

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/home' },
  { path: '/onboarding', component: () => import('@/pages/OnboardingPage.vue') },
  { path: '/home', component: () => import('@/pages/HomePage.vue') },
  { path: '/workspace', component: () => import('@/pages/WorkspacePage.vue') },
  { path: '/scan', component: () => import('@/pages/ScanPage.vue') },
  { path: '/analyze', component: () => import('@/pages/AnalyzePage.vue') },
  { path: '/library', component: () => import('@/pages/LibraryPage.vue') },
  { path: '/secure', component: () => import('@/pages/SecureLabPage.vue') },
  { path: '/utilities', component: () => import('@/pages/UtilitiesPage.vue') },
  { path: '/batch', component: () => import('@/pages/BatchPage.vue') },
  { path: '/recipes', component: () => import('@/pages/RecipesPage.vue') },
  { path: '/qr', component: () => import('@/pages/QrPage.vue') },
  { path: '/learn', component: () => import('@/pages/LearningPage.vue') },
  { path: '/settings', component: () => import('@/pages/SettingsPage.vue') },
  { path: '/about', component: () => import('@/pages/AboutPage.vue') },
];

const router = createRouter({ history: createWebHistory(import.meta.env.BASE_URL), routes });
router.beforeEach(async (to: RouteLocationNormalized) => {
  if (to.path === '/onboarding') return true;
  const seen = localStorage.getItem('cg-onboarding') === '1';
  return seen ? true : '/onboarding';
});
export default router;
