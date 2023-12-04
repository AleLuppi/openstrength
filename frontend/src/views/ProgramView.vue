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
        <!-- TODO i18n on whole below div -->
        <div class="q-mx-md q-pa-sm os-top-card shadow-5">
          <!-- Save button -->
          <div class="row justify-between">
            <q-btn
              icon="save"
              :label="programSaved ? 'Saved!' : 'changes not saved...'"
              :disable="programSaved"
              @click="programSaved = true"
              flat
            ></q-btn>

            <!-- Display and update assigned user -->
            <q-btn
              @click="showAthleteAssigningDialog = true"
              :label="selectedProgram.athlete ? undefined : 'Assign to athlete'"
              color="secondary"
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
              </q-item>
            </q-btn>
          </div>

          <!-- Filter by week, day, exercise -->
          <q-slide-transition>
            <div v-show="visible" class="row items-end justify-evenly">
              <h6>{{ "Filter by..." }}</h6>
              <os-select
                v-model="filterWeek"
                :options="
                  arrayUniqueValues(
                    selectedProgram?.programExercises?.map((exercise) =>
                      exercise.scheduleWeek?.toString(),
                    ) || [],
                  )
                "
                label="week"
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
                label="Day"
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
                label="Exercise"
                multiple
                hide-bottom-space
                class="col-3"
              ></os-select>
            </div>
          </q-slide-transition>
          <q-btn
            :icon="visible ? 'expand_less' : 'expand_more'"
            @click="visible = !visible"
            flat
            dense
            color="secondary"
            class="full-width q-mx-lg"
            :ripple="false"
          ></q-btn>
        </div>

        <!-- Show table to build program on the left -->
        <TableProgramBuilder
          v-model:program="program"
          :exercises="coachInfo.exercises"
          :filter="programFilter"
          v-model:saved="programSaved"
          class="q-pa-sm"
        ></TableProgramBuilder>
      </template>

      <template v-slot:after>
        <!-- Show charts on the right -->
        <div class="q-pa-sm">
          <!-- TODO i18n -->
          <!-- CHART SELECTOR SECTION -->
          <div v-if="showingUtils == UtilsOptions.charts">
            <ChartSelector
              :chartDataRequests="chartDataRequests"
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
                    updatingMaxLift = undefined;
                    showMaxLiftAddDialog = true;
                  "
                />
              </div>
            </q-card-section>

            <q-separator />

            <TableMaxLifts
              :maxlifts="maxlifts"
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
                  @submit="updatingMaxLift ? updateMaxLift() : createMaxLift()"
                  @reset="clearMaxLift"
                  class="q-my-md q-gutter-sm column"
                >
                  <q-card-section class="q-gutter-x-xs">
                    <os-select
                      v-model="selectedExercise"
                      :label="$t('coach.maxlift_management.fields.exercise')"
                      :options="exercises.map((exercise) => exercise.name)"
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
                    <q-btn flat :label="$t('common.cancel')" type="reset" />
                    <q-btn
                      :label="
                        updatingMaxLift
                          ? $t('coach.maxlift_management.list.update_proceed')
                          : $t('coach.maxlift_management.list.add_proceed')
                      "
                      type="submit"
                    />
                  </q-card-actions>
                </q-form>
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
      @selection="
        (_, row) =>
          assignAthleteToProgram('uid' in row ? (row.uid as string) : undefined)
      "
    >
    </DialogProgramAssignAthlete>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import TableProgramBuilder from "@/components/tables/TableProgramBuilder.vue";
import {
  Program,
  ProgramExercise,
  ProgramLine,
} from "@/helpers/programs/program";
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
import {
  OSAvailableXType,
  OSChartDataRequest,
  OSChartType,
  OSChartVersion,
} from "@/helpers/charts/chartTypes";

// Set expose
defineExpose({ handleDrawerClick });

// Use plugins
const $q = useQuasar();
const i18n = useI18n();
const route = useRoute();

// Get store
const user = useUserStore();
const coachInfo = useCoachInfoStore();

// Set ref
const selectedProgram = //ref<Program>();
  computed(() => program.value);
const filterWeek = ref<string[]>();
const filterDay = ref<string[]>();
const filterExercise = ref<string[]>();
const showAthleteAssigningDialog = ref(false);

// Get complete program filter
const programFilter = computed(() => ({
  week: filterWeek.value || [],
  day: filterDay.value || [],
  exercise: filterExercise.value || [],
}));

function assignAthleteToProgram(uid?: string) {
  const athlete = coachInfo.athletes?.find((athlete) => athlete.uid === uid);
  if (athlete) selectedProgram.value.athlete = athlete;
  console.log(selectedProgram.value.athlete);
}

// ----- TODO CHECK EVERYTHING BELOW -----
const visible = ref(false);

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
const updatingMaxLift = ref<MaxLift>();
const showMaxLiftAddDialog = ref(false);

const selectedExercise = ref<Exercise | undefined>();

const maxliftType = ref<MaxLiftType>(); // TODO check
const availableMaxLiftTypes: string[] = Object.values(MaxLiftType);
const maxliftValue = ref(""); // TODO check
const maxliftDate = ref<Date>(); // TODO check

// Get exercises to display
const exercises = computed<Exercise[]>(() => {
  coachInfo.loadExercises(user.uid, true);
  return coachInfo.exercises || [];
});

// Get maxlifts for a coach to display
const maxlifts = computed(() => {
  coachInfo.loadMaxLifts(user.uid, true);
  return coachInfo.maxlifts || [];
});

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
 * Create a new maxlift and assign to a coach
 */
function createMaxLift() {
  const newMaxLift = new MaxLift({
    exercise: selectedExercise.value,
    type: maxliftType.value,
    value: maxliftValue.value,
    lastUpdated: maxliftDate.value,
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

// PROGRAMS

// TODO load programs
const program = ref<Program>(
  new Program({
    uid: "prova",
    name: "Program name",
    programExercises: [
      new ProgramExercise({
        exercise: coachInfo.exercises?.[0],
        scheduleWeek: "A",
        scheduleDay: 1,
        scheduleOrder: 5,
        lines: [
          new ProgramLine({
            setsBaseValue: "5",
            repsBaseValue: "5",
            loadBaseValue: "5",
            rpeBaseValue: "5",
          }),
          new ProgramLine({
            setsBaseValue: "5",
            repsBaseValue: "5",
            loadBaseValue: "5",
            rpeBaseValue: "5",
            requestFeedbackText: true,
          }),
        ],
      }),
      new ProgramExercise({
        exercise: coachInfo.exercises?.[1],
        exerciseVariant: coachInfo.exercises?.[1].variants?.[1],
        scheduleWeek: "B",
        scheduleDay: 4,
        scheduleOrder: 2,
        lines: [
          new ProgramLine({
            setsBaseValue: "2",
            repsBaseValue: "5",
            loadBaseValue: "5",
            rpeBaseValue: "6",
            requestFeedbackText: true,
            lineOrder: 2,
          }),
          new ProgramLine({
            setsBaseValue: "4",
            repsBaseValue: "6",
            loadBaseValue: "6",
            rpeBaseValue: "6",
            requestFeedbackText: true,
            lineOrder: 4,
          }),
          new ProgramLine({
            setsBaseValue: "1",
            repsBaseValue: "6",
            loadBaseValue: "6",
            rpeBaseValue: "6",
            requestFeedbackText: true,
            lineOrder: 1,
          }),
        ],
      }),
      new ProgramExercise({
        exercise: coachInfo.exercises?.[1],
        exerciseVariant: coachInfo.exercises?.[1].variants?.[1],
        scheduleWeek: "D",
        scheduleDay: 4,
        scheduleOrder: 1,
        lines: [
          new ProgramLine({
            setsBaseValue: "4",
            repsBaseValue: "8",
            loadBaseValue: "20kg",
            rpeBaseValue: "8",
            requestFeedbackText: true,
            lineOrder: 2,
          }),
          new ProgramLine({
            setsBaseValue: "4",
            repsBaseValue: "3",
            loadBaseValue: "30kg",
            rpeBaseValue: "8",
            requestFeedbackText: true,
            lineOrder: 4,
          }),
          new ProgramLine({
            setsBaseValue: "1",
            repsBaseValue: "5",
            loadBaseValue: "32kg",
            rpeBaseValue: "5",
            requestFeedbackText: true,
            lineOrder: 1,
          }),
        ],
      }),
      new ProgramExercise({
        exercise: coachInfo.exercises?.[2],
        exerciseVariant: coachInfo.exercises?.[2].variants?.[2],
        scheduleWeek: "B",
        scheduleDay: 1,
        scheduleOrder: 1,
        lines: [
          new ProgramLine({
            setsBaseValue: "8",
            repsBaseValue: "2",
            loadBaseValue: "30 kg",
            rpeBaseValue: "rpe",
            requestFeedbackText: true,
          }),
        ],
      }),
      new ProgramExercise({
        exercise: coachInfo.exercises?.[2],
        exerciseVariant: coachInfo.exercises?.[2].variants?.[2],
        scheduleWeek: "C",
        scheduleDay: 1,
        scheduleOrder: 1,
        lines: [
          new ProgramLine({
            setsBaseValue: "6",
            repsBaseValue: "2",
            loadBaseValue: "40 kg",
            rpeBaseValue: "7",
            requestFeedbackText: true,
          }),
        ],
      }),
      new ProgramExercise({
        exercise: coachInfo.exercises?.[2],
        exerciseVariant: coachInfo.exercises?.[2].variants?.[2],
        scheduleWeek: "D",
        scheduleDay: 1,
        scheduleOrder: 1,
        lines: [
          new ProgramLine({
            setsBaseValue: "5",
            repsBaseValue: "5",
            loadBaseValue: "50 kg",
            rpeBaseValue: "8",
            requestFeedbackText: true,
          }),
        ],
      }),
      new ProgramExercise({
        exercise: coachInfo.exercises?.[1],
        exerciseVariant: coachInfo.exercises?.[1].variants?.[1],
        scheduleWeek: "E",
        scheduleDay: 1,
        scheduleOrder: 1,
        lines: [
          new ProgramLine({
            setsBaseValue: "5",
            repsBaseValue: "5",
            loadBaseValue: "50 kg",
            rpeBaseValue: "8",
            requestFeedbackText: true,
          }),
        ],
      }),
    ],
  }),
);
watch(program, () => console.log("from parent"));

const chartDataRequests: OSChartDataRequest[] = [
  {
    chartInfo: {
      chartType: OSChartType.Volume,
      chartVersion: OSChartVersion.TotalReps,
      xAxisType: OSAvailableXType.Weeks,
      chartTitle: "Total Reps varying weeks",
      chartDescription: "Total reps varying weeks computed as reps x sets",
    },
    program: program.value,
    selectedExercises: undefined,
    selectedDays: undefined,
    selectedWeeks: new Set(["A", "B", "C", "D"]),
  },
  {
    chartInfo: {
      chartType: OSChartType.Volume,
      chartVersion: OSChartVersion.TotalSets,
      xAxisType: OSAvailableXType.Weeks,
      chartTitle: "Total Sets varying weeks",
      chartDescription:
        "Total sets varying weeks computed as the sum of the sets",
    },
    program: program.value,
    selectedExercises: undefined,
    selectedDays: undefined,
    selectedWeeks: new Set(["A", "B", "C", "D"]),
  },
  {
    chartInfo: {
      chartType: OSChartType.Volume,
      chartVersion: OSChartVersion.TotalVolume,
      xAxisType: OSAvailableXType.Weeks,
      chartTitle: "Total Volume varying weeks",
      chartDescription:
        "Total volume varying weeks computed as the sum of the sets*reps*load",
    },
    program: program.value,
    selectedExercises: undefined,
    selectedDays: undefined,
    selectedWeeks: new Set(["A", "B", "C", "D"]),
  },
];

// Test line translation
const lineTest = new ProgramLine({
  setsBaseValue: "W1-3",
  repsBaseValue: "5/8",
  loadBaseValue: "50kg/70kg",
  rpeBaseValue: "5",
  requestFeedbackText: true,
  setsReference: new ProgramLine({
    setsBaseValue: "8",
    repsBaseValue: "5",
    loadBaseValue: "50 kg",
    rpeBaseValue: "8",
    requestFeedbackText: true,
  }),
  repsReference: new ProgramLine({
    setsBaseValue: "8",
    repsBaseValue: "5",
    loadBaseValue: "50 kg",
    rpeBaseValue: "8",
    requestFeedbackText: true,
  }),
  loadReference: new ProgramLine({
    setsBaseValue: "8",
    repsBaseValue: "5",
    loadBaseValue: "50 kg",
    rpeBaseValue: "8",
    requestFeedbackText: true,
    maxliftReference: new MaxLift({
      type: MaxLiftType._1RM,
      exercise: coachInfo.exercises?.[1],
      value: "40",
    }),
  }),
});

console.log("-----------START---------------");
console.log("-----------SETS---------------");
console.log("setsValue", lineTest.setsValue);
console.log("setsBaseValue", lineTest.setsBaseValue);
console.log("setsComputedValue", lineTest.setsComputedValue);
console.log("setsSupposedValue", lineTest.setsSupposedValue);
console.log("setsRangeMin", lineTest.setsRangeMin);
console.log("setsRangeMax", lineTest.setsRangeMax);
console.log("setsOperation", lineTest.setsOperation);
console.log("setsReference", lineTest.setsReference);
console.log("requireSets", lineTest.requireSets);
console.log("-----------REPS---------------");
console.log("repsValue", lineTest.repsValue);
console.log("repsBaseValue", lineTest.repsBaseValue);
console.log("repsComputedValue", lineTest.repsComputedValue);
console.log("repsSupposedValue", lineTest.repsSupposedValue);
console.log("repsRangeMin", lineTest.repsRangeMin);
console.log("repsRangeMax", lineTest.repsRangeMax);
console.log("repsOperation", lineTest.repsOperation);
console.log("repsReference", lineTest.repsReference);
console.log("requireReps", lineTest.requireReps);
console.log("-----------LOAD---------------");
console.log("loadValue", lineTest.loadValue);
console.log("loadBaseValue", lineTest.loadBaseValue);
console.log("loadComputedValue", lineTest.loadComputedValue);
console.log("loadSupposedValue", lineTest.loadSupposedValue);
console.log("loadRangeMin", lineTest.loadRangeMin);
console.log("loadRangeMax", lineTest.loadRangeMax);
console.log("loadOperation", lineTest.loadOperation);
console.log("loadReference", lineTest.loadReference);
console.log("requireLoad", lineTest.requireLoad);
console.log("-----------RPE---------------");
console.log("rpeValue", lineTest.rpeValue);
console.log("rpeBaseValue", lineTest.rpeBaseValue);
console.log("rpeComputedValue", lineTest.rpeComputedValue);
console.log("rpeSupposedValue", lineTest.rpeSupposedValue);
console.log("rpeRangeMin", lineTest.rpeRangeMin);
console.log("rpeRangeMax", lineTest.rpeRangeMax);
console.log("rpeOperation", lineTest.rpeOperation);
console.log("rpeReference", lineTest.rpeReference);
console.log("requireRpe", lineTest.requireRpe);

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
  z-index: 1;
  border-radius: 0 0 20px 20px;
}
</style>
