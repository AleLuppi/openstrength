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
  programsCollection,
} from "@/helpers/database/collections";
import {
  Exercise,
  ExerciseVariantProps,
  packExerciseVariantInfo,
} from "@/helpers/exercises/exercise";
import { Program } from "@/helpers/programs/program";
import {
  reduceExercises,
  sortExercises,
} from "@/helpers/exercises/listManagement";
import { MaxLift, MaxLiftProps } from "@/helpers/maxlifts/maxlift";
import { useUserStore } from "./user";

export const useCoachInfoStore = defineStore("coachInfo", () => {
  // Managed athletes
  const athletes = ref<AthleteUser[]>();

  // Library of exercises
  const exercises = ref<Exercise[]>();

  // Library of programs
  const programs = ref<Program[]>();

  // Max lifts of managed athletes
  const maxlifts = ref<MaxLift[]>();

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
    // Get user ID if needed
    if (!coachId) {
      const user = useUserStore();
      if (user.role == UserRole.coach) coachId = user.uid;
    }

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
    // Get user ID if needed
    if (!coachId) {
      const user = useUserStore();
      if (user.role == UserRole.coach) coachId = user.uid;
    }

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
   * Load list of programs for a coach.
   *
   * @param coachId ID of the coach for which programs should be loaded.
   * @param quiet if true, skip loading if programs are already present, otherwise force reload.
   */
  async function loadPrograms(
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
    // Get user ID if needed
    if (!coachId) {
      const user = useUserStore();
      if (user.role == UserRole.coach) coachId = user.uid;
    }

    // Abort if there is no need to check
    if (!coachId || (quiet && programs.value)) return;

    // TODO check documents format
    // Get documents
    doGetDocs(programsCollection, [["coachId", "==", coachId]], {
      onSuccess: (docs: { [key: string]: Program }) => {
        const _programs: Program[] = [];
        Object.entries(docs).forEach(([uid, doc]) =>
          _programs.push(new Program({ ...doc, uid: uid })),
        );
        programs.value = _programs;
        onSuccess?.(programs);
      },
      onError: onError,
    });
  }

  /**
   * Load list of max lift for coach's athletes.
   *
   * @param coachId ID of the coach for which max lifts should be loaded.
   * @param quiet if true, skip loading if max lifts are already present, otherwise force reload.
   */
  async function loadMaxLifts(
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
    if (!coachId || (quiet && maxlifts.value)) return;

    // Get documents
    doGetDocs(
      usersCollection,
      [
        ["coachId", "==", coachId],
        ["role", "==", UserRole.athlete],
      ],
      {
        onSuccess: (docs: { [key: string]: MaxLiftProps }) => {
          const _maxlifts: MaxLift[] = [];
          Object.entries(docs).forEach(([uid, doc]) =>
            _maxlifts.push(new MaxLift({ ...doc, uid: uid })),
          );
          maxlifts.value = _maxlifts;
          onSuccess?.(maxlifts);
        },
        onError: onError,
      },
    );
  }

  /**
   * Reset values in user storage.
   */
  function $reset() {
    athletes.value = undefined;
    exercises.value = undefined;
    programs.value = undefined;
    maxlifts.value = undefined;
  }

  return {
    athletes,
    exercises,
    programs,
    loadAthletes,
    loadExercises,
    loadPrograms,
    loadMaxLifts,
    $reset,
  };
});
