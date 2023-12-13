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
      >
      </os-select>

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
        mask="#####"
        required
      ></os-input>

      <!-- Performance date -->
      <os-input
        v-model="maxliftDate"
        :label="$t('coach.maxlift_management.fields.date')"
        placeholder="yyyy/mm/dd"
        outlined
        dense
        mask="date"
        :rules="['date']"
        required
      >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy
              cover
              transition-show="scale"
              transition-hide="scale"
            >
              <q-date v-model="maxliftDate">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </os-input>
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
import { dateGetWithoutTimezone } from "@/helpers/scalar";
import { Exercise } from "@/helpers/exercises/exercise";
import { MaxLift, MaxLiftType } from "@/helpers/maxlifts/maxlift";

// Set props
const props = defineProps({
  maxlift: {
    type: MaxLift,
    required: true,
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
const maxliftType = ref<string>();
const maxliftValue = ref<string>();
const maxliftDate = ref<string>();

// Setup variables according to selected maxlift
watch(
  () => props.maxlift,
  () => {
    maxliftExercise.value = props.maxlift.exercise?.name;
    maxliftType.value = props.maxlift.type;
    maxliftValue.value = props.maxlift.value;
    maxliftDate.value = props.maxlift.performedOn
      ? props.maxlift.performedOn
          .toISOString()
          .split("T")[0]
          .replaceAll("-", "/")
      : undefined;
    console.log(maxliftDate.value, typeof maxliftDate.value);
  },
  { immediate: true },
);

// Gather correct suffix for current selection
const maxliftValueSuffix = computed(() => {
  switch (maxliftType.value) {
    case MaxLiftType._1RM:
    case MaxLiftType._3RM:
    case MaxLiftType._5RM:
    case MaxLiftType._6RM:
    case MaxLiftType._8RM:
    case MaxLiftType._10RM:
      return "kg";
    case MaxLiftType._maxrep:
      return "reps";
    case MaxLiftType._maxtime:
      return "s";
    default:
      return "";
  }
});

/**
 * Perform operations on form submit.
 */
function onSubmit() {
  const maxlift = props.maxlift;
  maxlift.exercise = props.exercises.find(
    (exercise) => exercise.name == maxliftExercise.value,
  );
  maxlift.type = maxliftType.value as MaxLiftType;
  maxlift.value = maxliftValue.value;
  maxlift.performedOn = maxliftDate.value
    ? dateGetWithoutTimezone(maxliftDate.value)
    : undefined;

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
