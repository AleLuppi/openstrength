<template>
  <q-card>
    <q-card-section>
      <TableProgramBuilderGod
        v-model="modelValue"
        :filter="filter"
        :readonly="readonly"
      />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import type { Program } from "@/helpers/programs/program";

// Import components
const TableProgramBuilderGod = defineAsyncComponent(
  () => import("@/components/table-god/TableProgramBuilderGod.vue"),
);

// Define props
withDefaults(
  defineProps<{
    // show only a selected subset of the program
    filter?: {
      week: string[];
      day: string[];
      exercise: string[];
    };

    // whether table should be in readonly mode
    readonly?: boolean;
  }>(),
  {
    filter: () => ({ week: [], day: [], exercise: [] }),
    readonly: false,
  },
);

// Define models
const modelValue = defineModel<Program>({ required: true }); // TODOprogram
</script>
