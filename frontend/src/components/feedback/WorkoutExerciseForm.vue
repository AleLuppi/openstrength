<template>
  <q-card
    :class="{
      'os-completed': exerciseDone,
    }"
    class="q-mb-sm"
    style="border-radius: 8px"
  >
    <div class="q-py-sm q-px-none">
      <div class="row justify-between items-center q-px-sm">
        <div class="row justify-start items-center">
          <q-btn
            icon="sym_o_more_vert"
            flat
            outline
            color="dark-light"
            class="q-pa-none"
          ></q-btn>
          <h6>
            {{ props.exercise.exerciseName + " " + props.exercise.variantName }}
          </h6>
        </div>
        <q-btn
          size="xs"
          icon="check"
          :color="exerciseDone ? 'positive' : 'primary'"
          round
          :outline="!exerciseDone"
        ></q-btn>
        <p class="text-xs text-italic q-ml-sm">
          {{ props.exercise.note }}
        </p>
      </div>

      <q-expansion-item
        :model-value="readonly"
        @update:model-value="toggleOpen"
        hide-expand-icon
        :header-class="{
          'bg-green-3 ': exerciseDone,
        }"
        class="q-ma-sm shadow-1 overflow-hidden bg-lighter"
        style="border-radius: 8px"
      >
        <template #header>
          <div class="q-py-sm full-width">
            <div
              v-for="(line, indexLine) in props.exercise.lines"
              :key="indexLine"
            >
              <q-separator
                v-if="indexLine !== 0"
                size="1px"
                class="col q-mx-none q-my-sm"
              />
              <!-- Schema and feedback lines -->
              <div class="row items-center justify-between">
                <div
                  class="row items-center justify-start"
                  style="max-width: 70%"
                >
                  <div class="column">
                    <p class="text-italic">
                      {{ props.exercise.schemaNote[indexLine] }}
                    </p>
                    <p class="text-bold">
                      {{ props.exercise.schema[indexLine] }}
                    </p>
                  </div>
                </div>

                <!-- Feedback buttons -->
                <div
                  class="row items-center justify-end"
                  style="max-width: 30%"
                >
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
                      <os-input
                        autofocus
                        type="textarea"
                        v-model="scope.value"
                        :readonly="readonly"
                      />
                      <q-btn
                        class="full-width"
                        @click.stop.prevent="scope.set"
                        :label="readonly ? 'Chiudi' : 'Salva commento'"
                      />
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
            </div>
          </div>
        </template>

        <q-card>
          <q-card-section>
            <div class="column justify-center">
              <!-- Show schema or line data -->
              <div
                v-for="(line, indexLine) in props.exercise.lines"
                :key="indexLine"
              >
                <div class="row justify-evenly items-center q-pa-none">
                  <!-- Show line values -->

                  <p class="text-bold">Set</p>
                  <q-input
                    v-for="kind in lineValueTypes"
                    :key="kind"
                    v-model="line[kind]"
                    :label="indexLine === 0 ? lineValueLabels[kind] : ''"
                    dense
                    stack-label
                    hide-bottom-space
                    :style="{
                      width:
                        kind == 'rpe' ? '10%' : kind == 'reps' ? '20%' : '30%',
                    }"
                    class="q-pa-none q-ma-none"
                  />
                  <q-btn
                    icon="remove"
                    round
                    outline
                    size="xs"
                    color="negative"
                  ></q-btn>
                </div>
              </div>
              <q-btn icon="add" flat ouline label="Set" class="q-mt-sm"></q-btn>
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { ProgramExerciseFeedback } from "@/helpers/programs/models";
import { ProgramFrozenView } from "@/helpers/programs/program";
import { stringCapitalize } from "@/helpers/scalar";
import { ref, watch, onMounted, onUnmounted } from "vue";
import mixpanel from "mixpanel-browser";

// Define props
const props = withDefaults(
  defineProps<{
    // current feedback on exercise by athlete
    modelValue: ProgramExerciseFeedback | undefined;

    // frozen program exercise info
    exercise: ProgramFrozenView["weekdays"][number]["exercises"][number];

    //
    readonly: boolean;
  }>(),
  { readonly: false },
);

// Define emit
const emit = defineEmits<{
  "update:modelValue": [value: ProgramExerciseFeedback];
}>();

// Set ref
const exerciseDone = ref<boolean | undefined>(undefined); // whether exercise has been completed
const lineTextFeedbacks = ref<string[]>([]); // store text feedbacks
const showInfoTooltip = ref<boolean[]>([]); // whether to show info tooltip for each line

// Set constant values
const lineValueTypes: ("load" | "reps" | "rpe")[] = ["load", "reps", "rpe"];
const lineValueLabels = Object.fromEntries(
  lineValueTypes.map((val) => [val, stringCapitalize(val)]),
);

// Initialize exercise completed
watch(
  () => props.modelValue,
  (val) => {
    exerciseDone.value = val?.completed ?? false;
    lineTextFeedbacks.value =
      val?.linesFeedback.map(
        (lineFeedback) => lineFeedback.textFeedback ?? "",
      ) ?? [];
  },
  {
    immediate: true,
  },
);

/**
 * Toggle between the completion states of the exercise.
 *
 * Exercise can be:
 *  - done -> value "true"
 *  - not done -> value "false"
 */
/*
function toggleDone() {
  if (props.readonly) return;
  exerciseDone.value = !exerciseDone.value;
  saveExerciseFeedback();
}
*/

/**
 * Inform parent on update of exercise feedback.
 */
function saveExerciseFeedback() {
  const exerciseFeedback: ProgramExerciseFeedback = {
    exerciseName: props.exercise.exerciseName,
    variantName: props.exercise.variantName,
    completed: exerciseDone.value ?? false,
    willComplete: true,
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

  // Mixpanel tracking
  mixpanel.track("Athlete Feedback on exercise", {
    Feedback: exerciseFeedback.linesFeedback,
  });
}

/**
 * Manually hide all open tooltips.
 */
function resetTooltips() {
  showInfoTooltip.value.length = 0;
}

onMounted(() => {
  window.addEventListener("scroll", resetTooltips);
});

onUnmounted(() => {
  window.addEventListener("scroll", resetTooltips);
});
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
