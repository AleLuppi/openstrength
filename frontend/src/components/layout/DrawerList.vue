<template>
  <q-list>
    <!-- Greet with user -->
    <q-item-label header>{{ user.name }}</q-item-label>

    <!-- Display each page title as a separate item -->
    <q-item
      v-for="(icon, page) in drawerPages"
      :key="page"
      clickable
      tag="a"
      :to="{ name: page }"
    >
      <q-item-section avatar>
        <q-icon :name="icon" />
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ $t("layout.views." + page) }}</q-item-label>
        <q-item-label caption v-if="$t('layout.views.' + page + '_caption')">{{
          $t("layout.views." + page + "_caption")
        }}</q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import { useUserStore } from "@/stores/user";

// Get user state
const user = useUserStore();

// Set navigation in drawer
const drawerPages = {
  home: "fa-solid fa-house-chimney",
  dashboard: "timeline",
  schedule: "fa-solid fa-dumbbell",
  library: "fa-solid fa-book",
};
</script>
