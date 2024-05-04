import { useQuasar } from "quasar";
import { MaxLift } from "src/helpers/maxlifts/maxlift";
import { AthleteUser } from "src/helpers/users/user";
import { useCoachInfoStore } from "src/stores/coachInfo";
import { useUserStore } from "src/stores/user";
import { Ref } from "vue";
import { useI18n } from "vue-i18n";
import mixpanel from "mixpanel-browser";

export default function useMaxliftCreation(selectedAthlete: Ref<AthleteUser | undefined>, ){

  // Init plugin
  const $q = useQuasar();
  const i18n = useI18n();
  
  // Get store
  const user = useUserStore();
  const coachInfo = useCoachInfoStore();

/**
 * Create a new maxlift and assign to a coach or updates an existing one.
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
        //maxliftFormElement.value?.reset();

  
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
    //showMaxLiftAddDialog.value = false;
  }

    return { saveMaxlift }
}