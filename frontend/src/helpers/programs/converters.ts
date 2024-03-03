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
 * Converts program to an array of daily exercises.
 *
 * @param program program that shall be converted.
 * @returns list of program days with relevant exercise info.
 */
export function convertProgramToCompactView(
  program: Program,
): ProgramCompactView {
  const compactProgram: ProgramCompactView = [];

  if (!program.programExercises) return compactProgram;

  const orderedProgramExercises = orderProgramExercises(
    program.programExercises,
    (week, day, order) => [week, day, order].join("."),
  );

  Object.entries(orderedProgramExercises).forEach(([key, programExercise]) => {
    // Retrieve week, day, and exercise names
    const [week, day] = key.split(".");
    const exerciseFullName =
      (programExercise?.exercise?.name ?? "") +
      (programExercise?.exerciseVariant?.name
        ? " - " + programExercise?.exerciseVariant?.name
        : "");

    // Optionally add a new day to list
    if (
      !(
        compactProgram.at(-1)?.week === week &&
        compactProgram.at(-1)?.day === day
      )
    )
      compactProgram.push({
        week: week,
        day: day,
        exercises: [],
      });

    // Store exercise and its related schemas
    compactProgram.at(-1)!.exercises.push({
      exercise: exerciseFullName,
      schemas:
        programExercise.lines?.map((line) => convertLineToSchema(line)) ?? [],
    });
  });

  return compactProgram;
}
