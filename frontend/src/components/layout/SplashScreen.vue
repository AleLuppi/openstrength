<template>
  <div class="loader">
    <img :src="logoFullImage" :srcset="logoFullImage + ' 0.2x'" alt="Logo" />
  </div>
</template>

<script setup lang="ts">
import { logoFullImage } from "@/assets/sources";
</script>

<style scoped>
.loader {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  overflow: hidden;
  background-color: #ffffff;
  z-index: 999999;

  & > img {
    position: absolute;
    top: 45%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
