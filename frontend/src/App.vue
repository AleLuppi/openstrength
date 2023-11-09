<template>
  <q-layout view="lHh LpR lFf">
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
      v-if="rightDrawerElement"
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
      ></component>
    </q-drawer>

    <!-- Actual page content -->
    <q-page-container>
      <RouterView v-slot="{ Component }">
        <component ref="viewComponent" :is="Component" />
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
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeMount } from "vue";
import { useRoute } from "vue-router";
import { useQuasar } from "quasar";
import { User as FirebaseUser } from "firebase/auth";
import router from "@/router";
import setdefaults from "@/boot/setQuasarDefaultProps";
import { useUserStore } from "@/stores/user";
import { useCoachInfoStore } from "@/stores/coachInfo";
import { addCallbackOnAuthStateChanged } from "@/helpers/users/auth";
import { User, UserRole } from "@/helpers/users/user";
import { setLocale } from "@/helpers/locales";
import LeftDrawerElements from "@/components/layout/LeftDrawerElements.vue";
import UserOnboarding from "@/components/forms/UserOnboarding.vue";

// Init plugin
const route = useRoute();
const $q = useQuasar();

// Get state
const user = useUserStore();
const coachInfo = useCoachInfoStore();

// Set ref
const viewComponent = ref<any>(null);
const leftDrawerOpen = ref(false);
const rightDrawerOpen = ref(false);
const rightDrawerElement = computed(() => route.meta?.showRightDrawer);
const showHeader = computed(() => route.meta?.showHeader ?? true);
const showFooter = computed(() => route.meta?.showFooter ?? true);
const showLeftDrawer = computed(() => route.meta?.showLeftDrawer ?? true);
const showDialogOnboarding = ref(false);

// Run few useful things before app starts rendering
onBeforeMount(() => {
  // Set default props of components
  setdefaults();

  // Ensure user storage is up to date with auth
  addCallbackOnAuthStateChanged({
    onUserIn: async (firebaseUser: FirebaseUser) => {
      user.loadFirebaseUser(firebaseUser, true);
      await user.loadUser();
      if (user.locale) setLocale(user.locale);

      // Show onboarding dialog if required
      if (!user.role || user.role == UserRole.unknown)
        showDialogOnboarding.value = true;
    },
    onUserOut: () => {
      user.$reset();
      coachInfo.$reset();
    },
    onUserChange: () => {
      // Refresh page to ensure user info change accordingly
      router.replace({
        params: { uid: user.uid ?? "" },
      });
    },
  });
});

/**
 * Actions to perform on onboarding dialog submit.
 *
 * @param data object data that shall be saved in user instance.
 */
function onOnboardingSubmit(data: { [key: string]: any }) {
  showDialogOnboarding.value = false;
  Object.assign(user.baseUser as User, data);
  user.saveUser();
}

/**
 * Allow view component to handle custom right drawer click.
 *
 * @param clickParam parameters provided by drawer on click.
 */
function onRightDrawerClick(clickParam: any) {
  viewComponent.value?.handleDrawerClick?.(clickParam);
}
</script>
