<template>
  <div class="q-pa-none" style="height: 100%">
    <!-- Show selected program -->
    <div v-if="programSnapshot">
      <!-- Program infos -->
      <div class="q-mx-md">
        <div class="row justify-between">
          <h3 class="text-margin-xs">
            {{ $t("coach.program_management.viewer.title") }}
            {{ programSnapshot.athlete }}
          </h3>
        </div>

        <p>
          <b>{{ $t("coach.program_management.viewer.program_name") }} </b>
          {{ programSnapshot.name }}
        </p>
        <p v-if="programSnapshot.description">
          <b>{{ $t("coach.program_management.viewer.description") }}</b>
          {{ programSnapshot.description }}
        </p>
        <p>
          <b>{{ $t("coach.program_management.viewer.frozen_date") }} </b>
          {{ $d(programSnapshot.frozenOn, "short") }}
        </p>
        <p v-if="programSnapshot.startedOn">
          <b>{{ $t("coach.program_management.viewer.start_date") }}</b>
          {{ $d(programSnapshot.startedOn, "short") }}
        </p>
        <p v-if="programSnapshot.startedOn && programSnapshot.finishedOn">
          <b>{{ $t("coach.program_management.viewer.end_date") }}</b>
          {{ $d(programSnapshot.finishedOn, "short") }}
        </p>
      </div>

      <!-- Show available weeks -->

      <!-- Show Workout day -->
      <div
        v-for="(block, indexDay) in programSnapshot?.weekdays"
        :key="indexDay"
        class="q-my-md q-mx-xs"
      >
        <WorkoutDayForm
          :programDay="block"
          :modelValue="programFeedbacks.feedbacks[indexDay]"
          @update:modelValue="
            (val) => {
              programFeedbacks.feedbacks[indexDay] = val;
              saveFeedback();
            }
          "
          :isNext="nextDayIdx == indexDay"
        >
        </WorkoutDayForm>
      </div>
      <!-- TODO: Personal records of reference -->

      <!-- TODO: Exercise descriptions -->
    </div>

    <!-- Show something else otherwise -->
    <div v-else class="q-pa-lg column items-center">
      <h6>
        {{ $t("coach.program_management.viewer.no_program_title") }}
      </h6>
      <p>
        {{ $t("coach.program_management.viewer.no_program_explanation") }}
      </p>
      <q-btn
        :to="{
          name: NamedRoutes.home,
        }"
        :label="$t('coach.program_management.viewer.no_program_action')"
        rounded
        unelevated
        class="q-ma-lg"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed, defineAsyncComponent } from "vue";
import { useRoute } from "vue-router";
import { NamedRoutes } from "@/router";
import { useQuasar } from "quasar";
import { doGetDocs } from "@/helpers/database/readwrite";
import {
  dbCollections,
  dbSubcollections,
} from "@/helpers/database/collections";
import { ProgramFrozenView } from "@/helpers/programs/program";
import { ProgramFeedback } from "@/helpers/programs/models";

// Import components
const WorkoutDayForm = defineAsyncComponent(
  () => import("@/components/feedback/WorkoutDayForm.vue"),
);

// Init plugin
const route = useRoute();
const $q = useQuasar();

// Set ref
const programSnapshot = ref<ProgramFrozenView>(); // current program snapshot
// FIXME: load/store program feedbacks from DB
const programFeedbacks = ref<ProgramFeedback>({ feedbacks: [] }); // feedbacks associated to program

// Find which is the next day athlete should check
const nextDayIdx = computed(() => {
  const idx = programFeedbacks.value.feedbacks.findIndex(
    (feedback) => !feedback.completed,
  );
  if (idx < 0) return programFeedbacks.value.feedbacks.length;
  return idx;
});

// Retrieve requested program document
watch(
  () => route.query.id,
  (docId) =>
    doGetDocs(
      `${dbCollections.programs}/${docId}/${dbSubcollections.programSnapshots}`,
      undefined,
      {
        ordering: ["-frozenOn"],
        numDocs: 1,
        onSuccess: (docVal: { [key: string]: ProgramFrozenView }) => {
          programSnapshot.value = Object.values(docVal)[0];

          // Hide loading spinner
          $q.loading.hide();
        },
      },
    ),
  { immediate: true },
);

/**
 * FIXME
 */
function saveFeedback() {
  // FIXME
  console.log(programFeedbacks);
}

// Operations to perform on component mount
onMounted(() => {
  // Show loading spinner
  $q.loading.show();
});
</script>
