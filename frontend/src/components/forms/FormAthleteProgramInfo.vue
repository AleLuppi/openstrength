<template>
  <q-form ref="formElement" @submit="onSubmit">
    <!-- Actual programs -->
    <div>
      <div class="row items-center justify-between q-mb-md">
        <q-btn
          outline
          :to="{ name: 'program', params: { programId: props.program.uid } }"
          icon="open_in_new"
          :label="$t('coach.athlete_management.call_to_action.modify_program')"
          class="q-mr-md"
          @click="registerProgramOpeningEvent()"
        ></q-btn>

        <q-badge
          v-if="props.isCurrent == true"
          :label="$t('coach.athlete_management.fields.program_active')"
          color="positive"
        />
      </div>

      <div class="row q-col-gutter-x-md">
        <!-- Program name -->
        <os-input
          v-model="programName"
          :label="$t('coach.athlete_management.fields.program_name')"
          class="col-12"
        />

        <!-- Start date -->
        <os-input-date
          v-model="programStartedOn"
          :label="$t('coach.athlete_management.fields.program_start')"
          class="col-6"
        ></os-input-date>

        <!-- End date -->
        <os-input-date
          v-model="programFinishedOn"
          :label="$t('coach.athlete_management.fields.program_finish')"
          class="col-6"
        ></os-input-date>
      </div>

      <!-- Program description -->
      <os-input
        v-model="programDescription"
        type="textarea"
        :label="$t('coach.athlete_management.fields.program_description')"
      />
      <q-btn
        type="submit"
        :label="$t('coach.athlete_management.fields.program_update')"
        class="full-width"
      ></q-btn>
    </div>
  </q-form>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { QForm } from "quasar";
import { useQuasar } from "quasar";
import { Program } from "@/helpers/programs/program";
import { event } from "vue-gtag";
import mixpanel from "mixpanel-browser";

// Init plugin
const $q = useQuasar();
const i18n = useI18n();

// Set props
const props = withDefaults(
  defineProps<{
    program: Program;
    isCurrent: boolean;
  }>(),
  { isCurrent: false },
);

// Define emits
const emit = defineEmits<{
  submit: [program: Program];
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

  emit("submit", program);

  program.saveUpdate({
    saveFrozenView: true,
    onSuccess: () => {
      $q.notify({
        type: "positive",
        message: i18n.t("coach.athlete_management.list.add_succeed"),
        position: "bottom",
      });

      // Register GA4 event
      event("athleteview_programinfo_updated", {
        event_category: "documentation",
        event_label: "Program info updated in AthleteView",
        value: 1,
      });

      // Mixpanel tracking
      mixpanel.track("Program Info Updated", {
        Page: "AthleteView",
        IsProgramDescriptionSet: program.description ? true : false,
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

/**
 * This method is only used to register the event related to button click
 */
function registerProgramOpeningEvent() {
  // Register GA4 event
  event("athleteview_program_open", {
    event_category: "documentation",
    event_label: "Program opened from AthleteView",
    value: 1,
  });

  // Mixpanel tracking
  mixpanel.track("Program Opened", {
    Page: "AthleteView",
  });
}
</script>
