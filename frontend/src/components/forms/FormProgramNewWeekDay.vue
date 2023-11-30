<template>
  <q-popup-edit
    v-bind="$props"
    :validate="(val) => val.length > 0"
    :cover="false"
    anchor="bottom middle"
    self="top middle"
    :offset="[0, 5]"
    v-slot="scope"
    class="row"
  >
    <q-input
      autofocus
      dense
      v-model="scope.value[0]"
      :prefix="$t('coach.program_management.builder.week_name')"
      :rules="[(val) => scope.validate(val)]"
      @keyup.enter="scope.set"
      size="1"
      hide-bottom-space
    />
    <q-input
      dense
      v-model="scope.value[1]"
      :prefix="$t('coach.program_management.builder.day_name')"
      :rules="[(val) => scope.validate(val)]"
      @keyup.enter="scope.set"
      size="1"
      hide-bottom-space
      class="q-px-sm"
    />
    <q-btn
      @click="scope.set"
      flat
      round
      dense
      color="primary"
      icon="check_circle"
    />
  </q-popup-edit>
</template>

<script setup lang="ts">
import type { QPopupEditProps } from "quasar";

defineProps<QPopupEditProps>();
</script>
