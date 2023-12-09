import { AthleteUser } from "../users/user";
import { Program } from "./program";

/**
 * Get the list of historical programs that have been assigned to athlete.
 *
 * @param athlete instance of athlete user with assigned programs.
 * @param programs list of all available programs.
 * @returns list of programs that have been assigned to athlete.
 */
export function getAllAssignedPrograms(
  athlete: AthleteUser,
  programs: Program[],
) {
  return programs.filter(
    (program) => program.uid && athlete.assignedPrograms?.includes(program.uid),
  );
}

/**
 * Get current program that is assigned to athlete.
 *
 * @param athlete instance of athlete user with a possible assigned program.
 * @param programs list of all available programs.
 * @returns program that is currently assigned to user.
 */
export function getAssignedProgram(athlete: AthleteUser, programs: Program[]) {
  return programs.find(
    (program) => program.uid && athlete.assignedProgramId === program.uid,
  );
}
