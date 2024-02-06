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
  // Check input
  if (!program.programExercises) return { days: [] };

  const programExercises = orderProgramExercises(
    program.programExercises,
    (week, day, order) => [week, day, order].join("."),
  );

  // Initialize an object to store the converted data
  const compactView: ProgramCompactView = { days: [] };

  // Loop through each program exercise
  Object.entries(programExercises).forEach(([key, programExercise]) => {
    // Retrieve week and day values
    const [week, day] = key.split(".");

    const exerciseFullName = `${programExercise?.exercise?.name ?? ""} - ${
      programExercise?.exerciseVariant?.name ?? ""
    }`;

    // Find or create the day entry in the compact view
    let dayEntry = compactView.days.find((entry) => entry.dayName === day);
    if (!dayEntry) {
      dayEntry = { dayName: day, exercises: [] };
      compactView.days.push(dayEntry);
    }

    // Find or create the exercise entry in the day
    let exerciseEntry = dayEntry.exercises.find(
      (exercise) => exercise.exerciseFullName === exerciseFullName,
    );
    if (!exerciseEntry) {
      exerciseEntry = { exerciseFullName, weekSchemas: [] };
      dayEntry.exercises.push(exerciseEntry);
    }

    // Find or create the week entry in the exercise
    let weekEntry = exerciseEntry.weekSchemas.find(
      (weekEntry) => weekEntry.weekName === week,
    );
    if (!weekEntry) {
      weekEntry = { weekName: week, schemas: [] };
      exerciseEntry.weekSchemas.push(weekEntry);
    }

    // Add the schemas to the week entry
    if (programExercise.lines) {
      programExercise.lines.forEach((line) => {
        weekEntry!.schemas.push(convertLineToSchema(line));
      });
    }
  });

  return compactView;
}
