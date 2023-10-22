<template>
  <div v-on="$attrs">
    <!-- Title -->
    <h6
      v-if="props.label"
      class="q-my-none text-input-top-label text-uppercase text-weight-medium"
      :class="{ 'input-required': props.required }"
      style="line-height: 1.6em"
    >
      {{ props.label }}
    </h6>

    <!-- Styled input -->
    <q-select
      ref="selectElement"
      v-bind="props"
      behavior="menu"
      outlined
      dense
      :options="options"
      @filter="filter"
      :label="undefined"
      use-chips
      new-value-mode="add-unique"
      :rules="
        (props.rules ?? []).concat([
          (val: string) =>
            !props.required ||
            Boolean(val) ||
            $t('layout.interaction.input_required'),
        ])
      "
      lazy-rules
    >
      <template v-for="(_, slot) in $slots as Readonly<QSelectSlots>" #[slot]>
        <slot :name="slot" />
      </template>
    </q-select>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { QSelect } from "quasar";
import type { QSelectProps, QSelectSlots } from "quasar";

// Define props (from child)
interface extendedInputProps extends QSelectProps {
  required?: boolean;
}
const props = defineProps<extendedInputProps>();
defineEmits(["update:props.modelValue"]);

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

function filter(val: string, doneFn: Function) {
  // No input, display all options
  if (val === "") {
    doneFn(() => {
      options.value = props.options;
    });
    return;
  }

  // Filter according to input
  doneFn(() => {
    const inTxt = val.toLowerCase();
    options.value = props.options?.filter((v) =>
      v.toLowerCase().startsWith(inTxt),
    );
    options.value?.push(
      ...(props.options ?? []).filter(
        (v) =>
          v.toLowerCase().includes(inTxt) && !v.toLowerCase().startsWith(inTxt),
      ),
    );
  });
}
</script>

<style scoped lang="scss">
.input-required:after {
  color: $red;
  content: " *";
  display: inline;
}
</style>
