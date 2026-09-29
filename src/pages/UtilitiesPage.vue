<script setup lang="ts">
import { ref } from 'vue';
import PageFrame from '@/components/common/PageFrame.vue';
import { base64Decode, base64Encode, binaryToText, hexToText, sha256, textToBinary, textToHex } from '@/services/utilities/encoding';
type Utility = 'base64' | 'hex' | 'binary' | 'sha256';
const utility = ref<Utility>('base64'); const direction = ref<'encode' | 'decode'>('encode'); const input = ref(''); const output = ref(''); const error = ref('');
async function run() {
  error.value = ''; output.value = '';
  try {
    if (utility.value === 'base64') output.value = direction.value === 'encode' ? base64Encode(input.value) : base64Decode(input.value);
    else if (utility.value === 'hex') output.value = direction.value === 'encode' ? textToHex(input.value) : hexToText(input.value);
    else if (utility.value === 'binary') output.value = direction.value === 'encode' ? textToBinary(input.value) : binaryToText(input.value);
    else output.value = await sha256(input.value);
  } catch (cause) { error.value = cause instanceof Error ? cause.message : 'Conversion failed.'; }
}
function choose(value: Utility) { utility.value = value; output.value = ''; error.value = ''; if (value === 'sha256') direction.value = 'encode'; }
</script>

<template>
  <PageFrame title="Utilities" eyebrow="REPRESENTATION / DIGESTS" back>
    <section><span class="kicker">Not classical or modern encryption</span><h1>Convert.<br />Inspect.</h1><p class="lead">Encoding changes representation. Hashing creates a one-way digest. Neither provides confidentiality.</p></section>
    <section class="utility-tabs" aria-label="Utility"><button v-for="item in (['base64','hex','binary','sha256'] as Utility[])" :key="item" type="button" :class="{ active: utility === item }" @click="choose(item)"><strong>{{ item === 'sha256' ? 'SHA-256' : item.toUpperCase() }}</strong><span>{{ item === 'sha256' ? 'One-way digest' : 'Reversible encoding' }}</span></button></section>
    <section class="terminal-panel stack">
      <div v-if="utility !== 'sha256'" class="segmented"><button type="button" :class="{ active: direction === 'encode' }" @click="direction = 'encode'">Text → {{ utility }}</button><button type="button" :class="{ active: direction === 'decode' }" @click="direction = 'decode'">{{ utility }} → text</button></div>
      <p v-else class="notice"><strong>One-way; cannot be decrypted.</strong> SHA-256 is useful for integrity comparison, not secrecy.</p>
      <div class="field"><label for="utility-input">Input</label><textarea id="utility-input" v-model="input" spellcheck="false" /></div>
      <button class="button button--primary" type="button" @click="run">{{ utility === 'sha256' ? 'Compute digest' : 'Convert representation' }}</button>
      <p v-if="error" class="notice error">{{ error }}</p>
      <div v-if="output" class="field"><label>Output</label><pre class="utility-output">{{ output }}</pre></div>
    </section>
  </PageFrame>
</template>

<style scoped>
h1 { margin: 8px 0 18px; }.utility-tabs { display: grid; grid-template-columns: repeat(2, 1fr); margin: 30px 0 12px; border-top: 1px solid var(--cg-line); border-left: 1px solid var(--cg-line); }.utility-tabs button { display: grid; gap: 5px; min-height: 90px; padding: 12px; text-align: left; border: 0; border-right: 1px solid var(--cg-line); border-bottom: 1px solid var(--cg-line); background: var(--cg-surface); color: var(--cg-ink); }.utility-tabs button.active { background: var(--cg-primary); color: #fff; }.utility-tabs span { font-size: .7rem; opacity: .72; }.utility-output { min-height: 120px; margin: 0; padding: 14px; white-space: pre-wrap; overflow-wrap: anywhere; background: var(--cg-dark); color: #fff; font: .82rem/1.5 ui-monospace, monospace; }
@media (min-width: 700px) { .utility-tabs { grid-template-columns: repeat(4, 1fr); } }
</style>
