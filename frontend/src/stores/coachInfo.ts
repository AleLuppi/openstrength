import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { doGetDocs } from "@/helpers/database/readwrite";
import {
  exercisesCollection,
  usersCollection,
  programsCollection,
  maxliftsCollection,
} from "@/helpers/database/collections";
import {
  UserRole,
  AthleteUser,
  AthleteUserProps,
  CoachUser,
} from "@/helpers/users/user";
import {
  Exercise,
  ExerciseVariant,
  packExerciseVariantInfo,
} from "@/helpers/exercises/exercise";
import {
  Program,
  ProgramExercise,
  ProgramLine,
  unflattenProgram,
} from "@/helpers/programs/program";
import { useUserStore } from "@/stores/user";
import {
  reduceExercises,
  sortExercises,
} from "@/helpers/exercises/listManagement";
import { MaxLift, MaxLiftProps } from "@/helpers/maxlifts/maxlift";

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
  const _programsUnresolved = ref<{
    coach?: [Program, string][];
    athletes?: [Program, string][];
    exercises?: [ProgramExercise, string][];
    maxlifts?: [
      ProgramLine,
      {
        loadReference?: string;
        repsReference?: string;
      },
    ][];
  }>({}); // private
  const programs = computed({
    get: () => {
      if (!_programs.value) loadPrograms(coachId.value, true);

      // Solve unresolved references
      if (_programsUnresolved.value.coach) {
        // Solve coach reference
        const user = useUserStore();
        if (user.role == UserRole.coach)
          _programsUnresolved.value.coach.forEach(
            ([program]) => (program.coach = user.baseUser),
          );
        _programsUnresolved.value.coach = undefined;
      }
      if (athletes.value && _programsUnresolved.value.athletes) {
        // Solve athlete reference
        _programsUnresolved.value.athletes.forEach(
          ([program, athleteId]) =>
            (program.athlete = athletes.value?.find(
              (athlete) => athlete.uid === athleteId,
            )),
        );
        _programsUnresolved.value.athletes = undefined;
      }
      if (exercises.value && _programsUnresolved.value.exercises) {
        // Solve exercises references
        _programsUnresolved.value.exercises.forEach(
          ([programExercise, variantId]) => {
            const allVariants = exercises.value?.reduce(
              (out: ExerciseVariant[], exercise) =>
                out.concat(exercise.variants ?? []),
              [],
            );
            programExercise.exerciseVariant = allVariants?.find(
              (variant) => variant.uid === variantId,
            );
            programExercise.exercise =
              programExercise.exerciseVariant?.exercise;
          },
        );
        _programsUnresolved.value.exercises = undefined;
      }
      if (maxlifts.value && _programsUnresolved.value.maxlifts) {
        // Solve maxlifts references
        _programsUnresolved.value.maxlifts.forEach(
          ([programLine, maxliftId]) => {
            if (maxliftId.loadReference)
              programLine.loadReference = maxlifts.value?.find(
                (maxlift) => maxlift.uid === maxliftId.loadReference,
              );
            if (maxliftId.repsReference)
              programLine.repsReference = maxlifts.value?.find(
                (maxlift) => maxlift.uid === maxliftId.repsReference,
              );
          },
        );
        _programsUnresolved.value.maxlifts = undefined;
      }
      return _programs.value;
    },
    set: (value) => {
      _programs.value = value;
    },
  });

  // Max lifts of managed athletes
  const _maxlifts = ref<MaxLift[]>(); // private
  const _maxliftsUnresolved = ref<[MaxLift, { exerciseName: string }][]>([]); // private
  const maxlifts = computed({
    get: () => {
      if (!_maxlifts.value) loadMaxLifts(coachId.value, true);

      // Solve unresolved references
      if (exercises.value && _maxliftsUnresolved.value.length > 0) {
        _maxliftsUnresolved.value = _maxliftsUnresolved.value?.reduce(
          (
            updatedUnresolved: typeof _maxliftsUnresolved.value,
            maxliftUnresolved,
          ) => {
            maxliftUnresolved[0].exercise = exercises.value?.find(
              (exercise) => exercise.name == maxliftUnresolved[1].exerciseName,
            );
            return [
              ...updatedUnresolved,
              ...(maxliftUnresolved[0].exercise ? [] : [maxliftUnresolved]),
            ];
          },
          [],
        );
      }
      return _maxlifts.value;
    },
    set: (value) => {
      _maxlifts.value = value;
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
    if (!coachId || (quiet && _athletes.value)) return;

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
    if (!coachId || (quiet && _exercises.value)) return;

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
    if (!coachId || (quiet && _programs.value)) return;

    // Get documents
    const unresolved: typeof _programsUnresolved.value = {};
    doGetDocs(programsCollection, [["coachId", "==", coachId]], {
      onSuccess: (docs: { [key: string]: any }) => {
        const programsFromDoc: Program[] = [];
        const currUnresolved: {
          coach?: [Program, string];
          athlete?: [Program, string];
          exercises?: [ProgramExercise, string][];
          maxlifts?: [
            ProgramLine,
            {
              loadReference?: string;
              repsReference?: string;
            },
          ][];
        } = {};
        Object.entries(docs).forEach(([uid, doc]) => {
          const currProgram = unflattenProgram(
            doc,
            athletes.value,
            exercises.value,
            maxlifts.value,
            currUnresolved,
          );
          currProgram.uid = uid;
          if (currUnresolved.coach)
            (unresolved.coach = unresolved.coach || []).push(
              currUnresolved.coach,
            );
          if (currUnresolved.athlete)
            (unresolved.athletes = unresolved.athletes || []).push(
              currUnresolved.athlete,
            );
          if (currUnresolved.exercises)
            unresolved.exercises = (unresolved.exercises || []).concat(
              currUnresolved.exercises,
            );
          if (currUnresolved.maxlifts)
            unresolved.maxlifts = (unresolved.maxlifts || []).concat(
              currUnresolved.maxlifts,
            );
          programsFromDoc.push(currProgram);
        });
        _programsUnresolved.value = unresolved;
        _programs.value = programsFromDoc;
        onSuccess?.(programsFromDoc);
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
    // Get user ID if needed
    if (!coachId) {
      const user = useUserStore();
      if (user.role == UserRole.coach) coachId = user.uid;
    }

    // Abort if there is no need to check
    if (!coachId || (quiet && _maxlifts.value)) return;

    // Get documents
    doGetDocs(maxliftsCollection, [["coachId", "==", coachId]], {
      onSuccess: (docs: {
        [key: string]: Omit<MaxLiftProps, "exercise"> & { exercise: string };
      }) => {
        const maxliftsFromDoc: MaxLift[] = [];
        Object.entries(docs).forEach(([uid, doc]) => {
          const { exercise, ...docData } = doc;
          const exerciseInstance = exercises.value?.find(
            (exerciseFromList) => exerciseFromList.name == exercise,
          );
          maxliftsFromDoc.push(
            new MaxLift({
              ...docData,
              uid: uid,
              exercise: exerciseInstance,
            }),
          );
          if (!exerciseInstance)
            (_maxliftsUnresolved.value = _maxliftsUnresolved.value || []).push([
              maxliftsFromDoc.at(-1)!,
              { exerciseName: exercise },
            ]);
        });
        _maxlifts.value = maxliftsFromDoc;
        onSuccess?.(maxliftsFromDoc);
      },
      onError: onError,
    });
  }

  /**
   * Reset values in user storage.
   */
  function $reset() {
    coachId.value = undefined;
    athletes.value = undefined;
    exercises.value = undefined;
    programs.value = undefined;
    maxlifts.value = undefined;
  }

  return {
    athletes,
    exercises,
    programs,
    maxlifts,
    loadAthletes,
    loadExercises,
    loadPrograms,
    loadMaxLifts,
    $reset,
  };
});
