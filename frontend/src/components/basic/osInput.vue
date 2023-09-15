<template>
  <div>
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
    />
  </div>
</template>

<script setup lang="ts">
import type { QInputProps } from "quasar";

interface extendedInputProps extends QInputProps {
  required?: boolean;
}

const props = defineProps<extendedInputProps>();
</script>

<style scoped lang="scss">
.input-required:after {
  color: $red;
  content: " *";
  display: inline;
}
</style>
