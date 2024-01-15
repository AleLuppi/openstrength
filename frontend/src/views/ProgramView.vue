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
          v-if="selectedProgram"
          ref="programManagerElement"
          class="q-mx-sm q-pa-sm os-top-card shadow-5 bg-lightest"
        >
          <!-- Utility buttons -->
          <div class="row justify-between">
            <!-- Save button -->
            <div
              @click="saveProgram()"
              class="row items-center justify-center"
              :class="{ 'cursor-pointer': !programSaved }"
            >
              <q-btn
                :icon="programSaved ? 'done' : 'save'"
                :disable="programSaved"
                :outline="!programSaved"
                :flat="programSaved"
                :color="programSaved ? 'positive' : 'primary'"
                class="q-pa-sm q-mx-sm"
              ></q-btn>
              <span
                class="text-grey"
                :class="{ 'text-grey-7 text-bold': !programSaved }"
              >
                {{
                  $t(
                    programSaved
                      ? "coach.program_management.builder.saved"
                      : "coach.program_management.builder.not_saved",
                  )
                }}
              </span>
            </div>

            <!-- Display and update assigned user -->
            <div
              v-if="selectedProgram.athlete"
              class="row items-center justify-center q-col-gutter-sm"
            >
              <span class="text-black">
                {{ $t("coach.program_management.builder.assigned_athlete") }}
              </span>
              <div>
                <q-btn
                  color="secondary"
                  outline
                  :dense="Boolean(selectedProgram.athlete)"
                >
                  <q-item dense class="q-py-none q-px-md">
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
                  </q-item>
                </q-btn>
              </div>
            </div>

            <!-- Get shareable link to program -->
            <div>
              <q-btn
                @click="
                  saveProgram();
                  showShareProgramDialog = true;
                "
                outline
                flat
                icon="sym_o_share"
                :label="$t('coach.program_management.viewer.send_program')"
              >
              </q-btn>
            </div>
          </div>

          <!-- Filter by week, day, exercise -->
          <q-slide-transition
            @show="updateProgramManagerHeight"
            @hide="updateProgramManagerHeight"
          >
            <div v-show="programManagerExpanded">
              <div
                class="row items-end justify-between q-col-gutter-sm q-pt-md"
              >
                <h6 class="col-md-2 col-5">
                  {{ $t("coach.program_management.filter.title") }}
                </h6>
                <os-select
                  v-model="filterWeek"
                  :options="getProgramUniqueWeeks(selectedProgram)"
                  :label="$t('coach.program_management.filter.filter_week')"
                  multiple
                  hide-bottom-space
                  class="col-md-3 col-6"
                ></os-select>
                <os-select
                  v-model="filterDay"
                  :options="getProgramUniqueDays(selectedProgram)"
                  :label="$t('coach.program_management.filter.filter_day')"
                  multiple
                  hide-bottom-space
                  class="col-md-3 col-6"
                ></os-select>
                <os-select
                  v-model="filterExercise"
                  :options="getProgramUniqueExercises(selectedProgram)"
                  :label="$t('coach.program_management.filter.filter_exercise')"
                  multiple
                  hide-bottom-space
                  class="col-md-3 col-6"
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

        <!-- Show table to build program -->
        <TableProgramBuilder
          v-if="selectedProgram?.athlete"
          :model-value="selectedProgram"
          @update:model-value="
            (program) => {
              if (program) onProgramTableUpdate(program);
            }
          "
          @new-exercise="
            (exerciseName, programExercise) =>
              onNewExercise(exerciseName, undefined, programExercise)
          "
          @new-variant="onNewExercise"
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

        <!-- Create a new program or open one already assigned to athlete -->
        <div v-else class="q-pa-lg column items-center">
          <h4 class="text-margin-xs">
            {{ $t("coach.program_management.builder.initialize_program") }}
          </h4>
          <q-btn
            icon="sym_o_assignment_add"
            @click="openNewProgram"
            :label="$t('coach.program_management.builder.new_program')"
            rounded
            unelevated
          />

          <p class="q-ma-md">{{ $t("common.or_long") }}</p>

          <!-- Show recently opened programs -->
          <h6 class="text-margin-xs">
            {{ $t("coach.program_management.builder.open_recent") }}
          </h6>
          <TableExistingPrograms
            :programs="allAssignedPrograms"
            @update:selected="(program) => openProgram(program?.uid)"
            :small="!$q.screen.gt.sm"
          />
        </div>
      </template>

      <template v-slot:after>
        <!-- Show charts on the right -->
        <div class="q-pa-sm" style="min-width: 100px; overflow: hidden">
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
              <h6 class="text-margin-xs">
                {{ $t("coach.maxlift_management.list.maxlift_section") }}
              </h6>

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
              :no-data-label="$t('coach.maxlift_management.list.no_maxlift')"
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
                  :maxlift="updatingMaxlift"
                  :athlete="selectedProgram?.athlete"
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
            <div class="row justify-between q-mt-xs">
              <h6>{{ $t("coach.program_management.list.program_section") }}</h6>

              <!-- Start a new program -->
              <div class="column justify-center">
                <q-btn
                  icon="add"
                  :label="$t('coach.program_management.builder.new_program')"
                  @click="openNewProgram"
                  rounded
                  outline
                  padding="xs sm"
                ></q-btn>
              </div>
            </div>

            <!-- Search status or temporary program -->
            <q-card>
              <q-card-section v-if="selectedProgram">
                <div class="row justify-between">
                  <div class="column">
                    <p>
                      {{
                        selectedProgram.name ??
                        $t("coach.program_management.fields.program")
                      }}
                    </p>
                    <p
                      class="text-italic text-xs"
                      v-if="selectedProgram.lastUpdated"
                    >
                      {{ $t("coach.program_management.builder.last_update") }}
                      {{ $d(selectedProgram.lastUpdated, "middle") }}
                    </p>
                  </div>

                  <q-btn
                    icon="edit"
                    outline
                    flat
                    rounded
                    size="0.8em"
                    color="light-dark"
                    @click="showNewProgramDialog = true"
                  ></q-btn>
                </div>

                <p
                  class="q-mt-md text-italic"
                  v-if="selectedProgram.description"
                >
                  {{ selectedProgram.description }}
                </p>
              </q-card-section>
              <q-card-section
                v-else-if="coachActiveChanges.program"
                class="cursor-pointer"
                @click="onUnsavedProgramRestore"
              >
                <p class="text-primary">
                  {{ $t("coach.program_management.builder.open_temporary") }}
                </p>
                <p
                  class="text-italic text-xs"
                  v-if="coachActiveChanges.program.lastUpdated"
                >
                  {{ $t("coach.program_management.builder.last_update") }}
                  {{ $d(coachActiveChanges.program.lastUpdated, "middle") }}
                </p>
              </q-card-section>
              <q-card-section v-else>{{
                $t("coach.program_management.builder.start_program")
              }}</q-card-section>
            </q-card>

            <!-- Select among assigned programs -->
            <q-card>
              <TableExistingPrograms
                v-if="selectedProgram"
                :programs="allAssignedPrograms"
                @update:selected="(program) => openProgram(program?.uid)"
                :small="true"
              />
            </q-card>
          </div>
        </div>
      </template>

      <template v-slot:separator>
        <!-- Add a middle separator -->
        <q-avatar
          color="secondary"
          text-color="white"
          size="32px"
          icon="drag_indicator"
        />
      </template>
    </q-splitter>

    <!-- Dialog to set program info -->
    <q-dialog v-model="showNewProgramDialog">
      <q-card>
        <q-card-section>
          <FormProgramInfo
            :program="selectedProgram"
            @submit="
              (program) => {
                saveProgram(program);
                showNewProgramDialog = false;
              }
            "
          ></FormProgramInfo>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog to assign program to athlete -->
    <DialogProgramAssignAthlete
      v-model="showAthleteAssigningDialog"
      :athletes="coachInfo.athletes ?? []"
      :selected="selectedProgram?.athlete"
      @update:selected="
        (athlete) => {
          if (selectedProgram) selectedProgram.athlete = athlete;
          programSaved = false;
        }
      "
    >
    </DialogProgramAssignAthlete>

    <!-- Dialog to share program with athlete -->
    <DialogProgramShareWithAthlete
      v-if="selectedProgram?.uid"
      v-model="showShareProgramDialog"
      :program-id="selectedProgram.uid"
    ></DialogProgramShareWithAthlete>

    <!-- Dialog to change unsaved program -->
    <q-dialog v-model="showChangeProgramDialog">
      <q-card>
        <q-card-section class="row items-center">
          <q-icon
            name="fa-solid fa-circle-exclamation"
            color="negative"
            size="sm"
          />
          <span class="q-ml-sm">{{
            $t("coach.program_management.builder.not_saved_prompt")
          }}</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            :label="$t('common.cancel')"
            color="secondary"
            v-close-popup
          />
          <q-btn
            :label="$t('common.continue')"
            color="primary"
            @click="openProgram(substituteProgramId, true)"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog to open temporary program -->
    <q-dialog v-model="showUnsavedProgramRestoreDialog">
      <q-card>
        <q-card-section class="row items-center">
          <q-icon
            name="fa-solid fa-circle-exclamation"
            color="primary"
            size="md"
          />
          <span class="q-ml-sm">{{
            $t("coach.program_management.builder.not_assigned_prompt")
          }}</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            :label="$t('common.cancel')"
            color="secondary"
            v-close-popup
          />
          <q-btn
            :label="$t('common.open')"
            color="primary"
            @click="onUnsavedProgramRestore"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  onMounted,
  nextTick,
  onBeforeUnmount,
} from "vue";
import { debounce, dom } from "quasar";
import TableProgramBuilder from "@/components/tables/TableProgramBuilder.vue";
import { Program, ProgramExercise } from "@/helpers/programs/program";
import { useUserStore } from "@/stores/user";
import { useCoachInfoStore } from "@/stores/coachInfo";
import { useCoachActiveChangesStore } from "@/stores/coachActiveChanges";
import ChartSelector from "@/components/charts/ChartSelector.vue";
import TableMaxLifts from "@/components/tables/TableMaxLifts.vue";
import { MaxLift } from "@/helpers/maxlifts/maxlift";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import DialogProgramAssignAthlete from "@/components/dialogs/DialogProgramAssignAthlete.vue";
import DialogProgramShareWithAthlete from "@/components/dialogs/DialogProgramShareWithAthlete.vue";
import FormMaxLift from "@/components/forms/FormMaxLift.vue";
import TableExistingPrograms from "@/components/tables/TableExistingPrograms.vue";
import { AthleteUser } from "@/helpers/users/user";
import {
  getProgramUniqueWeeks,
  getProgramUniqueDays,
  getProgramUniqueExercises,
} from "@/helpers/programs/linesManagement";
import router, { NamedRoutes } from "@/router";
import FormProgramInfo from "@/components/forms/FormProgramInfo.vue";
import { Exercise, ExerciseVariant } from "@/helpers/exercises/exercise";
import { reduceExercises } from "@/helpers/exercises/listManagement";
import { event } from "vue-gtag";

// Define emits
const emit = defineEmits<{
  activateDrawerItem: [item: number];
}>();

// Define expose
defineExpose({ handleDrawerClick });

// Use plugins
const $q = useQuasar();
const i18n = useI18n();
const route = useRoute();
const { height } = dom;

// Get store
const user = useUserStore();
const coachInfo = useCoachInfoStore();
const coachActiveChanges = useCoachActiveChangesStore();

// Set constants
const UtilsOptions = {
  list: "list",
  charts: "charts",
  maxlifts: "maxlifts",
};
const splitterThresholdValue = 15;

// Set ref for generic use
const splitterModel = ref(0);
const showingUtils = ref(UtilsOptions.list);

// Set ref related to program
const programManagerElement = ref<HTMLElement>();
const selectedProgram = ref<Program>();
const substituteProgramId = ref<string>();
const oldAthleteAssigned = ref<AthleteUser>();
const programSaved = ref(true);
const filterWeek = ref<string[]>();
const filterDay = ref<string[]>();
const filterExercise = ref<string[]>();
const showNewProgramDialog = ref(false);
const showUnsavedProgramRestoreDialog = ref(false);
const showAthleteAssigningDialog = ref(false);
const showShareProgramDialog = ref(false);
const programManagerExpanded = ref(false);
const programManagerHeight = ref(0);

// Set ref related to maxlift
const updatingMaxlift = ref<MaxLift>();
const searchMaxLift = ref<string>();
const showMaxliftAddDialog = ref(false);
const maxliftFormElement = ref<typeof FormMaxLift>();

// Get program requested from router
const requestedProgram = computed(
  () =>
    coachInfo.programs
      ?.find((program) => program.uid == route.params.programId)
      ?.duplicate(),
);

// Get all coach programs
const allAssignedPrograms = computed(
  () =>
    coachInfo.programs?.filter(
      (program) => program.uid === program.athlete?.assignedProgramId,
    ) || [],
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
      (maxlift) => maxlift.athleteId == selectedProgram.value?.athleteId,
    ),
);

// Decide whether to display warning dialog on new program
const showChangeProgramDialog = computed({
  get() {
    return substituteProgramId.value != undefined && !programSaved.value;
  },
  set(newValue) {
    if (!newValue) substituteProgramId.value = undefined;
  },
});

// Update selected program upon request from router
watch(
  requestedProgram,
  (program?: Program) => {
    // Abort update if request comes while unmounting component
    if (route.name != NamedRoutes.program) return;

    // Set selected program
    selectedProgram.value = program;
    setSavedValue();
  },
  {
    immediate: true,
  },
);

// Show new program dialog when requested
watch(
  () => route.query.new,
  (val) => {
    if (val == "true") showNewProgramDialog.value = true;
  },
  { immediate: true },
);

// Try (but not force) to open a new program when requested
watch(substituteProgramId, (programId?: string) => openProgram(programId));

// Perform operations when program saved status change
watch(
  programSaved,
  (isSaved) => {
    if (isSaved) {
      // Save info on athlete currently assigned to program
      oldAthleteAssigned.value = selectedProgram.value?.athlete;
    }
  },
  { immediate: true },
);

// Perform operations on program update
watch(selectedProgram, (program) => {
  // Active changes on current program
  if (program) coachActiveChanges.program = program;
});

// Update drawer active item when splitter value changes
watch(
  splitterModel,
  (newVal, oldVal) => {
    if ((oldVal === 0 || oldVal === undefined) && newVal > 0)
      emit(
        "activateDrawerItem",
        Object.values(UtilsOptions).findIndex(
          (val) => val == showingUtils.value,
        ),
      );
    if (oldVal && oldVal > 0 && newVal === 0) emit("activateDrawerItem", -1);
  },
  { immediate: true },
);

/**
 * Set saved info and ensure it is preserved.
 */
function setSavedValue() {
  // Set saved value and ensure it is preserved at next tick
  programSaved.value = true;
  nextTick(() => (programSaved.value = true));
}

/**
 * Open a program and display in builder for modification.
 *
 * @param programId ID of program that shall be opened.
 * @param force if true, force program loading even if unsaved changes are present.
 */
function openProgram(programId?: string, force: boolean = false) {
  // Update selected program if needed
  if (
    route.name === NamedRoutes.program &&
    programId != undefined &&
    (programSaved.value || force)
  ) {
    router.replace({
      ...route,
      params: { ...route.params, programId: programId },
      query: { ...(programId ? {} : { new: "true" }) },
    });

    // Clear any possible pending request
    substituteProgramId.value = undefined;

    // Register GA4 event
    event("programview_existingprogram_open", {
      event_category: "documentation",
      event_label: "Program opened in ProgramView for modification",
      value: 1,
    });
  }
}

/**
 * Update selected program value and try autosave.
 *
 * @param program new program values that shall be stored.
 */
function onProgramTableUpdate(program: Program) {
  // Update selected program
  selectedProgram.value = program;
  programSaved.value = false;

  // Start autosave
  autosaveProgram();
}

/**
 * Save current program instance.
 *
 * @param program optional program instance that shall be save.
 * @param checkUnsaved if true, only save if program shows active changes.
 */
function saveProgram(program?: Program, checkUnsaved: boolean = false) {
  // Check if program is unsaved
  if (checkUnsaved && programSaved.value) return;

  // Save current program instance
  const currProgram = program ?? selectedProgram.value;
  if (!currProgram) return;
  currProgram.coach = user.baseUser;
  currProgram.save({
    saveFrozenView: true,
    onSuccess: () => {
      // Inform user about saved program
      setSavedValue();
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

      // Clear active change on current program
      coachActiveChanges.program = undefined;

      // Open program by updating route params
      openProgram(currProgram.uid);
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
 * Autosave program with debounce.
 */
const autosaveProgram = debounce(() => {
  saveProgram(undefined, true);
}, 60 * 1000 /* debounce 60 seconds */);

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
 * Handle request of new exercise or variant from program table.
 *
 * @param exerciseName name of new exercise that shall be created, or parent exercise of variant that shall be created.
 * @param variantName name of new variant that shall be created.
 * @param programExercise optional program exercise that shall be updated with new exercise or variant.
 */
function onNewExercise(
  exerciseName: string,
  variantName?: string,
  programExercise?: ProgramExercise,
) {
  // Check if creating new exercise of variant
  if (variantName) {
    // Creating new variant

    // Get parent exercise
    const exercise = coachInfo.exercises?.find(
      (exercise) => exercise.name?.toLowerCase() == exerciseName.toLowerCase(),
    );
    if (!exercise) {
      $q.notify({
        type: "negative",
        message: i18n.t("coach.exercise_management.add_error"),
        position: "bottom",
      });
      return;
    }

    // Create and save new variant
    const newVariant = new ExerciseVariant({
      name: variantName,
      exercise: exercise,
    });
    newVariant.saveNew({
      onSuccess: () => {
        // Store variant in local storages
        exercise.variants?.unshift(newVariant);
        if (programExercise) programExercise.exerciseVariant = newVariant;

        // Force update of program under modification
        if (selectedProgram.value) {
          const duplicteProgram = selectedProgram.value.duplicate();
          nextTick(() => onProgramTableUpdate(duplicteProgram));
        }

        // Inform user
        $q.notify({
          type: "positive",
          message: i18n.t("coach.exercise_management.add_success", {
            exercise: newVariant.name,
          }),
          position: "bottom",
        });
      },
      onError: () =>
        $q.notify({
          type: "negative",
          message: i18n.t("coach.exercise_management.add_error"),
          position: "bottom",
        }),
    });
  } else {
    // Creating new exercise

    // Create and save new exercise
    const newExercise = new Exercise({
      name: exerciseName,
    });
    newExercise.saveNew({
      onSuccess: () => {
        // Store exercise in local storage
        coachInfo.exercises = reduceExercises(
          (coachInfo.exercises || []).concat([newExercise]),
        );
        if (programExercise) {
          programExercise.exercise = newExercise;
          programExercise.exerciseVariant = newExercise.defaultVariant;
        }

        // Force update of program under modification
        if (selectedProgram.value) {
          const duplicteProgram = selectedProgram.value.duplicate();
          nextTick(() => onProgramTableUpdate(duplicteProgram));
        }

        // Inform user about exercise successfully saved
        $q.notify({
          type: "positive",
          message: i18n.t("coach.exercise_management.add_success", {
            exercise: newExercise?.name,
          }),
          position: "bottom",
        });

        // Register GA4 event
        event("new_exercise_added", {
          event_category: "documentation",
          event_label: "New Exercise Added to Library",
          value: 1,
        });
      },
      onError: () => {
        // Inform user about error while saving exercise
        $q.notify({
          type: "negative",
          message: i18n.t("coach.exercise_management.add_error"),
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
 * Create a new maxlift and assign to a coach.
 *
 * @param newMaxLift max lift instance that shall be saved.
 */
function saveMaxlift(newMaxLift: MaxLift) {
  // Get current maxlift and check if already instanciated on db
  const isNew = !newMaxLift.uid;

  // Update values
  if (isNew) {
    newMaxLift.athleteId = selectedProgram.value?.athlete?.uid;
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
 * Propose a new program as selected program.
 */
function openNewProgram() {
  if (selectedProgram.value) substituteProgramId.value = "";
  else showNewProgramDialog.value = true;

  // Register GA4 event
  event("programview_newprogram_click", {
    event_category: "documentation",
    event_label: "A new program is created",
    value: 1,
  });
}

/**
 * Open unsaved modified program in builder.
 */
function onUnsavedProgramRestore() {
  substituteProgramId.value = coachActiveChanges.program?.uid;

  // Register GA4 event
  event("programview_open_unsavedprog", {
    event_category: "documentation",
    event_label: "Unsaved program restore",
    value: 1,
  });
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
function handleDrawerClick(clickParam: number) {
  // Get preferred right view
  let toShow = showingUtils.value;
  switch (clickParam) {
    case 0:
    case 1:
    case 2:
      toShow = Object.values(UtilsOptions)[clickParam];
      break;
    default:
      splitterModel.value = 0;
      return;
  }

  // Update right view or handle view size
  if (toShow === showingUtils.value) {
    if (splitterModel.value < splitterThresholdValue) splitterModel.value = 30;
    else {
      splitterModel.value = 0;
      emit("activateDrawerItem", -1);
      return;
    }
  } else {
    showingUtils.value = toShow;
    if (splitterModel.value < splitterThresholdValue) splitterModel.value = 30;
  }
  emit("activateDrawerItem", clickParam);
}

// Define what to do on component mount
onMounted(() => {
  // Open top card on large screens
  if ($q.screen.gt.sm) programManagerExpanded.value = true;
});

// Define what to do before component unmount
onBeforeUnmount(() => {
  // Clear autosave, and save program if required
  autosaveProgram.cancel();
  saveProgram(undefined, true);
});
</script>

<style scoped lang="scss">
.animate-pulse-with-rotation-sm {
  --animation-delay: 10s;
}

.os-top-card {
  position: sticky;
  top: 0;
  z-index: 1;
  border-radius: 0 0 20px 20px;
}
</style>
