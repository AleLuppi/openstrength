<template>
  <q-form ref="formElement" @submit="onSubmit">
    <h6>{{ $t("coach.program_management.builder.new_program_info") }}</h6>

    <div class="row q-col-gutter-x-md">
      <!-- Program name -->
      <os-input
        v-model="programName"
        :label="$t('coach.program_management.fields.name')"
        required
        class="col-7"
      />

      <!-- Assigned athlete -->
      <div class="col-5">
        <os-field
          :label="$t('coach.program_management.fields.athlete')"
          required
          :model-value="programAthlete"
        >
          <template #control>
            <q-btn
              :label="
                programAthlete
                  ? ''
                  : $t('coach.program_management.builder.assign_to_athlete')
              "
              :color="programAthlete ? 'secondary' : 'primary'"
              outline
              :dense="Boolean(programAthlete)"
              class="full-width"
              @click="showAthleteAssigningDialog = true"
            >
              <q-item v-if="programAthlete" dense class="q-py-none q-px-md">
                <q-item-section
                  v-if="$q.screen.gt.xs && programAthlete.photoUrl"
                  avatar
                >
                  <q-avatar size="md">
                    <img :src="programAthlete.photoUrl" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  {{ programAthlete.referenceName }}
                </q-item-section>
              </q-item>
            </q-btn>
          </template>
        </os-field>
      </div>

      <!-- Whether to immediately assign program to athlete -->
      <q-toggle
        v-model="programAssignNow"
        :label="$t('coach.program_management.fields.assign_now')"
        class="col-12 q-mb-md"
      ></q-toggle>

      <!-- Start date -->
      <os-input-date
        v-model="programStartedOn"
        :label="$t('coach.program_management.fields.start_date')"
        required
        class="col-6"
      ></os-input-date>

      <!-- End date -->
      <os-input-date
        v-model="programFinishedOn"
        :label="$t('coach.program_management.fields.end_date')"
        class="col-6"
      ></os-input-date>

      <!-- Program description -->
      <os-input
        v-model="programDescription"
        type="textarea"
        :label="$t('coach.program_management.fields.description')"
        class="col-12"
      />
    </div>

    <!-- Submit -->
    <q-btn
      type="submit"
      :label="$t('coach.program_management.builder.new_program_submit')"
      class="full-width"
    ></q-btn>

    <DialogProgramAssignAthlete
      v-model="showAthleteAssigningDialog"
      v-model:selected="programAthlete"
      :athletes="coachInfo.athletes ?? []"
    ></DialogProgramAssignAthlete>
  </q-form>
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref, watch } from "vue";
import type { QForm } from "quasar";
import { useCoachInfoStore } from "@/stores/coachInfo";
import { Program } from "@/helpers/programs/program";
import { dateGetWithoutTimezone } from "@/helpers/scalar";
import { AthleteUser } from "@/helpers/users/user";
import mixpanel from "mixpanel-browser";

// Import components
const DialogProgramAssignAthlete = defineAsyncComponent(
  () => import("components/dialogs/DialogProgramAssignAthlete.vue"),
);

// Define props
const props = defineProps<{
  // optional program to initialize info, otherwise start with empty info
  program: Program | undefined;

  // optional athlete to assign to program if not already assigned
  athlete?: AthleteUser;
}>();

// Define emits
const emit = defineEmits<{
  submit: [program: Program, assign?: boolean];
}>();

// Get coach info
const coachInfo = useCoachInfoStore();

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
const programAthlete = ref<AthleteUser>();
const programStartedOn = ref<Date>();
const programFinishedOn = ref<Date>();
const programDescription = ref<string>();
const programAssignNow = ref<boolean>(false);
const showAthleteAssigningDialog = ref(false);

// Update shown info according to selected program
watch(
  () => props.program,
  (program) => {
    if (!program) program = new Program();
    programName.value = program.name;
    programAthlete.value = program.athlete;
    programStartedOn.value = program.startedOn;
    programFinishedOn.value = program.finishedOn;
    programDescription.value = program.description;
  },
  { immediate: true },
);

// Select proposed athlete
watch(
  () => props.athlete,
  (athlete) => {
    if (!programAthlete.value) programAthlete.value = athlete;
  },
  { immediate: true },
);

// Show warning dialog when necessary
watch(programAthlete, (athlete) => {
  if (athlete) programAssignNow.value = !athlete.assignedProgramId;
});

/**
 * Perform operations on form submit.
 */
function onSubmit() {
  const program = props.program ?? new Program();
  program.name = programName.value;
  program.athlete = programAthlete.value;
  program.startedOn = programStartedOn.value
    ? dateGetWithoutTimezone(programStartedOn.value)
    : undefined;
  program.finishedOn = programFinishedOn.value
    ? dateGetWithoutTimezone(programFinishedOn.value)
    : undefined;
  program.description = programDescription.value;

  // Mixpanel tracking
  mixpanel.track("Program Info Updated", {
    Page: "ProgramView",
    IsProgramDescriptionSet: program.description ? true : false,
  });

  emit("submit", program, programAssignNow.value);
}
</script>
