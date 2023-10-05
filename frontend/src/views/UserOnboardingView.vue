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
      <q-step :name="1" title="Step 1" icon="settings" :done="step > 1">
        <div class="image-container">
          <img :src="imageSrc" alt="Logo" class="centered-image" />
        </div>
        <h3 class="text-center">Tell us more</h3>
        <p class="text-center">
          How will you be using the app? Select one. Note: if you want to both
          train and be trained select coach.
        </p>

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
        title="Step 2"
        caption="Optional"
        icon="info"
        :done="step > 2"
      >
        <div class="image-container">
          <img :src="imageSrc" alt="Logo" class="centered-image" />
        </div>
        <h3 class="text-center">Let's meet better!</h3>
        <p class="text-center">
          Select the most common disciplines among your athletes:
        </p>

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
        title="Step 3"
        caption="Optional"
        icon="info"
        :done="step > 3"
      >
        <div class="image-container">
          <img :src="imageSrc" alt="Logo" class="centered-image" />
        </div>
        <h3 class="text-center">We are almost there!</h3>
        <p class="text-center">
          Select the average number of athletes you work with at the same time:
        </p>

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
            label="Continue"
          />
          <q-btn
            v-else-if="step === 2"
            @click="exportSelectedSports(), $refs.stepper.next()"
            color="primary"
            label="Continue"
          />
          <q-btn
            v-else-if="step === 3"
            @click="exportSelectedAthletesRange(), onFinishRedirect()"
            color="primary"
            label="Finish"
          />
          <q-btn
            v-else
            @click="$refs.stepper.next()"
            color="primary"
            :label="step === 3 ? 'Finish' : 'Continue'"
          />
          <q-btn
            v-if="step > 1"
            flat
            color="primary"
            @click="$refs.stepper.previous()"
            label="Back"
            class="q-ml-sm"
          />
        </q-stepper-navigation>
      </template>
    </q-stepper>
  </div>

  <div class="q-pa-md q-pb-lg q-mx-auto limit-max-width"></div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

const imageSrc = ref("/assets/logo.png");

const router = useRouter();

const step = ref(1);

const buttonsSports = ref([
  { id: 1, label: "Powerlifting", selected: ref(false) },
  { id: 2, label: "Bodybuilding", selected: ref(false) },
  { id: 3, label: "Calisthenics", selected: ref(false) },
  { id: 4, label: "Powerbuilding", selected: ref(false) },
  { id: 5, label: "Crossfit", selected: ref(false) },
  { id: 6, label: "Weightlifting", selected: ref(false) },
  { id: 7, label: "Fitness", selected: ref(false) },
  { id: 8, label: "Streetlifting", selected: ref(false) },
  { id: 9, label: "Generic", selected: ref(false) },
  { id: 10, label: "Other", selected: ref(false) },
]);

const buttonsAthletesRange = ref([
  { id: 11, label: "1-5", selected: ref(false) },
  { id: 12, label: "6-10", selected: ref(false) },
  { id: 13, label: "11-20", selected: ref(false) },
  { id: 14, label: "21-30", selected: ref(false) },
  { id: 15, label: "30+", selected: ref(false) },
]);

const buttonsRoles = ref([
  { id: 16, label: "Athlete", selected: ref(false) },
  { id: 17, label: "Coach", selected: ref(false) },
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

  if (selectedLabels.includes("Athlete")) {
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
