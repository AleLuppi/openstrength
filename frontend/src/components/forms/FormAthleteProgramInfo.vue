<template>
  <q-form ref="formElement" @submit="onSubmit">
    <!-- Actual programs -->
    <div>
      <h6>Active Program</h6>
      <div class="q-mb-md">
        <q-btn
          :to="{ name: 'program', params: { programId: 123456 } }"
          label="Link to Program"
        ></q-btn>

        <!-- <q-btn label="Modify Current">
          <router-link
            exact
            :to="{ name: 'program', params: { userId: 123 } }"
            class="absolute full-width full-height"
          ></router-link>
        </q-btn> -->

        <q-btn outline label="Modify current" class="q-mx-sm"></q-btn>
        <q-btn outline label="Create new"></q-btn>
      </div>

      <div class="row q-col-gutter-x-md">
        <!-- Program name -->
        <os-input
          v-model="programName"
          :label="$t('coach.athlete_management.fields.program_name')"
        />
        <!-- Start date -->
        <os-input
          v-model="programStartedOn"
          :label="$t('coach.athlete_management.fields.program_start')"
          class="col-3"
        />
        <!-- End date -->
        <os-input
          v-model="programFinishedOn"
          :label="$t('coach.athlete_management.fields.program_finish')"
          class="col-3"
        />
      </div>

      <!-- Program description -->
      <os-input
        v-model="programDescription"
        type="textarea"
        :label="$t('coach.athlete_management.fields.program_description')"
      />
      <q-btn
        type="submit"
        :label="$t('coach.athlete_management.fields.update')"
        class="full-width"
      ></q-btn>
    </div>
  </q-form>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import type QForm from "quasar";
import { useQuasar } from "quasar";
import { Program } from "@/helpers/programs/program";

// Init plugin
const $q = useQuasar();
const i18n = useI18n();

// Set props
const props = defineProps({
  program: {
    type: Program,
    required: true,
  },
  onSubmit: {
    type: Function,
  },
});

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
const programName = ref<string>();
const programStartedOn = ref<Date>();
const programFinishedOn = ref<Date>();
const programDescription = ref<string>();

// Update shown info according to selected variant
watch(
  () => props.program,
  (program: Program | undefined) => {
    if (program) {
      programName.value = program.name;
      programStartedOn.value = program.startedOn;
      programFinishedOn.value = program.finishedOn;
      programDescription.value = program.description;
    }
  },
  { immediate: true },
);

/**
 * Perform operations on form submit.
 */

function onSubmit() {
  const program = props.program;
  program.name = programName.value;
  program.startedOn = programStartedOn.value;
  program.finishedOn = programFinishedOn.value;
  program.description = programDescription.value;

  props.onSubmit?.(program);

  program.saveUpdate({
    onSuccess: () => {
      $q.notify({
        type: "positive",
        message: i18n.t("coach.athlete_management.list.add_succeed"),
        position: "bottom",
      });
    },
    onError: () => {
      $q.notify({
        type: "negative",
        message: i18n.t("coach.athlete_management.list.add_error"),
        position: "bottom",
      });
    },
  });
}
</script>
