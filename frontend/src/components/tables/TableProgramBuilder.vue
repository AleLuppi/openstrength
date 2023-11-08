<template>
  <div>
    <!-- Day element -->
    <div
      :ref="(el) => (dayTableElements[idWeekDay] = el)"
      v-for="(tableData, idWeekDay) in linesTable"
      :key="idWeekDay"
      class="q-pa-md q-my-md shadow-2"
      style="border-radius: 24px"
    >
      <!-- Show week and day and allow navigation -->
      <h6 class="q-mt-none">
        <span class="underlined-dashed cursor-pointer">
          {{ getWeekDisplayName(idWeekDay, true) }}
          <q-menu auto-close>
            <q-list
              v-for="week in allWeeks.filter(
                (oneWeek) =>
                  oneWeek != splitWeekDayNames(idWeekDay.toString())[0],
              )"
              :key="week"
              style="min-width: 100px"
            >
              <q-item
                clickable
                @click="
                  scrollToElement(
                    dayTableElements[
                      mergeWeekDayNames(
                        week,
                        splitWeekDayNames(idWeekDay.toString())[1],
                      )
                    ] ??
                      dayTableElements[
                        Object.keys(dayTableElements).find(
                          (key) => splitWeekDayNames(key)[0] == week,
                        ) ?? 'undefined'
                      ],
                  )
                "
              >
                <q-item-section>{{ getWeekDisplayName(week) }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </span>
        -
        <span class="underlined-dashed cursor-pointer">
          {{ getDayDisplayName(idWeekDay, true) }}
          <q-menu auto-close>
            <q-list
              v-for="day in allDays[
                splitWeekDayNames(idWeekDay.toString())[0]
              ].filter(
                (oneDay) =>
                  oneDay != splitWeekDayNames(idWeekDay.toString())[1],
              )"
              :key="day"
              style="min-width: 100px"
            >
              <q-item
                clickable
                @click="
                  scrollToElement(
                    dayTableElements[
                      mergeWeekDayNames(
                        splitWeekDayNames(idWeekDay.toString())[0],
                        day,
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

      <!-- Exercise element -->
      <div
        v-for="exerciseName in Object.keys(selectedExercises[idWeekDay] ?? {})"
        :key="exerciseName"
        class="row items-start justify-evenly q-mb-md"
      >
        <!-- Exercise info -->
        <div class="col-2 q-pa-sm bg-lighter os-exercise-form os-light-border">
          <osSelect
            v-model="selectedExercisesName[idWeekDay][exerciseName]"
            :options="exercises.map((exercise) => exercise.name)"
          >
          </osSelect>
          <osSelect
            v-model="selectedExerciseVariantsName[idWeekDay][exerciseName]"
            :options="
              selectedExercises[idWeekDay][exerciseName]?.variants?.map(
                (variant) => ({
                  label: variant.isDefault
                    ? $t('coach.exercise_management.default_variant')
                    : variant.name,
                  value: variant.isDefault ? '' : variant.name,
                }),
              )
            "
            map-options
            emit-value
          >
          </osSelect>
          <osInput
            :model-value="selectedExercisesNote[idWeekDay][exerciseName]"
            @update:model-value="
              (value: any) =>
                onNoteValueUpdate(idWeekDay.toString(), exerciseName, value)
            "
            type="textarea"
          >
          </osInput>
        </div>

        <!-- Data table -->
        <osTableSheet
          :modelValue="tableData[exerciseName]"
          :headers="[
            'load',
            'reps',
            'sets',
            'rpe',
            'note',
            'requestText',
            'requestVideo',
          ]"
          @update:model-value="
            (value: any) =>
              onTableValueUpdate(idWeekDay.toString(), exerciseName, value)
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
import { Program } from "@/helpers/programs/program";
import { orderProgramExercises } from "@/helpers/programs/linesManagement";
import { scrollToElement } from "@/helpers/scroller";
import { Exercise, ExerciseVariant } from "@/helpers/exercises/exercise";
import { uniqueValues } from "@/helpers/array";

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
});

// Set useful values
const sepWekDay = ".";
const changes: any[] = [];
const storeChangesMethods: { [key: string]: { [subkey: string]: Function } } =
  {};

// Set ref
const dayTableElements = ref<{
  [key: string]: any; // TODO Element type
}>({});
const linesTable = ref<{
  [key: string]: { [subkey: string]: Object[] };
}>({});
const selectedExercisesName = ref<{
  [key: string]: { [subkey: string]: string | undefined };
}>({});
const selectedExerciseVariantsName = ref<{
  [key: string]: { [subkey: string]: string | undefined };
}>({});
const selectedExercisesNote = ref<{
  [key: string]: { [subkey: string]: string | undefined };
}>({});
const selectedExercises = ref<{
  [key: string]: { [subkey: string]: Exercise | undefined };
}>({});
const selectedExerciseVariants = ref<{
  [key: string]: { [subkey: string]: ExerciseVariant | undefined };
}>({});

// Update selected exercises and variants
watch(
  selectedExercisesName,
  (dailyExercisesName) => {
    selectedExercises.value = Object.assign(
      {},
      ...Object.entries(dailyExercisesName).map(([key, exercisesName]) => {
        const keySelectedExercises: {
          [key: string]: Exercise | undefined;
        } = {};
        Object.entries(exercisesName).forEach(
          ([originalExerciseName, exerciseName]) => {
            if (exerciseName) {
              keySelectedExercises[originalExerciseName] = props.exercises.find(
                (exercise) => exercise.name == exerciseName,
              );
              if (
                selectedExercises.value[key]?.[originalExerciseName] !=
                keySelectedExercises[originalExerciseName]
              )
                storeChanges(
                  mergeWeekDayNamesWithExercise(key, originalExerciseName),
                  "exercise",
                  keySelectedExercises,
                );
            }
          },
        );
        return {
          [key]: keySelectedExercises,
        };
      }),
    );
    console.log(dailyExercisesName, selectedExercises.value);
  },
  { deep: true, immediate: true },
);
watch(
  selectedExerciseVariantsName,
  (dailyVariantsName) => {
    selectedExerciseVariants.value = Object.assign(
      {},
      ...Object.entries(dailyVariantsName).map(([key, variantsName]) => {
        const keySelectedVariants: {
          [key: string]: ExerciseVariant | undefined;
        } = {};
        Object.entries(variantsName).forEach(([exerciseName, variantName]) => {
          if (variantName) {
            keySelectedVariants[exerciseName] = selectedExercises.value[key][
              exerciseName
            ]?.variants?.find((variant) => variant.name == variantName);
            if (
              selectedExerciseVariants.value[key]?.[exerciseName] !=
              keySelectedVariants[exerciseName]
            )
              storeChanges(
                mergeWeekDayNamesWithExercise(key, exerciseName),
                "variant",
                keySelectedVariants,
              );
          }
        });
        return { [key]: keySelectedVariants };
      }),
    );
  },
  { deep: true, immediate: true },
);

// Get all program lines for each week and day
const exercisesPerWeekDay = computed(() =>
  props.program.programExercises
    ? orderProgramExercises(props.program.programExercises, mergeWeekDayNames)
    : {},
);

// Update data table on input change
watch(props.program, () => updateTableData(), { immediate: true });

/**
 * Update table data according to input data.
 */
function updateTableData() {
  // Epmty changes
  changes.length = 0;

  // Delete previously stored values
  linesTable.value = {};
  selectedExercisesName.value = {};
  selectedExerciseVariantsName.value = {};
  selectedExercisesNote.value = {};

  // Set new table values
  Object.entries(exercisesPerWeekDay.value).forEach(
    ([idWeekDay, exercises]) => {
      selectedExercisesName.value[idWeekDay] = exercises.reduce(
        (out: { [key: string]: string | undefined }, exercise) => ({
          ...out,
          [exercise.exercise?.name ?? ""]: exercise.exercise?.name,
        }),
        {},
      );
      selectedExerciseVariantsName.value[idWeekDay] = exercises.reduce(
        (out: { [key: string]: string | undefined }, exercise) => ({
          ...out,
          [exercise.exercise?.name ?? ""]: exercise.exerciseVariant?.name,
        }),
        {},
      );
      selectedExercisesNote.value[idWeekDay] = exercises.reduce(
        (out: { [key: string]: string | undefined }, exercise) => ({
          ...out,
          [exercise.exercise?.name ?? ""]: exercise.exerciseNote ?? "",
        }),
        {},
      );
      linesTable.value[idWeekDay] = {};
      exercises.forEach((exercise) => {
        if (exercise.lines)
          linesTable.value[idWeekDay][exercise.exercise?.name ?? ""] =
            exercise.lines?.map((line) => ({
              load: line.loadBaseValue,
              reps: line.repsBaseValue,
              sets: line.setsBaseValue,
              rpe: line.rpeBaseValue,
              note: line.note,
              requestText: line.requestFeedbackText,
              requestVideo: line.requestFeedbackVideo,
            }));
      });
    },
  );
}

/**
 * Merge week and day names to a single string.
 *
 * @param weekId week name.
 * @param dayId day name.
 * @param optId optional additional id to consider.
 * @param sep string separator.
 * @returns a string with merged names.
 */
function mergeWeekDayNames(
  weekId: string | number,
  dayId: string | number,
  optId?: string,
  sep: string = sepWekDay,
) {
  return [weekId, dayId, optId].filter(Boolean).join(sep);
}

/**
 * Separate week and day names from a single name string.
 *
 * @param weekId week name.
 * @param dayId day name.
 * @param sep string separator.
 * @returns a couple of names for week and day.
 */
function splitWeekDayNames(nameWeekDay: string, sep: string = sepWekDay) {
  return nameWeekDay.split(sep);
}

/**
 * Merge week and day names to a single string.
 *
 * @param weekId week name.
 * @param dayId day name.
 * @param optId optional additional id to consider.
 * @param sep string separator.
 * @returns a string with merged names.
 */
function mergeWeekDayNamesWithExercise(
  idWeekDay: string,
  exerciseName: string,
  sep: string = sepWekDay,
) {
  return mergeWeekDayNames(
    ...(splitWeekDayNames(idWeekDay, sep) as []),
    exerciseName,
    sep,
  );
}

/**
 * Get a single week display name given week ID.
 *
 * @param weekId base week name.
 * @param split if true, assume week ID is provided along with day ID, and thus require splitting.
 */
function getWeekDisplayName(weekId: string | number, split: boolean = false) {
  return i18n.t("coach.program_management.builder.week_name", {
    week: split ? splitWeekDayNames(weekId.toString())[0] : weekId.toString(),
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
    day: split ? splitWeekDayNames(dayId.toString())[1] : dayId.toString(),
  });
}

// Get a reference to all weeks and days available
const allWeeks = computed(() =>
  uniqueValues(
    Object.keys(exercisesPerWeekDay.value).map(
      (key) => splitWeekDayNames(key)[0],
    ),
  ),
);
const allDays = computed(() => {
  const outDays: { [key: string | number]: string[] } = {};
  Object.keys(exercisesPerWeekDay.value).forEach((key) => {
    const [week, day] = splitWeekDayNames(key);
    if (!outDays[week]) outDays[week] = [];
    outDays[week].push(day);
  });
  return outDays;
});

// Define debounce method for each table to store changes
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
}

/**
 * Things to perform when table gets updated.
 *
 * @param idWeekDay week and day id.
 * @param exerciseName exercise related to table.
 * @param value current table value.
 */
function onTableValueUpdate(
  idWeekDay: string,
  exerciseName: string,
  value: any,
) {
  storeChanges(
    mergeWeekDayNamesWithExercise(idWeekDay, exerciseName),
    "data",
    value,
  );
}

/**
 * Things to perform when exercise note gets updated.
 *
 * @param idWeekDay week and day id.
 * @param exerciseName exercise related to table.
 * @param value current note value.
 */
function onNoteValueUpdate(
  idWeekDay: string,
  exerciseName: string,
  value: any,
) {
  selectedExercisesNote.value[idWeekDay][exerciseName] = value;
  storeChanges(
    mergeWeekDayNamesWithExercise(idWeekDay, exerciseName),
    "note",
    value,
  );
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
