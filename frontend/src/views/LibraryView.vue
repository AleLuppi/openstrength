<template>
  <div class="q-pa-md">
    <!-- Title -->
    <h2 class="col">{{ $t("layout.views.library_title") }}</h2>

    <!-- Navigation -->
    <q-tabs v-model="selectedTab" class="text-dark q-pa-md">
      <q-tab
        v-for="tab in ['exercise', 'schedule']"
        :key="tab"
        :name="tab"
        :label="$t('coach.' + tab + '_management.list.title')"
      />
    </q-tabs>

    <q-tab-panels v-model="selectedTab">
      <!-- First tab: Exercises -->
      <q-tab-panel name="exercise">
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
              />
            </q-card>
          </div>

          <!-- List variants -->
          <!-- TODO card or pagination -->
          <div class="col-12 col-sm-6">
            <q-card>
              <!-- TODO hide everything if exercise is not selected -->

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
              />
            </q-card>
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
                      (selectedVariant ? "update" : "add"),
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
                :variant="selectedVariantToForm"
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
      </q-tab-panel>

      <!-- Second tab: Programs -->
      <q-tab-panel name="schedule">
        <!-- Display programs -->
        <q-card>
          <q-card-section>
            <h6>
              {{ $t("coach.schedule_management.list.title_program") }}
            </h6>

            <div class="row q-gutter-x-md items-center">
              <os-input
                v-model="searchProgram"
                :placeholder="
                  $t('coach.schedule_management.list.search_program')
                "
                hide-bottom-space
                debounce="500"
                class="col"
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </os-input>

              <!-- Add new programm -->
              <q-btn
                icon="add"
                :label="
                  $q.screen.gt.sm
                    ? $t('coach.schedule_management.list.add')
                    : undefined
                "
                @click="
                  updatingProgram = undefined;
                  showProgramDialog = true;
                "
              />
            </div>
          </q-card-section>

          <q-separator />

          <TableProgramLibrary
            :programs="programs"
            :on-update="onUpdateProgram"
          />
        </q-card>

        <!-- Dialog to add a new athlete -->
        <q-dialog
          v-model="showProgramDialog"
          @hide="updatingProgram ? clearProgram() : {}"
        >
          <q-card class="q-pa-sm dialog-min-width">
            <q-card-section class="row items-center q-pb-none">
              <h5>
                {{
                  updatingProgram
                    ? $t("coach.schedule_management.list.update")
                    : $t("coach.schedule_management.list.add")
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

            <q-form
              @submit="updatingProgram ? updateProgram() : createProgram()"
              @reset="clearProgram"
              class="q-my-md q-gutter-sm column"
            >
              <q-card-section class="q-gutter-x-xs">
                <os-input
                  v-model="programName"
                  required
                  :label="$t('coach.schedule_management.fields.name')"
                ></os-input>
                <os-input
                  v-model="programLabel"
                  :label="$t('coach.schedule_management.fields.label')"
                ></os-input>
              </q-card-section>

              <q-card-actions align="right">
                <q-btn flat :label="$t('common.cancel')" type="reset" />
                <q-btn
                  :label="
                    updatingProgram
                      ? $t('coach.schedule_management.list.update_proceed')
                      : $t('coach.schedule_management.list.add_proceed')
                  "
                  type="submit"
                />
              </q-card-actions>
            </q-form>
          </q-card>
        </q-dialog>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { useUserStore } from "@/stores/user";
import { useCoachInfoStore } from "@/stores/coachInfo";
import TableExerciseLibrary from "@/components/tables/TableExerciseLibrary.vue";
import TableProgramLibrary from "@/components/tables/TableProgramLibrary.vue";
import FormExerciseVariantLibrary from "@/components/forms/FormExerciseVariantLibrary.vue";
import {
  Exercise,
  ExerciseVariant,
  reduceExercises,
} from "@/helpers/exercises/exercise";
import { Program } from "@/helpers/programs/program";

// Use plugins
const $q = useQuasar();
const i18n = useI18n();

// Get store
const user = useUserStore();
const coachInfo = useCoachInfoStore();

// Set ref
const selectedTab = ref("exercise"); // TODO main tab to show
const exerciseTableElement = ref<typeof TableExerciseLibrary>();
const searchExercise = ref<string>(); // TODO search
const searchVariant = ref<string>(); // TODO search
const addingNewExercise = ref(false);
const addingNewVariant = ref(false);
const deletingExercise = ref<Exercise>();
const deletingVariant = ref<ExerciseVariant>();
const showDialogDelete = ref(false);
const selectedExercise = ref<Exercise>();
const selectedVariant = ref<ExerciseVariant>();
const selectedVariantToForm = computed(
  () =>
    selectedVariant.value ??
    new ExerciseVariant({ exercise: selectedExercise.value }),
);
const updatingProgram = ref<Program>(); // TODO check Program that is currently being updated
const showProgramDialog = ref(false); // TODO check whether to show dialog to add Program
const programName = ref(""); // TODO check new program name
const programLabel = ref(""); // TODO check new program note
const searchProgram = ref<string>(); // TODO check TODO search
// TODO const showVariantList = computed(() => Boolean(selectedExercise.value));
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
const exercises = computed<Exercise[]>(() => {
  coachInfo.loadExercises(user.uid, true);
  return coachInfo.exercises || [];
});

// Get programs to display
const programs = computed(() => {
  coachInfo.loadPrograms(user.uid, true);
  return coachInfo.programs || [];
});

// Get options to display on variant creation or update
const exerciseMuscleGroupsOptions = computed(() => {
  return [
    ...new Set(
      exercises.value.reduce(
        (outList, exercise) => outList.concat(exercise.muscleGroups),
        [] as string[],
      ),
    ),
  ].sort();
});
const exerciseEquipmentOptions = computed(() => {
  return [
    ...new Set(
      exercises.value.reduce(
        (outList, exercise) => outList.concat(exercise.equipment),
        [] as string[],
      ),
    ),
  ].sort();
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
      showDialogVariantForm.value = true;
      // TODO put in a separate method
      // Inform user about exercise successfully saved
      $q.notify({
        type: "positive",
        message: i18n.t("coach.exercise_management.add_success", {
          exercise: newExercise?.name,
        }),
        position: "bottom",
      });
      selectedExercise.value = newExercise;
    },
    onError: () => {
      // TODO put in a separate method
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
      onSuccess: () =>
        $q.notify({
          type: "positive",
          message: i18n.t("coach.exercise_management.update_success", {
            exercise: exercise?.name,
            variant: variant.name,
          }),
          position: "bottom",
        }),
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
    },
  });
}

/**
 * Actually delete the selected variant.
 *
 * @param variant element that shall be removed.
 */
function deleteVariant(variant: ExerciseVariant) {
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
function createProgram() {
  const newProgram = new Program({
    name: programName.value,
    label: programLabel.value,
  });
  newProgram.saveNew({
    onSuccess: () => {
      (coachInfo.programs = coachInfo.programs || []).push(newProgram);
      clearProgram();
    },
    onError: () =>
      $q.notify({
        type: "negative",
        message: i18n.t("coach.schedule_management.list.add_error"),
        position: "bottom",
      }),
  });
  showProgramDialog.value = false;
}

/** TODO check
 * Update program according to inserted values.
 */
function updateProgram() {
  if (updatingProgram.value) {
    updatingProgram.value.name = programName.value;
    updatingProgram.value.label = programLabel.value;
    updatingProgram.value.saveUpdate({
      onSuccess: () => {
        clearProgram();
      },
      onError: () =>
        $q.notify({
          type: "negative",
          message: i18n.t("coach.schedule_management.list.update_error"),
          position: "bottom",
        }),
    });
    showProgramDialog.value = false;
  }
}

/** TODO check
 * Compile form with program info to allow coach to update them.
 *
 * @param program
 */
function onUpdateProgram(program: Program) {
  updatingProgram.value = program;
  showProgramDialog.value = true;
  programName.value = program.name ?? "";
  programLabel.value = program.label ?? "";
}

/** TODO check
 * Clear values in program insertion form.
 */
function clearProgram() {
  programName.value = "";
  programLabel.value = "";
  showProgramDialog.value = false;
}
</script>
