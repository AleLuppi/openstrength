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
        <!-- TODO i18n -->
        <div class="q-mx-md q-py-sm os-top-card shadow-5">
          <!-- Save button -->
          <q-btn
            icon="save"
            :label="programSaved ? 'Saved!' : 'changes not saved...'"
            :disable="programSaved"
            @click="programSaved = true"
            flat
          ></q-btn>

          <!-- Filter by week, day, exercise -->
          <div class="row items-end justify-evenly">
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
        </div>

        <!-- Show table to build program on the left -->
        <TableProgramBuilder
          :program="program"
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
            <h6 class="text-margin-xs">Charts Section</h6>
            <ChartSelector></ChartSelector>
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
const programFilter = computed(() => ({
  week: filterWeek.value || [],
  day: filterDay.value || [],
  exercise: filterExercise.value || [],
}));

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
const program = new Program({
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
          setsBaseValue: "sets",
          repsBaseValue: "reps",
          loadBaseValue: "load",
          rpeBaseValue: "rpe",
        }),
        new ProgramLine({
          setsBaseValue: "sets",
          repsBaseValue: "reps",
          loadBaseValue: "load",
          rpeBaseValue: "rpe",
          requestFeedbackText: true,
        }),
      ],
    }),
    new ProgramExercise({
      exercise: coachInfo.exercises?.[1],
      exerciseVariant: coachInfo.exercises?.[1].variants?.[0],
      scheduleWeek: "B",
      scheduleDay: 4,
      scheduleOrder: 2,
      lines: [
        new ProgramLine({
          setsBaseValue: "2",
          repsBaseValue: "reps",
          loadBaseValue: "load",
          rpeBaseValue: "rpe",
          requestFeedbackText: true,
          lineOrder: 2,
        }),
        new ProgramLine({
          setsBaseValue: "4",
          repsBaseValue: "reps",
          loadBaseValue: "load",
          rpeBaseValue: "rpe",
          requestFeedbackText: true,
          lineOrder: 4,
        }),
        new ProgramLine({
          setsBaseValue: "1",
          repsBaseValue: "reps",
          loadBaseValue: "load",
          rpeBaseValue: "rpe",
          requestFeedbackText: true,
          lineOrder: 1,
        }),
      ],
    }),
    new ProgramExercise({
      exercise: coachInfo.exercises?.[2],
      scheduleWeek: "B",
      scheduleDay: 4,
      scheduleOrder: 1,
      lines: [
        new ProgramLine({
          setsBaseValue: "2222222222222222222",
          repsBaseValue: "reps",
          loadBaseValue: "load",
          rpeBaseValue: "rpe",
          requestFeedbackText: true,
          lineOrder: 2,
        }),
        new ProgramLine({
          setsBaseValue: "4",
          repsBaseValue: "reps",
          loadBaseValue: "load",
          rpeBaseValue: "rpe",
          requestFeedbackText: true,
          lineOrder: 4,
        }),
        new ProgramLine({
          setsBaseValue: "1",
          repsBaseValue: "reps",
          loadBaseValue: "load",
          rpeBaseValue: "rpe",
          requestFeedbackText: true,
          lineOrder: 1,
        }),
      ],
    }),
    new ProgramExercise({
      exercise: coachInfo.exercises?.[2],
      exerciseVariant: coachInfo.exercises?.[1].variants?.[0],
      scheduleWeek: "B",
      scheduleDay: "1",
      scheduleOrder: 1,
      lines: [
        new ProgramLine({
          setsBaseValue: "sets",
          repsBaseValue: "reps",
          loadBaseValue: "load",
          rpeBaseValue: "rpe",
          requestFeedbackText: true,
        }),
      ],
    }),
  ],
});
watch(program, () => console.log("from parent"));

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
