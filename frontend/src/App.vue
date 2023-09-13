<template>
  <q-layout view="lHh Lpr lFf">
    <q-header v-if="showHeader" bordered class="bg-lightest text-light">
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

        <q-toolbar-title></q-toolbar-title>

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

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="bg-lighter"
    >
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
