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
    <slot
      v-for="(cellValue, cellIdx) in modelValue.values"
      :key="cellIdx"
      :name="`cell-${modelValue.row}-${modelValue.col}-${cellIdx}`"
      :cell-value="cellValue"
      :cell-idx="cellIdx"
    >
      <div v-if="typeof cellValue == 'string' || typeof cellValue == 'number'">
        <!-- Input for string or number values -->
        <q-input
          v-if="editing && (config.editInline ?? true)"
          ref="editComponent"
          :model-value="cellValue"
          :placeholder="cellIdx == 0 ? config.placeholder : undefined"
          dense
          borderless
          class="q-pa-none"
          input-class="q-pa-none"
          style="height: unset"
          @update:model-value="
            if ($event != undefined) modelValue.values[cellIdx] = $event;
          "
        />

        <component
          :is="
            cellValue &&
            (config.useChip == true ||
              (config.useChip == 'single' && modelValue.values.length <= 1) ||
              (config.useChip == 'multiple' && modelValue.values.length > 1))
              ? QChip
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

      <!-- Checkbox for boolean values -->
      <div v-else-if="typeof cellValue == 'boolean'">
        <q-checkbox
          :model-value="modelValue.values[cellIdx]"
          :checked-icon="
            configValues.booleanIcon?.[
              cellIdx % configValues.booleanIcon.length
            ]
          "
          :unchecked-icon="
            configValues.booleanIconUnchecked?.[
              cellIdx % configValues.booleanIconUnchecked.length
            ]
          "
          @update:model-value="
            if (editing) modelValue.values[cellIdx] = $event;
          "
        />
      </div>
    </slot>

    <!-- Placeholder -->
    <div v-if="modelValue.values.length == 0" class="text-grey-6">
      {{ config.placeholder }}
    </div>

    <slot
      v-if="editing && config.editSlot"
      :name="`edit-${config.editSlot}`"
      :model-value="modelValue"
      @update:model-value="modelValue = $event"
    ></slot>
  </component>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { type QInput, QChip } from "quasar";
import { TableSheetCell, TableSheetCellConfig } from "@/components/models";
import { arrayEnsureList } from "@/helpers/array";

// Define props
const props = withDefaults(
  defineProps<{
    // config for current cell
    config?: TableSheetCellConfig;

    // table cell type
    type?: "td" | "th";

    // whether to highlight the cell on mouse hover
    highlightOnHover?: boolean;
  }>(),
  { config: () => ({}), type: "td", highlightOnHover: true },
);

// Set cell models
const modelValue = defineModel<TableSheetCell>({ required: true }); // cell model value
const editing = defineModel<boolean>("editing", { default: false }); // editing status

// Reference to component for editing or displaying text
const editComponent = ref<(QInput | HTMLElement)[]>();

// Add at least one value to cell
watch(editing, (isEditing) => {
  if (isEditing && modelValue.value.values.length == 0)
    modelValue.value.values.push("");
});

// Ensure value-related config is in array terms
const configValues = computed(() => {
  return {
    stringPrefix: arrayEnsureList(props.config.stringPrefix),
    stringSuffix: arrayEnsureList(props.config.stringSuffix),
    booleanIcon: arrayEnsureList(props.config.booleanIcon),
    booleanIconUnchecked: arrayEnsureList(props.config.booleanIconUnchecked),
  };
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
    if (!editing.value && !props.config.readonly) {
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
