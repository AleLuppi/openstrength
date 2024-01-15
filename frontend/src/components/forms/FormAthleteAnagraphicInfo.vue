<template>
  <q-form ref="formElement" @submit="onSubmit">
    <div>
      <div class="row q-col-gutter-x-md">
        <!-- Athlete Name -->
        <os-input
          v-model="athleteName"
          :label="$t('coach.athlete_management.fields.name')"
          :readonly="readonly"
          class="col-md-auto col-sm-6 col-12"
        />

        <!-- Athlete Surname -->
        <os-input
          v-model="athleteSurname"
          :label="$t('coach.athlete_management.fields.surname')"
          :readonly="readonly"
          class="col-md-auto col-sm-6 col-12"
        />

        <!--Athlete Birthday-->
        <os-input
          v-model="athleteBirthday"
          :label="$t('coach.athlete_management.fields.birthday')"
          :readonly="readonly"
          class="col-md-auto col-sm-6 col-12"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date v-model="athleteBirthday">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </os-input>

        <os-select
          v-model="athleteGender"
          :label="$t('coach.athlete_management.fields.gender')"
          :options="athleteGenderOptions"
          emit-value
          map-options
          class="col-4"
        />

        <os-input
          v-model="athleteHeight"
          :label="$t('coach.athlete_management.fields.height')"
          :suffix="heightSuffix"
          class="col-4"
        />

        <os-input
          v-model="athleteWeight"
          :label="$t('coach.athlete_management.fields.weight')"
          :suffix="weightSuffix"
          class="col-4"
        />
      </div>

      <os-input
        v-model="athleteNote"
        :label="$t('coach.athlete_management.fields.note')"
        type="textarea"
        class="col-12"
      />
    </div>

    <q-btn
      type="submit"
      :label="$t('coach.athlete_management.fields.update')"
      class="full-width"
    ></q-btn>
  </q-form>
</template>

<script setup lang="ts">
import { ref, computed, watch, PropType, readonly } from "vue";
import { useI18n } from "vue-i18n";
import type { QForm } from "quasar";
import { useQuasar } from "quasar";
import { AthleteUser, UserGender } from "@/helpers/users/user";
import { event } from "vue-gtag";

// Init plugin
const $q = useQuasar();
const i18n = useI18n();

// Set props
const props = defineProps({
  athlete: {
    type: AthleteUser,
    required: true,
  },
  onSubmit: {
    type: Function,
  },
  optionsAthleteGender: {
    type: Array as PropType<UserGender[]>,
    default: undefined,
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
const athleteName = ref<string>();
const athleteSurname = ref<string>();
const athleteBirthday = ref<Date>();
const athleteGender = ref<UserGender>();
const athleteHeight = ref<string>();
const athleteWeight = ref<string>();
const athleteNote = ref<string>();
const heightSuffix = "cm"; //TODO assign based on metric/imperial selected in profile or locale
const weightSuffix = "kg";

// Update shown info according to selected variant
watch(
  () => props.athlete,
  (athlete: AthleteUser | undefined) => {
    if (athlete) {
      athleteName.value = athlete.name;
      athleteSurname.value = athlete.surname;
      athleteBirthday.value = athlete.birthday;
      athleteGender.value = athlete.gender;
      athleteHeight.value = athlete.height;
      athleteWeight.value = athlete.weight;
      athleteNote.value = athlete.coachNote;
    }
  },
  { immediate: true },
);

// Get options for select fields
const athleteGenderOptions = computed(() =>
  Object.keys(UserGender)
    .sort()
    .map((val) => ({
      label: i18n.t("coach.athlete_management.fields.gender_available." + val),
      value: val,
    })),
);

/**
 * Perform operations on form submit.
 */

function onSubmit() {
  const athlete = props.athlete;
  athlete.name = athleteName.value;
  athlete.surname = athleteSurname.value;
  athlete.birthday = athleteBirthday.value;
  athlete.gender = athleteGender.value;
  athlete.height = athleteHeight.value;
  athlete.weight = athleteWeight.value;
  athlete.coachNote = athleteNote.value;

  props.onSubmit?.(athlete);

  athlete.saveUpdate({
    onSuccess: () => {
      $q.notify({
        type: "positive",
        message: i18n.t("coach.athlete_management.list.add_succeed"),
        position: "bottom",
      });

      // Register GA4 event
      event("athleteview_anagraphic_update", {
        event_category: "documentation",
        event_label: "Update athlete anagraphic info from AthleteView",
        value: 1,
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
