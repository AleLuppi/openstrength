<template>
  <q-layout view="lHh LpR lFf">
    <!-- Header -->
    <HeaderMain :is-user-signed-in="user.isSignedIn" />

    <!-- Actual page content -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { useUserStore } from "stores/user";

// Import async components
const HeaderMain = defineAsyncComponent(
  () => import("@/components/layout/HeaderMain.vue"),
);

// Get state
const user = useUserStore();
</script>
