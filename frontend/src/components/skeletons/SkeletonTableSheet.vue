<template>
  <div class="q-pa-md">
    <q-markup-table>
      <tbody>
        <tr v-for="row in rows" :key="`row${row}`">
          <td
            v-for="col in columns"
            :key="`col${col}`"
            class="text-left"
            :style="{ width: widths?.[col - 1] ?? 'unset' }"
          >
            <q-skeleton
              animation="blink"
              :type="types?.[col - 1] ?? 'text'"
              :width="internalWidths?.[col - 1] ?? '100%'"
            />
          </td>
        </tr>
      </tbody>
    </q-markup-table>
  </div>
</template>

<script setup lang="ts">
import type { QSkeletonProps } from "quasar";

withDefaults(
  defineProps<{
    rows?: number;
    columns?: number;
    widths?: string[];
    types?: QSkeletonProps["type"][];
    internalWidths?: string[];
  }>(),
  { rows: 5, columns: 5 },
);
</script>
