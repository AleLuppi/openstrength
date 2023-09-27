<template>
  <q-list>
    <!-- Greet with user -->
    <q-item-label header
      ><router-link :to="{ name: 'profile' }">{{
        user.isSignedIn
          ? user.displayName
            ? $t("layout.drawer.welcome_logged_in", { name: user.displayName })
            : $t("layout.drawer.welcome_logged_in_noname")
          : $t("layout.drawer.welcome_logged_out")
      }}</router-link></q-item-label
    >

    <!-- Display each page title as a separate item -->
    <q-item
      v-for="(icon, page) in drawerPages"
      :key="page"
      clickable
      class="justify-center"
      tag="a"
      :to="{ name: page }"
    >
      <q-item-section avatar class="drawer-selection">
        <q-icon :name="icon" class="q-px-md" />
        <q-item-label>{{ $t("layout.views." + page) }}</q-item-label>
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
  athletes: "fa-solid fa-users",
  schedule: "fa-solid fa-dumbbell",
  library: "fa-solid fa-book",
};
</script>

<style>
.drawer-selection {
  display: flex;
  flex-direction: column;
  width: 80px;
  height: 80px;
  justify-content: center;
  align-items: center;

  gap: 7px;
  flex-shrink: 0;
}
</style>
