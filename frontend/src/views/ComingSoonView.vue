<template>
  <div class="q-mx-auto q-px-md q-py-lg limit-max-width text-center">
    <img :src="logoFullImage" alt="Logo" />
    <h2>
      {{ $t("comingsoon.title") }}
    </h2>
    <p>
      {{ $t("comingsoon.subtitle") }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { logoFullImage } from "@/assets/sources";
</script>
