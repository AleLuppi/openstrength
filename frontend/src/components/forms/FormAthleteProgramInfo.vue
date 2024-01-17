<template>
  <q-form ref="formElement" @submit="onSubmit">
    <!-- Actual programs -->
    <div>
      <h6>{{ $t("coach.athlete_management.fields.program_title") }}</h6>
      <div class="q-mb-md">
        <q-btn
          outline
          :to="{ name: 'program', params: { programId: props.program.uid } }"
          :label="$t('coach.athlete_management.call_to_action.modify_program')"
          class="q-mr-md"
          @click="registerProgramOpeningEvent()"
        ></q-btn>
      </div>

      <div>
        <!-- Program name -->
        <os-input
          v-model="programName"
          :label="$t('coach.athlete_management.fields.program_name')"
        />

        <div class="row q-col-gutter-x-md">
          <!-- Start date -->
          <os-input
            v-model="programStartedOn"
            :label="$t('coach.athlete_management.fields.program_start')"
            class="col-6"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date v-model="programStartedOn">
                    <div class="row items-center justify-end">
                      <q-btn
                        v-close-popup
                        :label="$t('common.close')"
                        color="primary"
                        flat
                      />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </os-input>

          <!-- End date -->
          <os-input
            v-model="programFinishedOn"
            :label="$t('coach.athlete_management.fields.program_finish')"
            class="col-6"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date v-model="programFinishedOn">
                    <div class="row items-center justify-end">
                      <q-btn
                        v-close-popup
                        :label="$t('common.close')"
                        color="primary"
                        flat
                      />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </os-input>
        </div>
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
        isProgramDescriptionSet: program.description ? true : false,
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
