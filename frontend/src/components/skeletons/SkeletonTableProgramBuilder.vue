<template>
  <div>
    <SkeletonTableSheet
      :columns="7"
      :types="[
        'text',
        'text',
        'text',
        'text',
        'text',
        'QCheckbox',
        'QCheckbox',
      ]"
      :widths="['10%', '10%', '10%', '10%', '46%', '7%', '7%']"
    ></SkeletonTableSheet>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';

const SkeletonTableSheet = defineAsyncComponent(
  () => import('components/skeletons/SkeletonTableSheet.vue')
);
</script>
