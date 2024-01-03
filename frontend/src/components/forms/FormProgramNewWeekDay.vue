<template>
  <q-popup-edit
    v-bind="$props"
    :validate="(val) => val.length > 0"
    v-slot="scope"
    class="row items-center"
  >
    <q-input
      autofocus
      dense
      v-model="scope.value[0]"
      :prefix="$t('coach.program_management.builder.week_name')"
      :rules="[(val) => scope.validate(val)]"
      @keyup.enter="doSet(scope.set, scope.value, scope.initialValue)"
      maxlength="2"
      size="1"
      hide-bottom-space
    />
    <q-input
      dense
      v-model="scope.value[1]"
      :prefix="$t('coach.program_management.builder.day_name')"
      :rules="[(val) => scope.validate(val)]"
      @keyup.enter="doSet(scope.set, scope.value, scope.initialValue)"
      maxlength="1"
      size="1"
      hide-bottom-space
      class="q-px-sm"
    />
    <q-btn
      @click="doSet(scope.set, scope.value, scope.initialValue)"
      flat
      round
      dense
      color="primary"
      icon="check_circle"
    />
  </q-popup-edit>
</template>

<script setup lang="ts">
import { objectDeepCompare } from "@/helpers/object";
import type { QPopupEditProps } from "quasar";

const props = defineProps<QPopupEditProps & { forceSave?: boolean }>();
const emit = defineEmits<{
  save: [value: any, initialValue: any];
}>();

/**
 * Set a value and, optionally, force 'save' emit even when model value did not change.
 *
 * @param set method to set supplied values.
 * @param value current model value.
 * @param initialValue initial model value.
 */
function doSet(set: Function, value: any, initialValue: any) {
  // Call base set method
  set();

  // Optionally force value emit
  if (props.forceSave && objectDeepCompare(value, initialValue))
    emit("save", value, initialValue);
}
</script>
