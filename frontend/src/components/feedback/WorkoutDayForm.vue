<template>
  <!-- TODO: i18n for all the component -->
  <q-card
    class="q-pa-sm items-center justify-between"
    :class="{
      'cursor-pointer row': dayShowCollapsed,
    }"
    @click="dayShowCollapsed = false"
  >
    <!-- Day title and info -->
    <div class="row items-center q-col-gutter-lg">
      <h4 class="q-my-none">
        {{
          `${$t("coach.program_management.builder.week_name", {
            week: props.block.weekName,
          })} - ${$t("coach.program_management.builder.day_name", {
            day: props.block.dayName,
          })}`
        }}
      </h4>

      <q-icon
        v-if="dayShowCollapsed"
        name="sym_o_check"
        size="sm"
        color="positive"
      ></q-icon>
    </div>

    <!-- Show exercise info if required -->
    <div v-if="!dayShowCollapsed">
      <!-- Show single exercise cards -->
      <WorkoutExerciseForm
        v-for="(exercise, indexExerc) in block.exercises"
        :key="indexExerc"
        :exercise="exercise"
        @exerciseFeedbackSaved="updateExerciseFeedbacks"
        :class="{ 'os-next-exercise': indexExerc == nextExIdx }"
        :style="indexExerc == nextExIdx ? 'margin-top: 2em' : ''"
      ></WorkoutExerciseForm>

      <div class="row q-py-md">
        <os-input-date
          v-model="workoutDate"
          label="Data allenamento"
          class="col-12"
        />
        <os-input
          v-model="workoutNote"
          type="textarea"
          label="Feedback sulla sessione"
          class="col-12"
        />
        <q-btn
          class="col-12"
          @click.stop="
            athleteDayFeedback.athleteHasDone = true;
            saveDayFeedback();
            dayShowCollapsed = true;
          "
          label="Salva allenamento"
        />
      </div>
    </div>

    <!-- Otherwise show expansion button -->
    <q-btn v-else icon="expand_more" flat></q-btn>
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
  completed: boolean;
}>();

// Define emit
const emit = defineEmits<{
  dayFeedbackSaved: [feedbackDay: AthleteFeedbackDay];
}>();

// Set ref
const workoutDate = ref<Date>(new Date());
const workoutNote = ref<string>();
const dayShowCollapsed = ref<boolean>(false);

const athleteDayFeedback = ref<AthleteFeedbackDay>({
  weekName: props.block.weekName,
  dayName: props.block.dayName,
  athleteHasDone: props.completed,
  athleteWorkoutNote: workoutNote.value,
  athleteWorkoutDate: workoutDate.value,

  exercises: props.block.exercises.map((exercise, idx) => ({
    uid: exercise.uid,
    exerciseName: exercise.exerciseName,
    variantName: exercise.variantName,
    isExerciseDone: props.feedback?.exercises[idx].isExerciseDone,
    lineFeedbacks: props.feedback?.exercises[idx].lineFeedbacks ?? [],
  })),
});

const nextExIdx = computed(() =>
  athleteDayFeedback.value.exercises.findIndex((exercise) => {
    return exercise.isExerciseDone == undefined;
  }),
);

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
  athleteDayFeedback.value.exercises = athleteDayFeedback.value.exercises.map(
    (exercise) => {
      if (exercise.uid === feedbackExercise.uid) return feedbackExercise;
      return exercise;
    },
  );
}
</script>

<style scoped lang="scss">
.color-border {
  border: 2px solid $primary;
}

// TODO
.os-next-exercise {
  border: 3px solid $primary;

  &::after {
    content: "Prossimo esercizio!";
    color: white;
    font-weight: bold;
    position: absolute;
    top: 0;
    left: -2px;
    transform: translateY(-100%);
    background: $primary;
    border-radius: 10px 10px 0 0;
    padding: 2px 10px;
  }
}
</style>
