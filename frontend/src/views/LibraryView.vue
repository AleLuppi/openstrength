<template>
  <div class="q-pa-md">
    <!-- Title -->
    <h2 class="col">{{ $t("layout.views.library_title") }}</h2>

    <!-- Navigation -->
    <q-tabs v-model="selectedTab" class="text-dark q-pa-md">
      <q-tab
        v-for="tab in ['exercises', 'programs']"
        :key="tab"
        :name="tab"
        :label="$t('layout.views.librarytab_' + tab)"
      />
    </q-tabs>

    <!-- First Tab: Exercises -->
    <q-tab-panels v-model="selectedTab">
      <q-tab-panel name="exercises">
        <!-- Excercise cards -->
        <div class="row q-col-gutter-x-md">
          <!-- List exercises -->
          <div class="col-12 col-sm-6">
            <q-card>
              <q-card-section>
                <h6>{{ $t("coach.excercise_management.list_title") }}</h6>

                <div class="row q-gutter-x-md items-center">
                  <os-input
                    v-model="searchExercise"
                    :placeholder="$t('coach.excercise_management.list_search')"
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
                        ? $t('coach.excercise_management.add_button')
                        : undefined
                    "
                    @click="onAdd"
                  />
                </div>
              </q-card-section>

              <q-separator />

              <tableExerciseLibrary
                :exercises="exercises"
                :on-variant-update="onVariantUpdate"
                :on-exercise-delete="onExerciseDelete"
                :on-variant-delete="onExerciseVariantDelete"
              >
              </tableExerciseLibrary>
            </q-card>
          </div>

          <!-- Create or update exercise -->
          <div class="col-12 col-sm-6">
            <q-card v-if="showExerciseForm" class="col-12 col-sm-6">
              <q-card-section>
                <h6>
                  {{
                    $t(
                      "coach.excercise_management." +
                        (selectedExercise ? "update" : "add"),
                    )
                  }}
                </h6>
              </q-card-section>

              <q-card-section>
                <q-form @submit="onSubmit">
                  <div class="row q-col-gutter-x-md">
                    <os-input
                      v-model="exerciseName"
                      :label="$t('coach.excercise_management.exercise_name')"
                      class="col-12 col-md-6"
                    />
                    <os-select
                      v-model="variantName"
                      :label="$t('coach.excercise_management.exercise_variant')"
                      use-input
                      :options="
                        exerciseVariants?.map((variant) => variant.name)
                      "
                      class="col-12 col-md-6"
                    />
                    <os-select
                      v-model="exerciseMuscleGroups"
                      :label="
                        $t('coach.excercise_management.exercise_musclegroups')
                      "
                      use-input
                      :options="exerciseMuscleGroupsOptions"
                      multiple
                      class="col-12"
                    />
                    <os-select
                      v-model="exerciseLoadType"
                      :label="
                        $t('coach.excercise_management.exercise_loadtype')
                      "
                      :options="
                        (
                          Object.keys(
                            ExerciseLoadType,
                          ) as (keyof typeof ExerciseLoadType)[]
                        ).map((val) => ({
                          label: $t(
                            'coach.excercise_management.exercise_loadtypes.' +
                              val,
                          ),
                          value: val,
                        }))
                      "
                      emit-value
                      map-options
                      class="col-12 col-md-6"
                    />
                    <os-select
                      v-model="variantEquipment"
                      :label="
                        $t('coach.excercise_management.exercise_equipment')
                      "
                      use-input
                      :options="exerciseEquipmentOptions"
                      multiple
                      class="col-12 col-md-6"
                    />
                    <os-input
                      v-model="variantVideo"
                      :label="$t('coach.excercise_management.exercise_video')"
                      class="col-12"
                    />
                    <os-input
                      v-model="variantDescription"
                      :label="
                        $t('coach.excercise_management.exercise_description')
                      "
                      type="textarea"
                      class="col-12"
                    />
                  </div>

                  <q-btn
                    type="submit"
                    :label="$t('coach.excercise_management.add_proceed')"
                    class="full-width"
                  ></q-btn>
                </q-form>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Dialog delete an exercise or variant -->
        <q-dialog
          v-model="showDeleteDialog"
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
                    ? $t("coach.excercise_management.delete_exercise_confirm", {
                        exercise: deletingExercise?.name,
                      })
                    : $t("coach.excercise_management.delete_variant_confirm", {
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
                v-close-popup
              />
              <q-btn
                :label="$t('coach.athlete_management.list.add_proceed')"
                @click="
                  if (deletingExercise) deleteExercise(deletingExercise);
                  if (deletingVariant) deleteVariant(deletingVariant);
                "
                v-close-popup
              />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </q-tab-panel>
      <!-- Second tab: Programs -->
      <q-tab-panel name="programs">
        <div class="text-h5">TODO</div>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { useUserStore } from "@/stores/user";
import { useCoachInfoStore } from "@/stores/coachInfo";
import tableExerciseLibrary from "@/components/tables/tableExerciseLibrary.vue";
import {
  Exercise,
  ExerciseVariant,
  ExerciseLoadType,
  reduceExercises,
} from "@/helpers/exercises/exercise";

// Use plugins
const $q = useQuasar();
const i18n = useI18n();

// Get store
const user = useUserStore();
const coachInfo = useCoachInfoStore();

// Set ref
const selectedTab = ref("exercises"); // main tab to show
const showExerciseForm = ref(false);
const showDeleteDialog = ref(false);
const deletingExercise = ref<Exercise>();
const deletingVariant = ref<ExerciseVariant>();
const searchExercise = ref<string>(); // TODO
const exerciseName = ref<string>();
const exerciseVariants = ref<ExerciseVariant[]>();
const exerciseLoadType = ref<string>();
const exerciseMuscleGroups = ref<string[]>();
const variantName = ref<string>();
const variantEquipment = ref<string[]>();
const variantVideo = ref<string>();
const variantDescription = ref<string>();
const selectedExercise = computed(() =>
  exerciseName.value
    ? exercises.value.find((exercise) => exercise.name == exerciseName.value)
    : undefined,
);
const selectedVariant = computed(() =>
  variantName.value
    ? selectedExercise.value?.variants?.find(
        (variant) => variant.name == variantName.value,
      )
    : undefined,
);
const exerciseMuscleGroupsOptions = computed(() => {
  return [
    ...new Set(
      exercises.value.reduce(
        (outList, exercise) => outList.concat(exercise.muscleGroups ?? []),
        [] as string[],
      ),
    ),
  ].sort();
});
const exerciseEquipmentOptions = computed(() => {
  return [
    ...new Set(
      exercises.value.reduce(
        (outList, exercise) =>
          outList.concat(
            exercise.variants?.reduce(
              (outVariantList, variant) =>
                outVariantList.concat(variant.equipment ?? []),
              [] as string[],
            ) ?? [],
          ),
        [] as string[],
      ),
    ),
  ].sort();
});

// Get exercises to display
const exercises = computed<Exercise[]>(() => {
  coachInfo.loadExercises(user.uid, true);
  return coachInfo.exercises || [];
});

// Update texts when selected exercise change
watch(selectedExercise, (_new) => {
  // FIXME with current behavior, one cannot have two exercises starting with same string
  exerciseName.value = _new?.name;
  exerciseVariants.value = _new?.variants;
  exerciseLoadType.value = _new?.loadType;
  exerciseMuscleGroups.value = _new?.muscleGroups;
});
watch(selectedVariant, (_new) => {
  variantName.value = _new?.name;
  variantEquipment.value = _new?.equipment;
  variantVideo.value = _new?.videoUrl;
  variantDescription.value = _new?.description;
});

// Show dialog deleting dialog when required
watch([deletingExercise, deletingVariant], ([_newExercise, _newVariant]) => {
  if (_newExercise || _newVariant) showDeleteDialog.value = true;
});

/**
 * Submit new or updated exercise.
 */
function onSubmit() {
  if (selectedExercise.value) {
    const exerciseToUpdate = selectedExercise.value;
    exerciseToUpdate.name = exerciseName.value;
    exerciseToUpdate.loadType = exerciseLoadType.value as ExerciseLoadType;
    exerciseToUpdate.muscleGroups = exerciseMuscleGroups.value;
    if (
      exerciseToUpdate.variants
        ?.map((variant) => variant.name)
        .includes(variantName.value)
    ) {
      const variantToUpdate = exerciseToUpdate.variants.find(
        (variant) => variant.name == variantName.value,
      );
      if (variantToUpdate) {
        variantToUpdate.name = variantName.value;
        variantToUpdate.description = variantDescription.value;
        variantToUpdate.equipment = variantEquipment.value;
        variantToUpdate.videoUrl = variantVideo.value;
      }
    } else
      exerciseToUpdate.variants?.push(
        new ExerciseVariant({
          name: variantName.value,
          description: variantDescription.value,
          equipment: variantEquipment.value,
          videoUrl: variantVideo.value,
        }),
      );
    exerciseToUpdate.saveUpdate({
      // TODO put in a separated method
      // Variant update
      onSuccess: () =>
        $q.notify({
          type: "positive",
          message: i18n.t("coach.excercise_management.update_success", {
            exercise: exerciseToUpdate.name,
            variant: variantName.value,
          }),
          position: "bottom",
        }),
      onError: () =>
        $q.notify({
          type: "negative",
          message: i18n.t("coach.excercise_management.update_error"),
          position: "bottom",
        }),
    });
  } else {
    // Save new exercise
    const newExercise = new Exercise({
      name: exerciseName.value,
      loadType: exerciseLoadType.value as ExerciseLoadType,
      muscleGroups: exerciseMuscleGroups.value,
      variants: variantName.value
        ? [
            new ExerciseVariant({
              name: variantName.value,
              description: variantDescription.value,
              equipment: variantEquipment.value,
              videoUrl: variantVideo.value,
            }),
          ]
        : [],
    });
    if (!variantName.value) newExercise.addDefaultVariant();
    newExercise.saveNew({
      onSuccess: () => {
        coachInfo.exercises = reduceExercises(
          (coachInfo.exercises || []).concat([newExercise]),
        );
        // TODO put in a separate method
        // Success exercise saved
        $q.notify({
          type: "positive",
          message: i18n.t("coach.excercise_management.add_success", {
            exercise: newExercise?.name,
          }),
          position: "bottom",
        });
      },
      // TODO put in a separate method
      onError: () => {
        $q.notify({
          type: "negative",
          message: i18n.t("coach.excercise_management.add_error"),
          position: "bottom",
        });
      },
    });
  }
}

/**
 * Create a new exercise and add it to list.
 */
function onAdd() {
  clearExercise();
  showExerciseForm.value = true;
}

/**
 * Show a dialog to update variant.
 *
 * @param exercise element that needs to be updated.
 */
function onVariantUpdate(
  exerciseRow: { [key: string]: any; exercise?: string },
  variantRow: { [key: string]: any; variant?: string },
) {
  console.log(exerciseRow.exercise, variantRow.variant);
  if (exerciseRow.exercise && variantRow.variant) {
    exerciseName.value = exerciseRow.exercise;
    variantName.value = variantRow.variant;
    showExerciseForm.value = true;
    console.log("riciao");
  } else clearExercise();
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
 * Delete one variant from list, upon confirmation.
 *
 * @param variant element that needs to be deleted.
 */
function onExerciseVariantDelete(variant: ExerciseVariant) {
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
        (coachExercise) => coachExercise.name != exercise.name,
      );
      clearExercise();
    },
  });
}

/**
 * Actually delete the selected exercise.
 *
 * @param exercise element that shall be removed.
 */
function deleteVariant(variant: ExerciseVariant) {
  variant.remove({
    onSuccess: () => {
      coachInfo.exercises?.forEach((coachExercise) => {
        coachExercise.variants = coachExercise.variants?.filter(
          (coachVariant) => coachVariant.name != variant.name,
        );
      });
      coachInfo.exercises = coachInfo.exercises?.filter(
        (coachExercise) =>
          coachExercise.variants && coachExercise.variants.length > 0,
      );
      clearExercise();
    },
  });
}

/**
 * Clear exercise form and hide it.
 */
function clearExercise() {
  exerciseName.value = undefined;
  variantName.value = undefined;
  showExerciseForm.value = false;
}
</script>
