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
        TO DO
      </q-step>

      <!-- Step 2-->
      <q-step
        :name="2"
        title="Step 2"
        caption="Optional"
        icon="info"
        :done="step > 2"
      >
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
              @click="toggleButton(button)"
            >
              {{ button.label }}
            </q-btn>
          </q-list>
        </div>
      </q-step>

      <template v-slot:navigation>
        <q-stepper-navigation>
          <q-btn
            v-if="step === 1"
            @click="$refs.stepper.next()"
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

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

export default {
  setup() {
    return {
      step: ref(1),
    };
  },
  name: "MyComponent",
  data() {
    return {
      buttonsSports: [
        { id: 1, label: "Powerlifting", selected: false },
        { id: 2, label: "Bodybuilding", selected: false },
        { id: 3, label: "Calisthenics", selected: false },
        { id: 4, label: "Powerbuilding", selected: false },
        { id: 5, label: "Crossfit", selected: false },
        { id: 6, label: "Weightlifting", selected: false },
        { id: 7, label: "Fitness", selected: false },
        { id: 8, label: "Streetlifting", selected: false },
        { id: 9, label: "Generic", selected: false },
        { id: 10, label: "Other", selected: false },
      ],
      buttonsAthletesRange: [
        { id: 11, label: "1-10", selected: false },
        { id: 12, label: "10-20", selected: false },
        { id: 13, label: "20-30", selected: false },
        { id: 14, label: "30+", selected: false },
      ],
    };
  },
  methods: {
    toggleButton(button) {
      button.selected = !button.selected;
    },
    exportSelectedSports() {
      const selectedLabels = this.buttonsSports
        .filter((button) => button.selected)
        .map((button) => button.label);
      // Export the selected labels here
      console.log(selectedLabels);
    },
    exportSelectedAthletesRange() {
      const selectedLabels = this.buttonsAthletesRange
        .filter((button) => button.selected)
        .map((button) => button.label);
      // Export the selected labels here
      console.log(selectedLabels);
    },
    onFinishRedirect() {
      router.push({ name: "home" });
    },
  },
};
</script>
<style scoped>
.my-selectable-button {
  border-radius: 39px;
  border: 1px solid var(--typography-2, #555f7e);
  background: var(--bg-1, #fff);
}
</style>
