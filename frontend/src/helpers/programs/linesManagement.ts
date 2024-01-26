import {
  Program,
  ProgramExercise,
  ProgramLine,
} from "@/helpers/programs/program";
import { arrayFilterUndefined, arrayUniqueValues } from "@/helpers/array";

/**
 * Sort program exercises according to week, day, order.
 *
 * @param exercises program exercises to sort.
 * @param sortLines
 * @returns sorted program exercises.
 */
export function sortProgramExercises(
  exercises: ProgramExercise[],
  sortLines: boolean = true,
) {
  if (sortLines)
    exercises.forEach((exercise) => {
      if (exercise.lines) exercise.lines = sortProgramLines(exercise.lines);
    });
  return [...exercises].sort((exerciseA, exerciseB) => {
    // Prepare variables
    const weekA = String(
      exerciseA.scheduleWeek ?? exerciseB.scheduleWeek ?? "undefined",
    );
    const weekB = String(exerciseB.scheduleWeek ?? weekA);
    const dayA = String(
      exerciseA.scheduleDay ?? exerciseB.scheduleDay ?? "undefined",
    );
    const dayB = String(exerciseB.scheduleDay ?? dayA);
    const orderA = String(
      exerciseA.scheduleOrder ?? exerciseB.scheduleOrder ?? "undefined",
    );
    const orderB = String(exerciseB.scheduleOrder ?? orderA);

    // Sort exercises by week, day, order, with precedence
    let res = weekA
      .padStart(weekB.length, "0")
      .localeCompare(weekB.padStart(weekA.length, "0"));
    if (res) return res;
    res = dayA
      .padStart(dayB.length, "0")
      .localeCompare(dayB.padStart(dayA.length, "0"));
    if (res) return res;
    res = orderA
      .padStart(orderB.length, "0")
      .localeCompare(orderB.padStart(orderA.length, "0"));
    return res;
  });
}

/**
 * Sort program lines according to line order.
 *
 * @param lines program lines to sort.
 * @returns sorted program lines.
 */
export function sortProgramLines(lines: ProgramLine[]) {
  return [...lines].sort((lineA, lineB) => {
    // Prepare variables
    const orderA = lineA.lineOrder ?? lineB.lineOrder ?? 99;
    const orderB = lineB.lineOrder ?? orderA;

    // Sort lines by order
    if (orderA < orderB) return -1;
    else if (orderA > orderB) return 1;
    return 0;
  });
}

/**
 * Get a list of ordered program exercises for each day, sorted by week and day number.
 *
 * @param exercises program exercises to order.
 * @param getName method providing key name given week and day names.
 * @param sep string used as separator to build keys via default naming method.
 * @returns object having week and day string as keys, and ordered list of exercises as values.
 */
export function orderProgramExercises(
  exercises: ProgramExercise[],
  getName: (
    week: string | number,
    day: string | number,
    order: string | number,
  ) => string = (week, day, order) => [week, day, order].join(sep),
  sep: string = ".",
  sortLines: boolean = true,
): {
  [key: string]: ProgramExercise;
} {
  // Sort exercises
  const sortedExercises = sortProgramExercises(exercises, sortLines);

  // Build the output object
  return sortedExercises.reduce(
    (
      out: {
        [key: string]: ProgramExercise;
      },
      exercise,
    ) => {
      const week = exercise.scheduleWeek ?? -1;
      const day = exercise.scheduleDay ?? -1;
      const order = exercise.scheduleOrder ?? -1;
      return { ...out, [getName(week, day, order)]: exercise };
    },
    {},
  );
}

/**
 * Retrieve a list of unique weeks from a program.
 *
 * @param program instance of interest.
 * @param exerciseName if provided, only consider exercises whose name match the provided one.
 * @returns sorted list of unique week names.
 */
export function getProgramUniqueWeeks(
  program?: Program,
  exerciseName?: string,
) {
  return arrayUniqueValues(
    arrayFilterUndefined(
      program?.programExercises
        ?.filter(
          (exercise) =>
            !exerciseName || exercise.exercise?.name == exerciseName,
        )
        .map((exercise) => exercise.scheduleWeek?.toString()) || [],
    ),
  );
}

/**
 * Retrieve a list of unique days from a program.
 *
 * @param program instance of interest.
 * @param exerciseName if provided, only consider exercises whose name match the provided one.
 * @returns sorted list of unique day names.
 */
export function getProgramUniqueDays(program?: Program, exerciseName?: string) {
  return arrayUniqueValues(
    arrayFilterUndefined(
      program?.programExercises
        ?.filter(
          (exercise) =>
            !exerciseName || exercise.exercise?.name == exerciseName,
        )
        .map((exercise) => exercise.scheduleDay?.toString()) || [],
    ),
  );
}

/**
 * Retrieve a list of unique exercise names from a program.
 *
 * @param program instance of interest.
 * @param exerciseName if provided, only consider exercises whose name match the provided one.
 * @returns sorted list of unique exercise names.
 */
export function getProgramUniqueExercises(
  program?: Program,
  exerciseName?: string,
) {
  return arrayUniqueValues(
    arrayFilterUndefined(
      program?.programExercises
        ?.filter(
          (exercise) =>
            !exerciseName || exercise.exercise?.name == exerciseName,
        )
        .map((exercise) => exercise.exercise?.name) || [],
    ),
  );
}
