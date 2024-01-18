<template>
  <div>
    <q-btn-group
      unelevated
      :style="`margin-top: -${gutter}; margin-left: -${gutter}`"
    >
      <q-btn
        v-for="(icon, idx) in icons"
        :key="icon"
        @click="$emit('click', idx, icon)"
        :color="isHover[idx] ? hoverColors[idx] : colors[idx]"
        :label="labels?.[idx]"
        :icon="icon"
        @mouseover="isHover[idx] = true"
        @mouseleave="isHover[idx] = false"
        dense
        size="0.6em"
        class="support-btn q-pa-sm"
        :class="`support-btn-${direction}`"
      >
        <q-tooltip
          v-if="tooltips?.[idx]"
          anchor="top middle"
          :offset="[0, 40]"
          :delay="250"
        >
          {{ tooltips[idx] }}
        </q-tooltip>

        <slot :name="`slot-${idx}`"></slot>
      </q-btn>
    </q-btn-group>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";

// Define props
const props = withDefaults(
  defineProps<{
    icons: string[];
    labels?: (string | undefined)[];
    colors?: (string | undefined)[];
    hoverColors?: (string | undefined)[];
    tooltips?: (string | undefined)[];
    gutter?: string;
    direction: "t" | "b" | "l" | "r";
  }>(),
  { gutter: "1px", direction: "t" },
);

// Define emits
defineEmits<{
  click: [idx: number, id: string];
}>();

// Hover status
const isHover = ref<boolean[]>([]);

// Set colors
const colors = computed(() =>
  props.icons.map((_, idx) => props.colors?.[idx] ?? "light"),
);
const hoverColors = computed(() =>
  colors.value.map((color, idx) => props.hoverColors?.[idx] ?? color),
);

// Init over status
watch(
  () => props.icons,
  (val) => (isHover.value = Array(val.length).fill(false)),
);
</script>

<style scoped lang="scss">
.support-btn {
  margin-top: v-bind(gutter);
  margin-left: v-bind(gutter);

  &.support-btn-t {
    border-radius: 4px 4px 0 0;
  }

  &.support-btn-b {
    border-radius: 0 0 4px 4px;
  }

  &.support-btn-l {
    border-radius: 4px 0 0 4px;
  }

  &.support-btn-r {
    border-radius: 0 4px 4px 0;
  }
}
</style>
