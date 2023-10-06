<template>
  <!-- Optionally render button -->
  <q-btn
    v-if="props && typeof props == 'object' && props.element == 'button'"
    v-bind="props"
    v-on="typeof props == 'object' ? props.on : {}"
  />

  <!-- Optionally render icon -->
  <q-icon
    v-else-if="props && typeof props == 'object' && props.element == 'icon'"
    v-bind="props"
  />

  <!-- Optionally render chip -->
  <q-chip
    v-else-if="props && typeof props == 'object' && props.element == 'chip'"
    v-bind="props"
  />

  <!-- Optionally render avatar -->
  <q-avatar
    v-else-if="props && typeof props == 'object' && props.element == 'avatar'"
    v-bind="props"
  >
    <img v-if="props.src" :src="props.src" />
  </q-avatar>

  <!-- Render string otherwise -->
  <div v-else>{{ props }}</div>
</template>

<script setup lang="ts">
defineProps({ props: { type: [Object, String], default: () => ({}) } });
</script>
