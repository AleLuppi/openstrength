import { ProgramLine } from "@/helpers/programs/program";
import { MaxLift } from "@/helpers/maxlifts/maxlift";

/**
 * Define data models used in program builder.
 */

// Single exercise builder data
export interface ProgramBuilderExerciseData {
  data: {
    uid: string;
    load: string | undefined;
    loadRef: ProgramLine | MaxLift | undefined;
    reps: string | undefined;
    repsRef: ProgramLine | MaxLift | undefined;
    sets: string | undefined;
    setsRef: ProgramLine | undefined;
    rpe: string | undefined;
    rpeRef: ProgramLine | undefined;
    note: string | undefined;
    requestText: boolean | undefined;
    requestVideo: boolean | undefined;
  }[];
  exercise: string | undefined;
  variant: string | undefined;
  note: string | undefined;
  week: string;
  day: string;
  order: string;
}

// Whole program builder data
export interface ProgramBuilderData extends Array<ProgramBuilderExerciseData> {}

/**
 * Define methods used in builder.
 */
