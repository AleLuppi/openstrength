<template>
  <div class="q-pa-md">
    <!-- Title -->
    <h2 class="col">{{ $t("layout.views.library_title") }}</h2>

    <!-- Excercise cards -->
    <div class="row">
      <!-- List exercises -->
      <q-card class="col-12 col-sm-5">
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

            <!-- TODO add click -->
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

        <!-- TODO connect exercises -->
        <tableExerciseLibrary
          :exercises="exercises"
          :on-update="onUpdate"
          :on-delete="onDelete"
        ></tableExerciseLibrary>
      </q-card>

      <!-- Create or update exercise -->
      <q-card v-if="showExerciseForm" class="col-12 col-sm-7">
        <q-card-section>
          <!-- TODO add or update text -->
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
                :options="exerciseVariants?.map((variant) => variant.name)"
                class="col-12 col-md-6"
              />
              <os-select
                v-model="exerciseMuscleGroups"
                :label="$t('coach.excercise_management.exercise_musclegroups')"
                use-input
                :options="[]"
                multiple
                class="col-12"
              />
              <os-select
                v-model="exerciseLoadType"
                :label="$t('coach.excercise_management.exercise_loadtype')"
                :options="
                  (
                    Object.keys(
                      ExerciseLoadType,
                    ) as (keyof typeof ExerciseLoadType)[]
                  ).map((val) => ({
                    label: $t(
                      'coach.excercise_management.exercise_loadtypes.' + val,
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
                :label="$t('coach.excercise_management.exercise_equipment')"
                use-input
                :options="[]"
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
                :label="$t('coach.excercise_management.exercise_description')"
                type="textarea"
                class="col-12"
              />
            </div>

            <q-btn
              type="submit"
              :label="$t('coach.excercise_management.add_proceed')"
              class="full-width"
            ></q-btn>
            <q-btn
              v-if="selectedVariant"
              type="reset"
              :label="$t('coach.excercise_management.delete_variant')"
              class="full-width"
            ></q-btn>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import tableExerciseLibrary from "@/components/tables/tableExerciseLibrary.vue";
import {
  Exercise,
  ExerciseVariant,
  ExerciseLoadType,
} from "@/helpers/exercises/exercise";

// Set ref
const showExerciseForm = ref(false);
const exercises: Exercise[] = [
  // TODO retrieve from DB
  new Exercise({
    uid: "abc",
    name: "Panca",
    variants: [
      new ExerciseVariant({
        name: "Mezzo ROM",
        description: "Anche oggi Lore ha la tosse",
      }),
    ],
  }),
];
const searchExercise = ref<string>();
const exerciseName = ref<string>();
const exerciseVariants = ref<ExerciseVariant[]>();
const exerciseLoadType = ref<string>();
const exerciseMuscleGroups = ref<string[]>();
const variantName = ref<string>();
const variantEquipment = ref<string[]>();
const variantVideo = ref<string>();
const variantDescription = ref<string>();
const selectedExercise = ref<Exercise>();
const selectedVariant = computed(() =>
  variantName.value
    ? selectedExercise.value?.variants?.find(
        (variant) => variant.name == variantName.value,
      )
    : undefined,
);

// Update texts when selected exercise change
watch(selectedExercise, (_new) => {
  exerciseName.value = _new?.name;
  variantName.value = undefined;
  exerciseVariants.value = _new?.variants;
  exerciseLoadType.value = _new?.loadType;
  exerciseMuscleGroups.value = _new?.muscleGroups;
});
watch(selectedVariant, (_new) => {
  variantEquipment.value = _new?.equipment;
  variantVideo.value = _new?.videoUrl;
  variantDescription.value = _new?.description;
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
      onSuccess: () => console.log("Yu huuu"),
      onError: () => console.log("Nooo"),
    });
  } else {
    // Save new exercise
    const newExercise = new Exercise({
      name: exerciseName.value,
      loadType: exerciseLoadType.value as ExerciseLoadType,
      muscleGroups: exerciseMuscleGroups.value,
      variants: [
        new ExerciseVariant({
          name: variantName.value,
          description: variantDescription.value,
          equipment: variantEquipment.value,
          videoUrl: variantVideo.value,
        }),
      ],
    });
    newExercise.saveNew();
  }
}

/**
 * Create a new exercise and add it to list.
 */
function onAdd() {
  showExerciseForm.value = true;
  selectedExercise.value = undefined;
  console.log(selectedExercise.value);
}

/**
 * Update one exercise in the list.
 *
 * @param exercise element that needs to be updated.
 */
function onUpdate(_: any, row: { uid?: string }) {
  if (row.uid) {
    showExerciseForm.value = true;
    selectedExercise.value = exercises.find(
      (exercise) => exercise.uid == row.uid,
    );
  } else {
    showExerciseForm.value = false;
    selectedExercise.value = undefined;
  }
}

/**
 * Delete one exercise from list, upon confirmation.
 *
 * @param exercise element that needs to be deleted.
 */
function onDelete(exercise: Exercise) {
  // TODO delete exercise from list
  console.log(exercise.name);
}
</script>
