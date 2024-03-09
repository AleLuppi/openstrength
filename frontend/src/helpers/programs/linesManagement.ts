import {
  Program,
  ProgramExercise,
  ProgramLine,
} from "@/helpers/programs/program";
import { arrayFilterUndefined, arrayUniqueValues } from "@/helpers/array";
import { moveProgramExercise } from "@/helpers/programs/builder";
import { extractUniqueMaxliftFromProgram } from "@/helpers/programs/programTemplate";
import { compareMaxliftLists } from "@/helpers/maxlifts/listManagement";
import { MaxLift } from "@/helpers/maxlifts/maxlift";

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
    (week) => week.padStart(100, "0"),
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
    (week) => week.padStart(100, "0"),
  );
}

/**
 * Retrieve a list of unique days from a program.
 *
 * @param program instance of interest.
 * @param exerciseName if provided, only consider exercises whose name match the provided one.
 * @returns sorted list of unique day names.
 */
export function getProgramUniqueWeekDayPairs(
  program?: Program,
  exerciseName?: string,
): [string, string][] {
  return arrayUniqueValues(
    arrayFilterUndefined(
      program?.programExercises
        ?.filter(
          (exercise) =>
            !exerciseName || exercise.exercise?.name == exerciseName,
        )
        .map((exercise) => {
          if (exercise.scheduleWeek && exercise.scheduleDay)
            return [
              exercise.scheduleWeek.toString(),
              exercise.scheduleDay.toString(),
            ];
          return undefined;
        }) || [],
    ),
    ([week, day]) => week.padStart(100, "0") + day.padStart(100, "0"),
    true,
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

/**
 * Merge two programs into a single instance.
 *
 * @param firstProgram destination program.
 * @param secondProgram program that will be merged into first one.
 * @param mapMaxlifts if true, find matching maxlifts in the two program to merge them;
 *                    can also be the list of matching maxlifts that should be mapped during merging.
 * @param [inplace=true] if true, merge exercises inside first program.
 */
export function mergePrograms(
  firstProgram: Program,
  secondProgram: Program,
  mapMaxlifts: [MaxLift, MaxLift][] | boolean = true,
  inplace: boolean = true,
): Program {
  // Get matching maxlifts in the two program
  let matchingMaxlifts: [MaxLift, MaxLift][] = [];
  const firstMaxlifts = extractUniqueMaxliftFromProgram(firstProgram);
  if (mapMaxlifts && typeof mapMaxlifts == "boolean") {
    const secondMaxlifts = extractUniqueMaxliftFromProgram(secondProgram);
    [, , matchingMaxlifts] = compareMaxliftLists(firstMaxlifts, secondMaxlifts);
  } else if (mapMaxlifts) matchingMaxlifts = mapMaxlifts;

  // Merge the two programs (duplicate to avoid affecting merging program)
  const outProgram = inplace ? firstProgram : firstProgram.duplicate();
  secondProgram.duplicate().programExercises?.forEach((programExercise) => {
    // Must know where exercise should go
    if (!programExercise.scheduleWeek || !programExercise.scheduleDay) return;

    // To preserve line references, instead of duplicating program exercise from merging program,
    // it is necessary to move the exercise from one program to the other
    programExercise.scheduleOrder = Infinity;
    moveProgramExercise(outProgram, programExercise, undefined, false, {
      sourceFallback: true,
      looseOrder: true,
    });
  });

  // Merge known maxlifts
  const searchingMaxlifts = matchingMaxlifts.map(
    (maxliftPair) => maxliftPair[1],
  );
  outProgram.getLines()?.forEach((line) => {
    (
      ["loadReference", "repsReference"] as (
        | "loadReference"
        | "repsReference"
      )[]
    ).forEach((field) => {
      if (line[field] instanceof MaxLift) {
        const maxliftIdx = searchingMaxlifts.findIndex(
          (maxlift) => maxlift == line[field],
        );

        // Match found: translate
        if (maxliftIdx >= 0) line[field] = matchingMaxlifts[maxliftIdx][0];
        // Unknown maxlift: delete
        else if (!firstMaxlifts.includes(line[field] as MaxLift))
          line[field] = undefined;
      }
    });
  });

  return outProgram;
}
