<template>
  <div v-on="$attrs">
    <!-- Title -->
    <h6
      v-if="props.label"
      class="text-input-top-label text-uppercase text-weight-medium q-my-xs"
      :class="{ 'input-required': props.required }"
    >
      {{ props.label }}
    </h6>

    <!-- Styled input -->
    <q-input
      ref="inputElement"
      v-bind="props"
      outlined
      dense
      :label="undefined"
      :rules="
        (props.rules ?? []).concat([
          (val: string) =>
            !props.required ||
            Boolean(val) ||
            $t('layout.interaction.input_required'),
        ])
      "
      lazy-rules
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
  required?: boolean;
}
const props = defineProps<extendedInputProps>();

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
.input-required:after {
  color: $red;
  content: " *";
  display: inline;
}
</style>
