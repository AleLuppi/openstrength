<template>
  <!-- TODO: i18n for all the component -->
  <q-card
    class="q-pa-sm items-center justify-between"
    :class="{
      'cursor-pointer row': dayShowCollapsed,
      'border-positive': modelValue?.completed,
    }"
    @click="dayShowCollapsed = false"
  >
    <!-- Day title and info -->
    <div class="row items-center q-col-gutter-lg">
      <h4 class="q-my-none">
        {{
          `${$t("coach.program_management.builder.week_name", {
            week: props.programDay.weekName,
          })} - ${$t("coach.program_management.builder.day_name", {
            day: props.programDay.dayName,
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
        v-for="(exercise, idxExercise) in programDay.exercises"
        :key="idxExercise"
        v-model="dayFeedback.exercisesFeedback[idxExercise]"
        :exercise="exercise"
        :class="{
          'os-next-exercise': isNext && idxExercise == nextExerciseIdx,
        }"
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
          @click.stop="completeDay"
          label="Salva allenamento"
        />
      </div>
    </div>

    <!-- Otherwise show expansion button -->
    <q-btn v-else icon="expand_more" color="positive" flat></q-btn>
  </q-card>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ProgramFrozenView } from "@/helpers/programs/program";
import WorkoutExerciseForm from "./WorkoutExerciseForm.vue";
import { ProgramDayFeedback } from "@/helpers/programs/models";

// Define props
const props = withDefaults(
  defineProps<{
    // single frozen program day
    programDay: ProgramFrozenView["weekdays"][number];

    // current feedback on the day
    modelValue: ProgramDayFeedback | undefined;

    // set if day is next to be done in program
    isNext: boolean;
  }>(),
  { isNext: false },
);

// Define emit
const emit = defineEmits<{
  "update:modelValue": [value: ProgramDayFeedback];
  complete: [];
}>();

// Set ref
const workoutDate = ref<Date>(new Date()); // day on which exercises have been performed
const workoutNote = ref<string>(""); // optional feedback text on the day
const dayShowCollapsed = ref<boolean>(false); // whether to show collapsed day

// FIXME
const dayFeedback = ref<ProgramDayFeedback>({
  weekName: props.programDay.weekName,
  dayName: props.programDay.dayName,
  completed: props.modelValue?.completed ?? false,
  textFeedback: workoutNote.value,
  completedOn: workoutDate.value,

  exercisesFeedback: props.programDay.exercises.map((exercise, idx) => ({
    uid: exercise.uid,
    exerciseName: exercise.exerciseName,
    variantName: exercise.variantName,
    completed: props.modelValue?.exercisesFeedback[idx].completed,
    linesFeedback: props.modelValue?.exercisesFeedback[idx].linesFeedback ?? [],
  })),
});

// Find which is the next exercise athlete should perform
const nextExerciseIdx = computed(() =>
  dayFeedback.value.exercisesFeedback.findIndex((exercise) => {
    return !exercise.completed && exercise.willComplete != false;
  }),
);

// Show day expanded or collapsed following requests from parent
watch(
  () => props.modelValue?.completed,
  (isCompleted) => (dayShowCollapsed.value = isCompleted ?? false),
  { immediate: true },
);

// Update internal model to input model value
watch(
  () => props.modelValue,
  (value) =>
    (dayFeedback.value = value ?? {
      weekName: props.programDay.weekName,
      dayName: props.programDay.dayName,
      completed: false,
      exercisesFeedback: [],
    }),
);

/**
 * Emit daily feedback.
 */
function completeDay() {
  dayShowCollapsed.value = true;
  dayFeedback.value.completed = true;
  dayFeedback.value.completedOn = new Date();
  emit("update:modelValue", dayFeedback.value);
  emit("complete");
}
</script>

<style scoped lang="scss">
/* Highlight next exercise */
/* TODO i18n */
.os-next-exercise {
  border: 3px solid $primary;
  margin-top: 2em;

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
