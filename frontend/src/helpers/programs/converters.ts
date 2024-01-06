import { Program, ProgramLine } from "@/helpers/programs/program";
import { getProgramUniqueDays, getProgramUniqueWeeks } from "./linesManagement";

// Single row of the program to be visualized by the athlete
interface ProgramDayRow {
  exerciseName: string;
  variantName: string;
  note?: string;
  schema: string[];
  schemaNote: string[];
  textFeedback: boolean[];
  videoFeedback: boolean[];
}

// Single day of the program to be visualized by the athlete
export type ProgramDay = {
  weekName: string;
  dayName: string;
  exercises: ProgramDayRow[];
};

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
 * Converts program to an array of flat days
 */
export function convertProgramToDayBlocks(program: Program): ProgramDay[] {
  const days = getProgramUniqueDays(program);
  const weeks = getProgramUniqueWeeks(program);
  const result: ProgramDay[] = [];

  Array.from(weeks).forEach((week) => {
    Array.from(days).forEach((day) => {
      const dayRow: ProgramDayRow[] = [];

      // Iterate through each exercise of the day for the specific week
      program.programExercises?.forEach((exercise) => {
        if (exercise.scheduleDay === day && exercise.scheduleWeek === week) {
          const exerciseRow: ProgramDayRow = {
            exerciseName:
              exercise?.lines?.[0].programExercise?.exercise?.name ?? "",
            variantName:
              exercise?.lines?.[0].programExercise?.exerciseVariant?.name ?? "",
            note: exercise?.lines?.[0].programExercise?.exerciseNote,
            schema:
              exercise.lines?.map((line) => convertLineToSchema(line)) ?? [],
            schemaNote: exercise.lines?.map((line) => line.note ?? "") ?? [],
            textFeedback:
              exercise.lines?.map(
                (line) => line.requestFeedbackText ?? false,
              ) ?? [],
            videoFeedback:
              exercise.lines?.map(
                (line) => line.requestFeedbackVideo ?? false,
              ) ?? [],
          };

          dayRow.push(exerciseRow);
        }
      });

      // Add further day data if there are exercise rows
      if (dayRow.length > 0) {
        result.push({
          weekName: week,
          dayName: day,
          exercises: dayRow,
        });
      }
    });
  });

  return result;
}
