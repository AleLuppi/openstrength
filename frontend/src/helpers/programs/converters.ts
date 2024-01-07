import {
  Program,
  ProgramLine,
  ProgramForzenView,
} from "@/helpers/programs/program";
import {
  getProgramUniqueDays,
  getProgramUniqueWeeks,
  orderProgramExercises,
} from "@/helpers/programs/linesManagement";
import { objectDeepCompare } from "../object";

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
        exerciseName:
          programExercise?.lines?.[0].programExercise?.exercise?.name ?? "",
        variantName:
          programExercise?.lines?.[0].programExercise?.exerciseVariant?.name ??
          "",
        note: programExercise?.lines?.[0].programExercise?.exerciseNote,
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
