import { Program, ProgramLine } from "@/helpers/programs/program";
import { getProgramUniqueDays, getProgramUniqueWeeks } from "./linesManagement";

// Single row of the program to be visualized by the athlete
interface ProgramDayRow {
  exerciseFullInfo?: string;
  schema?: string;
  schemaNote?: string;
  textFeedback?: string;
  videoFeedback?: string;
}

// Single day of the program to be visualized by the athlete
export interface ProgramDay {
  weekName?: string;
  dayName?: string;
  dayRows?: ProgramDayRow[];
}

/**
 * Converts a program line to a schema string (load reps x sets @rpe)
 */
export function convertLineToSchema(line: ProgramLine): string {
  const schema =
    (line?.loadBaseValue ? line?.loadBaseValue + " " : "") +
    (line?.repsBaseValue ? line?.repsBaseValue + "x" : "1x") +
    (line?.setsBaseValue ? line?.setsBaseValue + "s" : "1s") +
    (line?.rpeBaseValue ? " @" + line.rpeBaseValue : "");
  return schema;
}

/**
 * Extract the full info of exercise (name and notes)
 */
export function extractExerciseFullInfo(line: ProgramLine): string {
  const exerciseFullname =
    (line.programExercise?.exercise?.name ?? "") +
      " " +
      (line.programExercise?.exerciseVariant?.isDefault
        ? ""
        : line.programExercise?.exerciseVariant?.name) ?? "";

  const exerciseNote = line.programExercise?.exerciseNote ?? "";

  return (
    "<b>" +
    exerciseFullname +
    "</b>" +
    (exerciseNote ? "<br/>" + exerciseNote : "")
  );
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
            exerciseFullInfo: exercise?.lines?.[0]
              ? extractExerciseFullInfo(exercise?.lines?.[0])
              : "",
            schema: exercise.lines
              ? exercise.lines
                  .map((line) => convertLineToSchema(line))
                  .join("<br/>")
              : "",
            schemaNote: exercise.lines
              ? exercise.lines.map((line) => line.note).join("<br/>")
              : "",
            textFeedback: exercise.lines
              ? exercise.lines
                  .map((line) => (line.requestFeedbackText ? "Si" : ""))
                  .join("<br/>")
              : "",
            videoFeedback: exercise.lines
              ? exercise.lines
                  .map((line) => (line.requestFeedbackText ? "Si" : ""))
                  .join("<br/>")
              : "",

            // TODO i18n
          };

          dayRow.push(exerciseRow);
        }
      });

      // Add further day data if there are exercise rows
      if (dayRow.length > 0) {
        result.push({
          weekName: `Week ${week}`,
          dayName: `Day ${day}`,
          dayRows: dayRow,
        });
      }
    });
  });

  return result;
}
