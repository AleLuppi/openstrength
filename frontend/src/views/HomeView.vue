<template>
  <div class="q-pa-md">
    <!-- Title -->
    <div class="row items-center">
      <h2 class="col">{{ $t("layout.views.home") }}</h2>

      <!-- TODO -->
      <q-btn icon="add" label="Add athlete" />
    </div>

    <!-- TODO Navigation -->
    <q-tabs v-model="selectedTab" align="left" class="text-dark">
      <q-tab name="mails" label="Mails" />
      <q-tab name="alarms" label="Alarms" />
      <q-tab name="movies" label="Movies" />
    </q-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const selectedTab = ref("mails");
</script>

<style scoped lang="scss"></style>
