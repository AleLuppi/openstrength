<template>
  <q-card
    :class="{
      'bg-green-3 os-completed': exerciseDone == true,
      'bg-red-3 os-wontdo': exerciseDone == false,
    }"
    class="q-mb-sm"
  >
    <!-- TODO: i18n for all the component-->
    <q-expansion-item
      :model-value="exerciseDone == undefined"
      @update:model-value="toggleDone"
      hide-expand-icon
    >
      <template #header>
        <div class="q-py-sm full-width">
          <div class="row items-center justify-between">
            <p class="text-bold">
              {{
                props.exercise.exerciseName + " " + props.exercise.variantName
              }}
            </p>

            <q-btn
              size="xs"
              :icon="exerciseDone == false ? 'close' : 'check'"
              :color="
                exerciseDone == true
                  ? 'positive'
                  : exerciseDone == false
                  ? 'negative'
                  : 'primary'
              "
              round
              :outline="exerciseDone == undefined"
            ></q-btn>
          </div>

          <p class="text-italic">
            {{ props.exercise.note }}
          </p>
        </div>
      </template>

      <template #default>
        <q-card-section>
          <!-- Show schema or line data -->
          <div
            v-for="(line, indexLine) in props.exercise.lines"
            :key="indexLine"
            class="row justify-between items-center q-pa-none"
          >
            <!-- Show line values -->
            <q-input
              v-for="kind in lineValueTypes"
              :key="kind"
              v-model="line[kind]"
              :label="indexLine === 0 ? lineValueLabels[kind] : ''"
              readonly
              dense
              stack-label
              hide-bottom-space
              :style="{ width: kind == 'load' ? '15%' : '10%' }"
              class="q-pa-none q-ma-none"
            />

            <div class="row items-center q-pa-none q-ma-none">
              <!-- Show line note from coach -->
              <q-btn
                flat
                color="info"
                icon="sym_o_info"
                class="q-mx-xs q-px-xs"
                :style="{
                  visibility: exercise.schemaNote[indexLine]
                    ? 'visible'
                    : 'hidden',
                }"
              >
                <q-tooltip
                  anchor="top middle"
                  self="bottom middle"
                  :offset="[10, 10]"
                  class="bg-lighter bordered text-xs"
                >
                  {{ exercise.schemaNote[indexLine] }}
                </q-tooltip>
              </q-btn>

              <!-- Show required text feedback -->
              <q-btn
                icon="sym_o_message"
                :color="lineTextFeedbacks[indexLine] ? 'primary' : 'light'"
                flat
                class="q-mx-xs q-px-xs"
              >
                <q-badge
                  v-if="
                    exercise.textFeedback[indexLine] &&
                    !lineTextFeedbacks[indexLine]
                  "
                  floating
                  rounded
                  color="red"
                  style="top: 2px; right: 0"
                >
                </q-badge>
                <q-tooltip
                  anchor="top middle"
                  self="bottom middle"
                  :offset="[10, 10]"
                  :delay="500"
                >
                  {{
                    exercise.videoFeedback[indexLine]
                      ? "Il tuo coach ha richiesto un feedback su questa serie"
                      : "Non è necessario dare un feedback su questa serie"
                  }}
                </q-tooltip>
                <q-popup-edit
                  style="width: 70%"
                  :model-value="lineTextFeedbacks[indexLine]"
                  v-slot="scope"
                  @save="
                    (val) => {
                      lineTextFeedbacks[indexLine] = val;
                      saveExerciseFeedback();
                    }
                  "
                >
                  <os-input autofocus type="textarea" v-model="scope.value" />
                  <q-btn class="full-width" @click.stop.prevent="scope.set">
                    Save Comment
                  </q-btn>
                </q-popup-edit>
              </q-btn>

              <!-- Show required video feedback -->
              <q-btn
                icon="sym_o_videocam"
                color="light"
                flat
                class="q-mx-xs q-px-xs"
              >
                <q-badge
                  v-if="exercise.videoFeedback[indexLine]"
                  floating
                  rounded
                  color="red"
                  style="top: 2px; right: 0"
                >
                </q-badge>
                <q-tooltip
                  anchor="top middle"
                  self="bottom middle"
                  :offset="[10, 10]"
                  :delay="500"
                >
                  {{
                    exercise.videoFeedback[indexLine]
                      ? "Il tuo coach ha richiesto un video per questa serie"
                      : "Non è stato richiesto un video per questa serie"
                  }}
                </q-tooltip>
              </q-btn>
            </div>
          </div>
        </q-card-section>
      </template>
    </q-expansion-item>
  </q-card>
</template>

<script setup lang="ts">
import { ProgramExerciseFeedback } from "@/helpers/programs/models";
import { ProgramFrozenView } from "@/helpers/programs/program";
import { stringCapitalize } from "@/helpers/scalar";
import { ref, watch } from "vue";

// Define props
const props = defineProps<{
  // current feedback on exercise by athlete
  modelValue: ProgramExerciseFeedback;

  // frozen program exercise info
  exercise: ProgramFrozenView["weekdays"][number]["exercises"][number];
}>();

// Define emit
const emit = defineEmits<{
  "update:modelValue": [value: ProgramExerciseFeedback];
}>();

// Set ref
const exerciseDone = ref<boolean | undefined>(undefined);
const lineTextFeedbacks = ref<string[]>([]);

// Set constant values
const lineValueTypes: ("load" | "reps" | "sets" | "rpe")[] = [
  "load",
  "reps",
  "sets",
  "rpe",
];
const lineValueLabels = Object.fromEntries(
  lineValueTypes.map((val) => [val, stringCapitalize(val)]),
);

// Initialize exercise completed
watch(
  props.modelValue,
  (val) =>
    (exerciseDone.value =
      val.completed || (val.willComplete ?? true ? undefined : false)),
  {
    immediate: true,
  },
);

/**
 * Toggle between the completion states of the exercise.
 *
 * Exercise can be:
 *  - done -> value "true"
 *  - won't do -> value "false"
 *  - to do -> value "undefined"
 */
function toggleDone() {
  switch (exerciseDone.value) {
    case true:
      exerciseDone.value = false;
      break;

    case false:
      exerciseDone.value = undefined;
      break;

    case undefined:
      exerciseDone.value = true;
      break;

    default:
      exerciseDone.value = undefined;
  }
  saveExerciseFeedback();
}

/**
 * Inform parent on update of exercise feedback.
 */
function saveExerciseFeedback() {
  const exerciseFeedback: ProgramExerciseFeedback = {
    exerciseName: props.exercise.exerciseName,
    variantName: props.exercise.variantName,
    completed: exerciseDone.value == true,
    willComplete: exerciseDone.value != false,
    linesFeedback:
      props.exercise.lines?.map((line, idx) => {
        return {
          loadFeedback: undefined, // TODO: update in 2nd communication release
          repsFeedback: undefined,
          setsFeedback: undefined,
          rpeFeedback: undefined,
          textFeedback: lineTextFeedbacks.value[idx],
          videoFeedback: undefined,
        };
      }) || [],
  };
  emit("update:modelValue", exerciseFeedback);
}
</script>

<style scoped lang="scss">
.os-completed,
.os-wontdo {
  overflow: hidden;

  &::after {
    font-style: italic;
    position: absolute;
    visibility: hidden;
    display: flex;
    align-items: center;
    justify-content: start;
    color: white;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    padding-inline: 30px;
    pointer-events: none;
  }
}

.os-completed::after {
  content: "Completato";
  background: $positive;
  animation: os-completed-animation 2s ease-in-out 1;
}

.os-wontdo::after {
  content: "Non lo svolgerò";
  background: $negative;
  animation: os-wontdo-animation 2s ease-in-out 1;
}

@keyframes os-completed-animation {
  0% {
    transform: translateX(100%);
    visibility: visible;
  }
  30%,
  70% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
    visibility: visible;
  }
}

@keyframes os-wontdo-animation {
  0% {
    transform: translateX(100%);
    visibility: visible;
  }
  30%,
  70% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
    visibility: visible;
  }
}
</style>
