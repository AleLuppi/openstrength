<template>
  <div v-on="$attrs">
    <!-- Title -->
    <p
      v-if="label"
      class="text-input-top-label text-uppercase text-weight-medium text-left"
      style="line-height: 1.6em"
    >
      {{ label }}
    </p>

    <div class="row cursor-pointer" @click="copyText">
      <!-- Styled input -->
      <q-input
        outlined
        dense
        :model-value="text"
        readonly
        hide-bottom-space
        class="merge-borders"
      >
      </q-input>

      <!-- Copy button -->
      <q-btn
        icon="fa-regular fa-copy"
        outline
        dense
        color="secondary"
        class="bg-grey-3 merge-borders"
      ></q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { copyToClipboard } from "quasar";

// Define props
const props = defineProps<{
  text: string;
  label?: string;
}>();

// Define emits
const emit = defineEmits<{
  copy: [success: boolean];
}>();

/**
 * Copy text to the clipboard.
 */
function copyText() {
  copyToClipboard(props.text)
    .then(() => emit("copy", true))
    .catch(() => emit("copy", false));
}
</script>

<style scoped lang="scss">
.merge-borders {
  & :deep(.q-field--outlined .q-field__control) {
    border-end-end-radius: 0;
    border-start-end-radius: 0;
  }

  &.q-btn {
    margin-inline-start: -1px;
    border-start-start-radius: 0;
    border-end-start-radius: 0;
  }
}
</style>
