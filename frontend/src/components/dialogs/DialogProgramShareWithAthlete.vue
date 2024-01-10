<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="(value) => emit('update:modelValue', value)"
  >
    <q-card>
      <q-card-section>
        <os-text-copyable :text="urlFullPath"></os-text-copyable>
      </q-card-section>
      <q-card-section>
        <!-- TODO i18n title and description -->
        <os-social-sharing-items
          :url="urlFullPath"
          :networks="[
            'whatsapp',
            'telegram',
            $q.platform.is.mobile ? 'messenger' : 'facebook',
            'email',
          ]"
          title="Il tuo programma è pronto!"
          description="Puoi vedere i dettagli sul tuo programma a questo link."
          padding="xs"
          class="row items-center q-gutter-x-sm"
        ></os-social-sharing-items>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from "vue";
import router, { NamedRoutes } from "@/router";
import { useQuasar } from "quasar";

// Init plugin
const $q = useQuasar();

// Define props
const props = defineProps<{
  modelValue: boolean;
  programId: string;
}>();

// Define emits
const emit = defineEmits<{
  "update:modelValue": [value: Boolean];
}>();

// Get full shareable path
const urlFullPath = computed(
  () =>
    window.location.origin +
    router.resolve({
      name: NamedRoutes.view_program,
      query: { id: props.programId },
    }).fullPath,
);
</script>
