<template>
  <q-page class="q-pa-xs">
    <!-- Show selected program -->
    <div v-if="programSnapshot">
      <!-- Program infos -->
      <div class="q-my-lg q-mx-md row items-center justify-evenly">
        <div
          :class="{
            'col-12 row items-center': $q.screen.lt.sm,
          }"
        >
          <h5 class="text-margin-xs">
            {{ $t("coach.program_management.viewer.title") }}
          </h5>
          <h3 class="text-margin-xs" :class="{ 'q-px-md': $q.screen.lt.sm }">
            {{ programSnapshot.athlete }}
          </h3>
        </div>

        <div :class="{ 'col-12': $q.screen.lt.sm }">
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
      </div>

      <!-- Show toggle to coaches to see compact version of the program -->
      <div
        class="row q-mt-xl"
        :class="$q.screen.lt.sm ? 'justify-start' : 'justify-center'"
      >
        <q-toggle
          v-model="showCompactProgram"
          v-if="user.role == UserRole.coach"
          :label="$t('coach.program_management.viewer.compact_view')"
        />
      </div>

      <!-- Show Workout day from athlete point of view -->
      <div v-if="!showCompactProgram">
        <q-scroll-area
          style="height: 112px; max-width: calc(100vw - 16px)"
          class="q-my-md"
        >
          <div class="row no-wrap q-mx-sm">
            <div
              v-for="(block, index) in programSnapshot?.weekdays"
              :key="index"
              class="column justify-center items-center q-pa-none q-mr-sm shadow-1 overflow-hidden"
              :class="
                programFeedbacks.feedbacks[index]?.completed
                  ? 'os-mobile-day-card-done'
                  : 'os-mobile-day-card-undone'
              "
            >
              <q-btn
                flat
                class="q-pa-none"
                style="height: 100%; width: 100%"
                @click="openProgramBlock(index)"
              >
                <div class="q-ma-sm">
                  <p
                    :class="
                      programFeedbacks.feedbacks[index]?.completed
                        ? 'text-bold text-white'
                        : 'text-bold text-secondary'
                    "
                  >
                    Week {{ block.weekName }}
                  </p>
                  <p
                    :class="
                      programFeedbacks.feedbacks[index]?.completed
                        ? 'text-bold text-white'
                        : 'text-bold text-secondary'
                    "
                  >
                    Day {{ block.dayName }}
                  </p>
                  <q-icon
                    v-if="programFeedbacks.feedbacks[index]?.completed"
                    color="lighter"
                    round
                    name="check"
                    size="xs"
                    class="q-py-sm"
                  ></q-icon>
                </div>
              </q-btn>
            </div>
          </div>
        </q-scroll-area>

        <WorkoutDayForm
          :key="selectedIdxDay"
          :programDay="programSnapshot?.weekdays[selectedIdxDay]"
          :modelValue="programFeedbacks.feedbacks[selectedIdxDay]"
          @update:modelValue="
            (val) => {
              if (selectedIdxDay) {
                programFeedbacks.feedbacks[selectedIdxDay] = val;
                saveFeedback(programFeedbacks, programId ?? undefined);
              }
            }
          "
          :isNext="nextDayIdx == selectedIdxDay"
          class="q-my-md"
          :class="{ 'q-mx-xl': $q.screen.gt.sm }"
          :readonly="user.role == UserRole.coach"
        >
        </WorkoutDayForm>
      </div>

      <!-- View compact program for athlete -->
      <div v-else>
        <q-table
          class="q-ma-md q-mb-lg"
          v-for="(block, index) in programSnapshot?.weekdays"
          :key="index"
          :title="`${$t('coach.program_management.builder.week_name', {
            week: block.weekName,
          })} - ${$t('coach.program_management.builder.day_name', {
            day: block.dayName,
          })}`"
          :rows="block.exercises"
          :columns="columns"
          wrap-cells
          row-key="name"
          :pagination="{ rowsPerPage: 0 }"
          flat
          bordered
          hide-bottom
          separator="cell"
          dense
        >
          <!-- Set header style -->
          <template v-slot:header="props">
            <q-tr :props="props" class="bg-table-header">
              <q-th v-for="col in props.cols" :key="col.name" :props="props">
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <!-- Custom slot to render values as HTML content -->
          <template v-slot:body-cell="props">
            <q-td :props="props">
              <div class="q-gutter-y-sm">
                <div
                  v-for="value in props.value"
                  :key="props.col + '_' + value"
                >
                  {{ value }}
                </div>
              </div>
            </q-td>
          </template>

          <!-- Custom slot to render exercise title -->
          <template v-slot:body-cell-exerciseInfo="props">
            <q-td :props="props">
              <div class="text-bold">
                {{ props.value[0] }}
              </div>
              <div>
                {{ props.value[1] }}
              </div>
            </q-td>
          </template>
        </q-table>
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
  </q-page>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed, defineAsyncComponent } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { NamedRoutes } from "@/router";
import { useQuasar } from "quasar";
import type { QTableProps } from "quasar";
import { useUserStore } from "@/stores/user";
import { doGetDocs } from "@/helpers/database/readwrite";
import {
  dbCollections,
  dbSubcollections,
} from "@/helpers/database/collections";
import { ProgramFrozenView } from "@/helpers/programs/program";
import { ProgramFeedback } from "@/helpers/programs/models";
import {
  loadLatestFeedback,
  saveFeedback,
} from "@/helpers/programs/programFeedback";
import { UserRole } from "@/helpers/users/user";

// Import components
const WorkoutDayForm = defineAsyncComponent(
  () => import("@/components/feedback/WorkoutDayForm.vue"),
);

// Init plugin
const route = useRoute();
const $q = useQuasar();
const i18n = useI18n();

// Retrieve user
const user = useUserStore();

// Set ref
const programSnapshot = ref<ProgramFrozenView>(); // current program snapshot
const programFeedbacks = ref<ProgramFeedback>({ feedbacks: [] }); // feedbacks associated to program

const selectedIdxDay = ref<number>(0);

const showCompactProgram = ref<boolean>(false);

// Get requested program id
const programId = computed(() => String(route.query.id));

// Retrieve requested program document
watch(
  programId,
  (docId) => {
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
    );

    loadLatestFeedback(docId, {
      onSuccess: (feedback) => {
        programFeedbacks.value = feedback;
      },
    });
  },
  { immediate: true },
);

// Find which is the next day athlete should check
const nextDayIdx = computed(() => {
  const idx = programFeedbacks.value.feedbacks.findIndex(
    (feedback) => !feedback?.completed,
  );
  if (idx < 0) return programFeedbacks.value.feedbacks.length;
  return idx;
});

// Set table columns for compact visualization
const columns: QTableProps["columns"] = [
  {
    name: "exerciseInfo",
    label: i18n.t("coach.program_management.viewer.header_exercise_info"),
    align: "left",
    field: (row) => [`${row.exerciseName} ${row.variantName}`, row.note],
    style: "width: 30%",
  },
  {
    name: "schema",
    label: i18n.t("coach.program_management.viewer.header_schema"),
    align: "left",
    field: "schema",
    style: "width: 20%",
  },
  {
    name: "schemaNote",
    label: i18n.t("coach.program_management.viewer.header_schema_note"),
    align: "left",
    field: "schemaNote",
    style: "width: 30%",
  },
  {
    name: "textFeedback",
    label: i18n.t("coach.program_management.viewer.header_text_feedback"),
    align: "left",
    field: (row) =>
      row.textFeedback.map((val: boolean) =>
        val ? i18n.t("common.yes") : "-",
      ),
    style: "width: 10%",
  },
  {
    name: "videoFeedback",
    label: i18n.t("coach.program_management.viewer.header_video_feedback"),
    align: "left",
    field: (row) =>
      row.videoFeedback.map((val: boolean) =>
        val ? i18n.t("common.yes") : "-",
      ),
    style: "width: 10%",
  },
];

/**
 * Opens the selected program by the user
 */
function openProgramBlock(index: string | number) {
  selectedIdxDay.value = Number(index);
}

// Operations to perform on component mount
onMounted(() => {
  // Show loading spinner
  $q.loading.show();
});
</script>

<style scoped lang="scss">
.os-mobile-day-card-undone {
  background-color: $lightest;
  border-radius: 16px;
  width: 96px;
  height: 96px;
}

.os-mobile-day-card-done {
  background: $primary;
  background: linear-gradient(180deg, $primary 45%, rgba(214, 68, 5, 1) 100%);
  border-radius: 16px;
  width: 96px;
  height: 96px;
}

.os-week-header-done {
  background: $primary;
  background: linear-gradient(90deg, $primary 50%, rgba(214, 68, 5, 1) 100%);
}
</style>
