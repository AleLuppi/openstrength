<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="(value) => emit('update:modelValue', value)"
  >
    <q-card>
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

      <TableExistingProgramTemplates
        ref="programTemplateTableElement"
        :programs="programs"
        @selection="onProgramTemplateSelection"
        :selected="selected"
        @update:selected="(val) => emit('update:selected', val)"
        :filter="searchProgram"
        :allow-delete="false"
      ></TableExistingProgramTemplates>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, PropType } from "vue";
import TableExistingProgramTemplates from "@/components/tables/TableExistingProgramTemplates.vue";
import { Program } from "@/helpers/programs/program";

// Define props
defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  programs: {
    type: Array as PropType<Program[]>,
    required: true,
  },
  selected: {
    type: Program,
    required: false,
  },
});

// Define emits
const emit = defineEmits<{
  "update:modelValue": [value: Boolean];
  selection: [evt: Event, row: Object, index: Number];
  "update:selected": [value?: Program];
}>();

// Set ref
const searchProgram = ref<string>();

// Set what to do on athlete selection
function onProgramTemplateSelection(...params: [Event, Object, Number]) {
  searchProgram.value = "";
  emit("update:modelValue", false);
  emit("selection", ...params);
}
</script>
