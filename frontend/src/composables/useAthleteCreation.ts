import { ref } from 'vue';
import { AthleteUser } from '@/helpers/users/user';
import { useUserStore } from 'src/stores/user';
import { useCoachInfoStore } from 'src/stores/coachInfo';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

/**
 * Allows creating a new athlete from its main data (name, surname, note)
 * @returns 
 */
export function useAthleteCreation() {

  // Init plugin
  const $q = useQuasar();
  const i18n = useI18n();
  
  // Get store
  const user = useUserStore();
  const coachInfo = useCoachInfoStore();

  // Set athlete data ref for new athlete dialog
  const athleteName = ref(""); // new athlete name
  const athleteSurname = ref(""); // new athlete surname
  const athleteNote = ref(""); // new athlete note

  // Reset form fields
  function resetForm() {
    athleteName.value = '';
    athleteSurname.value = '';
    athleteNote.value = '';
  }

  // Validate form fields
  function validateForm() {
    //TODO: add validation logic
    return true; 
  }

  // Save athlete to the database
  function createAthlete() {
    if (validateForm()) {
      const newAthlete = new AthleteUser({
        name: athleteName.value,
        surname: athleteSurname.value,
        coachId: user.uid,
        coachNote: athleteNote.value,
        coaches: user.uid ? [user.uid] : [],
        coachesFrom: [new Date()],
        coachesTo: [null],
        assignedPrograms: [],
        createdOn: new Date(),
        createdBy: user.uid,
      });

      // Save new athlete to the database
      newAthlete.saveNew({      
        onSuccess: () => {
          (coachInfo.athletes = coachInfo.athletes || []).push(newAthlete);
          resetForm();  

           // Mixpanel tracking
           mixpanel.track("New Athlete");
        },
        onError: () => {
          // Handle error
          $q.notify({
            type: "negative",
            message: i18n.t("coach.athlete_management.list.add_error"),
            position: "bottom",
          });

          // Mixpanel tracking
          mixpanel.track("ERROR New Athlete");
        }
      });
    }
  }

  return {
    athleteName,
    athleteSurname,
    athleteNote,
    resetForm,
    createAthlete
  };
}
