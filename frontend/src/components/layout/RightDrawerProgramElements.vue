<template>
  <q-list>
    <q-item
      v-for="(drawerItem, drawerIndex) in drawerItems"
      :key="drawerItem.id"
      clickable
      class="q-px-none q-py-sm link-child justify-center"
      @click="emit('drawerClick', drawerIndex)"
    >
      <q-card flat class="bg-inherit">
        <q-tooltip anchor="center left" self="center right" :offset="[10, 10]">
          {{ $t(drawerItem.tooltip) }}
        </q-tooltip>
        <q-avatar :icon="drawerItem.icon" />
      </q-card>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
const emit = defineEmits(["drawerClick"]);

// Set items in drawer
const drawerItems = [
  {
    id: "list",
    tooltip: "coach.program_management.builder.show_program_list",
    icon: "fa-solid fa-bars-staggered",
  },
  {
    id: "charts",
    tooltip: "coach.program_management.builder.show_charts_tooltip",
    icon: "fa-solid fa-chart-line",
  },
  {
    id: "maxlifts",
    tooltip: "coach.program_management.builder.show_maxlifts_tooltip",
    icon: "fa-solid fa-table-list",
  },
];
</script>
