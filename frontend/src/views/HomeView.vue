<template>
  <router-link v-if="user.role === 'athlete'" :to="{ name: 'comingsoon' }" />

  <div v-else>
    <!-- Create a div container with: padding medium in all direction, large padding bottom, margin left and right auto-->
    <div class="q-pa-md q-pb-lg q-mx-auto limit-max-width">
      <h2 class="text-center">
        {{ $t("homepage.call_to_action", { name: user.name }) }}
      </h2>
    </div>

    <!-- Show common actions -->
    <div class="row q-gutter-lg justify-center items-center">
      <router-link
        v-for="buttonInfo in buttonsInfo"
        :key="buttonInfo.to"
        :to="{ name: buttonInfo.to }"
        class="link-child"
      >
        <q-card
          class="q-pa-lg column items-center justify-center square-card q-hoverable text-center"
        >
          <!-- Animate when on -->
          <span class="q-focus-helper"></span>

          <!-- Show icon, title, and subtitle -->
          <q-icon :name="buttonInfo.icon" size="6em" color="icon-color" />
          <h4>
            {{ $t(buttonInfo.title) }}
          </h4>
          <p class="q-px-md text-weight-light">
            {{ $t(buttonInfo.subtitle) }}
          </p>
        </q-card>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "@/stores/user";

// Get user state
const user = useUserStore();

// Set action buttons
const buttonsInfo = [
  {
    to: "athletes",
    icon: "person_add",
    title: "homepage.actions.to_athletes",
    subtitle: "homepage.actions.to_athletes_caption",
  },
  {
    to: "library",
    icon: "edit_calendar",
    title: "homepage.actions.to_library",
    subtitle: "homepage.actions.to_library_caption",
  },
  {
    to: "schedule",
    icon: "rocket_launch",
    title: "homepage.actions.to_schedule",
    subtitle: "homepage.actions.to_schedule_caption",
  },
];
</script>

<style scoped lang="scss">
.square-card {
  width: 300px;
  /* Set your desired width for the square card */
  height: 300px;
  /* Set your desired height for the square card */
  border-radius: 16px;
  background: var(--bg-1, #fff);
  box-shadow: 0px 8px 32px 0px rgba(51, 38, 174, 0.08);
}
</style>
