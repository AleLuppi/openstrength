<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="(value) => emits('update:modelValue', value)"
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
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </os-input>
        </div>
      </q-card-section>

      <q-separator />

      <TableManagedAthletes
        ref="athletesTableElement"
        :athletes="athletes"
        @selection="onAthleteSelection"
        :selected="selected"
        @update:selected="(val) => emits('update:selected', val)"
        :filter="searchAthlete"
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
const emits = defineEmits<{
  "update:modelValue": [value: Boolean];
  selection: [evt: Event, row: Object, index: Number];
  "update:selected": [value?: AthleteUser];
}>();

// Set ref
const searchAthlete = ref<string>();

// Set what to do on athlete selection
function onAthleteSelection(...params: [Event, Object, Number]) {
  searchAthlete.value = "";
  emits("update:modelValue", false);
  emits("selection", ...params);
}
</script>
