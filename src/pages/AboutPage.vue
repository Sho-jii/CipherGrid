<script setup lang="ts">
import { RouterLink } from 'vue-router';
import PageFrame from '@/components/common/PageFrame.vue';
import { cipherRegistry } from '@/services/ciphers/registry';
</script>

<template>
  <PageFrame title="About CipherGrid" eyebrow="VERSION 1.0 / OFFLINE FIRST" back>
    <section class="about-hero"><img src="/assets/ciphergrid-logo.png" alt="CipherGrid logo" /><div><span class="kicker">Academic application title</span><h1>CipherGrid.</h1><p class="lead">A Mobile OCR-Assisted Multi-Cipher Encryption, Batch Processing, and Cryptanalysis Application.</p></div></section>
    <section class="grid-2 about-grid">
      <div class="terminal-panel"><span class="kicker">Purpose</span><h2>A transparent learning instrument</h2><p>CipherGrid helps students see how classical transformations work, compare candidates, and move between scanned worksheets and structured analysis.</p><p class="notice">Caesar, Vigenère, Atbash, Affine, Rail Fence, Columnar, Playfair, Hill, and Autokey are educational—not secure for secrets.</p></div>
      <div class="terminal-panel"><span class="kicker">Modern confidentiality</span><h2>Secure Lab uses platform cryptography</h2><p>AES-256-GCM is implemented through Web Crypto with fresh random material. CipherGrid does not implement custom AES primitives and never equates Base64 with encryption.</p><RouterLink to="/secure" class="button button--dark">Open Secure Lab</RouterLink></div>
      <div class="terminal-panel"><span class="kicker">Algorithms / {{ cipherRegistry.length }}</span><h2>Classical registry</h2><ul><li v-for="cipher in cipherRegistry" :key="cipher.id"><strong>{{ cipher.name }}</strong><span>{{ cipher.family }}</span></li></ul></div>
      <div class="terminal-panel"><span class="kicker">Platform notes</span><h2>Capabilities vary cleanly</h2><p>Android uses bundled ML Kit OCR; iOS uses Apple Vision; the web uses lazy-loaded Tesseract. Native sharing, camera, haptics, and file integration fall back to browser-safe behavior where the platform supports it.</p><p>No Firebase configuration, cloud OCR key, account, or backend is required.</p></div>
    </section>
    <footer class="about-footer"><span class="mono">CG//FIELD-TERMINAL</span><span>Built for inspectable classical cryptography education.</span></footer>
  </PageFrame>
</template>

<style scoped>
.about-hero { display: grid; gap: 22px; align-items: center; padding: 18px 0 36px; border-bottom: 1px solid var(--cg-line); }.about-hero img { width: min(100%, 220px); aspect-ratio: 1; object-fit: cover; background: var(--cg-dark); }.about-hero h1 { margin: 8px 0 18px; }.about-grid { margin-top: 18px; }.about-grid p { color: var(--cg-muted); line-height: 1.5; }.about-grid ul { padding: 0; list-style: none; border-top: 1px solid var(--cg-line); }.about-grid li { display: flex; justify-content: space-between; gap: 10px; padding: 9px; border-bottom: 1px solid var(--cg-line); }.about-grid li span { color: var(--cg-primary); font: .68rem ui-monospace, monospace; text-transform: uppercase; }.about-footer { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; margin-top: 44px; padding-top: 16px; border-top: 1px solid var(--cg-line); color: var(--cg-muted); font-size: .75rem; }
@media (min-width: 720px) { .about-hero { grid-template-columns: 240px 1fr; } }
</style>
