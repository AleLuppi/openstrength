import { uid } from "quasar";
import {
  Program,
  ProgramExercise,
  ProgramLine,
} from "@/helpers/programs/program";
import { MaxLift } from "@/helpers/maxlifts/maxlift";
import { numberClamp } from "@/helpers/scalar";

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
