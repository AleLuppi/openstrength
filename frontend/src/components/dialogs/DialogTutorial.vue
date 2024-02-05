<template>
  <q-dialog>
    <q-card class="q-pa-sm dialog-min-width">
      <q-card-section class="row items-center q-pb-none">
        <div class="row">
          <h5>{{ title }}</h5>

          <q-btn
            :icon="pauseAnimation === false ? 'pause' : 'play_arrow'"
            color="light-dark"
            flat
            outline
            round
            @click="pauseAnimation = !pauseAnimation"
          ></q-btn>
        </div>

        <q-space />
        <q-btn
          icon="close"
          flat
          round
          dense
          color="button-negative"
          v-close-popup
        />
      </q-card-section>
      <q-card-section class="column justify-center">
        <p>{{ subtitle }}</p>
        <Vue3Lottie
          :animationData="animationData"
          :pause-animation="pauseAnimation"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";

defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: false,
  },
  animationData: {
    type: Object,
    required: false,
  },
});

const pauseAnimation = ref(false);
</script>
