<template>
  <os-table
    :columns="columns"
    v-model:selected="selectedRows"
    :rows="rows"
    row-key="uid"
    virtual-scroll
    flat
    bordered
    hide-pagination
    :class="
      $q.screen.lt.md
        ? 'os-table-max-height-with-header justify-center'
        : 'os-table-max-height justify-center'
    "
    selection="single"
    :sort-by="sortBy"
    @row-click="
      (...params: [Event, object, number]) => emit('selection', ...params)
    "
  ></os-table>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { Program } from 'src/helpers/programs/program';
import { useI18n } from 'vue-i18n';
import { NamedRoutes } from 'src/router';
import { dateFromStringLocale } from 'src/helpers/scalar';
import { symOutlinedOpenInNew } from '@quasar/extras/material-symbols-outlined';

// Init plugin
const $q = useQuasar();
const i18n = useI18n();

// Define props
const props = withDefaults(
  defineProps<{
    // programs to display
    programs: Program[];

    // model value of currently selected program
    selected?: Program;

    // optional list of specific fields to display
    showFields?: (keyof Program)[];

    // whether to shorten the list of fields to display, only used if showFields is undefined
    small?: boolean;

    // select active program to highlight in table
    activeProgram?: Program;

    // whether to show action buttons on table rows
    allowInfo?: boolean;
    allowOpen?: boolean;
    allowDelete?: boolean;

    // show labels under each action button
    showButtonLabel?: boolean;

    // select column to sort at the beginning
    sortBy?: string;
  }>(),
  {
    small: false,
    allowInfo: false,
    allowOpen: false,
    allowDelete: false,
    showButtonLabel: false,
    sortBy: '-lastUpdated',
  }
);

// Define emits
const emit = defineEmits<{
  selection: [evt: Event, row: object, index: number];
  'update:selected': [value?: Program];
  info: [program: Program];
  delete: [program: Program];
}>();

// Set table columns
const columns = computed(() => {
  const showFields: (keyof Program)[] =
    props.showFields ??
    (props.small
      ? ['name', 'athlete']
      : ['name', 'athlete', 'startedOn', 'finishedOn', 'lastUpdated']);
  const outColumns = [];
  showFields.forEach((key) => {
    switch (key) {
      case 'name':
        outColumns.push({
          name: 'name',
          required: true,
          label: i18n.t('coach.program_management.fields.program'),
          align: 'center',
          field: 'name',
          sortable: true,
        });
        break;
      case 'athlete':
        outColumns.push({
          name: 'athleteName',
          required: true,
          label: i18n.t('coach.program_management.fields.athlete'),
          align: 'center',
          field: 'athleteName',
          sortable: true,
        });
        break;
      case 'startedOn':
        outColumns.push({
          name: 'startedOn',
          required: true,
          label: i18n.t('common.start'),
          align: 'center',
          field: 'startedOn',
          sortable: true,
          sort: (a: string, b: string) =>
            (dateFromStringLocale(a, 'short') as any) -
            (dateFromStringLocale(b, 'short') as any),
        });
        break;
      case 'finishedOn':
        outColumns.push({
          name: 'finishedOn',
          required: true,
          label: i18n.t('common.end'),
          align: 'center',
          field: 'finishedOn',
          sortable: true,
          sort: (a: string, b: string) =>
            (dateFromStringLocale(a, 'short') as any) -
            (dateFromStringLocale(b, 'short') as any),
        });
        break;
      case 'lastUpdated':
        outColumns.push({
          name: 'lastUpdated',
          required: true,
          label: i18n.t('coach.program_management.fields.last_modification'),
          align: 'center',
          field: 'lastUpdated',
          sortable: true,
          sort: (a: string, b: string) =>
            (dateFromStringLocale(a, 'short') as any) -
            (dateFromStringLocale(b, 'short') as any),
        });
        break;
    }
  });
  if (props.allowInfo)
    outColumns.push({
      name: 'oninfo',
      align: 'center',
      label: '',
      field: 'oninfo',
    });
  if (props.allowOpen)
    outColumns.push({
      name: 'onopen',
      align: 'center',
      label: '',
      field: 'onopen',
    });
  if (props.allowDelete)
    outColumns.push({
      name: 'ondelete',
      align: 'center',
      label: '',
      field: 'ondelete',
    });
  if (props.activeProgram)
    outColumns.splice(1, 0, {
      name: 'ongoing',
      align: 'center',
      label: '',
      field: 'ongoing',
    });
  return outColumns;
});

// Set table rows
const rows = computed(() => {
  if (!Array.isArray(props.programs) || props.programs == undefined) {
    return [];
  }
  return props.programs.map((program) => ({
    uid: program.uid,
    name: program.name,
    athleteName:
      program.athlete?.referenceName ??
      i18n.t('coach.program_management.list.not_assigned'),
    startedOn: program.startedOn
      ? i18n.d(program.startedOn, 'short')
      : i18n.t('coach.program_management.list.not_selected'),
    finishedOn: program.finishedOn
      ? i18n.d(program.finishedOn, 'short')
      : i18n.t('coach.program_management.list.not_selected'),
    lastUpdated: program.lastUpdated
      ? i18n.d(program.lastUpdated, 'middle')
      : i18n.t('coach.program_management.list.not_selected'),
    ongoing:
      props.activeProgram == program
        ? {
            element: 'chip',
            label: i18n.t('coach.athlete_management.fields.program_ongoing'),
            color: 'positive',
            size: 'sm',
          }
        : '',
    oninfo: {
      element: 'button',
      on: { click: () => emit('info', program) },
      icon: 'info',
      flat: true,
      round: true,
      label: props.showButtonLabel ? i18n.t('common.info') : undefined,
      stack: true,
      color: 'button-negative',
    },
    onopen: {
      element: 'button',
      to: { name: NamedRoutes.program, params: { programId: program.uid } },
      icon: symOutlinedOpenInNew,
      flat: true,
      round: true,
      label: props.showButtonLabel ? i18n.t('common.open') : undefined,
      stack: true,
      color: 'button-negative',
    },
    ondelete: {
      element: 'button',
      on: { click: () => emit('delete', program) },
      icon: 'delete',
      flat: true,
      round: true,
      label: props.showButtonLabel ? i18n.t('common.delete') : undefined,
      stack: true,
      color: 'button-negative',
    },
  }));
});

// Set ref
const selectedRows = ref<typeof rows.value>();

// Update selected rows upon selected program change
watch(
  () => props.selected,
  (selectedProgram) => {
    const selectedRow = rows.value.find(
      (row) => row.uid == selectedProgram?.uid
    );
    if (selectedRow) selectedRows.value = [selectedRow];
  },
  { immediate: true }
);

// Update selected program upon program row change
watch(selectedRows, (value) =>
  emit(
    'update:selected',
    props.programs.find((program) =>
      value && value.length > 0 ? program.uid === value[0].uid : undefined
    )
  )
);
</script>

<style scoped lang="scss">
.os-table-max-height {
  max-height: calc(100vh - 255px);
}

.os-table-max-height-with-header {
  max-height: calc(100vh - 255px - 50px);
}
</style>
