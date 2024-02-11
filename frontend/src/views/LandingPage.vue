<template>
  <q-page class="q-pa-sm q-pb-lg column justify-center">
    <!-- Newsletter registration form -->
    <BrevoFormNewsletterSubscription></BrevoFormNewsletterSubscription>
  </q-page>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";

const BrevoFormNewsletterSubscription = defineAsyncComponent(
  () => import("@/components/forms/BrevoFormNewsletterSubscription.vue"),
);
</script>
