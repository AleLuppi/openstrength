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
                    @click.stop="selectedProgram.athlete = undefined"
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
                  :options="
                    arrayUniqueValues(
                      selectedProgram?.programExercises?.map((exercise) =>
                        exercise.scheduleWeek?.toString(),
                      ) || [],
                    )
                  "
                  :label="$t('coach.program_management.filter.filter_week')"
                  multiple
                  hide-bottom-space
                  class="col-3"
                ></os-select>
                <os-select
                  v-model="filterDay"
                  :options="
                    arrayUniqueValues(
                      selectedProgram?.programExercises?.map((exercise) =>
                        exercise.scheduleDay?.toString(),
                      ) || [],
                    )
                  "
                  :label="$t('coach.program_management.filter.filter_day')"
                  multiple
                  hide-bottom-space
                  class="col-3"
                ></os-select>
                <os-select
                  v-model="filterExercise"
                  :options="
                    arrayUniqueValues(
                      selectedProgram?.programExercises?.map(
                        (exercise) => exercise.exercise?.name,
                      ) || [],
                    )
                  "
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
          v-model:saved="programSaved"
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
        <div class="q-pa-sm">
          <!-- TODO i18n -->
          <!-- CHART SELECTOR SECTION -->
          <div v-if="showingUtils == UtilsOptions.charts">
            <ChartSelector
              :program="selectedProgram"
              :filter-exercise="filterExerciseSet"
              :filter-day="filterDaySet"
              :filter-week="filterWeekSet"
            ></ChartSelector>
          </div>

          <!-- MAX LIFT SECTION -->
          <q-card v-else-if="showingUtils == UtilsOptions.maxlifts">
            <q-card-section>
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
                  :exercises="exercises"
                  @submit="saveMaxlift"
                  @reset="showMaxliftAddDialog = false"
                ></FormMaxLift>
              </q-card>
            </q-dialog>
          </q-card>
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
      v-model:selected="selectedProgram.athlete"
    >
    </DialogProgramAssignAthlete>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { dom } from "quasar";
import TableProgramBuilder from "@/components/tables/TableProgramBuilder.vue";
import { Program } from "@/helpers/programs/program";
import { useCoachInfoStore } from "@/stores/coachInfo";
import ChartSelector from "@/components/charts/ChartSelector.vue";
import TableMaxLifts from "@/components/tables/TableMaxLifts.vue";
import { MaxLift, MaxLiftType } from "@/helpers/maxlifts/maxlift";
import { useUserStore } from "@/stores/user";
import { Exercise } from "@/helpers/exercises/exercise";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { arrayUniqueValues } from "@/helpers/array";
import DialogProgramAssignAthlete from "@/components/dialogs/DialogProgramAssignAthlete.vue";
import FormMaxLift from "@/components/forms/FormMaxLift.vue";
import { getUniqueDayAndWeekNames } from "@/helpers/charts/chartDataFormatter";

import { testAllRepCases } from "@/helpers/programs/lineRepsTest";
import { testAllSetsCases } from "@/helpers/programs/lineSetsTest";
import { testAllRpeCases } from "@/helpers/programs/lineRpeTest";
import { testAllLoadCases } from "@/helpers/programs/lineLoadTest";

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

// Set ref related to program
const programManagerElement = ref<HTMLElement>();
const selectedProgram = ref<Program>(new Program());

const filterWeek = ref<string[]>([]);
const filterDay = ref<string[]>([]);
const filterExercise = ref<string[]>([]);
const showAthleteAssigningDialog = ref(false);
const programManagerExpanded = ref(false);
const programManagerHeight = ref(0);

// Set ref related to maxlift
const updatingMaxlift = ref<MaxLift>();
const showMaxliftAddDialog = ref(false);
const maxliftFormElement = ref<typeof FormMaxLift>();
const selectedMaxlift = computed(() => updatingMaxlift.value ?? new MaxLift());

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

// Inform user that program is not saved upon changes.
watch(selectedProgram, () => {
  programSaved.value = false;
});

/**
 * Save current program instance.
 */
function saveProgram() {
  // Save current program instance
  selectedProgram.value.save({
    onSuccess: () => {
      programSaved.value = true;
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
 * Create a new maxlift and assign to a coach
 */
function saveMaxlift() {
  // Get current maxlift and check if already instanciated on db
  const newMaxLift = selectedMaxlift.value;
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
 * Update program manager element height value.
 */
function updateProgramManagerHeight() {
  programManagerHeight.value = programManagerElement.value
    ? height(programManagerElement.value)
    : 0;
}

// Define what to do on component mount
onMounted(() => {
  if ($q.screen.gt.sm) programManagerExpanded.value = true;
});

// ----- TODO CHECK EVERYTHING BELOW -----

// TODO
// eslint-disable-next-line
const programIdFromRouter = computed(() => route.params.programId);

// Set constants
const UtilsOptions = {
  charts: "charts",
  maxlifts: "maxlifts",
};

// Set ref
const showingUtils = ref(UtilsOptions.charts);
const splitterModel = ref(30);
const programSaved = ref(true);

// Max lift declarations
const searchMaxLift = ref<string>();

const selectedExercise = ref<Exercise | undefined>();

const maxliftType = ref<MaxLiftType>(); // TODO check
const maxliftValue = ref(""); // TODO check
const maxliftDate = ref<Date>(); // TODO check

// Get exercises to display
const exercises = computed<Exercise[]>(() => {
  coachInfo.loadExercises(user.uid, true);
  return coachInfo.exercises || [];
});

/** TODO check
 * Compile form with max lift info to allow coach to update them.
 *
 * @param maxlift
 */
function onUpdateMaxLift(maxlift: MaxLift) {
  updatingMaxlift.value = maxlift;
  showMaxliftAddDialog.value = true;
  selectedExercise.value = maxlift.exercise ?? undefined;
  maxliftType.value = maxlift.type ?? undefined;
  maxliftValue.value = maxlift.value ?? "";
  maxliftDate.value = maxlift.lastUpdated ?? undefined;
}

// PROGRAMS

//watch(program, () => console.log("from parent"));

// Set ref

// Filter Week Sets

const filterWeekSet = computed(() => {
  if (filterWeek.value.length === 0) {
    return getUniqueDayAndWeekNames(selectedProgram.value).weeks;
  } else {
    return new Set([...filterWeek.value].sort());
  }
});

const filterDaySet = computed(() => {
  if (filterDay.value.length === 0) {
    return getUniqueDayAndWeekNames(selectedProgram.value).days;
  } else {
    return new Set([...filterDay.value].sort());
  }
});

const filterExerciseSet = computed(() => {
  return filterExercise.value.length > 0
    ? new Set(filterExercise.value)
    : undefined;
});

// Test line computed props
// TODO: remove from here
testAllRepCases();
testAllSetsCases();
testAllRpeCases();
testAllLoadCases();

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
      toShow = UtilsOptions.charts;
      break;
    case 1:
      toShow = UtilsOptions.maxlifts;
      break;
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
</script>

<style scoped lang="scss">
.os-top-card {
  position: sticky;
  top: 0;
  z-index: 1;
  border-radius: 0 0 20px 20px;
}
</style>
