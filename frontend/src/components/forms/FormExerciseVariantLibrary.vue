<template>
  <q-form @submit="onSubmit">
    <div class="row q-col-gutter-x-md">
      <!-- Variant name with exercise name -->
      <os-input
        v-model="variantName"
        :label="$t('coach.exercise_management.fields.variant')"
        :rules="[
          (name: string) =>
            props.variant.exercise?.variants?.reduce(
              (response, variant) =>
                response &&
                (variant == props.variant ||
                  (Boolean(name) && variant.name != name) ||
                  (!Boolean(name) && !variant.isDefault)),
              true,
            ) || $t('coach.exercise_management.add_variant_already_exists'),
        ]"
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
        use-input
        :options="variantMuscleGroupsOptions"
        emit-value
        map-options
        multiple
        class="col-12"
      />

      <os-select
        v-model="variantLoadType"
        :label="$t('coach.exercise_management.fields.loadtype')"
        :options="variantLoadTypeOptions"
        emit-value
        map-options
        class="col-12 col-md-6"
      />

      <os-select
        v-model="variantEquipment"
        :label="$t('coach.exercise_management.fields.equipment')"
        use-input
        :options="variantEquipmentOptions"
        emit-value
        map-options
        multiple
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
import { ref, computed, onMounted, PropType } from "vue";
import { useI18n } from "vue-i18n";
import {
  ExerciseVariant,
  ExerciseLoadType,
  ExerciseMuscleGroups,
  ExerciseEquipment,
} from "@/helpers/exercises/exercise";
import { uniqueValues } from "@/helpers/array";

// Init plugin
const i18n = useI18n();

// Set props
const props = defineProps({
  variant: {
    type: ExerciseVariant,
    required: true,
  },
  onSubmit: {
    type: Function,
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

// Set ref
const variantName = ref<string>();
const variantMuscleGroups = ref<string[]>();
const variantLoadType = ref<string>();
const variantEquipment = ref<string[]>();
const variantVideo = ref<string>();
const variantDescription = ref<string>();

// Update shown info according to selected variant
function loadVariant(variant: ExerciseVariant) {
  variantName.value = variant.name;
  variantMuscleGroups.value = variant.muscleGroups;
  variantLoadType.value = variant.loadType;
  variantEquipment.value = variant.equipment;
  variantVideo.value = variant.videoUrl;
  variantDescription.value = variant.description;
}

// Get options for select fields
const variantMuscleGroupsOptions = computed(() =>
  uniqueValues(
    Object.keys(ExerciseMuscleGroups).concat(
      props.optionsMuscleGroups ?? props.variant.muscleGroups ?? [],
    ),
  )
    .sort()
    .map((val) => ({
      label: Object.values(ExerciseMuscleGroups).includes(val)
        ? i18n.t(
            "coach.exercise_management.fields.musclegroups_available." + val,
          )
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
  uniqueValues(
    Object.keys(ExerciseEquipment).concat(
      props.optionsEquipment ?? props.variant.equipment ?? [],
    ),
  )
    .sort()
    .map((val) => ({
      label: Object.values(ExerciseEquipment).includes(val)
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
  variant.name = variantName.value;
  variant.muscleGroups = variantMuscleGroups.value;
  variant.loadType = variantLoadType.value as ExerciseLoadType;
  variant.equipment = variantEquipment.value;
  variant.videoUrl = variantVideo.value;
  variant.description = variantDescription.value;

  props.onSubmit?.(variant);
}

onMounted(() => {
  loadVariant(props.variant);
});
</script>
