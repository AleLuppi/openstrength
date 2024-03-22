<template>
  <q-dialog v-bind="$props">
    <q-card>
      <q-card-section>
        <h6 class="q-my-none">
          {{ $t('coach.programlibrary_management.list.template_import_title') }}
        </h6>
      </q-card-section>

      <q-card-section>
        <div class="row q-gutter-x-md items-center">
          <os-input
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
        ref="programTemplateTableElement"
        :programs="templatePrograms"
        @selection="onProgramSelection"
        :selected="selected"
        @update:selected="onProgramSelected"
        :filter="searchProgram"
        :show-fields="['name', 'lastUpdated']"
        style="max-height: 60vh"
      ></TableExistingPrograms>

      <q-card-actions align="right">
        <q-btn
          flat
          :label="$t('common.cancel')"
          @click="emit('update:modelValue', false)"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue';
import type { QDialogProps } from 'quasar';
import { Program } from 'src/helpers/programs/program';

// Import components
const TableExistingPrograms = defineAsyncComponent(
  () => import('components/tables/TableExistingPrograms.vue')
);

// Define props
const props = defineProps<
  QDialogProps & {
    programs: Program[];
    selected?: Program;
  }
>();

// Define emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  selection: [evt: Event, row: object, index: number];
  'update:selected': [value?: Program];
}>();

// Set ref
const searchProgram = ref<string>(); // search field to scan programs

// Gather template programs that have at least one exercise
const templatePrograms = computed(() =>
  props.programs.filter(
    (program: Program) =>
      program.isTemplate === true &&
      program.programExercises &&
      program.programExercises.length > 0
  )
);

/**
 * Reset search on program selection from table.
 *
 * @param params selection parameters.
 */
function onProgramSelection(...params: [Event, object, number]) {
  searchProgram.value = '';
  emit('selection', ...params);
}

/**
 * Inform parent of selected program.
 *
 * Also close dialog if program is different from undefined.
 *
 * @param program selected program.
 */
function onProgramSelected(program?: Program) {
  emit('update:selected', program);
  if (program) emit('update:modelValue', false);
}
</script>
