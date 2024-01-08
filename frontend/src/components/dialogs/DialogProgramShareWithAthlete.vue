<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="(value) => emit('update:modelValue', value)"
  >
    <q-card>
      <q-card-section>
        <os-text-copyable :text="urlFullPath"></os-text-copyable>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import router, { NamedRoutes } from "@/router";
import { computed } from "vue";

// Define props
const props = defineProps<{
  modelValue: boolean;
  programId: string;
}>();

// Define emits
const emit = defineEmits<{
  "update:modelValue": [value: Boolean];
}>();

// Get full shareable path
const urlFullPath = computed(
  () =>
    window.location.origin +
    router.resolve({
      name: NamedRoutes.view_program,
      query: { id: props.programId },
    }).fullPath,
);
</script>
