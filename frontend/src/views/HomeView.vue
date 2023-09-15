<template>
  <div class="q-pa-md">
    <!-- Title and actions -->
    <div class="row items-center">
      <h2 class="col">{{ $t("layout.views.home") }}</h2>

      <!-- Add new athlete -->
      <q-btn
        icon="add"
        :label="$t('coach.athlete_management.list.add')"
        @click="showAthleteDialog = true"
      />
    </div>

    <!-- Dialog to add a new athlede -->
    <q-dialog v-model="showAthleteDialog">
      <q-card class="q-pa-sm dialog-min-width">
        <q-card-section class="row items-center q-pb-none">
          <h5>
            {{ $t("coach.athlete_management.list.add") }}
          </h5>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-form
          @submit="createAthlete"
          @reset="clearAthlete"
          class="q-my-md q-gutter-sm column"
        >
          <q-card-section class="q-gutter-xs">
            <os-input
              v-model="athleteName"
              required
              :label="$t('coach.athlete_management.list.prompt_name')"
            ></os-input>
            <os-input
              v-model="athleteSurname"
              required
              :label="$t('coach.athlete_management.list.prompt_surname')"
            ></os-input>
            <os-input
              v-model="athleteNote"
              :label="$t('coach.athlete_management.list.prompt_note')"
            ></os-input>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat :label="$t('common.cancel')" type="reset" />
            <q-btn
              :label="$t('coach.athlete_management.list.add_proceed')"
              type="submit"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Navigation -->
    <q-tabs v-model="selectedTab" class="text-dark">
      <q-tab
        v-for="tab in ['all', 'scheduled', 'unscheduled']"
        :key="tab"
        :name="tab"
        :label="$t('coach.athlete_management.filter.' + tab)"
      />
    </q-tabs>

    <!-- TODO Display resources -->
    <q-tab-panels v-model="selectedTab">
      <q-tab-panel name="all">
        <div class="text-h5">All</div>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </q-tab-panel>

      <q-tab-panel name="scheduled">
        <div class="text-h5">With schedule</div>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </q-tab-panel>

      <q-tab-panel name="unscheduled">
        <div class="text-h5">Missing schedule</div>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { addDocUser, AthleteUser } from "@/helpers/users/user";

// Set ref
const selectedTab = ref("all"); // main tab to show
const showAthleteDialog = ref(false); // whether to show dialog to add athlete
const athleteName = ref(""); // new athlete name
const athleteSurname = ref(""); // new athlete surname
const athleteNote = ref(""); // new athlete note

/**
 * Create a new athlete user and assign logged coach to him/her
 */
function createAthlete() {
  const newAthlete = new AthleteUser({
    name: athleteName.value,
    surname: athleteSurname.value,
    coachNote: athleteNote.value,
  });
  addDocUser(newAthlete);
  showAthleteDialog.value = false;
}

/**
 * Create a new athlete user and assign logged coach to him/her
 */
function clearAthlete() {
  athleteName.value = "";
  athleteNote.value = "";
  showAthleteDialog.value = false;
}
</script>

<style scoped lang="scss"></style>
