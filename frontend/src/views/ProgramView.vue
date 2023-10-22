<template>
  <!-- TODO delete outer div -->
  <div>
    <osTableSheet v-model="tableData" class="q-ma-sm"></osTableSheet>

    <div class="q-pa-md row q-gutter-sm">
      <div>
        <!-- LEFT CARD: EXERCISE LIBRARY + NAVIGATION (?) -->
        <q-card class="q-ma-sm my-tab-panel">
          <q-card-section>
            <q-tabs v-model="selectedTab" class="text-dark">
              <q-tab
                v-for="tab in ['Library', 'Tree']"
                :key="tab"
                :name="tab"
                :label="tab"
              />
            </q-tabs>

            <q-tab-panels v-model="selectedTab">
              <q-tab-panel name="Library">
                <!-- Filter textbox -->
                <div class="column" style="max-width: 300px">
                  <q-input
                    ref="filterRef"
                    filled
                    v-model="filter"
                    label="Filter"
                  >
                    <template v-slot:append>
                      <q-icon
                        v-if="filter !== ''"
                        name="clear"
                        class="cursor-pointer"
                        @click="resetFilter"
                      />
                    </template>
                  </q-input>

                  <!-- Navigation Tree -->
                  <!-- TODO: chose if to put uid-->
                  <q-scroll-area class="rounded-borders" style="height: 70vh">
                    <q-tree
                      :nodes="propsExercises"
                      :filter="filter"
                      default-expand-all
                      accordion
                      tick-strategy="strict"
                      selected-color="primary"
                      v-model:selected="selected"
                      v-model:ticked="ticked"
                      node-key="uid"
                    >
                    </q-tree>
                  </q-scroll-area>
                </div>
              </q-tab-panel>

              <q-tab-panel name="Tree">
                <!-- NAVIGATION TREE -->
                <!-- Unselect -->
                <div class="q-gutter-sm">
                  <q-btn
                    v-if="selected"
                    size="sm"
                    color="red"
                    @click="unselectNode"
                    label="Clear Selection"
                  ></q-btn>
                </div>

                <!-- Filter textbox -->
                <div class="column" style="max-width: 300px">
                  <q-input
                    ref="filterRef"
                    filled
                    v-model="filter"
                    label="Filter"
                  >
                    <template v-slot:append>
                      <q-icon
                        v-if="filter !== ''"
                        name="clear"
                        class="cursor-pointer"
                        @click="resetFilter"
                      />
                    </template>
                  </q-input>

                  <!-- Navigation Tree -->
                  <!-- TODO: chose if to put uid-->
                  <q-scroll-area class="rounded-borders" style="height: 70vh">
                    <q-tree
                      :nodes="props"
                      :filter="filter"
                      default-expand-all
                      accordion
                      selected-color="primary"
                      v-model:selected="selected"
                      node-key="label"
                    >
                    </q-tree>
                  </q-scroll-area>
                </div>
              </q-tab-panel>
            </q-tab-panels>
          </q-card-section>
        </q-card>
      </div>

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
            </div>
          </q-card-section>
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

      <!-- RIGHT TAB: 1RM TABLE + CHARTS -->
      <div class="">
        <div class="q-ma-sm">
          <q-card class="small-ref-card">
            <q-card-section>
              <p>1RM Table</p>
            </q-card-section>
          </q-card>
        </div>

        <!-- CHARTS -->
        <q-card class="q-ma-sm">
          <q-card-section>
            <q-scroll-area dark class="rounded-borders" style="height: 56vh">
              <div v-for="n in 6" :key="n" class="q-px-xs q-py-sm">
                <q-card class="chart-card">
                  <q-card-section>
                    <p>Chart</p>
                  </q-card-section>
                </q-card>
              </div>
            </q-scroll-area>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

// TODO delete
const tableData = ref([
  { ciao: "campo 11", riciao: "campo 22", straciao: "campo 33" },
  { straciao: "voce 1", ciao: "voce 3" },
]);
watch(tableData, (val) => console.log("OLEEE:", val), { deep: true });

// LEFT TAB NAVIGATION TREE
const selectedTab = ref("Library"); // main tab to show
const selected = ref(null);
const filter = ref("");
const filterRef = ref(null);

const unselectNode = () => {
  selected.value = null;
};

const props = [
  {
    label: "Week 1",
    uid: "1",
    icon: "calendar_view_week",
    children: [
      {
        label: "Day A",
        uid: "2",
        icon: "calendar_view_day",
        children: [
          { label: "Panca", uid: "3" },
          { label: "Exercise 2", uid: "4" },
          { label: "Exercise 3", uid: "5" },
        ],
      },
      {
        label: "Day B",
        uid: "6",
        icon: "calendar_view_day",
        children: [
          { label: "Exercise B", uid: "7" },
          { label: "Exercise F", uid: "8" },
        ],
      },
      {
        label: "Day C",
        uid: "9",
        icon: "calendar_view_day",
        children: [
          { label: "Panca", uid: "10" },
          { label: "Exercise 77", uid: "11" },
        ],
      },
    ],
  },
  {
    label: "Week 2",
    uid: "12",
    icon: "calendar_view_week",
    children: [
      {
        label: "Day A",
        uid: "13",
        icon: "calendar_view_day",
        children: [
          { label: "Panca", uid: "14" },
          { label: "Exercise 2", uid: "15" },
          { label: "Exercise 3", uid: "16" },
        ],
      },
      {
        label: "Day B",
        uid: "17",
        icon: "calendar_view_day",
        children: [
          { label: "Exercise B", uid: "18" },
          { label: "Exercise F", uid: "19" },
        ],
      },
      {
        label: "Day C",
        uid: "20",
        icon: "calendar_view_day",
        children: [
          { label: "Panca", uid: "21" },
          { label: "Exercise 77", uid: "22" },
        ],
      },
    ],
  },
];

const resetFilter = () => {
  filter.value = "";
  filterRef.value.focus();
};

// LEFT TAB EXERCISE LIBRARY
const ticked = ref<string[]>([]);
const propsExercises = [
  {
    label: "Panca",
    uid: "2",
    children: [
      { label: "Panca larga", uid: "3" },
      { label: "Panca stretta", uid: "4" },
      { label: "Panca Mezzo ROM", uid: "5" },
    ],
  },
  {
    label: "Pull up",
    uid: "6",
    children: [
      { label: "Pull up zavorrati", uid: "7" },
      { label: "Pull up con fermo in alto", uid: "8" },
    ],
  },
  {
    label: "Squat",
    uid: "9",
    children: [
      { label: "Squat esplosivo", uid: "10" },
      { label: "Squat fermo in buca", uid: "11" },
    ],
  },
];

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
</style>
