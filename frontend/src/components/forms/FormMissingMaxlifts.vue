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
          v-model="maxlift.value"
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
import { ref, watch } from "vue";
import type { QForm } from "quasar";
import type { MaxLift } from "@/helpers/maxlifts/maxlift";
import { getMaxliftUnit } from "@/helpers/maxlifts/utils";

// Set props
const props = defineProps<{ maxlifts: MaxLift[]; clone?: boolean }>();

// Set emits
const emit = defineEmits<{
  submit: [maxlifts: MaxLift[]];
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
const maxlifts = ref<MaxLift[]>([]); // maxlifts that shall be updated
const formElement = ref<QForm>(); // form element

// Update maxlifts to input ones
watch(
  props.maxlifts,
  (inMaxlifts) => {
    maxlifts.value = props.clone
      ? inMaxlifts.map((maxlift) => maxlift.duplicate(true))
      : inMaxlifts;
  },
  { immediate: true },
);

/**
 * Perform operations on form submit.
 */
function onSubmit() {
  emit("submit", maxlifts.value);
}

/**
 * Perform operations on form reset.
 */
function onReset() {
  emit("reset");
}
</script>
