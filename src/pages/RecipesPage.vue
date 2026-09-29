<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { IonIcon } from '@ionic/vue';
import { addOutline, playOutline, saveOutline, trashOutline, shareOutline } from 'ionicons/icons';
import { Share } from '@capacitor/share';
import PageFrame from '@/components/common/PageFrame.vue';
import { executeRecipe, presetRecipes, validateRecipe, type Recipe, type RecipeStep } from '@/services/recipes/recipes';
import { getRecords, putRecord } from '@/services/storage/database';

const recipes = ref<Recipe[]>([]); const selectedId = ref(''); const input = ref(''); const outputs = ref<{ stepId: string; label: string; preview: string }[]>([]); const notice = ref('');
const selected = computed(() => recipes.value.find((recipe) => recipe.id === selectedId.value));
onMounted(async () => { const saved = await getRecords<Recipe>('recipes'); recipes.value = saved.length ? saved : structuredClone(presetRecipes); selectedId.value = recipes.value[0]?.id ?? ''; });
function chooseRecipe(id: string) { selectedId.value = id; outputs.value = []; notice.value = ''; }
function addStep(kind: RecipeStep['kind']) {
  const recipe = selected.value; if (!recipe) return;
  const id = crypto.randomUUID();
  const step: RecipeStep = kind === 'normalize' ? { id, kind, label: 'Normalize whitespace' } : kind === 'qr' ? { id, kind, label: 'Create QR payload' } : kind === 'share' ? { id, kind, label: 'Share output' } : { id, kind, label: 'Caesar encrypt', mode: 'encrypt', options: { kind: 'caesar', shift: 3 } };
  recipe.steps.push(step);
}
function removeStep(index: number) { selected.value?.steps.splice(index, 1); }
function changeCipher(step: Extract<RecipeStep, { kind: 'cipher' }>, kind: 'caesar' | 'vigenere' | 'atbash') { step.options = kind === 'caesar' ? { kind, shift: 3 } : kind === 'vigenere' ? { kind, key: 'LEMON' } : { kind }; step.label = `${kind} ${step.mode}`; }
async function save() { const recipe = selected.value; if (!recipe) return; const errors = validateRecipe(recipe); if (errors.length) { notice.value = errors.join(' '); return; } recipe.updatedAt = new Date().toISOString(); await putRecord('recipes', structuredClone(recipe)); notice.value = 'Recipe saved locally.'; }
function run() { const recipe = selected.value; if (!recipe) return; try { outputs.value = executeRecipe(recipe, input.value); notice.value = ''; } catch (error) { notice.value = error instanceof Error ? error.message : 'Recipe failed.'; } }
async function shareFinal() { const text = outputs.value.at(-1)?.preview; if (text) await Share.share({ title: selected.value?.name, text }); }
</script>

<template>
  <PageFrame title="Recipes" eyebrow="VISIBLE LOCAL AUTOMATION" back wide>
    <section class="recipe-hero"><div><span class="kicker">Every step shown</span><h1>Build a<br />repeatable flow.</h1></div><p class="lead">Recipes run locally. Each transformation is validated and every intermediate output remains visible for review.</p></section>
    <section class="recipe-layout">
      <aside class="recipe-list"><button v-for="recipe in recipes" :key="recipe.id" type="button" :class="{ active: selectedId === recipe.id }" @click="chooseRecipe(recipe.id)"><strong>{{ recipe.name }}</strong><span>{{ recipe.steps.length }} steps · {{ recipe.description }}</span></button></aside>
      <div v-if="selected" class="stack">
        <section class="terminal-panel stack"><div class="field"><label for="recipe-name">Recipe name</label><input id="recipe-name" v-model="selected.name" /></div><div class="field"><label for="recipe-description">Description</label><input id="recipe-description" v-model="selected.description" /></div>
          <div class="recipe-steps"><article v-for="(step, index) in selected.steps" :key="step.id"><span class="step-index">{{ String(index + 1).padStart(2, '0') }}</span><div class="field"><label>Step label</label><input v-model="step.label" /></div><template v-if="step.kind === 'cipher'"><div class="field"><label>Algorithm</label><select :value="step.options.kind" @change="changeCipher(step, ($event.target as HTMLSelectElement).value as 'caesar' | 'vigenere' | 'atbash')"><option value="caesar">Caesar</option><option value="vigenere">Vigenère</option><option value="atbash">Atbash</option></select></div><div class="field"><label>Mode</label><select v-model="step.mode"><option value="encrypt">Encrypt</option><option value="decrypt">Decrypt</option></select></div><div v-if="step.options.kind === 'caesar'" class="field"><label>Shift</label><input v-model.number="step.options.shift" type="number" /></div><div v-if="step.options.kind === 'vigenere'" class="field"><label>Keyword</label><input v-model="step.options.key" /></div></template><span v-else class="badge">{{ step.kind }}</span><button class="square-icon" type="button" aria-label="Remove recipe step" @click="removeStep(index)"><IonIcon :icon="trashOutline" /></button></article></div>
          <div class="add-steps"><span class="field-label">Add step</span><button type="button" @click="addStep('normalize')"><IonIcon :icon="addOutline" />Normalize</button><button type="button" @click="addStep('cipher')"><IonIcon :icon="addOutline" />Cipher</button><button type="button" @click="addStep('qr')"><IonIcon :icon="addOutline" />QR</button><button type="button" @click="addStep('share')"><IonIcon :icon="addOutline" />Share</button></div><button class="button" type="button" @click="save"><IonIcon :icon="saveOutline" />Save recipe</button><p v-if="notice" class="notice">{{ notice }}</p></section>
        <section class="terminal-panel stack"><div class="field"><label for="recipe-input">Input</label><textarea id="recipe-input" v-model="input" placeholder="Paste text to run through this recipe…" /></div><button class="button button--primary" type="button" :disabled="!input" @click="run"><IonIcon :icon="playOutline" />Run with visible outputs</button><div v-if="outputs.length" class="steps"><article v-for="output in outputs" :key="output.stepId" class="step"><strong>{{ output.label }}</strong><p class="mono">{{ output.preview }}</p></article></div><button v-if="selected.steps.at(-1)?.kind === 'share' && outputs.length" class="button button--signal" type="button" @click="shareFinal"><IonIcon :icon="shareOutline" />Open share sheet</button></section>
      </div>
    </section>
  </PageFrame>
</template>

<style scoped>
.recipe-hero { display: grid; gap: 20px; padding-bottom: 30px; }.recipe-hero h1 { margin: 8px 0 0; }.recipe-hero .lead { align-self: end; }.recipe-layout { display: grid; gap: 12px; }.recipe-list { display: grid; align-content: start; border: 1px solid var(--cg-line); }.recipe-list button { display: grid; gap: 5px; padding: 13px; text-align: left; border: 0; border-bottom: 1px solid var(--cg-line); background: var(--cg-surface); color: var(--cg-ink); }.recipe-list button:last-child { border: 0; }.recipe-list button.active { background: var(--cg-dark); color: #fff; }.recipe-list span { font-size: .72rem; opacity: .72; }.recipe-steps { display: grid; gap: 7px; }.recipe-steps article { display: grid; grid-template-columns: 34px 1fr 44px; gap: 8px; align-items: end; padding: 9px; border: 1px solid var(--cg-line); }.recipe-steps article > .field:not(:first-of-type), .recipe-steps article > .badge { grid-column: 2; }.recipe-steps article > .square-icon { grid-column: 3; grid-row: 1; }.step-index { align-self: center; color: var(--cg-primary); font: 700 .75rem ui-monospace, monospace; }.add-steps { display: flex; flex-wrap: wrap; gap: 7px; }.add-steps .field-label { width: 100%; }.add-steps button { min-height: 38px; border: 1px solid var(--cg-line); background: var(--cg-surface); color: var(--cg-ink); }.step p { white-space: pre-wrap; overflow-wrap: anywhere; }
@media (min-width: 800px) { .recipe-hero { grid-template-columns: 1fr 1fr; }.recipe-layout { grid-template-columns: 280px 1fr; }.recipe-steps article { grid-template-columns: 34px 1.4fr 1fr 110px 1fr 44px; }.recipe-steps article > .field:not(:first-of-type), .recipe-steps article > .badge { grid-column: auto; }.recipe-steps article > .square-icon { grid-column: auto; grid-row: auto; } }
</style>
