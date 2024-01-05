<template>
  <div class="q-pa-md">
    <q-table
      class="q-ma-md q-mb-lg"
      v-for="(block, index) in programDayBlocks"
      :key="index"
      :title="`${block.weekName} - ${block.dayName}`"
      :rows="block.dayRows"
      :columns="columns"
      wrap-cells
      row-key="name"
      flat
      bordered
      hide-bottom
      separator="cell"
      dense
    >
      <!-- Set header style -->
      <template v-slot:header="props">
        <q-tr :props="props" class="bg-table-header">
          <q-th
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
            :width="['40%', '20%', '30%', '5%', '5%']"
          >
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>

      <!-- Custom slots for rendering HTML content -->
      <template v-slot:body-cell-exerciseFullInfo="props">
        <q-td :props="props" class="q-td-selected">
          <div v-html="props.row.exerciseFullInfo"></div>
        </q-td>
      </template>
      <template v-slot:body-cell-schema="props">
        <q-td :props="props" class="q-td-selected">
          <div v-html="props.row.schema"></div>
        </q-td>
      </template>
      <template v-slot:body-cell-schemaNote="props">
        <q-td :props="props" class="q-td-selected">
          <div v-html="props.row.schemaNote"></div>
        </q-td>
      </template>
      <template v-slot:body-cell-textFeedback="props">
        <q-td :props="props" class="q-td-selected">
          <div v-html="props.row.textFeedback"></div>
        </q-td>
      </template>
      <template v-slot:body-cell-videoFeedback="props">
        <q-td :props="props" class="q-td-selected">
          <div v-html="props.row.videoFeedback"></div>
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useCoachInfoStore } from "@/stores/coachInfo";
import { convertProgramToDayBlocks } from "@/helpers/programs/converters";

const coachInfo = useCoachInfoStore();

// Get correct program istance
const program = computed(
  () =>
    coachInfo.programs?.find(
      (program) => program.uid == history.state?.programId,
    ),
);

// Flatten program for visualization
const programDayBlocks = computed(() => {
  return program?.value ? convertProgramToDayBlocks(program.value) : [];
});

//TODO i18n
const columns = [
  {
    name: "exerciseFullInfo",
    label: "Esercizio",
    align: "left",
    field: "exerciseFullInfo",
  },
  {
    name: "schema",
    label: "Schema",
    align: "left",
    field: "schema",
  },
  {
    name: "schemaNote",
    label: "Note",
    align: "left",
    field: "schemaNote",
  },
  {
    name: "textFeedback",
    label: "Feedback",
    align: "left",
    field: "textFeedback",
  },
  {
    name: "videoFeedback",
    label: "Feedback",
    align: "left",
    field: "videoFeedback",
  },
];
</script>
