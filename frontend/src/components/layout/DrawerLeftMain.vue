<template>
  <q-drawer
    v-model="isOpen"
    side="left"
    show-if-above
    bordered
    mini
    :mini-width="100"
    class="bg-lightest"
    @mini-state="(val) => (isMini = val)"
  >
    <q-list>
      <!-- Display each page title as a separate item -->
      <q-item
        v-for="page in drawerPages"
        :key="page.route"
        tag="a"
        :to="{ name: page.route }"
        active-class="os-child-highlight-primary"
        class="link-child os-text-unselected"
        :class="{ 'beta-feature': false }"
      >
        <!-- Icon near text on expanded drawer -->
        <q-item-section v-if="!isMini" avatar>
          <q-icon :name="page.icon" />
        </q-item-section>
        <q-item-section v-if="!isMini">
          <q-item-label>{{ $t(page.caption) }}</q-item-label>
        </q-item-section>

        <!-- Icon over text on mini drawer -->
        <q-card v-else flat class="q-py-sm bg-inherit width-90">
          <q-avatar :icon="page.icon" size="lg" />
          <p>{{ $t(page.caption) }}</p>
        </q-card>
      </q-item>
    </q-list>
  </q-drawer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import type { QDrawerProps } from "quasar";
import {
  fasBook,
  fasCircleUser,
  fasDumbbell,
  fasHouseChimney,
  fasRightToBracket,
  fasSheetPlastic,
  fasUsers,
} from "@quasar/extras/fontawesome-v6";
import { NamedRoutes } from "@/router";
import { useUserStore } from "@/stores/user";
import { routeAccessibleByUser } from "@//router/routeAccessManagement";

// Init plugin
const router = useRouter();

// Set props
const props = defineProps<QDrawerProps>();

// Get user state
const user = useUserStore();

// Define drawer model value
const isOpen = defineModel<boolean>();

// Check mini state
const isMini = ref(props.mini);

// Set navigation in drawer
const allDrawerPages = ref([
  {
    route: NamedRoutes.home,
    caption: "layout.views.home",
    icon: fasHouseChimney,
  },
  {
    route: NamedRoutes.athletes,
    caption: "layout.views.athletes",
    icon: fasUsers,
  },
  {
    route: NamedRoutes.program,
    caption: "layout.views.program",
    icon: fasDumbbell,
  },
  {
    route: NamedRoutes.exerciseLibrary,
    caption: "layout.views.library",
    icon: fasBook,
  },
  {
    route: NamedRoutes.programLibrary,
    caption: "layout.views.programlibrary",
    icon: fasSheetPlastic,
  },
  {
    route: NamedRoutes.login,
    caption: "layout.views.signin",
    icon: fasRightToBracket,
  },
]);

// Update profile icon and text based on user login status
watch(
  () => user.isSignedIn,
  (signedIn) => {
    const objToUpdate = allDrawerPages.value.at(-1);
    if (!objToUpdate) return;
    if (signedIn) {
      objToUpdate.route = NamedRoutes.profile;
      objToUpdate.caption = "layout.views.profile";
      objToUpdate.icon = fasCircleUser;
    } else {
      Object.assign(objToUpdate, {
        route: NamedRoutes.login,
        caption: "layout.views.signin",
        icon: fasRightToBracket,
      });
    }
  },
  { immediate: true },
);

// Limit shown page to those accessible by user
const drawerPages = computed(() =>
  allDrawerPages.value.filter((page) => {
    const route = router
      .getRoutes()
      .find((route) => String(route.name) == page.route);
    return (
      route &&
      (routeAccessibleByUser(user, route) || route.name == NamedRoutes.home)
    );
  }),
);
</script>

<style scoped lang="scss">
.os-child-highlight-primary {
  & > .q-card {
    background: $primary;
    color: $lightest;
  }

  & > .q-item__section {
    border-bottom: solid 3px $primary;
  }
}

.os-text-unselected {
  color: $os-secondary-6;
}

.beta-feature::after {
  content: "beta";
  display: inline-block;
  position: absolute;
  top: 5px;
  right: 3px;
  background-color: $indigo-7;
  color: white;
  padding: 0 6px;
  border-radius: 20px;
}
</style>
