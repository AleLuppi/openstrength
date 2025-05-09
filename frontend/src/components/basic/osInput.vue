<template>
  <div v-on="$attrs">
    <!-- Title -->
    <p
      v-if="label"
      class="text-input-top-label text-uppercase text-weight-medium text-left"
      :class="{ 'input-required': required }"
      style="line-height: 1.6em"
    >
      {{ label }}
    </p>

    <!-- Styled input -->
    <q-input
      ref="inputElement"
      v-bind="$props"
      outlined
      dense
      :label="undefined"
      :rules="
        (rules ?? []).concat([
          (val: string) =>
            !required ||
            Boolean(val) ||
            $t('layout.interaction.input_required'),
        ])
      "
      lazy-rules
      :rows="rows ?? 3"
      class="input-number-hide-arrows"
      :class="{ 'placeholder-hide-on-focus': placeholderHideOnFocus }"
    >
      <template v-for="(_, slot) in slots" #[slot]="scope">
        <slot :name="slot" v-bind="scope || {}"></slot>
      </template>
    </q-input>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { QInput } from "quasar";
import type { QInputProps, QInputSlots } from "quasar";

// Define slots
const slots = defineSlots<QInputSlots>();

// Define props (from child)
export interface osInputProps extends QInputProps {
  // input element props (missing in QInputProps)
  placeholder?: string;
  step?: string;
  min?: string;
  max?: string;

  // textarea element props (missing in QInputProps)
  rows?: number;

  // whether to hide placeholder when input is focused instead of waiting for first character
  placeholderHideOnFocus?: boolean;

  // whether a non-empty model value is required to validate a form
  required?: boolean;
}
defineProps<osInputProps>();

// Define methods (expose child's)
const inputElement = ref<QInput>();
defineExpose({
  resetValidation: () => inputElement.value?.resetValidation(),
  validate: (value?: any) => inputElement.value?.validate(value),
  focus: () => inputElement.value?.focus(),
  blur: () => inputElement.value?.blur(),
  select: () => inputElement.value?.select(),
  getNativeElement: () => inputElement.value?.getNativeElement(),
});
</script>

<style scoped lang="scss">
// Hide up/down arrows inside input element if of type "number"
.input-number-hide-arrows {
  /* Chrome, Safari, Edge, Opera */
  &:deep(input::-webkit-outer-spin-button),
  :deep(input::-webkit-inner-spin-button) {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  &:deep(input[type="number"]) {
    appearance: textfield;
    -moz-appearance: textfield;
  }
}
</style>
