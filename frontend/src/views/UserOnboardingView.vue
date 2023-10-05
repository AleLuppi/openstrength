<template>
  <div class="q-pa-md">
    <q-stepper
      v-model="step"
      ref="stepper"
      color="primary"
      header-class="text-bold"
      animated
    >
      <!-- Step 1-->
      <q-step :name="1" :title="step1Title" icon="settings" :done="step > 1">
        <div class="image-container">
          <img :src="imageSrc" alt="Logo" class="centered-image" />
        </div>
        <h3 class="text-center">{{ $t("user.onboarding.title_step1") }}</h3>
        <p class="text-center">{{ $t("user.onboarding.subtitle_step1") }}</p>

        <div class="row justify-center q-gutter-sm">
          <q-btn
            class="q-ma-sm my-selectable-button"
            v-for="button in buttonsRoles"
            :key="button.id"
            :color="button.selected ? 'primary' : 'lighter'"
            :text-color="button.selected ? 'lighter' : 'dark'"
            @click="toggleUniqueButton(button, 'buttonsRoles')"
          >
            {{ button.label }}
          </q-btn>
        </div>
      </q-step>

      <!-- Step 2-->
      <q-step
        :name="2"
        :title="step2Title"
        :caption="step2Caption"
        icon="info"
        :done="step > 2"
      >
        <div class="image-container">
          <img :src="imageSrc" alt="Logo" class="centered-image" />
        </div>
        <h3 class="text-center">{{ $t("user.onboarding.title_step2") }}</h3>
        <p class="text-center">{{ $t("user.onboarding.subtitle_step2") }}</p>

        <div class="row justify-center">
          <q-list>
            <q-btn
              class="q-ma-sm my-selectable-button"
              v-for="button in buttonsSports"
              :key="button.id"
              :color="button.selected ? 'primary' : 'lighter'"
              :text-color="button.selected ? 'lighter' : 'dark'"
              @click="toggleButton(button)"
            >
              {{ button.label }}
            </q-btn>
          </q-list>
        </div>
      </q-step>

      <!-- Step 3-->
      <q-step
        :name="3"
        :title="step3Title"
        :caption="step3Caption"
        icon="info"
        :done="step > 3"
      >
        <div class="image-container">
          <img :src="imageSrc" alt="Logo" class="centered-image" />
        </div>
        <h3 class="text-center">{{ $t("user.onboarding.title_step3") }}</h3>
        <p class="text-center">{{ $t("user.onboarding.subtitle_step3") }}</p>

        <div class="row justify-center">
          <q-list>
            <q-btn
              class="q-ma-sm my-selectable-button"
              v-for="button in buttonsAthletesRange"
              :key="button.id"
              :color="button.selected ? 'primary' : 'lighter'"
              :text-color="button.selected ? 'lighter' : 'dark'"
              @click="toggleUniqueButton(button, 'buttonsAthletesRange')"
            >
              {{ button.label }}
            </q-btn>
          </q-list>
        </div>
      </q-step>

      <!-- Stepper navigation controls -->
      <template v-slot:navigation>
        <q-stepper-navigation>
          <q-btn
            v-if="step === 1"
            @click="
              exportSelectedRole(), onAthleteRedirect(), $refs.stepper.next()
            "
            color="primary"
          >
            {{ $t("common.continue") }}
          </q-btn>
          <q-btn
            v-else-if="step === 2"
            @click="exportSelectedSports(), $refs.stepper.next()"
            color="primary"
          >
            {{ $t("common.continue") }}
          </q-btn>
          <q-btn
            v-else-if="step === 3"
            @click="exportSelectedAthletesRange(), onFinishRedirect()"
            color="primary"
          >
            {{ $t("common.finish") }}
          </q-btn>

          <q-btn
            v-if="step > 1"
            flat
            color="primary"
            @click="$refs.stepper.previous()"
            class="q-ml-sm"
          >
            {{ $t("common.back") }}
          </q-btn>
        </q-stepper-navigation>
      </template>
    </q-stepper>
  </div>

  <div class="q-pa-md q-pb-lg q-mx-auto limit-max-width"></div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const i18n = useI18n();
const step1Title = i18n.t("user.onboarding.bartitle_step1");
//const step1Caption = i18n.t("user.onboarding.barcaption_step1");
const step2Title = i18n.t("user.onboarding.bartitle_step2");
const step2Caption = i18n.t("user.onboarding.barcaption_step2");
const step3Title = i18n.t("user.onboarding.bartitle_step3");
const step3Caption = i18n.t("user.onboarding.barcaption_step3");

const imageSrc = ref("/assets/logo.png");

const router = useRouter();

const step = ref(1);

const buttonsSports = ref([
  {
    id: 1,
    label: i18n.t("user.onboarding.powerlifting"),
    selected: ref(false),
  },
  {
    id: 2,
    label: i18n.t("user.onboarding.bodybuilding"),
    selected: ref(false),
  },
  {
    id: 3,
    label: i18n.t("user.onboarding.calisthenics"),
    selected: ref(false),
  },
  {
    id: 4,
    label: i18n.t("user.onboarding.powerbuilding"),
    selected: ref(false),
  },
  { id: 5, label: i18n.t("user.onboarding.crossfit"), selected: ref(false) },
  {
    id: 6,
    label: i18n.t("user.onboarding.weightlifting"),
    selected: ref(false),
  },
  { id: 7, label: i18n.t("user.onboarding.fitness"), selected: ref(false) },
  {
    id: 8,
    label: i18n.t("user.onboarding.streetlifting"),
    selected: ref(false),
  },
  { id: 10, label: i18n.t("common.other"), selected: ref(false) },
]);

const buttonsAthletesRange = ref([
  { id: 11, label: "1-5", selected: ref(false) },
  { id: 12, label: "6-10", selected: ref(false) },
  { id: 13, label: "11-20", selected: ref(false) },
  { id: 14, label: "21-30", selected: ref(false) },
  { id: 15, label: "30+", selected: ref(false) },
]);

const buttonsRoles = ref([
  { id: 16, label: i18n.t("user.onboarding.athlete"), selected: ref(false) },
  { id: 17, label: i18n.t("user.onboarding.coach"), selected: ref(false) },
]);

// BUTTON SELECTION METHODS
const toggleButton = (button: { selected: boolean }) => {
  button.selected = !button.selected;
};

const toggleUniqueButton = (button, group) => {
  const groupToToggle =
    group === "buttonsRoles" ? buttonsRoles : buttonsAthletesRange;

  groupToToggle.value.forEach((btn) => {
    btn.selected = false;
  });

  button.selected = true;
};

// EXPORT METHODS
const exportSelectedRole = () => {
  const selectedLabels = buttonsRoles.value
    .filter((button) => button.selected)
    .map((button) => button.label);

  //TODO: write in user document
  console.log(selectedLabels);
};

const exportSelectedSports = () => {
  const selectedLabels = buttonsSports.value
    .filter((button) => button.selected)
    .map((button) => button.label);

  // TODO: write in user document
  console.log(selectedLabels);
};

const exportSelectedAthletesRange = () => {
  const selectedLabels = buttonsAthletesRange.value
    .filter((button) => button.selected)
    .map((button) => button.label);

  // TODO: write in user document
  console.log(selectedLabels);
};

// REDIRECT METHODS
const onFinishRedirect = () => {
  router.push({ name: "home" });
};

const onAthleteRedirect = () => {
  const selectedLabels = buttonsRoles.value
    .filter((button) => button.selected)
    .map((button) => button.label);

  if (selectedLabels.includes(i18n.t("user.onboarding.athlete"))) {
    router.push({ name: "comingsoon" });
  }
};
</script>

<style scoped>
.image-container {
  max-width: 100%; /* Set the maximum width to 100% to fit the container */
  max-height: 100%; /* Set the maximum height to 100% to fit the container */
  display: flex;
  align-items: center;
  justify-content: center;
}

.my-selectable-button {
  border-radius: 39px;
  border: 1px solid var(--typography-2, #555f7e);
  background: var(--bg-1, #fff);
}
</style>
