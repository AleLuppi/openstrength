import { useQuasar } from "quasar";
import { MaxLift } from "src/helpers/maxlifts/maxlift";
import { AthleteUser } from "src/helpers/users/user";
import { useCoachInfoStore } from "src/stores/coachInfo";
import { useUserStore } from "src/stores/user";
import {  computed, defineAsyncComponent, ref, toRef } from "vue";
import { useI18n } from "vue-i18n";
import { event } from "vue-gtag";
import mixpanel from "mixpanel-browser";

export default function useMaxlifts(selectedAthleteValue: AthleteUser | undefined){
    
    const selectedAthlete = toRef(selectedAthleteValue);

    // Init plugin
    const $q = useQuasar();
    const i18n = useI18n();
   
    // Get store
    const user = useUserStore();
    const coachInfo = useCoachInfoStore();

    // TODO: check 
    // Reference to ui element
    const FormMaxLift = defineAsyncComponent(
        () => import("@/components/forms/FormMaxLift.vue"),
      );
      
    const maxliftFormElement = ref<typeof FormMaxLift>();

    //Get coach maxlifts
    const maxlifts = computed(() => coachInfo.maxlifts || []);

    // Get maxlifts for the selected athlete
    const athleteMaxlifts = computed(() =>
    maxlifts.value.filter(
      (maxlift) => maxlift.athlete?.uid === selectedAthlete.value?.uid,
    ),
  );

  // Set ref for max lift declarations
  const searchMaxLift = ref<string>();
  const updatingMaxLift = ref<MaxLift>();
  const showMaxLiftAddDialog = ref(false);

  
/**
 * Create a new maxlift and assign to a coach.
 *
 * @param newMaxLift max lift instance that shall be saved.
 */
function saveMaxlift(newMaxLift: MaxLift) {
    // Get current maxlift and check if already instanciated on db
    const isNew = !newMaxLift.uid;
  
    // Update values
    if (isNew) {
      newMaxLift.athlete = selectedAthlete.value;
      newMaxLift.coachId = user.uid;
    }
  
    // Save maxlift
    newMaxLift.save({
      onSuccess: () => {
        if (isNew)
          (coachInfo.maxlifts = coachInfo.maxlifts || []).push(newMaxLift);
        maxliftFormElement.value?.reset();
  
        // Register GA4 event
        event("athleteview_maxlift_created", {
          event_category: "documentation",
          event_label: "New MaxLift Created in AthleteView",
          value: 1,
        });
  
        // Mixpanel tracking
        mixpanel.track(isNew ? "Maxlift Created" : "Maxlift Updated", {
          Page: "AthleteView",
          Exercise: newMaxLift.exercise?.name,
          Type: newMaxLift.type?.toString(),
        });
      },
      onError: () => {
        $q.notify({
          type: "negative",
          message: i18n.t(
            "coach.maxlift_management.list." +
              (isNew ? "add_error" : "update_error"),
          ),
          position: "bottom",
        });
  
        // Mixpanel tracking
        mixpanel.track(
          "ERROR " + (isNew ? "Maxlift Created" : "Maxlift Updated"),
          {
            Page: "AthleteView",
            Exercise: newMaxLift.exercise?.name,
            Type: newMaxLift.type?.toString(),
          },
        );
      },
    });
    showMaxLiftAddDialog.value = false;
  }
  
  /**
   * Open form with max lift info to allow coach to update them.
   *
   * @param maxlift instance that is being updated by coach.
   */
  function onUpdateMaxLift(maxlift: MaxLift) {
    updatingMaxLift.value = maxlift;
    showMaxLiftAddDialog.value = true;
  }

  return {
    athleteMaxlifts,
    updatingMaxLift, 
    searchMaxLift, 
    showMaxLiftAddDialog, 
    FormMaxLift,
    maxliftFormElement, 
    saveMaxlift, 
    onUpdateMaxLift, 
  }
}