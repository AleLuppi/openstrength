<template>
  <q-layout view="lHh LpR lFf">
    <!-- Header -->
    <HeaderMain
      v-if="$q.screen.lt.md"
      :allow-left-drawer="!leftDrawerOpen || $q.screen.lt.md"
      :is-user-signed-in="user.isSignedIn"
      @open-left="leftDrawerOpen = !leftDrawerOpen"
    />

    <!-- Left drawer -->
    <DrawerLeftMain v-model="leftDrawerOpen" />

    <!-- Optional right drawer -->
    <component
      :is="rightDrawerElement"
      v-if="rightDrawerElement && $q.screen.gt.sm"
      v-model="rightDrawerOpen"
      toggle
      side="right"
      show-if-above
      bordered
      :width="50"
      class="bg-lightest"
    />

    <!-- Actual page content -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- TODO Footer -->
    <q-footer v-if="false"></q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "@/stores/user";
import { computed } from "vue";
import { NamedRoutes } from "src/router";

// Import async components
const HeaderMain = defineAsyncComponent(
  () => import("@/components/layout/HeaderMain.vue"),
);
const DrawerLeftMain = defineAsyncComponent(
  () => import("@/components/layout/DrawerLeftMain.vue"),
);
const DrawerRightProgramBuilder = defineAsyncComponent(
  () => import("@/components/layout/DrawerRightProgramBuilder.vue"),
);

// Init plugin
const route = useRoute();

// Get state
const user = useUserStore();

// Set ref
const leftDrawerOpen = ref(false);
const rightDrawerOpen = ref(false);

// Get correct right drawer to display
const rightDrawerElement = computed(() => {
  switch (route.name) {
    case NamedRoutes.program:
      return DrawerRightProgramBuilder;
    default:
      return undefined;
  }
});
</script>
