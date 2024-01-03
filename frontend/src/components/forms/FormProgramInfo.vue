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
        <os-field label="Athlete" required :model-value="programAthlete">
          <template #control>
            <q-btn
              @click="showAthleteAssigningDialog = true"
              :label="
                programAthlete
                  ? ''
                  : $t('coach.program_management.builder.assign_to_athlete')
              "
              :color="programAthlete ? 'secondary' : 'primary'"
              outline
              :dense="Boolean(programAthlete)"
              class="full-width"
            >
              <q-item v-if="programAthlete" dense class="q-py-none q-px-md">
                <q-item-section
                  avatar
                  v-if="$q.screen.gt.xs && programAthlete.photoUrl"
                >
                  <q-avatar size="md">
                    <img :src="programAthlete.photoUrl" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>{{
                  programAthlete.referenceName
                }}</q-item-section>
              </q-item>
            </q-btn>
          </template>
        </os-field>
      </div>

      <!-- Start date -->
      <os-input
        v-model="programStartedOn"
        :label="$t('coach.program_management.fields.start_date')"
        required
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
        :label="$t('coach.program_management.fields.end_date')"
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
      :athletes="coachInfo.athletes ?? []"
      v-model:selected="programAthlete"
    ></DialogProgramAssignAthlete>

    <q-dialog v-model="showAthleteProgramOverwiteDialog">
      <q-card>
        <q-card-section class="row q-col-gutter-md items-center">
          <div class="col-1">
            <q-icon
              name="fa-solid fa-circle-exclamation"
              color="primary"
              size="md"
            />
          </div>
          <div class="col-11">
            {{
              $t("coach.program_management.builder.warn_assignment", {
                name: programAthlete?.referenceName,
              })
            }}
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            :label="$t('common.cancel')"
            color="secondary"
            @click="programAthlete = undefined"
            v-close-popup
          />
          <q-btn :label="$t('common.continue')" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-form>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { QForm } from "quasar";
import { Program } from "@/helpers/programs/program";
import { dateGetWithoutTimezone } from "@/helpers/scalar";
import { AthleteUser } from "@/helpers/users/user";
import DialogProgramAssignAthlete from "@/components/dialogs/DialogProgramAssignAthlete.vue";
import { useCoachInfoStore } from "@/stores/coachInfo";

// Define props
const props = defineProps({
  program: {
    type: Program,
    required: true,
  },
});

// Define emits
const emit = defineEmits<{
  submit: [program: Program];
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
const programStartedOn = ref<string>();
const programFinishedOn = ref<string>();
const programDescription = ref<string>();
const showAthleteAssigningDialog = ref(false);
const showAthleteProgramOverwiteDialog = ref(false);

// Update shown info according to selected program
watch(
  () => props.program,
  (program) => {
    programName.value = program.name;
    programAthlete.value = program.athlete;
    programStartedOn.value = program.startedOn
      ? program.startedOn.toISOString().split("T")[0].replaceAll("-", "/")
      : undefined;
    programFinishedOn.value = program.finishedOn
      ? program.finishedOn.toISOString().split("T")[0].replaceAll("-", "/")
      : undefined;
    programDescription.value = program.description;
  },
  { immediate: true },
);

// Show warning dialog when necessary
watch(programAthlete, (athlete) => {
  if (athlete?.assignedProgramId) showAthleteProgramOverwiteDialog.value = true;
});

/**
 * Perform operations on form submit.
 */
function onSubmit() {
  const program = props.program;
  program.name = programName.value;
  program.athlete = programAthlete.value;
  program.startedOn = programStartedOn.value
    ? dateGetWithoutTimezone(programStartedOn.value)
    : undefined;
  program.finishedOn = programFinishedOn.value
    ? dateGetWithoutTimezone(programFinishedOn.value)
    : undefined;
  program.description = programDescription.value;

  console.log(program);

  emit("submit", program);
}
</script>
