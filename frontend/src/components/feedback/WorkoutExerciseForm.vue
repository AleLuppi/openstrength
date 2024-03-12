<template>
  <q-card
    :class="{
      'bg-green-3 os-completed': exerciseDone == true,
      'bg-red-3 os-dontdo': exerciseDone == false,
    }"
    class="q-mb-sm"
  >
    <!-- TODO: i18n for all the component-->
    <q-expansion-item
      :model-value="exerciseDone == undefined"
      @update:model-value="() => {}"
      hide-expand-icon
      @click="toggleDone"
    >
      <template #header>
        <div class="q-py-sm full-width">
          <div class="row items-center justify-between">
            <p>
              <b>
                {{
                  props.exercise.exerciseName + " " + props.exercise.variantName
                }}</b
              >
            </p>

            <div>
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
          </div>

          <p>
            <i>{{ props.exercise.note }}</i>
          </p>
        </div>
      </template>

      <template #default>
        <q-card-section>
          <!-- Show schema or line data -->
          <div
            v-for="(line, indexLine) in props.exercise.lines"
            :key="indexLine"
            class="row col-12 justify-between items-center q-pa-none"
          >
            <div>
              <div
                class="row justify-between q-pa-none q-ma-none"
                style="width: 100%"
              >
                <q-input
                  v-if="line"
                  v-model="line.load"
                  :label="indexLine === 0 ? 'Load' : ''"
                  readonly
                  dense
                  stack-label
                  hide-bottom-space
                  style="width: 15%"
                  class="q-pa-none q-ma-none"
                >
                </q-input>
                <q-input
                  v-if="line"
                  v-model="line.reps"
                  :label="indexLine === 0 ? 'Reps' : ''"
                  readonly
                  dense
                  stack-label
                  hide-bottom-space
                  style="width: 10%"
                  class="q-pa-none q-ma-none"
                ></q-input>
                <q-input
                  v-if="line"
                  v-model="line.sets"
                  :label="indexLine === 0 ? 'Sets' : ''"
                  readonly
                  dense
                  stack-label
                  hide-bottom-space
                  style="width: 10%"
                  class="q-pa-none q-ma-none"
                ></q-input>
                <q-input
                  v-if="line"
                  v-model="line.rpe"
                  :label="indexLine === 0 ? 'Rpe' : ''"
                  readonly
                  dense
                  stack-label
                  hide-bottom-space
                  style="width: 10%"
                  class="q-mx-xs q-px-xs"
                ></q-input>

                <div class="row justify-end items-end q-pa-none q-ma-none">
                  <q-btn
                    v-if="exercise.schemaNote[indexLine]"
                    flat
                    color="info"
                    icon="sym_o_info"
                    class="q-mx-xs q-px-xs"
                  >
                    <q-tooltip
                      anchor="top middle"
                      self="bottom middle"
                      :offset="[10, 10]"
                    >
                      {{ exercise.schemaNote[indexLine] ?? "" }}
                    </q-tooltip>
                  </q-btn>

                  <q-btn
                    icon="sym_o_message"
                    :color="lineTextFeedbacks[indexLine] ? 'primary' : 'light'"
                    flat
                    class="q-mx-xs q-px-xs"
                    @click.stop="
                      showNoteTooltip[indexLine] = !showNoteTooltip[indexLine]
                    "
                  >
                    <q-badge
                      v-if="
                        exercise.textFeedback[indexLine] &&
                        !lineTextFeedbacks[indexLine]
                      "
                      floating
                      rounded
                      color="light"
                      class="q-mr-xs q-mt-xs"
                    >
                    </q-badge>
                    <q-popup-edit
                      style="width: 70%"
                      v-model="lineTextFeedbacks[indexLine]"
                      v-slot="scope"
                    >
                      <os-input autofocus type="textarea" v-model="scope.value">
                      </os-input>

                      <q-btn
                        class="full-width"
                        @click.stop="saveExerciseFeedback()"
                        @click.stop.prevent="scope.set"
                        >Save Comment</q-btn
                      >
                    </q-popup-edit>
                  </q-btn>

                  <q-btn
                    icon="sym_o_videocam"
                    flat
                    color="light"
                    class="q-mx-xs q-px-xs"
                    @click.stop="
                      showVideoTooltip[indexLine] = !showVideoTooltip[indexLine]
                    "
                  >
                    <q-badge
                      v-if="exercise.videoFeedback[indexLine]"
                      floating
                      rounded
                      color="light"
                      class="q-mr-sm q-mt-xs"
                    >
                    </q-badge>
                    <q-tooltip
                      v-if="exercise.videoFeedback[indexLine]"
                      anchor="top middle"
                      self="bottom middle"
                      :offset="[10, 10]"
                    >
                      Il tuo coach ha richiesto un video per questa serie
                    </q-tooltip>
                    <q-tooltip
                      v-else
                      anchor="top middle"
                      self="bottom middle"
                      :offset="[10, 10]"
                    >
                      Non è stato richiesto un video per questa serie
                    </q-tooltip>
                  </q-btn>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </template>
    </q-expansion-item>
  </q-card>
</template>

<script setup lang="ts">
import { AthleteFeedbackExercise } from "@/helpers/programs/athleteFeedback";
import { ProgramFrozenLine } from "@/helpers/programs/program";
import { computed, ref } from "vue";

// Init plugin

// Define props
const props = defineProps<{
  exercise: {
    uid: string;
    exerciseName: string;
    variantName: string;
    note?: string;
    schema: string[];
    lines: ProgramFrozenLine[] | undefined;
    schemaNote: string[];
    textFeedback: boolean[];
    videoFeedback: boolean[];
  };
}>();

// Define emit
const emit = defineEmits<{
  exerciseFeedbackSaved: [feedbackExercise: AthleteFeedbackExercise];
}>();

// Set ref
const showNoteTooltip = ref<boolean[]>([]);
const showVideoTooltip = ref<boolean[]>([]);
const exerciseDone = ref<boolean | undefined>(undefined);
const lineTextFeedbacks = ref<string[]>([]);

if (props.exercise.lines) {
  lineTextFeedbacks.value = Array(props.exercise.lines.length).fill(undefined);
}

// TODO: check here why lineTextFeedback[idx] is always undefined
const exerciseFeedback = computed(() => {
  const feedbacks = [...lineTextFeedbacks.value];

  const exFeedback: AthleteFeedbackExercise = {
    uid: props.exercise.uid,
    exerciseName: props.exercise.exerciseName,
    variantName: props.exercise.variantName,
    isExerciseDone: exerciseDone.value,
    lineFeedbacks:
      props.exercise.lines?.map((line, idx) => ({
        athleteLoadFeedback: undefined, //TODO: update for 2nd communication release
        athleteRepsFeedback: undefined,
        athleteSetsFeedback: undefined,
        athleteRpeFeedback: undefined,
        athleteTextFeedback: feedbacks[idx],
        athleteVideoFeedback: undefined,
      })) || [],
  };

  return exFeedback;
});

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
  }
  saveExerciseFeedback();
}

function saveExerciseFeedback() {
  emit("exerciseFeedbackSaved", exerciseFeedback.value);
}
</script>

<style scoped lang="scss">
.color-border {
  border: 2px solid $primary;
}

.os-completed,
.os-dontdo {
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

.os-dontdo::after {
  content: "Non lo svolgerò";
  background: $negative;
  animation: os-dontdo-animation 2s ease-in-out 1;
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

@keyframes os-dontdo-animation {
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
