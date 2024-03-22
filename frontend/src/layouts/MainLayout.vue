<template>
  <main>
    <transition name="fade">
      <osSplashScreen v-if="isLoading" />
    </transition>
    <q-layout
      view="lHh LpR lFf"
      @mousedown="interacted = true"
      @scroll="interacted = true"
      @touchstart="interacted = true"
    >
      <!-- Header -->
      <q-header
        v-if="showHeaderSm || showHeaderLg"
        bordered
        class="bg-lightest text-light"
      >
        <q-toolbar
          v-if="
            (showHeaderSm && $q.screen.lt.md) ||
            (showHeaderLg && !$q.screen.lt.md)
          "
        >
          <q-btn
            v-if="showLeftDrawer && (!leftDrawerOpen || $q.screen.lt.md)"
            flat
            dense
            round
            @click="leftDrawerOpen = !leftDrawerOpen"
            aria-label="Menu"
            icon="menu"
          />

          <q-btn
            flat
            dense
            aria-label="To home"
            :to="{
              name: user.isSignedIn ? NamedRoutes.home : NamedRoutes.landing,
            }"
          >
            <img
              :src="logoTextOnly"
              alt="Logo OpenStrength"
              style="height: 20px"
            />
          </q-btn>

          <q-space />

          <!-- Action buttons -->
          <q-btn
            icon-right="person"
            :label="
              $q.screen.lt.md
                ? undefined
                : user.isSignedIn
                ? $t('layout.header.to_profile')
                : $t('layout.header.to_login')
            "
            :to="{ name: NamedRoutes.profile }"
            color="primary"
          />
        </q-toolbar>
      </q-header>

      <!-- Left drawer -->
      <q-drawer
        v-if="showLeftDrawer"
        v-model="leftDrawerOpen"
        side="left"
        show-if-above
        bordered
        mini
        :mini-width="100"
        class="bg-lightest"
      >
        <LeftDrawerElements />

        <template v-slot:mini>
          <LeftDrawerElements :mini="true" />
        </template>
      </q-drawer>

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
          @drawerClick="onRightDrawerClick"
          :active="rightDrawerActive"
        ></component>
      </q-drawer>

      <!-- Actual page content -->
      <q-page-container>
        <RouterView v-slot="{ Component }">
          <component
            ref="viewComponent"
            :is="Component"
            @request-global-dialog="onShowGlobalDialog"
            @activateDrawerItem="(item: number) => (rightDrawerActive = item)"
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
  </main>
</template>

<script setup lang="ts">
import {
  computed,
  defineAsyncComponent,
  onBeforeMount,
  onMounted,
  ref,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { User as FirebaseUser } from 'firebase/auth';
import { NamedRoutes } from 'src/router';
import { auth } from 'src/firebase';
import { useUserStore } from 'stores/user';
import { useCoachInfoStore } from 'stores/coachInfo';
import { addCallbackOnAuthStateChanged } from 'src/helpers/users/auth';
import { User, UserRole } from 'src/helpers/users/user';
import { ProgramExercise } from 'src/helpers/programs/program';
import { sortExercises } from 'src/helpers/exercises/listManagement';
import { setLocale } from 'src/helpers/locales';
import { defaultExerciseCollection } from 'src/utils/defaultExerciseCollection';
import { event } from 'vue-gtag';
import mixpanel from 'mixpanel-browser';
import { logoTextOnly } from 'assets/sources';

// Import async components
const osSplashScreen = defineAsyncComponent(
  () => import('components/layout/SplashScreen.vue')
);
const LeftDrawerElements = defineAsyncComponent(
  () => import('components/layout/LeftDrawerElements.vue')
);
const UserOnboarding = defineAsyncComponent(
  () => import('components/forms/UserOnboarding.vue')
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
const showHeaderSm = computed(
  () => route.meta?.showHeaderSm ?? route.meta?.showHeader ?? true
);
const showHeaderLg = computed(
  () => route.meta?.showHeaderLg ?? route.meta?.showHeader ?? false
);
const showFooter = computed(() => route.meta?.showFooter ?? true);
const showLeftDrawer = computed(() => route.meta?.showLeftDrawer ?? true);
const isLoading = ref(true);

// Global dialogs ref
const showDialogOnboarding = ref(false);

// Check if any interaction with the app has ever occurred
let interacted = false;

// Run few useful things before app starts rendering
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
});

// Run few useful things when app is ready to be displayed
onMounted(() => {
  // Set a maximum splash screen duration
  setTimeout(() => {
    isLoading.value = false;
  }, 2000);
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
            exercise.variants?.forEach((variant) => variant.saveNew())
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
  event('programview_rightdrawer_click', {
    event_category: 'documentation',
    event_label: 'The right drawer has been clicked in ProgramView',
    value: 1,
  });

  // Mixpanel tracking
  mixpanel.track('Right drawer clicked', {
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
    case 'onboarding':
      showDialogOnboarding.value = true;
      break;
  }
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
