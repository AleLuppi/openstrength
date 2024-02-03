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
        height="520"
        src="https://04100aab.sibforms.com/serve/MUIFAAqUBRyFpSJlBv1W5mhpsMSNL368xklHvig0ghtPOje0rdnxAkdTF-p_HbtLu0VZWBQBL6upG09sA-T-N8gboZ82eVRXpuEa_xyBYmQitlW8qOl-2wZLFR2RC4tN947Ah1Hy62Phxv0CWFE7-6rKqfcripmdOnGlDEpACzc5ZH6udnjkSENQz7iSXB17UtweCRYlxnwOUe5y"
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
