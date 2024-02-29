<template>
  <q-form
    ref="formElement"
    @submit="onSubmit"
    @reset="onReset"
    class="q-my-md q-gutter-sm"
  >
    <q-card-section class="q-gutter-x-xs">
      <div
        v-for="(maxlift, index) in maxlifts"
        :key="index"
        class="row justify-between items-center"
      >
        <!-- Exercise name -->
        <div class="row justify-start">
          <p class="q-mx-md">{{ maxlift.exercise?.name }}</p>
          <!-- Exercise type -->
          <p class="q-mr-md">{{ maxlift.type }}</p>
        </div>

        <!-- Max lift value -->
        <os-input
          v-model="maxliftValues[index]"
          :suffix="getMaxliftUnit(maxlift.type)"
          :label="$t('coach.maxlift_management.fields.value')"
          type="number"
          step="0.01"
          min="0.0"
          required
        ></os-input>
      </div>
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
import { ref, PropType } from "vue";
import { QForm } from "quasar";
import { MaxLift } from "@/helpers/maxlifts/maxlift";
import { getMaxliftUnit } from "@/helpers/maxlifts/utils";

// Set props
const props = defineProps({
  maxlifts: {
    type: Array as PropType<MaxLift[]>,
    required: true,
  },
});

// Set emits
const emit = defineEmits<{
  formSubmitted: [value: string[]];
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
const maxliftValues = ref<string[]>(
  props.maxlifts
    .map((maxlift) => maxlift.value)
    .filter((value): value is string => typeof value === "string"),
);

/**
 * Perform operations on form submit.
 */
function onSubmit() {
  emit("formSubmitted", maxliftValues.value);
}

/**
 * Perform operations on form reset.
 */
function onReset() {
  maxliftValues.value = [];
  emit("reset");
}
</script>
