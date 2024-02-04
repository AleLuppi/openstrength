<template>
  <div class="bg-white">
    <!-- Show something when program is empty -->
    <div
      v-if="
        !selectedProgram?.programExercises ||
        selectedProgram?.programExercises.length == 0
      "
      class="text-center"
    >
      <slot name="empty-program">
        <h6>
          {{ $t("coach.program_management.builder.empty") }}
        </h6>
      </slot>
      <q-btn
        icon="add"
        :label="$t('coach.program_management.builder.new_day')"
        @click="addWeek(String(defaultWeekName))"
        rounded
        unelevated
      ></q-btn>
    </div>

    <!-- Show something when filters remove any exercise -->
    <div v-else-if="isProgramFilteredOut" class="text-center">
      <slot name="empty-filtered">
        <h6>
          {{ $t("coach.program_management.filter.all_filtered_out") }}
        </h6>
      </slot>
    </div>

    <!-- FIXME Display one day -->
    <q-virtual-scroll
      v-else
      style="height: 100%"
      :items-size="programExercises.length"
      :items-fn="itemFn"
      virtual-scroll-item-size="300"
      separator
      v-slot="{ item, index }"
    >
      <!-- Show week and day and allow navigation -->
      <div
        v-if="!item.programExercise"
        v-show="
          Object.keys(filteredWeekDay).includes(item.week) &&
          filteredWeekDay[item.week].includes(item.day)
        "
        v-intersection="dayTitleInteresctionHandler"
        class="row items-center q-gutter-x-xs bg-white q-px-sm q-mx-none q-mb-xs os-day-title"
      >
        <!-- Week and day names -->
        <h6 class="q-mt-none">
          <span class="underlined-dashed cursor-pointer text-h4 text-margin-xs">
            {{ getWeekDisplayName(item.week) }}
            <q-menu auto-close>
              <q-list
                v-for="otherWeek in Object.keys(filteredWeekDay).filter(
                  (oneWeek) => oneWeek != item.week,
                )"
                :key="`otherweek${otherWeek}`"
                style="min-width: 100px"
              >
                <q-item
                  clickable
                  @click="
                    scrollToElementInParent(
                      dayElements[getName([otherWeek, item.day])] ??
                        dayElements[
                          getName([otherWeek, filteredWeekDay[otherWeek][0]])
                        ],
                    )
                  "
                >
                  <q-item-section>
                    {{ getWeekDisplayName(otherWeek) }}
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </span>
          -
          <span class="underlined-dashed cursor-pointer text-h6 text-margin-xs">
            {{ getDayDisplayName(item.day) }}
            <q-menu auto-close>
              <q-list
                v-for="otherDay in filteredWeekDay[item.week].filter(
                  (oneDay) => oneDay != item.day,
                )"
                :key="`otherweek${otherDay}`"
                style="min-width: 100px"
              >
                <q-item
                  clickable
                  @click="
                    scrollToElementInParent(
                      dayElements[getName([item.week, otherDay])],
                    )
                  "
                >
                  <q-item-section>
                    {{ getDayDisplayName(otherDay) }}
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </span>
        </h6>

        <!-- Management buttons -->
        <div>
          <!-- Rename day -->
          <q-btn
            @click="editWeekDayName = [item.week, item.day]"
            icon="edit"
            size="sm"
            color="dark-light"
            flat
            round
            :ripple="false"
          >
            <q-tooltip anchor="top middle" :offset="[0, 40]">
              {{ $t("coach.program_management.builder.day_rename") }}
            </q-tooltip>

            <FormProgramNewWeekDay
              v-model="editWeekDayName"
              @save="
                (val?: [string, string]) => {
                  if (val) moveDay([item.week, item.day], val);
                }
              "
              :cover="false"
              anchor="center right"
              self="center right"
              :offset="[15, 0]"
            >
            </FormProgramNewWeekDay>
          </q-btn>

          <!-- Duplicate day -->
          <q-btn
            @click="editWeekDayName = ['', '']"
            icon="fa-regular fa-clone"
            size="sm"
            color="dark-light"
            flat
            round
            :ripple="false"
          >
            <q-tooltip anchor="top middle" :offset="[0, 40]">
              {{ $t("coach.program_management.builder.day_duplicate") }}
            </q-tooltip>

            <FormProgramNewWeekDay
              v-model="editWeekDayName"
              @save="
                (val?: [string, string]) => {
                  if (val) duplicateDay([item.week, item.day], val);
                }
              "
              :title="$t('coach.program_management.builder.day_duplicate_form')"
              :cover="false"
              anchor="center right"
              self="center left"
            >
            </FormProgramNewWeekDay>
          </q-btn>

          <!-- Delete day -->
          <q-btn
            @click="deleteDay([item.week, item.day])"
            icon="fa-regular fa-trash-can"
            size="sm"
            color="dark-light"
            flat
            round
            :ripple="false"
          >
            <q-tooltip anchor="top middle" :offset="[0, 40]">
              {{ $t("coach.program_management.builder.day_delete") }}
            </q-tooltip>
          </q-btn>
        </div>

        <q-separator inset size="1px" class="col" />
      </div>

      <!-- FIXME program exercise, move up/down -->
      <TableProgramBuilder
        v-else
        v-show="
          Object.keys(filteredWeekDay).includes(item.week) &&
          filteredWeekDay[item.week].includes(item.day) &&
          (filter.exercise.length == 0 ||
            (item.programExercise.exercise?.name &&
              filter.exercise.includes(item.programExercise.exercise.name)))
        "
        :model-value="item.programExercise"
        @update:model-value="
          (val) =>
            (selectedProgram!.programExercises =
              selectedProgram!.programExercises?.filter(
                (currExercise) => currExercise != val,
              ) ?? []).push(val)
        "
        :exercises="exercises"
        :maxlifts="maxliftsPerExercise"
        :can-move-up="true"
        :can-move-down="true"
        :navigate-weeks="Object.keys(filteredWeekDay)"
        :navigate-days="filteredWeekDay[item.week]"
        v-model:expanded="exercisesInfoExpanded[index]"
        :dense="dense"
        :key="item.programExercise.scheduleOrder"
      ></TableProgramBuilder>
    </q-virtual-scroll>

    <!-- FIXME height -->
    <!-- <q-virtual-scroll
      style="max-height: 500px"
      :items-size="50"
      :items-fn="itemFn"
      virtual-scroll-item-size="1000"
      separator
      v-slot="{ item }"
    >
      <TableProgramBuilder
        :data="item.exercises"
        :exercises="exercises"
        :week="item.week"
        :day="item.day"
        :filter="filter.exercise"
        :navigate-weeks="filteredWeeks"
        :navigate-days="filteredDays[item.week]"
      ></TableProgramBuilder>
    </q-virtual-scroll> -->

    <!-- Show dialog to stop reference line selection -->
    <q-dialog
      :model-value="Boolean(selectingReferenceLine)"
      @update:model-value="selectingReferenceLine = undefined"
      seamless
      position="bottom"
    >
      <q-card class="bg-lighter" style="width: 350px">
        <q-card-section class="row items-center no-wrap">
          <p class="text-bold">
            {{
              $t("coach.program_management.builder.reference_select_line_help")
            }}
          </p>

          <q-space />

          <q-btn icon="close" label="Cancel" color="negative" v-close-popup />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, defineAsyncComponent } from "vue";
import {
  debounce as debounceFunction,
  throttle as throttleFunction,
} from "quasar";
import { scrollToElementInParent } from "@/helpers/scroller";
import {
  arrayFilterUndefined,
  arrayOfPairsToObject,
  arraySortObjectsByField,
} from "@/helpers/array";
import {
  Program,
  ProgramExercise,
  ProgramLine,
} from "@/helpers/programs/program";
import { Exercise } from "@/helpers/exercises/exercise";
import { MaxLift } from "@/helpers/maxlifts/maxlift";
import { separateMaxliftPerExerciseAndType } from "@/helpers/maxlifts/listManagement";
import { stringGetNextFromList } from "@/helpers/scalar";
import mixpanel from "mixpanel-browser";
import {
  duplicateBuilderData,
  updateProgramWithBuilderData,
  type ProgramBuilderData,
  type ProgramBuilderExerciseData,
  ProgramBuilderFilledData,
  moveExercise,
  getLargestOrderInDay,
} from "@/helpers/programs/builder";
import { useI18n } from "vue-i18n";
import {
  getProgramUniqueWeekDayPairs,
  sortProgramExercises,
} from "@/helpers/programs/linesManagement";

// Import components
const TableProgramBuilder = defineAsyncComponent(
  () => import("@/components/tables/TableProgramBuilder.vue"),
);
const FormProgramNewWeekDay = defineAsyncComponent(
  () => import("@/components/forms/FormProgramNewWeekDay.vue"),
);

// Init plugin
const i18n = useI18n();

// Define props
const props = withDefaults(
  defineProps<{
    modelValue: Program;
    exercises?: Exercise[];
    maxlifts?: MaxLift[];
    filter?: {
      week: string[];
      day: string[];
      exercise: string[];
    };
    dense?: boolean;
    historyMaxLength?: number;
    debounce?: number;
    defaultWeekName?: number | string;
    defaultDayName?: number | string;
  }>(),
  {
    exercises: () => [],
    maxlifts: () => [],
    filter: () => ({ week: [], day: [], exercise: [] }),
    dense: false,
    historyMaxLength: 50,
    debounce: 250,
    defaultWeekName: "1",
    defaultDayName: "1",
  },
);

// Define emits
const emit = defineEmits<{
  "update:modelValue": [program: Program | undefined];
  newExercise: [exerciseName: string, programExercise?: ProgramExercise];
  newVariant: [
    exerciseName: string,
    variantName: string,
    programExercise?: ProgramExercise,
  ];
  undo: [canUndo: boolean, canRedo: boolean];
  redo: [canRedo: boolean, canUndo: boolean];
}>();

// Define expose
defineExpose({
  undo: throttleFunction(undo, props.debounce),
  redo: throttleFunction(redo, props.debounce),
  getHistorySteps: () => {
    return [
      programHistoryPointer.value,
      programHistory.value.length - programHistoryPointer.value - 1,
    ];
  },
});

// Set useful values
const sepWekDay = ".";

// Set ref
const dayElements = ref<{
  [key: string]: HTMLElement | any;
}>({}); // FIXME references to days elements
const exercisesValues = ref<ProgramBuilderData>([]); // FIXME data of each program exercise in flat format
const selectedProgram = ref<Program>(); // current program
const editWeekDayName = ref<[string, string]>(); // week and/or day name that is being modified (to clone or move tables)
const selectingReferenceLine = ref<{
  exerciseData: ProgramBuilderExerciseData;
  lineNum: string;
  field: string;
}>(); // FIXME useful info to maintain while selecting a reference line
const exercisesInfoExpanded = ref<boolean[]>([]); // check if an exercise info table should be expanded or collapsed
const programHistory = ref<ProgramBuilderData[]>([]); // FIXMENON-REF store changes to data to allow walking history
const programHistoryPointer = ref<number>(0); // FIXMENON_REF pointer to current data version in history

// Retrieve and supply current program
watch(
  () => props.modelValue,
  () => {
    if (selectedProgram.value != props.modelValue) {
      // Empty changes
      if (
        props.modelValue.uid == undefined ||
        selectedProgram.value?.uid != props.modelValue.uid ||
        programHistory.value.length <= 1
      ) {
        programHistory.value.length = 0;
        storeChanges();
      }

      // Set current program to input one
      selectedProgram.value = props.modelValue;

      // Ensure sorted exercises and lines
      selectedProgram.value.programExercises = selectedProgram.value
        .programExercises
        ? sortProgramExercises(selectedProgram.value.programExercises)
        : undefined;
    }
  },
  { immediate: true },
);
watch(
  //FIXME
  () => selectedProgram.value?.programExercises,
  () => emit("update:modelValue", selectedProgram.value),
);

// FIXME
function itemFn(from: number, size: number) {
  return programExercises.value.slice(from, from + size);
}

// Get all program exercises sorted and separated by week/day
const programExercises = computed<
  { week: string; day: string; programExercise: ProgramExercise | undefined }[]
>(() => {
  if (!selectedProgram.value?.programExercises) return [];
  console.log("updating");

  return selectedProgram.value.programExercises.reduce(
    (
      out: {
        week: string;
        day: string;
        programExercise: ProgramExercise | undefined;
      }[],
      programExercise,
    ) => {
      if (
        !out.at(-1) ||
        programExercise.scheduleWeek !=
          out.at(-1)!.programExercise?.scheduleWeek ||
        programExercise.scheduleDay != out.at(-1)!.programExercise?.scheduleDay
      )
        out.push({
          week: programExercise.scheduleWeek!.toString(),
          day: programExercise.scheduleDay!.toString(),
          programExercise: undefined,
        });
      return out.concat([
        {
          week: programExercise.scheduleWeek!.toString(),
          day: programExercise.scheduleDay!.toString(),
          programExercise: programExercise,
        },
      ]);
    },
    [],
  );
});

// Get maxlifts separated per exercise name and type
const maxliftsPerExercise = computed(() =>
  separateMaxliftPerExerciseAndType(props.maxlifts),
);

// Get a reference to all weeks and days available
const allWeekDayPairs = computed(() =>
  getProgramUniqueWeekDayPairs(selectedProgram.value),
);
const allWeekDay = computed(() =>
  arrayOfPairsToObject(allWeekDayPairs.value, true),
);

// Get a reference to weeks and days that can be displayed
const filteredWeekDay = computed(() =>
  arrayOfPairsToObject(
    allWeekDayPairs.value.filter(
      ([week, day]) =>
        (props.filter.week.length == 0 || props.filter.week.includes(week)) &&
        (props.filter.day.length == 0 || props.filter.day.includes(day)),
    ),
    true,
  ),
);

// Check if program has been completely filtered out by filters
const isProgramFilteredOut = computed(
  () =>
    !selectedProgram.value?.programExercises?.some(
      (programExercise) =>
        programExercise.scheduleWeek &&
        programExercise.scheduleDay &&
        Object.keys(filteredWeekDay.value).includes(
          programExercise.scheduleWeek.toString(),
        ) &&
        filteredWeekDay.value[programExercise.scheduleWeek].includes(
          programExercise.scheduleDay.toString(),
        ) &&
        (props.filter.exercise.length == 0 ||
          (programExercise.exercise?.name &&
            props.filter.exercise.includes(programExercise.exercise.name))),
    ),
);

/**
 * Perform operations on reference selection.
 *
 * @param reference line or maxlift identifier or instance.
 * @param type specify whether reference is line or maxlift.
 */
// FIXME
// eslint-disable-next-line
function onReferenceClick(
  reference: string | ProgramLine | MaxLift,
  type: "line" | "maxlift" = "line",
  referenceLine?: typeof selectingReferenceLine.value,
) {
  // Clear selection info
  const lineInfo = referenceLine ?? selectingReferenceLine.value;
  selectingReferenceLine.value = undefined;

  // Ignore update if line selection is not enabled
  if (!lineInfo) return;

  // TODO do not allow selection of some lines

  // Update line reference
  const refField = lineInfo.field + "Ref";
  const tableRef = lineInfo.exerciseData.data[Number(lineInfo.lineNum)];
  const parsedReference =
    reference instanceof ProgramLine || reference instanceof MaxLift
      ? reference
      : type == "line"
      ? props.modelValue.getLines()?.find((line) => line.uid == reference)
      : type == "maxlift"
      ? props.maxlifts.find((maxlift) => (maxlift.uid = reference))
      : undefined;
  if (refField === "loadRef" || refField === "repsRef")
    tableRef[refField] = parsedReference;
  if (
    (refField === "setsRef" || refField === "rpeRef") &&
    (!parsedReference || parsedReference instanceof ProgramLine)
  )
    tableRef[refField] = parsedReference;

  // Mixpanel tracking
  mixpanel.track("Reference Added in Program", {
    Page: "ProgramView",
    Type: type,
    Variable: refField,
  });

  // Update program
  updateProgram();
}

/**
 * Move one exercise across builder and update program accordingly.
 *
 * @param exerciseData data of exercise that is being affected.
 * @param destination destination week, day, and exercise order.
 * @param [duplicate=false] if true, duplicate exercise instead of moving it (ignored if any input is undefined).
 */
function moveExerciseAndUpdate(
  exerciseData?: ProgramBuilderExerciseData,
  destination?: [string, string, string],
  duplicate: boolean = false,
) {
  // Move exercise as required
  exercisesValues.value = moveExercise(
    exercisesValues.value,
    exerciseData,
    destination,
    duplicate,
  );

  // Update program with new structure
  updateProgram();
}

/**
 * Move one table from one scheduling order to another, while keeping week and day schedule.
 *
 * @param exerciseData exercise data that shall be deleted.
 * @param moveBy how many positions to move the table up or down (positive to increase order, negative to decrease it).
 */
// FIXME
// eslint-disable-next-line
function moveTable(exerciseData: ProgramBuilderExerciseData, moveBy: number) {
  moveExerciseAndUpdate(exerciseData, [
    exerciseData.week,
    exerciseData.day,
    String(Number(exerciseData.order) + moveBy),
  ]);
}

/**
 * Delete one exercise from the list.
 *
 * @param exerciseData exercise data that shall be deleted.
 */
function deleteTable(exerciseData: ProgramBuilderExerciseData) {
  // Delete table by moving to unknown destination
  moveExerciseAndUpdate(exerciseData, undefined);

  // Mixpanel tracking
  mixpanel.track("Delete Exercise from Program");

  // Update program with new structure
  updateProgram();
}

/**
 * Add one exercise to the list.
 *
 * @param destination position where exercise shall be placed, ignoring order if already occupied.
 * @param exerciseData if provided, initialize a non-empty table with supplied values.
 */
function addTable(
  destination: [string, string, string?],
  exerciseData?: ProgramBuilderExerciseData,
) {
  // Place exercise at the end of the day if position is already occupied or order is not specified
  if (
    destination[2] == undefined ||
    exercisesValues.value.some(
      (exerciseData) =>
        exerciseData.week == destination[0] &&
        exerciseData.day == destination[1] &&
        exerciseData.order == destination[2],
    )
  ) {
    const largestOrder = getLargestOrderInDay(
      exercisesValues.value,
      destination,
    );
    destination[2] = String((largestOrder ?? 0) + 1);
  }

  // Add table in selected position
  moveExerciseAndUpdate(
    exerciseData,
    destination as [string, string, string],
    true,
  );
}

/**
 * Duplicate a table in a specific week and day.
 *
 * @param exerciseData table that shall be duplicated.
 * @param destination optional destination week and day, otherwise duplicate in original week and day.
 */
function duplicateTable(
  exerciseData: ProgramBuilderExerciseData,
  destination?: [string, string, string],
) {
  addTable(
    destination ?? [exerciseData.week, exerciseData.day, exerciseData.order],
    exerciseData,
  );

  // Mixpanel tracking
  mixpanel.track("Duplicate Exercise in Program");
}

/**
 * Delete all tables in a day.
 *
 * @param scheduleInfo schedule info of day to delete.
 */
function deleteDay(scheduleInfo: [string, string, string?]) {
  // Delete all data tables
  const [week, day] = scheduleInfo;
  exercisesValues.value.forEach((exerciseData) => {
    if (exerciseData.week == week && exerciseData.day == day)
      deleteTable(exerciseData);
  });

  // Mixpanel tracking
  mixpanel.track("Delete Whole Day in Program");
}

/**
 * Move one day to a new day name.
 *
 * @param scheduleInfo schedule info of day to move.
 * @param destination destination week and day.
 * @param [nextFreeDestination=true] if true, update destination to ensure it is a free day.
 * @param [createIfEmpty=true] if true, create a new table at destination week and day if source is empty.
 * @param [doScroll=true] if true, scroll to the newly created element.
 * @param [duplicate=false] if true, duplicate day instead of moving it.
 */
function moveDay(
  scheduleInfo: [string, string, string?],
  destination: [string, string, string?],
  nextFreeDestination: boolean = false,
  createIfEmpty: boolean = true,
  duplicate: boolean = false,
  doScroll: boolean = true,
) {
  // Get source and destination day
  const [fromWeek, fromDay] = scheduleInfo;
  let [toWeek, toDay] = destination;
  if (nextFreeDestination)
    toDay = stringGetNextFromList(allWeekDay.value[toWeek] ?? [], toDay);

  // Check if source is empty while renaming
  let isSourceEmpty = true;

  // Perform move (ordered)
  arraySortObjectsByField(
    exercisesValues.value,
    "order",
    false,
    Number,
  ).forEach((exerciseData) => {
    if (exerciseData.week == fromWeek && exerciseData.day == fromDay) {
      if (duplicate)
        duplicateTable(exerciseData, [toWeek, toDay, exerciseData.order]);
      else
        moveExerciseAndUpdate(exerciseData, [
          toWeek,
          toDay,
          exerciseData.order,
        ]);
      isSourceEmpty = false;
    }
  });

  // Optionally add a table is source is empty
  if (createIfEmpty && isSourceEmpty) {
    addTable([toWeek, toDay]);

    // Mixpanel tracking
    mixpanel.track("New Day Created in Program");
  } else {
    // Mixpanel tracking
    mixpanel.track("Day Week Renamed", { Page: "ProgramView" });
  }

  // Scroll to destination day
  if (doScroll && destination)
    nextTick(() =>
      scrollToElementInParent(dayElements.value[getName([toWeek, toDay])]),
    );

  // Update program with new naming
  updateProgram();
}

/**
 * Add a new day in selected destination week and day.
 *
 * @param destination destination week and day.
 * @param [doScroll=true] if true, scroll to the newly created element.
 */
function addDay(
  destination: [string, string, string?],
  doScroll: boolean = true,
) {
  moveDay(["", ""], destination, true, true, doScroll);
}

/**
 * Duplicate all tables in a selected day.
 *
 * @param scheduleInfo schedule info of day to duplicate.
 * @param destination destination week and day.
 * @param doScroll if true, scroll to the newly created element.
 */
function duplicateDay(
  scheduleInfo: [string, string, string?],
  destination: [string, string, string?],
  doScroll: boolean = true,
) {
  // Duplicate all data tables
  moveDay(scheduleInfo, destination, false, undefined, true, doScroll);

  // Mixpanel tracking
  mixpanel.track("Duplicate Program Day");
}

/**
 * Delete all tables in a week.
 *
 * @param scheduleInfo schedule info of week to delete.
 */
// TODO
// eslint-disable-next-line
function deleteWeek(scheduleInfo: string | [string, string?, string?]) {
  // Delete all days in week
  const week = scheduleInfo instanceof Array ? scheduleInfo[0] : scheduleInfo;
  allWeekDay.value[week].forEach((day) => deleteDay([week, day]));

  // Mixpanel tracking
  mixpanel.track("Delete Whole Week in Program");
}

/**
 * Add a new week in selected destination week.
 *
 * @param destination destination week and optional start day.
 * @param [doScroll=true] if true, scroll to the newly created element.
 */
function addWeek(
  destination: string | [string, string?, string?],
  doScroll: boolean = true,
) {
  // Get destination week and day
  let [week, day] = destination instanceof Array ? destination : [destination];
  if (day == undefined)
    day = allWeekDay.value[week]?.[0] ?? String(props.defaultDayName);
  week = stringGetNextFromList(Object.keys(allWeekDay.value), week);

  // Add week in selected destination
  addDay([week, day], doScroll);
}

/**
 * Duplicate all tables in a selected week.
 *
 * @param scheduleInfo schedule info of week to duplicate.
 * @param destination destination week.
 * @param doScroll if true, scroll to the newly created element.
 */
// TODO
// eslint-disable-next-line
function duplicateWeek(
  scheduleInfo: string | [string, string, string?],
  destination: string | [string, string, string?],
  doScroll: boolean = true,
) {
  // Get destination week
  let dstWeek = destination instanceof Array ? destination[0] : destination;
  dstWeek = stringGetNextFromList(Object.keys(allWeekDay.value), dstWeek);

  // Duplicate all days in week
  const srcWeek =
    scheduleInfo instanceof Array ? scheduleInfo[0] : scheduleInfo;
  allWeekDay.value[srcWeek].forEach((day, idx) => {
    duplicateDay([srcWeek, day], [dstWeek, day], doScroll && idx == 0);
  });

  // Mixpanel tracking
  mixpanel.track("Duplicate Program Week");
}

/**
 * Get a single week display name given week ID.
 *
 * @param weekId base week name.
 */
function getWeekDisplayName(weekId: ProgramBuilderExerciseData["week"]) {
  return i18n.t("coach.program_management.builder.week_name", {
    week: weekId,
  });
}

/**
 * Get a single day display name given day ID.
 *
 * @param dayId base day name.
 */
function getDayDisplayName(dayId: ProgramBuilderExerciseData["day"]) {
  return i18n.t("coach.program_management.builder.day_name", {
    day: dayId,
  });
}

/**
 * Store changes in data for successive undo/redo.
 *
 * @param data changed data value to store.
 */
function storeChanges(builderData?: ProgramBuilderData) {
  // Store data from current pointer position
  if (programHistoryPointer.value + 1 < programHistory.value.length)
    programHistory.value.length = programHistoryPointer.value + 1;

  // Add new element up to max length
  programHistory.value.push(
    builderData ?? duplicateBuilderData(exercisesValues.value),
  );
  if (programHistory.value.length > props.historyMaxLength)
    programHistory.value = programHistory.value.slice(
      programHistory.value.length - props.historyMaxLength,
    );

  // Update pointer position
  programHistoryPointer.value = programHistory.value.length - 1;
}

/**
 * Undo latest modification.
 *
 * @returns true if more undos are possible, false otherwise.
 */
function undo(): boolean {
  // Restore program from last pointer position
  if (programHistoryPointer.value > 0) {
    programHistoryPointer.value -= 1;
    exercisesValues.value = duplicateBuilderData(
      programHistory.value.at(programHistoryPointer.value) ??
        exercisesValues.value,
    );
  }

  // Inform about undo operation
  emit(
    "undo",
    programHistoryPointer.value > 0,
    programHistoryPointer.value + 1 < programHistory.value.length,
  );

  // Inform parent of update
  updateProgram(false);

  return programHistoryPointer.value > 0;
}

/**
 * Redo next modification.
 *
 * @returns true if more redos are possible, false otherwise.
 */
function redo(): boolean {
  // Try to force next program modification
  if (programHistoryPointer.value + 1 < programHistory.value.length) {
    programHistoryPointer.value += 1;
    exercisesValues.value = duplicateBuilderData(
      programHistory.value.at(programHistoryPointer.value) ??
        exercisesValues.value,
    );
  }

  // Inform about redo operation
  emit(
    "redo",
    programHistoryPointer.value + 1 < programHistory.value.length,
    programHistoryPointer.value > 0,
  );

  // Inform parent of update
  updateProgram(false);

  return programHistoryPointer.value + 1 < programHistory.value.length;
}

/**
 * Update program based on the current program builder values.
 *
 * Note: function call is debounced to prevent high loads due to frequent updates.
 *
 * @param [saveChange=true] if true, save changes in history, otherwise ignore it.
 */
const updateProgram = debounceFunction(doUpdateProgram, props.debounce);

/**
 * FIXME Update program based on the current program builder values.
 *
 * Note: this should not be used unless immediate update is required.
 * Use debounced version instead.
 *
 * @param [saveChange=true] if true, save changes in history, otherwise ignore it.
 * @param callback optional callback function to call when program has been saved.
 */
function doUpdateProgram(
  saveChange: boolean = true,
  callback?: (program: Program, builderData: ProgramBuilderData) => void,
) {
  // Resolve builder data with exercise and variant
  const resolvedData: ProgramBuilderFilledData[] = exercisesValues.value.map(
    (exerciseData) => {
      // Resolve exercise and variant
      return {
        ...exerciseData,
      };
    },
  );

  // Update program
  updateProgramWithBuilderData(props.modelValue, resolvedData).then(
    (builderData) => {
      // Store changes and inform parent of update
      if (saveChange) storeChanges(builderData);
      selectedProgram.value = props.modelValue;
      emit("update:modelValue", selectedProgram.value);

      // Optionally call a callback function
      callback?.(selectedProgram.value, builderData);
    },
  );
}

/**
 * Get the name from a list of IDs by merging them with a separator.
 *
 * @param arr list of ids.
 * @param sep separator to use to build the name.
 */
function getName(arr: (string | number)[], sep: string = sepWekDay) {
  return arrayFilterUndefined(arr).join(sep);
}

// Set method to handle sticky day title
const dayTitleInteresctionHandler = {
  handler: (entry?: {
    [key: string]: any;
    isIntersecting?: boolean | undefined;
    boundingClientRect?: { [key: string]: number | undefined };
    intersectionRect?: { [key: string]: number | undefined };
    target?: Element;
  }) => {
    // Add classes when element becomes sticky, delete them otherwise
    if (
      !entry?.isIntersecting &&
      (entry?.boundingClientRect?.top ?? 0) <
        (entry?.intersectionRect?.top ?? 0)
    ) {
      entry?.target?.classList.add("shadow-1");
      entry?.target?.classList.add("bg-orange-1");
    } else {
      entry?.target?.classList.remove("shadow-1");
      entry?.target?.classList.remove("bg-orange-1");
    }
    return true;
  },
  cfg: {
    rootMargin: `-10px -10px -10px -10px`,
    threshold: [1],
  },
};
</script>

<style scoped lang="scss">
.os-day-title {
  position: sticky;
  top: -1px;
  padding-top: 1px;
  z-index: 1;
  border-radius: 12px;
  transition:
    box-shadow 300ms,
    background-color 300ms;
}
</style>
