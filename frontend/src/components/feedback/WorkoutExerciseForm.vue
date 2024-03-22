<template>
  <q-card
    :class="{
      'os-completed': exerciseDone,
    }"
    class="q-mb-sm"
  >
    <!-- TODO: i18n for all the component-->
    <q-expansion-item
      :model-value="readonly || !exerciseDone"
      @update:model-value="toggleDone"
      hide-expand-icon
      :header-class="{
        'bg-green-3 ': exerciseDone,
      }"
    >
      <template #header>
        <div class="q-py-sm full-width">
          <div class="row items-center justify-between">
            <p class="text-bold">
              {{
                props.exercise.exerciseName + ' ' + props.exercise.variantName
              }}
            </p>

            <q-btn
              size="xs"
              icon="check"
              :color="exerciseDone ? 'positive' : 'primary'"
              round
              :outline="!exerciseDone"
            ></q-btn>
          </div>

          <p class="text-italic">
            {{ props.exercise.note }}
          </p>
        </div>
      </template>

      <template #default>
        <q-card-section>
          <!-- Show schema or line data -->
          <div
            v-for="(line, indexLine) in props.exercise.lines"
            :key="indexLine"
            class="row justify-between items-center q-pa-none"
          >
            <!-- Show line values -->
            <q-input
              v-for="kind in lineValueTypes"
              :key="kind"
              v-model="line[kind]"
              :label="indexLine === 0 ? lineValueLabels[kind] : ''"
              readonly
              dense
              stack-label
              hide-bottom-space
              :style="{ width: kind == 'load' ? '15%' : '10%' }"
              class="q-pa-none q-ma-none"
            />

            <div class="row items-center q-pa-none q-ma-none">
              <!-- Show line note from coach -->
              <q-btn
                flat
                color="info"
                icon="sym_o_info"
                class="q-mx-xs q-px-xs"
                :style="{
                  visibility: exercise.schemaNote[indexLine]
                    ? 'visible'
                    : 'hidden',
                }"
                @click="
                  showInfoTooltip[indexLine] = !showInfoTooltip[indexLine]
                "
                @touchend.prevent="
                  showInfoTooltip[indexLine] = !showInfoTooltip[indexLine]
                "
                @mouseenter="showInfoTooltip[indexLine] = true"
                @mouseleave="showInfoTooltip[indexLine] = false"
              >
                <q-tooltip
                  v-model="showInfoTooltip[indexLine]"
                  anchor="top middle"
                  self="bottom middle"
                  :offset="[10, 10]"
                  class="bg-lighter bordered text-xs"
                  no-parent-event
                >
                  {{ exercise.schemaNote[indexLine] }}
                </q-tooltip>
              </q-btn>

              <!-- Show required text feedback -->
              <q-btn
                icon="sym_o_message"
                :color="lineTextFeedbacks[indexLine] ? 'primary' : 'light'"
                flat
                class="q-mx-xs q-px-xs"
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
                    exercise.videoFeedback[indexLine]
                      ? 'Il tuo coach ha richiesto un feedback su questa serie'
                      : 'Non è necessario dare un feedback su questa serie'
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
                      ? 'Il tuo coach ha richiesto un video per questa serie'
                      : 'Non è stato richiesto un video per questa serie'
                  }}
                </q-tooltip>
              </q-btn>
            </div>
          </div>
        </q-card-section>
      </template>
    </q-expansion-item>
  </q-card>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import mixpanel from 'mixpanel-browser';
import { ProgramExerciseFeedback } from 'src/helpers/programs/models';
import { ProgramFrozenView } from 'src/helpers/programs/program';
import { stringCapitalize } from 'src/helpers/scalar';

// Define props
const props = withDefaults(
  defineProps<{
    // current feedback on exercise by athlete
    modelValue: ProgramExerciseFeedback | undefined;

    // frozen program exercise info
    exercise: ProgramFrozenView['weekdays'][number]['exercises'][number];

    //
    readonly: boolean;
  }>(),
  { readonly: false }
);

// Define emit
const emit = defineEmits<{
  'update:modelValue': [value: ProgramExerciseFeedback];
}>();

// Set ref
const exerciseDone = ref<boolean | undefined>(undefined); // whether exercise has been completed
const lineTextFeedbacks = ref<string[]>([]); // store text feedbacks
const showInfoTooltip = ref<boolean[]>([]); // whether to show info tooltip for each line

// Set constant values
const lineValueTypes: ('load' | 'reps' | 'sets' | 'rpe')[] = [
  'load',
  'reps',
  'sets',
  'rpe',
];
const lineValueLabels = Object.fromEntries(
  lineValueTypes.map((val) => [val, stringCapitalize(val)])
);

// Initialize exercise completed
watch(
  () => props.modelValue,
  (val) => {
    exerciseDone.value = val?.completed ?? false;
    lineTextFeedbacks.value =
      val?.linesFeedback.map(
        (lineFeedback) => lineFeedback.textFeedback ?? ''
      ) ?? [];
  },
  {
    immediate: true,
  }
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
          loadFeedback: undefined, // TODO: update in 2nd communication release
          repsFeedback: undefined,
          setsFeedback: undefined,
          rpeFeedback: undefined,
          textFeedback: lineTextFeedbacks.value[idx],
          videoFeedback: undefined,
        };
      }) || [],
  };
  emit('update:modelValue', exerciseFeedback);

  // Mixpanel tracking
  mixpanel.track('Athlete Feedback on exercise', {
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
  window.addEventListener('scroll', resetTooltips);
});

onUnmounted(() => {
  window.addEventListener('scroll', resetTooltips);
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
  content: 'Completato';
  background: $positive;
  animation: os-completed-animation 2s ease-in-out 1;
}

.os-wontdo::after {
  content: 'Non lo svolgerò';
  background: $negative;
  animation: os-wontdo-animation 2s ease-in-out 1;
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
