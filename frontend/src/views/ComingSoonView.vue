<template>
  <div class="q-pa-md q-pb-lg q-mx-auto limit-max-width">
    <div class="column align-center justify-center">
      <div class="image-container">
        <img :src="imageSrc" alt="Logo" class="centered-image" />
      </div>
      <h2 class="text-center justify-center">
        {{ $t("comingsoon.title") }}
      </h2>
      <p class="text-center">
        {{ $t("comingsoon.subtitle") }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const imageSrc = ref("/assets/logo.png");
</script>

<style scoped>
.image-container {
  max-width: 100%; /* Set the maximum width to 100% to fit the container */
  max-height: 100%; /* Set the maximum height to 100% to fit the container */
  display: flex;
  align-items: center;
  justify-content: center;
}

.centered-image {
  max-width: 100%; /* Set the maximum width to 100% to fit the container */
  max-height: 100%; /* Set the maximum height to 100% to fit the container */
  width: auto; /* Allow the width to scale proportionally */
  height: auto; /* Allow the height to scale proportionally */
}
</style>
