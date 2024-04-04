<template>
  <component
    :is="type"
    :class="`text-${editing ? 'left' : config.justify ?? 'left'}
    vertical-${editing ? 'top' : config.align ?? 'middle'}
    ${config.class ?? ''}`"
    :style="config.style"
    class="cell"
    :rowspan="config.rowSpan"
    :colspan="config.colSpan"
    :width="config.width ?? 100"
    :height="config.height ?? 30"
    style="position: relative"
    @click="handleClick"
  >
    <div v-for="(cellValue, cellIdx) in modelValue.values" :key="cellIdx">
      <q-input
        v-if="editing && (config.editInline ?? true)"
        ref="editComponent"
        v-model="modelValue.values[cellIdx]"
        dense
        borderless
        class="q-pa-none"
        input-class="q-pa-none"
        style="height: unset"
      />

      <component
        :is="
          cellValue &&
          (config.useChip == true ||
            (config.useChip == 'single' && modelValue.values.length <= 1) ||
            (config.useChip == 'multiple' && modelValue.values.length > 1))
            ? 'q-chip'
            : 'div'
        "
        v-else
        color="green-2"
        dense
        style="margin-block: 1px"
      >
        {{ cellValue }}
      </component>
    </div>

    <slot
      v-if="editing && config.editSlot"
      :name="`edit-${config.editSlot}`"
      :model-value="modelValue"
    ></slot>
  </component>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import type { QInput } from "quasar";
import { TableSheetCell, TableSheetCellConfig } from "@/components/models";

// Define props
withDefaults(
  defineProps<{
    // config for current cell
    config?: TableSheetCellConfig;

    // table cell type
    type?: "td" | "th";

    // whether to highlight the cell on mouse hover
    highlightOnHover?: boolean;
  }>(),
  { config: () => ({}), type: "td", useChip: false, highlightOnHover: true },
);

// FIXME delete eslint line
// eslint-disable-next-line
const modelValue = defineModel<TableSheetCell>({ required: true });

// FIXME delete eslint line
// eslint-disable-next-line
const editing = defineModel<boolean>("editing", { default: false });

// Reference to edit (or text display) component
const editComponent = ref<(QInput | HTMLElement)[]>();

// Add at least one value to cell
watch(editing, (isEditing) => {
  if (isEditing && modelValue.value.values.length == 0)
    modelValue.value.values.push("");
});

/**
 * Manage click on the cell.
 *
 * If inline edit is enabled, enter editing mode on click.
 *
 * @param editIdx optional index of value to edit, otherwise try to edit first value.
 */
function handleClick(editIdx?: number) {
  setTimeout(() => {
    if (!editing.value) {
      editing.value = true;
      nextTick(() => {
        editComponent.value?.[editIdx ?? 0]?.focus();
      });
    }
  }, 50);
}
</script>

<style scoped lang="scss">
.cell {
  &:hover {
    outline: 1px solid $grey-9;
  }

  &:deep(.q-field__control) {
    height: unset;
  }
}
</style>
