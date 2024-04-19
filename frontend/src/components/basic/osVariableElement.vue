<template>
  <!-- Optionally render button -->
  <q-btn
    v-if="type == 'button'"
    ref="element"
    v-bind="elementProps"
    @click.stop="elementProps.on?.click?.()"
  />

  <!-- Optionally render input -->
  <os-input
    v-else-if="type == 'input'"
    ref="element"
    v-model="model"
    v-bind="elementProps"
    @keyup.enter="element.blur?.()"
    @focus="
      () => {
        elementProps.on.focus?.(model);
        if (elementProps.clearOnFocus) model = null;
      }
    "
    @blur="
      () => {
        elementProps.on.blur?.(model);
        if (elementProps.clearOnBlur) model = null;
      }
    "
  />

  <!-- Optionally render icon -->
  <q-icon v-else-if="type == 'icon'" ref="element" v-bind="elementProps" />

  <!-- Optionally render chip -->
  <q-chip v-else-if="type == 'chip'" ref="element" v-bind="elementProps" />

  <!-- Optionally render badge -->
  <q-badge v-else-if="type == 'badge'" ref="element" v-bind="elementProps" />

  <!-- Optionally render avatar -->
  <q-avatar v-else-if="type == 'avatar'" ref="element" v-bind="elementProps">
    <img v-if="elementProps.src" :src="elementProps.src" />
  </q-avatar>

  <!-- Render string otherwise -->
  <div v-else ref="element">{{ props.props }}</div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

// Set props
const props = defineProps({
  props: { type: [Object, String], default: () => ({}) },
});

// Set ref
const element = ref();
const model = ref();
const type = computed(() =>
  props.props && typeof props.props == "object" ? props.props.element : "",
);
const elementProps = computed(() =>
  props.props && typeof props.props == "object" ? props.props : {},
);
</script>
