<template>
  <q-card
    v-if="dayShowCollapsed === undefined || dayShowCollapsed === false"
    class="q-pa-sm"
  >
    <div class="row justify-between">
      <h4>
        {{
          `${$t("coach.program_management.builder.week_name", {
            week: props.block.weekName,
          })} - ${$t("coach.program_management.builder.day_name", {
            day: props.block.dayName,
          })}`
        }}
      </h4>
    </div>

    <div class="row col-12">
      <os-input-date
        v-model="workoutDate"
        label="Data allenamento"
        class="col-12 q-mb-none"
      >
      </os-input-date>
    </div>

    <!-- Show single exercise cards -->
    <div v-for="(exercise, indexExerc) in block.exercises" :key="indexExerc">
      <q-card
        :class="
          exerciseShowDone[indexExerc] ? 'q-mb-sm color-border' : 'q-mb-sm '
        "
      >
        <q-card-section>
          <div class="column">
            <div class="row justify-between">
              <p>
                <b> {{ exercise.exerciseName + " " + exercise.variantName }}</b>
              </p>

              <div>
                <q-btn
                  size="xs"
                  icon="check"
                  :color="exerciseShowDone[indexExerc] ? 'primary' : 'light'"
                  round
                  :outline="!exerciseShowDone[indexExerc]"
                  @click="
                    () =>
                      (exerciseShowDone[indexExerc] =
                        !exerciseShowDone[indexExerc])
                  "
                ></q-btn>
              </div>
            </div>

            <p>
              <i>{{ exercise.note }}</i>
            </p>
          </div>
        </q-card-section>
        <q-card-section>
          <!-- Show schema or line data -->
          <div
            v-for="(line, indexLine) in exercise.lines"
            :key="indexLine"
            class="row col-12 justify-between items-center q-pa-none"
          >
            <div>
              <div
                class="row justify-between q-pa-none q-ma-none"
                style="width: 100%"
              >
                <q-input
                  v-if="exercise.lines"
                  v-model="exercise.lines[indexLine].load"
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
                  v-if="exercise.lines"
                  v-model="exercise.lines[indexLine].reps"
                  :label="indexLine === 0 ? 'Reps' : ''"
                  readonly
                  dense
                  stack-label
                  hide-bottom-space
                  style="width: 10%"
                  class="q-pa-none q-ma-none"
                ></q-input>
                <q-input
                  v-if="exercise.lines"
                  v-model="exercise.lines[indexLine].sets"
                  :label="indexLine === 0 ? 'Sets' : ''"
                  readonly
                  dense
                  stack-label
                  hide-bottom-space
                  style="width: 10%"
                  class="q-pa-none q-ma-none"
                ></q-input>
                <q-input
                  v-if="exercise.lines"
                  v-model="exercise.lines[indexLine].rpe"
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
                    :color="
                      exercise.textFeedback[indexLine] ? 'primary' : 'light'
                    "
                    flat
                    class="q-mx-xs q-px-xs"
                  >
                    <q-popup-edit
                      style="width: 70%"
                      v-model="setComment"
                      v-slot="scope"
                    >
                      <os-input autofocus type="textarea" v-model="scope.value">
                      </os-input>

                      <q-btn class="full-width" @click.stop.prevent="scope.set"
                        >Save Comment</q-btn
                      >
                    </q-popup-edit>
                  </q-btn>

                  <q-btn
                    icon="sym_o_videocam"
                    flat
                    :color="
                      exercise.videoFeedback[indexLine] ? 'primary' : 'light'
                    "
                    @click="showingVideo = true"
                    class="q-mx-xs q-px-xs"
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
    </div>

    <os-input
      v-model="sessionFeedback"
      type="textarea"
      label="Feedback sulla sessione"
    ></os-input>
    <q-btn class="full-width" @click="dayShowCollapsed = true">
      Salva allenamento
    </q-btn>
  </q-card>
  <q-card v-else class="color-border">
    <div class="row justify-between q-pa-sm">
      <h4>
        {{
          `${$t("coach.program_management.builder.week_name", {
            week: props.block.weekName,
          })} - ${$t("coach.program_management.builder.day_name", {
            day: props.block.dayName,
          })}`
        }}
      </h4>

      <q-btn icon="expand_more" flat @click="dayShowCollapsed = false"></q-btn>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { ProgramFrozenLine } from "@/helpers/programs/program";

// Init plugin

// Define props
const props = defineProps<{
  block: {
    weekName: string;
    dayName: string;
    exercises: {
      exerciseName: string;
      variantName: string;
      note?: string;
      schema: string[];
      lines: ProgramFrozenLine[] | undefined;
      schemaNote: string[];
      textFeedback: boolean[];
      videoFeedback: boolean[];
    }[];
  };
  dayShowDone: boolean;
}>();

const workoutDate = ref<Date>();
const sessionFeedback = ref<string>();
const setComment = ref<string>();
const showingVideo = ref<boolean>();

// Set card behavior
const dayShowCollapsed = ref<boolean>();
const exerciseDone = ref<boolean[]>([]);
const exerciseShowDone = computed(() => exerciseDone.value);
</script>

<style scoped lang="scss">
.color-border {
  border: 2px solid $primary; /* add a border */
}
</style>
