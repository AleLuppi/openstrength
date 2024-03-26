<template>
  <q-layout view="lHh LpR lFf">
    <!-- Header -->
    <HeaderMain
      v-if="$q.screen.lt.md"
      :allow-left-drawer="!leftDrawerOpen || $q.screen.lt.md"
      :is-user-signed-in="user.isSignedIn"
      @open-left="leftDrawerOpen = !leftDrawerOpen"
    />

    <!-- Left drawer -->
    <DrawerLeftMain v-model="leftDrawerOpen" />

    <!-- Optional right drawer -->
    <component
      :is="rightDrawerElement"
      v-if="rightDrawerElement && $q.screen.gt.sm"
      v-model="rightDrawerOpen"
      toggle
      side="right"
      show-if-above
      bordered
      :width="50"
      class="bg-lightest"
    />

    <!-- Actual page content -->
    <q-page-container>
      <router-view v-slot="{ Component }">
        <component
          :is="Component"
          @request-global-dialog="onShowGlobalDialog"
        />
      </router-view>
    </q-page-container>

    <!-- TODO Footer -->
    <q-footer v-if="false"></q-footer>

    <!-- FIXME Show optional global dialogs -->
    <q-dialog v-model="showDialogOnboarding">
      <UserOnboarding @submit="onOnboardingSubmit"></UserOnboarding>
    </q-dialog>
  </q-layout>
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "@/stores/user";
import { useCoachInfoStore } from "@/stores/coachInfo";
import { User, UserRole } from "@/helpers/users/user";
import { ProgramExercise } from "@/helpers/programs/program";
import { sortExercises } from "@/helpers/exercises/listManagement";
import { defaultExerciseCollection } from "@/utils/defaultExerciseCollection";
import { computed } from "vue";
import { NamedRoutes } from "src/router";

// Import async components
const HeaderMain = defineAsyncComponent(
  () => import("@/components/layout/HeaderMain.vue"),
);
const DrawerLeftMain = defineAsyncComponent(
  () => import("@/components/layout/DrawerLeftMain.vue"),
);
const UserOnboarding = defineAsyncComponent(
  () => import("@/components/forms/UserOnboarding.vue"),
);
const DrawerRightProgramBuilder = defineAsyncComponent(
  () => import("@/components/layout/DrawerRightProgramBuilder.vue"),
);

// Init plugin
const route = useRoute();

// Get state
const user = useUserStore();
const coachInfo = useCoachInfoStore();

// Set ref
const leftDrawerOpen = ref(false);
const rightDrawerOpen = ref(false);

// Global dialogs ref
const showDialogOnboarding = ref(false);

// Get correct right drawer to display
const rightDrawerElement = computed(() => {
  switch (route.name) {
    case NamedRoutes.program:
      return DrawerRightProgramBuilder;
    default:
      return undefined;
  }
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
