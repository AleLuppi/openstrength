<template>
  <div>
    <!-- Day element -->
    <div
      :ref="(el) => (dayTableElements[numWeekDay] = el)"
      v-for="(tableData, numWeekDay) in linesTable"
      :key="numWeekDay"
      class="q-pa-md q-my-md shadow-2"
      style="border-radius: 24px"
    >
      <!-- Show week and day and allow navigation -->
      <h6 class="q-mt-none">
        <span class="underlined-dashed cursor-pointer">
          {{ getWeekDisplayName(numWeekDay, true) }}
          <q-menu auto-close>
            <q-list
              v-for="week in allWeeks.filter(
                (oneWeek) =>
                  oneWeek != splitWeekDayNames(numWeekDay.toString())[0],
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
                        splitWeekDayNames(numWeekDay.toString())[1],
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
          {{ getDayDisplayName(numWeekDay, true) }}
          <q-menu auto-close>
            <q-list
              v-for="day in allDays[
                splitWeekDayNames(numWeekDay.toString())[0]
              ].filter(
                (oneDay) =>
                  oneDay != splitWeekDayNames(numWeekDay.toString())[1],
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
                        splitWeekDayNames(numWeekDay.toString())[0],
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

      <div class="row items-start justify-evenly">
        <!-- Exercise info -->
        <div class="col-2 q-pa-sm bg-lighter os-exercise-form os-light-border">
          <osSelect
            v-model="selectedExercisesName[numWeekDay]"
            :options="exercises.map((exercise) => exercise.name)"
            emit-value
            map-options
            dense
          >
          </osSelect>
          <osSelect
            v-model="selectedExerciseVariantsName[numWeekDay]"
            :options="
              selectedExercises[numWeekDay]?.variants?.map(
                (variant) => variant.name,
              )
            "
          >
          </osSelect>
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
          @update:model-value="
            (value: any) => onModelValueUpdate(numWeekDay, value)
          "
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
import { Program, ProgramLine } from "@/helpers/programs/program";
import { orderLines } from "@/helpers/programs/linesManagement";
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

// Set ref
const dayTableElements = ref<{
  [key: string | number]: any;
}>({});
const linesTable = ref<{
  [key: string | number]: ProgramLine[];
}>({});
const selectedExercisesName = ref<{
  [key: string | number]: string | undefined;
}>({});
const selectedExerciseVariantsName = ref<{
  [key: string | number]: string | undefined;
}>({});
const selectedExercises = ref<{
  [key: string | number]: Exercise | undefined;
}>({});
const selectedExerciseVariants = ref<{
  [key: string | number]: ExerciseVariant | undefined;
}>({});

// Update selected exercises and variants
watch(
  selectedExercisesName,
  (exercisesName) => {
    selectedExercises.value = Object.assign(
      {},
      ...Object.entries(exercisesName).map(([key, exerciseName]) => {
        const selectedExercise = props.exercises.find(
          (exercise) => exercise.name == exerciseName,
        );
        if (selectedExercises.value[key] != selectedExercise)
          storeChanges.value[key]?.["exercise"]?.(selectedExercise);
        return {
          [key]: selectedExercise,
        };
      }),
    );
  },
  { deep: true, immediate: true },
);
watch(
  selectedExerciseVariantsName,
  (variantsName) => {
    selectedExerciseVariants.value = Object.assign(
      {},
      ...Object.entries(variantsName).map(([key, variantName]) => {
        const selectedVariant = selectedExercises.value[key]?.variants?.find(
          (variant) => variant.name == variantName,
        );
        if (selectedExerciseVariants.value[key] != selectedVariant)
          storeChanges.value[key]?.["variant"]?.(selectedVariant);
        return { [key]: selectedVariant };
      }),
    );
    console.log(selectedExerciseVariants.value);
  },
  { deep: true, immediate: true },
);

// Get all program lines for each week and day
const allLines = computed(() =>
  props.program.lines ? orderLines(props.program.lines, mergeWeekDayNames) : {},
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

  // Set new table values
  Object.keys(allLines.value).forEach((key) => {
    selectedExerciseVariantsName.value[key] =
      allLines.value[key][0].exerciseVariant?.name;
    selectedExercisesName.value[key] = (
      allLines.value[key][0].exerciseVariant?.exercise ??
      allLines.value[key][0].exercise
    )?.name;
    linesTable.value[key] = allLines.value[key].map((line) => ({
      load: line.loadBaseValue,
      reps: line.repsBaseValue,
      sets: line.setsBaseValue,
      rpe: line.rpeBaseValue,
      note: line.note,
      requestText: line.requestFeedbackText,
      requestVideo: line.requestFeedbackVideo,
    }));
  });
}

/**
 * Merge week and day names to a single string.
 *
 * @param weekId week name.
 * @param dayId day name.
 * @param sep string separator.
 * @returns a string with merged names.
 */
function mergeWeekDayNames(
  weekId: string | number,
  dayId: string | number,
  sep: string = sepWekDay,
) {
  return `${weekId}${sep}${dayId}`;
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
    Object.keys(allLines.value).map((key) => splitWeekDayNames(key)[0]),
  ),
);
const allDays = computed(() => {
  const outDays: { [key: string | number]: string[] } = {};
  Object.keys(allLines.value).forEach((key) => {
    const [week, day] = splitWeekDayNames(key);
    if (!outDays[week]) outDays[week] = [];
    outDays[week].push(day);
  });
  return outDays;
});

// Define debounce method for each table to store changes
const storeChanges = computed(() => {
  const outMethods: {
    [key: string | number]: {
      exercise?: Function;
      variant?: Function;
      data?: Function;
    };
  } = {};
  Object.keys(allLines.value).forEach((key) => {
    outMethods[key] = {};
    for (const changeType of ["exercise", "variant", "data"] as (
      | "exercise"
      | "variant"
      | "data"
    )[]) {
      outMethods[key][changeType] = debounce((changeValue: any) => {
        changes.push([key, changeType, changeValue]);
      }, 1000);
    }
  });
  return outMethods;
});

/**
 * Things to perform when table gets updated.
 *
 * @param key week/day key.
 * @param value current table value.
 */
function onModelValueUpdate(key: string | number, value: any) {
  storeChanges.value[key]?.["data"]?.(value);
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
