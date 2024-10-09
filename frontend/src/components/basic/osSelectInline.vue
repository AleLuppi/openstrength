<template>
  <q-btn flat rounded :color="textColor">
    {{ label }} <q-chip dense :color="chipColor">{{ modelValue }}</q-chip>
    <q-popup-edit
      v-slot="popupScope"
      v-model="modelValue"
      cover
      anchor="center left"
      class="q-px-md"
      style="border-radius: 32px"
    >
      <div class="row items-start">
        <span class="text-weight-medium q-pt-xs">{{ label }}</span>
        <div class="row items-start col">
          <q-chip
            v-for="opt in options"
            :key="opt"
            dense
            clickable
            :color="
              opt == popupScope.value && chipSelectedColor
                ? chipSelectedColor
                : chipColor
            "
            :class="{ 'text-bold': opt == popupScope.value }"
            @click="
              popupScope.value = opt;
              popupScope.set();
            "
          >
            {{ opt }}
          </q-chip>
        </div>
      </div>
    </q-popup-edit>
  </q-btn>
</template>

<script setup lang="ts">
// Define props
withDefaults(
  defineProps<{
    // label to display
    label: string;

    // options
    options?: string[];

    // colors
    textColor?: string;
    chipColor?: string;
    chipSelectedColor?: string;
  }>(),
  { options: () => [], textColor: "black", chipColor: "blue-2" },
);

// eslint-disable-next-line
const modelValue = defineModel<string>({ required: true });
</script>
