<template>
  <q-list>
    <q-item
      v-for="(drawerItem, drawerIndex) in drawerItems"
      :key="drawerItem.id"
      clickable
      class="q-px-none q-py-sm link-child justify-center"
      @click="emits('drawerClick', drawerIndex)"
    >
      <q-card flat class="bg-inherit">
        <q-tooltip anchor="center left" self="center right" :offset="[10, 10]">
          {{ drawerItem.tooltip }}
        </q-tooltip>
        <q-avatar :icon="drawerItem.icon" />
      </q-card>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const emits = defineEmits(["drawerClick"]);

// Use plugins
const i18n = useI18n();

// Set items in drawer
const drawerItems = [
  {
    id: "charts",
    tooltip: i18n.t("coach.program_management.builder.show_charts_tooltip"),
    icon: "fa-solid fa-chart-line",
  },
  {
    id: "maxlifts",
    tooltip: i18n.t("coach.program_management.builder.show_maxlifts_tooltip"),
    icon: "fa-solid fa-table-list",
  },
];
</script>
