<template>
  <q-drawer v-bind="$props">
    <q-list>
      <q-item
        v-for="(drawerItem, drawerIndex) in drawerItems"
        :key="drawerItem.id"
        clickable
        class="q-pa-sm link-child justify-center"
        :active="appStore.supportDrawerActiveElement == drawerIndex"
        active-class="os-child-highlight-primary"
        @click="() => onClick(drawerIndex)"
      >
        <q-card flat class="bg-inherit">
          <q-tooltip
            anchor="center left"
            self="center right"
            :offset="[10, 10]"
          >
            {{ $t(drawerItem.tooltip) }}
          </q-tooltip>
          <q-avatar :icon="drawerItem.icon" size="3em" />
        </q-card>
      </q-item>
    </q-list>
  </q-drawer>
</template>

<script setup lang="ts">
import type { QDrawerProps } from "quasar";
import {
  fasBarsStaggered,
  fasChartLine,
  fasMedal,
  farCommentDots,
} from "@quasar/extras/fontawesome-v6";
import { useAppStore } from "src/stores/app";

// Define props
const props = defineProps<QDrawerProps & { toggle?: boolean }>();

// Init plugin
const appStore = useAppStore();

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

/**
 * Update active element on drawer click.
 *
 * @param idx index of the clicked element.
 */
function onClick(idx: number) {
  if (props.toggle && appStore.supportDrawerActiveElement == idx) {
    appStore.supportDrawerActiveElement = undefined;
  } else appStore.supportDrawerActiveElement = idx;
}
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
