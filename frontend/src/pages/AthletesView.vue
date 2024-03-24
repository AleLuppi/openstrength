<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-x-md">
      <!-- Display athletes -->
      <div class="col-12 col-sm-5">
        <q-card>
          <q-card-section class="q-pb-sm">
            <div class="row justify-between q-mb-sm">
              <h4 class="text-margin-xs">
                {{ $t("coach.athlete_management.list.title") }}
              </h4>

              <!-- Add new athlete -->
              <div class="column justify-center">
                <q-btn
                  :icon="symOutlinedPersonAdd"
                  :label="
                    $q.screen.gt.sm
                      ? $t('coach.athlete_management.list.add')
                      : undefined
                  "
                  color="button-primary"
                  :padding="$q.screen.gt.sm ? 'xs sm' : 'sm sm'"
                  @click="
                    updatingAthlete = undefined;
                    showAthleteDialog = true;
                  "
                />
              </div>
            </div>

            <div class="row q-gutter-x-md items-center">
              <os-input
                v-if="athletes.length > 0"
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
            </div>
          </q-card-section>

          <q-separator />

          <TableManagedAthletes
            ref="athletesTableElement"
            :athletes="athletes"
            :programs="programs"
            @update:selected="onAthleteSelection"
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
      <component
        :is="$q.screen.lt.sm ? QDialog : 'div'"
        v-if="selectedAthlete"
        :model-value="Boolean(selectedAthlete)"
        @update:model-value="selectedAthlete = undefined"
        class="col-7"
      >
        <q-card>
          <q-card-section class="q-gutter-x-xs os-athleteinfo-max-height">
            <div class="row justify-between items-center">
              <h6>{{ $t("coach.athlete_management.fields.athlete_info") }}</h6>
              <q-btn
                v-if="$q.screen.lt.sm"
                icon="close"
                outline
                flat
                round
                color="light-dark"
                class="q-pa-sm"
                @click="selectedAthlete = undefined"
              ></q-btn>
            </div>

            <q-tabs
              v-model="selectedTab"
              class="text-dark q-pa-md"
              dense
              no-caps
              inline-label
            >
              <q-tab
                v-for="tab in allTabs"
                :key="tab.name"
                :name="tab.name"
                :label="tab.label"
                :icon="tab.icon"
              />
            </q-tabs>
            <q-tab-panels v-model="selectedTab">
              <!-- Program info -->
              <q-tab-panel name="programs">
                <!-- If selected athlete has ongoing program show program data form-->
                <div v-if="athletePrograms.length">
                  <q-btn
                    :to="{
                      name: NamedRoutes.program,
                      query: { new: true, athlete: selectedAthlete.uid },
                    }"
                    :icon="symOutlinedAssignmentAdd"
                    :label="$t('coach.program_management.list.add')"
                    outline
                    class="q-mb-sm q-mr-sm"
                    :class="{ 'full-width': denseView }"
                  ></q-btn>
                  <TableExistingPrograms
                    :programs="athletePrograms"
                    :active-program="
                      denseView ? undefined : athleteCurrentProgram
                    "
                    :show-fields="
                      denseView ? ['name'] : ['name', 'startedOn', 'finishedOn']
                    "
                    sort-by="-startedOn"
                    allow-open
                    allow-delete
                    v-model:selected="infoProgram"
                    @delete="onProgramDelete"
                  />
                </div>

                <!-- If selected athlete has no programs at all -->
                <div v-else>
                  <div
                    class="row q-gutter-lg justify-center items-center"
                    style="height: 100%"
                  >
                    <router-link
                      :to="{
                        name: NamedRoutes.program,
                        query: { new: 'true', athlete: selectedAthlete.uid },
                      }"
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
                          {{ selectedAthlete.referenceName }}
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
              <q-tab-panel name="anagraphic">
                <FormAthleteAnagraphicInfo
                  ref="athleteFormElement"
                  v-if="selectedAthlete"
                  :athlete="selectedAthlete"
                />
              </q-tab-panel>

              <!-- Personal Best table -->
              <q-tab-panel name="personalbest">
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
                    @update="onUpdateMaxLift"
                    :filter="searchMaxLift"
                  />

                  <!-- Dialog to add a new max lift -->
                  <q-dialog
                    v-model="showMaxLiftAddDialog"
                    @hide="maxliftFormElement?.reset"
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

                      <FormMaxLift
                        ref="maxliftFormElement"
                        :maxlift="updatingMaxLift"
                        :athlete="selectedAthlete ?? updatingAthlete"
                        :exercises="exercises"
                        @submit="saveMaxlift"
                        @reset="showMaxLiftAddDialog = false"
                      ></FormMaxLift>
                    </q-card>
                  </q-dialog>
                </q-card>
              </q-tab-panel>
            </q-tab-panels>
          </q-card-section>
        </q-card>
      </component>

      <!-- Right card: no athlete selected call to action -->
      <div v-else-if="!$q.screen.lt.sm" class="col-7">
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

      <!-- Dialog for editing program info -->
      <q-dialog
        :model-value="Boolean(infoProgram)"
        @update:model-value="
          (val) => (infoProgram = val ? infoProgram : undefined)
        "
      >
        <q-card class="q-pa-sm dialog-min-width">
          <q-card-section class="row justify-between q-pb-none">
            <h6>{{ $t("coach.athlete_management.fields.program_info") }}</h6>
            <q-btn
              icon="close"
              flat
              round
              dense
              color="button-negative"
              v-close-popup
            />
          </q-card-section>
          <q-card-section>
            <FormAthleteProgramInfo
              :program="infoProgram!"
              :isCurrent="
                selectedAthlete?.assignedProgramId === infoProgram!.uid
              "
              @assign="assignProgram"
            />
          </q-card-section>
        </q-card>
      </q-dialog>

      <!-- Dialog delete a program -->
      <q-dialog
        v-model="showDialogDeleteProgram"
        @hide="deletingProgram = undefined"
      >
        <q-card class="q-pa-sm dialog-min-width">
          <q-card-section class="row items-center q-pb-none">
            <p>
              {{
                $t("coach.program_management.list.delete_program_confirm", {
                  program: deletingProgram?.name,
                })
              }}
            </p>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              flat
              :label="$t('common.cancel')"
              type="reset"
              color="button-negative"
              v-close-popup
            />
            <q-btn
              :label="$t('coach.program_management.list.delete_proceed')"
              @click="if (deletingProgram) deleteProgram(deletingProgram);"
              color="button-negative"
              v-close-popup
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, defineAsyncComponent } from "vue";
import { useQuasar, QDialog } from "quasar";
import {
  symOutlinedAssignmentAdd,
  symOutlinedPersonAdd,
} from "@quasar/extras/material-symbols-outlined";
import { useI18n } from "vue-i18n";
import { NamedRoutes } from "@/router";
import { event } from "vue-gtag";
import { useUserStore } from "@/stores/user";
import { useCoachInfoStore } from "@/stores/coachInfo";
import { AthleteUser } from "@/helpers/users/user";
import { Program } from "@/helpers/programs/program";
import { MaxLift } from "@/helpers/maxlifts/maxlift";
import {
  getAllAssignedPrograms,
  getAssignedProgram,
} from "@/helpers/programs/athleteAssignment";
import mixpanel from "mixpanel-browser";
import { assignProgramToAthlete } from "@/helpers/programs/programManager";

// Import components
const TableExistingPrograms = defineAsyncComponent(
  () => import("@/components/tables/TableExistingPrograms.vue"),
);
const TableManagedAthletes = defineAsyncComponent(
  () => import("@/components/tables/TableManagedAthletes.vue"),
);
const TableMaxLifts = defineAsyncComponent(
  () => import("@/components/tables/TableMaxLifts.vue"),
);
const FormAthleteAnagraphicInfo = defineAsyncComponent(
  () => import("@/components/forms/FormAthleteAnagraphicInfo.vue"),
);
const FormAthleteProgramInfo = defineAsyncComponent(
  () => import("@/components/forms/FormAthleteProgramInfo.vue"),
);
const FormMaxLift = defineAsyncComponent(
  () => import("@/components/forms/FormMaxLift.vue"),
);

// Init plugin
const $q = useQuasar();
const i18n = useI18n();

// Get store
const user = useUserStore();
const coachInfo = useCoachInfoStore();

// Set tab navigation info
const allTabs = [
  {
    name: "programs",
    label:
      $q.screen.width < 840
        ? ""
        : i18n.t("coach.program_management.fields.programs"),
    icon: "fa-regular fa-file-lines",
  },
  {
    name: "anagraphic",
    label:
      $q.screen.width < 840
        ? ""
        : i18n.t("coach.athlete_management.fields.anagraphic"),
    icon: "fa-regular fa-address-card",
  },
  {
    name: "personalbest",
    label:
      $q.screen.width < 840
        ? ""
        : i18n.t("coach.athlete_management.fields.personal_best"),
    icon: "fa-solid fa-ranking-star",
  },
];

// Set athlete related ref
const searchAthlete = ref<string>();
const updatingAthlete = ref<AthleteUser>(); // athlete that is currently being updated
const selectedAthlete = ref<AthleteUser>(); // athlete that is currently selected in left table
const athleteTableElement = ref<typeof TableManagedAthletes>();
const athleteFormElement = ref<typeof FormAthleteAnagraphicInfo>();

// Set additional athlete info ref
const selectedTab = ref("programs");
const maxliftFormElement = ref<typeof FormMaxLift>();
const showAthleteDialog = ref(false); // whether to show dialog to add athlete

// Set athlete data ref for new athlete dialog
const athleteName = ref(""); // new athlete name
const athleteSurname = ref(""); // new athlete surname
const athleteNote = ref(""); // new athlete note

// Set ref for program info
const infoProgram = ref<Program>();
const deletingProgram = ref<Program>();
const showDialogDeleteProgram = ref(false);
const denseView = computed(() => !$q.screen.gt.sm);

// Set ref for max lift declarations
const searchMaxLift = ref<string>();
const updatingMaxLift = ref<MaxLift>();
const showMaxLiftAddDialog = ref(false);

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
const athletePrograms = computed(() =>
  selectedAthlete.value
    ? getAllAssignedPrograms(selectedAthlete.value, programs.value)
    : [],
);

// Get active current program for the selected athlete
const athleteCurrentProgram = computed(() =>
  selectedAthlete.value
    ? getAssignedProgram(selectedAthlete.value, programs.value)
    : undefined,
);

// Get maxlifts for the selected athlete
const athleteMaxlifts = computed(() =>
  maxlifts.value.filter(
    (maxlift) => maxlift.athlete?.uid === selectedAthlete.value?.uid,
  ),
);

/**
 * Create a new maxlift and assign to a coach.
 *
 * @param newMaxLift max lift instance that shall be saved.
 */
function saveMaxlift(newMaxLift: MaxLift) {
  // Get current maxlift and check if already instanciated on db
  const isNew = !newMaxLift.uid;

  // Update values
  if (isNew) {
    newMaxLift.athlete = selectedAthlete.value;
    newMaxLift.coachId = user.uid;
  }

  // Save maxlift
  newMaxLift.save({
    onSuccess: () => {
      if (isNew)
        (coachInfo.maxlifts = coachInfo.maxlifts || []).push(newMaxLift);
      maxliftFormElement.value?.reset();

      // Register GA4 event
      event("athleteview_maxlift_created", {
        event_category: "documentation",
        event_label: "New MaxLift Created in AthleteView",
        value: 1,
      });

      // Mixpanel tracking
      mixpanel.track(isNew ? "Maxlift Created" : "Maxlift Updated", {
        Page: "AthleteView",
        Exercise: newMaxLift.exercise?.name,
        Type: newMaxLift.type?.toString(),
      });
    },
    onError: () => {
      $q.notify({
        type: "negative",
        message: i18n.t(
          "coach.maxlift_management.list." +
            (isNew ? "add_error" : "update_error"),
        ),
        position: "bottom",
      });

      // Mixpanel tracking
      mixpanel.track(
        "ERROR " + (isNew ? "Maxlift Created" : "Maxlift Updated"),
        {
          Page: "AthleteView",
          Exercise: newMaxLift.exercise?.name,
          Type: newMaxLift.type?.toString(),
        },
      );
    },
  });
  showMaxLiftAddDialog.value = false;
}

/**
 * Open form with max lift info to allow coach to update them.
 *
 * @param maxlift instance that is being updated by coach.
 */
function onUpdateMaxLift(maxlift: MaxLift) {
  updatingMaxLift.value = maxlift;
  showMaxLiftAddDialog.value = true;
}

/**
 * Allow athlete modification.
 *
 * @param athlete selected athlete instance.
 */
function onAthleteSelection(athlete?: AthleteUser) {
  selectedAthlete.value = athlete;
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
    assignedPrograms: [],
    createdOn: new Date(),
    createdBy: user.uid,
  });
  newAthlete.saveNew({
    onSuccess: () => {
      (coachInfo.athletes = coachInfo.athletes || []).push(newAthlete);
      clearAthlete();

      // Register GA4 event
      event("new_athlete_created", {
        event_category: "documentation",
        event_label: "New Athlete added to Athlete library",
        value: 1,
      });

      // Mixpanel tracking
      mixpanel.track("New Athlete", {
        Page: "AthleteView",
      });
    },
    onError: () => {
      $q.notify({
        type: "negative",
        message: i18n.t("coach.athlete_management.list.add_error"),
        position: "bottom",
      });

      // Mixpanel tracking
      mixpanel.track("ERROR New Athlete", {
        Page: "AthleteView",
      });
    },
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

/**
 * Set a program as the currently assigned program to selected athlete.
 *
 * @param program program that shall be set as currently ongoing.
 */
function assignProgram(program: Program) {
  if (selectedAthlete.value)
    assignProgramToAthlete(program, selectedAthlete.value, {
      onError: () => {
        $q.notify({
          type: "negative",
          message: i18n.t(
            "coach.program_management.builder.save_assignment_error",
          ),
          position: "bottom",
        });
      },
    });
}

/**
 * Delete one program from list, upon confirmation.
 *
 * @param program program that may be deleted.
 */
function onProgramDelete(program: Program) {
  deletingProgram.value = program;
  showDialogDeleteProgram.value = true;
}

/**
 * Actually delete the selected program template.
 *
 * @param program element that shall be removed.
 */
function deleteProgram(program: Program) {
  program.remove({
    onAthleteUpdateSuccess: () => {
      // Mixpanel tracking
      mixpanel.track("Update Athlete", {
        Type: "Removed program",
      });
    },
    onAthleteUpdateError: () => {
      // Mixpanel tracking
      mixpanel.track("ERROR Update Athlete", {
        Type: "Removing program",
      });
    },
    onSuccess: () => {
      coachInfo.programs = coachInfo.programs?.filter(
        (coachProgram) => coachProgram != program,
      );
      deletingProgram.value = undefined;

      // Register GA4 event
      event("program_deleted", {
        event_category: "documentation",
        event_label: "Program Deleted",
        value: 1,
      });

      // Mixpanel tracking
      mixpanel.track("Program Deleted", {
        Page: "ProgramView",
      });
    },
  });
}
</script>

<style scoped lang="scss">
.square-card {
  border-radius: 16px;
  background: $os-grey-cold-0;
  box-shadow: 0px 8px 32px 0px rgba(51, 38, 174, 0.08);
}

.os-athleteinfo-max-height {
  height: calc(100vh - 38px);
}
</style>
