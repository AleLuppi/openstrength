<template>
  <q-layout
    view="lHh LpR lFf"
    @mousedown="interacted = true"
    @scroll="interacted = true"
    @touchstart="interacted = true"
  >
    <!-- Header -->
    <HeaderMain
      v-if="$q.screen.lt.md"
      :allow-left-drawer="!leftDrawerOpen || $q.screen.lt.md"
      :is-user-signed-in="user.isSignedIn"
      @open-left="leftDrawerOpen = !leftDrawerOpen"
    />

    <!-- Left drawer -->
    <DrawerMainLeft v-model="leftDrawerOpen" />

    <!-- Optional right drawer, customizible by route view -->
    <q-drawer
      v-if="rightDrawerElement && $q.screen.gt.sm"
      v-model="rightDrawerOpen"
      side="right"
      show-if-above
      bordered
      :width="50"
      class="bg-lightest"
    >
      <component
        :is="rightDrawerElement"
        :active="rightDrawerActive"
        @drawer-click="onRightDrawerClick"
      ></component>
    </q-drawer>

    <!-- Actual page content -->
    <q-page-container>
      <RouterView v-slot="{ Component }">
        <component
          :is="Component"
          ref="viewComponent"
          @request-global-dialog="onShowGlobalDialog"
          @activate-drawer-item="(item: number) => (rightDrawerActive = item)"
        />
      </RouterView>
    </q-page-container>

    <!-- Footer -->
    <q-footer v-if="showFooter">
      <!-- TODO -->
    </q-footer>

    <!-- Show optional global dialogs -->
    <q-dialog v-model="showDialogOnboarding">
      <UserOnboarding @submit="onOnboardingSubmit"></UserOnboarding>
    </q-dialog>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { User as FirebaseUser } from "firebase/auth";
import { event } from "vue-gtag";
import mixpanel from "mixpanel-browser";
import { useUserStore } from "@/stores/user";
import { useCoachInfoStore } from "@/stores/coachInfo";
import { addCallbackOnAuthStateChanged } from "@/helpers/users/auth";
import { User, UserRole } from "@/helpers/users/user";
import { ProgramExercise } from "@/helpers/programs/program";
import { sortExercises } from "@/helpers/exercises/listManagement";
import { setLocale } from "@/helpers/locales";
import { defaultExerciseCollection } from "@/utils/defaultExerciseCollection";

// Import async components
const HeaderMain = defineAsyncComponent(
  () => import("@/components/layout/HeaderMain.vue"),
);
const DrawerMainLeft = defineAsyncComponent(
  () => import("@/components/layout/DrawerMainLeft.vue"),
);
const UserOnboarding = defineAsyncComponent(
  () => import("@/components/forms/UserOnboarding.vue"),
);

// Init plugin
const route = useRoute();
const router = useRouter();

// Get state
const user = useUserStore();
const coachInfo = useCoachInfoStore();

// Set ref
const viewComponent = ref<any>(null);
const leftDrawerOpen = ref(false);
const rightDrawerOpen = ref(false);
const rightDrawerElement = computed(() => route.meta?.showRightDrawer);
const rightDrawerActive = ref<number>(-1);
const showFooter = computed(() => route.meta?.showFooter ?? true);

// Global dialogs ref
const showDialogOnboarding = ref(false);

// Check if any interaction with the app has ever occurred
let interacted = false;

// Ensure user storage is up to date with auth
addCallbackOnAuthStateChanged({
  onUserIn: async (firebaseUser: FirebaseUser) => {
    user.loadFirebaseUser(firebaseUser, true);
    await user.loadUser();
    if (user.locale) setLocale(user.locale);

    // Try to move to original page if app has not been used yet, otherwise re-check current page
    if (route.redirectedFrom && !interacted)
      router.replace(route.redirectedFrom);
    else router.replace({ ...route, force: true });

    // Show onboarding dialog if required
    if (!user.role || user.role == UserRole.unknown)
      showDialogOnboarding.value = true;

    // Identify user for proper Mixpanel tracking
    mixpanel.identify(user.uid);
  },
  onUserOut: () => {
    user.$reset();
    coachInfo.$reset();

    // Refresh page to allow redirect if on unauthorized page
    router.replace({ ...route, force: true });
  },
});

/**
 * Actions to perform on onboarding dialog submit.
 *
 * @param data object data that shall be saved in user instance.
 */
async function onOnboardingSubmit(data: { [key: string]: any }) {
  // Save user info
  showDialogOnboarding.value = false;
  Object.assign(user.baseUser as User, data);
  user.saveUser();

  // Assign default exercise library to new coach
  if (user.role === UserRole.coach) {
    coachInfo.loadExercises(undefined, true, {
      onSuccess: (exercises?: ProgramExercise[]) => {
        if (exercises == undefined || exercises.length <= 0) {
          defaultExerciseCollection.forEach((exercise) =>
            exercise.variants?.forEach((variant) => variant.saveNew()),
          );
          coachInfo.exercises = defaultExerciseCollection;
          sortExercises(coachInfo.exercises, true);
        }
      },
    });
  }
}

/**
 * Allow view component to handle custom right drawer click.
 *
 * @param clickParam parameters provided by drawer on click.
 */
function onRightDrawerClick(clickParam: any) {
  viewComponent.value?.handleDrawerClick?.(clickParam);

  // Register GA4 event
  event("programview_rightdrawer_click", {
    event_category: "documentation",
    event_label: "The right drawer has been clicked in ProgramView",
    value: 1,
  });

  // Mixpanel tracking
  mixpanel.track("Right drawer clicked", {
    ClickParameters: String(clickParam),
  });
}

/**
 * Show one of the available global dialogs.
 *
 * Current global dialogs are:
 *  - onboarding
 *
 * @param which select which global dialog to show.
 */
function onShowGlobalDialog(which: string) {
  switch (which) {
    case "onboarding":
      showDialogOnboarding.value = true;
      break;
  }
}
</script>
