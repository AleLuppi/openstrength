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

      <!-- Right card: selected athlete data -->
      <div v-if="Boolean(selectedAthlete)" class="col-12 col-sm-8">
        <q-card>
          <q-card-section
            class="q-gutter-x-xs"
            style="height: calc(100vh - 38px)"
          >
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
              <q-tab-panel name="Programs">
                <!-- If selected athlete has ongoing program show program data form-->
                <div v-if="selectedAthlete && Boolean(athleteCurrentProgram)">
                  <FormAthleteProgramInfo
                    ref="athleteProgramFormElement"
                    :program="athleteCurrentProgram ?? new Program()"
                  />
                </div>

                <!-- If selected athlete has no programs at all -->
                <div v-else-if="selectedAthlete && Boolean(athletePrograms)">
                  <!-- TODO: pass athlete id -->

                  <div
                    class="row q-gutter-lg justify-center items-center"
                    style="height: 100%"
                  >
                    <router-link
                      :to="{ name: 'program', params: { programId: 1234 } }"
                      class="link-child"
                    >
                      <q-card
                        class="col-3 q-pa-lg column items-center justify-center square-card q-hoverable text-center"
                      >
                        <!-- Animate when on -->
                        <span class="q-focus-helper"></span>

                        <!-- Icon, title, and subtitle -->
                        <q-icon
                          name="fa-regular fa-folder-open"
                          size="6em"
                          color="icon-color"
                        />
                        <h6>
                          {{
                            $t("coach.athlete_management.call_to_action.title")
                          }}
                          {{
                            selectedAthlete.name + " " + selectedAthlete.surname
                          }}
                        </h6>
                        <p class="q-px-md text-weight-light">
                          {{
                            $t(
                              "coach.athlete_management.call_to_action.subtitle",
                            )
                          }}
                        </p>
                      </q-card>
                    </router-link>
                  </div>
                </div>
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
                <h6>
                  {{
                    $t("coach.athlete_management.call_to_action.maxlift_title")
                  }}
                </h6>
                <!-- MAX LIFT SECTION -->
                <q-card>
                  <q-card-section>
                    <div class="row q-gutter-x-md items-center">
                      <os-input
                        v-model="searchMaxLift"
                        :placeholder="
                          $t('coach.maxlift_management.list.search_maxlift')
                        "
                        hide-bottom-space
                        debounce="500"
                        class="col"
                      >
                        <template v-slot:prepend>
                          <q-icon name="search" />
                        </template>
                      </os-input>

                      <!-- Add new maxlift -->
                      <q-btn
                        icon="add"
                        outline
                        @click="
                          updatingMaxLift = undefined;
                          showMaxLiftAddDialog = true;
                        "
                      />
                    </div>
                  </q-card-section>

                  <q-separator />

                  <TableMaxLifts
                    :maxlifts="athleteMaxlifts"
                    :on-update="onUpdateMaxLift"
                    :filter="searchMaxLift"
                  />

                  <!-- Dialog to add a new max lift -->
                  <q-dialog
                    v-model="showMaxLiftAddDialog"
                    @hide="updatingMaxLift ? clearMaxLift() : {}"
                  >
                    <q-card class="q-pa-sm dialog-min-width">
                      <q-card-section class="row items-center q-pb-none">
                        <h5>
                          {{
                            updatingMaxLift
                              ? $t("coach.maxlift_management.list.update")
                              : $t("coach.maxlift_management.list.add")
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
                        @submit="
                          updatingMaxLift ? updateMaxLift() : createMaxLift()
                        "
                        @reset="clearMaxLift"
                        class="q-my-md q-gutter-sm column"
                      >
                        <q-card-section class="q-gutter-x-xs">
                          <os-select
                            v-model="selectedExercise"
                            :label="
                              $t('coach.maxlift_management.fields.exercise')
                            "
                            :options="
                              exercises.map((exercise) => exercise.name)
                            "
                            emit-value
                            map-options
                            dense
                          >
                          </os-select>

                          <!-- TYPE -->
                          <os-select
                            v-model="maxliftType"
                            :label="$t('coach.maxlift_management.fields.type')"
                            use-input
                            :options="availableMaxLiftTypes"
                            emit-value
                            map-options
                            class="col-12"
                          />

                          <!-- VALUE -->
                          <os-input
                            v-model="maxliftValue"
                            :suffix="maxliftValueSuffix"
                            :label="$t('coach.maxlift_management.fields.value')"
                          ></os-input>

                          <p
                            class="text-input-top-label text-uppercase text-weight-medium text-left"
                            style="line-height: 1.6em"
                          >
                            {{ i18n.t("coach.maxlift_management.fields.date") }}
                          </p>
                          <q-input
                            outlined
                            dense
                            v-model="maxliftDate"
                            mask="date"
                            :rules="['date']"
                          >
                            <template v-slot:append>
                              <q-icon name="event" class="cursor-pointer">
                                <q-popup-proxy
                                  cover
                                  transition-show="scale"
                                  transition-hide="scale"
                                >
                                  <q-date v-model="maxliftDate">
                                    <div class="row items-center justify-end">
                                      <q-btn
                                        v-close-popup
                                        label="Close"
                                        color="primary"
                                        flat
                                      />
                                    </div>
                                  </q-date>
                                </q-popup-proxy>
                              </q-icon>
                            </template>
                          </q-input>
                        </q-card-section>

                        <q-card-actions align="right">
                          <q-btn
                            flat
                            :label="$t('common.cancel')"
                            type="reset"
                          />
                          <q-btn
                            :label="
                              updatingMaxLift
                                ? $t(
                                    'coach.maxlift_management.list.update_proceed',
                                  )
                                : $t(
                                    'coach.maxlift_management.list.add_proceed',
                                  )
                            "
                            type="submit"
                          />
                        </q-card-actions>
                      </q-form>
                    </q-card>
                  </q-dialog>
                </q-card>
              </q-tab-panel>
            </q-tab-panels>
          </q-card-section>
        </q-card>
      </div>

      <!-- Right card: no athlete selected call to action -->
      <div v-else class="col-12 col-sm-8">
        <div class="row flex-center" style="height: 100%">
          <div class="row">
            <q-icon
              name="fa-regular fa-hand-pointer"
              size="2rem"
              color="light-dark"
              class="q-px-md"
            ></q-icon>
            <p>
              {{ $t("coach.athlete_management.no_selected_athlete") }}
            </p>
          </div>
        </div>
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
import TableMaxLifts from "@/components/tables/TableMaxLifts.vue";
import FormAthleteAnagraphicInfo from "@/components/forms/FormAthleteAnagraphicInfo.vue";
import FormAthleteProgramInfo from "@/components/forms/FormAthleteProgramInfo.vue";
import { Program } from "@/helpers/programs/program";
import { MaxLift, MaxLiftType } from "@/helpers/maxlifts/maxlift";
import { Exercise } from "@/helpers/exercises/exercise";

// Init plugin
const $q = useQuasar();
const i18n = useI18n();

// Get store
const user = useUserStore();
const coachInfo = useCoachInfoStore();

// Set ref for tab navigation
const allTabs = [
  {
    key: "programs",
    name: "Programs",
    label: "Programs",
    icon: "fa-regular fa-file-lines",
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

const selectedTab = ref("Programs"); // TODO main tab to show
const showAthleteDialog = ref(false); // whether to show dialog to add athlete

// Athlete info for add dialog
const athleteName = ref(""); // new athlete name
const athleteSurname = ref(""); // new athlete surname
const athleteNote = ref(""); // new athlete note

// Max lift declarations
const searchMaxLift = ref<string>();
const updatingMaxLift = ref<MaxLift>();
const showMaxLiftAddDialog = ref(false);

const selectedExercise = ref<Exercise | undefined>();

const maxliftType = ref<MaxLiftType>(); // TODO check
const availableMaxLiftTypes: string[] = Object.values(MaxLiftType);
const maxliftValue = ref(""); // TODO check
const maxliftDate = ref<Date>(); // TODO check

// Get coach info
const athletes = computed(() => coachInfo.athletes || []);
const programs = computed(() => coachInfo.programs || []);
const exercises = computed(() => coachInfo.exercises || []);
const maxlifts = computed(() => coachInfo.maxlifts || []);

// Update table selection
watch(selectedAthlete, (athlete) =>
  nextTick(() => {
    athleteTableElement.value?.selectRowByName(athlete?.name, true);
  }),
);

// Get all programs for the selected athlete
const athletePrograms = programs.value.filter(
  (program: Program) =>
    program.athleteId === selectedAthlete.value?.uid &&
    program.coachId === selectedAthlete.value?.coachId,
);

// Get active current program for the selected athlete
const athleteCurrentProgram = computed(() =>
  programs.value.find(
    (program: Program) =>
      program.athleteId === selectedAthlete.value?.uid &&
      program.coachId === selectedAthlete.value?.coachId &&
      program.isOngoing,
  ),
);

/* const athleteCurrentProgram = new Program({
  uid: "fsSAG899kjbsa92n",
  name: "Program name",
  description: "questa è la descrizione",
  startedOn: new Date(2023, 4, 7),
  finishedOn: new Date(2023, 5, 8),
  lastUpdated: new Date(2023, 5, 8),
  isOngoing: true,
}); */

// Get maxlifts for the selected athlete
const athleteMaxlifts = computed(() =>
  maxlifts.value.filter(
    (maxlift: MaxLift) =>
      maxlift.athleteId === selectedAthlete.value?.uid &&
      maxlift.coachId === selectedAthlete.value?.coachId,
  ),
);

const maxliftValueSuffix = computed(() => {
  if (maxliftType.value === MaxLiftType._1RM) {
    return "kg";
  } else if (maxliftType.value === MaxLiftType._3RM) {
    return "kg";
  } else if (maxliftType.value === MaxLiftType._5RM) {
    return "kg";
  } else if (maxliftType.value === MaxLiftType._6RM) {
    return "kg";
  } else if (maxliftType.value === MaxLiftType._8RM) {
    return "kg";
  } else if (maxliftType.value === MaxLiftType._10RM) {
    return "kg";
  } else if (maxliftType.value === MaxLiftType._maxrep) {
    return "reps";
  } else if (maxliftType.value === MaxLiftType._maxtime) {
    return "s";
  } else {
    return ""; //
  }
});

/** TODO check
 * Allow tab navigation
 */
function onTabChange(tab) {
  selectedTab.value = tab;
}

/** TODO check
 * Create a new maxlift and assign to a coach
 */
function createMaxLift() {
  const newMaxLift = new MaxLift({
    exercise: selectedExercise.value,
    type: maxliftType.value,
    value: maxliftValue.value,
    lastUpdated: maxliftDate.value,
    athleteId: selectedAthlete.value?.uid,
    coachId: user.uid,
  });
  newMaxLift.saveNew({
    onSuccess: () => {
      (coachInfo.maxlifts = coachInfo.maxlifts || []).push(newMaxLift);
      clearMaxLift();
    },
    onError: () =>
      $q.notify({
        type: "negative",
        message: i18n.t("coach.maxlift_management.list.add_error"),
        position: "bottom",
      }),
  });
  showMaxLiftAddDialog.value = false;
}

/** TODO check
 * Update maxlift according to inserted values.
 */
function updateMaxLift() {
  if (updatingMaxLift.value) {
    updatingMaxLift.value.exercise = selectedExercise.value;
    updatingMaxLift.value.type = maxliftType.value;
    updatingMaxLift.value.value = maxliftValue.value;
    updatingMaxLift.value.lastUpdated = maxliftDate.value;
    updatingMaxLift.value.saveUpdate({
      onSuccess: () => {
        clearMaxLift();
      },
      onError: () =>
        $q.notify({
          type: "negative",
          message: i18n.t("coach.maxlift_management.list.update_error"),
          position: "bottom",
        }),
    });
    showMaxLiftAddDialog.value = false;
  }
}

/** TODO check
 * Clear values in maxlift insertion form.
 */
function clearMaxLift() {
  selectedExercise.value = undefined;
  maxliftType.value = undefined;
  maxliftValue.value = "";
  maxliftDate.value = undefined;

  showMaxLiftAddDialog.value = false;
}

/** TODO check
 * Compile form with max lift info to allow coach to update them.
 *
 * @param maxlift
 */
function onUpdateMaxLift(maxlift: MaxLift) {
  updatingMaxLift.value = maxlift;
  showMaxLiftAddDialog.value = true;
  selectedExercise.value = maxlift.exercise ?? undefined;
  maxliftType.value = maxlift.type ?? undefined;
  maxliftValue.value = maxlift.value ?? "";
  maxliftDate.value = maxlift.lastUpdated ?? undefined;
}

/**
 * Allow athlete modification.
 *
 * @param athleteOrAny might be athlete to be updated, requires type check.
 * @param row optional row of the table where athlete was selected.
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

<style scoped lang="scss">
.square-card {
  border-radius: 16px;
  background: $os-grey-cold-0;
  box-shadow: 0px 8px 32px 0px rgba(51, 38, 174, 0.08);
}
</style>
