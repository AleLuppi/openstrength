<template>
  <div class="q-pa-md q-ma-md shadow-2" style="border-radius: 24px">
    <!-- Program exercise element -->
    <div
      :ref="(el) => (tableElements[idScheduleInfo] = el)"
      v-for="(tableData, idScheduleInfo) in linesTable"
      :key="idScheduleInfo"
    >
      <!-- Show week and day and allow navigation -->
      <div
        v-if="firstTablesInDay.includes(idScheduleInfo.toString())"
        class="row items-center q-px-md"
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
        <!-- Exercise info -->
        <div class="col-3 q-pa-sm bg-lighter os-exercise-form os-light-border">
          <osSelect
            :modelValue="selectedExercisesName[idScheduleInfo]"
            @update:model-value="
              (val?: string) =>
                updateSelectedExercise(idScheduleInfo.toString(), val)
            "
            :options="exercises.map((exercise) => exercise.name)"
          >
          </osSelect>
          <osSelect
            :modelValue="selectedExerciseVariantsName[idScheduleInfo]"
            @update:model-value="
              (val?: string) =>
                updateSelectedExerciseVariant(idScheduleInfo.toString(), val)
            "
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
          <osInput
            :model-value="selectedExercisesNote[idScheduleInfo]"
            @update:model-value="
              (value: any) =>
                onNoteValueUpdate(idScheduleInfo.toString(), value)
            "
            type="textarea"
          >
          </osInput>
        </div>

        <!-- Data table -->
        <osTableSheet
          :modelValue="tableData"
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
          @update:model-value="
            (value: any) => onTableValueUpdate(idScheduleInfo.toString(), value)
          "
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
const storeChangesMethods: { [key: string]: { [subkey: string]: Function } } =
  {};
const firstTablesInDay: string[] = [];

// Set ref
const tableElements = ref<{
  [key: string]: HTMLElement | any;
}>({});
const linesTable = ref<{
  [key: string]: Object[];
}>({});
const selectedExercisesName = ref<{
  [key: string]: string | undefined;
}>({});
const selectedExerciseVariantsName = ref<{
  [key: string]: string | undefined;
}>({});
const selectedExercisesNote = ref<{
  [key: string]: string | undefined;
}>({});
const selectedExercises = ref<{
  [key: string]: Exercise | undefined;
}>({});
const selectedExerciseVariants = ref<{
  [key: string]: ExerciseVariant | undefined;
}>({});

// Get all program lines for each week and day
const sortedProgramExercises = computed(() =>
  props.program.programExercises
    ? orderProgramExercises(
        props.program.programExercises,
        mergeScheduleInfoNames,
      )
    : {},
);

// Get a reference to all weeks and days available
const allWeeks = computed(() =>
  uniqueValues(
    Object.keys(sortedProgramExercises.value).map(
      (key) => splitScheduleInfoNames(key)[0],
    ),
  ),
);
const allDays = computed(() => {
  const outDays: { [key: string | number]: string[] } = {};
  Object.keys(sortedProgramExercises.value).forEach((key) => {
    const [week, day] = splitScheduleInfoNames(key);
    if (!outDays[week]) outDays[week] = [];
    if (!outDays[week].includes(day)) outDays[week].push(day);
  });
  return outDays;
});

// Update data table on input change
watch(props.program, () => resetTableData(), { immediate: true });

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
 * Initialize selected exercises.
 */
function initSelectedExercises() {
  selectedExercises.value = Object.assign(
    {},
    ...Object.entries(selectedExercisesName.value).map(
      ([key, exerciseName]) => ({
        [key]: props.exercises.find(
          (exercise) => exercise.name == exerciseName,
        ),
      }),
    ),
  );
}

/**
 * Initialize selected variants.
 */
function initSelectedExerciseVariants() {
  selectedExerciseVariants.value = Object.assign(
    {},
    ...Object.entries(selectedExerciseVariantsName.value).map(
      ([key, variantName]) => ({
        [key]: selectedExercises.value[key]?.variants?.find(
          (variant) => variant.name == variantName,
        ),
      }),
    ),
  );
}

/**
 * Update table data according to input data.
 */
function resetTableData() {
  // Epmty changes
  changes.length = 0;

  // Delete previously stored values
  linesTable.value = {};
  selectedExercisesName.value = {};
  selectedExerciseVariantsName.value = {};
  selectedExercisesNote.value = {};

  // Reset list of first tables
  firstTablesInDay.length = 0;

  // Set new table values
  Object.entries(sortedProgramExercises.value).forEach(
    ([idScheduleInfo, programExercise]) => {
      // Prepare exercise-related values
      selectedExercisesName.value[idScheduleInfo] =
        programExercise.exercise?.name;
      selectedExerciseVariantsName.value[idScheduleInfo] =
        programExercise.exerciseVariant?.name;
      selectedExercisesNote.value[idScheduleInfo] =
        programExercise.exerciseNote ?? "";

      // Prepare data-related values
      linesTable.value[idScheduleInfo] =
        programExercise.lines?.map((line) => ({
          load: line.loadBaseValue,
          reps: line.repsBaseValue,
          sets: line.setsBaseValue,
          rpe: line.rpeBaseValue,
          note: line.note,
          requestText: line.requestFeedbackText,
          requestVideo: line.requestFeedbackVideo,
        })) ?? [];

      // Check if table is first in the day
      const idScheduleInfoSplit = splitScheduleInfoNames(idScheduleInfo).slice(
        0,
        2,
      );
      if (
        !firstTablesInDay.some((key) =>
          compareArrays(
            splitScheduleInfoNames(key).slice(0, 2),
            idScheduleInfoSplit,
          ),
        )
      )
        firstTablesInDay.push(idScheduleInfo);
    },
  );

  // Init selected evercises
  initSelectedExercises();
  initSelectedExerciseVariants();
}

/**
 * Update selected exercises.
 *
 * @param idScheduleInfo schedule info id whose exercise shall be updated.
 * @param newName new name of the exercise.
 */
function updateSelectedExercise(idScheduleInfo: string, newName?: string) {
  // Update name
  selectedExercisesName.value[idScheduleInfo] = newName;

  // Update exercise
  if (newName) {
    const selectedExercise = props.exercises.find(
      (exercise) => exercise.name == newName,
    );
    if (selectedExercise != selectedExercises.value[idScheduleInfo])
      storeChanges(idScheduleInfo, "exercise", selectedExercise);
    selectedExercises.value[idScheduleInfo] = selectedExercise;
  } else selectedExercises.value[idScheduleInfo] = undefined;
}

/**
 * Update selected variants.
 *
 * @param idScheduleInfo schedule info id whose variant shall be updated.
 * @param newName new name of the variant.
 */
function updateSelectedExerciseVariant(
  idScheduleInfo: string,
  newName?: string,
) {
  // Update name
  selectedExerciseVariantsName.value[idScheduleInfo] = newName;

  // Update exercise
  if (newName) {
    const selectedVariant = selectedExercises.value[
      idScheduleInfo
    ]?.variants?.find((variant) => variant.name == newName);
    if (selectedVariant != selectedExerciseVariants.value[idScheduleInfo])
      storeChanges(idScheduleInfo, "variant", selectedVariant);

    selectedExerciseVariants.value[idScheduleInfo] = selectedVariant;
  } else selectedExerciseVariants.value[idScheduleInfo] = undefined;
}

/**
 * Things to perform when table gets updated.
 *
 * @param idScheduleInfo schedule info id whose table data shall be updated.
 * @param value current table value.
 */
function onTableValueUpdate(idScheduleInfo: string, value: any) {
  // TODO check why bool data are not saved
  storeChanges(idScheduleInfo, "data", value);
}

/**
 * Things to perform when exercise note gets updated.
 *
 * @param idScheduleInfo schedule info id whose note shall be updated.
 * @param value current note value.
 */
function onNoteValueUpdate(idScheduleInfo: string, value: any) {
  selectedExercisesNote.value[idScheduleInfo] = value;
  storeChanges(idScheduleInfo, "note", value);
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
function storeChanges(
  key: string,
  changeType: "exercise" | "variant" | "note" | "data",
  changeData: any,
) {
  if (!(key in storeChangesMethods)) storeChangesMethods[key] = {};
  if (!(changeType in storeChangesMethods[key]))
    storeChangesMethods[key][changeType] = debounce((changeValue: any) => {
      changes.push([key, changeType, changeValue]);
    }, 1000);
  storeChangesMethods[key][changeType](changeData);
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
</style>
