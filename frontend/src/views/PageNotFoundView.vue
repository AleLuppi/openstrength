<template>
  <!-- Show coming soon in case of athlete -->
  <div class="q-mx-auto q-px-md q-py-lg limit-max-width text-center">
    <h2>
      {{ $t("pagenotfound.title") }}
    </h2>

    <img :src="logo404Image" alt="Page not found" />

    <p>
      {{ $t("pagenotfound.subtitle") }}
    </p>

    <router-link :to="{ name: 'home' }" class="q-pa-lg"
      >{{ $t("pagenotfound.redirect") }}
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { logo404Image } from "@/assets/sources";
</script>
