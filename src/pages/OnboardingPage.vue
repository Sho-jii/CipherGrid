<script setup lang="ts">
import { IonContent, IonPage, IonIcon } from '@ionic/vue';
import { shieldCheckmarkOutline, flaskOutline, cloudOfflineOutline, arrowForwardOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
const router = useRouter();
function complete() { localStorage.setItem('cg-onboarding', '1'); void router.replace('/home'); }
</script>

<template>
  <IonPage>
    <IonContent :fullscreen="true">
      <main class="onboarding">
        <section class="onboarding-visual">
          <img class="onboarding-art" src="/assets/ciphergrid-hero-v2.jpg" alt="Abstract cryptography laboratory with code wheels, grid panels, and illuminated blocks" />
          <div class="onboarding-logo-plaque"><img src="/assets/ciphergrid-logo.png" alt="CipherGrid grid mark" /></div>
          <span class="visual-index">CG / SYSTEM 01<br />LOCAL FIRST</span>
          <div class="visual-caption"><strong>Patterns become visible.</strong><span>Classical systems · modern workspace</span></div>
        </section>
        <section class="onboarding-copy">
          <span class="kicker">Mobile cryptography field terminal</span>
          <h1>See every<br />move.</h1>
          <p>Encrypt, inspect, scan, and analyze classical ciphers in one offline-first learning workspace.</p>
          <div class="onboarding-sequence" aria-label="CipherGrid workflow">
            <span><b>01</b> Capture</span><span><b>02</b> Transform</span><span><b>03</b> Explain</span>
          </div>
          <section class="onboarding-facts" aria-label="Important product facts">
            <article><IonIcon :icon="cloudOfflineOutline" /><strong>Local by default</strong><span>Text and images stay on this device unless you explicitly share them.</span></article>
            <article><IonIcon :icon="flaskOutline" /><strong>Built to teach</strong><span>Classical ciphers are educational—not suitable for protecting real secrets.</span></article>
            <article><IonIcon :icon="shieldCheckmarkOutline" /><strong>Secure Lab is separate</strong><span>AES-256-GCM is clearly isolated from encoding, hashing, and classical methods.</span></article>
          </section>
          <button class="button button--signal onboarding-action" type="button" @click="complete">Enter CipherGrid <IonIcon :icon="arrowForwardOutline" /></button>
        </section>
      </main>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.onboarding { min-height: 100%; display: grid; background: var(--cg-canvas); color: var(--cg-ink); }
.onboarding-visual { position: relative; height: clamp(360px, 48vh, 470px); min-height: 0; overflow: hidden; background: #080c12; }
.onboarding-visual::after { content: ''; position: absolute; inset: 0; background: linear-gradient(0deg, #0b1017 0, transparent 48%), linear-gradient(90deg, rgba(5,8,12,.18), transparent 62%); }
.onboarding-art { display: block; width: 100%; height: 100%; object-fit: cover; object-position: 58% 58%; }
.onboarding-logo-plaque { position: absolute; z-index: 2; top: max(22px, env(safe-area-inset-top)); left: 20px; display: grid; place-items: center; width: 94px; height: 94px; padding: 8px; background: #f4efe4; border: 1px solid #fff; box-shadow: 7px 7px 0 #2347ff, -5px -5px 0 #ff5a1f; }
.onboarding-logo-plaque img { width: 76px; height: 76px; object-fit: cover; }
.visual-index { position: absolute; z-index: 2; top: max(26px, env(safe-area-inset-top)); right: 20px; padding: 8px; color: #fff; border: 1px solid rgba(255,255,255,.48); text-align: right; font: .62rem/1.45 ui-monospace, monospace; }
.visual-caption { position: absolute; z-index: 2; right: 20px; bottom: 26px; left: 20px; display: grid; gap: 5px; }.visual-caption strong { font-size: 1.25rem; }.visual-caption span { color: #ffc2ab; font: .68rem ui-monospace, monospace; text-transform: uppercase; letter-spacing: .07em; }
.onboarding-copy { position: relative; z-index: 3; display: grid; align-content: center; padding: 18px 20px max(24px, env(safe-area-inset-bottom)); background-color: var(--cg-canvas); background-image: linear-gradient(var(--cg-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--cg-grid-line) 1px, transparent 1px), linear-gradient(180deg, var(--cg-page-start), var(--cg-page-end)); background-size: 36px 36px, 36px 36px, 100% 100%; }
.onboarding-copy > * { position: relative; }
.onboarding-copy h1 { margin: 18px 0; font-size: clamp(3.8rem, 17vw, 7rem); }
.onboarding-copy > p { color: var(--cg-muted); max-width: 48ch; line-height: 1.5; }
.onboarding-sequence { display: grid; grid-template-columns: repeat(3, 1fr); margin-top: 18px; border-top: 1px solid var(--cg-line); border-left: 1px solid var(--cg-line); }
.onboarding-sequence span { display: grid; gap: 5px; min-width: 0; padding: 10px; border-right: 1px solid var(--cg-line); border-bottom: 1px solid var(--cg-line); background: var(--cg-surface); font-size: .72rem; text-transform: uppercase; }
.onboarding-sequence b { color: var(--cg-primary); font: 700 .64rem ui-monospace, monospace; }
.onboarding-facts { display: grid; margin-top: 14px; border: 1px solid var(--cg-line); background: var(--cg-surface); box-shadow: 4px 4px 0 var(--cg-line); }
.onboarding-facts article { display: grid; grid-template-columns: 32px 1fr; gap: 4px 10px; padding: 14px; border-bottom: 1px solid var(--cg-line); }
.onboarding-facts article:nth-child(2) ion-icon { color: #58cbff; }.onboarding-facts article:nth-child(3) ion-icon { color: #ad7aff; }
.onboarding-facts article:last-child { border: 0; }
.onboarding-facts ion-icon { grid-row: span 2; font-size: 1.35rem; color: #ff6c32; }
.onboarding-facts span { color: var(--cg-muted); font-size: .8rem; line-height: 1.4; }
.onboarding-action { width: 100%; margin-top: 16px; box-shadow: 5px 5px 0 var(--cg-line); }
@media (min-width: 850px) { .onboarding { grid-template-columns: minmax(380px, 1.05fr) minmax(420px, .95fr); }.onboarding-visual { height: auto; min-height: 100vh; }.onboarding-copy { min-height: 100vh; padding: 56px clamp(36px, 6vw, 84px); }.onboarding-facts { grid-template-columns: repeat(3, 1fr); }.onboarding-facts article { grid-template-columns: 1fr; align-content: start; border-right: 1px solid var(--cg-line); border-bottom: 0; }.onboarding-facts article:last-child { border-right: 0; }.onboarding-facts ion-icon { grid-row: auto; margin-bottom: 10px; } }
</style>
