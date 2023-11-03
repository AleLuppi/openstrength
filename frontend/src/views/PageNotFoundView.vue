<template>
  <div class="q-mx-auto q-px-md q-py-lg limit-max-width text-center">
    <h2>
      {{ $t("pagenotfound.title") }}
    </h2>

    <img :src="logo404Image" alt="Page not found" />

    <p>
      {{ $t("pagenotfound.subtitle") }}
    </p>

    <q-btn :to="{ name: 'home' }" class="q-my-md"
      >{{ $t("pagenotfound.redirect") }}
    </q-btn>
  </div>
</template>

<script setup lang="ts">
import { logo404Image } from "@/assets/sources";
</script>
