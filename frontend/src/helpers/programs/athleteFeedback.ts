import { ProgramFrozenView } from "./program";

/**
 * Athlete feedback frozen program
 */
export type AthleteFeedbackFrozenView = {
  program: ProgramFrozenView; //parent program to which it is referenced
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
  isExerciseDone?: boolean | undefined;
  lineFeedbacks: {
    athleteLoadFeedback?: string | undefined;
    athleteRepsFeedback?: string | undefined;
    athleteSetsFeedback?: string | undefined;
    athleteRpeFeedback?: string | undefined;
    athleteTextFeedback?: string | undefined;
    athleteVideoFeedback?: string | undefined;
  }[];
};
