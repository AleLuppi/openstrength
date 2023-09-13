<template>
  <q-layout view="lHh Lpr lFf">
    <q-header v-if="showHeader" elevated>
      <q-toolbar>
        <q-btn
          v-if="!leftDrawerOpen || $q.screen.lt.md"
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
          aria-label="Menu"
          icon="menu"
        />

        <q-toolbar-title> DBM </q-toolbar-title>

        <!-- TODO action to buttons -->
        <q-btn
          icon="question_answer"
          :label="$q.screen.gt.sm ? $t('layout.header.button_feedback') : ''"
          :round="!$q.screen.gt.sm"
          no-caps
          flat
        />
        <q-btn icon="notifications" flat round />
        <q-btn icon="help" flat round />
        <q-btn icon="person" flat round :to="{ name: 'profile' }" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-grey-2">
      <DrawerList />
    </q-drawer>

    <q-page-container>
      <RouterView />
    </q-page-container>

    <q-footer v-if="showFooter">
      <!-- TODO -->
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import { useQuasar } from "quasar";
import DrawerList from "@/components/layout/DrawerList.vue";

// Init plugin
const $q = useQuasar();

// Set ref
const route = useRoute();
const leftDrawerOpen = ref(false);
const showHeader = computed(() => route.meta?.showHeader ?? true);
const showFooter = computed(() => route.meta?.showFooter ?? true);
</script>

<style lang="scss">
@import "@/styles/quasar.variables.scss";

// Setup chart colors
.text-chart-color1 {
  color: $chart-color1 !important;
}

.text-chart-color2 {
  color: $chart-color2 !important;
}

.text-chart-color3 {
  color: $chart-color3 !important;
}

.prevent-select {
  -webkit-user-select: none; // Safari
  -ms-user-select: none; // IE 10 and IE 11
  user-select: none; // Standard syntax
}
</style>
