import { ref, computed } from "vue";
import { defineStore } from "pinia";
import {
  UserRole,
  AthleteUser,
  AthleteUserProps,
  CoachUser,
} from "@/helpers/users/user";
import { doGetDocs } from "@/helpers/database/readwrite";
import {
  exercisesCollection,
  usersCollection,
} from "@/helpers/database/collections";
import {
  Exercise,
  packExerciseVariantInfo,
} from "@/helpers/exercises/exercise";
import {
  reduceExercises,
  sortExercises,
} from "@/helpers/exercises/listManagement";

export const useCoachInfoStore = defineStore("coachInfo", () => {
  // Managed athletes
  const athletes = ref<AthleteUser[]>();

  // Library of exercises
  const exercises = ref<Exercise[]>();

  /**
   * Load list of athletes for a coach.
   *
   * @param coachId ID of the coach for which athletes should be loaded.
   * @param quiet if true, skip loading if athletes are already present, otherwise force reload.
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
    doGetDocs(
      usersCollection,
      [
        ["coachId", "==", coachId],
        ["role", "==", UserRole.athlete],
      ],
      {
        onSuccess: (docs: { [key: string]: AthleteUserProps }) => {
          const _athletes: AthleteUser[] = [];
          Object.entries(docs).forEach(([uid, doc]) =>
            _athletes.push(new AthleteUser({ ...doc, uid: uid })),
          );
          athletes.value = _athletes;
          onSuccess?.(athletes);
        },
        onError: onError,
      },
    );
  }

  /**
   * Load list of exercises for a coach.
   *
   * @param coachId ID of the coach for which athletes should be loaded.
   * @param quiet if true, skip loading if exercises are already present, otherwise force reload.
   */
  async function loadExercises(
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
    if (!coachId || (quiet && exercises.value)) return;

    // Get documents
    doGetDocs(exercisesCollection, [["userId", "==", coachId]], {
      onSuccess: (docs: { [key: string]: any }) => {
        const _exercises: Exercise[] = [];
        Object.entries(docs).forEach(([uid, doc]) =>
          _exercises.push(packExerciseVariantInfo(doc, uid)),
        );
        exercises.value = reduceExercises(_exercises);
        sortExercises(exercises.value, true);
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
    exercises.value = undefined;
  }

  return { athletes, exercises, loadAthletes, loadExercises, $reset };
});
