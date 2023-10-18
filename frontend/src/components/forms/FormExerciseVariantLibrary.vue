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
        :options="
          (
            Object.keys(
              ExerciseMuscleGroups,
            ) as (keyof typeof ExerciseMuscleGroups)[]
          ).map((val) => ({
            label: $t(
              'coach.exercise_management.fields.musclegroupsList.' + val,
            ),
            value: val,
          }))
        "
        multiple
        class="col-12"
      />

      <os-select
        v-model="variantLoadType"
        :label="$t('coach.exercise_management.fields.loadtype')"
        :options="
          (
            Object.keys(ExerciseLoadType) as (keyof typeof ExerciseLoadType)[]
          ).map((val) => ({
            label: $t('coach.exercise_management.fields.loadtypes.' + val),
            value: val,
          }))
        "
        emit-value
        map-options
        class="col-12 col-md-6"
      />

      <os-select
        v-model="variantEquipment"
        :label="$t('coach.exercise_management.fields.equipment')"
        use-input
        :options="
          (
            Object.keys(ExerciseEquipment) as (keyof typeof ExerciseEquipment)[]
          ).map((val) => ({
            label: $t('coach.exercise_management.fields.equipmentList.' + val),
            value: val,
          }))
        "
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
import { ref, onMounted, PropType } from "vue";
import {
  ExerciseVariant,
  ExerciseLoadType,
  ExerciseMuscleGroups,
  ExerciseEquipment,
} from "@/helpers/exercises/exercise";

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
    type: Array as PropType<string[]>,
    default: undefined,
  },
  optionsEquipment: {
    type: Array as PropType<string[]>,
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
