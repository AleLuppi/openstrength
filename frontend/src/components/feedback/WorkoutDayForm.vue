<template>
  <q-card
    v-if="dayShowCollapsed === undefined || dayShowCollapsed === false"
    class="q-pa-sm"
  >
    <!-- Day title and info -->
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
      <WorkoutExerciseForm :exercise="exercise"></WorkoutExerciseForm>
    </div>

    <os-input
      v-model="workoutNote"
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
import { ref } from "vue";
import { ProgramFrozenLine } from "@/helpers/programs/program";
import WorkoutExerciseForm from "./WorkoutExerciseForm.vue";

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

// Set UI behaviour
const workoutDate = ref<Date>();
const workoutNote = ref<string>();

const dayShowCollapsed = ref<boolean>();

/* function saveAthleteDayFeedback() {
  if (feedbackDay.value) {
    feedbackDay.value.weekName = props.block.weekName;
    feedbackDay.value.dayName = props.block.dayName;
    feedbackDay.value.athleteWorkoutDate = workoutDate.value;
    feedbackDay.value.athleteWorkoutNote = workoutNote.value;
    feedbackDay.value.athleteHasDone = isDayDone.value;

    feedbackDay.value.exercises = props.block.exercises.map(
      (exercise, indexExerc) => {
        const linesFeedback = exercise.lines?.map((line, index) => ({
          athleteLoadFeedback: line.load,
          athleteRepsFeedback: line.reps,
          athleteSetsFeedback: line.sets,
          athleteRpeFeedback: line.rpe,
          athleteTextFeedback: lineTextFeedbacks.value[index],
          athleteVideoFeedback: undefined,
        }));

        return {
          exerciseName: exercise.exerciseName,
          variantName: exercise.variantName,
          athleteHasDone: exerciseDone.value[indexExerc],
          linesFeedback: linesFeedback ?? [],
        };
      },
    );
  }

  console.log("feedback day", feedbackDay);
} */
</script>

<style scoped lang="scss">
.color-border {
  border: 2px solid $primary;
}
</style>
