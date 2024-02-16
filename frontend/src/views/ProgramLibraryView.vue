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
            :on-delete="onProgramTemplateDelete"
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
          <q-card-section class="q-gutter-x-xs os-templateinfo-max-height">
            <div class="row justify-between items-center">
              <h6>
                {{ $t("coach.programlibrary_management.fields.program_info") }}
              </h6>
              <q-btn
                v-if="$q.screen.gt.sm"
                icon="sym_o_open_in_new"
                :to="{
                  name: 'program',
                  params: { programId: selectedProgram?.uid },
                }"
                >{{ $t("coach.programlibrary_management.list.open") }}</q-btn
              >
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

            <div class="row justify-between">
              <q-btn
                v-if="!$q.screen.gt.sm"
                class="q-mb-sm"
                icon="sym_o_open_in_new"
                :to="{
                  name: 'program',
                  params: { programId: selectedProgram?.uid },
                }"
                >{{ $t("coach.programlibrary_management.list.open") }}</q-btn
              >
            </div>

            <q-card class="q-mt-sm q-mb-sm">
              <q-card-section v-if="selectedProgram">
                <div class="row justify-between">
                  <div class="column">
                    <p>
                      {{
                        selectedProgram.name ??
                        $t("coach.program_management.fields.program")
                      }}
                    </p>
                    <p
                      class="text-italic text-xs"
                      v-if="selectedProgram.lastUpdated"
                    >
                      {{ $t("coach.program_management.builder.last_update") }}
                      {{ $d(selectedProgram.lastUpdated, "middle") }}
                    </p>
                  </div>

                  <q-btn
                    icon="edit"
                    outline
                    flat
                    rounded
                    size="0.8em"
                    color="light-dark"
                    @click="showDialogUpdate = true"
                  ></q-btn>
                </div>

                <p
                  class="q-mt-md text-italic"
                  v-if="selectedProgram.description"
                >
                  {{ selectedProgram.description }}
                </p>
              </q-card-section>
            </q-card>

            <div v-if="compactProgram">
              <TableCompactProgram :compactprogram="compactProgram">
              </TableCompactProgram>
            </div>
          </q-card-section>
        </q-card>
      </component>

      <!-- Show text when no program is selected -->
      <div v-else-if="!$q.screen.lt.sm" class="col-12 col-sm-6">
        <div class="row flex-center" style="height: 100%">
          <div class="row">
            <q-icon
              :name="
                programs ? 'sym_o_exclamation' : 'fa-regular fa-hand-pointer'
              "
              size="2rem"
              color="light-dark"
              class="q-px-md"
            ></q-icon>
            <p>
              {{
                programs
                  ? $t("coach.programlibrary_management.list.no_templates")
                  : $t(
                      "coach.programlibrary_management.list.no_selected_template",
                    )
              }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog delete a program template -->
    <q-dialog
      v-model="showDialogDelete"
      @hide="deletingProgramTemplate = undefined"
    >
      <q-card class="q-pa-sm dialog-min-width">
        <q-card-section class="row items-center q-pb-none">
          <p>
            {{
              $t(
                "coach.programlibrary_management.list.delete_template_confirm",
                {
                  program: deletingProgramTemplate?.name,
                },
              )
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
            :label="$t('coach.programlibrary_management.list.delete_proceed')"
            @click="
              if (deletingProgramTemplate)
                deleteProgram(deletingProgramTemplate);
            "
            color="button-negative"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog to update program template -->
    <q-dialog
      v-model="showDialogUpdate"
      @hide="programTemplateSavingFormElement?.reset"
    >
      <q-card v-if="selectedProgram">
        <q-card-section class="row items-center">
          <h6>
            {{
              $t("coach.programlibrary_management.list.template_updating_title")
            }}
          </h6>
        </q-card-section>
        <FormProgramTemplateSaving
          ref="programTemplateSavingFormElement"
          :program-filter="programFilter"
          :program="selectedProgram"
          :update-info="true"
          @reset="showDialogUpdate = false"
          @submit="onProgramTemplateUpdate"
        >
        </FormProgramTemplateSaving>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useQuasar, QDialog } from "quasar";
import { useCoachInfoStore } from "@/stores/coachInfo";
import TableExistingProgramTemplates from "@/components/tables/TableExistingProgramTemplates.vue";
import { Program, ProgramCompactView } from "@/helpers/programs/program";
import TableCompactProgram from "@/components/tables/TableCompactProgram.vue";
import { convertProgramToCompactView } from "@/helpers/programs/converters";
import { event } from "vue-gtag";
import mixpanel from "mixpanel-browser";
import { useI18n } from "vue-i18n";
import FormProgramTemplateSaving from "@/components/forms/FormProgramTemplateSaving.vue";
import { ProgramFilter } from "@/helpers/programTemplates/programTemplateModels";

// Init plugin
const $q = useQuasar();
const i18n = useI18n();

// Get store
const coachInfo = useCoachInfoStore();

// Set program related ref
const searchProgram = ref<string>();
const selectedProgram = ref<Program>(); // athlete that is currently selected in left table
const programsTableElement = ref<typeof TableExistingProgramTemplates>();
const compactProgram = ref<ProgramCompactView>();
const deletingProgramTemplate = ref<Program>();
const showDialogDelete = ref(false);
const showDialogUpdate = ref(false);
const programTemplateSavingFormElement =
  ref<typeof FormProgramTemplateSaving>();

const programFilter: ProgramFilter = {
  week: [],
  day: [],
  exercise: [],
};

// Get coach info
const coachPrograms = computed(() => coachInfo.programs || []);
const programs = computed(() => {
  return coachPrograms.value?.filter((prog) => prog.isProgramTemplate === true);
});

// Show dialog deleting dialog when required
watch(deletingProgramTemplate, (_newProgram) => {
  if (_newProgram) showDialogDelete.value = true;
});

/**
 * Allow program template info modification.
 *
 * @param program selected program instance.
 */
function onProgramSelection(program?: Program) {
  compactProgram.value = undefined;
  selectedProgram.value = program;
  compactProgram.value = program
    ? convertProgramToCompactView(program)
    : undefined;
}

/**
 * Delete one program template from list, upon confirmation.
 *
 * @param variant element that needs to be deleted.
 */
function onProgramTemplateDelete(program: Program) {
  deletingProgramTemplate.value = program;
  showDialogDelete.value = false;
}

/**
 * Update program template info
 *
 * @param variant element that needs to be deleted.
 */
function onProgramTemplateUpdate(program: Program) {
  showDialogUpdate.value = false;

  program.saveUpdate({
    saveFrozenView: true,
    onSuccess: () => {
      $q.notify({
        type: "positive",
        message: i18n.t("coach.programlibrary_management.list.update_success"),
        position: "bottom",
      });

      // Register GA4 event
      event("athleteview_programinfo_updated", {
        event_category: "documentation",
        event_label: "Program info updated in AthleteView",
        value: 1,
      });

      // Mixpanel tracking
      mixpanel.track("Program Info Updated", {
        Page: "AthleteView",
        IsProgramDescriptionSet: program.description ? true : false,
      });
    },
    onError: () => {
      $q.notify({
        type: "negative",
        message: i18n.t("coach.programlibrary_management.list.add_error"),
        position: "bottom",
      });
    },
  });
}

/**
 * Actually delete the selected program template.
 *
 * @param program element that shall be removed.
 */
function deleteProgram(program: Program) {
  program.remove({
    onSuccess: () => {
      coachInfo.programs = coachInfo.programs?.filter(
        (coachPrograms) => coachPrograms != program,
      );
      clearProgramTemplate();

      // Register GA4 event
      event("program_template_deleted", {
        event_category: "documentation",
        event_label: "Program Template Deleted from Library",
        value: 1,
      });

      // Mixpanel tracking
      mixpanel.track("Program Template Deleted from Library", {
        Page: "ProgramLibrary",
      });
    },
  });
}

/**
 * Clear program form and hide it.
 */
function clearProgramTemplate() {
  deletingProgramTemplate.value = undefined;
  selectedProgram.value = undefined;
}
</script>

<style scoped lang="scss">
.square-card {
  border-radius: 16px;
  background: $os-grey-cold-0;
  box-shadow: 0px 8px 32px 0px rgba(51, 38, 174, 0.08);
}

.os-templateinfo-max-height {
  height: calc(100vh - 38px);
}
</style>
