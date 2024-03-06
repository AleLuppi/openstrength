<template>
  <q-form
    ref="formElement"
    @submit="onSubmit"
    @reset="onReset"
    class="q-my-md q-gutter-sm column"
  >
    <q-card-section class="q-gutter-x-xs">
      <!-- Exercise name -->
      <os-select
        v-model="maxliftExercise"
        :label="$t('coach.maxlift_management.fields.exercise')"
        :options="exercises.map((exercise) => exercise.name)"
        dense
        required
      />

      <!-- Max lift type -->
      <os-select
        v-model="maxliftType"
        :label="$t('coach.maxlift_management.fields.type')"
        :options="Object.values(MaxLiftType)"
        required
      />

      <!-- Max lift value -->
      <os-input
        v-model="maxliftValue"
        :suffix="maxliftValueSuffix"
        :label="$t('coach.maxlift_management.fields.value')"
        type="number"
        step="0.01"
        min="0.0"
        required
      ></os-input>

      <!-- Display estimated 1RM -->
      <os-input
        v-if="showEstimated1RM"
        :model-value="maxliftEstimated1RMValue"
        :suffix="maxliftValueSuffix"
        :label="$t('coach.maxlift_management.fields.estimated1rm')"
        readonly
      >
        <template v-slot:after>
          <q-icon name="sym_o_help" class="cursor-pointer">
            <q-tooltip>
              {{
                maxliftSelectedExercise?.defaultVariant?.loadType &&
                [ExerciseLoadType.loaded, ExerciseLoadType.bodyweight].includes(
                  maxliftSelectedExercise?.defaultVariant?.loadType,
                )
                  ? athlete?.weight
                    ? $t(
                        "coach.maxlift_management.computation.estimated1rm_with_weight",
                        {
                          athlete: athlete?.name,
                          weight: athlete?.weight,
                        },
                      )
                    : $t(
                        "coach.maxlift_management.computation.estimated1rm_with_default_weight",
                        {
                          athlete: athlete?.name,
                        },
                      )
                  : $t(
                      "coach.maxlift_management.computation.estimated1rm_no_weight",
                      {
                        athlete: props.athlete?.name,
                      },
                    )
              }}
            </q-tooltip>
          </q-icon>
        </template></os-input
      >

      <!-- Performance date -->
      <os-input-date
        v-model="maxliftDate"
        :label="$t('coach.maxlift_management.fields.date')"
        :placeholder="dateGetLocaleFormat()"
        required
      ></os-input-date>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat :label="$t('common.cancel')" type="reset" />
      <q-btn
        :label="$t('coach.maxlift_management.list.add_proceed')"
        type="submit"
      />
    </q-card-actions>
  </q-form>
</template>

<script setup lang="ts">
import { ref, computed, watch, PropType } from "vue";
import { QForm } from "quasar";
import { dateGetLocaleFormat, dateGetWithoutTimezone } from "@/helpers/scalar";
import { Exercise, ExerciseLoadType } from "@/helpers/exercises/exercise";
import { MaxLift, MaxLiftType } from "@/helpers/maxlifts/maxlift";
import { estimate1RMfromNRM } from "@/helpers/charts/chartDatasetComputations";
import { AthleteUser } from "@/helpers/users/user";
import { getMaxliftUnit } from "@/helpers/maxlifts/utils";

// Set props
const props = defineProps({
  maxlift: {
    type: MaxLift,
    required: false,
  },
  athlete: {
    type: AthleteUser,
    required: false,
  },
  exercises: {
    type: Array as PropType<Exercise[]>,
    default: () => [],
  },
});

// Set emits
const emit = defineEmits<{
  submit: [value: MaxLift];
  reset: [];
}>();

// Set expose
defineExpose({
  focus: () => formElement.value?.focus(),
  validate: (shouldFocus?: boolean) => formElement.value?.validate(shouldFocus),
  resetValidation: () => formElement.value?.resetValidation(),
  submit: (evt?: Event) => formElement.value?.submit(evt),
  reset: (evt?: Event) => formElement.value?.reset(evt),
  getValidationComponents: () => formElement.value?.getValidationComponents(),
});

// Set ref
const formElement = ref<QForm>();
const maxliftExercise = ref<string>();
const maxliftType = ref<MaxLiftType>();
const maxliftValue = ref<string>();
const maxliftDate = ref<Date>();

// Get values to display estimated 1RM
const maxliftEstimated1RMValue = computed(() =>
  computeE1RM(
    maxliftValue.value,
    maxliftType.value,
    maxliftSelectedExercise.value,
  ),
);
const showEstimated1RM = computed(
  () =>
    (props.maxlift?.athlete || props.athlete) &&
    maxliftEstimated1RMValue.value != undefined,
);

// Setup variables according to selected maxlift
watch(
  () => props.maxlift,
  () => {
    maxliftExercise.value = props.maxlift?.exercise?.name;
    maxliftType.value = props.maxlift?.type;
    maxliftValue.value = props.maxlift?.value;
    maxliftDate.value = props.maxlift?.performedOn ?? new Date();
  },
  { immediate: true },
);

// Retrieve selected exercise
const maxliftSelectedExercise = computed(() =>
  props.exercises.find((exercise) => exercise.name == maxliftExercise.value),
);

// Gather correct suffix for current selection
const maxliftValueSuffix = computed(() => getMaxliftUnit(maxliftType.value));

/**
 * Calculate estimate of 1RM value.
 *
 * @param value max lift value.
 * @param type max lift type.
 * @param exercise max lift exercise.
 */
function computeE1RM(value?: string, type?: MaxLiftType, exercise?: Exercise) {
  const maxliftObj = new MaxLift();
  maxliftObj.athlete = props.athlete ?? props.maxlift?.athlete;
  maxliftObj.exercise = exercise ?? props.maxlift?.exercise;
  maxliftObj.value = value;
  maxliftObj.type = type;

  return estimate1RMfromNRM(maxliftObj);
}

/**
 * Perform operations on form submit.
 */
function onSubmit() {
  const maxlift = props.maxlift ?? new MaxLift();
  maxlift.exercise = maxliftSelectedExercise.value;
  maxlift.type = maxliftType.value;
  maxlift.value = maxliftValue.value;
  maxlift.performedOn = dateGetWithoutTimezone(maxliftDate.value);
  if (props.athlete) maxlift.athlete = props.athlete;

  emit("submit", maxlift);
}

/**
 * Perform operations on form reset.
 */
function onReset() {
  maxliftExercise.value = undefined;
  maxliftType.value = undefined;
  maxliftValue.value = undefined;
  maxliftDate.value = undefined;

  emit("reset");
}
</script>
