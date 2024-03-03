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
                v-if="programsTemplate.length > 0"
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
            :programs="programsTemplate"
            @update:selected="onProgramSelection"
            :filter="searchProgram"
            @delete="onProgramTemplateDelete"
            :show-fields="['name', 'lastUpdated']"
            allow-delete
          ></TableExistingPrograms>
        </q-card>
      </div>

      <!-- Right card: selected program data -->
      <component
        :is="$q.screen.lt.sm ? QDialog : 'div'"
        v-if="selectedProgram"
        :model-value="Boolean(selectedProgram)"
        @update:model-value="selectedProgram = undefined"
        class="col-7"
      >
        <q-card class="os-templateinfo-max-height column">
          <!-- Main title and buttons -->
          <q-card-section class="row justify-between items-center">
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
            <q-btn
              icon="sym_o_open_in_new"
              :to="{
                name: 'program',
                params: { programId: selectedProgram?.uid },
              }"
              :label="$t('coach.programlibrary_management.list.open')"
              :class="{ 'col-12': $q.screen.lt.sm }"
            ></q-btn>
          </q-card-section>

          <!-- Program general info -->
          <q-card-section>
            <q-card>
              <q-card-section>
                <div class="row">
                  <div class="col column">
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

                  <div>
                    <q-btn
                      icon="edit"
                      outline
                      flat
                      round
                      size="0.8em"
                      color="light-dark"
                      @click="showDialogUpdate = true"
                    ></q-btn>
                  </div>
                </div>

                <p
                  class="q-mt-md text-italic"
                  v-if="selectedProgram.description"
                >
                  {{ selectedProgram.description }}
                </p>
              </q-card-section>
            </q-card>
          </q-card-section>

          <!-- Compact program view -->
          <q-card-section
            v-if="selectedProgram"
            class="q-py-none q-mb-md col"
            style="overflow-y: scroll"
          >
            <TableCompactProgram
              :program="selectedProgram"
            ></TableCompactProgram>
          </q-card-section>
        </q-card>
      </component>

      <!-- Show text when no program is selected -->
      <div v-else-if="!$q.screen.lt.sm" class="col-6">
        <div class="row flex-center" style="height: 100%">
          <div class="row items-center">
            <q-icon
              :name="
                programsTemplate.length
                  ? 'fa-regular fa-hand-pointer'
                  : 'sym_o_exclamation'
              "
              size="2rem"
              color="light-dark"
              class="q-px-md"
            ></q-icon>
            <p class="col">
              {{
                programsTemplate.length
                  ? $t(
                      "coach.programlibrary_management.list.no_selected_template",
                    )
                  : $t("coach.programlibrary_management.list.no_templates")
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
      :model-value="showDialogUpdate && Boolean(selectedProgram)"
      @update:model-value="(val) => (showDialogUpdate = val)"
    >
      <q-card>
        <q-card-section class="row items-center">
          <h6>
            {{
              $t("coach.programlibrary_management.list.template_updating_title")
            }}
          </h6>
        </q-card-section>
        <FormProgramTemplateSaving
          :program="selectedProgram!"
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
import { ref, computed, watch, defineAsyncComponent } from "vue";
import { useQuasar, QDialog } from "quasar";
import { useCoachInfoStore } from "@/stores/coachInfo";
import { Program } from "@/helpers/programs/program";
import { event } from "vue-gtag";
import mixpanel from "mixpanel-browser";
import { useI18n } from "vue-i18n";

// Import components
const FormProgramTemplateSaving = defineAsyncComponent(
  () => import("@/components/forms/FormProgramTemplateSaving.vue"),
);
const TableExistingPrograms = defineAsyncComponent(
  () => import("@/components/tables/TableExistingPrograms.vue"),
);
const TableCompactProgram = defineAsyncComponent(
  () => import("@/components/tables/TableCompactProgram.vue"),
);

// Init plugin
const $q = useQuasar();
const i18n = useI18n();

// Get store
const coachInfo = useCoachInfoStore();

// Set program related ref
const searchProgram = ref<string>(); // text to search for a program template
const selectedProgram = ref<Program>(); // program template that is currently selected in left table
const deletingProgramTemplate = ref<Program>(); // program that is being deleted
const showDialogDelete = ref(false); // whether to show dialog to delete program
const showDialogUpdate = ref(false); // whether to show dialog to update program

// Get template programs
const programsTemplate = computed(() => {
  return coachInfo.programs?.filter((prog) => prog.isTemplate === true) ?? [];
});

// Show dialog deleting dialog when required
watch(deletingProgramTemplate, (deletingProgram) => {
  if (deletingProgram) showDialogDelete.value = true;
});

/**
 * Allow program template info modification.
 *
 * @param program selected program instance.
 */
function onProgramSelection(program?: Program) {
  selectedProgram.value = program;
}

/**
 * Delete one program template from list, upon confirmation.
 *
 * @param program program that needs to be deleted.
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
.os-templateinfo-max-height {
  height: calc(100vh - 38px);
}
</style>

<style scoped lang="scss">
// TODO auto-set with available space

.os-table-max-height {
  max-height: calc(100vh - 116px - 38px);
}

.os-table-max-height-with-header {
  max-height: calc(100vh - 116px - 38px - 50px);
}
</style>
