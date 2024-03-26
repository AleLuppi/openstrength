<template>
  <div>
    <!-- Splash screen on loading -->
    <transition name="fade">
      <osSplashScreen v-if="isLoading" />
    </transition>

    <!-- Main content -->
    <router-view />

    <!-- Global dialogs -->
    <q-dialog v-model="appStore.showDialogOnboarding" no-route-dismiss>
      <UserOnboarding @submit="onOnboardingSubmit"></UserOnboarding>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import {
  defineAsyncComponent,
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  ref,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import mixpanel from "mixpanel-browser";
import { auth } from "@/firebase";
import { useAppStore } from "@/stores/app";
import { useUserStore } from "@/stores/user";
import { useCoachInfoStore } from "@/stores/coachInfo";
import { addCallbackOnAuthStateChanged } from "@/helpers/users/auth";
import { setLocale } from "@/helpers/locales";
import { UserRole } from "@/helpers/users/user";
import { onOnboardingSubmit } from "@/helpers/globalDialogs/manageOnboarding";

// Import components
import osSplashScreen from "@/components/layout/SplashScreen.vue";
const UserOnboarding = defineAsyncComponent(
  () => import("@/components/forms/UserOnboarding.vue"),
);

// Init plugin
const route = useRoute();
const router = useRouter();

// Get state
const appStore = useAppStore();
const user = useUserStore();
const coachInfo = useCoachInfoStore();

// Track loading complete
const isLoading = ref(true);

// Set loading status
onBeforeMount(() => {
  // Set loading state for splashscreen
  isLoading.value = true;

  // React to auth state ready
  auth.authStateReady().then(() => {
    // Reduce delay to hide splash screen
    setTimeout(() => {
      isLoading.value = false;
    }, 500);
  });
});

/**
 * Perform operations when app gets mounted.
 */
onMounted(() => {
  // Set a maximum splash screen duration
  setTimeout(() => {
    isLoading.value = false;
  }, 2000);

  // Register events to track user interaction
  document.body.addEventListener("scroll", onUserInteraction);
  document.body.addEventListener("mousedown", onUserInteraction);
  document.body.addEventListener("touchstart", onUserInteraction);
  document.body.addEventListener("keydown", onUserInteraction);
});

/**
 * Clear stuff before app unmount.
 */
onBeforeUnmount(() => {
  dismissUserInteraction();
});

// Ensure user storage is up to date with auth
addCallbackOnAuthStateChanged({
  onUserIn: async (firebaseUser) => {
    user.loadFirebaseUser(firebaseUser, true);
    await user.loadUser();
    if (user.locale) setLocale(user.locale);

    // Try to move to original page if app has not been used yet, otherwise re-check current page
    if (route.redirectedFrom && !appStore.hasInteracted)
      router.replace(route.redirectedFrom);
    else router.replace({ ...route, force: true });

    // Show onboarding dialog if required
    if (!user.role || user.role == UserRole.unknown)
      appStore.showDialogOnboarding = true;

    // Identify user for proper Mixpanel tracking
    mixpanel.identify(user.uid);
  },

  onUserOut: () => {
    // Reset user-related states
    user.$reset();
    coachInfo.$reset();

    // Refresh page to allow redirect if on unauthorized page
    router.replace({ ...route, force: true });
  },
});

/**
 * Store user interaction with the application.
 */
function onUserInteraction() {
  appStore.hasInteracted = true;
  dismissUserInteraction();
}

/**
 * Clear listeners to user interaction.
 */
function dismissUserInteraction() {
  document.body.removeEventListener("scroll", onUserInteraction);
  document.body.removeEventListener("mousedown", onUserInteraction);
  document.body.removeEventListener("touchstart", onUserInteraction);
  document.body.removeEventListener("keydown", onUserInteraction);
}
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
