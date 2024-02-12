<template>
  <q-page class="q-pa-sm q-pb-lg column justify-center">
    <!-- Newsletter registration form -->
    <BrevoFormNewsletterSubscription
      :initial-email="user.email"
    ></BrevoFormNewsletterSubscription>
  </q-page>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { useUserStore } from "@/stores/user";

// Import components
const BrevoFormNewsletterSubscription = defineAsyncComponent(
  () => import("@/components/forms/BrevoFormNewsletterSubscription.vue"),
);

// Get user
const user = useUserStore();
</script>
