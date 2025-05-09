<template>
  <q-form ref="formElement" @submit="onSubmit" @reset="onReset">
    <q-card-section>
      <!-- TODO: show list of saved templates -->

      <!-- Template Name -->
      <os-input
        v-model="programTemplateName"
        dense
        required
        :label="$t('coach.programlibrary_management.fields.name')"
        class="col-md-auto col-sm-6 col-12"
      />

      <os-input
        v-model="programTemplateDescription"
        :label="$t('coach.programlibrary_management.fields.description')"
        type="textarea"
        class="col-12"
      />
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat :label="$t('common.cancel')" type="reset" />
      <q-btn
        :label="
          props.updateInfo === true ? $t('common.update') : $t('common.proceed')
        "
        type="submit"
      />
    </q-card-actions>
  </q-form>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { QForm } from "quasar";
import { Program } from "@/helpers/programs/program";
import type { ProgramFilter } from "@/helpers/programs/models";
import { programToProgramTemplate } from "@/helpers/programs/programTemplate";

// Set props
const props = withDefaults(
  defineProps<{
    program: Program;
    programFilter?: ProgramFilter;
    updateInfo?: boolean;
  }>(),
  {
    programFilter: () => ({ week: [], day: [], exercise: [] }),
    updateInfo: false,
  },
);

// Set emits
const emit = defineEmits<{
  submit: [value: Program];
  reset: [];
}>();

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
const programTemplateName = ref<string>();
const programTemplateDescription = ref<string>();

// Update form values based on input program
watch(
  props.program,
  (program: Program) => {
    programTemplateName.value = program.name;
    programTemplateDescription.value = program.description;
  },
  { immediate: true },
);

/**
 * Perform operations on form submit.
 */
function onSubmit() {
  if (props.updateInfo === true) {
    const programToUpdate = props.program;
    programToUpdate.name = programTemplateName.value;
    programToUpdate.description = programTemplateDescription.value;

    programTemplateName.value = undefined;
    programTemplateDescription.value = undefined;

    emit("submit", programToUpdate);
  } else {
    const programTemplate = programToProgramTemplate(
      props.program,
      props.programFilter,
    );
    programTemplate.name = programTemplateName.value;
    programTemplate.description = programTemplateDescription.value;

    emit("submit", programTemplate);
  }
}

/**
 * Perform operations on form reset.
 */
function onReset() {
  programTemplateName.value = undefined;
  programTemplateDescription.value = undefined;

  emit("reset");
}
</script>
