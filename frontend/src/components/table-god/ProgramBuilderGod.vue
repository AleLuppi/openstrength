<template>
  <TableProgramBuilderGod></TableProgramBuilderGod>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";

const TableProgramBuilderGod = defineAsyncComponent(
  () => import("@/components/table-god/TableProgramBuilderGod.vue"),
);
</script>
