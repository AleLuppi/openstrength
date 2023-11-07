<template>
  <q-page style="height: 0">
    <q-splitter
      v-model="splitterModel"
      :limits="[50, 100]"
      style="height: 100%"
    >
      <template v-slot:before>
        <!-- Show table to build program on the left -->
        <TableProgramBuilder
          :program="program"
          :exercises="coachInfo.exercises"
          class="q-pa-sm"
          cd
        ></TableProgramBuilder>
      </template>

      <template v-slot:after>
        <!-- Show charts on the right -->
        <div class="q-pa-sm">
          <!-- TODO i18n -->
          <h6 class="text-margin-xs">Charts Section</h6>
          <ChartSelector></ChartSelector>
        </div>
      </template>

      <template v-slot:separator>
        <!-- Add a middle separator -->
        <q-avatar
          color="primary"
          text-color="white"
          size="40px"
          icon="drag_indicator"
        />
      </template>
    </q-splitter>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import TableProgramBuilder from "@/components/tables/TableProgramBuilder.vue";
import {
  Program,
  ProgramExercise,
  ProgramLine,
} from "@/helpers/programs/program";
import { useCoachInfoStore } from "@/stores/coachInfo";
import ChartSelector from "@/components/charts/ChartSelector.vue";

// TODO
const splitterModel = ref(70);

// TODO fix user
const coachInfo = useCoachInfoStore();

// TODO load programs
const program = new Program({
  uid: "prova",
  name: "Program name",
  programExercises: [
    new ProgramExercise({
      exercise: coachInfo.exercises?.[0],
      scheduleWeek: "A",
      scheduleDay: 1,
      scheduleOrder: 5,
      lines: [
        new ProgramLine({
          setsBaseValue: "sets",
          repsBaseValue: "reps",
          loadBaseValue: "load",
          rpeBaseValue: "rpe",
        }),
        new ProgramLine({
          setsBaseValue: "sets",
          repsBaseValue: "reps",
          loadBaseValue: "load",
          rpeBaseValue: "rpe",
          requestFeedbackText: true,
        }),
      ],
    }),
    new ProgramExercise({
      exercise: coachInfo.exercises?.[1],
      exerciseVariant: coachInfo.exercises?.[1].variants?.[0],
      scheduleWeek: "B",
      scheduleDay: 4,
      scheduleOrder: 2,
      lines: [
        new ProgramLine({
          setsBaseValue: "2",
          repsBaseValue: "reps",
          loadBaseValue: "load",
          rpeBaseValue: "rpe",
          requestFeedbackText: true,
          lineOrder: 2,
        }),
        new ProgramLine({
          setsBaseValue: "4",
          repsBaseValue: "reps",
          loadBaseValue: "load",
          rpeBaseValue: "rpe",
          requestFeedbackText: true,
          lineOrder: 4,
        }),
        new ProgramLine({
          setsBaseValue: "1",
          repsBaseValue: "reps",
          loadBaseValue: "load",
          rpeBaseValue: "rpe",
          requestFeedbackText: true,
          lineOrder: 1,
        }),
      ],
    }),
    new ProgramExercise({
      exercise: coachInfo.exercises?.[2],
      scheduleWeek: "B",
      scheduleDay: 4,
      scheduleOrder: 1,
      lines: [
        new ProgramLine({
          setsBaseValue: "2222222222222222222",
          repsBaseValue: "reps",
          loadBaseValue: "load",
          rpeBaseValue: "rpe",
          requestFeedbackText: true,
          lineOrder: 2,
        }),
        new ProgramLine({
          setsBaseValue: "4",
          repsBaseValue: "reps",
          loadBaseValue: "load",
          rpeBaseValue: "rpe",
          requestFeedbackText: true,
          lineOrder: 4,
        }),
        new ProgramLine({
          setsBaseValue: "1",
          repsBaseValue: "reps",
          loadBaseValue: "load",
          rpeBaseValue: "rpe",
          requestFeedbackText: true,
          lineOrder: 1,
        }),
      ],
    }),
    new ProgramExercise({
      exercise: coachInfo.exercises?.[2],
      exerciseVariant: coachInfo.exercises?.[1].variants?.[0],
      scheduleWeek: "B",
      scheduleDay: "1",
      scheduleOrder: 1,
      lines: [
        new ProgramLine({
          setsBaseValue: "sets",
          repsBaseValue: "reps",
          loadBaseValue: "load",
          rpeBaseValue: "rpe",
          requestFeedbackText: true,
        }),
      ],
    }),
  ],
});
</script>

<style scoped>
.small-ref-card {
  width: 350px;
  height: 250px;
}

.chart-card {
  width: 100%;
  height: 250px;
}

.program-day-card {
  width: 100%;
  height: 400px;
}

.my-filter-style {
  width: 180px;
  padding-bottom: 32px;
}

.my-tab-panel {
  width: 240px;
  height: 87vh;
}
</style>
