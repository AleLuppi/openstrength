<template>
  <q-page class="q-pa-sm q-pb-lg q-mx-auto column">
    <!-- Top bar -->
    <div class="row justify-between align-top">
      <img :src="logoFullImage" :srcset="logoFullImage + ' 2.2x'" alt="Logo" />

      <q-btn :to="{ name: 'login' }"> Ho gia l'accesso </q-btn>
    </div>

    <!-- Title -->
    <div class="text-center q-pt-sm q-pb-lg">
      <h3>Iscrizione confermata!</h3>
      <p>
        Ti abbiamo appena inviato una mail, cercheremo di tenerti aggiornato
        sulle novità e su quando saranno disponibili nuovi posti.
      </p>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { logoFullImage } from "@/assets/sources";
</script>

<style scoped lang="scss"></style>
