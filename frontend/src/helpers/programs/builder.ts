import { uid } from "quasar";
import {
  Program,
  ProgramExercise,
  ProgramLine,
} from "@/helpers/programs/program";
import type { MaxLift } from "@/helpers/maxlifts/maxlift";
import { Exercise, ExerciseVariant } from "@/helpers/exercises/exercise";

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

// Program builder data with resolved exercises and variants
export interface ProgramBuilderFilledData
  extends Omit<ProgramBuilderExerciseData, "exercise" | "variant"> {
  exercise: Exercise | undefined;
  variant: ExerciseVariant | undefined;
}

/**
 * Define methods used in builder.
 */

/**
 * Get a random uid.
 *
 * @returns a random uid.
 */
function getRandomUid() {
  return "OS-" + uid();
}

/**
 * Reset builder data from scratch according to input program.
 *
 * @param program input program used to initialize data.
 * @returns updated builder data.
 */
export function resetBuilderData(program: Program) {
  return new Promise<ProgramBuilderData>(function (resolve) {
    // Initialize builder data
    const builderData: ProgramBuilderData = [];

    // Set new exercise values
    (program.programExercises ?? []).forEach((programExercise) => {
      // Get schedule info
      const week = String(programExercise.scheduleWeek ?? -1),
        day = String(programExercise.scheduleDay ?? -1),
        order = String(programExercise.scheduleOrder ?? -1);

      // Prepare new element
      const newExerciseData: ProgramBuilderExerciseData = {
        // schedule-related values
        week: week,
        day: day,
        order: order,

        // exercise-related values
        exercise: programExercise.exercise?.name,
        variant: programExercise.exerciseVariant?.name ?? "",
        note: programExercise.exerciseNote ?? "",

        // data-related values
        data:
          programExercise.lines?.map((line) => {
            if (!line.uid) line.uid = getRandomUid();
            return {
              uid: line.uid,
              load: line.loadBaseValue,
              loadRef: line.loadReference,
              reps: line.repsBaseValue,
              repsRef: line.repsReference,
              sets: line.setsBaseValue,
              setsRef: line.setsReference,
              rpe: line.rpeBaseValue,
              rpeRef: line.rpeReference,
              note: line.note,
              requestText: line.requestFeedbackText ?? false,
              requestVideo: line.requestFeedbackVideo ?? false,
            };
          }) ?? [],
      };

      // Store new element
      builderData.push(newExerciseData);
    });

    resolve(builderData);
  });
}

/**
 * Update selected exercises.
 *
 * @param exerciseData exercise data that shall be updated.
 * @param newName new name of the exercise.
 */
export function updateSelectedExercise(
  exerciseData: ProgramBuilderExerciseData,
  newName?: string,
) {
  // Reset variant name
  if (exerciseData.exercise != newName) exerciseData.variant = undefined;

  // Update name
  exerciseData.exercise = newName;
}

/**
 * Update selected variant.
 *
 * @param exerciseData exercise data that shall be updated.
 * @param newName new name of the variant.
 */
export function updateSelectedVariant(
  exerciseData: ProgramBuilderExerciseData,
  newName?: string,
) {
  // Update name
  exerciseData.variant = newName;
}

/**
 * Update table data for an exercise in program.
 *
 * @param exerciseData exercise data that shall be updated.
 * @param data table data that shall be saved.
 */
export function updateExerciseLines(
  exerciseData: ProgramBuilderExerciseData,
  data: ProgramBuilderExerciseData["data"],
) {
  data.forEach((line) => {
    if (!Object.keys(line).includes("uid")) line.uid = getRandomUid();
  });
  exerciseData.data = data;
}

/**
 * Get a duplicate of a program builder exercise.
 *
 * @param exerciseData data to duplicate.
 * @param [updateId=true] if true, change data id, otherwise preserve it.
 * @returns duplicate of current exercise values.
 */
export function duplicateBuilderExerciseData(
  exerciseData: ProgramBuilderExerciseData | ProgramBuilderFilledData,
  updateId: boolean = true,
): ProgramBuilderExerciseData {
  return {
    ...exerciseData,
    exercise:
      exerciseData.exercise instanceof Exercise
        ? exerciseData.exercise.name
        : exerciseData.exercise,
    variant:
      exerciseData.variant instanceof ExerciseVariant
        ? exerciseData.variant.name
        : exerciseData.variant,
    data: exerciseData.data.map((data) => {
      return { ...data, uid: updateId ? getRandomUid() : data.uid };
    }),
  };
}

/**
 * Get a duplicate of current program builder data.
 *
 * @param builderData duplicate supplied values.
 * @returns duplicate of current builder data.
 */
export function duplicateBuilderData(
  builderData: ProgramBuilderData | ProgramBuilderFilledData[],
) {
  return builderData.map((exerciseData) => {
    return duplicateBuilderExerciseData(exerciseData, false);
  });
}

/**
 * Convert builder exercise data into a program exercise.
 *
 * Note: for a new ProgramExercise instance, some values cannot be set here as they would require additional info.
 * They are: 'program', 'exercise', 'exerciseVariant'. These should be set outside from this function.
 *
 * @param exerciseData builder exercise data to convert.
 * @param programExercise optional program exercise to update, otherwise a new one will be created.
 * @returns program exercise filled with builder exercise data.
 */
export function dataToProgramExercise(
  exerciseData: ProgramBuilderFilledData,
  programExercise?: ProgramExercise,
): ProgramExercise {
  // Init program exercise
  const outProgramExercise = programExercise ?? new ProgramExercise();

  // Update values
  outProgramExercise.scheduleWeek = exerciseData.week;
  outProgramExercise.scheduleDay = exerciseData.day;
  outProgramExercise.scheduleOrder = Number(exerciseData.order);
  outProgramExercise.exercise = exerciseData.exercise;
  outProgramExercise.exerciseVariant = exerciseData.variant;
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

export function updateProgramWithBuilderData(
  program: Program,
  builderData: ProgramBuilderFilledData[],
) {
  return new Promise<ProgramBuilderData>((resolve) => {
    // Init and fill program exercises
    program.programExercises = [];
    builderData.forEach((exerciseData) => {
      const programExercise = dataToProgramExercise(exerciseData);
      programExercise.program = program;
      (program.programExercises = program.programExercises || []).push(
        programExercise,
      );
    });

    // Return duplicate of data used to build the program
    resolve(duplicateBuilderData(builderData));
  });
}
