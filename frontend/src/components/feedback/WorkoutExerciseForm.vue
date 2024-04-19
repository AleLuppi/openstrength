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
    <p v-if="!exercise.textOnly" class="text-xs text-italic q-ml-sm">
      {{ props.exercise.note }}
    </p>

    <q-expansion-item
      :model-value="exercise.textOnly ? false : undefined"
      hide-expand-icon
      :default-opened="!exerciseDone"
      class="q-ma-sm overflow-hidden bg-lighter"
      style="border-radius: 8px"
      @update:model-value="undefined"
    >
      <template #header>
        <div class="q-py-sm full-width">
          <div
            v-for="(schema, indexLine) in exercise.textOnly
              ? [exercise.note]
              : exercise.schema"
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
                <p v-if="!exercise.textOnly" class="text-italic">
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
                  :icon="biChatLeftDots"
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
                    v-slot="scope"
                    style="width: 70%"
                    :model-value="lineTextFeedbacks[indexLine]"
                    @save="
                      (val) => {
                        lineTextFeedbacks[indexLine] = val;
                        saveExerciseFeedback();
                      }
                    "
                  >
                    <os-input
                      v-model="scope.value"
                      autofocus
                      type="textarea"
                      :readonly="readonly"
                    />
                    <q-btn
                      :label="readonly ? 'Chiudi' : 'Salva commento'"
                      class="full-width"
                      @click.stop.prevent="scope.set"
                    />
                  </q-popup-edit>
                </q-btn>

                <!-- Show required video feedback -->
                <q-btn
                  :icon="biCameraVideo"
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
            <div
              v-for="(lineSets, lineIdx) in sortedSetsPerformed"
              :key="lineIdx"
              class="column justify-center"
            >
              <!-- Show schema or line data -->
              <div
                v-for="(lineSet, setIdx) in lineSets"
                :key="lineSet.setIndex"
              >
                <div
                  class="row justify-evenly items-end q-pa-none"
                  :class="{ 'os-set-skipped': lineSet.setSkipped }"
                >
                  <!-- Show line values -->
                  <p class="text-left text-xs text-bold col-2">
                    Set {{ setIdx + 1 }}
                  </p>
                  <q-input
                    v-model="lineSet.setLoad"
                    :label="setIdx === 0 ? 'Load (kg)' : ''"
                    type="number"
                    :readonly="readonly || lineSet.setSkipped"
                    dense
                    stack-label
                    hide-bottom-space
                    class="q-px-sm q-ma-none col-4"
                  />
                  <q-input
                    v-model="lineSet.setReps"
                    :label="setIdx === 0 ? 'Reps' : ''"
                    type="number"
                    :readonly="readonly || lineSet.setSkipped"
                    dense
                    stack-label
                    hide-bottom-space
                    class="q-px-sm q-ma-none col-3"
                  />
                  <q-input
                    v-model="lineSet.setRpe"
                    :label="setIdx === 0 ? 'Rpe' : ''"
                    type="number"
                    :readonly="readonly || lineSet.setSkipped"
                    dense
                    stack-label
                    hide-bottom-space
                    class="q-px-sm q-ma-none col-2"
                  />

                  <q-btn
                    v-if="!readonly"
                    :icon="lineSet.setSkipped ? 'add' : 'remove'"
                    round
                    outline
                    size="xs"
                    :color="lineSet.setSkipped ? 'positive' : 'negative'"
                    @click="
                      removeSet(lineIdx, lineSet.setIndex, lineSet.setSkipped)
                    "
                  ></q-btn>
                </div>
              </div>

              <q-btn
                v-if="!readonly"
                icon="add"
                flat
                label="Set"
                class="q-mt-sm"
                @click="addSet(lineIdx)"
              />
              <q-separator inset class="q-my-md" color="grey-3" />
            </div>
          </q-card-section>
        </q-card>
      </template>
    </q-expansion-item>
  </q-card>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from "vue";
import mixpanel from "mixpanel-browser";
import { biCameraVideo, biChatLeftDots } from "@quasar/extras/bootstrap-icons";
import { ProgramExerciseFeedback } from "@/helpers/programs/models";
import {
  ProgramFrozenLine,
  ProgramFrozenView,
} from "@/helpers/programs/program";
import {
  arrayPushToNullable,
  arrayRange,
  arraySortObjectsByField,
} from "@/helpers/array";
import { objectAssignNotUndefined } from "@/helpers/object";

// Define props
const props = withDefaults(
  defineProps<{
    // frozen program exercise info
    exercise: ProgramFrozenView["weekdays"][number]["exercises"][number];

    // open exercise feedback in read-only mode
    readonly: boolean;
  }>(),
  { readonly: false },
);

// Define models
const modelValue = defineModel<ProgramExerciseFeedback>({
  required: true,
}); // current feedback on exercise by athlete

// Set ref
const exerciseDone = ref<boolean | undefined>(undefined); // whether exercise has been completed
const lineTextFeedbacks = ref<string[]>([]); // store text feedbacks
const showInfoTooltip = ref<boolean[]>([]); // whether to show info tooltip for each line

// Get a sorted list of performed sets
const sortedSetsPerformed = computed(() =>
  modelValue.value.linesFeedback.map((lineFeedback) =>
    lineFeedback.setsPerformed
      ? arraySortObjectsByField(lineFeedback.setsPerformed, "setIndex")
      : [],
  ),
);

// Initialize exercise completed
watch(
  modelValue,
  (val) => {
    // Extract useful values
    exerciseDone.value = val?.completed ?? false;
    lineTextFeedbacks.value =
      val?.linesFeedback.map(
        (lineFeedback) => lineFeedback.textFeedback ?? "",
      ) ?? [];

    // Ensure sets feedback is initialized
    props.exercise.lines?.forEach((line, lineIdx) => {
      const numSets = getSetsNumber(line);

      // Ensure one set per line
      const setsPerformed = arrayRange(1, numSets + 1).map(
        (setIdx) =>
          val.linesFeedback[lineIdx]?.setsPerformed?.find(
            (setInfo) => setInfo.setIndex == setIdx,
          ) ?? {
            setIndex: setIdx,
            setLoad: line.load,
            setReps: line.reps,
            setRpe: line.rpe,
          },
      );

      // Add extra sets
      setsPerformed.push(
        ...(val.linesFeedback[lineIdx]?.setsPerformed?.filter(
          (setInfo) => setInfo.setIndex < 1 || setInfo.setIndex > numSets,
        ) ?? []),
      );

      // Assign to model value
      if (!modelValue.value.linesFeedback[lineIdx])
        modelValue.value.linesFeedback[lineIdx] = {};
      objectAssignNotUndefined(modelValue.value.linesFeedback[lineIdx], {
        setsPerformed: setsPerformed,
      });
    });
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
 * Add a new empty performed set.
 *
 * @param lineIdx program line index whose feedback shall be updated.
 * @param [position="after"] where to add the new set.
 */
function addSet(
  lineIdx: number,
  position: number | "before" | "after" = "after",
) {
  // TODO also add before and in between
  switch (position) {
    case "after":
      arrayPushToNullable(
        modelValue.value.linesFeedback[lineIdx].setsPerformed,
        {
          setIndex:
            (sortedSetsPerformed.value[lineIdx].at(-1)?.setIndex ?? 0) + 1,
          setLoad: undefined,
          setReps: undefined,
          setRpe: undefined,
        },
      );
  }

  // Save feedback
  saveExerciseFeedback();
}

/**
 * Removes a set from the available ones.
 *
 * @param lineIdx program line index whose feedback shall be updated.
 * @param setIdx index of the set to remove.
 * @param [restore=false] if true, re-add a skipped set instead of removing it.
 */
function removeSet(lineIdx: number, setIdx: number, restore = false) {
  // Delete the requested set
  if (
    setIdx < 1 ||
    (props.exercise.lines &&
      setIdx > getSetsNumber(props.exercise.lines[lineIdx]))
  ) {
    modelValue.value.linesFeedback[lineIdx].setsPerformed =
      modelValue.value.linesFeedback[lineIdx].setsPerformed?.filter(
        (setInfo) => setInfo.setIndex != setIdx,
      );

    // Rescale the remaining sets indexes
    modelValue.value.linesFeedback[lineIdx].setsPerformed?.forEach(
      (setInfo) => {
        if (setIdx > 0 && setInfo.setIndex > setIdx) setInfo.setIndex -= 1;
        else if (setIdx <= 0 && setInfo.setIndex < setIdx)
          setInfo.setIndex += 1;
      },
    );
  } else {
    Object.assign(
      modelValue.value.linesFeedback[lineIdx].setsPerformed?.find(
        (setInfo) => setInfo.setIndex == setIdx,
      ) ?? {},
      { setSkipped: !restore },
    );
  }

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
          loadFeedback: undefined,
          repsFeedback: undefined,
          setsFeedback: undefined,
          rpeFeedback: undefined,
          textFeedback: lineTextFeedbacks.value[idx],
          videoFeedback: undefined,
          setsPerformed: modelValue.value.linesFeedback[idx].setsPerformed,
        };
      }) || [],
  };

  modelValue.value = exerciseFeedback;

  // Mixpanel tracking
  mixpanel.track("Athlete Feedback on exercise", {
    Feedback: exerciseFeedback.linesFeedback,
  });
}

/**
 * Get the number of sets in a line.
 *
 * @param line program line to check.
 */
function getSetsNumber(line: ProgramFrozenLine) {
  return !line.sets || isNaN(Number(line.sets)) ? 1 : Number(line.sets);
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

.os-set-skipped {
  position: relative;

  &::after {
    content: "";
    position: absolute;
    top: 70%;
    left: 0;
    border-bottom: 1px solid $negative;
    width: 90%;
  }
}
</style>
