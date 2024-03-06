<template>
  <div>
    <!-- Exercise elements -->
    <div
      class="justify-evenly q-px-sm q-mb-md"
      :class="dense ? 'column items-stretch' : 'row items-start'"
    >
      <!-- Reordering arrows -->
      <div
        v-if="!dense"
        class="self-center justify-center"
        :class="dense ? 'row' : 'column'"
      >
        <q-btn
          @click="emit('move', false)"
          icon="arrow_drop_up"
          flat
          dense
          :color="canMoveUp ? 'secondary' : 'grey-5'"
          :disable="!canMoveUp"
        />
        <q-btn
          @click="emit('move', true)"
          icon="arrow_drop_down"
          flat
          dense
          :color="canMoveDown ? 'secondary' : 'grey-5'"
          :disable="!canMoveDown"
        />
      </div>

      <!-- Exercise info -->
      <div :class="dense ? 'row justify-between items-end col-12' : 'col-3'">
        <div
          class="q-pa-sm bg-lighter os-light-border col-8"
          :class="{
            'cursor-pointer': !showExpanded,
            'os-exercise-form': !dense,
            'os-exercise-form-dense': dense,
          }"
          @click="showExpanded = true"
          style="position: relative"
        >
          <q-slide-transition>
            <div v-show="showExpanded">
              <os-select
                use-input
                :input-debounce="debounce"
                v-model="exerciseName"
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
                  v-if="!exerciseName"
                  anchor="center right"
                  self="center left"
                  :offset="[-10, 0]"
                >
                  {{
                    $t("coach.program_management.builder.exercise_name_tooltip")
                  }}
                </q-tooltip>
              </os-select>
              <q-separator color="inherit" spaced="xs" />
              <os-select
                use-input
                :input-debounce="debounce"
                v-model="variantName"
                :options="
                  programExercise.exercise?.variants?.map((variant) => ({
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
                :readonly="!programExercise.exercise"
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
                  v-if="
                    programExercise.exercise && !programExercise.exerciseVariant
                  "
                  anchor="center right"
                  self="center left"
                  :offset="[-10, 0]"
                >
                  {{
                    $t("coach.program_management.builder.variant_name_tooltip")
                  }}
                </q-tooltip>
              </os-select>
              <q-separator color="inherit" spaced="xs" />
              <os-input
                :model-value="programExercise.exerciseNote"
                @update:model-value="
                  (val) => {
                    programExercise.exerciseNote = (val ?? '').toString();
                    emitProgramExercise();
                  }
                "
                :debounce="debounce"
                type="textarea"
                :placeholder="$t('coach.program_management.builder.note_name')"
                hide-bottom-space
              >
              </os-input>
              <q-btn
                icon="expand_less"
                @click.stop="showExpanded = false"
                flat
                dense
                color="secondary"
                class="full-width"
                :ripple="false"
              />
            </div>
          </q-slide-transition>

          <q-slide-transition>
            <div v-show="!showExpanded">
              <p
                class="text-secondary text-bold text-ellipsis"
                style="max-width: 50vw"
              >
                {{ exerciseName }}
                {{ variantName ? " - " + variantName : "" }}
              </p>
              <p
                class="text-xs text-italic text-ellipsis"
                style="max-width: 50vw"
              >
                {{ programExercise.exerciseNote }}
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
                  editWeekDayName = [
                    programExercise.scheduleWeek
                      ? String(programExercise.scheduleWeek)
                      : '',
                    programExercise.scheduleDay
                      ? String(programExercise.scheduleDay)
                      : '',
                  ];
                  break;
                case 1:
                  emit('delete');
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
              @save="(val) => emit('duplicate', val[0], val[1])"
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
        v-model="exerciseData"
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
          load: $t('coach.program_management.fields.load').toLocaleLowerCase(),
          reps: $t('coach.program_management.fields.reps').toLocaleLowerCase(),
          sets: $t('coach.program_management.fields.sets').toLocaleLowerCase(),
          rpe: $t('coach.program_management.fields.rpe').toLocaleLowerCase(),
          note: $t('coach.program_management.fields.note').toLocaleLowerCase(),
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
          (_1: any, _2: any, idx: number) => {
            if (programExercise.lines?.at(idx))
              emit('selectReference', programExercise.lines.at(idx)!);
          }
        "
        dense
        :debounce="debounce"
        class="col os-light-border"
      >
        <template #item="itemProps">
          <q-btn
            v-if="showReferenceButton(itemProps.col.field, itemProps.value)"
            :icon="
              exerciseData[itemProps.row.id][
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
                exerciseData[itemProps.row.id][
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
              exerciseData[itemProps.row.id][
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
                    maxlifts[exerciseName ?? ''] ?? {},
                  ).filter(([maxliftType]) =>
                    MaxLiftTypesPerValue[
                      itemProps.col.field as 'load' | 'reps' | 'sets' | 'rpe'
                    ].includes(maxliftType as MaxLiftType),
                  )"
                  :key="maxliftType"
                  @click="
                    assignReference(
                      programExercise.lines!.at(itemProps.rowIndex)!,
                      maxlift,
                      itemProps.col.field,
                    );
                    emitProgramExercise();
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
                    emit(
                      'requireReference',
                      programExercise.lines!.at(itemProps.row.id)!,
                      itemProps.col.field,
                    )
                  "
                  v-close-popup
                  dense
                >
                  <q-item-section>{{
                    $t("coach.program_management.builder.reference_select_line")
                  }}</q-item-section>
                </q-item>
                <q-separator />
                <q-item
                  v-if="
                    exerciseData[itemProps.row.id][
                      (itemProps.col.field + 'Ref') as
                        | 'loadRef'
                        | 'repsRef'
                        | 'setsRef'
                        | 'rpeRef'
                    ] != undefined
                  "
                  clickable
                  @click="
                    assignReference(
                      programExercise.lines!.at(itemProps.rowIndex)!,
                      undefined,
                      itemProps.col.field,
                    );
                    emitProgramExercise();
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
  </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent, computed } from "vue";
import { ProgramExercise, ProgramLine } from "@/helpers/programs/program";
import {
  type MaxLift,
  type MaxLiftType,
  MaxLiftTypesPerValue,
} from "@/helpers/maxlifts/maxlift";
import {
  assignReference,
  programLinesToTable,
  tableToProgramLines,
} from "@/helpers/programs/builder";
import { Exercise } from "@/helpers/exercises/exercise";
import {
  getExerciseByName,
  getExerciseVariantByName,
} from "@/helpers/exercises/listManagement";

// Import components
const FormProgramNewWeekDay = defineAsyncComponent(
  () => import("@/components/forms/FormProgramNewWeekDay.vue"),
);

// Define props
const props = withDefaults(
  defineProps<{
    // Builder data to display
    modelValue: ProgramExercise;

    // Available exercises and maxlifts
    exercises?: Exercise[];
    maxlifts?: {
      [key: string]: { [type in MaxLiftType]?: MaxLift | undefined };
    };

    // Optional list of existing weeks and days other than selected week and day
    navigateWeeks?: string[];
    navigateDays?: string[];

    // Whether table can be moved up and down (enables related emit)
    canMoveUp?: boolean;
    canMoveDown?: boolean;

    // Whether exercise info should be expanded or collapsed
    expanded?: boolean;

    // Whether component should be dense (less and closer elements)
    dense?: boolean;

    // Debounce input elements by provided amount (ms)
    debounce?: number;
  }>(),
  {
    exercises: () => [],
    maxlifts: () => ({}),
    filter: () => [],
    canMoveUp: true,
    canMoveDown: true,
    expanded: false,
    dense: false,
    debounce: 200,
  },
);

// Define emits
const emit = defineEmits<{
  "update:modelValue": [programExercise: ProgramExercise];
  "update:expanded": [expanded: boolean];
  duplicate: [week: string, day: string];
  delete: [];
  move: [down: boolean];
  newExercise: [exerciseName: string];
  newVariant: [variantName: string];
  requireReference: [line: ProgramLine, field: string];
  selectReference: [line: ProgramLine];
}>();

// Set ref
const editWeekDayName = ref<string[]>(); // week and/or day name that is being modified (to clone or move tables)

// Retrieve and supply current program exercise
const programExercise = computed(() => props.modelValue);
function emitProgramExercise() {
  emit("update:modelValue", programExercise.value);
}

// Program exercise lines in tabular format
const exerciseData = computed({
  get: () =>
    programExercise.value.lines
      ? programLinesToTable(programExercise.value.lines)
      : [],
  set: (data) => {
    programExercise.value.lines = tableToProgramLines(
      data,
      programExercise.value,
    );
    emitProgramExercise();
  },
});

// Store exercise name
const exerciseName = computed({
  get: () => programExercise.value.exercise?.name,
  set: (name) => {
    // Update only if required
    if (programExercise.value.exercise?.name != name) {
      // Set exercise
      programExercise.value.exercise = name
        ? getExerciseByName(props.exercises, name)
        : undefined;

      // Select default variant
      programExercise.value.exerciseVariant =
        programExercise.value.exercise?.defaultVariant;

      // Check if exercise is new
      if (name && programExercise.value.exercise == undefined)
        emit("newExercise", name);

      emitProgramExercise();
    }
  },
});

// Store variant name
const variantName = computed({
  get: () => programExercise.value.exerciseVariant?.name,
  set: (name) => {
    // Update only if required
    if (programExercise.value.exerciseVariant?.name != name) {
      // Set variant
      programExercise.value.exerciseVariant =
        name && programExercise.value.exercise?.variants
          ? getExerciseVariantByName(
              programExercise.value.exercise?.variants,
              name,
            )
          : undefined;

      // Check if exercise is new
      if (name && programExercise.value.exerciseVariant == undefined)
        emit("newVariant", name);

      emitProgramExercise();
    }
  },
});

// Check whether exercise info should be shown expanded or not
const showExpanded = computed({
  get: () => props.expanded || !programExercise.value.exercise,
  set: (val) => {
    emit("update:expanded", val);
  },
});

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
