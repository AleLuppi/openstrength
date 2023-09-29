<template>
  <div class="q-pa-md">
    <!-- Title and actions -->
    <div class="row items-center">
      <h2 class="col">{{ $t("layout.views.home_title") }}</h2>

      <!-- Add new athlete -->
      <q-btn
        icon="add"
        :label="$t('coach.athlete_management.list.add')"
        @click="
          updatingAthlete = undefined;
          showAthleteDialog = true;
        "
      />
    </div>

    <!-- Dialog to add a new athlete -->
    <q-dialog
      v-model="showAthleteDialog"
      @hide="updatingAthlete ? clearAthlete() : {}"
    >
      <q-card class="q-pa-sm dialog-min-width">
        <q-card-section class="row items-center q-pb-none">
          <h5>
            {{
              updatingAthlete
                ? $t("coach.athlete_management.list.update")
                : $t("coach.athlete_management.list.add")
            }}
          </h5>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-form
          @submit="updatingAthlete ? updateAthlete() : createAthlete()"
          @reset="clearAthlete"
          class="q-my-md q-gutter-sm column"
        >
          <q-card-section class="q-gutter-x-xs">
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
              :label="
                updatingAthlete
                  ? $t('coach.athlete_management.list.update_proceed')
                  : $t('coach.athlete_management.list.add_proceed')
              "
              type="submit"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Navigation -->
    <q-tabs v-model="selectedTab" class="text-dark">
      <q-tab
        v-for="tab in ['all', 'active', 'new']"
        :key="tab"
        :name="tab"
        :label="$t('coach.athlete_management.filter.' + tab)"
      />
    </q-tabs>

    <!-- TODO Display resources -->
    <q-tab-panels v-model="selectedTab">
      <q-tab-panel name="all">
        <tableManagedAthletes
          :athletes="athletes"
          :on-update="onUpdateAthlete"
        />
      </q-tab-panel>

      <q-tab-panel name="active">
        <div class="text-h5">TODO</div>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </q-tab-panel>

      <q-tab-panel name="new">
        <div class="text-h5">TODO</div>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { useUserStore } from "@/stores/user";
import { useCoachInfoStore } from "@/stores/coachInfo";
import { AthleteUser } from "@/helpers/users/user";
import tableManagedAthletes from "@/components/tables/tableManagedAthletes.vue";

// Init plugin
const $q = useQuasar();
const i18n = useI18n();

// Get store
const user = useUserStore();
const coachInfo = useCoachInfoStore();

// Set ref
const updatingAthlete = ref<AthleteUser>(); // athlete that is currently being updated
const selectedTab = ref("all"); // main tab to show
const showAthleteDialog = ref(false); // whether to show dialog to add athlete
const athleteName = ref(""); // new athlete name
const athleteSurname = ref(""); // new athlete surname
const athleteNote = ref(""); // new athlete note

// Get athletes to display
const athletes = computed(() => {
  coachInfo.loadAthletes(user.uid, true);
  console.log(user.uid, coachInfo.athletes);
  return coachInfo.athletes || [];
});

/**
 * Create a new athlete user and assign logged coach to him/her
 */
function createAthlete() {
  const newAthlete = new AthleteUser({
    name: athleteName.value,
    surname: athleteSurname.value,
    coachId: user.uid,
    coachNote: athleteNote.value,
    coaches: user.uid ? [user.uid] : [],
    coachesFrom: [new Date()],
    coachesTo: [null],
    createdOn: new Date(),
    createdBy: user.uid,
  });
  newAthlete.saveNew({
    onSuccess: () => {
      (coachInfo.athletes = coachInfo.athletes || []).push(newAthlete);
      clearAthlete();
    },
    onError: () =>
      $q.notify({
        type: "negative",
        message: i18n.t("coach.athlete_management.list.add_error"),
        position: "bottom",
      }),
  });
  showAthleteDialog.value = false;
}

function updateAthlete() {
  if (updatingAthlete.value) {
    updatingAthlete.value.name = athleteName.value;
    updatingAthlete.value.surname = athleteSurname.value;
    updatingAthlete.value.coachNote = athleteNote.value;
    updatingAthlete.value.saveUpdate({
      onSuccess: () => {
        console.log("Done!");
        clearAthlete();
      },
      onError: () =>
        $q.notify({
          type: "negative",
          message: i18n.t("coach.athlete_management.list.update_error"),
          position: "bottom",
        }),
    });
    showAthleteDialog.value = false;
  }
}

function onUpdateAthlete(athlete: AthleteUser) {
  updatingAthlete.value = athlete;
  showAthleteDialog.value = true;
  athleteName.value = athlete.name ?? "";
  athleteSurname.value = athlete.surname ?? "";
  athleteNote.value = athlete.coachNote ?? "";
}

/**
 * Create a new athlete user and assign logged coach to him/her
 */
function clearAthlete() {
  athleteName.value = "";
  athleteSurname.value = "";
  athleteNote.value = "";
  showAthleteDialog.value = false;
}
</script>
