<template>
  <!-- TODO: i18n for all the component -->
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
      <WorkoutExerciseForm
        :exercise="exercise"
        @exerciseFeedbackSaved="updateExerciseFeedbacks"
      ></WorkoutExerciseForm>
    </div>

    <os-input
      v-model="workoutNote"
      type="textarea"
      label="Feedback sulla sessione"
    ></os-input>
    <q-btn
      class="full-width"
      @click="
        athleteDayFeedback.athleteHasDone = true;
        saveDayFeedback();
        dayShowCollapsed = true;
      "
    >
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
import WorkoutExerciseForm from "./WorkoutExerciseForm.vue";
import {
  AthleteFeedbackDay,
  AthleteFeedbackExercise,
} from "@/helpers/programs/athleteFeedback";

// Init plugin

// Define props
const props = defineProps<{
  block: {
    weekName: string;
    dayName: string;
    exercises: {
      uid: string;
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
  feedback: AthleteFeedbackDay | undefined;
  dayShowDone: boolean;
}>();

// Define emit
const emit = defineEmits<{
  dayFeedbackSaved: [feedbackDay: AthleteFeedbackDay];
}>();

// Set ref
const workoutDate = ref<Date>();
const workoutNote = ref<string>();

const dayShowCollapsed = ref<boolean>();

const athleteDayFeedback = computed(() => {
  const feedbackDay: AthleteFeedbackDay = {
    weekName: props.block.weekName,
    dayName: props.block.dayName,
    athleteHasDone: props.dayShowDone,
    athleteWorkoutNote: workoutNote.value,
    athleteWorkoutDate: workoutDate.value,

    exercises: props.block.exercises.map((exercise, idx) => ({
      uid: exercise.uid,
      exerciseName: exercise.exerciseName,
      variantName: exercise.variantName,
      isExerciseDone: props.feedback?.exercises[idx].isExerciseDone ?? false,
      lineFeedbacks: props.feedback?.exercises[idx].lineFeedbacks ?? [],
    })),
  };
  return feedbackDay;
});

/**
 * Emit day feedback to program viewer
 */
function saveDayFeedback() {
  emit("dayFeedbackSaved", athleteDayFeedback.value);
}

/**
 * Update actual day feedbacks with exercise data from the emit of child component
 */
function updateExerciseFeedbacks(feedbackExercise: AthleteFeedbackExercise) {
  // Overwrite the actual exercise feedback with the received data from emit
  athleteDayFeedback.value?.exercises.forEach((exercise) => {
    if (exercise.uid === feedbackExercise.uid) {
      exercise = feedbackExercise;
    }
  });

  console.log("Received exercise feedback:", feedbackExercise);
  console.log("Updated complete day fb: ", athleteDayFeedback.value);
}
</script>

<style scoped lang="scss">
.color-border {
  border: 2px solid $primary;
}
</style>
