import { uid } from "quasar";
import { Program, ProgramExercise } from "./program";
import { AthleteUser } from "../users/user";
import { moveProgramExercise } from "./builder";
import { MaxLift } from "../maxlifts/maxlift";

/**
 * Creates a dummy default athlete
 */
export function createNewDefaultAthleteInstance(program: Program): AthleteUser {
  const defaultAthlete = new AthleteUser();
  defaultAthlete.name = uid();
  defaultAthlete.surname = uid();
  defaultAthlete.isDummy = true;
  defaultAthlete.uid = uid();
  defaultAthlete.coachId = program.coachId;

  return defaultAthlete;
}

/**
 * Initialize program template instance
 */
export function createNewProgramTemplateInstance(program: Program): Program {
  const programTemplate = program.duplicate();
  programTemplate.athlete = createNewDefaultAthleteInstance(program);
  programTemplate.uid = undefined;
  programTemplate.lastUpdated = new Date();

  return programTemplate;
}

/**
 * Interface for program filter in builder
 */
export interface ProgramFilter {
  week: string[];
  day: string[];
  exercise: string[];
}

/**
 * Create a filtered instance of the program
 */
export function filterProgramExercises(
  programExercises: ProgramExercise[],
  programFilter: ProgramFilter,
): ProgramExercise[] {
  return programExercises.filter((exercise) => {
    if (
      programFilter.week.length > 0 &&
      !programFilter.week.includes(exercise.scheduleWeek?.toString() || "")
    ) {
      return false;
    }
    if (
      programFilter.day.length > 0 &&
      !programFilter.day.includes(exercise.scheduleDay?.toString() || "")
    ) {
      return false;
    }
    if (
      programFilter.exercise.length > 0 &&
      !programFilter.exercise.includes(exercise.exercise?.name || "")
    ) {
      return false;
    }
    return true;
  });
}

/**
 * Converts a program instance into a program template instance
 * by assigning a default athlete
 */
export function convertProgramToProgramTemplate(
  program: Program,
  programFilter?: ProgramFilter,
): Program {
  const programTemplate = createNewProgramTemplateInstance(program);
  programTemplate.athlete = createNewDefaultAthleteInstance(program);

  // Apply filters if necessary
  if (programFilter && program.programExercises) {
    const filteredExercises = filterProgramExercises(
      program.programExercises,
      programFilter,
    );
    programTemplate.programExercises = filteredExercises;
  }

  return programTemplate;
}

/**
 * Imports a program template instance into a program instance
 */
export function importProgramTemplateToProgram(
  programTemplate: Program,
  programDestination: Program,
): Program {
  programTemplate.programExercises?.forEach((progEx) => {
    const destination: [string, string, string] = [
      progEx.scheduleWeek?.toString() ?? "1",
      progEx.scheduleDay?.toString() ?? "1",
      progEx.scheduleOrder?.toString() ?? "1",
    ];
    moveProgramExercise(programDestination, progEx, destination, true, {
      sourceFallback: true,
      sourceOffset: 0,
      looseOrder: true,
    });
  });

  return programDestination;
}

/**
 *
 * @param program Allows to extract the unique list of referenced maxlifts from a program instance
 * @returns
 */
export function extractUniqueMaxliftFromProgram(
  program: Program,
): MaxLift[] | undefined {
  const maxliftsTemplate: MaxLift[] = (program.programExercises ?? []).flatMap(
    (progEx) =>
      (progEx.lines ?? []).flatMap((line) => {
        const maxLifts: MaxLift[] = [];
        if (line.loadReference instanceof MaxLift) {
          maxLifts.push(line.loadReference);
        }
        if (line.repsReference instanceof MaxLift) {
          maxLifts.push(line.repsReference);
        }
        return maxLifts;
      }),
  );

  // Return only the unique list of maxlifts
  const uniqueMaxLiftsSet = new Set<string>();
  const uniqueMaxlifts = maxliftsTemplate.filter((maxLift) => {
    const key = maxLift.exercise?.name + "|" + maxLift.type;
    if (!uniqueMaxLiftsSet.has(key)) {
      uniqueMaxLiftsSet.add(key);
      return true;
    }

    return false;
  });

  return uniqueMaxlifts;
}

/**
 * Checks if input maxlifts are contained inside maxlifts, returns the diff between the two
 */
export function getMissingMaxlift(
  maxliftsToInsert: MaxLift[],
  maxlifts: MaxLift[] | undefined,
): MaxLift[] {
  if (maxlifts !== undefined) {
    const maxliftsSet = new Set<string>();

    maxlifts.forEach((maxlift) => {
      const key = maxlift.exercise?.name + "|" + maxlift.type;
      maxliftsSet.add(key);
    });

    const missingMaxlifts = maxliftsToInsert.filter((maxlift) => {
      const key = maxlift.exercise?.name + "|" + maxlift.type;
      return !maxliftsSet.has(key);
    });

    return missingMaxlifts;
  } else {
    return maxliftsToInsert;
  }
}
