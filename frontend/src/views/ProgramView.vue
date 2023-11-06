<template>
  <q-page style="height: 0">
    <q-splitter
      v-model="splitterModel"
      :limits="[50, 100]"
      style="height: 100%"
    >
      <template v-slot:before>
        <TableProgramBuilder
          :program="program"
          :exercises="coachInfo.exercises"
          class="q-pa-sm"
          cd
        ></TableProgramBuilder>
        <TableProgramBuilder
          :program="program"
          :exercises="coachInfo.exercises"
          class="q-pa-sm"
          cd
        ></TableProgramBuilder>
      </template>

      <template v-slot:after>
        <div class="q-pa-sm">
          <!-- TODO i18n -->
          <!-- TODO: add navigation in the right drawer -->

          <!-- CHART SELECTOR SECTION -->
          <!--  <h6 class="text-margin-xs">Charts Section</h6>
          <ChartSelector></ChartSelector> -->

          <!-- MAX LIFT SECTION -->
          <q-card>
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
                      v-model="selectedExerciseName"
                      :label="$t('coach.maxlift_management.fields.exercise')"
                      :options="exercises.map((exercise) => exercise.name)"
                      emit-value
                      map-options
                      dense
                    >
                    </os-select>
                    <os-select
                      v-model="selectedExerciseVariantsName"
                      :label="$t('coach.maxlift_management.fields.variant')"
                      :options="
                        selectedExercise?.value?.variants?.map(
                          (variant) => variant.name,
                        )
                      "
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
import { onMounted, ref, computed } from "vue";
import TableProgramBuilder from "@/components/tables/TableProgramBuilder.vue";
import { Program, ProgramLine } from "@/helpers/programs/program";
import { useCoachInfoStore } from "@/stores/coachInfo";
//import ChartSelector from "@/components/charts/ChartSelector.vue";
import TableMaxLifts from "@/components/tables/TableMaxLifts.vue";
import { MaxLift, MaxLiftType } from "@/helpers/maxlifts/maxlift";
import { useUserStore } from "@/stores/user";
import { Exercise, ExerciseVariant } from "@/helpers/exercises/exercise";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";

// Use plugins
const $q = useQuasar();
const i18n = useI18n();

// Get store
const user = useUserStore();
const coachInfo = useCoachInfoStore();

// Max lift declarations
const searchMaxLift = ref<string>();
const updatingMaxLift = ref<MaxLift>();
const showMaxLiftAddDialog = ref(false);

const selectedExerciseName = ref<string>();
const selectedExerciseVariantsName = ref<string>();
const selectedExercise = ref<Exercise>();

const maxliftExercise = ref<ExerciseVariant>(); // TODO check
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
    exercise: maxliftExercise.value, //TODO
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
    updatingMaxLift.value.exercise = maxliftExercise.value;
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
  maxliftExercise.value = undefined;
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
  maxliftExercise.value = maxlift.exercise ?? undefined;
  maxliftType.value = maxlift.type ?? undefined;
  maxliftValue.value = maxlift.value ?? "";
  maxliftDate.value = maxlift.lastUpdated ?? undefined;
}

// PROGRAMS
// TODO
const splitterModel = ref(70);

// TODO fix user
onMounted(() => {
  coachInfo.loadExercises(undefined, true);
});

// TODO load programs
const program = new Program({
  uid: "prova",
  name: "Program name",
  lines: [
    new ProgramLine({
      scheduleWeek: "A",
      scheduleDay: 1,
      scheduleOrder: 5,
      setsBaseValue: "sets",
      repsBaseValue: "reps",
      loadBaseValue: "load",
      rpeBaseValue: "rpe",
      exercise: coachInfo.exercises?.[0],
    }),
    new ProgramLine({
      scheduleWeek: "A",
      scheduleDay: 1,
      scheduleOrder: 3,
      setsBaseValue: "sets",
      repsBaseValue: "reps",
      loadBaseValue: "load",
      rpeBaseValue: "rpe",
      requestFeedbackText: true,
      exercise: coachInfo.exercises?.[0],
    }),
    new ProgramLine({
      scheduleWeek: "B",
      scheduleDay: 4,
      scheduleOrder: 1,
      setsBaseValue: "sets",
      repsBaseValue: "reps",
      loadBaseValue: "load",
      rpeBaseValue: "rpe",
      requestFeedbackText: true,
      exercise: coachInfo.exercises?.[1],
      exerciseVariant: coachInfo.exercises?.[1].variants?.[0],
    }),
    new ProgramLine({
      scheduleWeek: "B",
      scheduleDay: "1",
      scheduleOrder: 1,
      setsBaseValue: "sets",
      repsBaseValue: "reps",
      loadBaseValue: "load",
      rpeBaseValue: "rpe",
      requestFeedbackText: true,
    }),
  ],
});
</script>

<style scoped>
.small-ref-card {
  width: 350px;
  height: 250px;
}

.chart-card {
  width: 100%;
  height: 250px;
}

.program-day-card {
  width: 100%;
  height: 400px;
}

.my-filter-style {
  width: 180px;
  padding-bottom: 32px;
}

.my-tab-panel {
  width: 240px;
  height: 87vh;
}
</style>
