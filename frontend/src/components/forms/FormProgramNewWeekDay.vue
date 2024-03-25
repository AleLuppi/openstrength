<template>
  <q-popup-edit
    v-slot="scope"
    v-bind="$props"
    title=""
    :validate="(val) => val.length > 0"
  >
    <h6 v-if="title" class="q-ma-none text-sm">{{ title }}</h6>
    <div class="row items-center">
      <q-input
        v-if="!single || single == 'week'"
        v-model="scope.value[0]"
        autofocus
        dense
        :prefix="$t('coach.program_management.builder.week_name')"
        :rules="[(val) => scope.validate(val)]"
        maxlength="2"
        size="1"
        hide-bottom-space
        @keyup.enter="doSet(scope.set, scope.value, scope.initialValue)"
      />
      <q-input
        v-if="!single || single == 'day'"
        v-model="scope.value[1]"
        dense
        :prefix="$t('coach.program_management.builder.day_name')"
        :rules="[(val) => scope.validate(val)]"
        maxlength="1"
        size="1"
        hide-bottom-space
        class="q-px-sm"
        @keyup.enter="doSet(scope.set, scope.value, scope.initialValue)"
      />
      <q-btn
        flat
        round
        dense
        color="primary"
        icon="check_circle"
        @click="doSet(scope.set, scope.value, scope.initialValue)"
      />
    </div>
  </q-popup-edit>
</template>

<script setup lang="ts">
import { objectDeepCompare } from "@/helpers/object";
import type { QPopupEditProps } from "quasar";

// Define props and emits
const props = withDefaults(
  defineProps<
    Omit<QPopupEditProps, "modelValue"> & {
      modelValue: [string, string];
      forceSave?: boolean;
      single?: false | "week" | "day";
    }
  >(),
  { single: false },
);
const emit = defineEmits<{
  save: [value: [string, string], initialValue: [string, string]];
}>();

/**
 * Set a value and, optionally, force 'save' emit even when model value did not change.
 *
 * @param set method to set supplied values.
 * @param value current model value.
 * @param initialValue initial model value.
 */
function doSet(
  set: () => void,
  value: [string, string],
  initialValue: [string, string],
) {
  // Call base set method
  set();

  // Optionally force value emit
  if (props.forceSave && objectDeepCompare(value, initialValue))
    emit("save", value, initialValue);
}
</script>
