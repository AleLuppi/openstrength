import {
  Program,
  ProgramLine,
  ProgramForzenView,
  ProgramCompactView,
} from "@/helpers/programs/program";
import { orderProgramExercises } from "@/helpers/programs/linesManagement";
import { MaxLift } from "../maxlifts/maxlift";

/**
 * Get the displayable name of a selected reference.
 *
 * @param reference reference whose name shall be retrieved.
 */
function getReferenceDisplayName(reference: ProgramLine | MaxLift | undefined) {
  // Handle unknown case
  if (!reference) return undefined;

  // Handle program line or max lift
  if (reference instanceof ProgramLine)
    return (
      "W" +
      (reference.programExercise?.scheduleWeek
        ?.toString()
        .slice(undefined, 2) ?? "-") +
      "D" +
      (reference.programExercise?.scheduleDay?.toString().slice(undefined, 2) ??
        "-") +
      "L" +
      (reference.lineOrder != undefined ? reference.lineOrder + 1 : "-")
    );
  else return reference.type ?? ""; // TODO i18n
}

/**
 * Converts a program line to a schema string (load reps x sets @rpe).
 *
 * @param line program line that shall be converted.
 * @returns schema as a string.
 */
export function convertLineToSchema(line: ProgramLine): string {
  const referencedLoadText = line.loadReference
    ? getReferenceDisplayName(line.loadReference)
    : undefined;
  const referencedRepsText = line.repsReference
    ? getReferenceDisplayName(line.repsReference)
    : undefined;
  const referencedSetsText = line.setsReference
    ? getReferenceDisplayName(line.setsReference)
    : undefined;
  const referencedRpeText = line.rpeReference
    ? getReferenceDisplayName(line.rpeReference)
    : undefined;

  // Determine schema for load
  let schemaLoad = "";
  if (
    referencedLoadText != undefined &&
    referencedLoadText != "1RM" &&
    line.loadReference instanceof MaxLift
  ) {
    schemaLoad = line.loadBaseValue
      ? line.loadBaseValue + " (" + referencedLoadText + ")"
      : "";
  } else if (
    referencedLoadText != undefined &&
    line.loadReference instanceof ProgramLine
  ) {
    schemaLoad = line.loadBaseValue
      ? referencedLoadText + " " + line.loadBaseValue
      : "";
  } else {
    schemaLoad = line.loadBaseValue ? line.loadBaseValue : "";
  }

  // Determine schema for reps
  let schemaReps = "";
  if (referencedRepsText != undefined) {
    schemaReps = line.repsBaseValue
      ? referencedRepsText + line.repsBaseValue
      : "";
  } else {
    schemaReps = line.repsBaseValue ? line.repsBaseValue : "";
  }

  // Determine schema for sets
  let schemaSets = "";
  if (referencedSetsText != undefined) {
    schemaSets = line.setsBaseValue
      ? "x" + referencedSetsText + line.setsBaseValue + "s"
      : "";
  } else {
    schemaSets = line.setsBaseValue ? "x" + line.setsBaseValue + "s" : "";
  }

  // Determine schema for rpe
  let schemaRpe = "";
  if (referencedRpeText != undefined) {
    schemaRpe = line.rpeBaseValue
      ? "@" + referencedRpeText + line.rpeBaseValue
      : "";
  } else {
    schemaRpe = line.rpeBaseValue ? "@" + line.rpeBaseValue : "";
  }

  return schemaLoad + " " + schemaReps + schemaSets + " " + schemaRpe;
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
