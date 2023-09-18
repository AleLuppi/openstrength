import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { AthleteUser, AthleteUserProps, CoachUser } from "@/helpers/users/user";
import { doGetDocs } from "@/helpers/database/readwrite";
import { usersCollection } from "@/helpers/database/collections";

export const useCoachInfoStore = defineStore("coachInfo", () => {
  // Managed athletes
  const athletes = ref<AthleteUser[]>();

  /**
   * Load list of athletes for a coach.
   *
   * @param coachId ID of the coach for which athletes should be loaded.
   * @param quiet if true, only load athletes if not done already, otherwise force reload.
   */
  async function loadAthletes(
    coachId?: string,
    quiet: boolean = false,
    {
      onSuccess,
      onError,
    }: {
      onSuccess?: Function;
      onError?: Function;
    } = {},
  ) {
    // Abort if there is no need to check
    if (!coachId || (quiet && athletes.value)) return;

    // Get documents
    doGetDocs(usersCollection, [["coachId", "==", coachId]], {
      onSuccess: (docs: { [key: string]: AthleteUserProps }) => {
        const _athletes: AthleteUser[] = [];
        Object.entries(docs).forEach(([uid, doc]) =>
          _athletes.push(new AthleteUser({ ...doc, uid: uid })),
        );
        athletes.value = _athletes;
        onSuccess?.(athletes);
      },
      onError: onError,
    });
  }

  /**
   * Reset values in user storage.
   */
  function $reset() {
    athletes.value = undefined;
  }

  return { athletes, loadAthletes, $reset };
});
