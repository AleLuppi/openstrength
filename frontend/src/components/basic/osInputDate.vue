<template>
  <os-input
    ref="inputElement"
    v-bind="cleanProps"
    :model-value="inputModelValue"
    @update:model-value="(val) => (outModelValue = val)"
    :mask="modelValueMask"
    :rules="[
      (val) =>
        dateFromStringLocale(val)
          ? true
          : $t('form.date_wrong_format', { format: dateGetLocaleFormat() }),
    ]"
  >
    <template v-if="showDateSelector" #append>
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy
          v-model="showDatePopup"
          cover
          transition-show="scale"
          transition-hide="scale"
        >
          <q-date v-model="outModelValue" mask="DD/MM/YYYY"></q-date>
        </q-popup-proxy>
      </q-icon>
    </template>
  </os-input>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import osInput, { type osInputProps } from "@/components/basic/osInput.vue";
import {
  dateFromStringLocale,
  dateGetLocaleFormat,
  dateGetLocaleMask,
  dateToStringLocale,
} from "@/helpers/scalar";

// Define props (from child)
export interface osInputDateProps extends Omit<osInputProps, "modelValue"> {
  // model value is a date
  modelValue: Date | null | undefined;

  // whether to show the date selector popup if input is a date
  showDateSelector?: boolean;
}
const props = withDefaults(defineProps<osInputDateProps>(), {
  showDateSelector: false,
});

// Define methods (expose child's)
const inputElement = ref<typeof osInput>();
defineExpose({
  resetValidation: () => inputElement.value?.resetValidation(),
  validate: (value?: any) => inputElement.value?.validate(value),
  focus: () => inputElement.value?.focus(),
  blur: () => inputElement.value?.blur(),
  select: () => inputElement.value?.select(),
  getNativeElement: () => inputElement.value?.getNativeElement(),
});

// Define emits
const emit = defineEmits<{
  "update:modelValue": [value: Date];
}>();

// Set props
const inputModelValue = ref<string | number | null>(); // input model value
const showDatePopup = ref(false); // whether date popup is visible

// Get parsed props (allow override of update:modelValue)
const cleanProps = computed(() => {
  const { "onUpdate:modelValue": _, rules: __, ...obj } = props;
  return obj;
});

// Get adjusted model value (translate to date)
const outModelValue = computed<string | number | null | undefined>({
  get: () =>
    props.modelValue ? dateToStringLocale(props.modelValue) : props.modelValue,
  set: (val) => {
    inputModelValue.value = val;
    showDatePopup.value = false;
    if (val)
      try {
        const date = dateFromStringLocale(val.toString());
        if (date) emit("update:modelValue", date);
      } catch {
        // no need to set value if parsing date returns exceptions
      }
  },
});
watch(outModelValue, (val) => (inputModelValue.value = val), {
  immediate: true,
});

// Get date mask
const modelValueMask = dateGetLocaleMask();
</script>

<style scoped lang="scss">
// Hide up/down arrows inside input element if of type "number"
.input-number-hide-arrows {
  /* Chrome, Safari, Edge, Opera */
  &:deep(input::-webkit-outer-spin-button),
  :deep(input::-webkit-inner-spin-button) {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  &:deep(input[type="number"]) {
    appearance: textfield;
    -moz-appearance: textfield;
  }
}
</style>
