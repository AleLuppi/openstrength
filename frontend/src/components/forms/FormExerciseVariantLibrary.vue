<template>
  <q-form ref="formElement" @submit="onSubmit" @reset="onReset">
    <div class="row q-col-gutter-x-md">
      <!-- Variant name with exercise name -->
      <os-input
        v-model="variantName"
        :label="$t('coach.exercise_management.fields.variant')"
        :rules="[
          (name: string) =>
            variant.isDefault ||
            (Boolean(name) &&
              !props.variant.exercise?.variants?.some(
                (variant) => variant != props.variant && variant.name == name,
              )) ||
            $t('coach.exercise_management.add_variant_already_exists'),
        ]"
        :disable="variant.isDefault"
        required
        class="col-12"
      >
        <template v-slot:before>
          <span class="text-bold text-h6" style="font-size: medium">
            {{ props.variant.exercise?.name + " - " }}
          </span>
        </template>
      </os-input>

      <os-select
        v-model="variantMuscleGroups"
        :label="$t('coach.exercise_management.fields.musclegroups')"
        :options="variantMuscleGroupsOptions"
        emit-value
        map-options
        multiple
        use-input
        new-value-mode="add-unique"
        class="col-12"
      />

      <os-select
        v-model="variantLoadType"
        :label="$t('coach.exercise_management.fields.loadtype')"
        :options="variantLoadTypeOptions"
        emit-value
        map-options
        class="col-12 col-md-6"
        required
      />

      <os-select
        v-model="variantEquipment"
        :label="$t('coach.exercise_management.fields.equipment')"
        :options="variantEquipmentOptions"
        emit-value
        map-options
        multiple
        use-input
        new-value-mode="add-unique"
        class="col-12 col-md-6"
      />

      <os-input
        v-model="variantVideo"
        :label="$t('coach.exercise_management.fields.video')"
        class="col-12"
      />

      <os-input
        v-model="variantDescription"
        :label="$t('coach.exercise_management.fields.description')"
        type="textarea"
        class="col-12"
      />
    </div>

    <q-btn
      type="submit"
      :label="$t('coach.exercise_management.add_proceed')"
      class="full-width"
    ></q-btn>
  </q-form>
</template>

<script setup lang="ts">
import { ref, computed, watch, PropType } from "vue";
import { useI18n } from "vue-i18n";
import type { QForm } from "quasar";
import {
  ExerciseVariant,
  ExerciseLoadType,
  ExerciseMuscleGroups,
  ExerciseEquipment,
} from "@/helpers/exercises/exercise";
import { arrayUniqueValues } from "@/helpers/array";

// Init plugin
const i18n = useI18n();

// Set props
const props = defineProps({
  variant: {
    type: ExerciseVariant,
    required: true,
  },
  optionsMuscleGroups: {
    type: Array as PropType<ExerciseMuscleGroups[]>,
    default: undefined,
  },
  optionsEquipment: {
    type: Array as PropType<ExerciseEquipment[]>,
    default: undefined,
  },
});

// Define emits
const emit = defineEmits<{
  submit: [variant: ExerciseVariant];
}>();

// Set expose
defineExpose({
  focus: () => formElement.value?.focus(),
  validate: (shouldFocus?: boolean) => formElement.value?.validate(shouldFocus),
  resetValidation: () => formElement.value?.resetValidation(),
  submit: (evt?: Event) => formElement.value?.submit(evt),
  reset: (evt?: Event) => formElement.value?.reset(evt),
  getValidationComponents: () => formElement.value?.getValidationComponents(),
});

// Set ref
const formElement = ref<QForm>();
const variantName = ref<string>();
const variantMuscleGroups = ref<ExerciseMuscleGroups[]>();
const variantLoadType = ref<string>();
const variantEquipment = ref<string[]>();
const variantVideo = ref<string>();
const variantDescription = ref<string>();

// Update shown info according to selected variant
watch(
  props.variant,
  (variant: ExerciseVariant) => {
    variantName.value = variant.isDefault
      ? i18n.t("coach.exercise_management.default_variant")
      : variant.name;
    variantMuscleGroups.value = variant.muscleGroups;
    variantLoadType.value = variant.loadType;
    variantEquipment.value = variant.equipment;
    variantVideo.value = variant.videoUrl;
    variantDescription.value = variant.description;
  },
  { immediate: true },
);

// Get options for select fields
const variantMuscleGroupsOptions = computed(() =>
  arrayUniqueValues(
    Object.keys(ExerciseMuscleGroups).concat(
      props.optionsMuscleGroups ?? props.variant.muscleGroups ?? [],
    ),
  ).map((val) => ({
    label: Object.values(ExerciseMuscleGroups).includes(
      val as ExerciseMuscleGroups,
    )
      ? i18n.t("coach.exercise_management.fields.musclegroups_available." + val)
      : val,
    value: val,
  })),
);
const variantLoadTypeOptions = computed(() =>
  Object.keys(ExerciseLoadType)
    .sort()
    .map((val) => ({
      label: i18n.t(
        "coach.exercise_management.fields.loadtype_available." + val,
      ),
      value: val,
    })),
);
const variantEquipmentOptions = computed(() =>
  arrayUniqueValues(
    Object.keys(ExerciseEquipment).concat(
      props.optionsEquipment ?? props.variant.equipment ?? [],
    ),
  ).map((val) => ({
    label: Object.values(ExerciseEquipment).includes(val as ExerciseEquipment)
      ? i18n.t("coach.exercise_management.fields.equipment_available." + val)
      : val,
    value: val,
  })),
);

/**
 * Perform operations on form submit.
 */
function onSubmit() {
  const variant = props.variant;
  variant.name = variant.isDefault ? undefined : variantName.value;
  variant.muscleGroups = variantMuscleGroups.value;
  variant.loadType = variantLoadType.value as ExerciseLoadType;
  variant.equipment = variantEquipment.value;
  variant.videoUrl = variantVideo.value;
  variant.description = variantDescription.value;

  emit("submit", variant);
}

/**
 * Perform operations on form reset.
 */
function onReset() {
  variantName.value = undefined;
  variantMuscleGroups.value = undefined;
  variantLoadType.value = undefined;
  variantEquipment.value = undefined;
  variantVideo.value = undefined;
  variantDescription.value = undefined;
}
</script>
