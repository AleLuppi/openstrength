<template>
  <!-- Create a div container with: padding medium in all direction, large padding bottom, margin left and right auto-->
  <div class="q-pa-md q-pb-lg q-mx-auto limit-max-width">
    <h2 class="text-center">
      {{ $t("layout.drawer.welcome_logged_in_noname") }}
    </h2>
  </div>

  <!-- Create a row of square cards -->
  <div class="row justify-center items-center">
    <!-- CARD 1-->
    <q-card
      @click="onAthleteCardClick"
      v-ripple
      class="q-pa-lg q-ma-md square-card cursor-pointer q-hoverable"
    >
      <!-- Animate when on -->
      <span class="q-focus-helper"></span>

      <!-- Card title-->
      <q-section class="row justify-center">
        <q-icon
          name="person_add"
          size="6em"
          color="orange-4"
          class="justify-center"
        />
      </q-section>
      <!-- Card title-->
      <q-section>
        <p class="text-h6 text-center">
          {{ $t("layout.homeview.athletecard_title") }}
        </p>
      </q-section>
      <!-- Card subtitle -->
      <q-section>
        <p class="text-subtitle2 text-center text-weight-light q-px-md">
          {{ $t("layout.homeview.athletecard_subtitle") }}
        </p>
      </q-section>
    </q-card>

    <!-- CARD 2-->
    <q-card
      @click="onLibraryCardClick"
      v-ripple
      class="q-pa-lg q-ma-md square-card cursor-pointer q-hoverable"
    >
      <!-- Animate when on-->
      <span class="q-focus-helper"></span>

      <!-- Card title-->
      <q-section class="row justify-center">
        <q-icon
          name="edit_calendar"
          size="6em"
          color="orange-4"
          class="justify-center"
        />
      </q-section>
      <!-- Card title-->
      <q-section>
        <p class="text-h6 text-center">
          {{ $t("layout.homeview.librarycard_title") }}
        </p>
      </q-section>
      <!-- Card subtitle -->
      <q-section>
        <p class="text-subtitle2 text-center text-weight-light q-px-md">
          {{ $t("layout.homeview.librarycard_subtitle") }}
        </p>
      </q-section>
    </q-card>

    <!-- CARD 3-->
    <q-card
      @click="onScheduleCardClick"
      v-ripple
      class="q-pa-lg q-ma-md square-card cursor-pointer q-hoverable"
    >
      <!-- Animate when on -->
      <span class="q-focus-helper"></span>

      <!-- Card title-->
      <q-section class="row justify-center">
        <q-icon
          name="rocket_launch"
          size="6em"
          color="orange-4"
          class="justify-center"
        />
      </q-section>
      <!-- Card title-->
      <q-section>
        <p class="text-h6 text-center">
          {{ $t("layout.homeview.schedulecard_title") }}
        </p>
      </q-section>
      <!-- Card subtitle -->
      <q-section>
        <p class="text-subtitle2 text-center text-weight-light q-px-md">
          {{ $t("layout.homeview.schedulecard_subtitle") }}
        </p>
      </q-section>
    </q-card>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from "vue-router";

// Get the Vue Router instance
const router = useRouter();

// Function to handle card click and navigate to HomeView.vue
const onAthleteCardClick = () => {
  router.push({ name: "athletes" });
};

const onLibraryCardClick = () => {
  router.push({ name: "library" });
};

const onScheduleCardClick = () => {
  router.push({ name: "schedule" });
};
</script>

<style scoped>
.square-card {
  width: 300px; /* Set your desired width for the square card */
  height: 300px; /* Set your desired height for the square card */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
