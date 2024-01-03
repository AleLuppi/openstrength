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
      :class="{ 'placeholder-hide-on-focus': placeholderHideOnFocus }"
    >
      <template v-for="(_, slot) in $slots as Readonly<QInputSlots>" #[slot]>
        <slot :name="slot" />
      </template>
    </q-input>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { QInput } from "quasar";
import type { QInputProps, QInputSlots } from "quasar";

// Define props (from child)
interface extendedInputProps extends QInputProps {
  placeholder?: string; // missing in QInputProps
  placeholderHideOnFocus?: boolean;
  required?: boolean;
  rows?: number;
}
defineProps<extendedInputProps>();

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
