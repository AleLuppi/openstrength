<template>
  <!-- MAX LIFT SECTION -->
  <q-card>
    <q-card-section>
      <div class="row q-gutter-x-md items-center">
        <os-input
          v-model="searchMaxLift"
          :placeholder="$t('coach.maxlift_management.list.search_maxlift')"
          hide-bottom-space
          debounce="500"
          class="col"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </os-input>

        <!-- Add new maxlift -->
        <q-btn
          icon="add"
          outline
          @click="
            updatingMaxLift = undefined;
            showMaxLiftAddDialog = true;
          "
        />
      </div>
    </q-card-section>

    <q-separator />

    <TableMaxLifts
      :maxlifts="athleteMaxlifts"
      :on-update="onUpdateMaxLift"
      :filter="searchMaxLift"
    />

    <!-- Dialog to add a new max lift -->
    <q-dialog
      v-model="showMaxLiftAddDialog"
      @hide="updatingMaxLift ? clearMaxLift() : {}"
    >
      <q-card class="q-pa-sm dialog-min-width">
        <q-card-section class="row items-center q-pb-none">
          <h5>
            {{
              updatingMaxLift
                ? $t("coach.maxlift_management.list.update")
                : $t("coach.maxlift_management.list.add")
            }}
          </h5>

          <q-space />
          <q-btn
            icon="close"
            flat
            round
            dense
            color="button-negative"
            v-close-popup
          />
        </q-card-section>

        <q-form
          @submit="updatingMaxLift ? updateMaxLift() : createMaxLift()"
          @reset="clearMaxLift"
          class="q-my-md q-gutter-sm column"
        >
          <q-card-section class="q-gutter-x-xs">
            <os-select
              v-model="selectedExercise"
              :label="$t('coach.maxlift_management.fields.exercise')"
              :options="exercises.map((exercise) => exercise.name)"
              emit-value
              map-options
              dense
            >
            </os-select>

            <!-- TYPE -->
            <os-select
              v-model="maxliftType"
              :label="$t('coach.maxlift_management.fields.type')"
              use-input
              :options="availableMaxLiftTypes"
              emit-value
              map-options
              class="col-12"
            />

            <!-- VALUE -->
            <os-input
              v-model="maxliftValue"
              :suffix="maxliftValueSuffix"
              :label="$t('coach.maxlift_management.fields.value')"
            ></os-input>

            <p
              class="text-input-top-label text-uppercase text-weight-medium text-left"
              style="line-height: 1.6em"
            >
              {{ i18n.t("coach.maxlift_management.fields.date") }}
            </p>
            <q-input
              outlined
              dense
              v-model="maxliftDate"
              mask="date"
              :rules="['date']"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date v-model="maxliftDate">
                      <div class="row items-center justify-end">
                        <q-btn
                          v-close-popup
                          label="Close"
                          color="primary"
                          flat
                        />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat :label="$t('common.cancel')" type="reset" />
            <q-btn
              :label="
                updatingMaxLift
                  ? $t('coach.maxlift_management.list.update_proceed')
                  : $t('coach.maxlift_management.list.add_proceed')
              "
              type="submit"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed, PropType } from "vue";

import { useCoachInfoStore } from "@/stores/coachInfo";
import TableMaxLifts from "@/components/tables/TableMaxLifts.vue";
import { MaxLift, MaxLiftType } from "@/helpers/maxlifts/maxlift";
import { useUserStore } from "@/stores/user";
import { Exercise } from "@/helpers/exercises/exercise";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { AthleteUser } from "@/helpers/users/user";

// Use plugins
const $q = useQuasar();
const i18n = useI18n();

// Get store
const user = useUserStore();
const coachInfo = useCoachInfoStore();

// Define props
const props = defineProps({
  athlete: {
    type: AthleteUser as PropType<AthleteUser | undefined>,
    required: true,
  },
});

// Max lift declarations
const searchMaxLift = ref<string>();
const updatingMaxLift = ref<MaxLift>();
const showMaxLiftAddDialog = ref(false);

const selectedExercise = ref<Exercise | undefined>();

const maxliftType = ref<MaxLiftType>(); // TODO check
const availableMaxLiftTypes: string[] = Object.values(MaxLiftType);
const maxliftValue = ref(""); // TODO check
const maxliftDate = ref<Date>(); // TODO check

// Get exercises to display
const exercises = computed<Exercise[]>(() => {
  coachInfo.loadExercises(user.uid, true);
  return coachInfo.exercises || [];
});

// Get maxlifts for a coach to display
const maxlifts = computed(() => {
  coachInfo.loadMaxLifts(user.uid, true);
  return coachInfo.maxlifts || [];
});

// Get maxlifts for the selected athlete
const athleteMaxlifts = maxlifts.value.filter(
  (maxlift: MaxLift) =>
    maxlift.athleteId === props.athlete?.uid ||
    maxlift.coachId === props.athlete?.coachId,
);

console.log("sel athlete", props.athlete);
console.log("selectedath.uid", props.athlete?.uid);
console.log("user.uid", user.uid);
console.log("athleteMaxlifts", athleteMaxlifts);

const maxliftValueSuffix = computed(() => {
  if (maxliftType.value === MaxLiftType._1RM) {
    return "kg";
  } else if (maxliftType.value === MaxLiftType._3RM) {
    return "kg";
  } else if (maxliftType.value === MaxLiftType._5RM) {
    return "kg";
  } else if (maxliftType.value === MaxLiftType._6RM) {
    return "kg";
  } else if (maxliftType.value === MaxLiftType._8RM) {
    return "kg";
  } else if (maxliftType.value === MaxLiftType._10RM) {
    return "kg";
  } else if (maxliftType.value === MaxLiftType._maxrep) {
    return "reps";
  } else if (maxliftType.value === MaxLiftType._maxtime) {
    return "s";
  } else {
    return ""; //
  }
});

/** TODO check
 * Create a new maxlift and assign to a coach
 */
function createMaxLift() {
  const newMaxLift = new MaxLift({
    exercise: selectedExercise.value,
    type: maxliftType.value,
    value: maxliftValue.value,
    lastUpdated: maxliftDate.value,
    athleteId: props.athlete?.uid,
    coachId: user.uid,
  });
  newMaxLift.saveNew({
    onSuccess: () => {
      (coachInfo.maxlifts = coachInfo.maxlifts || []).push(newMaxLift);
      clearMaxLift();
    },
    onError: () =>
      $q.notify({
        type: "negative",
        message: i18n.t("coach.maxlift_management.list.add_error"),
        position: "bottom",
      }),
  });
  showMaxLiftAddDialog.value = false;
}

/** TODO check
 * Update maxlift according to inserted values.
 */
function updateMaxLift() {
  if (updatingMaxLift.value) {
    updatingMaxLift.value.exercise = selectedExercise.value;
    updatingMaxLift.value.type = maxliftType.value;
    updatingMaxLift.value.value = maxliftValue.value;
    updatingMaxLift.value.lastUpdated = maxliftDate.value;
    updatingMaxLift.value.saveUpdate({
      onSuccess: () => {
        clearMaxLift();
      },
      onError: () =>
        $q.notify({
          type: "negative",
          message: i18n.t("coach.maxlift_management.list.update_error"),
          position: "bottom",
        }),
    });
    showMaxLiftAddDialog.value = false;
  }
}

/** TODO check
 * Clear values in maxlift insertion form.
 */
function clearMaxLift() {
  selectedExercise.value = undefined;
  maxliftType.value = undefined;
  maxliftValue.value = "";
  maxliftDate.value = undefined;

  showMaxLiftAddDialog.value = false;
}

/** TODO check
 * Compile form with max lift info to allow coach to update them.
 *
 * @param maxlift
 */
function onUpdateMaxLift(maxlift: MaxLift) {
  updatingMaxLift.value = maxlift;
  showMaxLiftAddDialog.value = true;
  selectedExercise.value = maxlift.exercise ?? undefined;
  maxliftType.value = maxlift.type ?? undefined;
  maxliftValue.value = maxlift.value ?? "";
  maxliftDate.value = maxlift.lastUpdated ?? undefined;
}
</script>
