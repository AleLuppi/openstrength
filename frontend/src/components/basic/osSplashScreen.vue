<template>
  <div :class="{ loader: true, fadeout: !props.isLoading }">
    <img
      class="items-center q-mt-lg"
      :src="logoFullImage"
      :srcset="logoFullImage + ' 0.2x'"
      alt="Logo"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
});

import { logoFullImage } from "@/assets/sources";
</script>

<style scoped>
.loader {
  background-color: #ffffff;
  bottom: 0;
  display: block;
  font-size: 32px;
  left: 0;
  overflow: hidden;
  padding-top: 10vh;
  position: fixed;
  right: 0;
  text-align: center;
  top: 0;
}

.fadeout {
  animation: fadeout 1s forwards;
}

@keyframes fadeout {
  to {
    opacity: 0;
    visibility: hidden;
  }
}
</style>
