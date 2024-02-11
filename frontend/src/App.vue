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
      <q-header v-if="showHeader" bordered class="bg-lightest text-light">
        <q-toolbar v-if="$q.screen.lt.md">
          <q-btn
            v-if="!leftDrawerOpen || $q.screen.lt.md"
            flat
            dense
            round
            @click="leftDrawerOpen = !leftDrawerOpen"
            aria-label="Menu"
            icon="menu"
          />

          <q-space />

          <!-- Action buttons -->
          <q-btn
            icon="person"
            flat
            round
            :to="{ name: 'profile' }"
            color="text-light"
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
        <UserOnboarding :on-submit="onOnboardingSubmit"></UserOnboarding>
      </q-dialog>

      <!-- Show dialog for 12Feb deadline -->
      <q-dialog
        :modelValue="showDialogPresaleDeadline && userNotPaid"
        @update:modelValue="(val) => (showDialogPresaleDeadline = val)"
      >
        <q-card class="q-pa-sm">
          <q-card-section class="q-pb-none">
            <h3 class="text-primary">
              Ancora pochi giorni per provare OpenStrength!
            </h3>
            <q-btn
              flat
              round
              dense
              icon="close"
              color="light-dark"
              v-close-popup
              style="position: absolute; top: 0; right: 0"
            />
          </q-card-section>
          <q-card-section>
            <p class="q-pb-md text-md">
              Hai tempo fino al 12 Febbraio per provare liberamente
              OpenStrength, poi limiteremo gli accessi per qualche mese.
            </p>
            <p class="q-pb-md text-md">
              Vuoi continuare ad usare l'app?
              <span class="text-bold">Scrivici!</span>
            </p>

            <div
              v-for="[name, email, emailcc, whatsapp, instagram] in [
                [
                  'Lorenzo Amadori',
                  'lorenzo.amadori1996@gmail.com',
                  'lorenzo.boffa06@gmail.com',
                  '393405489016',
                  'amalo96',
                ],
                [
                  'Lorenzo Boffa',
                  'lorenzo.boffa06@gmail.com',
                  'lorenzo.amadori1996@gmail.com',
                  '393468660263',
                  'loreboffa',
                ],
              ]"
              class="row justify-between items-center q-col-gutter-md q-mb-md"
              :key="name"
            >
              <div class="col">
                <p class="text-bold" style="font-size: 1.1em">{{ name }}:</p>
              </div>
              <div>
                <a
                  :href="
                    'mailto:' +
                    email +
                    '?subject=OpenStrength: accesso piattaforma' +
                    '&body=Ciao, vorrei avere più informazioni riguardo all\'accesso a OpenStrength.' +
                    (emailcc ? '&cc=' + emailcc : '')
                  "
                >
                  {{ email }}
                </a>
              </div>
              <div>
                <q-btn
                  icon="fab fah fa-whatsapp"
                  round
                  :href="
                    'https://wa.me/' +
                    whatsapp +
                    '?text=Ciao!%20Vorrei%20qualche%20informazione%20in%20più%20riguardo%20a%20OpenStrength'
                  "
                  target="_blank"
                  style="background-color: #25d366 !important"
                ></q-btn>
              </div>
              <div>
                <q-btn
                  icon="fab fah fa-instagram"
                  round
                  :href="'https://www.instagram.com/' + instagram"
                  target="_blank"
                  style="background-color: #e1306c !important"
                ></q-btn>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-dialog>
    </q-layout>
  </main>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onBeforeMount,
  onMounted,
  defineAsyncComponent,
  watch,
} from "vue";
import { useRoute } from "vue-router";
import { User as FirebaseUser } from "firebase/auth";
import router, { NamedRoutes } from "@/router";
import setdefaults from "@/boot/setQuasarDefaultProps";
import { auth } from "@/firebase";
import { useUserStore } from "@/stores/user";
import { useCoachInfoStore } from "@/stores/coachInfo";
import { addCallbackOnAuthStateChanged } from "@/helpers/users/auth";
import { User, UserRole } from "@/helpers/users/user";
import { ProgramExercise } from "@/helpers/programs/program";
import { sortExercises } from "@/helpers/exercises/listManagement";
import { setLocale } from "@/helpers/locales";
import { defaultExerciseCollection } from "@/utils/defaultExerciseCollection";
import { event } from "vue-gtag";
import mixpanel from "mixpanel-browser";

// Import async components
const osSplashScreen = defineAsyncComponent(
  () => import("@/components/layout/SplashScreen.vue"),
);
const LeftDrawerElements = defineAsyncComponent(
  () => import("@/components/layout/LeftDrawerElements.vue"),
);
const UserOnboarding = defineAsyncComponent(
  () => import("@/components/forms/UserOnboarding.vue"),
);

// Init plugin
const route = useRoute();

// Get state
const user = useUserStore();
const coachInfo = useCoachInfoStore();

// Set ref
const viewComponent = ref<any>(null);
const leftDrawerOpen = ref(false);
const rightDrawerOpen = ref(false);
const rightDrawerElement = computed(() => route.meta?.showRightDrawer);
const rightDrawerActive = ref<number>(-1);
const showHeader = computed(() => route.meta?.showHeader ?? true);
const showFooter = computed(() => route.meta?.showFooter ?? true);
const showLeftDrawer = computed(() => route.meta?.showLeftDrawer ?? true);
const isLoading = ref(true);

// Global dialogs ref
const showDialogOnboarding = ref(false);
const showDialogPresaleDeadline = ref(false);
const userNotPaid = computed(() => {
  return user.uid
    ? ![
        "KZ5LJ59stDRRr9KBGghUbSHYU1s2",
        "Xoq48VdR7dVFCpnrlS74mDbMcg92",
        "L8V8XAXYpBP8SyXMAvggC8uWwDz2",
        "lZwxtl9L7sS5lSOfXrtg3TpXznW2",
        "F3C2gUQEoJURjIbLAahrWZB7gei1",
        "oDuDlOgUInQH0DhKkmYe4FLusYn1",
        "kZe6fi0EYtMLj2t0KKSCjL7Auc52",
        "Dbr71cK84hTCxk2itmDBWeILPlS2",
        "svvwd7Nw36R1vIdwhTtvg4Yiikf1",
        "hk5ZvBR340RCdEAAG5E1Dstav0o1",
        "pU5TTAMVE5TJt712X1cFpqLP3UD3",
        "J5z5k20kN2Vi6UjzVYHkfJskLM92",
        "IIhVf8x1RicwEVdp7TkkH86JBrF3",
      ].includes(user.uid)
    : true;
});

// Show presale dialog after 5 consecutive seconds in home page
let timeoutDialogPresaleDeadline: ReturnType<typeof setTimeout>[] = [];
watch(route, (currRoute) => {
  if (currRoute.name == NamedRoutes.home) {
    timeoutDialogPresaleDeadline.push(
      setTimeout(() => {
        showDialogPresaleDeadline.value = route.name == NamedRoutes.home;
      }, 5000),
    );
  } else if (currRoute.name != NamedRoutes.home) {
    timeoutDialogPresaleDeadline.forEach((timer) => clearTimeout(timer));
    timeoutDialogPresaleDeadline = [];
  }
});
watch(showDialogPresaleDeadline, (showingDialog) => {
  if (!showingDialog) {
    timeoutDialogPresaleDeadline.forEach((timer) => clearTimeout(timer));
    timeoutDialogPresaleDeadline = [];
  }
});

// Check if any interaction with the app has ever occurred
let interacted = false;

// Run few useful things before app starts rendering
onBeforeMount(() => {
  // Set loading state for splashscreen
  isLoading.value = true;

  // Set default props of components
  setdefaults();

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

  // Show presale deadline dialog
  setTimeout(() => {
    showDialogPresaleDeadline.value = true;
  }, 500);
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
          defaultExerciseCollection.forEach(
            (exercise) =>
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

<style scoped lang="scss">
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
