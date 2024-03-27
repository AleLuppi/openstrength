<template>
  <div>
    <!-- Exercise elements -->
    <div
      class="justify-start q-pa-sm"
      :class="dense ? 'column items-stretch' : 'row items-start'"
    >
      <!-- Reordering arrows -->
      <div
        v-if="!dense"
        class="self-center justify-center"
        :class="dense ? 'row' : 'column'"
      >
        <q-btn
          icon="arrow_drop_up"
          flat
          dense
          :color="canMoveUp ? 'secondary' : 'grey-5'"
          :disable="!canMoveUp"
          @click="emit('move', false)"
        />
        <q-btn
          icon="arrow_drop_down"
          flat
          dense
          :color="canMoveDown ? 'secondary' : 'grey-5'"
          :disable="!canMoveDown"
          @click="emit('move', true)"
        />
      </div>

      <!-- Exercise info -->
      <div :class="dense ? 'row justify-between items-end col-12' : 'col-11'">
        <div
          class="q-pa-sm bg-lighter os-light-border"
          :class="{
            'cursor-pointer': !showExpanded,
            'os-free-exercise-form': !dense,
            'os-free-exercise-form-dense': dense,
          }"
          style="width: 100%"
          @click="showExpanded = true"
        >
          <!-- Input for free text -->
          <os-input v-model="exerciseData" type="textarea"></os-input>
        </div>

        <osButtonSupport
          :icons="['fa-regular fa-clone', 'fa-regular fa-trash-can']"
          :colors="['lighter', 'lighter']"
          :hover-colors="['info', 'negative']"
          :tooltips="[
            $t('coach.program_management.builder.line_duplicate_in_day'),
            $t('coach.program_management.builder.line_delete'),
          ]"
          :direction="dense ? 't' : 'b'"
          class="q-mx-sm"
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
        >
          <template #slot-0>
            <FormProgramNewWeekDay
              v-model="editWeekDayName"
              :title="
                $t(
                  'coach.program_management.builder.line_duplicate_in_day_form',
                )
              "
              :force-save="true"
              :cover="false"
              anchor="center right"
              self="center left"
              @save="(val) => emit('duplicate', val[0], val[1])"
            >
            </FormProgramNewWeekDay>
          </template>
        </osButtonSupport>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent, computed } from "vue";
import { ProgramFreeExercise } from "@/helpers/programs/program";

// Import components
const FormProgramNewWeekDay = defineAsyncComponent(
  () => import("@/components/forms/FormProgramNewWeekDay.vue"),
);

// Define props
const props = withDefaults(
  defineProps<{
    // Builder data to display
    modelValue: ProgramFreeExercise;

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
    navigateWeeks: () => [],
    navigateDays: () => [],
    canMoveUp: true,
    canMoveDown: true,
    expanded: false,
    dense: false,
    debounce: 200,
  },
);

// Define emits
const emit = defineEmits<{
  "update:modelValue": [programExercise: ProgramFreeExercise];
  "update:expanded": [expanded: boolean];
  duplicate: [week: string, day: string];
  delete: [];
  move: [down: boolean];
}>();

// Set ref
const editWeekDayName = ref<[string, string]>(["", ""]); // week and/or day name that is being modified (to clone or move tables)

// Retrieve and supply current program exercise

const programExercise = computed(() => props.modelValue);

function emitProgramExercise() {
  emit("update:modelValue", programExercise.value);
}

// Program exercise lines in tabular format
const exerciseData = computed({
  get: () => (programExercise.value ? programExercise.value.text : ""),
  set: (newValue) => {
    if (programExercise.value) {
      programExercise.value.text = newValue;
      emitProgramExercise();
    }
  },
});

// Check whether exercise info should be shown expanded or not
const showExpanded = computed({
  get: () => props.expanded || !programExercise.value.text,
  set: (val) => {
    emit("update:expanded", val);
  },
});
</script>

<style scoped lang="scss">
.os-light-border {
  border: 1px solid $light;
}

.os-free-exercise-form {
  border-radius: 10px 10px 10px 10px;
  margin-inline-end: -1px;
}

.os-free-exercise-form-dense {
  border-radius: 10px 10px 10px 10px;
  margin-block-end: -1px;
}
</style>
