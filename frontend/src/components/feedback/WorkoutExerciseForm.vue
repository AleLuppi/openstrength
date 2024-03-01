<template>
  <q-card :class="exerciseDone ? 'q-mb-sm color-border' : 'q-mb-sm '">
    <q-card-section>
      <div class="column">
        <div class="row justify-between">
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
              icon="check"
              :color="exerciseDone ? 'primary' : 'light'"
              round
              :outline="!exerciseDone"
              @click="() => (exerciseDone = !exerciseDone)"
            ></q-btn>
          </div>
        </div>

        <p>
          <i>{{ props.exercise.note }}</i>
        </p>
      </div>
    </q-card-section>
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
                :color="exercise.textFeedback[indexLine] ? 'primary' : 'light'"
                flat
                class="q-mx-xs q-px-xs"
                @click="
                  showNoteTooltip[indexLine] = !showNoteTooltip[indexLine]
                "
              >
                <q-popup-edit
                  style="width: 70%"
                  v-model="lineTextFeedbacks[indexLine]"
                  v-slot="scope"
                >
                  <os-input autofocus type="textarea" v-model="scope.value">
                  </os-input>

                  <q-btn
                    class="full-width"
                    @click="saveExerciseFeedback()"
                    @click.stop.prevent="scope.set"
                    >Save Comment</q-btn
                  >
                </q-popup-edit>
              </q-btn>

              <q-btn
                icon="sym_o_videocam"
                flat
                :color="exercise.videoFeedback[indexLine] ? 'primary' : 'light'"
                class="q-mx-xs q-px-xs"
                @click="
                  showVideoTooltip[indexLine] = !showVideoTooltip[indexLine]
                "
              >
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
  </q-card>
</template>

<script setup lang="ts">
import { ProgramFrozenLine } from "@/helpers/programs/program";
import { computed, ref } from "vue";

// Init plugin

// Define props
const props = defineProps<{
  exercise: {
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

// Set ref
const showNoteTooltip = ref<boolean[]>([]);
const showVideoTooltip = ref<boolean[]>([]);

const exerciseDone = ref(false);
const lineTextFeedbacks = ref<string[]>([]);

const exerciseFeedback = computed(() => {
  const exFeedback = {
    exerciseName: props.exercise.exerciseName,
    variantName: props.exercise.variantName,
    isExerciseDone: exerciseDone.value,
    lineFeedbacks: props.exercise.lines?.map((line, idx) => ({
      athleteTextFeedback: lineTextFeedbacks.value[idx],
    })),
  };

  return exFeedback;
});

function saveExerciseFeedback() {
  //TODO: set emit to parent component
  console.log("exercise feedback", exerciseFeedback);
}
</script>

<style scoped lang="scss">
.color-border {
  border: 2px solid $primary;
}
</style>
