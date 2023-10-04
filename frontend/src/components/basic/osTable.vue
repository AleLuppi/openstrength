<template>
  <q-table
    v-bind="$attrs"
    flat
    wrap-cells
    separator="none"
    :pagination="{ rowsPerPage: 0 }"
    :hide-pagination="
      Boolean($attrs.hidePagination) || ($attrs.rows ?? []).length < 10
    "
    :rows-per-page-options="[10, 25, 50, 100, 0]"
    row-key="name"
  >
    <!-- Set header style -->
    <template v-slot:header="props">
      <q-tr :props="props">
        <q-th
          v-for="col in props.cols"
          :key="col.name"
          :props="props"
          class="text-h6 text-table-header text-uppercase text-weight-medium"
          style="border-bottom-width: 1px"
        >
          {{ col.label }}
        </q-th>
      </q-tr>
    </template>

    <!-- Set custom cells -->
    <template v-slot:body-cell="props">
      <q-td :props="props">
        <!-- Optionally render button -->
        <q-btn
          v-if="props.value && props.value.element == 'button'"
          v-bind="props.value"
          v-on="props.value.on"
        />

        <!-- Optionally render icon -->
        <q-icon
          v-else-if="props.value && props.value.element == 'icon'"
          v-bind="props.value"
        />

        <!-- Optionally render chip -->
        <q-chip
          v-else-if="props.value && props.value.element == 'chip'"
          v-bind="props.value"
        />

        <!-- Optionally render avatar -->
        <q-avatar
          v-else-if="props.value && props.value.element == 'avatar'"
          v-bind="props.value"
        >
          <img v-if="props.value.src" :src="props.value.src" />
        </q-avatar>

        <!-- Render string otherwise -->
        <div v-else>{{ props.value }}</div>
      </q-td>
    </template>
  </q-table>
</template>
