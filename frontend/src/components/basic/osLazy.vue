<template>
  <q-intersection margin="500px" v-bind="$props" class="os-lazy-min-height">
    <q-resize-observer @resize="updateHeight" />
    <slot></slot>
  </q-intersection>
</template>

<script setup lang="ts">
import { ref } from "vue";

// Store min height
const minHeight = ref<string>("0");

/**
 * Update minimum height.
 */
function updateHeight({ height }: { height: number }) {
  minHeight.value = height + "px";
}
</script>

<style scoped lang="scss">
.os-lazy-min-height {
  min-height: v-bind(minHeight);
}
</style>
