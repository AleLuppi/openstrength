<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="(value) => emit('update:modelValue', value)"
  >
    <q-card>
      <q-card-section>
        <div class="row q-gutter-x-md items-center">
          <os-input
            v-model="searchAthlete"
            :placeholder="$t('coach.athlete_management.list.search')"
            hide-bottom-space
            debounce="500"
            class="col"
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </os-input>
        </div>
      </q-card-section>

      <q-separator />

      <TableManagedAthletes
        ref="athletesTableElement"
        :athletes="athletes"
        :selected="selected"
        :filter="searchAthlete"
        @selection="onAthleteSelection"
        @update:selected="(val) => emit('update:selected', val)"
      />
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, PropType } from "vue";
import { AthleteUser } from "@/helpers/users/user";
import TableManagedAthletes from "../tables/TableManagedAthletes.vue";

// Define props
defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  athletes: {
    type: Array as PropType<AthleteUser[]>,
    required: true,
  },
  selected: {
    type: AthleteUser,
    required: false,
  },
});

// Define emits
const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  selection: [evt: Event, row: object, index: number];
  "update:selected": [value?: AthleteUser];
}>();

// Set ref
const searchAthlete = ref<string>();

// Set what to do on athlete selection
function onAthleteSelection(...params: [Event, object, number]) {
  searchAthlete.value = "";
  emit("selection", ...params);
  setTimeout(() => emit("update:modelValue", false), 10);
}
</script>
