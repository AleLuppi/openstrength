<template>
  <!-- TODO: i18n for all the component -->
  <q-card
    class="q-pa-sm items-center justify-between"
    :class="{
      'cursor-pointer row': dayShowCollapsed,
      'border-primary': modelValue?.completed,
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
        v-if="modelValue?.completed"
        :name="symOutlinedCheck"
        size="sm"
        color="primary"
      ></q-icon>
    </div>

    <!-- Show exercise info if required -->
    <div v-if="!dayShowCollapsed">
      <div v-if="!readonly && !unlockedFeedback" class="text-center q-py-md">
        <p class="text-bold">Pronto a iniziare questo giorno?</p>
        <q-btn
          label="Inizia allenamento"
          @click="unlockedFeedback = true"
          rounded
        />
      </div>

      <!-- Show single exercise cards -->
      <WorkoutExerciseForm
        v-for="(exercise, idxExercise) in programDay.exercises"
        :key="idxExercise"
        v-model="dayFeedback.exercisesFeedback[idxExercise]"
        :exercise="exercise"
        :class="{
          'os-next-exercise': isNext && idxExercise == nextExerciseIdx,
        }"
        :readonly="readonly || !unlockedFeedback"
      />

      <div class="row q-py-md">
        <os-input-date
          v-model="workoutDate"
          label="Data allenamento"
          :readonly="readonly"
        />
        <os-input
          v-model="workoutNote"
          type="textarea"
          label="Feedback sulla sessione"
          class="col-12"
          :readonly="readonly"
        />
        <q-btn
          class="col-12"
          :label="
            readonly
              ? 'Chiudi'
              : modelValue?.completed
              ? 'Salva modifiche'
              : 'Salva allenamento'
          "
          @click.stop="completeDay()"
        />
        <q-btn
          v-if="!readonly && modelValue?.completed"
          class="q-mt-md col-12"
          flat
          label="Segna come non completato"
          @click.stop="completeDay(false)"
        />
      </div>
    </div>

    <!-- Otherwise show expansion button -->
    <q-btn v-else icon="expand_more" color="primary" flat></q-btn>
  </q-card>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch } from "vue";
import { debounce, scroll } from "quasar";
import mixpanel from "mixpanel-browser";
import { symOutlinedCheck } from "@quasar/extras/material-symbols-outlined";
import { ProgramFrozenView } from "@/helpers/programs/program";
import { ProgramDayFeedback } from "@/helpers/programs/models";

// Import components
const WorkoutExerciseForm = defineAsyncComponent(
  () => import("@/components/feedback/WorkoutExerciseForm.vue"),
);

// Define props
const props = withDefaults(
  defineProps<{
    // single frozen program day
    programDay: ProgramFrozenView["weekdays"][number];

    // current feedback on the day
    modelValue: ProgramDayFeedback | undefined;

    // force day to be shown as collapsed
    showCollapsed?: boolean;

    // set if day is next to be done in program
    isNext?: boolean;

    // whether to show component for reading only and not update
    readonly?: boolean;
  }>(),
  { showCollapsed: false, isNext: false, readonly: false },
);

// Define emit
const emit = defineEmits<{
  "update:modelValue": [value: ProgramDayFeedback];
  complete: [];
}>();

// Set ref
const workoutDate = ref<Date>(new Date()); // day on which exercises have been performed
const workoutNote = ref<string>(""); // optional feedback text on the day
const dayShowCollapsed = ref<boolean>(props.showCollapsed); // whether to show collapsed day
const dayFeedback = ref<ProgramDayFeedback>({
  weekName: props.programDay.weekName,
  dayName: props.programDay.dayName,
  completed: false,
  exercisesFeedback: [],
}); // feedback on program day
const unlockedFeedback = ref<boolean>(false);

// Find which is the next exercise athlete should perform
const nextExerciseIdx = computed(() =>
  dayFeedback.value.exercisesFeedback.findIndex((exercise) => {
    return !exercise.completed && exercise.willComplete != false;
  }),
);

// Show day expanded or collapsed following requests from parent
watch(
  () => props.showCollapsed,
  (newValue) => (dayShowCollapsed.value = newValue),
  { immediate: true },
);

// Update internal model to input model value
watch(
  () => props.modelValue,
  (value) => {
    dayFeedback.value = value ?? {
      weekName: props.programDay.weekName,
      dayName: props.programDay.dayName,
      completed: false,
      exercisesFeedback: props.programDay.exercises.map((exercise) => ({
        exerciseName: exercise.exerciseName,
        variantName: exercise.variantName,
        completed: false,
        willComplete: true,
        linesFeedback:
          exercise.lines?.map(() => {
            return {
              loadFeedback: undefined,
              repsFeedback: undefined,
              setsFeedback: undefined,
              rpeFeedback: undefined,
              textFeedback: undefined,
              videoFeedback: undefined,
              setsPerformed: undefined,
            };
          }) || [],
      })),
    };

    workoutDate.value = value?.completedOn ?? new Date();
    workoutNote.value = value?.textFeedback ?? "";
  },
  { immediate: true },
);

/**
 * Save feedback with debounce.
 */
const saveFeedback = debounce(() => {
  completeDay(dayFeedback.value.completed);
}, 10000);

// Save feedback when updated, after a debounce
watch(
  dayFeedback,
  () => {
    if (!props.readonly && unlockedFeedback.value) saveFeedback();
  },
  { deep: true },
);

/**
 * Emit daily feedback.
 *
 * @param [completed=true] whether day can be considered completed by athlete.
 */
function completeDay(completed = true) {
  if (!props.readonly) {
    // Update feedback if not in read only mode
    const wasCompleted = dayFeedback.value.completed;
    dayFeedback.value.completed = completed;
    dayFeedback.value.completedOn = completed ? workoutDate.value : undefined;
    dayFeedback.value.textFeedback = workoutNote.value;
    if (completed) {
      emit("complete");

      // Mixpanel tracking
      mixpanel.track("Athlete Feedback: Day completed", {
        Feedback: workoutNote.value,
      });

      // Scroll to top
      if (!wasCompleted) scroll.setVerticalScrollPosition(window, 0, 300);
    }
    emit("update:modelValue", dayFeedback.value);
    saveFeedback.cancel();
  } else {
    dayShowCollapsed.value = completed;
  }
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
