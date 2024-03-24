<template>
  <q-page class="q-pa-md" style="height: 0">
    <!-- Excercise cards -->
    <div class="row q-col-gutter-x-md">
      <!-- List exercises -->
      <div class="col-12 col-sm-6">
        <q-card>
          <q-card-section class="q-pb-sm">
            <div class="row justify-between q-mb-sm">
              <h4 class="text-margin-xs">
                {{ $t("coach.exercise_management.list.title_exercise") }}
              </h4>

              <div class="column justify-center">
                <q-btn
                  :icon="$q.screen.gt.sm ? symOutlinedPlaylistAdd : 'add'"
                  :label="
                    $q.screen.gt.sm
                      ? $t('coach.exercise_management.add_button_exercise')
                      : undefined
                  "
                  :padding="$q.screen.gt.sm ? 'xs sm' : 'sm sm'"
                  color="button-primary"
                  @click="onNewExercise"
                />
              </div>
            </div>
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
      <component
        :is="$q.screen.lt.sm ? QDialog : 'div'"
        v-if="Boolean(selectedExercise)"
        :model-value="Boolean(selectedExercise)"
        @update:model-value="
          (val: boolean) => {
            if (!val) clearExercise();
          }
        "
        class="col-6"
      >
        <!-- Show card when an exercise is selected -->
        <q-card>
          <q-card-section class="q-pb-sm">
            <div class="row justify-between q-mb-sm">
              <h4 class="text-margin-xs">
                {{ $t("coach.exercise_management.list.title_variant") }}
              </h4>

              <!-- Add new variant -->
              <div class="row justify-center">
                <q-btn
                  :icon="$q.screen.gt.sm ? symOutlinedPlaylistAdd : 'add'"
                  :label="
                    $q.screen.gt.sm
                      ? $t('coach.exercise_management.add_button_variant')
                      : undefined
                  "
                  :padding="$q.screen.gt.sm ? 'xs sm' : 'sm sm'"
                  color="button-primary"
                  @click="onNewVariant"
                />

                <q-btn
                  v-if="$q.screen.lt.sm"
                  icon="close"
                  outline
                  flat
                  round
                  color="light-dark"
                  class="q-pa-sm"
                  @click="clearExercise"
                ></q-btn>
              </div>
            </div>

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
      </component>

      <!-- Show text when no exercise is selected -->
      <div v-else-if="!$q.screen.lt.sm" class="col-12 col-sm-6">
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
            @submit="onVariantSubmit"
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
import { useQuasar, QDialog } from "quasar";
import { useI18n } from "vue-i18n";
import { event } from "vue-gtag";
import mixpanel from "mixpanel-browser";
import { useCoachInfoStore } from "@/stores/coachInfo";
import TableExerciseLibrary from "@/components/tables/TableExerciseLibrary.vue";
import FormExerciseVariantLibrary from "@/components/forms/FormExerciseVariantLibrary.vue";
import {
  Exercise,
  ExerciseEquipment,
  ExerciseMuscleGroups,
  ExerciseVariant,
} from "@/helpers/exercises/exercise";
import { reduceExercises } from "@/helpers/exercises/listManagement";
import { arrayUniqueValues } from "@/helpers/array";
import { symOutlinedPlaylistAdd } from "@quasar/extras/material-symbols-outlined";

// Use plugins
const $q = useQuasar();
const i18n = useI18n();

// Get store
const coachInfo = useCoachInfoStore();

// Set ref
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
const showVariantForm = computed(() =>
  Boolean(addingNewVariant.value || selectedVariant.value),
);
const showDialogVariantForm = ref(false);

// Update dialog show status
watch(showVariantForm, (val) => (showDialogVariantForm.value = val));

// Update table selection
watch(selectedExercise, (exercise) =>
  nextTick(() =>
    exerciseTableElement.value?.selectRowByName(exercise?.name, true),
  ),
);

// Get exercises to display
const exercises = computed<Exercise[]>(() => coachInfo.exercises || []);

// Get options to display on variant creation or update
const exerciseMuscleGroupsOptions = computed(() => {
  return arrayUniqueValues(
    exercises.value.reduce(
      (outList, exercise) => outList.concat(exercise.muscleGroups),
      [] as ExerciseMuscleGroups[],
    ),
  );
});
const exerciseEquipmentOptions = computed(() => {
  return arrayUniqueValues(
    exercises.value.reduce(
      (outList, exercise) => outList.concat(exercise.equipment),
      [] as ExerciseEquipment[],
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

      // Mixpanel tracking
      mixpanel.track("New Exercise to Library", {
        Page: "LibraryView",
        Name: newExercise.name,
      });
    },
    onError: () => {
      // Inform user about error while saving exercise
      $q.notify({
        type: "negative",
        message: i18n.t("coach.exercise_management.add_error"),
        position: "bottom",
      });

      // Mixpanel tracking
      mixpanel.track("ERROR New Exercise to Library", {
        Page: "LibraryView",
        Name: newExercise.name,
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

        // Mixpanel tracking
        mixpanel.track("New Variant to Library", {
          Page: "LibraryView",
          Name: variant.name,
        });
      },
      onError: () => {
        $q.notify({
          type: "negative",
          message: i18n.t("coach.exercise_management.add_error"),
          position: "bottom",
        });

        // Mixpanel tracking
        mixpanel.track("ERROR New Variant to Library", {
          Page: "LibraryView",
          Name: variant.name,
        });
      },
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

        // Mixpanel tracking
        mixpanel.track("Updated Variant to Library", {
          Page: "LibraryView",
          Name: variant.name,
        });
      },
      onError: () => {
        $q.notify({
          type: "negative",
          message: i18n.t("coach.exercise_management.update_error"),
          position: "bottom",
        });

        // Mixpanel tracking
        mixpanel.track("ERROR Updated Variant to Library", {
          Page: "LibraryView",
          Name: variant.name,
        });
      },
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

      // Mixpanel tracking
      mixpanel.track("Exercise Deleted from Library", {
        Page: "LibraryView",
        Name: exercise.name,
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

      // Mixpanel tracking
      mixpanel.track("Variant Deleted from Library", {
        Page: "LibraryView",
        Name: variant.name,
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
</script>
