<template>
  <div class="q-pa-md">
    <!-- Title and actions -->
    <div class="row items-center">
      <h2 class="col">{{ $t("layout.views.home_title") }}</h2>
    </div>

    <!-- Display athletes -->
    <q-card>
      <q-card-section>
        <h6>
          {{ $t("coach.athlete_management.list.title") }}
        </h6>

        <div class="row q-gutter-x-md items-center">
          <os-input
            v-model="searchAthlete"
            :placeholder="$t('coach.athlete_management.list.search')"
            hide-bottom-space
            debounce="500"
            class="col"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </os-input>

          <!-- Add new athlete -->
          <q-btn
            icon="add"
            :label="
              $q.screen.gt.sm
                ? $t('coach.athlete_management.list.add')
                : undefined
            "
            color="button-primary"
            @click="
              updatingAthlete = undefined;
              showAthleteDialog = true;
            "
          />
        </div>
      </q-card-section>

      <q-separator />

      <TableManagedAthletes
        :athletes="filteredAthletes"
        :on-update="onUpdateAthlete"
      />
    </q-card>

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
          <q-btn
            icon="close"
            flat
            round
            dense
            color="button-negative"
            v-close-popup
          />
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
              :label="$t('coach.athlete_management.fields.name')"
            ></os-input>
            <os-input
              v-model="athleteSurname"
              required
              :label="$t('coach.athlete_management.fields.surname')"
            ></os-input>
            <os-input
              v-model="athleteNote"
              :label="$t('coach.athlete_management.fields.note')"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { useUserStore } from "@/stores/user";
import { useCoachInfoStore } from "@/stores/coachInfo";
import { AthleteUser } from "@/helpers/users/user";
import TableManagedAthletes from "@/components/tables/TableManagedAthletes.vue";

// Init plugin
const $q = useQuasar();
const i18n = useI18n();

// Get store
const user = useUserStore();
const coachInfo = useCoachInfoStore();

// Set ref
const searchAthlete = ref<string>(); // TODO search
const updatingAthlete = ref<AthleteUser>(); // athlete that is currently being updated
const showAthleteDialog = ref(false); // whether to show dialog to add athlete
const athleteName = ref(""); // new athlete name
const athleteSurname = ref(""); // new athlete surname
const athleteNote = ref(""); // new athlete note

// Get athletes to display
const athletes = computed(() => {
  coachInfo.loadAthletes(user.uid, true);
  return coachInfo.athletes || [];
});

/**
 * Create a new athlete user and assign logged coach to him/her.
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

/**
 * Update athlete according to inserted values.
 */
function updateAthlete() {
  if (updatingAthlete.value) {
    updatingAthlete.value.name = athleteName.value;
    updatingAthlete.value.surname = athleteSurname.value;
    updatingAthlete.value.coachNote = athleteNote.value;
    updatingAthlete.value.saveUpdate({
      onSuccess: () => {
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

/**
 * Compile form with athlete info to allow coach to update them.
 *
 * @param athlete
 */
function onUpdateAthlete(athlete: AthleteUser) {
  updatingAthlete.value = athlete;
  showAthleteDialog.value = true;
  athleteName.value = athlete.name ?? "";
  athleteSurname.value = athlete.surname ?? "";
  athleteNote.value = athlete.coachNote ?? "";
}

/**
 * Clear values in athlete insertion form.
 */
function clearAthlete() {
  athleteName.value = "";
  athleteSurname.value = "";
  athleteNote.value = "";
  showAthleteDialog.value = false;
}

/** TODO check
 * Filter athlete by name in the corresponding table
 */
const filteredAthletes = computed(() => {
  if (!searchAthlete.value) {
    return athletes.value || [];
  }

  const search = searchAthlete.value.toLowerCase();
  return athletes.value.filter((athlete) =>
    athlete.name.toLowerCase().includes(search),
  );
});

// Watch for changes in search exercise input
watch(searchAthlete, () => {});
</script>
