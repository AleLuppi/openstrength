<template>
  <q-popup-edit
    ref="popupElement"
    :model-value="fakeRef"
    :cover="false"
    anchor="top middle"
    self="bottom middle"
    style="overflow: visible"
  >
    <osSelectInline
      v-model="lineType"
      label="Line type:"
      :options="Object.values(ProgramLineType)"
    />

    <TableProgramBuilder v-model="modelValue.meta" />
  </q-popup-edit>
</template>

<script setup lang="ts">
import { TableSheetCell } from "@/components/models";
import type { QPopupEdit } from "quasar";
import { computed, onMounted, ref, watch } from "vue";
import osSelectInline from "@/components/basic/osSelectInline.vue";
import TableProgramBuilder from "@/components/tables/TableProgramBuilder.vue";
import { ProgramExercise } from "@/helpers/programs/program";

enum ProgramLineType {
  ProgramLine = "program line",
  FreeText = "free text",
}

// Define model
const modelValue = defineModel<TableSheetCell>({ required: true });

const fakeRef = ref("");

const lineType = computed<ProgramLineType>({
  get: () =>
    modelValue.value.meta?.textOnly
      ? ProgramLineType.FreeText
      : ProgramLineType.ProgramLine,
  set: (value) => {
    modelValue.value.meta.textOnly = value == ProgramLineType.FreeText;
  },
});

// Set ref
const popupElement = ref<QPopupEdit>(); // reference to popup element

// Ensure meta is set
watch(
  modelValue.value.meta,
  () => {
    if (!(modelValue.value.meta instanceof ProgramExercise))
      modelValue.value.meta = new ProgramExercise();
  },
  { immediate: true },
);

// Display component as soon as mounted
onMounted(() => {
  popupElement.value?.show();
});
</script>
