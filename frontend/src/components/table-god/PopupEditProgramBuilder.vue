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
      :options="['program line', 'free text']"
      chip-selected-color="red"
    />

    <q-form
      class="row items-center q-col-gutter-md"
      style="padding-bottom: 40px"
    >
      <os-input
        v-for="key in lineType == 'program line'
          ? ['load', 'reps', 'sets', 'rpe', 'note']
          : ['text']"
        :key="key"
        :model-value="popupModelValue[key]"
        @update:model-value="
          (val) => (popupModelValue = { ...popupModelValue, [key]: val })
        "
        :placeholder="key"
        placeholder-hide-on-focus
        hide-bottom-space
        :class="['note', 'text'].includes(key) ? 'col-10' : 'col-3'"
      />
      <q-checkbox
        v-for="key in ['feedbackText', 'feedbackVideo']"
        :key="key"
        :model-value="popupModelValue[key]"
        @update:model-value="
          (val) => (popupModelValue = { ...popupModelValue, [key]: val })
        "
        dense
        class="col-1 justify-center"
        :checked-icon="
          key == 'feedbackText'
            ? 'fa-solid fa-comment-dots'
            : 'fa-solid fa-video'
        "
        :unchecked-icon="
          key == 'feedbackText'
            ? 'fa-solid fa-comment-slash'
            : 'fa-solid fa-video-slash'
        "
      />
    </q-form>

    <q-btn
      icon="add"
      color="positive"
      round
      class="self-center"
      @click="addLine"
      style="
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translate(-50%, 30%);
      "
    />
  </q-popup-edit>
</template>

<script setup lang="ts">
import { TableSheetCell } from "@/components/models";
import type { QPopupEdit } from "quasar";
import { computed, onMounted, ref } from "vue";
import { convertLineToSchema } from "@/helpers/programs/converters";
import { ProgramLine } from "@/helpers/programs/program";
import osSelectInline from "@/components/basic/osSelectInline.vue";

// FIXME
function schemaToLine(schema: string) {
  const match = schema.match(/(\d+)/g);
  const matches = [...(match ?? [])];
  return new ProgramLine({
    loadBaseValue: matches?.[0] ?? "",
    repsBaseValue: matches?.[1] ?? "",
    setsBaseValue: matches?.[2] ?? "",
    rpeBaseValue: matches?.[3] ?? "",
  });
}

const fakeRef = ref("");
const lineType = ref("program line");

// Define props
const props = withDefaults(
  defineProps<{
    startIdx?: number;
  }>(),
  { startIdx: 0 },
);

// FIXME delete eslint line
// eslint-disable-next-line
const modelValue = defineModel<TableSheetCell>({ required: true });

// Set ref
const popupElement = ref<QPopupEdit>(); // reference to popup element
const valueIdx = ref<number>(props.startIdx);

// Get model value of popup table
const popupModelValue = computed<{
  load: string;
  reps: string;
  sets: string;
  rpe: string;
  note: string;
  feedbackText: boolean;
  feedbackVideo: boolean;
}>({
  get() {
    const line = schemaToLine(
      modelValue.value.values[valueIdx.value] as string,
    );
    return {
      load: line.loadBaseValue ?? "",
      reps: line.repsBaseValue ?? "",
      sets: line.setsBaseValue ?? "",
      rpe: line.rpeBaseValue ?? "",
      note: line.note ?? "",
      feedbackText: (modelValue.value.values[valueIdx.value + 1] ??
        false) as boolean,
      feedbackVideo: (modelValue.value.values[valueIdx.value + 2] ??
        false) as boolean,
    };
  },
  set(value) {
    modelValue.value.values[valueIdx.value] = convertLineToSchema(
      new ProgramLine({
        loadBaseValue: value.load,
        repsBaseValue: value.reps,
        setsBaseValue: value.sets,
        rpeBaseValue: value.rpe,
      }),
    );
    modelValue.value.values[valueIdx.value + 1] = value.feedbackText;
    modelValue.value.values[valueIdx.value + 2] = value.feedbackVideo;
    modelValue.value = { ...modelValue.value };
  },
});

function addLine() {
  modelValue.value.values.push("");
  valueIdx.value = valueIdx.value + 3;
}

// Display component as soon as mounted
onMounted(() => {
  popupElement.value?.show();
});
</script>
