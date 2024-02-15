import { uid } from "quasar";
import { Program, ProgramExercise } from "../programs/program";
import { AthleteUser } from "../users/user";

/**
 * Creates a dummy default athlete
 */
export function createNewDefaultAthleteInstance(program: Program): AthleteUser {
  const defaultAthlete = new AthleteUser();
  defaultAthlete.name = uid();
  defaultAthlete.surname = uid();
  defaultAthlete.isTemplate = true;
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
