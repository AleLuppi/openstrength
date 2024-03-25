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
        :label="$t('coach.program_management.builder.begin')"
        rounded
        unelevated
        @click="addWeek(String(defaultWeekName))"
      ></q-btn>
    </div>

    <!-- Display all days -->
    <q-virtual-scroll
      v-else
      ref="exerciseListElement"
      v-slot="{ item: [week, day], index }"
      style="height: 100%"
      :items="allWeekDayPairs"
      virtual-scroll-slice-size="2"
      virtual-scroll-item-size="50"
      separator
    >
      <div :key="`${week}.${day}`">
        <!-- Week wrapper -->
        <div
          v-if="index == 0 || week != allWeekDayPairs[index - 1][0]"
          class="row items-center q-gutter-x-xs bg-white q-px-sm q-mx-none q-mb-sm"
          @click="
            () =>
              allWeekDayPairs.forEach(([weekVal], idx) => {
                if (weekVal == week) dayInfoCollapsed[idx] = true;
              })
          "
        >
          <!-- Week name -->
          <h4
            class="q-mt-none cursor-pointer text-bold text-margin-xs underlined-dashed"
          >
            {{ getWeekDisplayName(week) }}
          </h4>

          <!-- Week management buttons -->
          <div class="q-pl-sm">
            <!-- Duplicate week -->
            <q-btn
              icon="fa-regular fa-clone"
              size="sm"
              color="dark-light"
              flat
              round
              :ripple="false"
              @click.stop="editWeekDayName = ['', '']"
            >
              <q-tooltip anchor="top middle" :offset="[0, 40]">
                {{ $t("coach.program_management.builder.week_duplicate") }}
              </q-tooltip>

              <FormProgramNewWeekDay
                v-model="editWeekDayName"
                :title="
                  $t('coach.program_management.builder.week_duplicate_form')
                "
                :cover="false"
                single="week"
                anchor="center right"
                self="center left"
                @save="
                  (val?: [string, string]) => {
                    if (val) duplicateWeek([week, day], val);
                  }
                "
              >
              </FormProgramNewWeekDay>
            </q-btn>

            <!-- Delete week -->
            <q-btn
              icon="fa-regular fa-trash-can"
              size="sm"
              color="dark-light"
              flat
              round
              :ripple="false"
              @click.stop="deleteWeek(week)"
            >
              <q-tooltip anchor="top middle" :offset="[0, 40]">
                {{ $t("coach.program_management.builder.week_delete") }}
              </q-tooltip>
            </q-btn>
          </div>

          <q-separator size="1px" class="col q-mx-sm" />

          <!-- Expand or collapse week -->
          <q-btn
            v-show="dayCanBeExpanded[index]"
            icon="unfold_less"
            round
            flat
            dense
            color="light-dark"
          ></q-btn>
        </div>

        <!-- Day wrapper -->
        <div class="q-pb-sm">
          <!-- Display day name -->
          <div
            v-intersection="dayTitleInteresctionHandler"
            class="row items-center q-gutter-x-xs bg-white q-px-sm q-mx-none q-mb-sm os-day-title"
            :class="{ 'os-day-disabled disabled': !dayCanBeExpanded[index] }"
            @click="
              () =>
                (dayInfoCollapsed[index] = dayCanBeExpanded[index]
                  ? !dayInfoCollapsed[index]
                  : false)
            "
          >
            <!-- Day name -->
            <h6 class="q-mt-none cursor-pointer text-margin-xs">
              <span class="os-show-on-sticky">
                {{ getWeekDisplayName(week) }} -
              </span>
              <span
                :class="{ 'underlined-dashed': dayCanBeExpanded[index] }"
                @click.stop="editWeekDayName = [week, day]"
              >
                {{ getDayDisplayName(day) }}

                <q-tooltip anchor="top middle" :offset="[0, 40]">
                  {{ $t("coach.program_management.builder.day_rename") }}
                </q-tooltip>

                <FormProgramNewWeekDay
                  v-model="editWeekDayName"
                  :cover="true"
                  single="day"
                  :offset="[15, 0]"
                  @save="
                    (val?: [string, string]) => {
                      if (val) moveDay([week, day], val);
                    }
                  "
                >
                </FormProgramNewWeekDay>
              </span>
            </h6>

            <!-- Day management buttons -->
            <div v-show="dayCanBeExpanded[index]" class="q-pl-sm">
              <!-- Duplicate day -->
              <q-btn
                icon="fa-regular fa-clone"
                size="sm"
                color="dark-light"
                flat
                round
                :ripple="false"
                @click.stop="editWeekDayName = ['', '']"
              >
                <q-tooltip anchor="top middle" :offset="[0, 40]">
                  {{ $t("coach.program_management.builder.day_duplicate") }}
                </q-tooltip>

                <FormProgramNewWeekDay
                  v-model="editWeekDayName"
                  :title="
                    $t('coach.program_management.builder.day_duplicate_form')
                  "
                  :cover="false"
                  anchor="center right"
                  self="center left"
                  @save="
                    (val?: [string, string]) => {
                      if (val) duplicateDay([week, day], val);
                    }
                  "
                >
                </FormProgramNewWeekDay>
              </q-btn>

              <!-- Delete day -->
              <q-btn
                icon="fa-regular fa-trash-can"
                size="sm"
                color="dark-light"
                flat
                round
                :ripple="false"
                @click.stop="deleteDay([week, day])"
              >
                <q-tooltip anchor="top middle" :offset="[0, 40]">
                  {{ $t("coach.program_management.builder.day_delete") }}
                </q-tooltip>
              </q-btn>
            </div>

            <q-separator size="1px" class="col q-mx-sm" />

            <!-- Expand or collapse day -->
            <q-btn
              v-show="dayCanBeExpanded[index]"
              :icon="dayShowExpanded[index] ? 'expand_less' : 'expand_more'"
              round
              flat
              dense
              color="light-dark"
            ></q-btn>
          </div>

          <!-- Collapsable element -->
          <div v-if="dayShowExpanded[index]">
            <!-- Exercise table -->
            <os-lazy
              v-for="(exerciseIdx, currIdx) in programExercises[week][day]"
              :key="selectedProgram.programExercises[exerciseIdx].scheduleOrder"
              margin="1000px"
            >
              <TableProgramBuilder
                v-show="
                  filter.exercise.length == 0 ||
                  selectedProgram.programExercises[exerciseIdx].exercise ==
                    undefined ||
                  (selectedProgram.programExercises[exerciseIdx].exercise!
                    .name &&
                    filter.exercise.includes(
                      selectedProgram.programExercises[exerciseIdx].exercise!
                        .name!,
                    ))
                "
                v-model:expanded="exercisesInfoExpanded[exerciseIdx]"
                :model-value="selectedProgram.programExercises[exerciseIdx]"
                :exercises="exercises"
                :maxlifts="maxliftsPerExercise"
                :can-move-up="currIdx > 0"
                :can-move-down="
                  currIdx < programExercises[week][day].length - 1
                "
                :navigate-weeks="Object.keys(filteredWeekDay)"
                :navigate-days="filteredWeekDay[week]"
                :dense="dense"
                @update:model-value="updateProgram()"
                @duplicate="
                  (toWeek, toDay) =>
                    duplicateExercise(exerciseIdx, [toWeek, toDay])
                "
                @delete="deleteExercise(exerciseIdx)"
                @move="(down) => moveOrderExercise(exerciseIdx, down ? 1 : -1)"
                @new-exercise="
                  (name) =>
                    emit(
                      'newExercise',
                      name,
                      selectedProgram?.programExercises?.[exerciseIdx],
                    )
                "
                @new-variant="
                  (name) =>
                    emit(
                      'newVariant',
                      selectedProgram?.programExercises?.[exerciseIdx].exercise
                        ?.name ?? '',
                      name,
                      selectedProgram?.programExercises?.[exerciseIdx],
                    )
                "
                @require-reference="
                  (line, field) =>
                    (selectingReference = { line: line, field: field })
                "
                @select-reference="(line) => onReferenceSelection(line)"
              ></TableProgramBuilder>
            </os-lazy>

            <!-- New element buttons -->
            <div class="row items-center justify-center q-gutter-xs">
              <!-- New exercise -->
              <q-btn
                icon="add"
                :label="$t('coach.program_management.builder.new_exercise')"
                flat
                rounded
                @click="addExercise([week, day])"
              >
                <q-tooltip anchor="top middle" :offset="[0, 40]" :delay="500">
                  {{
                    $t("coach.program_management.builder.new_exercise_tooltip")
                  }}
                </q-tooltip>
              </q-btn>

              <!-- New free text (TEST) -->
              <!-- TODO i18n -->
              <q-btn
                icon="add"
                label="Testo libero"
                flat
                rounded
                @click="registerFreeTextEvent()"
              >
                <q-tooltip anchor="top middle" :offset="[0, 40]" :delay="500">
                  Inserisci un esercizio senza vincoli di schema
                </q-tooltip>
              </q-btn>

              <!-- New day -->
              <q-btn
                icon="add"
                :label="$t('coach.program_management.builder.new_day')"
                flat
                rounded
                @click="addDay([week, day])"
              >
                <q-tooltip anchor="top middle" :offset="[0, 40]" :delay="500">
                  {{ $t("coach.program_management.builder.new_day_tooltip") }}
                </q-tooltip>
              </q-btn>

              <!-- New week -->
              <q-btn
                icon="add"
                :label="$t('coach.program_management.builder.new_week')"
                flat
                rounded
                @click="addWeek(week)"
              >
                <q-tooltip anchor="top middle" :offset="[0, 40]" :delay="500">
                  {{ $t("coach.program_management.builder.new_week_tooltip") }}
                </q-tooltip></q-btn
              >
            </div>
          </div>
        </div>
      </div>
    </q-virtual-scroll>

    <!-- Show dialog to stop reference line selection -->
    <q-dialog
      :model-value="Boolean(selectingReference)"
      seamless
      position="bottom"
      @update:model-value="selectingReference = undefined"
    >
      <q-card class="bg-lighter" style="width: 350px">
        <q-card-section class="row items-center no-wrap">
          <p class="text-bold">
            {{
              $t("coach.program_management.builder.reference_select_line_help")
            }}
          </p>

          <q-space />

          <q-btn v-close-popup icon="close" label="Cancel" color="negative" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, defineAsyncComponent } from "vue";
import {
  IntersectionValue,
  QVirtualScroll,
  debounce as debounceFunction,
  throttle as throttleFunction,
} from "quasar";
import { arrayCompare, arrayOfPairsToObject, arraySort } from "@/helpers/array";
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
  moveProgramExercise,
  assignReference,
} from "@/helpers/programs/builder";
import { useI18n } from "vue-i18n";
import {
  getProgramUniqueWeekDayPairs,
  mergePrograms,
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
  merge: mergeWithProgram,
  undo: throttleFunction(undo, props.debounce),
  redo: throttleFunction(redo, props.debounce),
  getHistorySteps: () => {
    return [
      programHistoryPointer.value,
      programHistory.value.length - programHistoryPointer.value - 1,
    ];
  },
});

// Set ref
const exerciseListElement = ref<QVirtualScroll>(); // reference to scroller element
const selectedProgram = ref<Program>(); // current program
const editWeekDayName = ref<[string, string]>(["", ""]); // week and/or day name that is being modified (to clone or move tables)
const selectingReference = ref<{
  line: ProgramLine;
  field: string;
}>(); // useful info to maintain while selecting a reference line
const exercisesInfoExpanded = ref<boolean[]>([]); // check if an exercise info table should be expanded or collapsed
const dayInfoCollapsed = ref<boolean[]>([]); // check if a day should be expanded or collapsed
const programHistory = ref<Program[]>([]); // store changes to data to allow walking history
const programHistoryPointer = ref<number>(0); // pointer to current data version in history

// Retrieve and supply current program
watch(
  () => props.modelValue,
  (program) => {
    if (selectedProgram.value != program) {
      // Empty changes
      if (
        program.uid == undefined ||
        selectedProgram.value?.uid != program.uid ||
        programHistory.value.length <= 1
      ) {
        programHistory.value.length = 0;
        storeChanges(program);
      }

      // Set current program to input one
      selectedProgram.value = program;
    }
  },
  { immediate: true },
);

// Get all program exercises indexes sorted and separated by week/day
const programExercises = computed<{
  [week: string]: { [day: string]: number[] };
}>(() => {
  if (!selectedProgram.value?.programExercises) return {};

  // Get separated indexes for each week and day pair
  const outExercises = selectedProgram.value.programExercises.reduce(
    (
      out: {
        [week: string]: { [day: string]: number[] };
      },
      programExercise,
      idx,
    ) => {
      const week = programExercise.scheduleWeek?.toString() ?? "";
      const day = programExercise.scheduleDay?.toString() ?? "";
      if (!(week in out)) out[week] = {};
      if (!(day in out[week])) out[week][day] = [];
      out[week][day].push(idx);
      return out;
    },
    {},
  );

  // Sort indexes by program order
  Object.values(outExercises).forEach((dayObject) =>
    Object.values(dayObject).forEach((idxs) => {
      arraySort(idxs, true, (idx) =>
        Number(
          selectedProgram.value!.programExercises![idx].scheduleOrder ??
            Infinity,
        ),
      );
    }),
  );

  return outExercises;
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

// Get day visibility status
const dayCanBeExpanded = computed(() =>
  allWeekDayPairs.value.map(([week, day]) =>
    filteredWeekDay.value[week]?.includes(day),
  ),
);
const dayShowExpanded = computed(() =>
  dayCanBeExpanded.value.map((val, idx) => !dayInfoCollapsed.value[idx] && val),
);

// Expand all days on filter change
watch(
  () => props.filter,
  () => {
    dayInfoCollapsed.value = [];
  },
);

/**
 * Assign a given reference to the selected line.
 *
 * @param reference line or maxlift identifier or instance.
 */
function onReferenceSelection(reference: ProgramLine) {
  // Assign reference
  if (!selectingReference.value) return;
  assignReference(
    selectingReference.value.line,
    reference,
    selectingReference.value.field as "sets" | "reps" | "load" | "rpe",
  );

  // Mixpanel tracking
  mixpanel.track("Reference Added in Program", {
    Page: "ProgramView",
    Type:
      selectingReference.value.line instanceof ProgramLine ? "line" : "maxlift",
    Variable: selectingReference.value.field,
  });

  // Clear selection info
  selectingReference.value = undefined;

  // Update program
  updateProgram();
}

/**
 * Move one exercise across builder and update program accordingly.
 *
 * @param programExercise exercise that is being affected.
 * @param destination destination week, day, and exercise order.
 * @param [duplicate=false] if true, duplicate exercise instead of moving it (ignored if any input is undefined).
 * @param [sourceFallback=false] if true, use source position as destination if not provided (do not delete exercise).
 * @param [sourceOffset=0] optional offset to source position, only used if source is used as destination fallback.
 * @param [looseOrder=false] if true, place the exercise at the end of selected day if destination is occupied.
 */
function moveExerciseAndUpdate(
  programExercise?: ProgramExercise | number,
  destination?: [string, string, string | undefined],
  duplicate = false,
  {
    sourceFallback = false,
    sourceOffset = 0,
    looseOrder = false,
  }: {
    sourceFallback?: boolean;
    sourceOffset?: number;
    looseOrder?: boolean;
  } = {},
) {
  // No sense if program in unknown
  if (!selectedProgram.value) return;

  // Move exercise as required
  selectedProgram.value = moveProgramExercise(
    selectedProgram.value,
    programExercise,
    destination,
    duplicate,
    {
      sourceFallback: sourceFallback,
      sourceOffset: sourceOffset,
      looseOrder: looseOrder,
    },
  );

  // Update program with new structure
  updateProgram();
}

/**
 * Move one exercise from one scheduling order to another, while preserving week and day schedule.
 *
 * @param programExercise exercise data that shall be deleted.
 * @param moveBy how many positions to move the exercise up or down (positive to increase order, negative to decrease it).
 */
function moveOrderExercise(
  programExercise: ProgramExercise | number,
  moveBy: number,
) {
  moveExerciseAndUpdate(programExercise, undefined, false, {
    sourceFallback: true,
    sourceOffset: moveBy,
    looseOrder: false,
  });
}

/**
 * Delete one exercise from the list.
 *
 * @param programExercise exercise data that shall be deleted.
 */
function deleteExercise(programExercise: ProgramExercise | number) {
  // Delete exercise by moving to unknown destination
  moveExerciseAndUpdate(programExercise, undefined);

  // Mixpanel tracking
  mixpanel.track("Delete Exercise from Program");
}

/**
 * Add one exercise to the list.
 *
 * @param destination position where exercise shall be placed, ignoring order if already occupied.
 * @param programExercise if provided, initialize a non-empty exercise by duplication of supplied one.
 */
function addExercise(
  destination?: [string, string, string?],
  programExercise?: ProgramExercise | number,
) {
  // Add table in selected position
  moveExerciseAndUpdate(
    programExercise,
    destination as [string, string, string],
    true,
    { sourceFallback: true, sourceOffset: 0, looseOrder: true },
  );
}

/**
 * Duplicate an exercise in a specific week and day.
 *
 * @param programExercise exercise, or corresponding index, that shall be duplicated.
 * @param destination optional destination week and day, otherwise duplicate in original week and day.
 */
function duplicateExercise(
  programExercise: ProgramExercise | number,
  destination?: [string, string, string?],
) {
  addExercise(destination, programExercise);

  // Mixpanel tracking
  mixpanel.track("Duplicate Exercise in Program");
}

/**
 * Delete all program exercises in a day.
 *
 * @param scheduleInfo schedule info of day to delete.
 */
function deleteDay(scheduleInfo: [string, string, string?]) {
  // Delete all exercises in a day
  const [week, day] = scheduleInfo;
  selectedProgram.value?.programExercises?.forEach((programExercise) => {
    if (
      programExercise.scheduleWeek == week &&
      programExercise.scheduleDay == day
    )
      deleteExercise(programExercise);
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
  nextFreeDestination = false,
  createIfEmpty = true,
  duplicate = false,
  doScroll = true,
) {
  // Get source and destination day
  const [fromWeek, fromDay] = scheduleInfo;
  let [toWeek, toDay] = destination;
  if (nextFreeDestination)
    toDay = stringGetNextFromList(allWeekDay.value[toWeek] ?? [], toDay);

  // Check if source is empty while renaming
  let isSourceEmpty = true;

  // Ensure updatable program exercises
  if (!selectedProgram.value) return;
  if (!selectedProgram.value.programExercises)
    selectedProgram.value.programExercises = [];

  // Perform move (ordered)
  sortProgramExercises(
    selectedProgram.value.programExercises.filter(
      (programExercise) =>
        programExercise.scheduleWeek == fromWeek &&
        programExercise.scheduleDay == fromDay,
    ),
  ).forEach((programExercise) => {
    if (duplicate) duplicateExercise(programExercise, [toWeek, toDay]);
    else
      moveExerciseAndUpdate(
        programExercise,
        [toWeek, toDay, undefined],
        false,
        { looseOrder: true },
      );
    isSourceEmpty = false;
  });

  // Optionally add a table if source is empty
  if (createIfEmpty && isSourceEmpty) {
    addExercise([toWeek, toDay]);

    // Mixpanel tracking
    mixpanel.track("New Day Created in Program");
  } else {
    // Mixpanel tracking
    mixpanel.track("Day Week Renamed", { Page: "ProgramView" });
  }

  // Scroll to destination day
  if (doScroll && destination) nextTick(() => scrollTo(toWeek, toDay));

  // Update program with new naming
  updateProgram();
}

/**
 * Add a new day in selected destination week and day.
 *
 * @param destination destination week and day.
 * @param [doScroll=true] if true, scroll to the newly created element.
 */
function addDay(destination: [string, string, string?], doScroll = true) {
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
  doScroll = true,
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
  doScroll = true,
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
function duplicateWeek(
  scheduleInfo: string | [string, string, string?],
  destination: string | [string, string, string?],
  doScroll = true,
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
function getWeekDisplayName(weekId: string) {
  return i18n.t("coach.program_management.builder.week_name", {
    week: weekId,
  });
}

/**
 * Get a single day display name given day ID.
 *
 * @param dayId base day name.
 */
function getDayDisplayName(dayId: string) {
  return i18n.t("coach.program_management.builder.day_name", {
    day: dayId,
  });
}

/**
 * Store changes in data for successive undo/redo.
 *
 * @param data changed data value to store.
 */
function storeChanges(program?: Program) {
  // Store data from current pointer position
  if (programHistoryPointer.value + 1 < programHistory.value.length)
    programHistory.value.length = programHistoryPointer.value + 1;

  // Add new element up to max length
  program = program ?? selectedProgram.value;
  if (!program) return;
  programHistory.value.push(program.duplicate());
  if (programHistory.value.length > props.historyMaxLength)
    programHistory.value = programHistory.value.slice(
      programHistory.value.length - props.historyMaxLength,
    );

  // Update pointer position
  programHistoryPointer.value = programHistory.value.length - 1;
}

/**
 * Merge one program into selected one and store update.
 *
 * @param program program that will be merged into selected one.
 * @param mapMaxlifts optional list of maxlifts to map from first program to second one.
 */
function mergeWithProgram(
  program: Program,
  mapMaxlifts?: [MaxLift, MaxLift][],
) {
  // Merge current program with provided one
  if (!selectedProgram.value) return;
  mergePrograms(
    selectedProgram.value,
    program,
    mapMaxlifts ?? program.uid != selectedProgram.value.uid,
  );

  // Inform parent of update
  updateProgram();
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
    if (programHistory.value.at(programHistoryPointer.value))
      selectedProgram.value = programHistory.value
        .at(programHistoryPointer.value)!
        .duplicate();
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
    if (programHistory.value.at(programHistoryPointer.value))
      selectedProgram.value = programHistory.value
        .at(programHistoryPointer.value)!
        .duplicate();
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
 * Update program based on the current program value.
 *
 * Note: function call is debounced to prevent high loads due to frequent updates.
 *
 * @param [saveChange=true] if true, save changes in history, otherwise ignore it.
 */
const updateProgram = debounceFunction(doUpdateProgram, props.debounce);

/**
 * Update program based on the current program value.
 *
 * Note: this should not be used unless immediate update is required.
 * Use debounced version instead.
 *
 * @param [saveChange=true] if true, save changes in history, otherwise ignore it.
 */
function doUpdateProgram(saveChange = true) {
  // Store changes and inform parent of update
  if (saveChange) storeChanges(selectedProgram.value);
  emit("update:modelValue", selectedProgram.value);
}

/**
 * Scroll to the beginning of a selected week and day.
 *
 * @param week name of the week to scroll to.
 * @param day name of the day to scroll to (first day in week if not provided).
 */
function scrollTo(week: string, day?: string) {
  let idx = allWeekDayPairs.value.findIndex((val) =>
    arrayCompare(val, [week, day]),
  );
  if (idx < 0) idx = allWeekDayPairs.value.findIndex((val) => val[0] == week);
  if (idx < 0) return;
  exerciseListElement.value?.scrollTo(idx);
}

// Set method to handle sticky day title
const dayTitleInteresctionHandler: IntersectionValue = {
  handler: (entry): boolean => {
    // Add classes when element becomes sticky, delete them otherwise
    if (
      !entry?.isIntersecting &&
      (entry?.boundingClientRect?.top ?? 0) <
        (entry?.intersectionRect?.top ?? 0)
    ) {
      entry?.target?.classList.add("shadow-1");
      entry?.target?.classList.add("os-day-sticky");
    } else {
      entry?.target?.classList.remove("shadow-1");
      entry?.target?.classList.remove("os-day-sticky");
    }
    return true;
  },
  cfg: {
    rootMargin: `-10px -10px -10px -10px`,
    threshold: [1],
  },
};

/**
 * TODO: Remove after TEST
 */
function registerFreeTextEvent() {
  mixpanel.track("T1: free text click");
}
</script>

<style scoped lang="scss">
.os-day-title {
  position: sticky;
  top: -1px;
  padding-top: 1px;
  padding-inline: 8px;
  padding-inline-start: 32px;
  z-index: 1;
  border-radius: 12px;
  transition: box-shadow 300ms, background-color 300ms;

  & .os-show-on-sticky {
    display: none;
  }

  &.os-day-sticky {
    background-color: $orange-1 !important;
    padding-inline: 8px;

    & .os-show-on-sticky {
      display: unset;
    }
  }

  &.os-day-disabled {
    background-color: $grey-2 !important;
    margin-inline: 16px;
    padding-inline: 16px;

    & .os-show-on-sticky {
      display: none;
    }
  }
}
</style>
