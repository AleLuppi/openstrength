import {
  Program,
  ProgramLine,
  ProgramForzenView,
  ProgramCompactView,
} from "@/helpers/programs/program";
import { orderProgramExercises } from "@/helpers/programs/linesManagement";

/**
 * Converts a program line to a schema string (load reps x sets @rpe).
 *
 * @param line program line that shall be converted.
 * @returns schema as a string.
 */
export function convertLineToSchema(line: ProgramLine): string {
  const schema =
    (line.loadBaseValue ? line.loadBaseValue + " " : "") +
    (line.repsBaseValue ? line.repsBaseValue + "x" : "1x") +
    (line.setsBaseValue ? line.setsBaseValue + "s" : "1s") +
    (line.rpeBaseValue ? " @" + line.rpeBaseValue : "");
  return schema;
}

/**
 * Converts program to an array of flat days.
 *
 * @param program program that shall be converted.
 * @returns list of flat days with relevant exercise info.
 */
export function convertProgramToDayBlocks(
  program: Program,
): ProgramForzenView["weekdays"] {
  // Check input
  if (!program.programExercises) return [];

  // Initialize interesting values
  const programExercises = orderProgramExercises(
    program.programExercises,
    (week, day, order) => [week, day, order].join("."),
  );
  const out: ProgramForzenView["weekdays"] = [];

  Object.entries(programExercises).forEach(([key, programExercise]) => {
    // Retrieve week and day values
    const [week, day] = key.split(".");

    // Get interesting exercise info
    const exerciseInfo: ProgramForzenView["weekdays"][number]["exercises"][number] =
      {
        exerciseName: programExercise?.exercise?.name ?? "",
        variantName: programExercise?.exerciseVariant?.name ?? "",
        note: programExercise?.exerciseNote,
        schema:
          programExercise.lines?.map((line) => convertLineToSchema(line)) ?? [],
        schemaNote: programExercise.lines?.map((line) => line.note ?? "") ?? [],
        textFeedback:
          programExercise.lines?.map(
            (line) => line.requestFeedbackText ?? false,
          ) ?? [],
        videoFeedback:
          programExercise.lines?.map(
            (line) => line.requestFeedbackVideo ?? false,
          ) ?? [],
      };

    // Store exercise info
    if (out.at(-1)?.weekName === week && out.at(-1)?.dayName === day)
      out.at(-1)!.exercises.push(exerciseInfo);
    else
      out.push({
        weekName: week,
        dayName: day,
        exercises: [exerciseInfo],
      });
  });

  return out;
}

/**
 * Converts program to an array of flat weeks.
 *
 * @param program program that shall be converted.
 * @returns list of flat days with relevant exercise info.
 */
export function convertProgramToCompactView(
  program: Program,
): ProgramCompactView {
  const compactView: ProgramCompactView = { days: [] };

  if (!program.programExercises) return compactView;

  const orderedProgramExercises = orderProgramExercises(
    program.programExercises,
    (week, day, order) => [week, day, order].join("."),
  );

  for (const [key, programExercise] of Object.entries(
    orderedProgramExercises,
  )) {
    const [week, day] = key.split(".");
    const exerciseFullName = `${programExercise?.exercise?.name ?? ""} - ${
      programExercise?.exerciseVariant?.name ?? ""
    }`;

    let dayEntry = compactView.days.find((entry) => entry.dayName === day);
    if (!dayEntry) {
      dayEntry = { dayName: day, exercises: [] };
      compactView.days.push(dayEntry);
    }

    let exerciseEntry = dayEntry.exercises.find(
      (exercise) => exercise.exerciseFullName === exerciseFullName,
    );
    if (!exerciseEntry) {
      exerciseEntry = { exerciseFullName, weekSchemas: [] };
      dayEntry.exercises.push(exerciseEntry);
    }

    let weekEntry = exerciseEntry.weekSchemas.find(
      (weekEntry) => weekEntry.weekName === week,
    );
    if (!weekEntry) {
      weekEntry = { weekName: week, schemas: [] };
      exerciseEntry.weekSchemas.push(weekEntry);
    }

    if (programExercise.lines) {
      for (const line of programExercise.lines) {
        weekEntry.schemas.push(convertLineToSchema(line));
      }
    }
  }

  return compactView;
}

/**
 * Get unique sorted week names from a compact program view.
 *
 * @param compactProgram compact program view.
 * @returns unique sorted week names.
 */
export function getWeekNamesFromCompactProgram(
  compactProgram: ProgramCompactView,
): string[] {
  return compactProgram.days
    .reduce((acc: string[], day) => {
      day.exercises.forEach((exercise) => {
        exercise.weekSchemas.forEach((week: { weekName: string }) => {
          if (!acc.includes(week.weekName)) {
            acc.push(week.weekName);
          }
        });
      });
      return acc;
    }, [])
    .sort((a, b) => parseInt(a) - parseInt(b));
}

/**
 * Converts compact program to a flattened view.
 *
 * @param compactProgram compact program view.
 * @returns flattened view of the compact program.
 */
export function convertCompactProgramToFlatView(
  compactProgram: ProgramCompactView,
): Record<string, Record<string, string>[]> {
  const flattenedProgram: Record<string, Record<string, string>[]> = {};

  const weekNames = getWeekNamesFromCompactProgram(compactProgram);

  for (const day of compactProgram.days) {
    const rows: Record<string, string>[] = [];
    for (const exercise of day.exercises) {
      const row: Record<string, string> = {
        exerciseFullName: exercise.exerciseFullName,
        dayName: day.dayName,
      };
      for (const weekName of weekNames) {
        const weekSchema = exercise.weekSchemas.find(
          (week: { weekName: string }) => week.weekName === weekName,
        );
        row[weekName] = weekSchema ? weekSchema.schemas.join(", ") : "";
      }
      rows.push(row);
    }
    flattenedProgram[day.dayName] = rows;
  }

  return flattenedProgram;
}
