<template>
  <q-form ref="formElement" @submit="onSubmit" @reset="onReset">
    <q-card-section>
      <!-- Select program template -->
      <div class="col">
        <os-field
          :label="$t('coach.programlibrary_management.fields.import_title')"
          required
          :model-value="programTemplate"
        >
          <template #control>
            <q-btn
              @click="showProgramSelectionDialog = true"
              :label="
                programTemplate
                  ? ''
                  : $t('coach.programlibrary_management.fields.select_program')
              "
              :color="programTemplate ? 'secondary' : 'primary'"
              outline
              :dense="Boolean(programTemplate)"
              class="full-width"
            >
              <q-item v-if="programTemplate" dense class="q-py-none q-px-md">
                <q-item-section>{{ programTemplate.name }}</q-item-section>
              </q-item>
            </q-btn>
          </template>
        </os-field>
      </div>
    </q-card-section>

    <!-- Dialog to select among the available program templates to import -->
    <DialogProgramTemplateAssign
      v-model="showProgramSelectionDialog"
      :programs="allProgramTemplates"
      v-model:selected="programTemplate"
    >
    </DialogProgramTemplateAssign>

    <q-card-actions align="right">
      <q-btn flat :label="$t('common.cancel')" type="reset" />
      <q-btn :label="$t('common.proceed')" type="submit" />
    </q-card-actions>
  </q-form>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { QForm } from "quasar";
import { Program } from "@/helpers/programs/program";
import { useCoachInfoStore } from "@/stores/coachInfo";
import DialogProgramTemplateAssign from "../dialogs/DialogProgramTemplateAssign.vue";

// Define props
/* const props = defineProps({
  program: {
    type: Program,
    required: true,
  },
}); */

// Set emits
const emit = defineEmits<{
  submit: [program: Program];
  reset: [];
}>();

// Get coach info
const coachInfo = useCoachInfoStore();

// Set expose
defineExpose({
  focus: () => formElement.value?.focus(),
  validate: (shouldFocus?: boolean) => formElement.value?.validate(shouldFocus),
  resetValidation: () => formElement.value?.resetValidation(),
  submit: (evt?: Event) => formElement.value?.submit(evt),
  reset: (evt?: Event) => formElement.value?.reset(evt),
  getValidationComponents: () => formElement.value?.getValidationComponents(),
});

// Set ref
const formElement = ref<QForm>();
const programTemplate = ref<Program>();
const showProgramSelectionDialog = ref(false);

// Get all coach program templates
const allProgramTemplates = computed(
  () =>
    coachInfo.programs?.filter(
      (program: Program) => program.isProgramTemplate === true,
    ) || [],
);

/**
 * Perform operations on form submit.
 */
function onSubmit() {
  if (programTemplate.value) {
    emit("submit", programTemplate.value);
  }
}

/**
 * Perform operations on form reset.
 */
function onReset() {
  emit("reset");
}
</script>
