<template>
  <div class="q-pa-md q-ma-md shadow-2" style="border-radius: 24px">
    <!-- Program exercise element -->
    <div
      :ref="(el) => (tableElements[idScheduleInfo] = el)"
      v-for="(exerciseModelValue, idScheduleInfo) in filteredExercisesValues"
      :key="idScheduleInfo"
    >
      <!-- Show week and day and allow navigation -->
      <div
        v-if="firstTablesInDay.includes(idScheduleInfo.toString())"
        class="row items-center q-gutter-x-sm"
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
                    scrollToElementInParent(
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
                      scrollOffset,
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
                    scrollToElementInParent(
                      tableElements[
                        mergeScheduleInfoNames(
                          splitScheduleInfoNames(idScheduleInfo.toString())[0],
                          day,
                          splitScheduleInfoNames(idScheduleInfo.toString())[2],
                        )
                      ],
                      scrollOffset,
                    )
                  "
                >
                  <q-item-section>{{ getDayDisplayName(day) }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </span>
        </h6>

        <q-btn
          @click="
            editWeekDayName = splitScheduleInfoNames(idScheduleInfo.toString())
          "
          icon="edit"
          size="sm"
          color="light"
          flat
          round
          :ripple="false"
        >
          <FormProgramNewWeekDay
            v-model="editWeekDayName"
            @save="renameWeekDay"
            :cover="false"
            anchor="center right"
            self="center right"
            :offset="[15, 0]"
          >
          </FormProgramNewWeekDay>
        </q-btn>

        <q-separator inset size="1px" class="col" />
      </div>

      <!-- Exercise element -->
      <div class="row items-start justify-evenly q-mb-md">
        <!-- Reordering arrows -->
        <div class="self-center column justify-center">
          <q-btn
            @click="reorderTableRelative(idScheduleInfo.toString(), -1)"
            icon="arrow_drop_up"
            flat
            dense
            :color="
              firstTablesInDay.includes(idScheduleInfo.toString())
                ? 'grey-5'
                : 'secondary'
            "
            :disable="firstTablesInDay.includes(idScheduleInfo.toString())"
          />
          <q-btn
            @click="reorderTableRelative(idScheduleInfo.toString(), +1)"
            icon="arrow_drop_down"
            flat
            dense
            :color="
              lastTablesInDay.includes(idScheduleInfo.toString())
                ? 'grey-5'
                : 'secondary'
            "
            :disable="lastTablesInDay.includes(idScheduleInfo.toString())"
          />
        </div>

        <!-- Exercise info -->
        <div
          class="col-3 q-pa-sm bg-lighter os-exercise-form os-light-border"
          :class="{
            'cursor-pointer': !exercisesInfoShowExpanded[idScheduleInfo],
          }"
          @click="
            exercisesInfoExpanded = objectMapValues(
              exercisesInfoExpanded,
              () => false,
            );
            exercisesInfoExpanded[idScheduleInfo] = true;
          "
          style="position: relative"
        >
          <q-slide-transition>
            <div v-show="exercisesInfoShowExpanded[idScheduleInfo]">
              <osSelect
                :model-value="exerciseModelValue.exercise"
                @update:model-value="
                  (val: typeof exerciseModelValue.exercise) => {
                    updateSelectedExercise(idScheduleInfo.toString(), val);
                    updateProgramExercise(idScheduleInfo.toString());
                  }
                "
                :options="exercises.map((exercise) => exercise.name)"
                hide-bottom-space
              >
              </osSelect>
              <q-separator color="inherit" spaced="xs" />
              <osSelect
                :model-value="exerciseModelValue.variant"
                @update:model-value="
                  (val: typeof exerciseModelValue.variant) => {
                    exerciseModelValue.variant = val;
                    updateProgramExercise(idScheduleInfo.toString());
                  }
                "
                :options="
                  selectedExercises[idScheduleInfo]?.variants?.map(
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
                hide-bottom-space
              >
              </osSelect>
              <q-separator color="inherit" spaced="xs" />
              <osInput
                :model-value="exerciseModelValue.note"
                @update:model-value="
                  (val: typeof exerciseModelValue.note) => {
                    exerciseModelValue.note = val;
                    updateProgramExercise(idScheduleInfo.toString());
                  }
                "
                type="textarea"
                hide-bottom-space
              >
              </osInput>
              <q-btn
                icon="expand_less"
                @click.stop="exercisesInfoExpanded[idScheduleInfo] = false"
                flat
                dense
                color="secondary"
                class="full-width"
                :ripple="false"
              />
            </div>
          </q-slide-transition>
          <q-slide-transition>
            <div
              v-show="!exercisesInfoShowExpanded[idScheduleInfo]"
              class="text-ellipsis"
            >
              <p class="text-secondary text-bold">
                {{ exerciseModelValue.exercise }}
                {{
                  exerciseModelValue.variant
                    ? " - " + exerciseModelValue.variant
                    : ""
                }}
              </p>
              <p class="text-xs text-italic">
                {{ exerciseModelValue.note }}
              </p>
            </div>
          </q-slide-transition>

          <!-- Delete buttons -->
          <q-btn
            icon="clear"
            @click="deleteTable(idScheduleInfo.toString())"
            round
            unelevated
            size="0.5em"
            color="light"
            class="os-exercise-delete-btn"
          />
        </div>

        <!-- Data table -->
        <osTableSheet
          :model-value="exerciseModelValue.data"
          @update:model-value="
            (val?: typeof exerciseModelValue.data) => {
              updateTableData(idScheduleInfo.toString(), val);
              updateProgramExercise(idScheduleInfo.toString());
            }
          "
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
          :widths="{
            load: '9%',
            reps: '9%',
            sets: '9%',
            rpe: '9%',
            note: '50%',
            requestText: '7%',
            requestVideo: '7%',
          }"
          :placeholders="{
            load: $t(
              'coach.program_management.fields.load',
            ).toLocaleLowerCase(),
            reps: $t(
              'coach.program_management.fields.reps',
            ).toLocaleLowerCase(),
            sets: $t(
              'coach.program_management.fields.sets',
            ).toLocaleLowerCase(),
            rpe: $t('coach.program_management.fields.rpe').toLocaleLowerCase(),
            note: $t(
              'coach.program_management.fields.note',
            ).toLocaleLowerCase(),
          }"
          :showNewLine="{
            load: '',
            reps: '',
            sets: '',
            rpe: '',
            note: '',
            requestText: false,
            requestVideo: false,
          }"
          :deleteEmptyLine="true"
          @row-click="
            (_: any, row: any) =>
              selectingReferenceLine ? onReferenceClick(row.uid) : undefined
          "
          dense
          class="col os-light-border"
        >
          <template #item="itemProps">
            <q-btn
              v-if="itemProps.value && String(itemProps.value).endsWith('%')"
              icon="fa-solid fa-link"
              color="secondary"
              size="0.4em"
              :flat="
                exerciseModelValue.data[itemProps.row.id][
                  (itemProps.col.field + 'Ref') as
                    | 'loadRef'
                    | 'repsRef'
                    | 'setsRef'
                    | 'rpeRef'
                ] == undefined
              "
              round
              :ripple="false"
            >
              <!-- Show list of options to select as reference -->
              <q-menu anchor="center right" self="center left">
                <q-list style="min-width: 100px">
                  <q-item
                    v-for="[maxliftType, maxlift] in Object.entries(
                      maxliftsPerExercise[exerciseModelValue.exercise ?? ''] ??
                        {},
                    )"
                    :key="maxliftType"
                    @click="
                      onReferenceClick(maxlift, 'maxlift', {
                        schedule: idScheduleInfo.toString(),
                        lineNum: itemProps.row.id,
                        field: itemProps.col.field,
                      })
                    "
                    clickable
                    v-close-popup
                    dense
                  >
                    <q-item-section>{{ maxliftType }}</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item
                    clickable
                    @click="
                      selectingReferenceLine = {
                        schedule: idScheduleInfo.toString(),
                        lineNum: itemProps.row.id,
                        field: itemProps.col.field,
                      }
                    "
                    v-close-popup
                    dense
                  >
                    <q-item-section>{{
                      $t(
                        "coach.program_management.builder.reference_select_line",
                      )
                    }}</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item
                    v-if="
                      exerciseModelValue.data[itemProps.row.id][
                        (itemProps.col.field + 'Ref') as
                          | 'loadRef'
                          | 'repsRef'
                          | 'setsRef'
                          | 'rpeRef'
                      ] != undefined
                    "
                    clickable
                    @click="
                      onReferenceClick('', 'line', {
                        schedule: idScheduleInfo.toString(),
                        lineNum: itemProps.row.id,
                        field: itemProps.col.field,
                      })
                    "
                    v-close-popup
                    dense
                  >
                    <q-item-section>{{
                      $t("coach.program_management.builder.reference_remove")
                    }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </template>
        </osTableSheet>
      </div>

      <!-- New element button -->
      <div
        v-if="lastTablesInDay.includes(idScheduleInfo.toString())"
        class="row items-center justify-center q-gutter-md"
      >
        <q-btn
          icon="add"
          :label="$t('coach.program_management.builder.new_exercise')"
          @click="addTable(idScheduleInfo.toString())"
          rounded
          unelevated
        />
        <q-btn
          icon="add"
          :label="$t('coach.program_management.builder.new_day')"
          @click="editWeekDayName = ['', '']"
          rounded
          unelevated
        >
          <FormProgramNewWeekDay
            v-model="editWeekDayName"
            @save="renameWeekDay"
            :cover="false"
            anchor="bottom middle"
            self="top middle"
            :offset="[0, 5]"
          >
          </FormProgramNewWeekDay>
        </q-btn>
      </div>
    </div>

    <!-- Show something when program is empty -->
    <div v-if="objectIsEmpty(exercisesValues)" class="text-center">
      <slot name="empty-program">
        <h6>
          {{ $t("coach.program_management.builder.empty") }}
        </h6>
      </slot>
      <q-btn
        icon="add"
        :label="$t('coach.program_management.builder.new_day')"
        @click="editWeekDayName = ['', '']"
        rounded
        unelevated
      >
        <FormProgramNewWeekDay
          v-model="editWeekDayName"
          @save="renameWeekDay"
          :cover="false"
          anchor="bottom middle"
          self="top middle"
          :offset="[0, 5]"
        >
        </FormProgramNewWeekDay>
      </q-btn>
    </div>

    <!-- Show something when filters remove any exercise -->
    <div v-else-if="objectIsEmpty(filteredExercisesValues)" class="text-center">
      <slot name="empty-filtered">
        <h6>
          {{ $t("coach.program_management.filter.all_filtered_out") }}
        </h6>
      </slot>
    </div>

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
import { ref, computed, PropType, watch } from "vue";
import { uid, debounce, useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import FormProgramNewWeekDay from "@/components/forms/FormProgramNewWeekDay.vue";
import { scrollToElementInParent } from "@/helpers/scroller";
import { arrayCompare, arrayUniqueValues } from "@/helpers/array";
import {
  Program,
  ProgramExercise,
  ProgramLine,
} from "@/helpers/programs/program";
import { orderProgramExercises } from "@/helpers/programs/linesManagement";
import { Exercise, ExerciseVariant } from "@/helpers/exercises/exercise";
import {
  objectIsEmpty,
  objectDeepCopy,
  objectMapKeys,
  objectMapValues,
} from "@/helpers/object";
import { MaxLift } from "@/helpers/maxlifts/maxlift";
import { separateMaxliftPerExerciseAndType } from "@/helpers/maxlifts/listManagement";

// Init plugin
const $q = useQuasar();
const i18n = useI18n();

// Define props
const props = defineProps({
  modelValue: {
    type: Program,
    required: true,
  },
  exercises: {
    type: Array as PropType<Exercise[]>,
    default: () => [],
  },
  maxlifts: {
    type: Array as PropType<MaxLift[]>,
    default: () => [],
  },
  filter: {
    type: Object as PropType<{
      week: string[];
      day: string[];
      exercise: string[];
    }>,
    default: () => ({}),
  },
  scrollOffset: {
    type: Number,
    default: 0,
  },
});

// Define emits
const emit = defineEmits(["update:modelValue"]);

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
    data: {
      uid: string;
      load: string | undefined;
      loadRef: ProgramLine | MaxLift | undefined;
      reps: string | undefined;
      repsRef: ProgramLine | MaxLift | undefined;
      sets: string | undefined;
      setsRef: ProgramLine | undefined;
      rpe: string | undefined;
      rpeRef: ProgramLine | undefined;
      note: string | undefined;
      requestText: boolean | undefined;
      requestVideo: boolean | undefined;
    }[];
    exercise: string | undefined;
    variant: string | undefined;
    note: string | undefined;
  };
}>({});
const programCurrentValue = ref<Program>();
const editWeekDayName = ref<string[]>();
const selectingReferenceLine = ref<{
  schedule: string;
  lineNum: string;
  field: string;
}>();
const exercisesInfoExpanded = ref<{
  [key: string]: boolean;
}>({});

// Get a subset of tables to show according to filters
const filteredExercisesValues = computed(() => {
  const filteredKeys = Object.keys(exercisesValues.value).filter((key) => {
    const [currWeek, currDay] = splitScheduleInfoNames(key);
    const currExercise = exercisesValues.value[key].exercise;
    if (props.filter.week.length > 0 && !props.filter.week.includes(currWeek))
      return false;
    if (props.filter.day.length > 0 && !props.filter.day.includes(currDay))
      return false;
    if (
      props.filter.exercise.length > 0 &&
      (!currExercise || !props.filter.exercise.includes(currExercise))
    )
      return false;
    return true;
  }, {});
  return Object.fromEntries(
    filteredKeys.map((key) => [key, exercisesValues.value[key]]),
  );
});

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
  props.modelValue.programExercises
    ? orderProgramExercises(
        props.modelValue.programExercises,
        mergeScheduleInfoNames,
      )
    : {},
);

// Get maxlifts separated per exercise name and type
const maxliftsPerExercise = computed(() =>
  separateMaxliftPerExerciseAndType(props.maxlifts),
);

// Get whether each exercise info should be displayed or not
const exercisesInfoShowExpanded = computed(() => {
  return objectMapValues(
    exercisesValues.value,
    (_, key) =>
      exercisesInfoExpanded.value[key] || !exercisesValues.value[key].exercise,
  );
});

// Get id of first and last table element for each day
const firstTablesInDay = computed(() =>
  Object.keys(filteredExercisesValues.value).reduce((out: string[], key) => {
    const keySplit = splitScheduleInfoNames(key).slice(0, 2);
    if (
      !out.some((firstInDay) =>
        arrayCompare(splitScheduleInfoNames(firstInDay).slice(0, 2), keySplit),
      )
    )
      return [...out, key];
    return out;
  }, []),
);
const lastTablesInDay = computed(() =>
  Object.keys(filteredExercisesValues.value)
    .reverse()
    .reduce((out: string[], key) => {
      const keySplit = splitScheduleInfoNames(key).slice(0, 2);
      if (
        !out.some((firstInDay) =>
          arrayCompare(
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
  arrayUniqueValues(
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
  () => props.modelValue,
  () => {
    if (programCurrentValue.value != props.modelValue) resetTableData();
  },
  { immediate: true },
);

// Reorder exercises upon update
watch(exercisesValues, () => sortExerciseValues());

// Inform parent of program update
watch(programCurrentValue, (program) => emit("update:modelValue", program));

/**
 * Get a random uid.
 *
 * @returns a random uid.
 */
function getRandomUid() {
  return "OS-" + uid();
}

/**
 * Update table data according to input data.
 */
function resetTableData() {
  // Set current value to be equal to input one
  programCurrentValue.value = props.modelValue;

  // Epmty changes
  changes.value.length = 0;

  // Delete previously stored values
  exercisesValues.value = {};

  // Set new exercise values
  Object.entries(sortedProgramExercises.value).forEach(
    ([idScheduleInfo, programExercise]) => {
      // Init element
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
        programExercise.lines?.map((line) => {
          if (!line.uid) line.uid = getRandomUid();
          return {
            uid: line.uid,
            load: line.loadBaseValue,
            loadRef: line.loadReference,
            reps: line.repsBaseValue,
            repsRef: line.repsReference,
            sets: line.setsBaseValue,
            setsRef: line.setsReference,
            rpe: line.rpeBaseValue,
            rpeRef: line.rpeReference,
            note: line.note,
            requestText: line.requestFeedbackText ?? false,
            requestVideo: line.requestFeedbackVideo ?? false,
          };
        }) ?? [];
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
 * Update table data for an exercise in program.
 *
 * @param idScheduleInfo schedule info id whose exercise shall be updated.
 * @param data table data that shall be saved.
 */
function updateTableData(
  idScheduleInfo: string,
  data: (typeof exercisesValues.value)[string]["data"],
) {
  data.forEach((line) => {
    if (!Object.keys(line).includes("uid")) line.uid = getRandomUid();
  });
  exercisesValues.value[idScheduleInfo].data = data;
}

/**
 * Perform operations on reference selection.
 *
 * @param reference line or maxlift identifier or instance.
 * @param type specify whether reference is line or maxlift.
 */
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

  // Update line reference
  const refField = lineInfo.field + "Ref";
  const tableRef =
    exercisesValues.value[lineInfo.schedule].data[Number(lineInfo.lineNum)];
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

  // Update program
  updateProgramExercise(lineInfo.schedule);
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
  if (!arrayCompare(sortedKeys, Object.keys(exercisesValues.value)))
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
        arrayCompare(currSchedule.slice(0, 2), srcSchedule.slice(0, 2)) &&
        currOrder > srcOrder
      )
        offset -= 1;
      if (
        arrayCompare(currSchedule.slice(0, 2), dstSchedule.slice(0, 2)) &&
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
 * Move one week and day pair from table to a new name.
 *
 * @param toSchedule destination week and day name.
 * @param fromSchedule source week and day name.
 * @param createIfEmpty if true, create a new table at destination week and day if source is empty.
 */
function renameWeekDay(
  toSchedule: string[],
  fromSchedule: string[],
  createIfEmpty: boolean = true,
) {
  // Check and parse input
  if (toSchedule.length < 2 || fromSchedule.length < 2) {
    $q.notify({
      type: "negative",
      message: i18n.t("coach.program_management.builder.new_day_error"),
      position: "bottom",
    });
    return;
  }
  const [toWeekId, toDayId] = toSchedule;
  const [fromWeekId, fromDayId] = fromSchedule;

  // Check if new naming can be used
  if (!toWeekId || !toDayId) return;
  if (
    Object.keys(exercisesValues.value).some((key) =>
      arrayCompare(
        splitScheduleInfoNames(key).slice(0, 2),
        toSchedule.slice(0, 2),
      ),
    )
  ) {
    $q.notify({
      type: "negative",
      message: i18n.t(
        "coach.program_management.builder.new_day_already_exists",
      ),
      position: "bottom",
    });
    return;
  }

  // Check if source is empty while renaming
  let isSourceEmpty = true;

  // Perform renaming
  exercisesValues.value = Object.entries(exercisesValues.value).reduce(
    (out: typeof exercisesValues.value, [key, value]) => {
      const scheduleInfo = splitScheduleInfoNames(key);
      if (scheduleInfo[0] == fromWeekId && scheduleInfo[1] == fromDayId) {
        out[mergeScheduleInfoNames(toWeekId, toDayId, scheduleInfo[2])] = value;
        isSourceEmpty = false;
      } else out[key] = value;
      return out;
    },
    {},
  );

  // Optionally add a table is source is empty
  if (createIfEmpty && isSourceEmpty)
    addTable(mergeScheduleInfoNames(toWeekId, toDayId, 1));

  // Update program with new naming
  updateProgramWhole();
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
// TODO
// eslint-disable-next-line
function storeChanges(key: string, changeData: any) {
  if (!(key in storeChangesMethods))
    storeChangesMethods[key] = debounce((newValue: any) => {
      changes.value.push({ value: objectDeepCopy(newValue) });
    }, 1000);
  storeChangesMethods[key](changeData);
}

/**
 * Rebuild the whole program based on the current table values.
 */
function updateProgramWhole() {
  // Update program
  const program = props.modelValue.duplicate();
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
                uid: lineInfo.uid,
                setsBaseValue: lineInfo.sets,
                setsReference: lineInfo.setsRef,
                repsBaseValue: lineInfo.reps,
                repsReference: lineInfo.repsRef,
                loadBaseValue: lineInfo.load,
                loadReference: lineInfo.loadRef,
                rpeBaseValue: lineInfo.rpe,
                rpeReference: lineInfo.rpeRef,
                note: lineInfo.note,
                requestFeedbackText: lineInfo.requestText,
                requestFeedbackVideo: lineInfo.requestVideo,
              }),
          ),
        }),
      );
    },
  );

  // Inform parent of update
  programCurrentValue.value = program;
}

/**
 * Rebuild the whole program based on the current table values.
 */
function updateProgramExercise(idScheduleInfo: string) {
  // Get interesting program exercise
  const [exerciseWeek, exerciseDay, exerciseOrder] =
    splitScheduleInfoNames(idScheduleInfo);
  const programExercise = props.modelValue.programExercises?.find(
    (exercise) =>
      String(exercise.scheduleWeek) == exerciseWeek &&
      String(exercise.scheduleDay) == exerciseDay &&
      String(exercise.scheduleOrder) == exerciseOrder,
  );
  if (!programExercise) return;

  // Update interesting program exercise
  programExercise.exercise = selectedExercises.value[idScheduleInfo];
  programExercise.exerciseVariant =
    selectedExerciseVariants.value[idScheduleInfo];
  programExercise.exerciseNote = exercisesValues.value[idScheduleInfo].note;
  programExercise.lines = exercisesValues.value[idScheduleInfo].data.map(
    (lineInfo, idx) =>
      new ProgramLine({
        lineOrder: idx,
        uid: lineInfo.uid,
        setsBaseValue: lineInfo.sets,
        setsReference: lineInfo.setsRef,
        repsBaseValue: lineInfo.reps,
        repsReference: lineInfo.repsRef,
        loadBaseValue: lineInfo.load,
        loadReference: lineInfo.loadRef,
        rpeBaseValue: lineInfo.rpe,
        rpeReference: lineInfo.rpeRef,
        note: lineInfo.note,
        requestFeedbackText: lineInfo.requestText,
        requestFeedbackVideo: lineInfo.requestVideo,
      }),
  );

  // Inform parent of update
  programCurrentValue.value = props.modelValue.duplicate();
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
