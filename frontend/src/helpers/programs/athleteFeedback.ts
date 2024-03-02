import { ProgramForzenView } from "./program";

/**
 * Athlete feedback frozen program
 */
export type AthleteFeedbackFrozenView = {
  program: ProgramForzenView; //parent program to which it is referenced
  workoutDays: AthleteFeedbackDay[];
};

/**
 * Athlete feedback for a single day
 */
export type AthleteFeedbackDay = {
  weekName: string; 
  dayName: string;
  athleteHasDone: boolean;
  athleteWorkoutNote?: string;
  athleteWorkoutDate: Date | undefined;
  exercises: AthleteFeedbackExercise[];
};

/**
 * Athlete feedback for a single exercise
 */
export type AthleteFeedbackExercise = {
  uid: string; //uid of the referenced exercise from ProgramFrozenView
  exerciseName: string;
  variantName: string;
  isExerciseDone?: boolean;
  lineFeedbacks:{
    athleteLoadFeedback?: string | undefined;
    athleteRepsFeedback?: string | undefined;
    athleteSetsFeedback?: string | undefined;
    athleteRpeFeedback?: string | undefined;
    athleteTextFeedback?: string | undefined;
    athleteVideoFeedback?: string | undefined;
  }[]
}


/**
 * Create the athlete feedback object starting from a ProgramFrozenView
 * @param program
 */
/* export function createFeedbackStructure(
  program: ProgramForzenView
): AthleteFeedbackFrozenView {
  const workoutDays: AthleteFeedbackDay[] = program.weekdays.map((week) => ({
    weekName: week.weekName,
    dayName: week.dayName,
    athleteHasDone: false,
    athleteWorkoutNote: undefined,
    athleteWorkoutDate: undefined,
    exercises: week.exercises.map((exercise) => ({
      exerciseName: exercise.exerciseName,
      variantName: exercise.variantName,
      athleteHasDone: false, // Initialize to false by default
      athleteLoadFeedback: undefined,
      athleteRepsFeedback: undefined,
      athleteSetsFeedback: undefined,
      athleteRpeFeedback: undefined,
      athleteTextFeedback: undefined,
      athleteVideoFeedback: undefined,
    })),
  }));

  return { program, workoutDays };
}
 */