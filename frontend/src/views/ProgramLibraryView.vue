<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-x-md">
      <!-- Display programs -->
      <div class="col-12 col-sm-5">
        <q-card>
          <q-card-section class="q-pb-sm">
            <div class="row justify-between q-mb-sm">
              <h4 class="text-margin-xs">
                {{ $t("coach.programlibrary_management.list.title") }}
              </h4>
            </div>

            <div class="row q-gutter-x-md items-center">
              <os-input
                v-if="programs.length > 0"
                v-model="searchProgram"
                :placeholder="$t('coach.programlibrary_management.list.search')"
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

          <TableExistingProgramTemplates
            ref="programsTableElement"
            :programs="programs"
            @update:selected="onProgramSelection"
            :filter="searchProgram"
          ></TableExistingProgramTemplates>
        </q-card>

        <!-- TODO: Dialog to add a new program template -->
      </div>

      <!-- Right card: selected program data -->
      <component
        :is="$q.screen.lt.sm ? QDialog : 'div'"
        v-if="Boolean(selectedProgram)"
        :model-value="Boolean(selectedProgram)"
        @update:model-value="selectedProgram = undefined"
        class="col-7"
      >
        <q-card>
          <q-card-section class="q-gutter-x-xs os-athleteinfo-max-height">
            <div class="row justify-between items-center">
              <h6>
                {{ $t("coach.programlibrary_management.fields.program_info") }}
              </h6>
              <q-btn
                v-if="$q.screen.lt.sm"
                icon="close"
                outline
                flat
                round
                color="light-dark"
                class="q-pa-sm"
                @click="selectedProgram = undefined"
              ></q-btn>
            </div>
            <p>{{ selectedProgram?.name }}</p>
            <div v-if="compactProgram" style="max-height: 50vh">
              <TableCompactProgram :compactprogram="compactProgram">
              </TableCompactProgram>
            </div>
          </q-card-section>
        </q-card>
      </component>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useQuasar, QDialog } from "quasar";
import { useCoachInfoStore } from "@/stores/coachInfo";
import TableExistingProgramTemplates from "@/components/tables/TableExistingProgramTemplates.vue";
import { Program, ProgramCompactView } from "@/helpers/programs/program";
import TableCompactProgram from "@/components/tables/TableCompactProgram.vue";
import { convertProgramToCompactView } from "@/helpers/programs/converters";

// Init plugin
const $q = useQuasar();

// Get store
const coachInfo = useCoachInfoStore();

// Set program related ref
const searchProgram = ref<string>();
const selectedProgram = ref<Program>(); // athlete that is currently selected in left table
const programsTableElement = ref<typeof TableExistingProgramTemplates>();
const compactProgram = ref<ProgramCompactView>();

// Get coach info
const programs = computed(() => coachInfo.programs || []);

/**
 * Allow program template info modification.
 *
 * @param program selected program instance.
 */
function onProgramSelection(program?: Program) {
  compactProgram.value = undefined;
  selectedProgram.value = program;
  console.log("on program selection", program);
  compactProgram.value = program
    ? convertProgramToCompactView(program)
    : undefined;
}
</script>

<style scoped lang="scss">
.square-card {
  border-radius: 16px;
  background: $os-grey-cold-0;
  box-shadow: 0px 8px 32px 0px rgba(51, 38, 174, 0.08);
}

.os-athleteinfo-max-height {
  height: calc(100vh - 38px);
}
</style>
