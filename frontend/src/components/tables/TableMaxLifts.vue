<template>
  <os-table
    :columns="columns"
    :rows="rows"
    row-key="rowId"
    virtual-scroll
    class="os-table-max-height"
    hide-pagination
    selection="single"
  ></os-table>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { MaxLift } from "@/helpers/maxlifts/maxlift";

// Init plugin
const $q = useQuasar();
const i18n = useI18n();

// Define props
const props = defineProps({
  maxlifts: {
    type: Array as PropType<MaxLift[]>,
    required: true,
  },
});

// Define emits
const emit = defineEmits<{
  update: [maxlift: MaxLift];
}>();

// Set table columns
const columns = [
  {
    name: "exercise",
    required: true,
    label: i18n.t("coach.maxlift_management.fields.exercise"),
    align: "left",
    field: "exercise",
    sortable: true,
  },
  {
    name: "type",
    align: "left",
    label: i18n.t("coach.maxlift_management.fields.type"),
    field: "type",
  },
  ...(!$q.screen.lt.sm
    ? [
        {
          name: "value",
          align: "left",
          label: i18n.t("coach.maxlift_management.fields.value"),
          field: "value",
        },
        {
          name: "date",
          align: "left",
          label: i18n.t("coach.maxlift_management.fields.date"),
          field: "date",
        },
      ]
    : []),
  {
    name: "update",
    align: "center",
    label: "",
    field: "update",
  },
];

// Set table rows
const rows = computed(() => {
  return props.maxlifts.map((maxlift) => ({
    exercise: maxlift.exercise?.name ?? "",
    type: maxlift.type ?? "",
    value: maxlift.value ?? "",
    date: maxlift.performedOn ? i18n.d(maxlift.performedOn) : "",
    update: {
      element: "button",
      on: { click: () => emit("update", maxlift) },
      label: "",
      icon: "update",
      rounded: true,
      outline: true,
      color: "button-primary",
    },
    rowId: maxlift.uid,
  }));
});
</script>

<style scoped lang="scss">
.os-table-max-height {
  max-height: calc(100vh - 128px);
}
</style>
