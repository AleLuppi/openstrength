<template>
  <q-list>
    <!-- Display each page title as a separate item -->
    <q-item
      v-for="page in drawerPages"
      :key="page.route"
      clickable
      tag="a"
      :to="{ name: page.route }"
      active-class="os-child-highlight-primary"
      class="link-child os-text-unselected"
    >
      <!-- Icon near text on expanded drawer -->
      <q-item-section v-if="!props.mini" avatar>
        <q-icon :name="page.icon" />
      </q-item-section>
      <q-item-section v-if="!props.mini">
        <q-item-label>{{ $t(page.caption) }}</q-item-label>
      </q-item-section>

      <!-- Icon over text on mini drawer -->
      <q-card v-else flat class="q-py-sm bg-inherit width-90">
        <q-avatar :icon="page.icon" />
        <p>{{ $t(page.caption) }}</p>
      </q-card>
    </q-item>

    <!-- TODO add space -->

    <!-- Finally display profile item -->
    <q-item
      clickable
      tag="a"
      :to="{ name: user.isSignedIn ? 'profile' : 'login' }"
      active-class="os-child-highlight-primary"
      class="link-child os-text-unselected"
    >
      <!-- Icon near text on expanded drawer -->
      <q-item-section v-if="!props.mini" avatar>
        <q-icon
          :name="
            user.isSignedIn
              ? 'fa-solid fa-circle-user'
              : 'fa-solid fa-right-to-bracket'
          "
        />
      </q-item-section>
      <q-item-section v-if="!props.mini">
        <q-item-label>{{
          $t("layout.views." + (user.isSignedIn ? "profile" : "signin"))
        }}</q-item-label>
      </q-item-section>

      <!-- Icon over text on mini drawer -->
      <q-card v-else flat class="q-py-sm bg-inherit width-90">
        <q-avatar
          :icon="
            user.isSignedIn
              ? 'fa-solid fa-circle-user'
              : 'fa-solid fa-right-to-bracket'
          "
        />
        <p>
          {{ $t("layout.views." + (user.isSignedIn ? "profile" : "signin")) }}
        </p>
      </q-card>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import { computed } from "vue";
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { routeAccessibleByUser } from "@/router/routeAccessManagement";

// Set props
const props = defineProps({
  mini: {
    type: Boolean,
    default: false,
  },
});

// Get user state
const user = useUserStore();

// Set navigation in drawer
const allDrawerPages = [
  {
    route: "home",
    caption: "layout.views.home",
    icon: "fa-solid fa-house-chimney",
  },
  {
    route: "athletes",
    caption: "layout.views.athletes",
    icon: "fa-solid fa-users",
  },
  {
    route: "library",
    caption: "layout.views.library",
    icon: "fa-solid fa-book",
  },
  {
    route: "program",
    caption: "layout.views.program",
    icon: "fa-solid fa-dumbbell",
  },
  {
    route: "program_library",
    caption: "layout.views.programlibrary",
    icon: "fa-solid fa-sheet-plastic",
  },
];

// Limit shown page to those accessible by user
const drawerPages = computed(() =>
  allDrawerPages.filter((page) => {
    const route = router
      .getRoutes()
      .find((route) => String(route.name) == page.route);
    return route && routeAccessibleByUser(user, route);
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
  color: $os-secondary-6 !important;
}
</style>
