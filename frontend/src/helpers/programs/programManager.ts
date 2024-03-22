import type { Program } from 'src/helpers/programs/program';
import type { AthleteUser } from 'src/helpers/users/user';
import { arrayPushToNullable, arrayUniqueSubsequentValues } from '../array';

/**
 * Assign a program to an athlete and save it.
 *
 * @param program program that shall be assigned to athlete.
 * @param athlete athlete to which program shall be assigned.
 * @param onSuccess function to execute when operation is successful.
 * @param onError function to execute when operation fails.
 */
export function assignProgramToAthlete(
  program: Program,
  athlete: AthleteUser,
  {
    onSuccess,
    onError,
  }: { onSuccess?: (...x: any) => void; onError?: (...x: any) => void } = {}
) {
  // Update athlete info
  athlete.assignedProgramId = program.uid;
  if (program.uid)
    athlete.assignedPrograms = arrayUniqueSubsequentValues(
      arrayPushToNullable(athlete.assignedPrograms, program.uid)
    );

  // Store changes
  athlete.saveUpdate({
    onSuccess: onSuccess,
    onError: onError,
  });
}
