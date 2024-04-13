<template>
  <div v-on="$attrs">
    <!-- Title -->
    <p
      v-if="label"
      class="text-input-top-label text-uppercase text-weight-medium text-left"
      :class="{ 'input-required': props.required }"
      style="line-height: 1.6em"
    >
      {{ label }}
    </p>

    <!-- Styled select -->
    <q-select
      ref="selectElement"
      v-bind="$props"
      behavior="menu"
      outlined
      dense
      :options="options"
      :label="undefined"
      :placeholder="placeholder"
      :use-chips="multiple"
      new-value-mode="add-unique"
      :rules="
        (rules ?? []).concat([
          (val: string) =>
            !required ||
            Boolean(val) ||
            $t('layout.interaction.input_required'),
        ])
      "
      lazy-rules
      :class="{ 'no-gap-input': !multiple }"
      @filter="filter"
      @input-value="onInputValue"
      @new-value="updateFromNewValue = Boolean(newOnExplicitRequest)"
    >
      <template #no-option="slotProps">
        <q-item>
          <q-item-section
            v-if="newValueMode && noOptionsAddNew"
            class="cursor-pointer"
            :class="addOptionClass"
            @click="onNewValueRequest(slotProps.inputValue)"
          >
            {{
              addOptionFormatText
                ? addOptionFormatText(slotProps.inputValue)
                : slotProps.inputValue
            }}
          </q-item-section>
          <q-item-section v-else>
            {{ $t("common.no_results") }}
          </q-item-section>
        </q-item>
      </template>
      <template #after-options>
        <q-item
          v-if="
            newValueMode &&
            afterOptionsAddNew &&
            inputValue &&
            !options
              ?.map((opt) =>
                String(opt instanceof Object ? opt.label : opt).toLowerCase(),
              )
              .includes(inputValue.toLowerCase())
          "
        >
          <q-item-section
            class="cursor-pointer"
            :class="addOptionClass"
            @click="onNewValueRequest(inputValue)"
          >
            {{
              addOptionFormatText ? addOptionFormatText(inputValue) : inputValue
            }}
          </q-item-section>
        </q-item>
      </template>
      <template v-for="(_, slot) in slots" #[slot]="scope">
        <slot :name="slot" v-bind="scope || {}"></slot>
      </template>
    </q-select>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { QSelect } from "quasar";
import type { QSelectProps, QSelectSlots } from "quasar";

// Define slots
const slots = defineSlots<QSelectSlots>();

// Define props (from child)
interface extendedInputProps extends QSelectProps {
  // whether a non-empty model value is required to validate a form
  required?: boolean;

  // optional placeholder to be inserted in the select box
  placeholder?: string;

  // if true, show after-options slot with a button to request a new element
  afterOptionsAddNew?: boolean;

  // if true, show no-options slot with a button to request a new element
  noOptionsAddNew?: boolean;

  // whether to allow values outside options only on explicit click on add button
  newOnExplicitRequest?: boolean;

  // optional class to style new value button
  addOptionClass?: string;

  // optional method to format text inside new value button
  addOptionFormatText?: (value: string) => string;
}
const props = defineProps<extendedInputProps>();
const emit = defineEmits<{
  "update:modelValue": [modelValue: typeof props.modelValue];
  inputValue: [value: string];
}>();

// Define methods (expose child's)
const selectElement = ref<QSelect>();
defineExpose({
  scrollTo: (index: any, edge?: any) =>
    selectElement.value?.scrollTo(index, edge),
  reset: () => selectElement.value?.reset(),
  refresh: (index: any) => selectElement.value?.refresh(index),
  resetValidation: () => selectElement.value?.resetValidation(),
  validate: (value?: any) => selectElement.value?.validate(value),
  focus: () => selectElement.value?.focus(),
  blur: () => selectElement.value?.blur(),
  showPopup: () => selectElement.value?.showPopup(),
  hidePopup: () => selectElement.value?.hidePopup(),
  removeAtIndex: (index: any) => selectElement.value?.removeAtIndex(index),
  add: (opt: any, unique?: any) => selectElement.value?.add(opt, unique),
  toggleOption: (opt: any, keepOpen?: any) =>
    selectElement.value?.toggleOption(opt, keepOpen),
  getOptionIndex: () => selectElement.value?.getOptionIndex(),
  setOptionIndex: (index: any) => selectElement.value?.setOptionIndex(index),
  moveOptionSelection: (offset?: any, skipInputValue?: any) =>
    selectElement.value?.moveOptionSelection(offset, skipInputValue),
  filter: (value: any) => selectElement.value?.filter(value),
  updateMenuPosition: () => selectElement.value?.updateMenuPosition(),
  updateInputValue: (value: any, noFilter?: any) =>
    selectElement.value?.updateInputValue(value, noFilter),
  isOptionSelected: (opt: any) => selectElement.value?.isOptionSelected(opt),
  getEmittingOptionValue: (opt: any) =>
    selectElement.value?.getEmittingOptionValue(opt),
  getOptionValue: (opt: any) => selectElement.value?.getOptionValue(opt),
  getOptionLabel: (opt: any) => selectElement.value?.getOptionLabel(opt),
  isOptionDisabled: (opt: any) => selectElement.value?.isOptionDisabled(opt),
});

// Set ref
const options = ref<any[]>();
const inputValue = ref<string>("");
const updateFromNewValue = ref<boolean>(false);

const placeholder = computed(() =>
  props.modelValue ? undefined : props.placeholder,
);

/**
 * Filter options according to input value.
 *
 * @param val input text.
 * @param doneFn register callback to update options.
 */
function filter(val: string, doneFn: (func: () => void) => void) {
  // No input, display all options
  if (val === "") {
    doneFn(() => {
      options.value = props.options?.slice();
    });
    return;
  }

  // Filter according to input
  doneFn(() => {
    const inTxt = val.toLowerCase();
    options.value = props.options?.filter((opt) => {
      const optVal = String(opt instanceof Object ? opt.label : opt);
      return optVal.toLowerCase().startsWith(inTxt);
    });
    options.value?.push(
      ...(props.options ?? []).filter((opt) => {
        const optVal = String(opt instanceof Object ? opt.label : opt);
        return (
          optVal.toLowerCase().includes(inTxt) &&
          !optVal.toLowerCase().startsWith(inTxt)
        );
      }),
    );
  });
}

/**
 * Manage new value explicitly requested by add button.
 *
 * @param value new value requested.
 */
function onNewValueRequest(value: string) {
  if (props.multiple) {
    props.newValueMode == "toggle"
      ? selectElement.value?.toggleOption(value)
      : selectElement.value?.add(value, props.newValueMode == "add-unique");
  } else {
    emit("update:modelValue", value);
  }
  selectElement.value?.updateInputValue("");
}

/**
 * Spread info on new value set.
 *
 * @param value current input value.
 */
function onInputValue(value: string) {
  // Set input value
  inputValue.value = value;
  emit("inputValue", value);

  // Reset model value
  if (!props.multiple && props.modelValue && value)
    emit("update:modelValue", "");
}
</script>

<style scoped lang="scss">
.no-gap-input :deep(input) {
  padding: 0;
  min-width: 0 !important;
}
</style>
