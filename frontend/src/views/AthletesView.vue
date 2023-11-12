<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-x-md">
      <!-- Display athletes -->
      <div class="col-12 col-sm-4">
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
            ref="athletesTableElement"
            :athletes="athletes"
            :programs="programs"
            :on-update="onAthleteSelection"
            :filter="searchAthlete"
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
              @submit="createAthlete()"
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

      <!-- Right card: athlete data -->
      <div v-if="Boolean(selectedAthlete)" class="col-12 col-sm-8">
        <q-card>
          <q-card-section class="q-gutter-x-xs">
            <h6>Athlete Info</h6>
            <q-tabs
              @update:model-value="onTabChange"
              :model-value="selectedTab"
              class="text-dark q-pa-md"
              dense
              no-caps
              inline-label
            >
              <q-tab
                v-for="tab in allTabs"
                :key="tab.key"
                :name="tab.name"
                :label="tab.label"
                :icon="tab.icon"
              />
            </q-tabs>
            <q-tab-panels v-model="selectedTab">
              <!-- Program info -->
              <q-tab-panel name="Status">
                <FormAthleteProgramInfo
                  ref="athleteProgramFormElement"
                  v-if="selectedAthlete"
                  :program="currentProgram"
                />
              </q-tab-panel>

              <!-- Athlete Anagraphic and phisical data -->
              <q-tab-panel name="Anagraphic">
                <FormAthleteAnagraphicInfo
                  ref="athleteFormElement"
                  v-if="selectedAthlete"
                  :athlete="selectedAthlete"
                />
              </q-tab-panel>

              <!-- Personal Best table -->
              <q-tab-panel name="Personal Best">
                <h6>Personal best table</h6>
                <MaxLiftManager></MaxLiftManager>
              </q-tab-panel>
            </q-tab-panels>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from "vue";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { useUserStore } from "@/stores/user";
import { useCoachInfoStore } from "@/stores/coachInfo";
import { AthleteUser } from "@/helpers/users/user";
import TableManagedAthletes from "@/components/tables/TableManagedAthletes.vue";
import FormAthleteAnagraphicInfo from "@/components/forms/FormAthleteAnagraphicInfo.vue";
import FormAthleteProgramInfo from "@/components/forms/FormAthleteProgramInfo.vue";
import MaxLiftManager from "@/components/utils/MaxLiftManager.vue";
import { Program } from "@/helpers/programs/program";

// Init plugin
const $q = useQuasar();
const i18n = useI18n();

// Get store
const user = useUserStore();
const coachInfo = useCoachInfoStore();

// Set ref for tab navigation
const allTabs = [
  {
    key: "status",
    name: "Status",
    label: "Status",
    icon: "fa-solid fa-circle-half-stroke",
  },
  {
    key: "anagraphic",
    name: "Anagraphic",
    label: "Anagraphic",
    icon: "fa-regular fa-address-card",
  },
  {
    key: "personalbest",
    name: "Personal Best",
    label: "Personal Best",
    icon: "fa-solid fa-ranking-star",
  },
];

// Set ref
const searchAthlete = ref<string>(); // TODO search
const updatingAthlete = ref<AthleteUser>(); // athlete that is currently being updated
const selectedAthlete = ref<AthleteUser>(); // athlete that is currently selected in left table
const athleteTableElement = ref<typeof TableManagedAthletes>();
const athleteFormElement = ref<typeof FormAthleteAnagraphicInfo>();
const athleteProgramFormElement = ref<typeof FormAthleteProgramInfo>();

const selectedTab = ref("Status"); // TODO main tab to show
const showAthleteDialog = ref(false); // whether to show dialog to add athlete

// Athlete info for add dialog
const athleteName = ref(""); // new athlete name
const athleteSurname = ref(""); // new athlete surname
const athleteNote = ref(""); // new athlete note

function onTabChange(tab) {
  selectedTab.value = tab;

  //send confirmation of saved info
}

// Get athletes to display
const athletes = computed(() => coachInfo.athletes || []);

// Get all program of the coach
const programs = computed(() => coachInfo.programs || []);

// Update table selection
watch(selectedAthlete, (athlete) =>
  nextTick(() => {
    athleteTableElement.value?.selectRowByName(athlete?.name, true);
  }),
);

// Get current program
const athletePrograms = programs.value.filter(
  (program: Program) =>
    program.athleteId === selectedAthlete.value?.uid ||
    program.coachId === selectedAthlete.value?.coachId,
);
console.log(athletePrograms);
//const currentProgram = athletePrograms[0]; // TODO: get currently active or latest program

const currentProgram = new Program({
  uid: "prova",
  name: "Program name",
  description: "questa è la descrizione",
  startedOn: new Date(2023, 4, 7),
  finishedOn: new Date(2023, 5, 8),
  lastUpdated: new Date(2023, 5, 8),
});

/**
 * Allow athlete modification.
 *
 * @param athleteOrAny might be exercise to be updated, requires type check.
 * @param row optional row of the table where exercise was selected.
 */
function onAthleteSelection(
  athleteOrAny: AthleteUser | any,
  row?: { [key: string]: any; name?: string },
) {
  if (athleteOrAny instanceof AthleteUser) selectedAthlete.value = athleteOrAny;
  else
    selectedAthlete.value = athletes.value.find(
      (athlete) => athlete.name && athlete.name == row?.name,
    );
}

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
 * Clear values in athlete insertion form.
 */
function clearAthlete() {
  athleteName.value = "";
  athleteSurname.value = "";
  athleteNote.value = "";
  showAthleteDialog.value = false;
}
</script>
