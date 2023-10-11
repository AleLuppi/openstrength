<template>
  <!-- Optionally render button -->
  <q-btn
    ref="element"
    v-if="type == 'button'"
    v-bind="elementProps"
    @click.stop="elementProps.on?.click?.()"
  />

  <!-- Optionally render input -->
  <os-input
    ref="element"
    v-else-if="type == 'input'"
    v-model="model"
    v-bind="elementProps"
    v-on:keyup.enter="element.blur?.()"
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
  <q-icon ref="element" v-else-if="type == 'icon'" v-bind="elementProps" />

  <!-- Optionally render chip -->
  <q-chip ref="element" v-else-if="type == 'chip'" v-bind="elementProps" />

  <!-- Optionally render avatar -->
  <q-avatar ref="element" v-else-if="type == 'avatar'" v-bind="elementProps">
    <img v-if="elementProps.src" :src="elementProps.src" />
  </q-avatar>

  <!-- Render string otherwise -->
  <div ref="element" v-else>{{ props.props }}</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

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

// Perform operations on mounted element
onMounted(() => {
  if (type.value == "input" && elementProps.value.focus)
    element.value.focus?.();
});
</script>
