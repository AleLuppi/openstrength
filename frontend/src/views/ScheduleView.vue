<template>
  <div id="q-app">
    <div class="q-pa-md row q-gutter-sm">
      <!-- CENTRAL TAB: FILTERING RIBBON + PROGRAM TABLES -->
      <div class="">
        <!-- FILTERS RIBBON -->
        <q-card class="q-ma-sm">
          <q-card-section>
            <div class="q-gutter-sm row">
              <!-- Filter by week -->
              <q-select
                outlined
                clearable
                color="primary"
                v-model="modelWeeks"
                use-input
                hide-selected
                fill-input
                input-debounce="0"
                :options="optionsWeeks"
                @filter="filterWeeks"
                hint="Filter by week"
                class="my-filter-style q-px-sm"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      No results
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>

              <!-- Filter by day -->
              <q-select
                outlined
                clearable
                color="primary"
                v-model="modelDays"
                use-input
                hide-selected
                fill-input
                input-debounce="0"
                :options="optionsDays"
                @filter="filterDays"
                hint="Filter by day"
                class="my-filter-style q-px-sm"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      No results
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>

              <!-- Filter by exercise (TODO) -->
              <q-select
                outlined
                clearable
                color="primary"
                v-model="modelExercise"
                use-input
                hide-selected
                fill-input
                input-debounce="0"
                :options="optionsExercises"
                @filter="filterExercises"
                hint="Filter by exercise"
                class="my-filter-style q-px-sm"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      No results
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>

              <!-- Clear Filter button -->
              <div class="q-px-sm">
                <q-btn class="my-button-style"> Clear all filters </q-btn>
              </div>

              <!-- Add day/week -->
              <div class="q-px-sm">
                <q-btn class="my-button-style"> Add new </q-btn>
              </div>
            </div></q-card-section
          >
        </q-card>

        <!-- PROGRAM TABLES -->
        <q-card class="q-ma-sm">
          <q-card-section>
            <q-scroll-area class="rounded-borders" style="height: 70vh">
              <div v-for="n in 6" :key="n" class="q-py-sm q-px-sm">
                <q-card class="program-day-card">
                  <q-card-section>
                    <p>Day</p>
                  </q-card-section>
                </q-card>
              </div>
            </q-scroll-area>
          </q-card-section>
        </q-card>
      </div>

      <div>
        <div v-if="isHidden">
          <q-card class="hidden-card">
            <q-card-section>
              <p>Ciao</p>
            </q-card-section>
            <q-card-actions class="align-right">
              <q-btn
                @click="showSmall"
                icon="fa-solid fa-angles-left"
                outlined
              ></q-btn>
            </q-card-actions>
          </q-card>
        </div>
        <div v-if="isSmall">
          <q-card class="small-card">
            <q-card-section>
              <p>Ciao</p>
            </q-card-section>
            <q-card-actions class="align-right">
              <q-btn
                @click="showBig"
                icon="fa-solid fa-angles-left"
                outlined
              ></q-btn>
              <q-btn
                @click="showHidden"
                icon="fa-solid fa-angles-right"
                outlined
              ></q-btn>
            </q-card-actions>
          </q-card>
        </div>
        <div v-if="isBig">
          <q-card class="big-card">
            <q-card-section>
              <p>Ciao</p>
            </q-card-section>
            <q-card-actions class="align-right">
              <q-btn
                @click="showSmall"
                icon="fa-solid fa-angles-right"
                outlined
              ></q-btn>
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const isHidden = ref(true); // Set your initial values here
const isSmall = ref(false); // Set your initial values here
const isBig = ref(false); // Set your initial values here

const showHidden = () => {
  isHidden.value = true;
  isSmall.value = false;
  isBig.value = false;
};

const showSmall = () => {
  isHidden.value = false;
  isSmall.value = true;
  isBig.value = false;
};

const showBig = () => {
  isHidden.value = false;
  isSmall.value = false;
  isBig.value = true;
};

document.addEventListener("keydown", (event) => {
  // Check if the pressed key is the SPACE key (key code 32)
  if (event.keyCode === 32) {
    // Trigger the button click
    if (isHidden.value === true) {
      showSmall();
    } else if (isSmall.value === true) {
      showBig();
    } else if (isBig.value === true) {
      showHidden();
    }
  }
});

// FILTERS
// Filter on weeks
const weekNames = ["Week 1", "Week 2", "Week 3", "Week 4"];
const modelWeeks = ref(null);
const optionsWeeks = ref<string[]>(weekNames);

const filterWeeks = (val, update) => {
  const needle = val.toLowerCase();
  const filteredOptions = weekNames.filter(
    (v) => v.toLowerCase().indexOf(needle) > -1,
  );
  optionsWeeks.value = filteredOptions;
  update();
};

// Filter on days
const dayNames = ["Giorno A", "Giorno B", "Giorno C"];
const modelDays = ref(null);
const optionsDays = ref<string[]>(dayNames);

const filterDays = (val, update) => {
  const needle = val.toLowerCase();
  const filteredOptions = dayNames.filter(
    (v) => v.toLowerCase().indexOf(needle) > -1,
  );
  optionsDays.value = filteredOptions;
  update();
};

// Filter on exercises
const exerciseNames = [
  "Panca",
  "Stacco",
  "Pull up zavorrati mezzo rom",
  "Dip con fermo in buca",
];
const modelExercise = ref(null);
const optionsExercises = ref<string[]>(dayNames);

const filterExercises = (val, update) => {
  const needle = val.toLowerCase();
  const filteredOptions = exerciseNames.filter(
    (v) => v.toLowerCase().indexOf(needle) > -1,
  );
  optionsExercises.value = filteredOptions;
  update();
};
</script>

<style scoped>
.small-ref-card {
  width: 350px;
  height: 250px;
}
.chart-card {
  width: 100%;
  height: 250px;
}
.program-day-card {
  width: 100%;
  height: 400px;
}
.my-filter-style {
  width: 180px;
  padding-bottom: 32px;
}

.my-tab-panel {
  width: 240px;
  height: 87vh;
}

/* Hidden Card */
.hidden-card {
  width: 50px;
  height: 100%; /* Covers the whole available height */
  position: fixed;
  right: 0; /* Align to the right */
  top: 0; /* Vertically centered */
}

/* Small Card */
.small-card {
  width: 300px;
  height: 100%; /* Covers the whole available height */
  position: fixed; /* In overlay with respect to the content */
  z-index: 9999; /* Adjust the z-index as needed to appear over other content */
  right: 0; /* Align to the right */
  top: 0; /* Vertically centered */
}

/* Big Card */
.big-card {
  width: 500px;
  height: 100%; /* Covers the whole available height */
  position: fixed; /* In overlay with respect to the content */
  z-index: 9999; /* Adjust the z-index as needed to appear over other content */
  right: 0; /* Align to the right */
  top: 0; /* Vertically centered */
}
</style>
