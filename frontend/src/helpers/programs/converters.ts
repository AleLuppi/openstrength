import {
  Program,
  ProgramLine,
  ProgramFrozenView,
  ProgramFrozenLine,
  ProgramCompactView,
} from "@/helpers/programs/program";
import { orderProgramExercises } from "@/helpers/programs/linesManagement";
import { MaxLift } from "@/helpers/maxlifts/maxlift";
import { uid } from "quasar";

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
    let loadFinalText;
    const sameWeekSameDay =
      String(line.loadReference.programExercise?.scheduleWeek) ===
        String(line.programExercise?.scheduleWeek) &&
      String(line.loadReference.programExercise?.scheduleDay) ===
        String(line.programExercise?.scheduleDay);
    const sameWeekDifferentDay =
      String(line.loadReference.programExercise?.scheduleWeek) ===
        String(line.programExercise?.scheduleWeek) &&
      String(line.loadReference.programExercise?.scheduleDay) !=
        String(line.programExercise?.scheduleDay);
    const sameDayDifferentWeek =
      String(line.loadReference.programExercise?.scheduleWeek) !=
        String(line.programExercise?.scheduleWeek) &&
      String(line.loadReference.programExercise?.scheduleDay) ===
        String(line.programExercise?.scheduleDay);
    const differentDayDifferentWeek =
      String(line.loadReference.programExercise?.scheduleWeek) !=
        String(line.programExercise?.scheduleWeek) &&
      String(line.loadReference.programExercise?.scheduleDay) !=
        String(line.programExercise?.scheduleDay);

    if (sameWeekSameDay) {
      loadFinalText = "";
    } else if (sameWeekDifferentDay) {
      loadFinalText = "Day " + line.loadReference.programExercise?.scheduleDay;
    } else if (sameDayDifferentWeek) {
      loadFinalText =
        "Week " + line.loadReference.programExercise?.scheduleWeek;
    } else if (differentDayDifferentWeek) {
      loadFinalText =
        "Week " +
        line.loadReference.programExercise?.scheduleWeek +
        " Day " +
        line.loadReference.programExercise?.scheduleDay;
    } else {
      loadFinalText = referencedLoadText;
    }

    schemaLoad = line.loadBaseValue
      ? loadFinalText + " " + line.loadBaseValue
      : "";
  } else {
    schemaLoad = line.loadBaseValue ? line.loadBaseValue : "";
  }

  // Determine schema for reps
  let schemaReps = "";
  if (
    referencedRepsText != undefined &&
    line.repsReference instanceof ProgramLine
  ) {
    let repsFinalText;
    const sameWeekSameDay =
      String(line.repsReference.programExercise?.scheduleWeek) ===
        String(line.programExercise?.scheduleWeek) &&
      String(line.repsReference.programExercise?.scheduleDay) ===
        String(line.programExercise?.scheduleDay);
    const sameWeekDifferentDay =
      String(line.repsReference.programExercise?.scheduleWeek) ===
        String(line.programExercise?.scheduleWeek) &&
      String(line.repsReference.programExercise?.scheduleDay) !=
        String(line.programExercise?.scheduleDay);
    const sameDayDifferentWeek =
      String(line.repsReference.programExercise?.scheduleWeek) !=
        String(line.programExercise?.scheduleWeek) &&
      String(line.repsReference.programExercise?.scheduleDay) ===
        String(line.programExercise?.scheduleDay);
    const differentDayDifferentWeek =
      String(line.repsReference.programExercise?.scheduleWeek) !=
        String(line.programExercise?.scheduleWeek) &&
      String(line.repsReference.programExercise?.scheduleDay) !=
        String(line.programExercise?.scheduleDay);

    if (sameWeekSameDay) {
      repsFinalText = "";
    } else if (sameWeekDifferentDay) {
      repsFinalText = "Day " + line.repsReference.programExercise?.scheduleDay;
    } else if (sameDayDifferentWeek) {
      repsFinalText =
        "Week " + line.repsReference.programExercise?.scheduleWeek;
    } else if (differentDayDifferentWeek) {
      repsFinalText =
        "Week " +
        line.repsReference.programExercise?.scheduleWeek +
        " Day " +
        line.repsReference.programExercise?.scheduleDay;
    } else {
      repsFinalText = referencedRepsText;
    }

    schemaReps = line.repsBaseValue ? repsFinalText + line.repsBaseValue : "";
  } else if (
    referencedRepsText != undefined &&
    line.repsReference instanceof MaxLift
  ) {
    schemaReps = line.repsBaseValue
      ? referencedRepsText + line.repsBaseValue
      : "";
  } else {
    schemaReps = line.repsBaseValue ? line.repsBaseValue : "";
  }

  // Determine schema for sets
  let schemaSets = "";
  if (
    referencedSetsText != undefined &&
    line.setsReference instanceof ProgramLine
  ) {
    let setsFinalText;
    const sameWeekSameDay =
      String(line.setsReference.programExercise?.scheduleWeek) ===
        String(line.programExercise?.scheduleWeek) &&
      String(line.setsReference.programExercise?.scheduleDay) ===
        String(line.programExercise?.scheduleDay);
    const sameWeekDifferentDay =
      String(line.setsReference.programExercise?.scheduleWeek) ===
        String(line.programExercise?.scheduleWeek) &&
      String(line.setsReference.programExercise?.scheduleDay) !=
        String(line.programExercise?.scheduleDay);
    const sameDayDifferentWeek =
      String(line.setsReference.programExercise?.scheduleWeek) !=
        String(line.programExercise?.scheduleWeek) &&
      String(line.setsReference.programExercise?.scheduleDay) ===
        String(line.programExercise?.scheduleDay);
    const differentDayDifferentWeek =
      String(line.setsReference.programExercise?.scheduleWeek) !=
        String(line.programExercise?.scheduleWeek) &&
      String(line.setsReference.programExercise?.scheduleDay) !=
        String(line.programExercise?.scheduleDay);

    if (sameWeekSameDay) {
      setsFinalText = "";
    } else if (sameWeekDifferentDay) {
      setsFinalText = "Day " + line.setsReference.programExercise?.scheduleDay;
    } else if (sameDayDifferentWeek) {
      setsFinalText =
        "Week " + line.setsReference.programExercise?.scheduleWeek;
    } else if (differentDayDifferentWeek) {
      setsFinalText =
        "Week " +
        line.setsReference.programExercise?.scheduleWeek +
        " Day " +
        line.setsReference.programExercise?.scheduleDay;
    } else {
      setsFinalText = referencedSetsText;
    }

    schemaSets = line.setsBaseValue
      ? "x" + setsFinalText + line.setsBaseValue + "s"
      : "";
  } else {
    schemaSets = line.setsBaseValue ? "x" + line.setsBaseValue + "s" : "";
  }

  // Determine schema for rpe
  let schemaRpe = "";
  if (
    referencedRpeText != undefined &&
    line.rpeReference instanceof ProgramLine
  ) {
    let rpeFinalText;
    const sameWeekSameDay =
      String(line.rpeReference.programExercise?.scheduleWeek) ===
        String(line.programExercise?.scheduleWeek) &&
      String(line.rpeReference.programExercise?.scheduleDay) ===
        String(line.programExercise?.scheduleDay);
    const sameWeekDifferentDay =
      String(line.rpeReference.programExercise?.scheduleWeek) ===
        String(line.programExercise?.scheduleWeek) &&
      String(line.rpeReference.programExercise?.scheduleDay) !=
        String(line.programExercise?.scheduleDay);
    const sameDayDifferentWeek =
      String(line.rpeReference.programExercise?.scheduleWeek) !=
        String(line.programExercise?.scheduleWeek) &&
      String(line.rpeReference.programExercise?.scheduleDay) ===
        String(line.programExercise?.scheduleDay);
    const differentDayDifferentWeek =
      String(line.rpeReference.programExercise?.scheduleWeek) !=
        String(line.programExercise?.scheduleWeek) &&
      String(line.rpeReference.programExercise?.scheduleDay) !=
        String(line.programExercise?.scheduleDay);

    if (sameWeekSameDay) {
      rpeFinalText = "";
    } else if (sameWeekDifferentDay) {
      rpeFinalText = "Day " + line.rpeReference.programExercise?.scheduleDay;
    } else if (sameDayDifferentWeek) {
      rpeFinalText = "Week " + line.rpeReference.programExercise?.scheduleWeek;
    } else if (differentDayDifferentWeek) {
      rpeFinalText =
        "Week " +
        line.rpeReference.programExercise?.scheduleWeek +
        " Day " +
        line.rpeReference.programExercise?.scheduleDay;
    } else {
      rpeFinalText = referencedRpeText;
    }

    schemaRpe = line.rpeBaseValue ? "@" + rpeFinalText + line.rpeBaseValue : "";
  } else {
    schemaRpe = line.rpeBaseValue ? "@" + line.rpeBaseValue : "";
  }

  return schemaLoad + " " + schemaReps + schemaSets + " " + schemaRpe;
}

/**
 * TODO: check logic and decide when to ask for load, reps, sets, rpe insertion (to be done in a second version)
 * Method to convert between different program lines
 * @param line
 * @returns
 */
export function convertProgramLineToFrozenLine(
  line: ProgramLine,
): ProgramFrozenLine {
  const frozenLine: ProgramFrozenLine = {
    load: (
      line.loadComputedValue ??
      line.loadSupposedValue ??
      line.loadBaseValue
    )?.toString(),
    askLoad: line.loadComputedValue ? false : true,
    reps: (
      line.repsComputedValue ??
      line.repsSupposedValue ??
      line.repsBaseValue
    )?.toString(),
    askReps: line.repsComputedValue ? false : true,
    sets: (
      line.setsComputedValue ??
      line.setsSupposedValue ??
      line.setsBaseValue
    )?.toString(),
    askSets: false,
    rpe: (
      line.rpeComputedValue ??
      line.rpeSupposedValue ??
      line.rpeBaseValue
    )?.toString(),
    askRpe: line.rpeComputedValue ? false : true,
  };

  return frozenLine;
}

/**
 * Converts program to an array of flat days.
 *
 * @param program program that shall be converted.
 * @returns list of flat days with relevant exercise info.
 */
export function convertProgramToDayBlocks(
  program: Program,
): ProgramFrozenView["weekdays"] {
  // Check input
  if (!program.programExercises) return [];

  // Initialize interesting values
  const programExercises = orderProgramExercises(
    program.programExercises,
    (week, day, order) => [week, day, order].join("."),
  );
  const out: ProgramFrozenView["weekdays"] = [];

  Object.entries(programExercises).forEach(([key, programExercise]) => {
    // Retrieve week and day values
    const [week, day] = key.split(".");

    // Get interesting exercise info
    const exerciseInfo: ProgramFrozenView["weekdays"][number]["exercises"][number] =
      {
        uid: programExercise.uid ?? uid(),
        exerciseName: programExercise?.exercise?.name ?? "",
        variantName: programExercise?.exerciseVariant?.name ?? "",
        note: programExercise?.exerciseNote,
        lines: programExercise.lines?.map(
          (line) => convertProgramLineToFrozenLine(line) ?? [],
        ),
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
        textOnly: programExercise.textOnly,
      };

    // Store exercise info
    if (out.at(-1)?.weekName === week && out.at(-1)?.dayName === day)
      out.at(-1)?.exercises.push(exerciseInfo);
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
    const [week, day, order] = key.split(".");
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
    compactProgram.at(-1)?.exercises.push({
      exercise: exerciseFullName,
      order: order,
      schemas:
        programExercise.lines?.map((line) => convertLineToSchema(line)) ?? [],
    });
  });

  return compactProgram;
}
