<template>
  <q-list>
    <q-btn
      v-bind="props"
      rounded
      no-caps
      v-for="(text, key) in textsMap"
      :key="text"
      :color="selected.includes(key) ? 'primary' : 'lighter'"
      :text-color="selected.includes(key) ? 'lighter' : 'dark'"
      @click="toggleButton(key)"
      class="q-ma-sm bordered"
    >
      {{ props.useLocale ? $t(text) : text }}
    </q-btn>

    <q-item v-if="errorMessage" class="text-negative" style="font-size: 11px">
      {{ errorMessage }}
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { QBtnProps } from "quasar";

// Define props (from child)
interface extendedBtnProps extends QBtnProps {
  texts: string[] | { [key: string]: string };
  modelValue?: string[];
  exclusive?: boolean;
  useLocale?: boolean;
  minChoices?: number;
  maxChoices?: number;
}
const props = defineProps<extendedBtnProps>();
const emit = defineEmits(["update:modelValue"]);
defineExpose({ validate });

// Set ref
const selected = ref<string[]>([]);
const textsMap = computed(() =>
  Array.isArray(props.texts)
    ? props.texts.reduce((obj, val) => ({ ...obj, [val]: val }), {})
    : props.texts,
);
const errorMessage = ref("");

/**
 * Select or deselect buttons according to configuration.
 *
 * @param button key of the button that has been pressed.
 */
function toggleButton(button: string) {
  if (props.exclusive) selected.value = [button];
  else
    selected.value = selected.value.includes(button)
      ? selected.value.filter((el) => el != button)
      : selected.value.concat([button]);
  emit("update:modelValue", selected.value);
  if (errorMessage.value) validate();
}

/**
 * Validate toggle buttons according to provided rules.
 *
 * @returns true if validation is successful, false otherwise.
 */
function validate() {
  // Get meaningful bounds
  const min = Math.min(
    props.minChoices ?? 0,
    props.exclusive ? 1 : Object.keys(textsMap.value).length,
  );
  const max = Math.max(
    props.maxChoices ?? Object.keys(textsMap.value).length,
    min,
  );

  // Fail if lower than minimum
  if (selected.value.length < min) {
    errorMessage.value = `Select at least ${min} values.`; // TODO add locale
    return false;
  }
  if (selected.value.length > max) {
    errorMessage.value = `Select at most ${max} values.`; // TODO add locale
    return false;
  }
  errorMessage.value = "";
  return true;
}
</script>
