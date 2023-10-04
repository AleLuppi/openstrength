<template>
  <div id="q-app">
    <div class="q-pa-md row q-gutter-sm">
      <div>
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
          <q-input ref="filterRef" filled v-model="filter" label="Filter">
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

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
</script>
