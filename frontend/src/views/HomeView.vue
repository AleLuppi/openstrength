<template>
  <!-- Create a div container with: padding medium in all direction, large padding bottom, margin left and right auto-->
  <div class="q-pa-md q-pb-lg q-mx-auto limit-max-width">
    <h2 class="text-center">
      {{ $t("layout.drawer.welcome_logged_in_noname") }}
    </h2>
  </div>

  <!-- Show common actions -->
  <div class="row q-gutter-md justify-center items-center">
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
        <q-icon :name="buttonInfo.icon" size="6em" color="primary" />
        <h6>
          {{ $t(buttonInfo.title) }}
        </h6>
        <p class="q-px-md text-weight-light">
          {{ $t(buttonInfo.subtitle) }}
        </p>
      </q-card>
    </router-link>
  </div>
</template>

<script setup lang="ts">
// Set action buttons
const buttonsInfo = [
  {
    to: "athletes",
    icon: "person_add",
    title: "layout.homeview.athletecard_title",
    subtitle: "layout.homeview.athletecard_subtitle",
  },
  {
    to: "library",
    icon: "edit_calendar",
    title: "layout.homeview.librarycard_title",
    subtitle: "layout.homeview.librarycard_subtitle",
  },
  {
    to: "schedule",
    icon: "rocket_launch",
    title: "layout.homeview.schedulecard_title",
    subtitle: "layout.homeview.schedulecard_subtitle",
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
