<template>
  <q-page style="height: 0">
    <!-- Program table -->
    <q-splitter
      v-model="splitterModel"
      reverse
      :limits="[0, 50]"
      style="height: 100%"
    >
      <template v-slot:before>
        <!-- Program management card -->
        <div
          ref="programManagerElement"
          class="q-mx-sm q-pa-sm os-top-card shadow-5 bg-lightest"
        >
          <!-- Utility buttons -->
          <!-- TODO i18n -->
          <div class="row justify-between">
            <!-- Save button -->
            <q-btn
              icon="save"
              :label="programSaved ? 'Saved!' : 'changes not saved...'"
              :disable="programSaved"
              @click="saveProgram"
              flat
            ></q-btn>

            <!-- Display and update assigned user -->
            <q-btn
              @click="showAthleteAssigningDialog = true"
              :label="selectedProgram.athlete ? undefined : 'Assign to athlete'"
              :color="selectedProgram.athlete ? 'secondary' : 'primary'"
              outline
              :dense="Boolean(selectedProgram.athlete)"
            >
              <q-item
                v-if="selectedProgram.athlete"
                dense
                class="q-py-none q-px-md"
              >
                <q-item-section
                  avatar
                  v-if="$q.screen.gt.xs && selectedProgram.athlete.photoUrl"
                >
                  <q-avatar size="md">
                    <img :src="selectedProgram.athlete.photoUrl" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>{{
                  selectedProgram.athlete.referenceName
                }}</q-item-section>
                <q-item-section thumbnail>
                  <q-btn
                    icon="clear"
                    @click.stop="
                      selectedProgram.athlete = undefined;
                      programSaved = false;
                    "
                    round
                    unelevated
                    size="0.5em"
                    color="red"
                    class="q-mr-sm"
                  />
                </q-item-section>
              </q-item>
            </q-btn>
          </div>

          <!-- Filter by week, day, exercise -->
          <q-slide-transition
            @show="updateProgramManagerHeight"
            @hide="updateProgramManagerHeight"
          >
            <div v-show="programManagerExpanded">
              <div class="row items-end justify-evenly q-pt-md">
                <h6>{{ $t("coach.program_management.filter.title") }}</h6>
                <os-select
                  v-model="filterWeek"
                  :options="getProgramUniqueWeeks(selectedProgram)"
                  :label="$t('coach.program_management.filter.filter_week')"
                  multiple
                  hide-bottom-space
                  class="col-3"
                ></os-select>
                <os-select
                  v-model="filterDay"
                  :options="getProgramUniqueDays(selectedProgram)"
                  :label="$t('coach.program_management.filter.filter_day')"
                  multiple
                  hide-bottom-space
                  class="col-3"
                ></os-select>
                <os-select
                  v-model="filterExercise"
                  :options="getProgramUniqueExercises(selectedProgram)"
                  :label="$t('coach.program_management.filter.filter_exercise')"
                  multiple
                  hide-bottom-space
                  class="col-3"
                ></os-select>
              </div>
            </div>
          </q-slide-transition>
          <q-btn
            :icon="programManagerExpanded ? 'expand_less' : 'expand_more'"
            @click="programManagerExpanded = !programManagerExpanded"
            flat
            dense
            color="secondary"
            class="full-width q-mx-lg"
            :ripple="false"
          ></q-btn>
        </div>

        <!-- Show table to build program on the left -->
        <TableProgramBuilder
          v-model="selectedProgram"
          :exercises="coachInfo.exercises"
          :filter="programFilter"
          :maxlifts="athleteMaxlifts"
          :scroll-offset="programManagerHeight + 15"
          class="q-pa-sm"
        >
          <template v-slot:empty-filtered>
            <h6>
              {{ $t("coach.program_management.filter.all_filtered_out") }}
            </h6>
            <q-btn
              @click="programFilter = { week: [], day: [], exercise: [] }"
              :label="$t('coach.program_management.filter.clear_filters')"
              rounded
              outline
            />
          </template>
        </TableProgramBuilder>
      </template>

      <template v-slot:after>
        <!-- Show charts on the right -->
        <div class="q-pa-sm" style="min-width: 100px; overflow: hidden">
          <!-- TODO i18n -->
          <!-- Charts display section -->
          <div v-if="showingUtils == UtilsOptions.charts">
            <ChartSelector
              :program="selectedProgram"
              :filter-week="filterWeek"
              :filter-day="filterDay"
              :filter-exercise="filterExercise"
            ></ChartSelector>
          </div>

          <!-- Max Lifts section -->
          <q-card v-else-if="showingUtils == UtilsOptions.maxlifts">
            <q-card-section>
              <!-- TODO i18n -->
              <h6 class="text-margin-xs">Max Lifts section</h6>

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
                    updatingMaxlift = undefined;
                    showMaxliftAddDialog = true;
                  "
                />
              </div>
            </q-card-section>

            <q-separator />

            <TableMaxLifts
              :maxlifts="athleteMaxlifts ?? []"
              @update="onUpdateMaxLift"
              :filter="searchMaxLift"
              :no-data-label="$t('coach.maxlift_management.list.no_athlete')"
            />

            <!-- Dialog to add a new max lift -->
            <q-dialog
              v-model="showMaxliftAddDialog"
              @hide="maxliftFormElement?.reset"
            >
              <q-card class="q-pa-sm dialog-min-width">
                <q-card-section class="row items-center q-pb-none">
                  <h5>
                    {{
                      updatingMaxlift
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
                  :maxlift="selectedMaxlift"
                  :exercises="coachInfo.exercises"
                  @submit="saveMaxlift"
                  @reset="showMaxliftAddDialog = false"
                ></FormMaxLift>
              </q-card>
            </q-dialog>
          </q-card>

          <!-- Program list section -->
          <div
            v-else-if="showingUtils == UtilsOptions.list"
            class="column q-gutter-y-md"
          >
            <!-- Start a new program -->
            <q-btn
              icon="add"
              label="New program"
              @click="substituteProgram = new Program()"
              rounded
              class="q-mx-auto"
            ></q-btn>

            <!-- Search status or temporary program -->
            <q-card>
              <!-- TODO i18n -->
              <q-card-section v-if="selectedProgram.uid">
                <p>Programma attuale</p>
                <p
                  class="text-italic text-xs"
                  v-if="selectedProgram.lastUpdated"
                >
                  Last update: {{ $d(selectedProgram.lastUpdated, "middle") }}
                </p>
              </q-card-section>
              <q-card-section
                v-else-if="temporaryProgram"
                class="cursor-pointer"
                @click="onTemporaryProgramSelection"
              >
                <p class="text-primary">Apri programma temporaneo</p>
                <p
                  class="text-italic text-xs"
                  v-if="temporaryProgram.lastUpdated"
                >
                  Last update: {{ $d(temporaryProgram.lastUpdated, "middle") }}
                </p>
              </q-card-section>
              <q-card-section v-else
                >Crea o seleziona un programma per iniziare</q-card-section
              >
            </q-card>

            <!-- Select among assigned programs -->
            <q-card>
              <TableManagedAthletes
                ref="athletesTableElement"
                :athletes="
                  coachInfo.athletes?.filter(
                    (athlete) => athlete.hasProgramAssigned,
                  ) ?? []
                "
                @update:selected="onAthleteProgramSelection"
                athletes-only
              />
            </q-card>
          </div>
        </div>
      </template>

      <template v-slot:separator>
        <!-- Add a middle separator -->
        <q-avatar
          color="primary"
          text-color="white"
          size="40px"
          icon="drag_indicator"
        />
      </template>
    </q-splitter>

    <!-- Dialog to assign program to athlete -->
    <DialogProgramAssignAthlete
      v-model="showAthleteAssigningDialog"
      :athletes="coachInfo.athletes ?? []"
      :selected="selectedProgram.athlete"
      @update:selected="
        (athlete) => {
          selectedProgram.athlete = athlete;
          programSaved = false;
        }
      "
    >
    </DialogProgramAssignAthlete>

    <!-- Dialog to change unsaved program -->
    <q-dialog v-model="showChangeProgramDialog">
      <!--  TODO i18n -->
      <q-card>
        <q-card-section class="row items-center">
          <q-icon
            name="fa-solid fa-circle-exclamation"
            color="primary"
            size="md"
          />
          <span class="q-ml-sm"
            >Hai delle modifiche non salvate, sei sicuro di voler
            continuare?</span
          >
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="secondary" v-close-popup />
          <q-btn
            label="Continue"
            color="primary"
            @click="openProgram(substituteProgram, true)"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog to open temporary program -->
    <q-dialog v-model="showTemporaryProgramRestoreDialog">
      <!--  TODO i18n -->
      <q-card>
        <q-card-section class="row items-center">
          <q-icon
            name="fa-solid fa-circle-exclamation"
            color="primary"
            size="md"
          />
          <span class="q-ml-sm"
            >C'è un programma non ancora assegnato, vuoi continuare la
            modifica?</span
          >
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="secondary" v-close-popup />
          <q-btn
            label="Open"
            color="primary"
            @click="onTemporaryProgramSelection"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from "vue";
import { dom } from "quasar";
import TableProgramBuilder from "@/components/tables/TableProgramBuilder.vue";
import { Program } from "@/helpers/programs/program";
import { useCoachInfoStore } from "@/stores/coachInfo";
import ChartSelector from "@/components/charts/ChartSelector.vue";
import TableMaxLifts from "@/components/tables/TableMaxLifts.vue";
import { MaxLift } from "@/helpers/maxlifts/maxlift";
import { useUserStore } from "@/stores/user";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import DialogProgramAssignAthlete from "@/components/dialogs/DialogProgramAssignAthlete.vue";
import FormMaxLift from "@/components/forms/FormMaxLift.vue";
import TableManagedAthletes from "@/components/tables/TableManagedAthletes.vue";
import { AthleteUser } from "@/helpers/users/user";
import {
  getProgramUniqueWeeks,
  getProgramUniqueDays,
  getProgramUniqueExercises,
} from "@/helpers/programs/linesManagement";
import router from "@/router";

// Set expose
defineExpose({ handleDrawerClick });

// Use plugins
const $q = useQuasar();
const i18n = useI18n();
const route = useRoute();
const { height } = dom;

// Get store
const user = useUserStore();
const coachInfo = useCoachInfoStore();

// Set constants
const UtilsOptions = {
  list: "list",
  charts: "charts",
  maxlifts: "maxlifts",
};

// Set ref for generic use
const splitterModel = ref(30);
const showingUtils = ref(UtilsOptions.list);

// Set ref related to program
const programManagerElement = ref<HTMLElement>();
const selectedProgram = ref<Program>(new Program());
const substituteProgram = ref<Program | string>();
const oldAthleteAssigned = ref<AthleteUser>();
const programSaved = ref(true);
const filterWeek = ref<string[]>();
const filterDay = ref<string[]>();
const filterExercise = ref<string[]>();
const showTemporaryProgramRestoreDialog = ref(false);
const showAthleteAssigningDialog = ref(false);
const programManagerExpanded = ref(false);
const programManagerHeight = ref(0);

// Set ref related to maxlift
const updatingMaxlift = ref<MaxLift>();
const searchMaxLift = ref<string>();
const showMaxliftAddDialog = ref(false);
const maxliftFormElement = ref<typeof FormMaxLift>();
const selectedMaxlift = computed(() => updatingMaxlift.value ?? new MaxLift());

// Get program requested from router
const requestedProgram = computed(
  () =>
    coachInfo.programs
      ?.find((program) => program.uid == route.params.programId)
      ?.duplicate(),
);

// Get temporary saved program
const temporaryProgram = computed(
  () => coachInfo.programs?.find((program) => !program.athleteId),
);

// Get complete program filter
const programFilter = computed({
  get() {
    return {
      week: filterWeek.value || [],
      day: filterDay.value || [],
      exercise: filterExercise.value || [],
    };
  },
  set(newValue) {
    filterWeek.value = newValue.week;
    filterDay.value = newValue.day;
    filterExercise.value = newValue.exercise;
  },
});

// Get max lifts for selected athlete
const athleteMaxlifts = computed(
  () =>
    coachInfo.maxlifts?.filter(
      (maxlift) => maxlift.athleteId == selectedProgram.value.athleteId,
    ),
);

// Decide whether to display warning dialog on new program
const showChangeProgramDialog = computed({
  get() {
    return Boolean(substituteProgram.value) && !programSaved.value;
  },
  set(newValue) {
    if (!newValue) substituteProgram.value = undefined;
  },
});

// Inform user that program is not saved upon changes.
watch(selectedProgram, (currProgram, prevProgram) => {
  if (currProgram.uid === prevProgram.uid) programSaved.value = false;
});

// Update selected program upon request from router
watch(
  requestedProgram,
  (program?: Program) => (substituteProgram.value = program),
  {
    immediate: true,
  },
);

// Try (but not force) to open a new program when requested
watch(substituteProgram, (program?: Program | string) => openProgram(program));

// Save info on athlete currently assigned to program
watch(
  programSaved,
  (isSaved) => {
    if (isSaved) oldAthleteAssigned.value = selectedProgram.value.athlete;
  },
  { immediate: true },
);

// Open dialog to inform of a temporary program
watch(
  temporaryProgram,
  (program) => (showTemporaryProgramRestoreDialog.value = Boolean(program)),
  { immediate: true },
);

/**
 * Open a program and display in builder for modification.
 *
 * @param program program, or corresponding program ID, that shall be opened.
 * @param force if true, force program loading even if unsaved changes are present.
 */
function openProgram(program?: Program | string, force: boolean = false) {
  // Update selected program if needed
  if (program && (programSaved.value || force)) {
    if (program instanceof Program) selectedProgram.value = program;
    else
      router.replace({
        params: { programId: program },
      });

    // Make sure to keep saved program flag upon this kind of update
    nextTick(() => (programSaved.value = true));

    // Clear any possible pending request
    substituteProgram.value = undefined;
  }
}

/**
 * Save current program instance.
 */
function saveProgram() {
  // Currently, only one temporary program can exist
  deleteTemporaryProgram();

  // Save current program instance
  const currProgram = selectedProgram.value;
  currProgram.coach = user.baseUser;
  currProgram.save({
    onSuccess: () => {
      // Inform user about saved program
      programSaved.value = true;
      (coachInfo.programs =
        coachInfo.programs?.filter(
          (program) => program.uid != currProgram.uid,
        ) || []).push(currProgram);

      // Update athlete profile with new program
      assignProgramToAthlete(
        currProgram,
        currProgram.athlete,
        oldAthleteAssigned.value,
      );
    },
    onError: () => {
      $q.notify({
        type: "negative",
        message: i18n.t("coach.program_management.builder.save_error"),
        position: "bottom",
      });
      programSaved.value = false;
    },
  });
}

/**
 * Assign a program to an athlete and save the update.
 *
 * @param program program that shall be assigned to athlete.
 * @param athlete athlete to which program shall be assigned.
 * @param oldAthlete old athlete to which program was assigned and shall now be unassigned.
 */
function assignProgramToAthlete(
  program: Program,
  athlete?: AthleteUser,
  oldAthlete?: AthleteUser,
) {
  // Update athlete info
  if (athlete) {
    athlete.assignedProgramId = program.uid;
    if (program.uid)
      (athlete.assignedPrograms = athlete.assignedPrograms || []).push(
        program.uid,
      );

    // Store changes
    athlete.saveUpdate({
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

  // Optionally remove program from a previously assigned athlete
  if (oldAthlete && oldAthlete != athlete) {
    oldAthlete.assignedProgramId = undefined;
    oldAthlete.saveUpdate({
      onError: () => {
        $q.notify({
          type: "negative",
          message: i18n.t(
            "coach.program_management.builder.save_unassignment_error",
            { name: oldAthlete.referenceName },
          ),
          position: "bottom",
        });
      },
    });
  }
}

/**
 * Open form with max lift info to allow coach to update them.
 *
 * @param maxlift instance that is being updated by coach.
 */
function onUpdateMaxLift(maxlift: MaxLift) {
  updatingMaxlift.value = maxlift;
  showMaxliftAddDialog.value = true;
}

/**
 * Create a new maxlift and assign to a coach
 *
 * @param newMaxLift max lift instance that shall be saved.
 */
function saveMaxlift(newMaxLift: MaxLift) {
  // Get current maxlift and check if already instanciated on db
  const isNew = !newMaxLift.uid;

  // Update values
  if (isNew) {
    newMaxLift.athleteId = selectedProgram.value.athlete?.uid;
    newMaxLift.coachId = user.uid;
  }

  // Save maxlift
  newMaxLift.save({
    onSuccess: () => {
      if (isNew)
        (coachInfo.maxlifts = coachInfo.maxlifts || []).push(newMaxLift);
      maxliftFormElement.value?.reset();
    },
    onError: () =>
      $q.notify({
        type: "negative",
        message: i18n.t(
          "coach.maxlift_management.list." +
            (isNew ? "add_error" : "update_error"),
        ),
        position: "bottom",
      }),
  });
  showMaxliftAddDialog.value = false;
}

/**
 * Open temporary program in builder.
 */
function onTemporaryProgramSelection() {
  substituteProgram.value = temporaryProgram.value;
}

/**
 * Open the program that is assigned to selected athlete.
 *
 * @param athlete athlete whose program should be opened.
 */
function onAthleteProgramSelection(athlete?: AthleteUser) {
  substituteProgram.value = athlete?.assignedProgramId;
}

/**
 * Delete temporary program from database and programs list.
 */
function deleteTemporaryProgram() {
  if (temporaryProgram.value) {
    temporaryProgram.value.remove();
    coachInfo.programs = coachInfo.programs?.filter(
      (program) => program != temporaryProgram.value,
    );
  }
}

/**
 * Update program manager element height value.
 */
function updateProgramManagerHeight() {
  programManagerHeight.value = programManagerElement.value
    ? height(programManagerElement.value)
    : 0;
}

/**
 * Handle custom right drawer click.
 *
 * @param clickParam parameters provided by drawer on click.
 */
function handleDrawerClick(clickParam: any) {
  // Get preferred right view
  let toShow = showingUtils.value;
  switch (clickParam) {
    case 0:
      toShow = UtilsOptions.list;
      break;
    case 1:
      toShow = UtilsOptions.charts;
      break;
    case 2:
      toShow = UtilsOptions.maxlifts;
      break;
    default:
      splitterModel.value = 0;
      return;
  }

  // Update right view or handle view size
  if (toShow === showingUtils.value) {
    if (splitterModel.value < 15) splitterModel.value = 30;
    else splitterModel.value = 0;
  } else {
    showingUtils.value = toShow;
    if (splitterModel.value < 15) splitterModel.value = 30;
  }
}

// Define what to do on component mount
onMounted(() => {
  // Open top card on large screens
  if ($q.screen.gt.sm) programManagerExpanded.value = true;
});
</script>

<style scoped lang="scss">
.os-top-card {
  position: sticky;
  top: 0;
  z-index: 1;
  border-radius: 0 0 20px 20px;
}
</style>
