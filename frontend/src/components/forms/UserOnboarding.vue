<template>
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
      :title="$q.screen.lt.sm ? '' : $t('user.onboarding.header_step1')"
      :caption="$t('user.onboarding.header_caption_step1')"
      icon="settings"
      :done="step > 1"
    >
      <img :src="logoFullImage" :srcset="logoFullImage + ' 1.2x'" alt="Logo" />
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
      :title="$q.screen.lt.sm ? '' : $t('user.onboarding.header_step2')"
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
      :title="$q.screen.lt.sm ? '' : $t('user.onboarding.header_step3')"
      :caption="$t('user.onboarding.header_caption_step3')"
      icon="info"
      :done="step > 3"
    >
      <h3>{{ $t("user.onboarding.title_step3") }}</h3>
      <p class="q-mt-sm">{{ $t("user.onboarding.action_step3_a") }}</p>

      <div class="row justify-center">
        <osToggleButtons
          ref="sportsToggleElement"
          v-model="selectedSports"
          :texts="buttonsSports"
          :useLocale="true"
        />
      </div>

      <p :class="$q.screen.lt.sm ? 'q-mt-sm' : 'q-mt-xl'">
        {{ $t("user.onboarding.action_step3_b") }}
      </p>

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
</template>

<script setup lang="ts">
import { GlobalComponents, computed, ref } from "vue";
import { QStepper } from "quasar";
import { logoFullImage } from "@/assets/sources";
import { UserRole } from "@/helpers/users/user";

// Set emits
const emit = defineEmits<{
  submit: [
    data: {
      [key: string]: any;
    },
  ];
}>();

// Set ref
const stepperElement = ref<QStepper>();
const userNameInputElement = ref<GlobalComponents["osInput"]>();
const userSurnameInputElement = ref<GlobalComponents["osInput"]>();
const rolesToggleElement = ref<GlobalComponents["osToggleButtons"]>();
const sportsToggleElement = ref<GlobalComponents["osToggleButtons"]>();
const athletesRangeToggleElement = ref<GlobalComponents["osToggleButtons"]>();
const step = ref(1);
const userName = ref("");
const userSurname = ref("");
const selectedRole = ref<string[]>([]);
const selectedSports = ref<string[]>([]);
const selectedAthletesRange = ref<string[]>([]);
const isLastStep = computed(() => step.value === 3);

// Set texts for buttons
const buttonsRoles = {
  [UserRole.athlete]: "user.role.athlete",
  [UserRole.coach]: "user.role.coach",
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
      if ((selectedRole.value[0] as UserRole) == UserRole.athlete) {
        onSubmit();
        return;
      }
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
  // Prepare generic data
  const data: { [key: string]: any } = {
    name: userName.value,
    surname: userSurname.value,
    role: selectedRole.value?.[0] as UserRole,
  };

  // Prepare specific data
  if (data.role == UserRole.coach) {
    data.sports = selectedSports.value?.slice();
    data.athletesNumberRange = selectedAthletesRange.value?.[0]
      ?.split(/[-+]/)
      .map((val) => (val ? Number(val) : undefined));
  }

  // Call props method
  emit("submit", data);
}
</script>
