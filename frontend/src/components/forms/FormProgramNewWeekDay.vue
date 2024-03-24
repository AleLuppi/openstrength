<template>
  <q-popup-edit
    v-bind="$props"
    title=""
    :validate="(val) => val.length > 0"
    v-slot="scope"
  >
    <h6 v-if="title" class="q-ma-none text-sm">{{ title }}</h6>
    <div class="row items-center">
      <q-input
        v-if="!single || single == 'week'"
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
        v-if="!single || single == 'day'"
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
    </div>
  </q-popup-edit>
</template>

<script setup lang="ts">
import { objectDeepCompare } from "@/helpers/object";
import type { QPopupEditProps } from "quasar";

// Define props and emits
const props = withDefaults(
  defineProps<
    QPopupEditProps & { forceSave?: boolean; single?: false | "week" | "day" }
  >(),
  { single: false },
);
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
function doSet(set: (...x: any) => void, value: any, initialValue: any) {
  // Call base set method
  set();

  // Optionally force value emit
  if (props.forceSave && objectDeepCompare(value, initialValue))
    emit("save", value, initialValue);
}
</script>
