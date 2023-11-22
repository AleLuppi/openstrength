<template>
  <div class="q-pa-md q-ma-md shadow-2" style="border-radius: 24px">
    <!-- Program exercise element -->
    <div
      :ref="(el) => (tableElements[idScheduleInfo] = el)"
      v-for="(exerciseModelValue, idScheduleInfo) in exercisesValues"
      :key="idScheduleInfo"
    >
      <!-- Show week and day and allow navigation -->
      <div
        v-if="firstTablesInDay.includes(idScheduleInfo.toString())"
        class="row items-center"
        :class="{
          'q-mt-lg': firstTablesInDay.indexOf(idScheduleInfo.toString()) > 0,
        }"
      >
        <h6 class="q-mt-none">
          <span class="underlined-dashed cursor-pointer">
            {{ getWeekDisplayName(idScheduleInfo, true) }}
            <q-menu auto-close>
              <q-list
                v-for="week in allWeeks.filter(
                  (oneWeek) =>
                    oneWeek !=
                    splitScheduleInfoNames(idScheduleInfo.toString())[0],
                )"
                :key="week"
                style="min-width: 100px"
              >
                <q-item
                  clickable
                  @click="
                    scrollToElement(
                      tableElements[
                        mergeScheduleInfoNames(
                          week,
                          splitScheduleInfoNames(idScheduleInfo.toString())[1],
                          splitScheduleInfoNames(idScheduleInfo.toString())[2],
                        )
                      ] ??
                        tableElements[
                          Object.keys(tableElements).find(
                            (key) => splitScheduleInfoNames(key)[0] == week,
                          ) ?? 'undefined'
                        ],
                    )
                  "
                >
                  <q-item-section>{{
                    getWeekDisplayName(week)
                  }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </span>
          -
          <span class="underlined-dashed cursor-pointer">
            {{ getDayDisplayName(idScheduleInfo, true) }}
            <q-menu auto-close>
              <q-list
                v-for="day in allDays[
                  splitScheduleInfoNames(idScheduleInfo.toString())[0]
                ].filter(
                  (oneDay) =>
                    oneDay !=
                    splitScheduleInfoNames(idScheduleInfo.toString())[1],
                )"
                :key="day"
                style="min-width: 100px"
              >
                <q-item
                  clickable
                  @click="
                    scrollToElement(
                      tableElements[
                        mergeScheduleInfoNames(
                          splitScheduleInfoNames(idScheduleInfo.toString())[0],
                          day,
                          splitScheduleInfoNames(idScheduleInfo.toString())[2],
                        )
                      ],
                    )
                  "
                >
                  <q-item-section>{{ getDayDisplayName(day) }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </span>
        </h6>
        <q-separator inset size="1px" class="col" />
      </div>

      <!-- Exercise element -->
      <div class="row items-start justify-evenly q-mb-md">
        <!-- Reordering arrows -->
        <div class="col-1 self-center column justify-center">
          <q-btn
            @click="reorderTableRelative(idScheduleInfo.toString(), -1)"
            icon="arrow_drop_up"
            flat
            dense
            color="secondary"
            :disable="firstTablesInDay.includes(idScheduleInfo.toString())"
          />
          <q-btn
            @click="reorderTableRelative(idScheduleInfo.toString(), +1)"
            icon="arrow_drop_down"
            flat
            dense
            color="secondary"
            :disable="lastTablesInDay.includes(idScheduleInfo.toString())"
          />
        </div>

        <!-- Exercise info -->
        <div
          class="col-3 q-pa-sm bg-lighter os-exercise-form os-light-border"
          style="position: relative"
        >
          <osSelect
            :modelValue="exerciseModelValue.exercise"
            @update:model-value="
              (val?: string) =>
                updateSelectedExercise(idScheduleInfo.toString(), val)
            "
            :options="exercises.map((exercise) => exercise.name)"
          >
          </osSelect>
          <osSelect
            v-model="exerciseModelValue.variant"
            :options="
              selectedExercises[idScheduleInfo]?.variants?.map((variant) => ({
                label: variant.isDefault
                  ? $t('coach.exercise_management.default_variant')
                  : variant.name,
                value: variant.isDefault ? '' : variant.name,
              }))
            "
            map-options
            emit-value
          >
          </osSelect>
          <osInput v-model="exerciseModelValue.note" type="textarea"> </osInput>

          <!-- Delete buttons -->
          <q-btn
            icon="clear"
            @click="deleteTable(idScheduleInfo.toString())"
            round
            unelevated
            size="0.5em"
            color="red"
            class="os-exercise-delete-btn"
          />
        </div>

        <!-- Data table -->
        <osTableSheet
          v-model="exerciseModelValue.data"
          :headers="[
            'load',
            'reps',
            'sets',
            'rpe',
            'note',
            'requestText',
            'requestVideo',
          ]"
          :types="{
            requestText: 'checkbox',
            requestVideo: 'checkbox',
          }"
          :showNewLine="true"
          dense
          class="col os-light-border"
        >
        </osTableSheet>
      </div>

      <!-- New element button -->
      <div
        v-if="lastTablesInDay.includes(idScheduleInfo.toString())"
        class="row items-center justify-center q-gutter-md"
      >
        <q-btn
          icon="add"
          label="Exercise"
          @click="addTable(idScheduleInfo.toString())"
          rounded
          unelevated
        />
        <!-- TODO @click add day -->
        <q-btn
          icon="add"
          label="Day"
          @click="addTable(idScheduleInfo.toString())"
          rounded
          unelevated
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, PropType, watch } from "vue";
import { debounce, useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { scrollToElement } from "@/helpers/scroller";
import { compareArrays, uniqueValues } from "@/helpers/array";
import {
  Program,
  ProgramExercise,
  ProgramLine,
} from "@/helpers/programs/program";
import { orderProgramExercises } from "@/helpers/programs/linesManagement";
import { Exercise, ExerciseVariant } from "@/helpers/exercises/exercise";
import {
  objectDeepCompare,
  objectDeepCopy,
  objectMapKeys,
  objectMapValues,
} from "@/helpers/object";

// Init plugin
const $q = useQuasar();
const i18n = useI18n();

// Define props
const props = defineProps({
  program: {
    type: Program,
    required: true,
  },
  exercises: {
    type: Array as PropType<Exercise[]>,
    default: () => [],
  },
  saved: {
    type: Boolean,
    default: true,
  },
});

// Define emits
const emits = defineEmits(["update:program", "update:saved"]);

// Set useful values
const sepWekDay = ".";
const changes = ref<any[]>([]);
const storeChangesMethods: {
  [key: string]: Function;
} = {};

// Set ref
const tableElements = ref<{
  [key: string]: HTMLElement | any;
}>({});
const exercisesValues = ref<{
  [key: string]: {
    data: { [key: string]: any }[];
    exercise: string | undefined;
    variant: string | undefined;
    note: string | undefined;
  };
}>({});
const exercisesValuesLast = ref<{
  [key: string]: {
    data: { [key: string]: any }[];
    exercise: string | undefined;
    variant: string | undefined;
    note: string | undefined;
  };
}>({});

// Extract selected exercise and variant for each table
const selectedExercises = computed<{
  [key: string]: Exercise | undefined;
}>(() =>
  objectMapValues(exercisesValues.value, (exerciseValue) =>
    props.exercises.find((exercise) => exercise.name == exerciseValue.exercise),
  ),
);
const selectedExerciseVariants = computed<{
  [key: string]: ExerciseVariant | undefined;
}>(() =>
  objectMapValues(
    exercisesValues.value,
    (exerciseValue, key) =>
      selectedExercises.value[key]?.variants?.find(
        (variant) => variant.name == exerciseValue.variant,
      ),
  ),
);

// Get all program lines for each week and day
const sortedProgramExercises = computed(() =>
  props.program.programExercises
    ? orderProgramExercises(
        props.program.programExercises,
        mergeScheduleInfoNames,
      )
    : {},
);

// Get id of first and last table element for each day
const firstTablesInDay = computed(() =>
  Object.keys(exercisesValues.value).reduce((out: string[], key) => {
    const keySplit = splitScheduleInfoNames(key).slice(0, 2);
    if (
      !out.some((firstInDay) =>
        compareArrays(splitScheduleInfoNames(firstInDay).slice(0, 2), keySplit),
      )
    )
      return [...out, key];
    return out;
  }, []),
);
const lastTablesInDay = computed(() =>
  Object.keys(exercisesValues.value)
    .reverse()
    .reduce((out: string[], key) => {
      const keySplit = splitScheduleInfoNames(key).slice(0, 2);
      if (
        !out.some((firstInDay) =>
          compareArrays(
            splitScheduleInfoNames(firstInDay).slice(0, 2),
            keySplit,
          ),
        )
      )
        return [...out, key];
      return out;
    }, []),
);

// Get a reference to all weeks and days available
const allWeeks = computed(() =>
  uniqueValues(
    Object.keys(exercisesValues.value).map(
      (key) => splitScheduleInfoNames(key)[0],
    ),
  ),
);
const allDays = computed(() => {
  const outDays: { [key: string | number]: string[] } = {};
  Object.keys(exercisesValues.value).forEach((key) => {
    const [week, day] = splitScheduleInfoNames(key);
    if (!outDays[week]) outDays[week] = [];
    if (!outDays[week].includes(day)) outDays[week].push(day);
  });
  return outDays;
});

// Update data table on input change
watch(
  () => props.program,
  () => resetTableData(),
  { immediate: true },
);

// Store changes upon data change
watch(
  exercisesValues,
  (newValue) => {
    if (!objectDeepCompare(newValue, exercisesValuesLast.value))
      storeChanges("main", newValue);
  },
  {
    deep: true,
  },
);

// Reorder exercises upon update
watch(exercisesValues, () => sortExerciseValues());

// Ensure program gets saved if requested from outside
let savedValue = true;
watch(
  () => props.saved,
  (val) => {
    if (val && !savedValue) save();
    savedValue = val;
  },
  { immediate: true },
);

/**
 * Update table data according to input data.
 */
function resetTableData() {
  // Epmty changes
  changes.value.length = 0;

  // Delete previously stored values
  exercisesValues.value = {};

  // Set new exercise values
  Object.entries(sortedProgramExercises.value).forEach(
    ([idScheduleInfo, programExercise]) => {
      if (!exercisesValues.value[idScheduleInfo])
        exercisesValues.value[idScheduleInfo] = {
          data: [],
          exercise: undefined,
          variant: undefined,
          note: undefined,
        };

      // Prepare exercise-related values
      exercisesValues.value[idScheduleInfo].exercise =
        programExercise.exercise?.name;
      exercisesValues.value[idScheduleInfo].variant =
        programExercise.exerciseVariant?.name;
      exercisesValues.value[idScheduleInfo].note =
        programExercise.exerciseNote ?? "";

      // Prepare data-related values
      exercisesValues.value[idScheduleInfo].data =
        programExercise.lines?.map((line) => ({
          load: line.loadBaseValue,
          reps: line.repsBaseValue,
          sets: line.setsBaseValue,
          rpe: line.rpeBaseValue,
          note: line.note,
          requestText: line.requestFeedbackText,
          requestVideo: line.requestFeedbackVideo,
        })) ?? [];
    },
  );
}

/**
 * Update selected exercises.
 *
 * @param idScheduleInfo schedule info id whose exercise shall be updated.
 * @param newName new name of the exercise.
 */
function updateSelectedExercise(idScheduleInfo: string, newName?: string) {
  // Reset variant name
  if (exercisesValues.value[idScheduleInfo].exercise != newName)
    exercisesValues.value[idScheduleInfo].variant = undefined;

  // Update name
  exercisesValues.value[idScheduleInfo].exercise = newName;
}

/**
 * Sort a list of schedule ids according to week, day, order values.
 *
 * @param scheduleIds list of schedule ids.
 * @returns sorted list of schedule ids.
 */
function sortScheduleId(scheduleIds: string[]) {
  return scheduleIds.sort((scheduleIdA, scheduleIdB) => {
    const infoA = splitScheduleInfoNames(scheduleIdA);
    const infoB = splitScheduleInfoNames(scheduleIdB);

    let res = 0;
    for (let idx = 0; idx < 3; idx++) {
      res = infoA[idx]
        .padStart(infoB[idx].length, "0")
        .localeCompare(infoB[idx].padStart(infoA[idx].length, "0"));
      if (res) return res;
    }
    return 0;
  });
}

/**
 * Sort exercises by week, day, order.
 */
function sortExerciseValues() {
  const sortedKeys = sortScheduleId(Object.keys(exercisesValues.value));
  if (!compareArrays(sortedKeys, Object.keys(exercisesValues.value)))
    exercisesValues.value = sortedKeys.reduce(
      (out, key) => ({ ...out, [key]: exercisesValues.value[key] }),
      {},
    );
}

/**
 * Move one table from one scheduling order to another.
 *
 * @param srcId source scheduling id of table.
 * @param dstId destination scheduling id of table.
 */
function reorderTable(srcId: string, dstId: string) {
  const srcSchedule = splitScheduleInfoNames(srcId);
  const srcOrder = Number(srcSchedule[2]);
  const dstSchedule = splitScheduleInfoNames(dstId);
  const dstOrder = Number(dstSchedule[2]);

  // Map from current to new indexes for each day and week
  const renameMap = Object.keys(exercisesValues.value).reduce(
    (outMap: { [key: string]: string }, currId) => {
      let offset = 0;
      const currSchedule = splitScheduleInfoNames(currId);
      const currOrder = Number(currSchedule[2]);
      if (
        compareArrays(currSchedule.slice(0, 2), srcSchedule.slice(0, 2)) &&
        currOrder > srcOrder
      )
        offset -= 1;
      if (
        compareArrays(currSchedule.slice(0, 2), dstSchedule.slice(0, 2)) &&
        currOrder + offset >= dstOrder
      )
        offset += 1;
      if (offset)
        return {
          ...outMap,
          [currId]: mergeScheduleInfoNames(
            currSchedule[0],
            currSchedule[1],
            currOrder + offset,
          ),
        };
      return outMap;
    },
    {},
  );
  renameMap[srcId] = dstId;
  exercisesValues.value = objectMapKeys(
    exercisesValues.value,
    (key) => renameMap[key] ?? key,
  );
}

/**
 * Move one table from one scheduling order to another, while keeping week and day schedule.
 *
 * @param srcId source scheduling id of table.
 * @param dstId destination scheduling id of table.
 */
function reorderTableRelative(srcId: string, moveBy: number) {
  const srcSchedule = splitScheduleInfoNames(srcId);
  reorderTable(
    srcId,
    mergeScheduleInfoNames(
      srcSchedule[0],
      srcSchedule[1],
      Number(srcSchedule[2]) + moveBy,
    ),
  );
}

/**
 * Delete one exercise from the list.
 *
 * @param idScheduleInfo full name string.
 */
function deleteTable(idScheduleInfo: string) {
  delete exercisesValues.value[idScheduleInfo];
}

/**
 * Add one exercise to the list.
 *
 * @param idScheduleInfo full name that shall be assigned to the new table, only gets week and day codes if not available.
 */
function addTable(idScheduleInfo: string) {
  // Get the proper new table id
  if (idScheduleInfo in exercisesValues.value) {
    const scheduleInfo = splitScheduleInfoNames(idScheduleInfo);
    const largestOrder = Math.max(
      ...Object.keys(exercisesValues.value).reduce((orders: number[], key) => {
        const currScheduleInfo = splitScheduleInfoNames(key);
        if (
          currScheduleInfo[0] == scheduleInfo[0] &&
          currScheduleInfo[1] == scheduleInfo[1]
        )
          return [...orders, Number(currScheduleInfo[2])];
        return orders;
      }, []),
    );
    idScheduleInfo = mergeScheduleInfoNames(
      scheduleInfo[0],
      scheduleInfo[1],
      largestOrder + 1,
    );
  }

  // Reload whole object to force reorder check
  exercisesValues.value = {
    ...exercisesValues.value,
    [idScheduleInfo]: {
      data: [],
      exercise: undefined,
      variant: undefined,
      note: undefined,
    },
  };
}

/**
 * Merge week, day, order values to a single string.
 *
 * @param weekId week name.
 * @param dayId day name.
 * @param orderId order value.
 * @param sep string separator.
 * @returns a string with merged names.
 */
function mergeScheduleInfoNames(
  weekId: string | number,
  dayId: string | number,
  orderId: string | number,
  sep: string = sepWekDay,
) {
  return [weekId, dayId, orderId].filter(Boolean).join(sep);
}

/**
 * Separate week, day, order values from a single name string.
 *
 * @param nameScheduleInfo full name string.
 * @param sep string separator.
 * @returns a triplet of names for week, day, order.
 */
function splitScheduleInfoNames(
  nameScheduleInfo: string,
  sep: string = sepWekDay,
) {
  return nameScheduleInfo.split(sep);
}

/**
 * Get a single week display name given week ID.
 *
 * @param weekId base week name.
 * @param split if true, assume week ID is provided along with day ID, and thus require splitting.
 */
function getWeekDisplayName(weekId: string | number, split: boolean = false) {
  return i18n.t("coach.program_management.builder.week_name", {
    week: split
      ? splitScheduleInfoNames(weekId.toString())[0]
      : weekId.toString(),
  });
}

/**
 * Get a single day display name given day ID.
 *
 * @param dayId base day name.
 * @param split if true, assume day ID is provided along with week ID, and thus require splitting.
 */
function getDayDisplayName(dayId: string | number, split: boolean = false) {
  return i18n.t("coach.program_management.builder.day_name", {
    day: split ? splitScheduleInfoNames(dayId.toString())[1] : dayId.toString(),
  });
}

/**
 * Define debounce method for each table to store changes.
 *
 * @param key id of the exercise that is being updated.
 * @param changeData actual data value.
 */
function storeChanges(key: string, changeData: any) {
  if (!(key in storeChangesMethods))
    storeChangesMethods[key] = debounce((newValue: any) => {
      changes.value.push({ value: objectDeepCopy(newValue) });
    }, 1000);
  storeChangesMethods[key](changeData);
  exercisesValuesLast.value = objectDeepCopy(changeData);
  savedValue = false;
  emits("update:saved", savedValue);
}

/**
 * Save all changes to program.
 */
function save() {
  // Update program
  const program = props.program.duplicate();
  program.programExercises = [];
  Object.entries(exercisesValues.value).forEach(
    ([scheduleId, exerciseInfo]) => {
      const scheduleInfo = splitScheduleInfoNames(scheduleId);
      program.programExercises!.push(
        new ProgramExercise({
          program: program,
          scheduleWeek: scheduleInfo[0],
          scheduleDay: scheduleInfo[1],
          scheduleOrder: Number(scheduleInfo[2]),
          exercise: selectedExercises.value[scheduleId],
          exerciseVariant: selectedExerciseVariants.value[scheduleId],
          exerciseNote: exerciseInfo.note,
          lines: exerciseInfo.data.map(
            (lineInfo, idx) =>
              new ProgramLine({
                lineOrder: idx,
                setsBaseValue: lineInfo.sets,
                setsReference: undefined, // TODO
                repsBaseValue: lineInfo.reps,
                repsReference: undefined, // TODO
                loadBaseValue: lineInfo.load,
                loadReference: undefined, // TODO
                rpeBaseValue: lineInfo.rpe,
                rpeReference: undefined, // TODO
                note: lineInfo.note,
                requestFeedbackText: lineInfo.requestText,
                requestFeedbackVideo: lineInfo.requestVideo,
              }),
          ),
        }),
      );
    },
  );

  // Save current instance
  program.save({
    onSuccess: () => {
      // Inform parent of update
      savedValue = true;
      emits("update:program", program);
      emits("update:saved", savedValue);
    },
    onError: () => {
      $q.notify({
        type: "negative",
        message: i18n.t("coach.program_management.builder.save_error"),
        position: "bottom",
      });
      savedValue = false;
      emits("update:saved", savedValue);
    },
  });
}
</script>

<style scoped lang="scss">
.os-light-border {
  border: 1px solid $light;
}

.os-exercise-form {
  border-radius: 10px 0 0 10px;
  margin-inline-end: -1px;
}

.os-exercise-delete-btn {
  position: absolute;
  top: 0;
  left: 0;
  transform: translate(-50%, -40%);
}
</style>
