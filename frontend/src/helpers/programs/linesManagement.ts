import { ProgramExercise, ProgramLine } from "@/helpers/programs/program";

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
    const weekA =
      exerciseA.scheduleWeek ?? exerciseB.scheduleWeek ?? "undefined";
    const weekB = exerciseB.scheduleWeek ?? weekA;
    const dayA = exerciseA.scheduleDay ?? exerciseB.scheduleDay ?? "undefined";
    const dayB = exerciseB.scheduleDay ?? dayA;
    const orderA =
      exerciseA.scheduleOrder ?? exerciseB.scheduleOrder ?? "undefined";
    const orderB = exerciseB.scheduleOrder ?? orderA;

    // Sort exercises by week, day, order, with precedence
    if (weekA < weekB) return -1;
    else if (weekA > weekB) return 1;
    else if (dayA < dayB) return -1;
    else if (dayA > dayB) return 1;
    else if (orderA < orderB) return -1;
    else if (orderA > orderB) return 1;

    // Equal sorting values
    return 0;
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
  getName: Function = (
    week: string | number,
    day: string | number,
    order: string | number,
  ) => [week, day, order].join(sep),
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
