import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { doGetDocs } from "@/helpers/database/readwrite";
import {
  exercisesCollection,
  usersCollection,
  programsCollection,
} from "@/helpers/database/collections";
import {
  UserRole,
  AthleteUser,
  AthleteUserProps,
  CoachUser,
} from "@/helpers/users/user";
import {
  Exercise,
  packExerciseVariantInfo,
} from "@/helpers/exercises/exercise";
import { Program } from "@/helpers/programs/program";
import { useUserStore } from "@/stores/user";
import {
  reduceExercises,
  sortExercises,
} from "@/helpers/exercises/listManagement";

export const useCoachInfoStore = defineStore("coachInfo", () => {
  // Coach ID
  const coachId = ref<string>();

  // Managed athletes
  const _athletes = ref<AthleteUser[]>(); // private
  const athletes = computed({
    get: () => {
      if (!_athletes.value) loadAthletes(coachId.value, true);
      return _athletes.value;
    },
    set: (value) => {
      _athletes.value = value;
    },
  });

  // Library of exercises
  const _exercises = ref<Exercise[]>(); // private
  const exercises = computed({
    get: () => {
      if (!_exercises.value) loadExercises(coachId.value, true);
      return _exercises.value;
    },
    set: (value) => {
      _exercises.value = value;
    },
  });

  // Library of programs
  const _programs = ref<Program[]>(); // private
  const programs = computed({
    get: () => {
      if (!_programs.value) loadPrograms(coachId.value, true);
      return _programs.value;
    },
    set: (value) => {
      _programs.value = value;
    },
  });

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
          const athletesFromDoc: AthleteUser[] = [];
          Object.entries(docs).forEach(([uid, doc]) =>
            athletesFromDoc.push(new AthleteUser({ ...doc, uid: uid })),
          );
          _athletes.value = athletesFromDoc;
          onSuccess?.(athletesFromDoc);
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
        const exercisesFromDoc: Exercise[] = [];
        Object.entries(docs).forEach(([uid, doc]) =>
          exercisesFromDoc.push(packExerciseVariantInfo(doc, uid)),
        );
        _exercises.value = reduceExercises(exercisesFromDoc);
        sortExercises(_exercises.value, true);
        onSuccess?.(exercisesFromDoc);
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
        const programsFromDoc: Program[] = [];
        Object.entries(docs).forEach(([uid, doc]) =>
          programsFromDoc.push(new Program({ ...doc, uid: uid })),
        );
        _programs.value = programsFromDoc;
        onSuccess?.(programsFromDoc);
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
    programs.value = undefined;
  }

  return {
    athletes,
    exercises,
    programs,
    loadAthletes,
    loadExercises,
    loadPrograms,
    $reset,
  };
});
