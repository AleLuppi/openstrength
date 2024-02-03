<template>
  <q-page class="q-pa-sm q-pb-lg q-mx-auto column">
    <!-- Top bar -->
    <div class="row justify-between align-top">
      <img :src="logoFullImage" :srcset="logoFullImage + ' 2.2x'" alt="Logo" />

      <q-btn :to="{ name: 'login' }"> Ho gia l'accesso </q-btn>
    </div>

    <!-- Title -->
    <div class="text-center q-pt-sm q-pb-lg">
      <iframe
        width="540"
        height="620"
        src="https://04100aab.sibforms.com/serve/MUIFAGau8X6cNhMK5su1zd2oiRe-vYxGzaADq_9AVzoJIzOWkxD_6zJquLAeWUJUD-Qdjt7usqEYxVyzOf39BZMeMShsLf5FfAiWM1WF-weIDcihejcN1gt8vZn_Hzo7CPgZgUTAk27in8ZNqKJ0WIismmbfCkKz_DL4HmPrj0SDtZkshBV-oM2pZG--HswsgJC7O3mDy6iGWtX4"
        frameborder="0"
        scrolling="auto"
        allowfullscreen
        style="
          display: block;
          margin-left: auto;
          margin-right: auto;
          max-width: 100%;
        "
      ></iframe>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { logoFullImage } from "@/assets/sources";
</script>

<style scoped lang="scss"></style>
