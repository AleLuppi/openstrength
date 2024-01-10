<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="(value) => emit('update:modelValue', value)"
  >
    <q-card>
      <q-card-section>
        <div class="column justify-center items-center">
          <h6>{{ $t("coach.program_management.viewer.dialog_title") }}</h6>
          <os-text-copyable :text="urlFullPath"></os-text-copyable>
          <router-link :to="urlRelativePath" target="_blank" class="q-mt-sm">
            {{ $t("coach.program_management.viewer.preview") }}
          </router-link>
        </div>
      </q-card-section>
      <!-- TODO: solve console errors -->
      <!--   <q-card-section>
        <os-social-sharing-items
          :url="urlFullPath"
          :networks="['whatsapp', 'telegram', 'email']"
          :title="$t('coach.program_management.viewer.send_program_title')"
          :description="
            $t('coach.program_management.viewer.send_program_description')
          "
          padding="xs"
          class="row items-center q-gutter-x-sm"
        ></os-social-sharing-items>
      </q-card-section> -->
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from "vue";
import router, { NamedRoutes } from "@/router";

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

// Get relative path for preview
const urlRelativePath = computed(
  () =>
    router.resolve({
      name: NamedRoutes.view_program,
      query: { id: props.programId },
    }).fullPath,
);
</script>
