import { Program, ProgramExercise } from "@/helpers/programs/program";

/**
 * Interface for program filter in builder.
 */
export interface ProgramFilter {
  week: string[];
  day: string[];
  exercise: string[];
}

/****************************/
/***** ATHLETE FEEDBACK *****/
/****************************/

/**
 * Athlete feedback on a program.
 */
export type ProgramFeedback = {
  program?: Program;
  feedbacks: ProgramDayFeedback[];
  createdOn?: Date;
  updatedOn?: Date[];
  uid?: string;
};

/**
 * Athlete feedback on a single day.
 */
export type ProgramDayFeedback = {
  weekName: string;
  dayName: string;
  completed: boolean;
  completedOn?: Date;
  textFeedback?: string;
  exercisesFeedback: ProgramExerciseFeedback[];
};

/**
 * Athlete feedback on a single exercise.
 */
export type ProgramExerciseFeedback = {
  programExercise?: ProgramExercise;
  exerciseName: string;
  variantName: string;
  completed: boolean | undefined;
  willComplete?: boolean;
  linesFeedback: {
    loadFeedback?: string | undefined;
    repsFeedback?: string | undefined;
    setsFeedback?: string | undefined;
    rpeFeedback?: string | undefined;
    textFeedback?: string | undefined;
    videoFeedback?: string | undefined;
    setsPerformed?: {
      setIndex: number;
      setLoad?: string | undefined;
      setReps?: string | undefined;
      setRpe?: string | undefined;
      setSkipped?: boolean;
    }[];
  }[];
};
