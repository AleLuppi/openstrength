<template>
  <q-list>
    <q-item
      clickable
      class="q-pa-xs link-child os-text-unselected"
      @click="showCharts"
    >
      <q-card
        :class="{ 'bg-primary': props.onCharts }"
        flat
        class="os-right-drawer bg-inherit"
      >
        <q-tooltip anchor="center left" self="center right" :offset="[10, 10]">
          Charts
        </q-tooltip>
        <q-avatar icon="fa-solid fa-chart-line" />
      </q-card>
    </q-item>

    <q-item
      clickable
      class="q-pa-xs link-child os-text-unselected"
      @click="showReferenceTable"
    >
      <q-card
        :class="{ 'bg-primary': props.onReferenceTable }"
        flat
        class="os-right-drawer bg-inherit"
      >
        <q-tooltip anchor="center left" self="center right" :offset="[10, 10]">
          Reference Table
        </q-tooltip>
        <q-avatar icon="fa-solid fa-table-list" />
      </q-card>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
const props = defineProps({
  zIndex: {
    type: Number,
    default: 0,
  },
  isHidden: Boolean,
  isSmall: Boolean,
  isBig: Boolean,
  onCharts: Boolean,
  onReferenceTable: Boolean,
});

const emits = defineEmits([
  "update:isHidden",
  "update:isSmall",
  "update:isBig",
  "update:onCharts",
  "update:onReferenceTable",
]);

const showCharts = () => {
  emits("update:onCharts", true);
  emits("update:onReferenceTable", false);
  emits("update:isSmall", true);
  emits("update:isBig", false);
  emits("update:isHidden", false);
};

const showReferenceTable = () => {
  emits("update:onCharts", false);
  emits("update:onReferenceTable", true);
  emits("update:isSmall", true);
  emits("update:isBig", false);
  emits("update:isHidden", false);
};
</script>

<style scoped lang="scss">
/* Hidden Card */
.os-right-drawer {
  width: 48px;
  height: 100%;
  /* Covers the whole available height */
  right: 0;
  /* Align to the right */
  top: 0;
  /* Vertically centered */
}
</style>
