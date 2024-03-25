<template>
  <q-list>
    <q-item
      v-for="(drawerItem, drawerIndex) in drawerItems"
      :key="drawerItem.id"
      clickable
      class="q-pa-sm link-child justify-center"
      :active="active == drawerIndex"
      active-class="os-child-highlight-primary"
      @click="emit('drawerClick', drawerIndex)"
    >
      <q-card flat class="bg-inherit">
        <q-tooltip anchor="center left" self="center right" :offset="[10, 10]">
          {{ $t(drawerItem.tooltip) }}
        </q-tooltip>
        <q-avatar :icon="drawerItem.icon" size="3em" />
      </q-card>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import {
  fasBarsStaggered,
  fasChartLine,
  fasMedal,
  farCommentDots,
} from "@quasar/extras/fontawesome-v6";

// Define props
withDefaults(
  defineProps<{
    active: number;
  }>(),
  { active: -1 },
);

// Define emits
const emit = defineEmits(["drawerClick"]);

// Set items in drawer
const drawerItems = [
  {
    id: "list",
    tooltip: "coach.program_management.builder.show_program_list",
    icon: fasBarsStaggered,
  },
  {
    id: "charts",
    tooltip: "coach.program_management.builder.show_charts_tooltip",
    icon: fasChartLine,
  },
  {
    id: "maxlifts",
    tooltip: "coach.program_management.builder.show_maxlifts_tooltip",
    icon: fasMedal,
  },
  {
    id: "feedbacks",
    tooltip: "coach.program_management.builder.show_feedbacks_tooltip",
    icon: farCommentDots,
  },
];
</script>

<style scoped lang="scss">
.os-child-highlight-primary {
  & > .q-card {
    background: $primary;
    color: $lightest;
  }

  & > .q-item__section {
    border-bottom: solid 3px $primary;
  }
}
</style>
