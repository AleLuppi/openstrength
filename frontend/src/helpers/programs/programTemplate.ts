import { Program } from "@/helpers/programs/program";
import type { ProgramFilter } from "@/helpers/programs/models";
import { AthleteUser } from "@/helpers/users/user";
import { MaxLift } from "@/helpers/maxlifts/maxlift";
import { arrayUniqueValues } from "@/helpers/array";

/**
 * Create a dummy athlete.
 *
 * @param coachId ID of the coach who is creating the dummy athlete.
 * @returns dummy athlete instance.
 */
function createDefaultAthleteInstance(coachId?: string): AthleteUser {
  const defaultAthlete = new AthleteUser({
    name: "dummy",
    surname: "dummy",
    isDummy: true,
    coachId: coachId,
  });

  return defaultAthlete;
}

/**
 * Initialize program template instance.
 *
 * @param program optional program instance to use as a starting point.
 * @returns program template instamce.
 */
function initializeProgramTemplateInstance(program?: Program): Program {
  const programTemplate = program?.duplicate() ?? new Program();
  programTemplate.athlete = createDefaultAthleteInstance(
    programTemplate.coachId,
  );
  programTemplate.uid = undefined;
  programTemplate.lastUpdated = new Date();

  return programTemplate;
}

/**
 * Create a filtered instance of the program.
 *
 * @param program program that shall be filtered.
 * @param filter selected weeks, days, and exercises to filter from program.
 * @param [includeUndefined=false] if true, keep undefined exercises in output program if exercises are being filtered.
 */
export function filterProgram(
  program: Program,
  filter: ProgramFilter,
  includeUndefined = false,
  inplace = false,
): Program {
  const outProgram = inplace ? program : program.duplicate();
  outProgram.programExercises = outProgram.programExercises?.filter(
    (programExercise) => {
      if (
        filter.week.length > 0 &&
        (!programExercise.scheduleWeek ||
          !filter.week.includes(programExercise.scheduleWeek.toString()))
      ) {
        return false;
      }
      if (
        filter.day.length > 0 &&
        (!programExercise.scheduleDay ||
          !filter.day.includes(programExercise.scheduleDay.toString()))
      ) {
        return false;
      }
      if (
        filter.exercise.length > 0 &&
        ((!programExercise.exercise?.name && !includeUndefined) ||
          (programExercise.exercise?.name &&
            !filter.exercise.includes(programExercise.exercise.name)))
      ) {
        return false;
      }
      return true;
    },
  );
  return outProgram;
}

/**
 * Convert a program instance into a program template.
 *
 * @param program program that shall be converted into a template.
 * @param programFilter optional filter to be applied during conversion.
 * @returns program template instance.
 */
export function programToProgramTemplate(
  program: Program,
  programFilter?: ProgramFilter,
): Program {
  const programTemplate = initializeProgramTemplateInstance(program);
  programTemplate.athlete = createDefaultAthleteInstance(program.coachId);

  // Apply filters if necessary
  if (programFilter && programTemplate.programExercises)
    filterProgram(programTemplate, programFilter, false, true);

  return programTemplate;
}

/**
 * Get a list of unique maxlifts referenced in a program.
 *
 * @param program program instance that contains the maxlifts.
 * @returns list of unique maxlifts.
 */
export function extractUniqueMaxliftFromProgram(program: Program): MaxLift[] {
  // Get all references maxlifts
  const maxlifts: MaxLift[] = (program.programExercises ?? []).flatMap(
    (programExercise) =>
      (programExercise.lines ?? []).flatMap((line) => {
        const maxifts: MaxLift[] = [];
        if (line.loadReference instanceof MaxLift)
          maxifts.push(line.loadReference);
        if (line.repsReference instanceof MaxLift)
          maxifts.push(line.repsReference);
        return maxifts;
      }),
  );

  // Return only the unique list of maxlifts
  return arrayUniqueValues(maxlifts);
}
