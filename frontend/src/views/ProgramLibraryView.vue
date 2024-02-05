<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-x-md">
      <!-- Display programs -->
      <div class="col-12 col-sm-5">
        <q-card>
          <q-card-section class="q-pb-sm">
            <div class="row justify-between q-mb-sm">
              <h4 class="text-margin-xs">
                {{ $t("coach.athlete_management.list.title") }}
              </h4>

              <!-- Add new athlete -->
              <div class="column justify-center">
                <q-btn
                  icon="sym_o_note_add"
                  :label="
                    $q.screen.gt.sm
                      ? $t('coach.athlete_management.list.add')
                      : undefined
                  "
                  color="button-primary"
                  :padding="$q.screen.gt.sm ? 'xs sm' : 'sm sm'"
                  @click="
                    updatingProgram = undefined;
                    showAthleteDialog = true;
                  "
                />
              </div>
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

          <TableExistingPrograms
            ref="programsTableElement"
            :programs="programs"
            @update:selected="onProgramSelection"
            :filter="searchProgram"
          ></TableExistingPrograms>
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
import TableExistingPrograms from "@/components/tables/TableExistingPrograms.vue";
import { Program } from "@/helpers/programs/program";

// Init plugin
const $q = useQuasar();

// Get store
const coachInfo = useCoachInfoStore();

// Set program related ref
const searchProgram = ref<string>();
const updatingProgram = ref<Program>(); // athlete that is currently being updated
const selectedProgram = ref<Program>(); // athlete that is currently selected in left table
const programsTableElement = ref<typeof TableExistingPrograms>();

// Set additional athlete info ref
const showAthleteDialog = ref(false); // whether to show dialog to add athlete

// Get coach info
const programs = computed(() => coachInfo.programs || []);
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
