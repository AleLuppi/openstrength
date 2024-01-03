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
    <q-field
      ref="fieldElement"
      v-bind="$props"
      dense
      borderless
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
      class="field-no-padding"
    >
      <template v-for="(_, slot) in $slots as Readonly<QFieldSlots>" #[slot]>
        <slot :name="slot" />
      </template>
    </q-field>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { QField } from "quasar";
import type { QFieldProps, QFieldSlots } from "quasar";

// Define props (from child)
interface extendedFieldProps extends QFieldProps {
  required?: boolean;
}
defineProps<extendedFieldProps>();

// Define methods (expose child's)
const fieldElement = ref<QField>();
defineExpose({
  resetValidation: () => fieldElement.value?.resetValidation(),
  validate: (value?: any) => fieldElement.value?.validate(value),
  focus: () => fieldElement.value?.focus(),
  blur: () => fieldElement.value?.blur(),
});
</script>

<style scoped lang="scss">
.field-no-padding :deep(.q-field__native) {
  padding: 0 !important;
}
</style>
