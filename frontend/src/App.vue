<template>
  <div>
    <transition name="fade">
      <osSplashScreen v-if="isLoading" />
    </transition>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, onMounted, ref } from "vue";
import { auth } from "@/firebase";
import osSplashScreen from "@/components/layout/SplashScreen.vue";

// Track loading complete
const isLoading = ref(true);

// Set loading status
onBeforeMount(() => {
  // Set loading state for splashscreen
  isLoading.value = true;

  console.log("set trye");

  // React to auth state ready
  auth.authStateReady().then(() => {
    // Reduce delay to hide splash screen
    setTimeout(() => {
      isLoading.value = false;
    }, 500);
  });
});

// Set a maximum splash screen duration
onMounted(() => {
  setTimeout(() => {
    isLoading.value = false;
    console.log("set trfalseye");
  }, 2000);
});
</script>

<style scoped lang="scss">
.fade-enter-active {
  transition: opacity 0s;
}
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
