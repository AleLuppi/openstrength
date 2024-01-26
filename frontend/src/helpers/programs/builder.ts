import { ProgramExercise, ProgramLine } from "@/helpers/programs/program";
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

/**
 *
 * Note: for a new ProgramExercise instance, some values cannot be set here as they would require additional info.
 * They are: 'program', 'exercise', 'exerciseVariant'. These should be set outside from this function.
 *
 * @param exerciseData
 * @returns
 */
export function dataToProgramExercise(
  exerciseData: ProgramBuilderExerciseData,
  programExercise?: ProgramExercise,
): ProgramExercise {
  // Init program exercise
  const outProgramExercise = programExercise ?? new ProgramExercise();

  // Update values
  outProgramExercise.scheduleWeek = exerciseData.week;
  outProgramExercise.scheduleDay = exerciseData.day;
  outProgramExercise.scheduleOrder = Number(exerciseData.order);
  outProgramExercise.exerciseNote = exerciseData.note;
  outProgramExercise.lines = exerciseData.data.map(
    (lineInfo, idx) =>
      new ProgramLine({
        programExercise: outProgramExercise,
        lineOrder: idx,
        uid: lineInfo.uid,
        setsBaseValue: lineInfo.sets,
        setsReference: lineInfo.setsRef,
        repsBaseValue: lineInfo.reps,
        repsReference: lineInfo.repsRef,
        loadBaseValue: lineInfo.load,
        loadReference: lineInfo.loadRef,
        rpeBaseValue: lineInfo.rpe,
        rpeReference: lineInfo.rpeRef,
        note: lineInfo.note,
        requestFeedbackText: lineInfo.requestText,
        requestFeedbackVideo: lineInfo.requestVideo,
      }),
  );

  return outProgramExercise;
}
