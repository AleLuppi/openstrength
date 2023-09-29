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
            />
          </div>
        </q-card-section>

        <q-separator />

        <!-- TODO connect exercises -->
        <tableExerciseLibrary :exercises="[1]"></tableExerciseLibrary>
      </q-card>

      <!-- Create or update exercise -->
      <q-card class="col-12 col-sm-7">
        <q-card-section>
          <!-- TODO add or update text -->
          <h6>{{ $t("coach.excercise_management.add") }}</h6>
        </q-card-section>

        <q-card-section>
          <q-form @submit="onSubmit">
            <div class="row q-col-gutter-md">
              <os-input
                v-model="exerciseName"
                :label="$t('coach.excercise_management.exercise_name')"
                class="col-12 col-md-6"
              />
              <os-select
                v-model="exerciseVariant"
                :label="$t('coach.excercise_management.exercise_variant')"
                use-input
                :options="['ciao', 'a', 'tutti']"
                class="col-12 col-md-6"
              />
            </div>

            <os-input
              v-model="exerciseVideo"
              :label="$t('coach.excercise_management.exercise_video')"
            />
            <os-input
              v-model="exerciseNote"
              :label="$t('coach.excercise_management.exercise_note')"
              type="textarea"
            />

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
</template>

<script setup lang="ts">
import { ref } from "vue";
import tableExerciseLibrary from "@/components/tables/tableExerciseLibrary.vue";

// Set ref
const searchExercise = ref<string>();
const exerciseName = ref<string>();
const exerciseVariant = ref<string>();
const exerciseVideo = ref<string>();
const exerciseNote = ref<string>();

/**
 * Submit new or updated exercise.
 */
function onSubmit() {
  // TODO
  console.log("submit");
}
</script>
