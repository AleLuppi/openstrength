<template>
  <div
    :class="
      dense ? 'q-pl-sm q-pr-none q-ml-sm q-mr-none' : 'q-pa-md q-ma-md shadow-2'
    "
    style="border-radius: 24px"
  >
    <!-- Week wrapper -->
    <div v-for="week in filteredWeeks" :key="`week${week}`">
      <!-- Day wrapper -->
      <div
        :ref="(el) => (dayElements[getName([week, day])] = el)"
        v-for="(day, dayIdx) in filteredDays[week]"
        :key="`day${day}`"
      >
        <!-- Show week and day and allow navigation -->
        <div
          class="row items-center q-gutter-x-xs"
          :class="{ 'q-mt-lg': dayIdx > 0 }"
        >
          <!-- Week and day names -->
          <h6 class="q-mt-none">
            <span
              class="underlined-dashed cursor-pointer text-h4 text-margin-xs"
            >
              {{ getWeekDisplayName(week) }}
              <q-menu auto-close>
                <q-list
                  v-for="otherWeek in filteredWeeks.filter(
                    (oneWeek) => oneWeek != week,
                  )"
                  :key="`otherweek${otherWeek}`"
                  style="min-width: 100px"
                >
                  <q-item
                    clickable
                    @click="
                      scrollToElementInParent(
                        dayElements[getName([otherWeek, day])] ??
                          dayElements[
                            getName([otherWeek, filteredDays[otherWeek][0]])
                          ],
                        scrollOffset,
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
            <span
              class="underlined-dashed cursor-pointer text-h6 text-margin-xs"
            >
              {{ getDayDisplayName(day) }}
              <q-menu auto-close>
                <q-list
                  v-for="otherDay in filteredDays[week].filter(
                    (oneDay) => oneDay != day,
                  )"
                  :key="`otherweek${otherDay}`"
                  style="min-width: 100px"
                >
                  <q-item
                    clickable
                    @click="
                      scrollToElementInParent(
                        dayElements[getName([week, otherDay])],
                        scrollOffset,
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
              @click="editWeekDayName = [week, day]"
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
                    if (val) moveDay([week, day], val);
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
                    if (val) duplicateDay([week, day], val);
                  }
                "
                :title="
                  $t('coach.program_management.builder.day_duplicate_form')
                "
                :cover="false"
                anchor="center right"
                self="center left"
              >
              </FormProgramNewWeekDay>
            </q-btn>

            <!-- Delete day -->
            <q-btn
              @click="deleteDay([week, day])"
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

        <!-- Exercise elements -->
        <div
          v-for="(exerciseData, idx) in filteredExercises[week][day]"
          :key="getName([week, day, exerciseData.order])"
          class="justify-evenly q-mb-md"
          :class="dense ? 'column items-stretch' : 'row items-start'"
        >
          <!-- Reordering arrows -->
          <div
            v-if="!dense"
            class="self-center justify-center"
            :class="dense ? 'row' : 'column'"
          >
            <q-btn
              @click="moveTable(exerciseData, -1)"
              icon="arrow_drop_up"
              flat
              dense
              :color="idx == 0 ? 'grey-5' : 'secondary'"
              :disable="idx == 0"
            />
            <q-btn
              @click="moveTable(exerciseData, +1)"
              icon="arrow_drop_down"
              flat
              dense
              :color="
                idx == filteredExercises[week][day].length - 1
                  ? 'grey-5'
                  : 'secondary'
              "
              :disable="idx == filteredExercises[week][day].length - 1"
            />
          </div>

          <!-- Exercise info -->
          <div
            :class="dense ? 'row justify-between items-end col-12' : 'col-3'"
          >
            <div
              class="q-pa-sm bg-lighter os-light-border col-8"
              :class="{
                'cursor-pointer':
                  !exercisesInfoShowExpanded[
                    getName([week, day, exerciseData.order])
                  ],
                'os-exercise-form': !dense,
                'os-exercise-form-dense': dense,
              }"
              @click="
                exercisesInfoExpanded = objectMapValues(
                  exercisesInfoExpanded,
                  () => false,
                );
                exercisesInfoExpanded[
                  getName([week, day, exerciseData.order])
                ] = true;
              "
              style="position: relative"
            >
              <q-slide-transition>
                <div
                  v-show="
                    exercisesInfoShowExpanded[
                      getName([week, day, exerciseData.order])
                    ]
                  "
                >
                  <os-select
                    use-input
                    :input-debounce="debounce"
                    :model-value="exerciseData.exercise"
                    @update:model-value="
                      (val: ProgramBuilderExerciseData['exercise']) => {
                        updateSelectedExercise(exerciseData, val);
                        updateProgramWhole(/* FIXME only interesting exercises (idScheduleInfo) */);
                      }
                    "
                    :options="exercises.map((exercise) => exercise.name)"
                    :placeholder="
                      $t('coach.program_management.builder.exercise_name')
                    "
                    hide-bottom-space
                    new-value-mode="add-unique"
                    :after-options-add-new="true"
                    :no-options-add-new="true"
                    add-option-class="text-primary text-bold text-center"
                    :add-option-format-text="
                      (text: string) =>
                        $t('coach.exercise_management.create_named_exercise', {
                          exercise: text,
                        })
                    "
                  >
                    <q-tooltip
                      v-if="!exerciseData.exercise"
                      anchor="center right"
                      self="center left"
                      :offset="[-10, 0]"
                    >
                      {{
                        $t(
                          "coach.program_management.builder.exercise_name_tooltip",
                        )
                      }}
                    </q-tooltip>
                  </os-select>
                  <q-separator color="inherit" spaced="xs" />
                  <os-select
                    use-input
                    :input-debounce="debounce"
                    :model-value="exerciseData.variant"
                    @update:model-value="
                      (val: ProgramBuilderExerciseData['variant']) => {
                        exerciseData.variant = val;
                        updateProgramWhole(/* FIXME only interesting exercises (idScheduleInfo) */);
                      }
                    "
                    :options="
                      selectedExercises[
                        getName([week, day, exerciseData.order])
                      ]?.variants?.map((variant) => ({
                        label: variant.isDefault
                          ? $t('coach.exercise_management.default_variant')
                          : variant.name,
                        value: variant.isDefault ? '' : variant.name,
                      }))
                    "
                    emit-value
                    :placeholder="
                      $t('coach.program_management.builder.variant_name')
                    "
                    hide-bottom-space
                    new-value-mode="add-unique"
                    :readonly="!exerciseData.exercise"
                    :after-options-add-new="true"
                    :no-options-add-new="true"
                    add-option-class="text-primary text-bold text-center"
                    :add-option-format-text="
                      (text: string) =>
                        $t('coach.exercise_management.create_named_variant', {
                          variant: text,
                        })
                    "
                  >
                    <q-tooltip
                      v-if="exerciseData.exercise && !exerciseData.variant"
                      anchor="center right"
                      self="center left"
                      :offset="[-10, 0]"
                    >
                      {{
                        $t(
                          "coach.program_management.builder.variant_name_tooltip",
                        )
                      }}
                    </q-tooltip>
                  </os-select>
                  <q-separator color="inherit" spaced="xs" />
                  <os-input
                    :model-value="exerciseData.note"
                    :debounce="debounce"
                    @update:model-value="
                      (val: ProgramBuilderExerciseData['note']) => {
                        exerciseData.note = val;
                        updateProgramWhole(/* FIXME only interesting exercises (idScheduleInfo) */);
                      }
                    "
                    type="textarea"
                    hide-bottom-space
                  >
                  </os-input>
                  <q-btn
                    icon="expand_less"
                    @click.stop="
                      exercisesInfoExpanded[
                        getName([week, day, exerciseData.order])
                      ] = false
                    "
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
                  v-show="
                    !exercisesInfoShowExpanded[
                      getName([week, day, exerciseData.order])
                    ]
                  "
                >
                  <p
                    class="text-secondary text-bold text-ellipsis"
                    style="max-width: 50vw"
                  >
                    {{ exerciseData.exercise }}
                    {{
                      exerciseData.variant ? " - " + exerciseData.variant : ""
                    }}
                  </p>
                  <p
                    class="text-xs text-italic text-ellipsis"
                    style="max-width: 50vw"
                  >
                    {{ exerciseData.note }}
                  </p>
                </div>
              </q-slide-transition>
            </div>
            <osButtonSupport
              :icons="['fa-regular fa-clone', 'fa-regular fa-trash-can']"
              :colors="['lighter', 'lighter']"
              :hover-colors="['info', 'negative']"
              :tooltips="[
                $t('coach.program_management.builder.line_duplicate_in_day'),
                $t('coach.program_management.builder.line_delete'),
              ]"
              @click="
                (idx: number) => {
                  switch (idx) {
                    case 0:
                      editWeekDayName = [week, day];
                      break;
                    case 1:
                      deleteTable(exerciseData);
                      break;
                    default:
                      break;
                  }
                }
              "
              :direction="dense ? 't' : 'b'"
              class="q-mx-sm"
            >
              <template #slot-0>
                <FormProgramNewWeekDay
                  v-model="editWeekDayName"
                  @save="
                    (val) => duplicateTable(exerciseData, [val[0], val[1], '0'])
                  "
                  :title="
                    $t(
                      'coach.program_management.builder.line_duplicate_in_day_form',
                    )
                  "
                  :force-save="true"
                  :cover="false"
                  anchor="center right"
                  self="center left"
                >
                </FormProgramNewWeekDay>
              </template>
            </osButtonSupport>
          </div>

          <!-- Data table -->
          <osTableSheet
            :model-value="exerciseData.data"
            @update:model-value="
              (val: ProgramBuilderExerciseData['data']) => {
                updateTableData(exerciseData, val);
                updateProgramWhole(/* FIXME only interesting exercises (idScheduleInfo) */);
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
            :childProps="{
              requestText: {
                'checked-icon': 'fa-solid fa-comment-dots',
                'unchecked-icon': 'fa-solid fa-comment-slash',
              },
              requestVideo: {
                'checked-icon': 'fa-solid fa-video',
                'unchecked-icon': 'fa-solid fa-video-slash',
              },
            }"
            :widths="
              dense
                ? {
                    load: '19%',
                    reps: '13%',
                    sets: '13%',
                    rpe: '13%',
                    note: '28%',
                    requestText: '7%',
                    requestVideo: '7%',
                  }
                : {
                    load: '10%',
                    reps: '10%',
                    sets: '10%',
                    rpe: '10%',
                    note: '46%',
                    requestText: '7%',
                    requestVideo: '7%',
                  }
            "
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
              rpe: $t(
                'coach.program_management.fields.rpe',
              ).toLocaleLowerCase(),
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
                v-if="showReferenceButton(itemProps.col.field, itemProps.value)"
                :icon="
                  exerciseData.data[itemProps.row.id][
                    (itemProps.col.field + 'Ref') as
                      | 'loadRef'
                      | 'repsRef'
                      | 'setsRef'
                      | 'rpeRef'
                  ] == undefined
                    ? 'fa-solid fa-link'
                    : undefined
                "
                :label="
                  getReferenceDisplayName(
                    exerciseData.data[itemProps.row.id][
                      (itemProps.col.field + 'Ref') as
                        | 'loadRef'
                        | 'repsRef'
                        | 'setsRef'
                        | 'rpeRef'
                    ],
                  )
                "
                color="secondary"
                size="0.7em
              "
                :flat="
                  exerciseData.data[itemProps.row.id][
                    (itemProps.col.field + 'Ref') as
                      | 'loadRef'
                      | 'repsRef'
                      | 'setsRef'
                      | 'rpeRef'
                  ] == undefined
                "
                dense
                :ripple="false"
                tabindex="-1"
                style="width: 100%"
              >
                <!-- Show list of options to select as reference -->
                <q-menu anchor="center right" self="center left">
                  <q-list style="min-width: 100px">
                    <q-item
                      v-for="[maxliftType, maxlift] in Object.entries(
                        maxliftsPerExercise[exerciseData.exercise ?? ''] ?? {},
                      ).filter(([maxliftType]) =>
                        MaxLiftTypesPerValue[
                          itemProps.col.field as
                            | 'load'
                            | 'reps'
                            | 'sets'
                            | 'rpe'
                        ].includes(maxliftType as MaxLiftType),
                      )"
                      :key="maxliftType"
                      @click="
                        onReferenceClick(maxlift, 'maxlift', {
                          exerciseData: exerciseData,
                          lineNum: itemProps.row.id,
                          field: itemProps.col.field,
                        })
                      "
                      clickable
                      v-close-popup
                      dense
                    >
                      <!-- TODO i18n -->
                      <q-item-section>{{ maxliftType }}</q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item
                      clickable
                      @click="
                        selectingReferenceLine = {
                          exerciseData: exerciseData,
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
                        exerciseData.data[itemProps.row.id][
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
                          exerciseData: exerciseData,
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

        <!-- New element buttons -->
        <div class="row items-center justify-center q-gutter-xs">
          <!-- New exercise -->
          <q-btn
            icon="add"
            :label="$t('coach.program_management.builder.new_exercise')"
            @click="addTable([week, day])"
            flat
            rounded
          >
            <q-tooltip anchor="top middle" :offset="[0, 40]" :delay="500">
              {{ $t("coach.program_management.builder.new_exercise_tooltip") }}
            </q-tooltip>
          </q-btn>

          <!-- New day -->
          <q-btn
            icon="add"
            :label="$t('coach.program_management.builder.new_day')"
            @click="addDay([week, day])"
            flat
            rounded
          >
            <q-tooltip anchor="top middle" :offset="[0, 40]" :delay="500">
              {{ $t("coach.program_management.builder.new_day_tooltip") }}
            </q-tooltip>
          </q-btn>

          <!-- New week -->
          <!-- FIXME add week -->
          <q-btn
            icon="add"
            :label="$t('coach.program_management.builder.new_week')"
            @click="addDay([week, day])"
            flat
            rounded
          >
            <q-tooltip anchor="top middle" :offset="[0, 40]" :delay="500">
              {{ $t("coach.program_management.builder.new_week_tooltip") }}
            </q-tooltip></q-btn
          >
        </div>
      </div>
    </div>

    <!-- Show something when program is empty -->
    <div v-if="exercisesValues.length == 0" class="text-center">
      <slot name="empty-program">
        <h6>
          {{ $t("coach.program_management.builder.empty") }}
        </h6>
      </slot>
      <q-btn
        icon="add"
        :label="$t('coach.program_management.builder.new_day')"
        @click="addDay(['1', '1'])"
        rounded
        unelevated
      ></q-btn>
    </div>

    <!-- Show something when filters remove any exercise -->
    <div v-else-if="objectIsEmpty(filteredExercises)" class="text-center">
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
import { ref, computed, PropType, watch, nextTick } from "vue";
import { uid } from "quasar";
import { useI18n } from "vue-i18n";
import FormProgramNewWeekDay from "@/components/forms/FormProgramNewWeekDay.vue";
import { scrollToElementInParent } from "@/helpers/scroller";
import {
  arrayFilterUndefined,
  arraySortObjectsByField,
  arrayUniqueValues,
} from "@/helpers/array";
import {
  Program,
  ProgramExercise,
  ProgramLine,
} from "@/helpers/programs/program";
import { Exercise, ExerciseVariant } from "@/helpers/exercises/exercise";
import { objectIsEmpty, objectMapValues } from "@/helpers/object";
import {
  MaxLift,
  MaxLiftType,
  MaxLiftTypesPerValue,
} from "@/helpers/maxlifts/maxlift";
import { separateMaxliftPerExerciseAndType } from "@/helpers/maxlifts/listManagement";
import { numberClamp, stringGetNext } from "@/helpers/scalar";
import mixpanel from "mixpanel-browser";
import {
  ProgramBuilderData,
  ProgramBuilderExerciseData,
} from "@/helpers/programs/builder";

// Init plugin
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
  dense: {
    type: Boolean,
    default: false,
  },
  historyMaxLength: {
    type: Number,
    default: 50,
  },
  scrollOffset: {
    type: Number,
    default: 0,
  },
  debounce: {
    type: Number,
    default: 250,
  },
});

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
  undo: undo,
  redo: redo,
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
}>({}); // references to days elements
const exercisesValues = ref<ProgramBuilderData>([]); // data of each program exercise in flat format
const programCurrentValue = ref<Program>(); // track current program, to check for external update
const editWeekDayName = ref<string[]>(); // week and/or day name that is being modified (to clone or move tables)
const selectingReferenceLine = ref<{
  exerciseData: ProgramBuilderExerciseData;
  lineNum: string;
  field: string;
}>(); // useful info to maintain while selecting a reference line
const exercisesInfoExpanded = ref<{
  [key: string]: boolean;
}>({}); // check if an exercise info table should be expanded or collapsed
const programHistory = ref<ProgramBuilderData[]>([]); // store changes to data to allow walking history
const programHistoryPointer = ref<number>(0); // pointer to current data version in history

// Extract selected exercise and variant for each table
const selectedExercises = computed<{
  [key: string]: Exercise | undefined;
}>(() =>
  Object.fromEntries(
    exercisesValues.value.map((exerciseData) => [
      getName([exerciseData.week, exerciseData.day, exerciseData.order]),
      props.exercises.find(
        (exercise) => exercise.name == exerciseData.exercise,
      ),
    ]),
  ),
);
const selectedExerciseVariants = computed<{
  [key: string]: ExerciseVariant | undefined;
}>(() =>
  Object.fromEntries(
    exercisesValues.value.map((exerciseData) => {
      const name = getName([
        exerciseData.week,
        exerciseData.day,
        exerciseData.order,
      ]);
      return [
        name,
        selectedExercises.value[name]?.variants?.find(
          (variant) => variant.name == exerciseData.variant,
        ) ?? selectedExercises.value[name]?.defaultVariant,
      ];
    }),
  ),
);

// Get maxlifts separated per exercise name and type
const maxliftsPerExercise = computed(() =>
  separateMaxliftPerExerciseAndType(props.maxlifts),
);

// Get whether each exercise info should be displayed or not
const exercisesInfoShowExpanded = computed<typeof exercisesInfoExpanded.value>(
  () =>
    Object.fromEntries(
      exercisesValues.value.map((exerciseData) => {
        const name = getName([
          exerciseData.week,
          exerciseData.day,
          exerciseData.order,
        ]);
        return [
          name,
          exercisesInfoExpanded.value[name] || !exerciseData.exercise,
        ];
      }),
    ),
);

// Get a reference to all weeks and days available
const allWeeks = computed(() =>
  arrayUniqueValues(
    exercisesValues.value.map((exerciseData) => exerciseData.week),
    true,
  ),
);
const allDays = computed(() => {
  const days = exercisesValues.value.reduce(
    (
      outDays: {
        [
          key: ProgramBuilderExerciseData["week"]
        ]: ProgramBuilderExerciseData["day"][];
      },
      exerciseData,
    ) => {
      (outDays[exerciseData.week] = outDays[exerciseData.week] || []).push(
        exerciseData.day,
      );
      return outDays;
    },
    {},
  );
  return objectMapValues(days, (daysList) => arrayUniqueValues(daysList, true));
});

// Get a reference to requested weeks and days by filter
const filteredWeeks = computed(() =>
  props.filter.week.length == 0
    ? allWeeks.value
    : allWeeks.value.filter((week) => props.filter.week.includes(week)),
);
const filteredDays = computed(() =>
  props.filter.day.length == 0
    ? allDays.value
    : objectMapValues(allDays.value, (days) =>
        days.filter((day) => props.filter.day.includes(day)),
      ),
);

// Get a subset of tables to show according to filters
const filteredExercises = computed(() => {
  return arraySortObjectsByField(exercisesValues.value, "order", Number).reduce(
    (
      out: {
        [week: string]: {
          [day: string]: ProgramBuilderExerciseData[];
        };
      },
      exerciseData,
    ) => {
      const week = exerciseData.week,
        day = exerciseData.day;

      // Ignore unwanted element
      if (
        !filteredWeeks.value.includes(week) ||
        !filteredDays.value[week].includes(day)
      )
        return out;
      if (
        props.filter.exercise.length > 0 &&
        (!exerciseData.exercise ||
          !props.filter.exercise.includes(exerciseData.exercise))
      )
        return out;

      // Store interesting element
      if (!(week in out)) out[week] = {};
      if (!(day in out[week])) out[week][day] = [];
      out[week][day].push(exerciseData);
      return out;
    },
    {},
  );
});

// Update data table on input change
watch(
  () => props.modelValue,
  () => {
    if (programCurrentValue.value != props.modelValue) resetTableData();
  },
  { immediate: true },
);

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
  // Delete previously stored values
  exercisesValues.value = [];

  // Set new exercise values
  (props.modelValue.programExercises ?? []).forEach((programExercise) => {
    // Get schedule info
    const week = String(programExercise.scheduleWeek ?? -1),
      day = String(programExercise.scheduleDay ?? -1),
      order = String(programExercise.scheduleOrder ?? -1);

    // Prepare new element
    const newExerciseData: ProgramBuilderExerciseData = {
      // schedule-related values
      week: week,
      day: day,
      order: order,

      // exercise-related values
      exercise: programExercise.exercise?.name,
      variant: programExercise.exerciseVariant?.name ?? "",
      note: programExercise.exerciseNote ?? "",

      // data-related values
      data:
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
        }) ?? [],
    };

    // Store new element
    exercisesValues.value.push(newExerciseData);
  });

  // Empty changes
  if (
    props.modelValue.uid == undefined ||
    programCurrentValue.value?.uid != props.modelValue.uid ||
    programHistory.value.length <= 1
  ) {
    programHistory.value.length = 0;
    storeChanges();
  }

  // Set current value to be equal to input one
  programCurrentValue.value = props.modelValue;
}

/**
 * FIXME Inform parent about updated program and store new changes.
 *
 * @param program instance that shall be propagated to parent.
 * @param [saveChange=true] if true, save changes in history, otherwise ignore it.
 */
function emitUpdatedProgram(program: Program, saveChange: boolean = true) {
  if (saveChange) storeChanges();
  programCurrentValue.value = program;
  emit("update:modelValue", programCurrentValue.value);
}

/**
 * Update selected exercises.
 *
 * @param exerciseData exercise data that shall be updated.
 * @param newName new name of the exercise.
 */
function updateSelectedExercise(
  exerciseData: ProgramBuilderExerciseData,
  newName?: string,
) {
  // Reset variant name
  if (exerciseData.exercise != newName) exerciseData.variant = undefined;

  // Update name
  exerciseData.exercise = newName;
}

/**
 * Update table data for an exercise in program.
 *
 * @param exerciseData exercise data that shall be updated.
 * @param data table data that shall be saved.
 */
function updateTableData(
  exerciseData: ProgramBuilderExerciseData,
  data: ProgramBuilderExerciseData["data"],
) {
  data.forEach((line) => {
    if (!Object.keys(line).includes("uid")) line.uid = getRandomUid();
  });
  exerciseData.data = data;
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
  updateProgramWhole(/* FIXME only interesting exercises (lineinfo.schedule) */);
}

/**
 * Decide whether to show reference button in a cell or not.
 *
 * @param field program field the interested cell is refers to.
 * @param value string model value in interested cell.
 */
function showReferenceButton(field: string, value: string) {
  // Show reference add button if "operation" value is not null
  return Boolean(
    new ProgramLine({
      [field + "BaseValue"]: value,
    })[
      (field + "Operation") as
        | "loadOperation"
        | "repsOperation"
        | "setsOperation"
        | "rpeOperation"
    ],
  );
}

/**
 * Move one exercise in table.
 *
 * 4 actions are possible:
 *  - If no destination is provided, exercise will be deleted.
 *  - If no exercise data is provided, a new empty table will be added in destination.
 *  - If both data and destination are provided, move selected exercise to destination.
 *  - If duplicate flag is true, clone the exercise data in destination.
 *
 * @param exerciseData data of exercise that is being affected.
 * @param destination destination week, day, and exercise order.
 * @param [duplicate=false] if true, duplicate exercise instead of moving it (ignored if any input is undefined).
 */
function moveExercise(
  exerciseData?: ProgramBuilderExerciseData,
  destination?: [string, string, string],
  duplicate: boolean = false,
) {
  // Nothing to do if both table and destination are unknown
  if (exerciseData == undefined && destination == undefined) return;

  // Clean source and destination schedule
  const source =
    exerciseData != undefined
      ? [exerciseData.week, exerciseData.day, Number(exerciseData.order)]
      : undefined;
  if (destination)
    destination[2] = numberClamp(
      Number(destination[2]),
      1,
      (getLargestOrderInDay(destination) ?? 0) + 1,
    ).toString();

  // Move any exercise between source and destination
  exercisesValues.value.forEach((value) => {
    if (
      source != undefined &&
      value.week == source[0] &&
      value.day == source[1] &&
      value.order > source[2]
    )
      value.order = String(Number(value.order) - 1);
    if (
      destination != undefined &&
      value.week == destination[0] &&
      value.day == destination[1] &&
      value.order >= destination[2]
    )
      value.order = String(Number(value.order) + 1);
  });

  if (destination == undefined) {
    // If destination is unknown, the table is being destroyed
    exercisesValues.value = exercisesValues.value.filter(
      (value) => value != exerciseData,
    );
  } else if (exerciseData == undefined) {
    // If table is unknown, a new table is being creted
    exercisesValues.value.push({
      data: [],
      exercise: undefined,
      variant: undefined,
      note: undefined,
      week: destination[0],
      day: destination[1],
      order: destination[2],
    });
  } else {
    // If both table and destination are known, table is being moved or cloned
    if (duplicate) {
      const duplicateData = duplicateBuilderExerciseValue(exerciseData, true);
      duplicateData.week = destination[0];
      duplicateData.day = destination[1];
      duplicateData.order = destination[2];
      exercisesValues.value.push(duplicateData);
    } else {
      exerciseData.week = destination[0];
      exerciseData.day = destination[1];
      exerciseData.order = destination[2];
    }
  }

  // Update program with new structure
  updateProgramWhole(/* FIXME only interesting exercises */);
}

/**
 * Move one table from one scheduling order to another, while keeping week and day schedule.
 *
 * @param exerciseData exercise data that shall be deleted.
 * @param moveBy how many positions to move the table up or down (positive to increase order, negative to decrease it).
 */
function moveTable(exerciseData: ProgramBuilderExerciseData, moveBy: number) {
  moveExercise(exerciseData, [
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
  moveExercise(exerciseData, undefined);

  // Mixpanel tracking
  mixpanel.track("Delete Exercise from Program");

  // Update program with new structure
  updateProgramWhole();
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
    const largestOrder = getLargestOrderInDay(destination);
    destination[2] = String((largestOrder ?? 0) + 1);
  }

  // Add table in selected position
  moveExercise(exerciseData, destination as [string, string, string], true);
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
    while (allDays.value[toWeek]?.includes(toDay)) {
      toDay = stringGetNext(toDay) || `${toDay}1`;
    }

  // Check if source is empty while renaming
  let isSourceEmpty = true;

  // Perform move
  exercisesValues.value.forEach((exerciseData) => {
    if (exerciseData.week == fromWeek && exerciseData.day == fromDay) {
      if (duplicate)
        duplicateTable(exerciseData, [toWeek, toDay, exerciseData.order]);
      else moveExercise(exerciseData, [toWeek, toDay, exerciseData.order]);
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
      scrollToElementInParent(
        dayElements.value[getName([toWeek, toDay])],
        props.scrollOffset,
      ),
    );

  // Update program with new naming
  updateProgramWhole(/* FIXME only interesting exercises */);
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
  moveDay(scheduleInfo, destination, true, undefined, true, doScroll);

  // Mixpanel tracking
  mixpanel.track("Duplicate Program Day");
}

/**
 * Get largest line order for lines in a day.
 *
 * @param idScheduleInfo schedule info of interesting day.
 */
function getLargestOrderInDay(
  scheduleInfo: [string, string, string?] | ProgramBuilderExerciseData,
): number | undefined {
  if (exercisesValues.value.length == 0) return undefined;
  const [week, day] =
    scheduleInfo instanceof Array
      ? scheduleInfo
      : [scheduleInfo.week, scheduleInfo.day];
  const max = Math.max(
    ...exercisesValues.value.map((value) => {
      if (value.week == week && value.day == day) return Number(value.order);
      else return -1;
    }),
  );
  if (max >= 0) return max;
  else return undefined;
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
 * Get the displayable name of a selected reference.
 *
 * @param reference reference whose name shall be retrieved.
 */
function getReferenceDisplayName(reference: ProgramLine | MaxLift | undefined) {
  // Handle unknown case
  if (!reference) return undefined;

  // Handle program line or max lift
  if (reference instanceof ProgramLine)
    return (
      "W" +
      (reference.programExercise?.scheduleWeek
        ?.toString()
        .slice(undefined, 2) ?? "-") +
      "D" +
      (reference.programExercise?.scheduleDay?.toString().slice(undefined, 2) ??
        "-") +
      "L" +
      (reference.lineOrder != undefined ? reference.lineOrder + 1 : "-")
    );
  else return reference.type ?? ""; // TODO i18n
}

/**
 * Get a duplicate of current program builder values.
 *
 * @param values if provided, duplicate supplied values, otherwise duplicate known reference.
 * @returns duplicate of current builder values.
 */
function duplicateBuilderValues(values?: ProgramBuilderData) {
  return (values ?? exercisesValues.value).map((value) => {
    return duplicateBuilderExerciseValue(value, false);
  });
}

/**
 * Get a duplicate of a program builder exercise.
 *
 * @param exerciseData data to duplicate.
 * @param [updateId=true] if true, change data id, otherwise preserve it.
 * @returns duplicate of current exercise values.
 */
function duplicateBuilderExerciseValue(
  exerciseData: ProgramBuilderExerciseData,
  updateId: boolean = true,
) {
  return {
    ...exerciseData,
    data: exerciseData.data.map((data) => {
      return { ...data, uid: updateId ? getRandomUid() : data.uid };
    }),
  };
}

/**
 * FIXME Store changes in data for successive undo/redo.
 *
 * @param data changed data value to store.
 */
function storeChanges() {
  // Store data from current pointer position
  if (programHistoryPointer.value + 1 < programHistory.value.length)
    programHistory.value.length = programHistoryPointer.value + 1;

  // Add new element up to max length
  programHistory.value.push(duplicateBuilderValues());
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
    exercisesValues.value = duplicateBuilderValues(
      programHistory.value.at(programHistoryPointer.value),
    );
  }

  // Inform about undo operation
  emit(
    "undo",
    programHistoryPointer.value > 0,
    programHistoryPointer.value + 1 < programHistory.value.length,
  );

  // Inform parent of update
  updateProgramWhole(false /* FIXME only interesting exercises */);

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
    exercisesValues.value = duplicateBuilderValues(
      programHistory.value.at(programHistoryPointer.value),
    );
  }

  // Inform about redo operation
  emit(
    "redo",
    programHistoryPointer.value + 1 < programHistory.value.length,
    programHistoryPointer.value > 0,
  );

  // Inform parent of update
  updateProgramWhole(false /* FIXME only interesting exercises */);

  return programHistoryPointer.value + 1 < programHistory.value.length;
}

/**
 * FIXME Rebuild the whole program based on the current table values.
 *
 * @param [saveChange=true] if true, save changes in history, otherwise ignore it.
 */
function updateProgramWhole(saveChange: boolean = true) {
  // Update program
  const program = props.modelValue;
  program.programExercises = [];
  exercisesValues.value.forEach((exerciseInfo) => {
    const idx = getName([
      exerciseInfo.week,
      exerciseInfo.day,
      exerciseInfo.order,
    ]);

    program.programExercises!.push(
      new ProgramExercise({
        program: program,
        scheduleWeek: exerciseInfo.week,
        scheduleDay: exerciseInfo.day,
        scheduleOrder: Number(exerciseInfo.order),
        exercise: selectedExercises.value[idx],
        exerciseVariant: selectedExerciseVariants.value[idx],
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
  });

  // // FIXME See if new exercise or variant is required
  // if (
  //   optionallyCreateNewExercise(
  //     exercisesValues.value[idx].exercise,
  //     exercisesValues.value[idx].variant,
  //     programExercise,
  //   )
  // )
  //   // New exercise or variant: parent is in charge of updating program
  //   return;

  // Inform parent of update
  emitUpdatedProgram(program, saveChange);
}

/**
 * If there is the need, ask creation of new exercise or variant.
 *
 * @param exerciseName name of new exercise that might be created, or parent exercise of variant that might be created.
 * @param variantName optional name of new variant that might be created.
 */
// FIXME
// eslint-disable-next-line
function optionallyCreateNewExercise(
  exerciseName?: string,
  variantName?: string,
  programExercise?: ProgramExercise,
): boolean {
  // Exercise must be provided
  if (!exerciseName) return false;

  // Check if any exercise with requested name
  const foundExercise = props.exercises.find(
    (exercise) => exercise.name?.toLowerCase() == exerciseName.toLowerCase(),
  );
  if (!foundExercise) {
    emit("newExercise", exerciseName, programExercise);
    return true;
  }

  // Check if any variant with requested name
  if (
    variantName &&
    !foundExercise.variants?.some(
      (variant) => variant.name?.toLowerCase() == variantName.toLowerCase(),
    )
  ) {
    emit("newVariant", exerciseName, variantName, programExercise);
    return true;
  }

  return false;
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
</script>

<style scoped lang="scss">
.os-light-border {
  border: 1px solid $light;
}

.os-exercise-form {
  border-radius: 10px 0 0 10px;
  margin-inline-end: -1px;
}

.os-exercise-form-dense {
  border-radius: 10px 10px 0 0;
  margin-block-end: -1px;
}
</style>
