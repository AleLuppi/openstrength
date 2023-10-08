<template>
  <div class="q-pa-md">
    <q-stepper
      v-model="step"
      ref="stepperElement"
      color="primary"
      header-class="text-bold"
      animated
      class="text-center"
    >
      <!-- Step 1: anagraphic -->
      <q-step
        :name="1"
        :title="$t('user.onboarding.header_step1')"
        :caption="$t('user.onboarding.header_caption_step1')"
        icon="settings"
        :done="step > 1"
      >
        <img :src="logoFullImage" alt="Logo" />
        <h3>{{ $t("user.onboarding.title_step1") }}</h3>
        <p class="q-mt-xl">{{ $t("user.onboarding.action_step1_a") }}</p>

        <div class="q-my-md row justify-center q-gutter-x-lg">
          <os-input
            ref="userNameInputElement"
            v-model="userName"
            type="text"
            :label="$t('user.auth.name')"
            required
          />

          <os-input
            ref="userSurnameInputElement"
            v-model="userSurname"
            type="text"
            :label="$t('user.auth.surname')"
            required
          />
        </div>
      </q-step>

      <!-- Step 2: role -->
      <q-step
        :name="2"
        :title="$t('user.onboarding.header_step2')"
        :caption="$t('user.onboarding.header_caption_step2')"
        icon="person"
        :done="step > 2"
      >
        <h3>{{ $t("user.onboarding.title_step2") }}</h3>
        <p class="q-mt-xl">{{ $t("user.onboarding.action_step2_a") }}</p>

        <div class="q-my-md row justify-center q-gutter-x-lg">
          <osToggleButtons
            ref="rolesToggleElement"
            v-model="selectedRole"
            :texts="buttonsRoles"
            :exclusive="true"
            :useLocale="true"
            :min-choices="1"
          />
        </div>
      </q-step>

      <!-- Step 3: custom info -->
      <q-step
        :name="3"
        :title="$t('user.onboarding.header_step3')"
        :caption="$t('user.onboarding.header_caption_step3')"
        icon="info"
        :done="step > 3"
      >
        <h3>{{ $t("user.onboarding.title_step3") }}</h3>
        <p class="q-mt-xl">{{ $t("user.onboarding.action_step3_a") }}</p>

        <div class="row justify-center">
          <osToggleButtons
            ref="sportsToggleElement"
            v-model="selectedSports"
            :texts="buttonsSports"
            :useLocale="true"
          />
        </div>

        <p class="q-mt-xl">{{ $t("user.onboarding.action_step3_b") }}</p>

        <div class="row justify-center">
          <osToggleButtons
            ref="athletesRangeToggleElement"
            v-model="selectedAthletesRange"
            :texts="buttonsAthletesRanges"
            :exclusive="true"
          />
        </div>
      </q-step>

      <!-- Stepper navigation controls -->
      <template v-slot:navigation>
        <q-stepper-navigation class="text-right">
          <q-btn
            v-if="step > 1"
            flat
            @click="stepperElement?.previous()"
            class="q-mx-sm"
          >
            {{ $t("common.back") }}
          </q-btn>

          <q-btn @click="onProceed">
            {{ isLastStep ? $t("common.submit") : $t("common.continue") }}
          </q-btn>
        </q-stepper-navigation>
      </template>
    </q-stepper>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { QStepper } from "quasar";
import OsInput from "@/components/basic/osInput.vue";
import { logoFullImage } from "@/assets/sources";
import OsToggleButtons from "@/components/basic/osToggleButtons.vue";
import router from "@/router";

// Set props
const props = defineProps({
  onSubmit: {
    type: Function,
    default: () => {},
  },
});

// Set ref
const stepperElement = ref<QStepper>();
const userNameInputElement = ref<typeof OsInput>();
const userSurnameInputElement = ref<typeof OsInput>();
const rolesToggleElement = ref<typeof OsToggleButtons>();
const sportsToggleElement = ref<typeof OsToggleButtons>();
const athletesRangeToggleElement = ref<typeof OsToggleButtons>();
const step = ref(1);
const userName = ref("");
const userSurname = ref("");
const selectedRole = ref<string[]>([]);
const selectedSports = ref<string[]>([]);
const selectedAthletesRange = ref<string[]>([]);
const isLastStep = computed(() => step.value === 3);

// Set texts for buttons
const buttonsRoles = {
  athlete: "user.role.athlete",
  coach: "user.role.coach",
};
const buttonsSports = {
  powerlifting: "sport.powerlifting",
  bodybuilding: "sport.bodybuilding",
  calisthenics: "sport.calisthenics",
  powerbuilding: "sport.powerbuilding",
  crossfit: "sport.crossfit",
  weightlifting: "sport.weightlifting",
  fitness: "sport.fitness",
  streetlifting: "sport.streetlifting",
  other: "common.other",
};
const buttonsAthletesRanges = ["1-5", "6-10", "11-20", "21-30", "30+"];

/**
 * Operations to perform when user wants to proceed to next step.
 */
function onProceed() {
  switch (step.value) {
    case 1:
      if (
        !(
          userNameInputElement.value?.validate() &&
          userSurnameInputElement.value?.validate()
        )
      )
        return;
      break;

    case 2:
      if (!rolesToggleElement.value?.validate()) return;
      if (selectedRole.value[0] == "athlete")
        router.push({ name: "comingsoon" }); // FIXME delete
      break;

    case 3:
      if (
        !(
          sportsToggleElement.value?.validate() &&
          athletesRangeToggleElement.value?.validate()
        )
      )
        return;
      break;
  }
  isLastStep.value ? onSubmit() : stepperElement.value?.next();
}

/**
 * Operations to perform when onboarding is completed.
 */
function onSubmit() {
  // Prepare data
  const data = {
    name: userName.value,
    surname: userSurname.value,
    role: selectedRole.value[0],
    sports: selectedSports.value.slice(),
    athletesRange: selectedAthletesRange.value[0],
  };

  // Call props method
  props.onSubmit?.(data);
}
</script>
