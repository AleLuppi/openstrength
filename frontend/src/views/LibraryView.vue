<template>
  <q-page class="q-pa-md">
    <!-- Excercise cards -->
    <div class="row q-col-gutter-x-md">
      <!-- List exercises -->
      <div class="col-12 col-sm-6">
        <q-card>
          <q-card-section>
            <h6>
              {{ $t("coach.exercise_management.list.title_exercise") }}
            </h6>

            <div class="row q-gutter-x-md items-center">
              <os-input
                v-model="searchExercise"
                :placeholder="
                  $t('coach.exercise_management.list.search_exercise')
                "
                hide-bottom-space
                debounce="500"
                class="col"
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </os-input>

              <q-btn
                :icon="$q.screen.gt.sm ? undefined : 'add'"
                :label="
                  $q.screen.gt.sm
                    ? $t('coach.exercise_management.add_button')
                    : undefined
                "
                color="button-primary"
                @click="onNewExercise"
              />
            </div>
          </q-card-section>

          <q-separator />

          <TableExerciseLibrary
            ref="exerciseTableElement"
            :exercises="exercises"
            :on-add="onExerciseAdd"
            :on-update="onExerciseUpdate"
            :on-delete="onExerciseDelete"
            :add-new="addingNewExercise"
            :filter="searchExercise"
          />
        </q-card>
      </div>

      <!-- List variants -->
      <!-- TODO card or pagination -->
      <div v-if="Boolean(selectedExercise)" class="col-12 col-sm-6">
        <!-- Show card when an exercise is selected -->
        <q-card>
          <q-card-section>
            <h6>
              {{ $t("coach.exercise_management.list.title_variant") }}
            </h6>

            <div class="row q-gutter-x-md items-center">
              <os-input
                v-model="searchVariant"
                :placeholder="
                  $t('coach.exercise_management.list.search_variant')
                "
                hide-bottom-space
                debounce="500"
                class="col"
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </os-input>

              <q-btn
                :icon="$q.screen.gt.sm ? undefined : 'add'"
                :label="
                  $q.screen.gt.sm
                    ? $t('coach.exercise_management.add_button')
                    : undefined
                "
                color="button-primary"
                @click="onNewVariant"
              />
            </div>
          </q-card-section>

          <q-separator />

          <TableExerciseLibrary
            :exercises="[]"
            :variants="selectedExercise?.variants"
            :on-update="onVariantUpdate"
            :on-delete="onVariantDelete"
            :filter="searchVariant"
          />
        </q-card>
      </div>

      <!-- Show text when no exercise is selected -->
      <div v-else class="col-12 col-sm-6">
        <div class="row flex-center" style="height: 100%">
          <div class="row">
            <q-icon
              name="fa-regular fa-hand-pointer"
              size="2rem"
              color="light-dark"
              class="q-px-md"
            ></q-icon>
            <p>
              {{ $t("coach.exercise_management.no_selected_exercises") }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog to create or update variant -->
    <q-dialog v-model="showDialogVariantForm" @hide="clearVariant">
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <h5>
            {{
              $t(
                "coach.exercise_management." +
                  (addingNewVariant ? "add" : "update"),
              )
            }}
          </h5>

          <q-space />
          <q-btn
            icon="close"
            flat
            round
            dense
            color="button-negative"
            v-close-popup
          />
        </q-card-section>

        <q-card-section>
          <FormExerciseVariantLibrary
            ref="variantFormElement"
            v-if="selectedVariant"
            :variant="selectedVariant"
            :on-submit="onVariantSubmit"
            :options-muscle-groups="exerciseMuscleGroupsOptions"
            :options-equipment="exerciseEquipmentOptions"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog delete an exercise or variant -->
    <q-dialog
      v-model="showDialogDelete"
      @hide="
        deletingExercise = undefined;
        deletingVariant = undefined;
      "
    >
      <q-card class="q-pa-sm dialog-min-width">
        <q-card-section class="row items-center q-pb-none">
          <p>
            {{
              deletingExercise
                ? $t("coach.exercise_management.delete_exercise_confirm", {
                    exercise: deletingExercise?.name,
                  })
                : deletingVariant?.isDefault
                ? $t(
                    "coach.exercise_management.delete_variant_default_confirm",
                    {
                      exercise: deletingVariant?.exercise?.name,
                    },
                  )
                : $t("coach.exercise_management.delete_variant_confirm", {
                    variant: deletingVariant?.name,
                    exercise: deletingVariant?.exercise?.name,
                  })
            }}
          </p>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            :label="$t('common.cancel')"
            type="reset"
            color="button-negative"
            v-close-popup
          />
          <q-btn
            :label="$t('coach.exercise_management.delete_proceed')"
            @click="
              if (deletingExercise) deleteExercise(deletingExercise);
              if (deletingVariant) deleteVariant(deletingVariant);
            "
            color="button-negative"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { useCoachInfoStore } from "@/stores/coachInfo";
import TableExerciseLibrary from "@/components/tables/TableExerciseLibrary.vue";
//import TableProgramLibrary from "@/components/tables/TableProgramLibrary.vue";
import FormExerciseVariantLibrary from "@/components/forms/FormExerciseVariantLibrary.vue";
import { Exercise, ExerciseVariant } from "@/helpers/exercises/exercise";
//import { Program } from "@/helpers/programs/program";
import { reduceExercises } from "@/helpers/exercises/listManagement";
import { arrayUniqueValues } from "@/helpers/array";
import { event } from "vue-gtag";

// Use plugins
const $q = useQuasar();
const i18n = useI18n();

// Get store
const coachInfo = useCoachInfoStore();

// Set ref
//const selectedTab = ref("exercise"); // TODO main tab to show
const exerciseTableElement = ref<typeof TableExerciseLibrary>();
const variantFormElement = ref<typeof FormExerciseVariantLibrary>();
const searchExercise = ref<string>();
const searchVariant = ref<string>();
const addingNewExercise = ref(false);
const addingNewVariant = ref(false);
const deletingExercise = ref<Exercise>();
const deletingVariant = ref<ExerciseVariant>();
const showDialogDelete = ref(false);
const selectedExercise = ref<Exercise>();
const selectedVariant = ref<ExerciseVariant>();
//const updatingProgram = ref<Program>(); // TODO check Program that is currently being updated
//const showProgramDialog = ref(false); // TODO check whether to show dialog to add Program
//const programName = ref(""); // TODO check new program name
//const programLabel = ref(""); // TODO check new program note
//const searchProgram = ref<string>();
const showVariantForm = computed(() =>
  Boolean(addingNewVariant.value || selectedVariant.value),
);
const showDialogVariantForm = ref(false);

// Update dialog show status
watch(showVariantForm, (val) => (showDialogVariantForm.value = val));

// Update table selection
watch(selectedExercise, (exercise) =>
  nextTick(
    () => exerciseTableElement.value?.selectRowByName(exercise?.name, true),
  ),
);

// Get exercises to display
const exercises = computed<Exercise[]>(() => coachInfo.exercises || []);

// Get programs to display
//const programs = computed(() => coachInfo.programs || []);

// Get options to display on variant creation or update
const exerciseMuscleGroupsOptions = computed(() => {
  return arrayUniqueValues(
    exercises.value.reduce(
      (outList, exercise) => outList.concat(exercise.muscleGroups),
      [] as string[],
    ),
  );
});
const exerciseEquipmentOptions = computed(() => {
  return arrayUniqueValues(
    exercises.value.reduce(
      (outList, exercise) => outList.concat(exercise.equipment),
      [] as string[],
    ),
  );
});

// Show dialog deleting dialog when required
watch([deletingExercise, deletingVariant], ([_newExercise, _newVariant]) => {
  if (_newExercise || _newVariant) showDialogDelete.value = true;
});

/**
 * Show dialog to add a new exercise.
 */
function onNewExercise() {
  clearExercise();
  addingNewExercise.value = true;
}

/**
 * Add a new exercise to the list.
 *
 * @param exerciseName name that shall be used when creating the exercise.
 */
function onExerciseAdd(exerciseName: string) {
  addingNewExercise.value = false;

  // Ensure a name for a new exercise is provided
  if (!exerciseName) return;

  // Check if exercise already exists
  const existentExercise = exercises.value.find(
    (exercise) => exercise.name == exerciseName,
  );
  if (existentExercise) {
    selectedExercise.value = existentExercise;
    return;
  }

  // Save new exercise
  const newExercise = new Exercise({
    name: exerciseName,
  });
  newExercise.saveNew({
    onSuccess: () => {
      coachInfo.exercises = reduceExercises(
        [newExercise].concat(coachInfo.exercises || []),
      );
      selectedVariant.value = newExercise.defaultVariant;
      showDialogVariantForm.value = true;

      // Inform user about exercise successfully saved
      $q.notify({
        type: "positive",
        message: i18n.t("coach.exercise_management.add_success", {
          exercise: newExercise?.name,
        }),
        position: "bottom",
      });
      selectedExercise.value = newExercise;

      // Register GA4 event
      event("new_exercise_added", {
        event_category: "documentation",
        event_label: "New Exercise Added to Library",
        value: 1,
      });
    },
    onError: () => {
      // Inform user about error while saving exercise
      $q.notify({
        type: "negative",
        message: i18n.t("coach.exercise_management.add_error"),
        position: "bottom",
      });
    },
  });
}

/**
 * Allow exercise modification.
 *
 * @param exerciseOrAny might be exercise to be updated, requires type check.
 * @param row optional row of the table where exercise was selected.
 */
function onExerciseUpdate(
  exerciseOrAny: Exercise | any,
  row?: { [key: string]: any; name?: string },
) {
  if (exerciseOrAny instanceof Exercise) selectedExercise.value = exerciseOrAny;
  else
    selectedExercise.value = exercises.value.find(
      (exercise) => exercise.name && exercise.name == row?.name,
    );
}

/**
 * Delete one exercise from list, upon confirmation.
 *
 * @param exercise element that needs to be deleted.
 */
function onExerciseDelete(exercise: Exercise) {
  deletingExercise.value = exercise;
}

/**
 * Show dialog to add a new variant.
 */
function onNewVariant() {
  clearVariant();
  addingNewVariant.value = true;
  selectedVariant.value = new ExerciseVariant({
    name: i18n.t("coach.exercise_management.fields.variant"),
    exercise: selectedExercise.value,
    loadType: selectedExercise.value?.defaultVariant?.loadType,
    muscleGroups: selectedExercise.value?.defaultVariant?.muscleGroups,
    equipment: selectedExercise.value?.defaultVariant?.equipment,
  });
}

/**
 * Submit new or updated variant.
 */
function onVariantSubmit(variant: ExerciseVariant) {
  const exercise = variant.exercise ?? selectedExercise.value;
  if (addingNewVariant.value)
    variant.saveNew({
      onSuccess: () => {
        exercise?.variants?.unshift(variant);
        clearVariant();
        nextTick(() => onNewVariant());
        $q.notify({
          type: "positive",
          message: i18n.t("coach.exercise_management.add_success", {
            exercise: variant.name,
          }),
          position: "bottom",
        });
      },
      onError: () =>
        $q.notify({
          type: "negative",
          message: i18n.t("coach.exercise_management.add_error"),
          position: "bottom",
        }),
    });
  else
    variant.saveUpdate({
      // No need to update variant on success as it's done directly in form
      onSuccess: () => {
        clearVariant();
        $q.notify({
          type: "positive",
          message: i18n.t("coach.exercise_management.update_success", {
            exercise: exercise?.name,
            variant: variant.name,
          }),
          position: "bottom",
        });

        // Register GA4 event
        event("variant_updated", {
          event_category: "documentation",
          event_label: "Variant Added or Updated in Library",
          value: 1,
        });
      },
      onError: () =>
        $q.notify({
          type: "negative",
          message: i18n.t("coach.exercise_management.update_error"),
          position: "bottom",
        }),
    });
}

/**
 * Allow variant modification.
 *
 * @param variantOrAny might be variant to be updated, requires type check.
 * @param row optional row of the table where variant was selected.
 */
function onVariantUpdate(
  variantOrAny: ExerciseVariant | any,
  row?: { [key: string]: any; name?: string },
) {
  if (variantOrAny instanceof ExerciseVariant)
    selectedVariant.value = variantOrAny;
  else
    selectedVariant.value = selectedExercise.value?.variants?.find(
      (variant) => variant.name == row?.name,
    );
}

/**
 * Delete one variant from list, upon confirmation.
 *
 * @param variant element that needs to be deleted.
 */
function onVariantDelete(variant: ExerciseVariant) {
  deletingVariant.value = variant;
}

/**
 * Actually delete the selected exercise.
 *
 * @param exercise element that shall be removed.
 */
function deleteExercise(exercise: Exercise) {
  exercise.remove({
    onSuccess: () => {
      coachInfo.exercises = coachInfo.exercises?.filter(
        (coachExercise) => coachExercise != exercise,
      );
      clearExercise();

      // Register GA4 event
      event("exercise_deleted", {
        event_category: "documentation",
        event_label: "Exercise Deleted from Library",
        value: 1,
      });
    },
  });
}

/**
 * Actually delete the selected variant.
 *
 * @param variant element that shall be removed.
 */
function deleteVariant(variant: ExerciseVariant) {
  // Delete exercise if default variant is being removed
  if (variant.isDefault) {
    if (variant.exercise) deleteExercise(variant.exercise);
    return;
  }

  // Delete variant
  variant.remove({
    onSuccess: () => {
      if (variant.exercise)
        variant.exercise.variants = variant.exercise.variants?.filter(
          (coachVariant) => coachVariant != variant,
        );
      coachInfo.exercises = coachInfo.exercises?.filter(
        (coachExercise) =>
          coachExercise.variants && coachExercise.variants.length > 0,
      );
      clearVariant();

      // Register GA4 event
      event("variant_deleted", {
        event_category: "documentation",
        event_label: "Variant Deleted from Library",
        value: 1,
      });
    },
  });
}

/**
 * Clear exercise form and hide it.
 */
function clearExercise() {
  addingNewExercise.value = false;
  selectedExercise.value = undefined;
  deletingExercise.value = undefined;
  clearVariant();
}

/**
 * Clear variant form and hide it.
 */
function clearVariant() {
  addingNewVariant.value = false;
  selectedVariant.value = undefined;
  deletingVariant.value = undefined;
}

/** TODO check
 * Create a new program and assign to a coach
 */
/* function createProgram() {
  const newProgram = new Program({
    name: programName.value,
    labels: [programLabel.value], // TODO multiple labels
  });
  newProgram.saveNew({
    onSuccess: () => {
      (coachInfo.programs = coachInfo.programs || []).push(newProgram);
      clearProgram();
    },
    onError: () =>
      $q.notify({
        type: "negative",
        message: i18n.t("coach.program_management.list.add_error"),
        position: "bottom",
      }),
  });
  showProgramDialog.value = false;
} */

/** TODO check
 * Update program according to inserted values.
 */
/* function updateProgram() {
  if (updatingProgram.value) {
    updatingProgram.value.name = programName.value;
    updatingProgram.value.labels = [programLabel.value]; // TODO multiple labels
    updatingProgram.value.saveUpdate({
      onSuccess: () => {
        clearProgram();
      },
      onError: () =>
        $q.notify({
          type: "negative",
          message: i18n.t("coach.program_management.list.update_error"),
          position: "bottom",
        }),
    });
    showProgramDialog.value = false;
  }
} */

/** TODO check
 * Compile form with program info to allow coach to update them.
 *
 * @param program
 */
/* function onUpdateProgram(program: Program) {
  updatingProgram.value = program;
  showProgramDialog.value = true;
  programName.value = program.name ?? "";
  programLabel.value = program.labels?.[0] ?? ""; // TODO multiple labels
} */

/** TODO check
 * Clear values in program insertion form.
 */
/* function clearProgram() {
  programName.value = "";
  programLabel.value = "";
  showProgramDialog.value = false;
} */
</script>
