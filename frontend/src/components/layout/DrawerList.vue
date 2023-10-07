<template>
  <q-list>
    <!-- Greet with user -->
    <router-link :to="{ name: 'profile' }"
      ><q-item-label header>{{
        user.isSignedIn
          ? user.displayName
            ? $t("layout.drawer.welcome_logged_in", { name: user.displayName })
            : $t("layout.drawer.welcome_logged_in_noname")
          : $t("layout.drawer.welcome_logged_out")
      }}</q-item-label></router-link
    >

    <!-- Display each page title as a separate item -->
    <q-item
      v-for="(icon, page) in drawerPages"
      :key="page"
      clickable
      tag="a"
      :to="{ name: page }"
      active-class="os-child-bg-primary"
    >
      <!-- Icon near text on expanded drawer -->
      <q-item-section v-if="!props.mini" avatar>
        <q-icon :name="icon" />
      </q-item-section>
      <q-item-section v-if="!props.mini">
        <q-item-label>{{ $t("layout.views." + page) }}</q-item-label>
      </q-item-section>

      <!-- Icon over text on mini drawer -->
      <q-card v-else flat class="q-py-sm bg-inherit width-90">
        <q-avatar :icon="icon" />
        <p>{{ $t("layout.views." + page) }}</p>
      </q-card>
    </q-item>

    <!-- TODO add space -->

    <!-- Finally display profile item -->
    <q-item
      clickable
      tag="a"
      :to="{ name: user.isSignedIn ? 'profile' : 'login' }"
      active-class="os-child-bg-primary"
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
import { useUserStore } from "@/stores/user";

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
const drawerPages = {
  home: "fa-solid fa-house-chimney",
  athletes: "fa-solid fa-users",
  schedule: "fa-solid fa-dumbbell",
  library: "fa-solid fa-book",
};
</script>

<style scoped lang="scss">
.os-child-bg-primary > .q-card {
  background: $primary;
  color: $lightest;
}
</style>
