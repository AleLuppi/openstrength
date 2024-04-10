<template>
  <q-page style="height: 0" :class="{ 'overflow-hidden': denseView }">
    <!-- Program table -->
    <q-splitter
      v-model="splitterModel"
      reverse
      :limits="denseView ? [0, 0] : [0, 50]"
      style="height: 100%"
      :after-class="{ 'overflow-hidden': denseView }"
    >
      <template #before>
        <!-- Program management card -->
        <div
          v-if="selectedProgram"
          ref="programManagerElement"
          class="q-mx-sm q-pa-sm os-top-card shadow-5 bg-lightest"
        >
          <!-- Utility buttons -->
          <div class="row justify-between">
            <!-- Save button -->
            <div
              @click="saveProgram()"
              class="row items-center"
              :class="{ 'cursor-pointer': !programSaved }"
            >
              <q-btn
                :icon="programSaved ? 'done' : 'save'"
                :disable="programSaved"
                :outline="!programSaved"
                :flat="programSaved"
                :color="programSaved ? 'positive' : 'primary'"
                class="q-pa-sm q-mx-sm"
              ></q-btn>

              <span
                v-if="!denseView"
                class="text-grey"
                :class="{ 'text-grey-7 text-bold': !programSaved }"
              >
                {{
                  $t(
                    programSaved
                      ? "coach.program_management.builder.saved"
                      : "coach.program_management.builder.not_saved",
                  )
                }}
              </span>
            </div>

            <!-- Toggle compact program visibility -->
            <q-toggle
              v-if="
                selectedProgram && !coachInfo.whatLoading.includes('program')
              "
              v-model="isBuilderCompact"
              :label="$t('coach.program_management.builder.compact_view')"
              class="q-px-lg"
            ></q-toggle>

            <!-- Undo and redo -->
            <div>
              <q-btn
                icon="sym_o_undo"
                flat
                round
                @click="programBuilderElement?.undo()"
                :disable="!canUndo"
              ></q-btn>
              <q-btn
                icon="sym_o_redo"
                flat
                round
                @click="programBuilderElement?.redo()"
                :disable="!canRedo"
              ></q-btn>
            </div>

            <!-- Mobile utility buttons -->
            <div v-if="denseView" class="row">
              <!-- Program info and open new -->
              <q-btn
                icon="fa-solid fa-bars-staggered"
                class="q-pa-sm"
                :color="
                  showUtilsDialog && showingUtils == UtilsOptions.list
                    ? 'primary'
                    : 'light-dark'
                "
                @click="
                  showingUtils = UtilsOptions.list;
                  showUtilsDialog = true;
                "
                flat
              >
              </q-btn>

              <!-- Show Charts -->
              <q-btn
                icon="fa-solid fa-chart-line"
                outline
                flat
                class="q-pa-sm"
                :color="
                  showUtilsDialog && showingUtils == UtilsOptions.charts
                    ? 'primary'
                    : 'light-dark'
                "
                @click="
                  showingUtils = UtilsOptions.charts;
                  showUtilsDialog = true;
                "
              >
              </q-btn>

              <!-- Show Maxlifts -->
              <q-btn
                icon="fa-solid fa-table-list"
                class="q-pa-sm"
                outline
                flat
                :color="
                  showUtilsDialog && showingUtils == UtilsOptions.maxlifts
                    ? 'primary'
                    : 'light-dark'
                "
                @click="
                  showingUtils = UtilsOptions.maxlifts;
                  showUtilsDialog = true;
                "
              >
              </q-btn>

              <!-- Show Feedbacks -->
              <q-btn
                icon="fa-regular fa-comment-dots"
                class="q-pa-sm"
                outline
                flat
                :color="
                  showUtilsDialog && showingUtils == UtilsOptions.feedbacks
                    ? 'primary'
                    : 'light-dark'
                "
                @click="
                  showingUtils = UtilsOptions.feedbacks;
                  showUtilsDialog = true;
                "
              >
              </q-btn>
            </div>

            <!-- Import and export template -->
            <div class="row">
              <div v-if="!selectedProgram.isTemplate">
                <q-btn
                  icon="sym_o_download"
                  flat
                  outline
                  color="secondary"
                  @click="showProgramTemplateImportDialog = true"
                  :label="
                    denseView
                      ? undefined
                      : i18n.t(
                          'coach.programlibrary_management.list.import_template',
                        )
                  "
                  :class="denseView ? 'q-pa-xs q-ma-none' : ''"
                ></q-btn>
                <q-btn
                  icon="sym_o_publish"
                  flat
                  outline
                  color="secondary"
                  @click="
                    () => {
                      programFilter.week.length ||
                      programFilter.day.length ||
                      programFilter.exercise.length
                        ? (showProgramTemplateFilteredWarning = true)
                        : (showProgramTemplateSaveDialog = true);
                    }
                  "
                  :label="
                    denseView
                      ? undefined
                      : i18n.t(
                          'coach.programlibrary_management.list.export_template',
                        )
                  "
                  :class="denseView ? 'q-pa-xs q-ma-none' : ''"
                ></q-btn>
              </div>
              <q-badge v-else>
                {{ $t("coach.programlibrary_management.list.template") }}
              </q-badge>

              <!-- Get shareable link to program -->
              <q-btn
                v-if="!selectedProgram.isTemplate"
                @click="
                  saveProgram();
                  showShareProgramDialog = true;
                "
                outline
                flat
                icon="sym_o_share"
                :label="
                  denseView
                    ? undefined
                    : i18n.t('coach.program_management.viewer.send_program')
                "
                :class="denseView ? 'q-pa-xs q-ma-none' : ''"
              >
              </q-btn>
            </div>
          </div>

          <!-- Filter by week, day, exercise -->
          <q-slide-transition>
            <div v-show="programManagerExpanded">
              <div
                class="row items-end justify-between q-col-gutter-sm q-pt-md"
              >
                <h6 :class="denseView ? 'col-3' : 'col-2'">
                  {{ $t("coach.program_management.filter.title") }}
                </h6>
                <os-select
                  v-model="filterWeek"
                  :options="getProgramUniqueWeeks(selectedProgram)"
                  :label="$t('coach.program_management.filter.filter_week')"
                  multiple
                  hide-bottom-space
                  class="col-3"
                ></os-select>
                <os-select
                  v-model="filterDay"
                  :options="getProgramUniqueDays(selectedProgram)"
                  :label="$t('coach.program_management.filter.filter_day')"
                  multiple
                  hide-bottom-space
                  class="col-3"
                ></os-select>
                <os-select
                  v-model="filterExercise"
                  :options="getProgramUniqueExercises(selectedProgram)"
                  :label="$t('coach.program_management.filter.filter_exercise')"
                  multiple
                  hide-bottom-space
                  :class="denseView ? 'col-3' : 'col-4'"
                ></os-select>
              </div>
            </div>
          </q-slide-transition>
          <q-btn
            :icon="programManagerExpanded ? 'expand_less' : 'expand_more'"
            @click="programManagerExpanded = !programManagerExpanded"
            flat
            dense
            color="secondary"
            class="full-width q-mx-lg"
            :ripple="false"
          ></q-btn>

          <!-- Keep track of object height -->
          <q-resize-observer
            @resize="({ height }) => (programManagerHeight = height)"
          />
        </div>

        <!-- Show table to build program -->
        <TableCompactProgram
          v-show="isBuilderCompact"
          v-if="selectedProgram && !coachInfo.whatLoading.includes('program')"
          :program="selectedProgram"
          :filter="programFilter"
          class="q-px-lg q-py-md"
        ></TableCompactProgram>

        <ProgramBuilder
          v-show="!isBuilderCompact"
          ref="programBuilderElement"
          v-if="selectedProgram && !coachInfo.whatLoading.includes('program')"
          :model-value="selectedProgram"
          @update:model-value="
            (program) => {
              if (program) onProgramTableUpdate(program);
            }
          "
          @new-exercise="
            (exerciseName, programExercise) =>
              onNewExercise(exerciseName, undefined, programExercise)
          "
          @new-variant="onNewExercise"
          @undo="
            (undos, redos) => {
              canUndo = undos;
              canRedo = redos;
            }
          "
          @redo="
            (redos, undos) => {
              canUndo = undos;
              canRedo = redos;
            }
          "
          :exercises="coachInfo.exercises"
          :filter="programFilter"
          :maxlifts="athleteMaxlifts"
          :dense="denseView"
          class="shadow-2 q-my-sm"
          :class="denseView ? 'q-py-xs q-px-sm q-mx-xs' : 'q-pa-sm q-mx-md'"
          style="border-radius: 24px"
          :style="`height: ${
            programPageHeight - programManagerHeight - 8 * 2
          }px`"
        ></ProgramBuilder>

        <SkeletonTableProgramBuilder v-else-if="selectedProgram?.athlete">
        </SkeletonTableProgramBuilder>

        <!-- Create a new program or open one already assigned to athlete -->
        <div v-else class="q-pa-lg column items-center">
          <h4 class="text-margin-xs">
            {{ $t("coach.program_management.builder.initialize_program") }}
          </h4>

          <q-btn
            icon="sym_o_assignment_add"
            @click="openNewProgram"
            :label="$t('coach.program_management.builder.new_program')"
            rounded
            unelevated
          />

          <p class="q-ma-md">{{ $t("common.or_long") }}</p>

          <!-- Show recently opened programs -->
          <h6 class="text-margin-xs">
            {{ $t("coach.program_management.builder.open_recent") }}
          </h6>
          <TableExistingPrograms
            ref="recentProgramsTableElement"
            :programs="allAssignedPrograms"
            @update:selected="(program) => openProgram(program?.uid)"
            :small="denseView"
            @delete="onProgramDelete"
            allow-delete
          />
        </div>
      </template>

      <template #after>
        <!-- Show charts on the right -->
        <component
          :is="denseView ? QDialog : 'div'"
          v-model="showUtilsDialog"
          class="q-pa-sm"
          style="min-width: 100px; overflow: hidden"
        >
          <component
            :is="denseView ? QCard : 'div'"
            :class="{ 'q-pa-md full-width': denseView }"
          >
            <!-- Charts display section -->
            <div v-if="showingUtils == UtilsOptions.charts">
              <ChartSelector
                :program="selectedProgram"
                :filter-week="filterWeek"
                :filter-day="filterDay"
                :filter-exercise="filterExercise"
              ></ChartSelector>
            </div>

            <!-- Max Lifts section -->
            <div v-else-if="showingUtils == UtilsOptions.maxlifts">
              <h6 class="text-margin-xs">
                {{
                  selectedProgram && !selectedProgram.isTemplate
                    ? $t("coach.maxlift_management.list.maxlift_section")
                    : $t(
                        "coach.maxlift_management.list.maxlift_section_template",
                      )
                }}
              </h6>

              <q-card>
                <q-card-section>
                  <div class="row q-gutter-x-md items-center">
                    <os-input
                      v-model="searchMaxLift"
                      :placeholder="
                        $t('coach.maxlift_management.list.search_maxlift')
                      "
                      hide-bottom-space
                      debounce="500"
                      class="col"
                    >
                      <template v-slot:prepend>
                        <q-icon name="search" />
                      </template>
                    </os-input>

                    <!-- Add new maxlift -->
                    <q-btn
                      icon="add"
                      outline
                      @click="
                        updatingMaxlift = undefined;
                        showMaxliftAddDialog = true;
                      "
                    />
                  </div>
                </q-card-section>

                <q-separator />

                <TableMaxLifts
                  :maxlifts="showingAthleteMaxlifts"
                  @update="onUpdateMaxLift"
                  :filter="searchMaxLift"
                  :no-data-label="
                    $t('coach.maxlift_management.list.no_maxlift')
                  "
                />

                <!-- Dialog to add a new max lift -->
                <q-dialog
                  v-model="showMaxliftAddDialog"
                  @hide="maxliftFormElement?.reset"
                >
                  <q-card class="q-pa-sm dialog-min-width">
                    <q-card-section class="row items-center q-pb-none">
                      <h5>
                        {{
                          updatingMaxlift
                            ? $t("coach.maxlift_management.list.update")
                            : $t("coach.maxlift_management.list.add")
                        }}
                      </h5>

                      <q-space />
                      <q-btn
                        icon="close"
                        flat
                        round
                        dense
                        color="button-negative"
                        v-close-popup
                      />
                    </q-card-section>

                    <FormMaxLift
                      ref="maxliftFormElement"
                      :maxlift="updatingMaxlift"
                      :athlete="selectedProgram?.athlete"
                      :exercises="coachInfo.exercises"
                      @submit="saveMaxlift"
                      @reset="showMaxliftAddDialog = false"
                    ></FormMaxLift>
                  </q-card>
                </q-dialog>
              </q-card>
            </div>

            <!-- Program list section -->
            <div
              v-else-if="showingUtils == UtilsOptions.list"
              class="column q-gutter-y-md"
            >
              <div class="row justify-between q-mt-xs">
                <h6>
                  {{
                    selectedProgram && !selectedProgram.isTemplate
                      ? $t("coach.program_management.list.program_section")
                      : $t(
                          "coach.program_management.list.programtemplate_section",
                        )
                  }}
                </h6>
              </div>

              <!-- Display and update assigned user -->
              <div
                v-if="selectedProgram && !selectedProgram.isTemplate"
                class="row items-center justify-start q-col-gutter-sm"
              >
                <span class="text-black">
                  {{ $t("coach.program_management.builder.assigned_athlete") }}
                </span>
                <div>
                  <q-btn
                    color="secondary"
                    outline
                    :dense="Boolean(selectedProgram.athlete)"
                  >
                    <q-item dense class="q-py-none q-px-md">
                      <q-item-section
                        avatar
                        v-if="
                          $q.screen.gt.xs && selectedProgram.athlete?.photoUrl
                        "
                      >
                        <q-avatar size="md">
                          <img :src="selectedProgram.athlete.photoUrl" />
                        </q-avatar>
                      </q-item-section>
                      <q-item-section>{{
                        selectedProgram.athlete?.referenceName ?? ""
                      }}</q-item-section>
                    </q-item>
                  </q-btn>
                </div>
              </div>

              <!-- Search status or temporary program -->
              <q-card>
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
                      v-if="!selectedProgram.isTemplate"
                      icon="edit"
                      outline
                      flat
                      rounded
                      size="0.8em"
                      color="light-dark"
                      @click="showNewProgramDialog = true"
                    ></q-btn>
                  </div>

                  <p
                    class="q-mt-md text-italic"
                    v-if="selectedProgram.description"
                  >
                    {{ selectedProgram.description }}
                  </p>
                </q-card-section>
                <q-card-section
                  v-else-if="coachActiveChanges.program"
                  class="cursor-pointer"
                  @click="onUnsavedProgramRestore"
                >
                  <p class="text-primary">
                    {{ $t("coach.program_management.builder.open_temporary") }}
                  </p>
                  <p
                    class="text-italic text-xs"
                    v-if="coachActiveChanges.program.lastUpdated"
                  >
                    {{ $t("coach.program_management.builder.last_update") }}
                    {{ $d(coachActiveChanges.program.lastUpdated, "middle") }}
                  </p>
                </q-card-section>
                <q-card-section v-else>{{
                  $t("coach.program_management.builder.start_program")
                }}</q-card-section>
              </q-card>

              <q-separator></q-separator>

              <!-- Start a new program -->
              <q-btn
                icon="add"
                :label="$t('coach.program_management.builder.new_program')"
                @click="openNewProgram"
                rounded
                outline
                padding="xs sm"
              ></q-btn>
            </div>

            <!-- Feedbacks section -->
            <div v-else-if="showingUtils == UtilsOptions.feedbacks">
              <div class="row justify-between items-center q-mb-sm">
                <h6 class="text-margin-xs">
                  {{
                    $t("coach.program_management.builder.feedback_from_athlete")
                  }}
                </h6>
                <q-btn
                  @click="updateFeedbackView"
                  icon="fa-solid fa-refresh"
                  :flat="!isFrozenViewOld"
                  round
                  color="secondary"
                >
                  <q-tooltip :offset="[10, 10]">
                    {{
                      $t(
                        "coach.program_management.builder.feedback_from_athlete_refresh_tooltip",
                      )
                    }}
                  </q-tooltip>
                </q-btn>
              </div>

              <WorkoutDayForm
                v-for="(block, indexDay) in programFrozenView?.weekdays"
                :key="indexDay"
                :programDay="block"
                :modelValue="programFeedbacks?.feedbacks[indexDay]"
                class="q-my-md"
                readonly
                show-collapsed
              ></WorkoutDayForm>
            </div>

            <!-- Close button in dialog mode -->
            <q-btn
              v-if="denseView"
              icon="close"
              flat
              round
              dense
              color="button-negative"
              class="q-mt-sm"
              v-close-popup
              style="position: absolute; top: 0; right: 0"
            />
          </component>
        </component>
      </template>

      <template #separator v-if="!denseView">
        <!-- Add a middle separator -->
        <q-avatar
          color="secondary"
          text-color="white"
          size="32px"
          icon="drag_indicator"
        />
      </template>

      <!-- Keep track of available height -->
      <q-resize-observer
        @resize="({ height }) => (programPageHeight = height)"
      />
    </q-splitter>

    <!-- Dialog to set program info -->
    <q-dialog v-model="showNewProgramDialog">
      <q-card>
        <q-card-section>
          <FormProgramInfo
            :program="selectedProgram"
            :athlete="proposedAthlete"
            @submit="
              (program, assignIt) => {
                saveProgram(program, assignIt);
                showNewProgramDialog = false;
              }
            "
          ></FormProgramInfo>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog to assign program to athlete -->
    <DialogProgramAssignAthlete
      v-model="showAthleteAssigningDialog"
      :athletes="coachInfo.athletes ?? []"
      :selected="selectedProgram?.athlete"
      @update:selected="
        (athlete) => {
          if (selectedProgram) selectedProgram.athlete = athlete;
          programSaved = false;
        }
      "
    >
    </DialogProgramAssignAthlete>

    <!-- Dialog to share program with athlete -->
    <DialogProgramShareWithAthlete
      v-if="selectedProgram?.uid"
      v-model="showShareProgramDialog"
      :program-id="selectedProgram.uid"
    ></DialogProgramShareWithAthlete>

    <!-- Dialog to change unsaved program -->
    <q-dialog v-model="showChangeProgramDialog">
      <q-card>
        <q-card-section class="row items-center">
          <q-icon
            name="fa-solid fa-circle-exclamation"
            color="negative"
            size="sm"
          />
          <span class="q-ml-sm">{{
            $t("coach.program_management.builder.not_saved_prompt")
          }}</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            :label="$t('common.cancel')"
            color="secondary"
            v-close-popup
          />
          <q-btn
            :label="$t('common.continue')"
            color="primary"
            @click="openProgram(substituteProgramId, true)"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog to open temporary program -->
    <q-dialog v-model="showUnsavedProgramRestoreDialog">
      <q-card>
        <q-card-section class="row items-center">
          <q-icon
            name="fa-solid fa-circle-exclamation"
            color="primary"
            size="md"
          />
          <span class="q-ml-sm">{{
            $t("coach.program_management.builder.not_assigned_prompt")
          }}</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            :label="$t('common.cancel')"
            color="secondary"
            v-close-popup
          />
          <q-btn
            :label="$t('common.open')"
            color="primary"
            @click="onUnsavedProgramRestore"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog delete a program -->
    <q-dialog
      v-model="showDialogDeleteProgram"
      @hide="deletingProgram = undefined"
    >
      <q-card class="q-pa-sm dialog-min-width">
        <q-card-section class="row items-center q-pb-none">
          <p>
            {{
              $t("coach.program_management.list.delete_program_confirm", {
                program: deletingProgram?.name,
              })
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
            :label="$t('coach.program_management.list.delete_proceed')"
            @click="if (deletingProgram) deleteProgram(deletingProgram);"
            color="button-negative"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog to warn user of filtered template saving -->
    <q-dialog v-model="showProgramTemplateFilteredWarning">
      <q-card>
        <q-card-section class="row items-center">
          <q-icon
            name="fa-solid fa-circle-exclamation"
            color="negative"
            size="sm"
          />
          <span class="col q-ml-sm">
            {{
              $t("coach.programlibrary_management.list.filter_active_warning")
            }}
          </span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            :label="$t('common.cancel')"
            color="secondary"
            v-close-popup
          />
          <q-btn
            :label="$t('common.continue')"
            color="primary"
            @click="showProgramTemplateSaveDialog = true"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog to import program template into current program -->
    <DialogProgramImportTemplate
      v-model="showProgramTemplateImportDialog"
      :programs="coachInfo.programs || []"
      @update:selected="importProgramTemplate"
    ></DialogProgramImportTemplate>

    <!-- Dialog to save program template -->
    <q-dialog
      :model-value="showProgramTemplateSaveDialog && Boolean(selectedProgram)"
      @update:model-value="(val) => (showProgramTemplateSaveDialog = val)"
    >
      <q-card>
        <q-card-section class="row items-center">
          <h6>
            {{
              $t("coach.programlibrary_management.list.template_saving_title")
            }}
          </h6>
        </q-card-section>
        <FormProgramTemplateSaving
          :program="selectedProgram!"
          :programFilter="programFilter"
          @reset="showProgramTemplateSaveDialog = false"
          @submit="saveProgramTemplate"
        >
        </FormProgramTemplateSaving>
      </q-card>
    </q-dialog>

    <!-- Dialog to insert missing maxlifts after program template import -->
    <q-dialog v-model="showMissingMaxliftDialog">
      <q-card>
        <q-card-section class="row items-center">
          <h6>
            {{
              $t(
                "coach.programlibrary_management.import.missing_maxlifts_title",
              )
            }}
          </h6>
          <p>
            {{
              $t(
                "coach.programlibrary_management.import.missing_maxlifts_description",
              )
            }}
          </p>
        </q-card-section>
        <FormMissingMaxlifts
          :maxlifts="missingMaxlifts ?? []"
          clone
          @reset="showMissingMaxliftDialog = false"
          @submit="createMissingMaxlifts"
        >
        </FormMissingMaxlifts>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  onMounted,
  nextTick,
  onBeforeUnmount,
  defineAsyncComponent,
} from "vue";
import { debounce, QDialog, QCard } from "quasar";
import {
  Program,
  ProgramExercise,
  ProgramFrozenView,
} from "@/helpers/programs/program";
import { useUserStore } from "@/stores/user";
import { useCoachInfoStore } from "@/stores/coachInfo";
import { useCoachActiveChangesStore } from "@/stores/coachActiveChanges";
import TableMaxLifts from "@/components/tables/TableMaxLifts.vue";
import { MaxLift } from "@/helpers/maxlifts/maxlift";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import DialogProgramAssignAthlete from "@/components/dialogs/DialogProgramAssignAthlete.vue";
import DialogProgramShareWithAthlete from "@/components/dialogs/DialogProgramShareWithAthlete.vue";
import FormMaxLift from "@/components/forms/FormMaxLift.vue";
import TableExistingPrograms from "@/components/tables/TableExistingPrograms.vue";
import {
  getProgramUniqueWeeks,
  getProgramUniqueDays,
  getProgramUniqueExercises,
} from "@/helpers/programs/linesManagement";
import router, { NamedRoutes } from "@/router";
import FormProgramInfo from "@/components/forms/FormProgramInfo.vue";
import { Exercise, ExerciseVariant } from "@/helpers/exercises/exercise";
import { reduceExercises } from "@/helpers/exercises/listManagement";
import { event } from "vue-gtag";
import mixpanel from "mixpanel-browser";
import { extractUniqueMaxliftFromProgram } from "@/helpers/programs/programTemplate";
import { compareMaxliftLists } from "@/helpers/maxlifts/listManagement";
import { arrayFilterUndefined } from "@/helpers/array";
import { assignProgramToAthlete } from "@/helpers/programs/programManager";
import { loadLatestFeedback } from "@/helpers/programs/programFeedback";
import { ProgramFeedback } from "@/helpers/programs/models";

// Import components
const ProgramBuilder = defineAsyncComponent(
  () => import("@/components/ProgramBuilder.vue"),
);
const TableCompactProgram = defineAsyncComponent(
  () => import("@/components/tables/TableCompactProgram.vue"),
);
const SkeletonTableProgramBuilder = defineAsyncComponent(
  () => import("@/components/skeletons/SkeletonTableProgramBuilder.vue"),
);
const ChartSelector = defineAsyncComponent(
  () => import("@/components/charts/ChartSelector.vue"),
);
const DialogProgramImportTemplate = defineAsyncComponent(
  () => import("@/components/dialogs/DialogProgramImportTemplate.vue"),
);
const FormProgramTemplateSaving = defineAsyncComponent(
  () => import("@/components/forms/FormProgramTemplateSaving.vue"),
);
const FormMissingMaxlifts = defineAsyncComponent(
  () => import("@/components/forms/FormMissingMaxlifts.vue"),
);
const WorkoutDayForm = defineAsyncComponent(
  () => import("@/components/feedback/WorkoutDayForm.vue"),
);

// Define emits
const emit = defineEmits<{
  activateDrawerItem: [item: number];
}>();

// Define expose
defineExpose({ handleDrawerClick });

// Use plugins
const $q = useQuasar();
const i18n = useI18n();
const route = useRoute();

// Get store
const user = useUserStore();
const coachInfo = useCoachInfoStore();
const coachActiveChanges = useCoachActiveChangesStore();

// Set constants
const UtilsOptions = {
  list: "list",
  charts: "charts",
  maxlifts: "maxlifts",
  feedbacks: "feedbacks",
};
const splitterThresholdValue = 15;

// Set ref for generic use
const splitterModel = ref(0);
const showingUtils = ref(UtilsOptions.list);

// Set ref related to program management
const programManagerElement = ref<HTMLElement>();
const programBuilderElement = ref<typeof ProgramBuilder>();
const selectedProgram = ref<Program>();
const substituteProgramId = ref<string>();
const showNewProgramDialog = ref(false);
const showUnsavedProgramRestoreDialog = ref(false);
const showAthleteAssigningDialog = ref(false);
const showShareProgramDialog = ref(false);
const programManagerExpanded = ref(false);
const deletingProgram = ref<Program>();
const showDialogDeleteProgram = ref(false);
const recentProgramsTableElement = ref<typeof TableExistingPrograms>();

// Set ref related to program builder
const programSaved = ref(true);
const filterWeek = ref<string[]>();
const filterDay = ref<string[]>();
const filterExercise = ref<string[]>();
const programPageHeight = ref(0);
const programManagerHeight = ref(0);
const canUndo = ref(false);
const canRedo = ref(false);
const isBuilderCompact = ref(false);

// Set ref related to program templates
const showProgramTemplateFilteredWarning = ref(false);
const showProgramTemplateSaveDialog = ref(false);
const showProgramTemplateImportDialog = ref(false);
const showMissingMaxliftDialog = ref(false);
const missingMaxlifts = ref<MaxLift[]>();
const matchingMaxlifts = ref<[MaxLift, MaxLift][]>();
const selectedTemplate = ref<Program>();

// Set ref related to maxlift
const updatingMaxlift = ref<MaxLift>();
const searchMaxLift = ref<string>();
const showMaxliftAddDialog = ref(false);
const maxliftFormElement = ref<typeof FormMaxLift>();

// Set ref related to feedbacks
const programFrozenView = ref<ProgramFrozenView>();
const programFeedbacks = ref<ProgramFeedback>();
const isFrozenViewOld = ref<boolean>(true);

// Set ref for responsiveness
const denseView = computed(() => !$q.screen.gt.sm);
const showUtilsDialog = ref(false);

// Get program requested from router
const requestedProgram = computed(
  () =>
    coachInfo.programs
      ?.find((program) => program.uid == route.params.programId)
      ?.duplicate(),
);

// Get all coach programs
const allAssignedPrograms = computed(
  () =>
    coachInfo.programs?.filter(
      (program) =>
        program.uid === program.athlete?.assignedProgramId &&
        !program.isTemplate,
    ) || [],
);

// Get complete program filter
const programFilter = computed({
  get() {
    // Register mixpanel event
    if (
      (filterWeek.value?.length ?? 0) > 0 ||
      (filterDay.value?.length ?? 0) > 0 ||
      (filterExercise.value?.length ?? 0) > 0
    ) {
      mixpanel.track("Filter Used in Program", {
        DaysSelected: filterWeek.value?.length ?? 0,
        WeeksSelected: filterDay.value?.length ?? 0,
        ExercisesSelected: filterExercise.value?.length ?? 0,
      });
    }

    return {
      week: filterWeek.value || [],
      day: filterDay.value || [],
      exercise: filterExercise.value || [],
    };
  },
  set(newValue) {
    filterWeek.value = newValue.week;
    filterDay.value = newValue.day;
    filterExercise.value = newValue.exercise;
  },
});

// Get max lifts for selected athlete
const athleteMaxlifts = computed(
  () =>
    coachInfo.maxlifts?.filter(
      (maxlift) => maxlift.athlete?.uid == selectedProgram.value?.athleteId,
    ),
);

// For template program, only show maxlifts referenced in program
const showingAthleteMaxlifts = computed(() => {
  if (selectedProgram.value?.isTemplate) {
    const programMaxliftsUid = extractUniqueMaxliftFromProgram(
      selectedProgram.value,
    ).map((maxlift) => maxlift.uid);
    return (
      athleteMaxlifts.value?.filter(
        (maxlift) => maxlift.uid && programMaxliftsUid.includes(maxlift.uid),
      ) ?? []
    );
  } else return athleteMaxlifts.value ?? [];
});

// Decide whether to display warning dialog on new program
const showChangeProgramDialog = computed({
  get() {
    return substituteProgramId.value != undefined && !programSaved.value;
  },
  set(newValue) {
    if (!newValue) substituteProgramId.value = undefined;
  },
});

const proposedAthlete = computed(
  () =>
    coachInfo.athletes?.find((athlete) => athlete.uid == route.query.athlete),
);

// Update selected program upon request from router
watch(
  requestedProgram,
  (program?: Program) => {
    // Abort update if request comes while unmounting component
    if (route.name != NamedRoutes.program) return;

    // Set selected program
    selectedProgram.value = program;
    setSavedValue();
  },
  {
    immediate: true,
  },
);

// Show new program dialog when requested
watch(
  () => route.query.new,
  (val) => {
    if (val == "true") showNewProgramDialog.value = true;
  },
  { immediate: true },
);

// Try (but not force) to open a new program when requested
watch(substituteProgramId, (programId?: string) => openProgram(programId));

// Perform operations on program update
watch(selectedProgram, (program) => {
  // Active changes on current program
  if (program) coachActiveChanges.program = program;
});

// Update drawer active item when splitter value changes
watch(
  splitterModel,
  (newVal, oldVal) => {
    if ((oldVal === 0 || oldVal === undefined) && newVal > 0)
      emit(
        "activateDrawerItem",
        Object.values(UtilsOptions).findIndex(
          (val) => val == showingUtils.value,
        ),
      );
    if (oldVal && oldVal > 0 && newVal === 0) emit("activateDrawerItem", -1);
  },
  { immediate: true },
);

// Show dialog deleting dialog when required
watch(deletingProgram, (programToDelete) => {
  if (programToDelete) showDialogDeleteProgram.value = true;
});

// Register mixpanel event when view is switched to compact
watch(isBuilderCompact, () => {
  // Mixpanel tracking
  if (isBuilderCompact.value) {
    mixpanel.track("Builder switched to compact");
  }
});

/**
 * Set saved info and ensure it is preserved.
 */
function setSavedValue() {
  // Set saved value and ensure it is preserved at next tick
  programSaved.value = true;
  nextTick(() => (programSaved.value = true));
}

/**
 * Open a program and display in builder for modification.
 *
 * @param programId ID of program that shall be opened.
 * @param force if true, force program loading even if unsaved changes are present.
 */
function openProgram(programId?: string, force: boolean = false) {
  // Update selected program if needed
  if (
    route.name === NamedRoutes.program &&
    programId != undefined &&
    programId != route.params.programId &&
    (programSaved.value || force)
  ) {
    router.replace({
      ...route,
      params: { ...route.params, programId: programId },
      query: { ...(programId ? {} : { new: "true" }) },
    });

    // Clear any possible pending request
    substituteProgramId.value = undefined;

    // Register GA4 event
    event("programview_existingprogram_open", {
      event_category: "documentation",
      event_label: "Program opened in ProgramView for modification",
      value: 1,
    });

    // Mixpanel tracking
    mixpanel.track("Program Opened", {
      Page: "ProgramView",
    });
  }
}

/**
 * Update selected program value and try autosave.
 *
 * @param program new program values that shall be stored.
 */
function onProgramTableUpdate(program: Program) {
  // Update selected program
  selectedProgram.value = program;
  programSaved.value = false;

  // Check if undo and redo are possible
  if (programBuilderElement.value)
    [canUndo.value, canRedo.value] = programBuilderElement.value
      .getHistorySteps()
      .map((val: number) => val > 0);

  // Start autosave
  autosaveProgram();

  // Inform of old frozen view
  isFrozenViewOld.value = true;
}

/**
 * Save current program instance.
 *
 * @param program optional program instance that shall be save.
 * @param [assignToAthlete=false] if true, also assign program to athlete and save it.
 * @param [checkUnsaved=false] if true, only save if program shows active changes.
 */
function saveProgram(
  program?: Program,
  assignToAthlete: boolean = false,
  checkUnsaved: boolean = false,
) {
  // Check if program is unsaved
  if (checkUnsaved && programSaved.value) return;

  // Save current program instance
  const currProgram = program ?? selectedProgram.value;
  if (!currProgram) return;
  currProgram.coach = user.baseUser;
  currProgram.save({
    saveFrozenView: true,
    onSuccess: () => {
      // Inform user about saved program
      setSavedValue();
      (coachInfo.programs =
        coachInfo.programs?.filter(
          (program) => program.uid != currProgram.uid,
        ) || []).push(currProgram);

      // Update athlete profile with new program
      if (assignToAthlete && !currProgram.isTemplate && currProgram.athlete)
        assignProgramToAthlete(currProgram, currProgram.athlete, {
          onError: () => {
            $q.notify({
              type: "negative",
              message: i18n.t(
                "coach.program_management.builder.save_assignment_error",
              ),
              position: "bottom",
            });
          },
        });

      // Clear active change on current program
      coachActiveChanges.program = undefined;

      // Mixpanel tracking
      mixpanel.track("Program Saved", {
        ExerciseNumber: currProgram?.programExercises?.length,
      });

      // Open program by updating route params
      openProgram(currProgram.uid);
    },
    onError: () => {
      $q.notify({
        type: "negative",
        message: i18n.t("coach.program_management.builder.save_error"),
        position: "bottom",
      });
      programSaved.value = false;

      // Mixpanel tracking
      mixpanel.track("ERROR Program Saved", {
        ExerciseNumber: currProgram?.programExercises?.length,
      });
    },
  });
}

/**
 * Save current program instance as program template.
 *
 * Save selected program as a program template, optionally applying current
 * filtering situation to filter out some weeks or days or exercises.
 * Provided program will be saved as-is, since it already went through
 * approval phase by user.
 *
 * @param programTemplate program instance that will be saved as template.
 */
function saveProgramTemplate(programTemplate: Program) {
  // Save current program instance
  const currProgram = programTemplate;

  // Assign program template to user
  currProgram.coach = user.baseUser;

  // Save template
  currProgram.save({
    onSuccess: () => {
      // Inform user about saved program
      (coachInfo.programs =
        coachInfo.programs?.filter(
          (program) => program.uid != currProgram.uid,
        ) || []).push(currProgram);

      // Mixpanel tracking
      mixpanel.track("Template Saved", {
        ExerciseNumber: currProgram?.programExercises?.length,
        TemplateUid: currProgram.uid,
      });

      $q.notify({
        type: "positive",
        message: i18n.t("coach.programlibrary_management.list.save_success"),
        position: "bottom",
      });

      // Close the form
      showProgramTemplateSaveDialog.value = false;
    },
    onError: () => {
      $q.notify({
        type: "negative",
        message: i18n.t("coach.program_management.builder.save_error"),
        position: "bottom",
      });

      // Mixpanel tracking
      mixpanel.track("ERROR Program Template Saved", {
        ExerciseNumber: currProgram?.programExercises?.length,
        TemplateUid: currProgram.uid,
      });
    },
  });
}

/**
 * Create new instances for missing maxlifts from program template.
 *
 * After creation, they will be inserted into program during merge with template.
 *
 * @param maxlifts maxlifts that shall be created.
 */
function createMissingMaxlifts(maxlifts: MaxLift[]) {
  // Add new matching maxlifts
  const matches: [MaxLift, MaxLift][] = arrayFilterUndefined(
    maxlifts.map((maxlift, idx) =>
      (missingMaxlifts.value ?? [])[idx]
        ? [maxlift, missingMaxlifts.value![idx]]
        : undefined,
    ),
  );
  matchingMaxlifts.value = (matchingMaxlifts.value ?? []).concat(matches);

  // Save all the new maxlifts
  coachInfo.maxlifts = coachInfo.maxlifts ?? [];
  matches.forEach(([maxlift]) => {
    maxlift.performedOn = new Date();
    maxlift.athlete = selectedProgram.value?.athlete;
    maxlift.save();
    coachInfo.maxlifts!.push(maxlift);
  });

  // Complete template import
  mergeProgramTemplate();
  showMissingMaxliftDialog.value = false;
}

/**
 * Importing a program template into the current program instance.
 *
 * @param programTemplate program template that shall be merged into selected program.
 */
async function importProgramTemplate(programTemplate?: Program) {
  // Abort if unknown program template
  if (!programTemplate) return;
  selectedTemplate.value = programTemplate;

  // Get current destination program
  const destinationProgram = selectedProgram.value;
  if (!destinationProgram) return;

  // Get missing maxlifts in current program
  const destinationMaxlifts = athleteMaxlifts.value ?? [];
  const templateMaxlifts = extractUniqueMaxliftFromProgram(programTemplate);
  [, missingMaxlifts.value, matchingMaxlifts.value] = compareMaxliftLists(
    destinationMaxlifts,
    templateMaxlifts,
  );

  // Optionally show dialog to fill missing maxlifts
  if (missingMaxlifts.value.length > 0) showMissingMaxliftDialog.value = true;
  else mergeProgramTemplate();
}

/**
 * Do merge program with program template via builder component.
 */
function mergeProgramTemplate() {
  // Complete merge
  programBuilderElement.value?.merge(
    selectedTemplate.value,
    matchingMaxlifts.value,
  );

  // Clear template values
  selectedTemplate.value = undefined;
  missingMaxlifts.value = undefined;
  matchingMaxlifts.value = undefined;
}

/**
 * Autosave program with debounce.
 */
const autosaveProgram = debounce(() => {
  saveProgram(undefined, false, true);
}, 60 * 1000 /* debounce 60 seconds */);

/**
 * Delete one program from list, upon confirmation.
 *
 * @param program program that may be deleted.
 */
function onProgramDelete(program: Program) {
  deletingProgram.value = program;
  showDialogDeleteProgram.value = false;
}

/**
 * Actually delete the selected program template.
 *
 * @param program element that shall be removed.
 */
function deleteProgram(program: Program) {
  program.remove({
    onAthleteUpdateSuccess: () => {
      // Mixpanel tracking
      mixpanel.track("Update Athlete", {
        Type: "Removed program",
      });
    },
    onAthleteUpdateError: () => {
      // Mixpanel tracking
      mixpanel.track("ERROR Update Athlete", {
        Type: "Removing program",
      });
    },
    onSuccess: () => {
      coachInfo.programs = coachInfo.programs?.filter(
        (coachProgram) => coachProgram != program,
      );
      clearProgram();

      // Register GA4 event
      event("program_deleted", {
        event_category: "documentation",
        event_label: "Program Deleted",
        value: 1,
      });

      // Mixpanel tracking
      mixpanel.track("Program Deleted", {
        Page: "ProgramView",
      });
    },
  });
}

/**
 * Clear program form and hide it.
 */
function clearProgram() {
  deletingProgram.value = undefined;
  selectedProgram.value = undefined;
}

/**
 * Handle request of new exercise or variant from program table.
 *
 * @param exerciseName name of new exercise that shall be created, or parent exercise of variant that shall be created.
 * @param variantName name of new variant that shall be created.
 * @param programExercise optional program exercise that shall be updated with new exercise or variant.
 */
function onNewExercise(
  exerciseName: string,
  variantName?: string,
  programExercise?: ProgramExercise,
) {
  // Check exercise name
  if (!exerciseName) {
    $q.notify({
      type: "negative",
      message: i18n.t("coach.exercise_management.add_error"),
      position: "bottom",
    });
    return;
  }
  const exercise = coachInfo.exercises?.find(
    (exercise) => exercise.name?.toLowerCase() == exerciseName.toLowerCase(),
  );

  // Check if creating new exercise of variant
  if (variantName && exercise) {
    // Creating new variant

    // Check new variant
    const variant = exercise.variants?.find(
      (variant) => variant.name?.toLowerCase() == variantName.toLowerCase(),
    );
    if (variant) {
      $q.notify({
        type: "negative",
        message: i18n.t("coach.exercise_management.add_error"),
        position: "bottom",
      });
      return;
    }

    // Create and save new variant
    const newVariant = new ExerciseVariant({
      name: variantName,
      exercise: exercise,
    });
    newVariant.saveNew({
      onSuccess: () => {
        // Store variant in local storages
        exercise.variants = (exercise.variants || []).concat([newVariant]);
        if (programExercise) {
          programExercise.exercise = newVariant.exercise;
          programExercise.exerciseVariant = newVariant;
        }

        // Force update of program under modification
        if (selectedProgram.value) {
          const duplicateProgram = selectedProgram.value.duplicate();
          nextTick(() => onProgramTableUpdate(duplicateProgram));
        }

        // Inform user
        $q.notify({
          type: "positive",
          message: i18n.t("coach.exercise_management.add_success", {
            exercise: newVariant.name,
          }),
          position: "bottom",
        });

        // Mixpanel tracking
        mixpanel.track("New Variant to Library", {
          Page: "ProgramView",
          Name: newVariant.name,
        });
      },
      onError: () => {
        $q.notify({
          type: "negative",
          message: i18n.t("coach.exercise_management.add_error"),
          position: "bottom",
        });

        // Mixpanel tracking
        mixpanel.track("ERROR New Variant to Library", {
          Page: "ProgramView",
          Name: newVariant.name,
        });
      },
    });
  } else if (!exercise) {
    // Creating new exercise

    // Create and save new exercise
    const newExercise = new Exercise({
      name: exerciseName,
    });
    newExercise.saveNew({
      onSuccess: () => {
        // Store exercise in local storage
        coachInfo.exercises = reduceExercises(
          (coachInfo.exercises || []).concat([newExercise]),
        );
        if (programExercise) {
          programExercise.exercise = newExercise;
          programExercise.exerciseVariant = newExercise.defaultVariant;
        }

        // Force update of program under modification
        if (selectedProgram.value) {
          const duplicateProgram = selectedProgram.value.duplicate();
          nextTick(() => onProgramTableUpdate(duplicateProgram));
        }

        // Inform user about exercise successfully saved
        $q.notify({
          type: "positive",
          message: i18n.t("coach.exercise_management.add_success", {
            exercise: newExercise?.name,
          }),
          position: "bottom",
        });

        // Register GA4 event
        event("new_exercise_added", {
          event_category: "documentation",
          event_label: "New Exercise Added to Library",
          value: 1,
        });

        // Mixpanel tracking
        mixpanel.track("New Exercise to Library", {
          Page: "ProgramView",
          Name: newExercise.name,
        });
      },
      onError: () => {
        // Inform user about error while saving exercise
        $q.notify({
          type: "negative",
          message: i18n.t("coach.exercise_management.add_error"),
          position: "bottom",
        });

        // Mixpanel tracking
        mixpanel.track("ERROR New Exercise to Library", {
          Page: "ProgramView",
          Name: newExercise.name,
        });
      },
    });
  } else {
    $q.notify({
      type: "negative",
      message: i18n.t("coach.exercise_management.add_error"),
      position: "bottom",
    });
    return;
  }
}

/**
 * Open form with max lift info to allow coach to update them.
 *
 * @param maxlift instance that is being updated by coach.
 */
function onUpdateMaxLift(maxlift: MaxLift) {
  updatingMaxlift.value = maxlift;
  showMaxliftAddDialog.value = true;
}

/**
 * Create a new maxlift and assign to a coach.
 *
 * @param newMaxLift max lift instance that shall be saved.
 */
function saveMaxlift(newMaxLift: MaxLift) {
  // Get current maxlift and check if already instanciated on db
  const isNew = !newMaxLift.uid;

  // Update values
  if (isNew) {
    newMaxLift.athlete = selectedProgram.value?.athlete;
    newMaxLift.coachId = user.uid;
  }

  // Save maxlift
  newMaxLift.save({
    onSuccess: () => {
      if (isNew)
        (coachInfo.maxlifts = coachInfo.maxlifts || []).push(newMaxLift);
      maxliftFormElement.value?.reset();

      // Mixpanel tracking
      mixpanel.track(isNew ? "Maxlift Created" : "Maxlift Updated", {
        Page: "ProgramView",
        Exercise: newMaxLift.exercise?.name,
        Type: newMaxLift.type?.toString(),
      });
    },
    onError: () => {
      $q.notify({
        type: "negative",
        message: i18n.t(
          "coach.maxlift_management.list." +
            (isNew ? "add_error" : "update_error"),
        ),
        position: "bottom",
      });

      // Mixpanel tracking
      mixpanel.track(
        "ERROR" + (isNew ? "Maxlift Created" : "Maxlift Updated"),
        {
          Page: "ProgramView",
          Exercise: newMaxLift.exercise?.name,
          Type: newMaxLift.type?.toString(),
        },
      );
    },
  });
  showMaxliftAddDialog.value = false;
}

/**
 * Propose a new program as selected program.
 */
function openNewProgram() {
  if (selectedProgram.value) substituteProgramId.value = "";
  else showNewProgramDialog.value = true;

  // Register GA4 event
  event("programview_newprogram_click", {
    event_category: "documentation",
    event_label: "A new program is created",
    value: 1,
  });

  // Mixpanel tracking
  mixpanel.track("New Program", {
    Page: "ProgramView",
  });
}

/**
 * Get feedback to display to coach.
 */
function updateFeedbackView() {
  isFrozenViewOld.value = false;
  if (!selectedProgram.value?.uid) return;

  // Update frozen view
  programFrozenView.value = selectedProgram.value?.freeze();

  // Load feedback
  if (!programFeedbacks.value)
    loadLatestFeedback(selectedProgram.value.uid, {
      onSuccess: (feedback) => {
        programFeedbacks.value = feedback;
      },
    });
}

/**
 * Open unsaved modified program in builder.
 */
function onUnsavedProgramRestore() {
  substituteProgramId.value = coachActiveChanges.program?.uid;

  // Register GA4 event
  event("programview_open_unsavedprog", {
    event_category: "documentation",
    event_label: "Unsaved program restore",
    value: 1,
  });

  // Mixpanel tracking
  mixpanel.track("Unsaved Program Restore");
}

/**
 * Handle custom right drawer click.
 *
 * @param clickParam parameters provided by drawer on click.
 */
function handleDrawerClick(clickParam: number) {
  // Get preferred right view
  let toShow = showingUtils.value;
  switch (clickParam) {
    case 0:
    case 1:
    case 2:
    case 3:
      toShow = Object.values(UtilsOptions)[clickParam];
      break;
    default:
      splitterModel.value = 0;
      return;
  }

  // Update right view or handle view size
  if (toShow === showingUtils.value) {
    if (splitterModel.value < splitterThresholdValue) splitterModel.value = 30;
    else {
      splitterModel.value = 0;
      emit("activateDrawerItem", -1);
      return;
    }
  } else {
    showingUtils.value = toShow;
    if (splitterModel.value < splitterThresholdValue) splitterModel.value = 30;
  }
  emit("activateDrawerItem", clickParam);
}

/**
 * Manage key presses while on this view.
 *
 * @param event key press event.
 */
function keydownHandler(event: KeyboardEvent) {
  // Save program on ctrl + s
  if (event.ctrlKey && event.key.toLowerCase() === "s") {
    event.preventDefault();
    saveProgram(undefined, false, true);
  }

  // Undo changes on ctrl + z
  else if (
    event.ctrlKey &&
    !event.shiftKey &&
    event.key.toLowerCase() === "z"
  ) {
    programBuilderElement.value?.undo();
  }

  // Redo changes on ctrl + y or ctrl + shift + z
  else if (
    (event.ctrlKey && event.key.toLowerCase() === "y") ||
    (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "z")
  ) {
    programBuilderElement.value?.redo();
  }
}

// Define what to do on component mount
onMounted(() => {
  // Open top card on large screens
  if ($q.screen.gt.sm) programManagerExpanded.value = true;

  // Detect key presses while on this page
  document.addEventListener("keydown", keydownHandler);
});

// Define what to do before component unmount
onBeforeUnmount(() => {
  // Clear autosave, and save program if required
  autosaveProgram.cancel();
  saveProgram(undefined, false, true);

  // Remove key press event listener
  document.addEventListener("keydown", keydownHandler);
});
</script>

<style scoped lang="scss">
.animate-pulse-with-rotation-sm {
  --animation-delay: 10s;
}

.os-top-card {
  position: sticky;
  top: 0;
  z-index: 1;
  border-radius: 0 0 20px 20px;
}
</style>
