import { uid } from "quasar";
import {
  Program,
  ProgramExercise,
  ProgramLine,
} from "@/helpers/programs/program";
import { MaxLift } from "@/helpers/maxlifts/maxlift";
import { Exercise, ExerciseVariant } from "@/helpers/exercises/exercise";
import { numberClamp } from "@/helpers/scalar";

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
        data: programExercise.lines
          ? programLinesToTable(programExercise.lines)
          : [],
      };

      // Store new element
      builderData.push(newExerciseData);
    });

    resolve(builderData);
  });
}

/**
 * Translate a list of program lines into a table of data.
 *
 * @param lines list of lines to convert.
 * @returns tabular representation of the lines.
 */
export function programLinesToTable(lines: ProgramLine[]) {
  return lines.map((line) => {
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
  });
}

/**
 * Translate a table of data into a list of program lines.
 *
 * @param data tabular representation of the lines.
 * @param programExercise optional parent exercise to store in lines.
 * @returns list of program lines.
 */
export function tableToProgramLines(
  data: ReturnType<typeof programLinesToTable>,
  programExercise?: ProgramExercise,
) {
  return data.map(
    (lineInfo, idx) =>
      new ProgramLine({
        programExercise: programExercise,
        lineOrder: idx,
        uid: lineInfo.uid ?? getRandomUid(),
        loadBaseValue: lineInfo.load,
        loadReference: lineInfo.loadRef,
        repsBaseValue: lineInfo.reps,
        repsReference: lineInfo.repsRef,
        setsBaseValue: lineInfo.sets,
        setsReference: lineInfo.setsRef,
        rpeBaseValue: lineInfo.rpe,
        rpeReference: lineInfo.rpeRef,
        note: lineInfo.note,
        requestFeedbackText: lineInfo.requestText,
        requestFeedbackVideo: lineInfo.requestVideo,
      }),
  );
}

/**
 * Move one exercise in program.
 *
 * 4 actions are possible:
 *  - If no destination, and no source fallback, exercise will be deleted.
 *  - If no exercise data is provided, a new empty table will be added in destination.
 *  - If both data and destination are provided, move selected exercise to destination.
 *  - If duplicate flag is true, clone the exercise data in destination.
 *
 * @param program program instance.
 * @param programExercise exercise that is being affected.
 * @param destination destination week, day, and exercise order.
 * @param [duplicate=false] if true, duplicate exercise instead of moving it (ignored if any input is undefined).
 * @param [sourceFallback=false] if true, use source position as destination if not provided (do not delete exercise).
 * @param [sourceOffset=0] optional offset to source position, only used if source is used as destination fallback.
 * @param [looseOrder=false] if true, place the exercise at the end of selected day if destination is occupied.
 * @returns program instance.
 */
export function moveProgramExercise(
  program: Program,
  programExercise?: ProgramExercise | number,
  destination?: [string, string, string | number | undefined],
  duplicate: boolean = false,
  {
    sourceFallback = false,
    sourceOffset = 0,
    looseOrder = false,
  }: {
    sourceFallback?: boolean;
    sourceOffset?: number;
    looseOrder?: boolean;
  } = {},
): Program {
  // Nothing to do if both program exercise and destination are unknown
  if (programExercise == undefined && destination == undefined) return program;

  // Get program exercise
  if (typeof programExercise == "number")
    if (program.programExercises)
      programExercise = program.programExercises[programExercise];
    else return program;

  // Clean source and destination schedule
  const source: [string, string, string | number | undefined] | undefined =
    programExercise != undefined
      ? [
          programExercise.scheduleWeek?.toString() ?? "",
          programExercise.scheduleDay?.toString() ?? "",
          programExercise.scheduleOrder
            ? Number(programExercise.scheduleOrder)
            : undefined,
        ]
      : undefined;
  if (!destination && sourceFallback)
    if (source) {
      destination = [...source];
      destination[2] = destination[2]
        ? Number(destination[2]) + sourceOffset
        : undefined;
    }
  if (
    looseOrder &&
    destination?.[2] &&
    program.programExercises?.some(
      (oneExercise) => oneExercise.scheduleOrder == destination![2],
    )
  )
    destination[2] = undefined;
  if (destination)
    destination[2] = numberClamp(
      destination?.[2] ? Number(destination[2]) : Infinity,
      1,
      (getLargestOrderInDay(program.programExercises ?? [], destination) ?? 0) +
        1,
    );

  // Move any exercise between source and destination
  program.programExercises?.forEach((value) => {
    if (!(value.scheduleWeek && value.scheduleDay && value.scheduleOrder))
      return;
    if (
      source != undefined &&
      !duplicate &&
      value.scheduleWeek == source[0] &&
      value.scheduleDay == source[1] &&
      Number(value.scheduleOrder) > Number(source[2] ?? Infinity)
    )
      value.scheduleOrder = String(Number(value.scheduleOrder) - 1);
    if (
      destination != undefined &&
      value.scheduleOrder &&
      value.scheduleWeek == destination[0] &&
      value.scheduleDay == destination[1] &&
      Number(value.scheduleOrder) >= Number(destination[2] ?? Infinity)
    )
      value.scheduleOrder = String(Number(value.scheduleOrder) + 1);
  });

  if (destination == undefined) {
    // If destination is unknown, the exercise is being destroyed
    program.programExercises = program.programExercises?.filter(
      (value) => value != programExercise,
    );
  } else if (programExercise == undefined) {
    // If exercise is unknown, a new exercise is being creted
    (program.programExercises = program.programExercises || []).push(
      new ProgramExercise({
        scheduleWeek: destination[0],
        scheduleDay: destination[1],
        scheduleOrder: destination[2],
      }),
    );
  } else {
    // If both exercise and destination are known, exercise is being moved or cloned
    const storingExercise = duplicate
      ? programExercise.duplicate(true)
      : programExercise;
    storingExercise.scheduleWeek = destination[0];
    storingExercise.scheduleDay = destination[1];
    storingExercise.scheduleOrder = destination[2];
    (program.programExercises = (program.programExercises || []).filter(
      (value) => value != storingExercise,
    )).push(storingExercise);
  }

  return program;
}

/**
 * Move one exercise in table.
 *
 * 4 actions are possible:
 *  - If no destination is provided, exercise will be deleted.
 *  - If no exercise data is provided, a new empty table will be added in destination.
 *  - If both data and destination are provided, move selected exercise to destination.
 *  - If duplicate flag is true, clone the exercise data in destination.
 *
 * @param builderData program builder data.
 * @param exerciseData data of exercise that is being affected.
 * @param destination destination week, day, and exercise order.
 * @param [duplicate=false] if true, duplicate exercise instead of moving it (ignored if any input is undefined).
 */
export function moveExercise(
  builderData: ProgramBuilderData,
  exerciseData?: ProgramBuilderExerciseData,
  destination?: [string, string, string],
  duplicate: boolean = false,
): ProgramBuilderData {
  // Nothing to do if both table and destination are unknown
  if (exerciseData == undefined && destination == undefined) return builderData;

  // Clean source and destination schedule
  const source =
    exerciseData != undefined
      ? [exerciseData.week, exerciseData.day, Number(exerciseData.order)]
      : undefined;
  if (destination)
    destination[2] = numberClamp(Number(destination[2]), 1, 5).toString();

  // Move any exercise between source and destination
  builderData.forEach((value) => {
    if (
      source != undefined &&
      !duplicate &&
      value.week == source[0] &&
      value.day == source[1] &&
      value.order > source[2]
    )
      value.order = String(Number(value.order) - 1);
    if (
      destination != undefined &&
      value.week == destination[0] &&
      value.day == destination[1] &&
      value.order >= destination[2]
    )
      value.order = String(Number(value.order) + 1);
  });

  if (destination == undefined) {
    // If destination is unknown, the table is being destroyed
    builderData = builderData.filter((value) => value != exerciseData);
  } else if (exerciseData == undefined) {
    // If table is unknown, a new table is being creted
    builderData.push({
      data: [],
      exercise: undefined,
      variant: undefined,
      note: undefined,
      week: destination[0],
      day: destination[1],
      order: destination[2],
    });
  } else {
    // If both table and destination are known, table is being moved or cloned
    if (duplicate) {
      const duplicateData = duplicateBuilderExerciseData(exerciseData, true);
      duplicateData.week = destination[0];
      duplicateData.day = destination[1];
      duplicateData.order = destination[2];
      builderData.push(duplicateData);
    } else {
      exerciseData.week = destination[0];
      exerciseData.day = destination[1];
      exerciseData.order = destination[2];
    }
  }

  return builderData;
}

/**
 * Get largest line order for lines in a day.
 *
 * @param programExercises list of program exercises in a program.
 * @param idScheduleInfo schedule info of interesting day or exercise in interesting day.
 */
export function getLargestOrderInDay(
  programExercises: ProgramExercise[],
  scheduleInfo: [string, string, string | number | undefined] | ProgramExercise,
): number | undefined {
  if (programExercises.length == 0) return undefined;
  const [week, day] =
    scheduleInfo instanceof Array
      ? scheduleInfo
      : [scheduleInfo.scheduleOrder, scheduleInfo.scheduleDay];
  const max = Math.max(
    ...programExercises.map((value) => {
      if (
        value.scheduleWeek &&
        value.scheduleDay &&
        value.scheduleOrder &&
        value.scheduleWeek == week &&
        value.scheduleDay == day
      )
        return Number(value.scheduleOrder);
      else return -1;
    }),
  );
  if (max >= 0) return max;
  else return undefined;
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

/**
 * Assign a given reference to the selected line.
 *
 * @param line program line where reference shall be assigned.
 * @param reference line or maxlift identifier or instance.
 * @param field line field that shall be updated.
 */
export function assignReference(
  line: ProgramLine,
  reference: ProgramLine | MaxLift | undefined,
  field:
    | "sets"
    | "reps"
    | "load"
    | "rpe"
    | "setsReference"
    | "repsReference"
    | "loadReference"
    | "rpeReference",
) {
  // TODO do not allow reference of some lines

  // Update line reference
  const refField = field.endsWith("Reference") ? field : field + "Reference";
  if (refField === "loadReference" || refField === "repsReference")
    line[refField] = reference;
  if (
    (refField === "setsReference" || refField === "rpeReference") &&
    !(reference instanceof MaxLift)
  )
    line[refField] = reference;
}
