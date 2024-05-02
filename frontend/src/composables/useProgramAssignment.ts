import { useQuasar } from "quasar";
import { Program } from "src/helpers/programs/program";
import { assignProgramToAthlete } from "src/helpers/programs/programManager";
import { AthleteUser } from "src/helpers/users/user";
import { useCoachInfoStore } from "src/stores/coachInfo";
import { ref, toRef } from "vue";
import { useI18n } from "vue-i18n";
import { event } from "vue-gtag";
import mixpanel from "mixpanel-browser";
import useModalStore from "src/stores/useModalStore";
import ModalDeleteProgram from "src/components/modals/ModalDeleteProgram.vue";

export default function useProgramAssignment(selectedAthleteValue: AthleteUser | undefined){
    
    const selectedAthlete = toRef(selectedAthleteValue);

    // Init plugin
    const $q = useQuasar();
    const i18n = useI18n();
   
    // Get store
    const coachInfo = useCoachInfoStore();
    const store = useModalStore();



    /**
 * Set a program as the currently assigned program to selected athlete.
 *
 * @param program program that shall be set as currently ongoing.
 */
function assignProgram(program: Program) {
    if (selectedAthlete.value)
      assignProgramToAthlete(program, selectedAthlete.value, {
        onError: () => {
          $q.notify({
            type: "negative",
            message: i18n.t(
              "coach.program_management.builder.save_assignment_error",
            ),
            position: "bottom",
          });
        },
      });
  }
  
  const deletingProgram = ref<Program>();
  const showDialogDeleteProgram = ref(false);



  /**
   * Delete one program from list, upon confirmation.
   *
   * @param program program that may be deleted.
   */
  function onProgramDelete(program: Program) {
    deletingProgram.value = program;
    //showDialogDeleteProgram.value = true;

    store.openModal({
      component: ModalDeleteProgram,
      props: { 
        deletingProgram: program, 
        athlete: selectedAthlete,
       },
    });

  }
  
  /**
   * Actually delete the selected program template.
   *
   * @param program element that shall be removed.
   */
  function deleteProgram(program: Program) {
    program.remove({
      onAthleteUpdateSuccess: () => {
        // Mixpanel tracking
        mixpanel.track("Update Athlete", {
          Type: "Removed program",
        });
      },
      onAthleteUpdateError: () => {
        // Mixpanel tracking
        mixpanel.track("ERROR Update Athlete", {
          Type: "Removing program",
        });
      },
      onSuccess: () => {
        coachInfo.programs = coachInfo.programs?.filter(
          (coachProgram) => coachProgram != program,
        );
        deletingProgram.value = undefined;
  
        // Register GA4 event
        event("program_deleted", {
          event_category: "documentation",
          event_label: "Program Deleted",
          value: 1,
        });
  
        // Mixpanel tracking
        mixpanel.track("Program Deleted", {
          Page: "ProgramView",
        });
      },
    });
  }

    return {
        deletingProgram, 
        showDialogDeleteProgram,
        assignProgram,
        deleteProgram, 
        onProgramDelete
    }
}