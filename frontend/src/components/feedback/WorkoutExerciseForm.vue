<template>
  <q-card
    :class="{
      'os-completed os-exercise-done-background': exerciseDone,
    }"
    class="q-mb-sm q-py-sm q-px-none no-shadow"
  >
    <div class="row justify-between items-center q-px-sm">
      <h6>
        {{ props.exercise.exerciseName + " " + props.exercise.variantName }}
      </h6>
      <q-btn
        size="xs"
        icon="check"
        :color="exerciseDone ? 'primary' : 'primary'"
        round
        :outline="!exerciseDone"
        @click="toggleDone"
      />
    </div>
    <p class="text-xs text-italic q-ml-sm">
      {{ props.exercise.note }}
    </p>

    <q-expansion-item
      hide-expand-icon
      :default-opened="!exerciseDone"
      class="q-ma-sm overflow-hidden bg-lighter"
      style="border-radius: 8px"
    >
      <template #header>
        <div class="q-py-sm full-width">
          <div
            v-for="(schema, indexLine) in props.exercise.schema"
            :key="indexLine"
          >
            <q-separator
              v-if="indexLine !== 0"
              size="1px"
              class="col q-mx-none q-my-sm"
            />

            <!-- Schema and feedback lines -->
            <div class="row items-center justify-between">
              <div class="column items-start col-8">
                <p class="text-italic">
                  {{ props.exercise.schemaNote[indexLine] }}
                </p>
                <p class="text-bold">
                  {{ schema }}
                </p>
              </div>

              <!-- Feedback buttons -->
              <div class="row items-center justify-end col-4">
                <!-- Show required text feedback -->
                <q-btn
                  icon="sym_o_message"
                  :color="lineTextFeedbacks[indexLine] ? 'primary' : 'light'"
                  flat
                  class="q-mx-xs q-px-xs"
                  @click.stop
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
                      exercise.textFeedback[indexLine]
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
                  @click.stop
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

      <template #default>
        <!-- TODO: i18n-->
        <!-- Set custom insertion -->
        <q-card>
          <q-card-section class="q-px-sm">
            <div class="column justify-center">
              <!-- Show schema or line data -->
              <div
                v-for="(set, indexSet) in props.modelValue?.completed
                  ? setTextFeedbacks
                  : setSuggestedTextFeedbacks"
                :key="indexSet"
              >
                <div
                  class="row justify-evenly items-end q-pa-none q-col-gutter-"
                >
                  <!-- Show line values -->
                  <p class="text-left text-xs text-bold col-2">
                    Set {{ set.setIndex ?? "" }}
                  </p>
                  <q-input
                    v-model="set.setLoadFeedback"
                    :label="indexSet === 0 ? 'Load (kg)' : ''"
                    type="number"
                    :readonly="readonly"
                    dense
                    stack-label
                    hide-bottom-space
                    class="q-px-sm q-ma-none col-4"
                  />
                  <q-input
                    v-model="set.setRepsFeedback"
                    :label="indexSet === 0 ? 'Reps' : ''"
                    type="number"
                    :readonly="readonly"
                    dense
                    stack-label
                    hide-bottom-space
                    class="q-px-sm q-ma-none col-3"
                  />
                  <q-input
                    v-model="set.setRpeFeedback"
                    :label="indexSet === 0 ? 'Rpe' : ''"
                    type="number"
                    :readonly="readonly"
                    dense
                    stack-label
                    hide-bottom-space
                    class="q-px-sm q-ma-none col-2"
                  />

                  <q-btn
                    v-if="set.setIndex && !readonly"
                    icon="remove"
                    round
                    outline
                    size="xs"
                    color="negative"
                    @click="removeSet(set.setIndex)"
                  ></q-btn>
                </div>
              </div>

              <q-btn
                v-if="!readonly"
                icon="add"
                flat
                label="Set"
                class="q-mt-sm"
                @click="addNewSet"
              />
            </div>
          </q-card-section>
        </q-card>
      </template>
    </q-expansion-item>
  </q-card>
</template>

<script setup lang="ts">
import {
  ProgramExerciseFeedback,
  ProgramExerciseSetsFeedback,
} from "@/helpers/programs/models";
import { ProgramFrozenView } from "@/helpers/programs/program";
import { ref, watch, onMounted, onUnmounted } from "vue";
import mixpanel from "mixpanel-browser";

// Define props
const props = withDefaults(
  defineProps<{
    // current feedback on exercise by athlete
    modelValue: ProgramExerciseFeedback | undefined;

    // frozen program exercise info
    exercise: ProgramFrozenView["weekdays"][number]["exercises"][number];

    // open exercise feedback in read-only mode
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
const setTextFeedbacks = ref<ProgramExerciseSetsFeedback[]>([]); // store feedbacks on sets by athlete
const setSuggestedTextFeedbacks = ref<ProgramExerciseSetsFeedback[]>([]);
const showInfoTooltip = ref<boolean[]>([]); // whether to show info tooltip for each line

// Initialize exercise completed
watch(
  () => props.modelValue,
  (val) => {
    exerciseDone.value = val?.completed ?? false;
    lineTextFeedbacks.value =
      val?.linesFeedback.map(
        (lineFeedback) => lineFeedback.textFeedback ?? "",
      ) ?? [];

    setTextFeedbacks.value =
      val?.setsInsertedFeedback.map((setFeedback) => ({
        setIndex: setFeedback.setIndex ?? undefined,
        setLoadFeedback: setFeedback.setLoadFeedback ?? undefined,
        setRepsFeedback: setFeedback.setRepsFeedback ?? undefined,
        setRpeFeedback: setFeedback.setRpeFeedback ?? undefined,
      })) ?? [];

    let index = 1;

    setSuggestedTextFeedbacks.value =
      props.exercise.lines?.flatMap((line) => {
        if (!line.sets || isNaN(Number(line.sets))) {
          return {
            setIndex: (index++).toString(),
            setLoadFeedback: line.load ?? undefined,
            setRepsFeedback: line.reps ?? undefined,
            setRpeFeedback: line.rpe ?? undefined,
          };
        } else {
          return Array.from({ length: Number(line.sets) }, () => ({
            setIndex: (index++).toString(),
            setLoadFeedback: line.load ?? undefined,
            setRepsFeedback: line.reps ?? undefined,
            setRpeFeedback: line.rpe ?? undefined,
          }));
        }
      }) ?? [];

    // Force model value to be different from undefined
    if (!val) saveExerciseFeedback();
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
function toggleDone() {
  if (props.readonly) return;
  exerciseDone.value = !exerciseDone.value;
  saveExerciseFeedback();
}

/**
 * Adds a new empty set for inserting load, rep, rpe
 */
function addNewSet() {
  const emptySetTextFeedback: ProgramExerciseSetsFeedback = {
    setIndex: (
      Number(setTextFeedbacks.value.slice(-1)[0]?.setIndex ?? 0) + 1
    ).toString(),
    setLoadFeedback: undefined,
    setRepsFeedback: undefined,
    setRpeFeedback: undefined,
  };
  setTextFeedbacks.value.push(emptySetTextFeedback);

  // Save feedback
  saveExerciseFeedback();
}

/**
 * Removes a set from the available ones
 * @param indexToRemove
 */
function removeSet(indexToRemove: number | string) {
  const index = setTextFeedbacks.value.findIndex(
    (feedback) => Number(feedback.setIndex) === Number(indexToRemove),
  );

  if (index < 0) return;

  setTextFeedbacks.value.splice(index, 1);

  // Rescale the remaining indexes
  setTextFeedbacks.value.forEach((feedback) => {
    const currentIndex = Number(feedback.setIndex);
    if (currentIndex > Number(indexToRemove)) {
      feedback.setIndex = (currentIndex - 1).toString();
    }
  });

  // Save modification
  saveExerciseFeedback();
}

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
          textFeedback: lineTextFeedbacks.value[idx],
          videoFeedback: undefined,
        };
      }) || [],

    setsInsertedFeedback: setTextFeedbacks.value.map((setFeedback) => ({
      setIndex: setFeedback.setIndex,
      setLoadFeedback: setFeedback.setLoadFeedback,
      setRepsFeedback: setFeedback.setRepsFeedback,
      setRpeFeedback: setFeedback.setRpeFeedback,
    })),
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
  background: $primary;
  animation: os-completed-animation 2s ease-in-out 1;
}

.os-wontdo::after {
  content: "Non lo svolgerò";
  background: $negative;
  animation: os-wontdo-animation 2s ease-in-out 1;
}

.os-exercise-done-background {
  background: $os-grey-warm-2; /* fallback for old browsers */
  background: -webkit-linear-gradient(
    180deg,
    rgba($os-grey-warm-0, 0.2),
    rgba($os-primary-5, 0.15)
  ); /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(
    180deg,
    rgba($os-grey-warm-0, 0.2),
    rgba($os-primary-5, 0.15)
  ); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
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
