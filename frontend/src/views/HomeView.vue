<template>
  <div class="q-pa-md">
    <!-- Title -->
    <div class="row items-center">
      <h2 class="col">{{ $t("layout.views.home") }}</h2>

      <!-- TODO -->
      <q-btn icon="add" label="Add athlete" />
    </div>

    <!-- Navigation -->
    <q-tabs v-model="selectedTab" class="text-dark">
      <q-tab
        v-for="tab in ['all', 'scheduled', 'unscheduled']"
        :key="tab"
        :name="tab"
        :label="$t('coach.athlete_management.filter.' + tab)"
      />
    </q-tabs>

    <!-- TODO Display resources -->
    <q-tab-panels v-model="selectedTab">
      <q-tab-panel name="all">
        <div class="text-h6">All</div>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </q-tab-panel>

      <q-tab-panel name="scheduled">
        <div class="text-h6">With schedule</div>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </q-tab-panel>

      <q-tab-panel name="unscheduled">
        <div class="text-h6">Missing schedule</div>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const selectedTab = ref("all");
</script>

<style scoped lang="scss"></style>
