<template>
  <q-layout view="lHh Lpr lFf">
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

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      mini
      :mini-width="100"
      class="bg-lightest"
    >
      <DrawerList />

      <template v-slot:mini>
        <DrawerList :mini="true" />
      </template>
    </q-drawer>

    <q-page-container>
      <RouterView />
    </q-page-container>

    <q-footer v-if="showFooter">
      <!-- TODO -->
    </q-footer>
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
import { setLocale } from "@/helpers/locales";
import DrawerList from "@/components/layout/DrawerList.vue";

// Init plugin
const $q = useQuasar();

// Get state
const user = useUserStore();
const coachInfo = useCoachInfoStore();

// Set ref
const route = useRoute();
const leftDrawerOpen = ref(false);
const showHeader = computed(() => route.meta?.showHeader ?? true);
const showFooter = computed(() => route.meta?.showFooter ?? true);

// Run few useful things before app starts rendering
onBeforeMount(() => {
  // Set default props of components
  setdefaults();

  // Ensure user storage is up to date with auth
  addCallbackOnAuthStateChanged({
    onUserIn: (firebaseUser: FirebaseUser) => {
      user.loadFirebaseUser(firebaseUser);
      if (user.locale) setLocale(user.locale);
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
</script>
