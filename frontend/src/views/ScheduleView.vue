<template>
  <div id="q-app">
    <!-- 1: CASE WITH HIDDEN DRAWER -->
    <div v-if="isHidden" class="row full-page">
      <div class="col col-grow" style="height: 100%">
        <!-- FILTERS RIBBON -->
        <q-card class="q-ma-sm">
          <q-card-section>
            <div class="q-gutter-sm row">
              <!-- Filter by week -->
              <q-select
                outlined
                clearable
                dense
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
                dense
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
                dense
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

      <!-- NO RIGHT CARD TO SHOW -->

      <!-- RIGHT DRAWER MENU-->
      <RightDrawerMenu
        :zIndex="0"
        :isHidden="isHidden"
        :isSmall="isSmall"
        :isBig="isBig"
        :onCharts="onCharts"
        :onReferenceTable="onReferenceTable"
        @update:isHidden="updateIsHidden"
        @update:isSmall="updateIsSmall"
        @update:isBig="updateIsBig"
        @update:onCharts="updateOnCharts"
        @update:onReferenceTable="updateOnReferenceTable"
      />
    </div>

    <!-- 2a: CASE WITH SMALL DRAWER ON CHARTS -->
    <div
      v-else-if="isSmall && onCharts"
      class="row full-page"
      style="background-color: blue"
    >
      <div class="col col-grow" style="height: 100%">
        <!-- FILTERS RIBBON -->
        <q-card class="q-ma-sm">
          <q-card-section>
            <div class="q-gutter-sm row">
              <!-- Filter by week -->
              <q-select
                outlined
                clearable
                dense
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
                dense
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
                dense
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

      <!-- RIGHT CARD SMALL WIDTH -->
      <div>
        <q-card class="small-card no-shadow">
          <div class="row justify-between">
            <q-card-section>
              <p class="text-h6-no-margin">Charts Section</p>
            </q-card-section>
            <q-card-actions class="align-right">
              <q-btn
                @click="showBig"
                icon="fa-solid fa-angles-left"
                flat
              ></q-btn>
              <q-btn
                @click="showHidden"
                icon="fa-solid fa-angles-right"
                flat
              ></q-btn>
            </q-card-actions>
          </div>
        </q-card>
      </div>

      <!-- RIGHT DRAWER MENU-->
      <RightDrawerMenu
        :zIndex="0"
        :isHidden="isHidden"
        :isSmall="isSmall"
        :isBig="isBig"
        :onCharts="onCharts"
        :onReferenceTable="onReferenceTable"
        @update:isHidden="updateIsHidden"
        @update:isSmall="updateIsSmall"
        @update:isBig="updateIsBig"
        @update:onCharts="updateOnCharts"
        @update:onReferenceTable="updateOnReferenceTable"
      />
    </div>

    <!-- 2b: CASE WITH SMALL DRAWER ON REFERENCE TABLE -->
    <div
      v-else-if="isSmall && onReferenceTable"
      class="row full-page"
      style="background-color: blue"
    >
      <div class="col col-grow" style="height: 100%">
        <!-- FILTERS RIBBON -->
        <q-card class="q-ma-sm">
          <q-card-section>
            <div class="q-gutter-sm row">
              <!-- Filter by week -->
              <q-select
                outlined
                clearable
                dense
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
                dense
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
                dense
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

      <!-- RIGHT CARD SMALL WIDTH -->
      <div>
        <q-card class="small-card no-shadow">
          <div class="row justify-between">
            <q-card-section>
              <p class="text-h6-no-margin">Reference table Section</p>
            </q-card-section>

            <q-card-actions class="align-right">
              <q-btn
                @click="showBig"
                icon="fa-solid fa-angles-left"
                flat
              ></q-btn>
              <q-btn
                @click="showHidden"
                icon="fa-solid fa-angles-right"
                flat
              ></q-btn>
            </q-card-actions>
          </div>
        </q-card>
      </div>

      <!-- RIGHT DRAWER MENU-->
      <RightDrawerMenu
        :zIndex="0"
        :isHidden="isHidden"
        :isSmall="isSmall"
        :isBig="isBig"
        :onCharts="onCharts"
        :onReferenceTable="onReferenceTable"
        @update:isHidden="updateIsHidden"
        @update:isSmall="updateIsSmall"
        @update:isBig="updateIsBig"
        @update:onCharts="updateOnCharts"
        @update:onReferenceTable="updateOnReferenceTable"
      />
    </div>

    <!-- 3a: CASE WITH BIG DRAWER AND CHART SECTION -->
    <div
      v-else-if="isBig && onCharts"
      class="row full-page"
      style="background-color: orange"
    >
      <div class="col col-grow" style="height: 100%">
        <!-- FILTERS RIBBON -->
        <q-card class="q-ma-sm">
          <q-card-section>
            <div class="q-gutter-sm row">
              <!-- Filter by week -->
              <q-select
                outlined
                clearable
                dense
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
                dense
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
                dense
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

      <!-- RIGHT CARD BIG WIDTH-->
      <div>
        <q-card class="big-card">
          <div class="row justify-between">
            <q-card-section>
              <p class="text-h6-no-margin">Charts Section Big</p>
            </q-card-section>
            <q-card-actions class="align-right">
              <q-btn
                @click="showSmall"
                icon="fa-solid fa-angles-right"
                flat
              ></q-btn>
            </q-card-actions>
          </div>
        </q-card>
      </div>

      <!-- RIGHT DRAWER MENU -->
      <RightDrawerMenu
        :zIndex="10"
        :isHidden="isHidden"
        :isSmall="isSmall"
        :isBig="isBig"
        :onCharts="onCharts"
        :onReferenceTable="onReferenceTable"
        @update:isHidden="updateIsHidden"
        @update:isSmall="updateIsSmall"
        @update:isBig="updateIsBig"
        @update:onCharts="updateOnCharts"
        @update:onReferenceTable="updateOnReferenceTable"
      />
    </div>

    <!-- 3b: CASE WITH BIG DRAWER AND REFERENCE TABLE -->
    <div
      v-else-if="isBig && onReferenceTable"
      class="row full-page"
      style="background-color: orange"
    >
      <div class="col col-grow" style="height: 100%">
        <!-- FILTERS RIBBON -->
        <q-card class="q-ma-sm">
          <q-card-section>
            <div class="q-gutter-sm row">
              <!-- Filter by week -->
              <q-select
                outlined
                clearable
                dense
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
                dense
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
                dense
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

      <!-- RIGHT CARD BIG WIDTH-->
      <div>
        <q-card class="big-card">
          <div class="row justify-between">
            <q-card-section>
              <p class="text-h6-no-margin">Reference Table Section Big</p>
            </q-card-section>
            <q-card-actions class="align-right">
              <q-btn
                @click="showSmall"
                icon="fa-solid fa-angles-right"
                flat
              ></q-btn>
            </q-card-actions>
          </div>
        </q-card>
      </div>

      <!-- RIGHT DRAWER MENU -->
      <RightDrawerMenu
        :zIndex="10"
        :isHidden="isHidden"
        :isSmall="isSmall"
        :isBig="isBig"
        :onCharts="onCharts"
        :onReferenceTable="onReferenceTable"
        @update:isHidden="updateIsHidden"
        @update:isSmall="updateIsSmall"
        @update:isBig="updateIsBig"
        @update:onCharts="updateOnCharts"
        @update:onReferenceTable="updateOnReferenceTable"
      />
    </div>

    <div></div>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable */
import { ref } from "vue";
import RightDrawerMenu from "@/components/layout/RightDrawerMenu.vue";

const isHidden = ref(true); // Set your initial values here
const isSmall = ref(false); // Set your initial values here
const isBig = ref(false); // Set your initial values here

//Set dimension of drawer child windows
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

// Set content of drawer menu
const onCharts = ref(true); // Set your initial values here
const onReferenceTable = ref(false); // Set your initial values here



const updateIsHidden = (value: boolean) => {
  isHidden.value = value;
};

const updateIsSmall = (value: boolean) => {
  isSmall.value = value;
};

const updateIsBig = (value: boolean) => {
  isBig.value = value;
};

const updateOnCharts = (value: boolean) => {
  onCharts.value = value;
};

const updateOnReferenceTable = (value: boolean) => {
  onReferenceTable.value = value;
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

<style scoped lang="scss">
/* Hidden Card */
.hidden-card {
  width: 48px;
  height: 100%; /* Covers the whole available height */

  right: 0; /* Align to the right */
  top: 0; /* Vertically centered */
}

/* Small Card */
.small-card {
  width: 25vw;
  height: 100%; /* Covers the whole available height */
  right: 0; /* Align to the right */
  top: 0; /* Vertically centered */
  border-top-right-radius: 0%;
  border-bottom-right-radius: 0%;
}

/* Big Card */
.big-card {
  width: 50vw;
  height: 100%;
  position: fixed;
  z-index: 3; /* Adjust the z-index as needed to appear over other content */
  right: 56px; /* TODO: add global variable for mini right drawer width */
  top: 0;
  border-top-right-radius: 0%;
  border-bottom-right-radius: 0%;
}

.full-page {
  height: 100%;
  position: fixed;
  z-index: 2;
  left: 100px; /*TODO: set global var for main drawer width DEVE ESSERE PARI ALLA LARGHEZZA DEL MINI DRAWER */
  right: 0;
  top: 0;
  bottom: 0;
}

//TODO for tablet and mobile
.full-page-mobile {
  height: 100%;
  position: fixed;
  z-index: 2;
  left: 0; /*TODO: set global var for main drawer width DEVE ESSERE PARI ALLA LARGHEZZA DEL MINI DRAWER */
  right: 0;
  top: 50;
  bottom: 0;
}

.os-child-bg-primary > .q-card {
  background: $primary;
  color: $lightest;
}

.os-text-unselected {
  color: $os-secondary-6 !important;
}
</style>
