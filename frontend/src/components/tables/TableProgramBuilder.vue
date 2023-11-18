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
            @click="deleteTable(idScheduleInfo)"
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, PropType, watch } from "vue";
import { debounce } from "quasar";
import { useI18n } from "vue-i18n";
import { scrollToElement } from "@/helpers/scroller";
import { compareArrays, uniqueValues } from "@/helpers/array";
import { Program } from "@/helpers/programs/program";
import { orderProgramExercises } from "@/helpers/programs/linesManagement";
import { Exercise, ExerciseVariant } from "@/helpers/exercises/exercise";
import { objectMapKeys, objectMapValues } from "@/helpers/object";

// Init plugin
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
const emits = defineEmits(["update:saved"]);

// Set useful values
const sepWekDay = ".";
const changes: any[] = [];
const storeChangesMethods: {
  [key: string]: Function;
} = {};

// Set ref
const tableElements = ref<{
  [key: string]: HTMLElement | any;
}>({});
const exercisesValues = ref<{
  [key: string]: {
    data: Object[];
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

// TODO delete
watch(selectedExerciseVariants, (val) => console.log(val));

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
  (newValue, oldValue) => storeChanges("", newValue, oldValue),
  { deep: true },
);

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
  changes.length = 0;

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

    if (infoA[0] < infoB[0]) return -1;
    else if (infoA[0] > infoB[0]) return 1;
    else if (infoA[1] < infoB[1]) return -1;
    else if (infoA[1] > infoB[1]) return 1;
    else if (infoA[2] < infoB[2]) return -1;
    else if (infoA[2] > infoB[2]) return 1;
    return 0;
  });
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
  const unorderedExercisesValues = objectMapKeys(
    exercisesValues.value,
    (key) => renameMap[key] ?? key,
  );

  // Sort new object of exercises by order
  const sortedKeys = sortScheduleId(Object.keys(unorderedExercisesValues));
  exercisesValues.value = sortedKeys.reduce(
    (out, key) => ({ ...out, [key]: unorderedExercisesValues[key] }),
    {},
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
 * @param changeType type of data being updated.
 * @param changeData actual data value.
 */
function storeChanges(key: string, changeDataTo: any, changeDataFrom: any) {
  if (!(key in storeChangesMethods))
    storeChangesMethods[key] = debounce((newValue: any, oldValue: any) => {
      changes.push([newValue, oldValue]);
    }, 1000);
  storeChangesMethods[key](changeDataTo, changeDataFrom);
  savedValue = false;
  emits("update:saved", savedValue);
}

/**
 * TODO Save all changes to program.
 */
function save() {
  // Update program
  changes.forEach((change) => {
    // TODO
    console.log(change);
  });

  // Inform parent of update
  savedValue = true;
  emits("update:saved", savedValue);
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
