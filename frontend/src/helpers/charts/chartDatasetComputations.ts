import { ExerciseLoadType } from "../exercises/exercise";
import { MaxLift, MaxLiftType } from "../maxlifts/maxlift";
import { ProgramLine } from "../programs/program";
import { AthleteUser } from "../users/user";

/**
 * Define RPE-reps table.
 * Each value is a percentage of 1RM
 * Column index define the reps, row index define the rpe
 */
export const rpeRepsTable: number[][] = [
  //1   2   3   4   5   6   7   8   9   10  11  12  13  14  15  reps
  [100, 96, 92, 89, 86, 84, 81, 79, 76, 74, 71, 69, 66, 64, 61], // 10
  [98, 94, 91, 88, 85, 82, 80, 77, 75, 72, 70, 67, 65, 62, 60], // 9.5
  [96, 92, 89, 86, 84, 81, 79, 76, 74, 71, 69, 66, 64, 61, 59], // 9
  [94, 91, 88, 85, 82, 80, 77, 75, 72, 69, 66, 63, 60, 57, 54], // 8.5
  [92, 89, 86, 84, 81, 79, 76, 74, 71, 68, 65, 62, 59, 56, 53], // 8
  [91, 88, 85, 82, 80, 77, 75, 72, 69, 67, 64, 62, 59, 57, 54], // 7.5
  [89, 86, 84, 81, 79, 76, 74, 71, 68, 65, 62, 59, 56, 53, 50], // 7
  [88, 85, 82, 80, 77, 75, 72, 69, 67, 64, 62, 59, 57, 54, 52], // 6.5 rpe
];

/**
 * Estimates 1RM value based on exercise type and rpe table for a given maxlift
 * @param maxlift maxlift to be used for the estimation
 * @param athlete athlete whose 1RM should be estimated
 * @param rpeTable actual table to use (NOTE: to keep as a variable as the coach could also potentially want to customize)
 * @returns the estimated 1RM value
 */

//TODO: check athlete from maxlift
//TODO mettere come default la tabella sopra
export function estimate1RMfromNRM(
  maxlift: MaxLift,
  athlete: AthleteUser,
  rpeTable: number[][],
): number | undefined {
  if (typeof Number(maxlift.value) != "number" || !maxlift.type || !rpeTable) {
    console.error("Invalid value, maxlift type, or RPE table.");
    return undefined;
  }

  let estimated1RMValue = undefined;
  let bodyweight = undefined;

  // Check based on load type
  //TODO: solve issue of maxlift not correctly having defaultVariant field, defaultVariant field is always undefined
  console.log("maxlift", maxlift);
  console.log("maxlift value", maxlift.value);
  console.log("maxlift exercise", maxlift.exercise);
  console.log("maxlift exercise variants", maxlift.exercise?.variants);
  console.log(
    "maxlift exercise variants at 0 loadtype",
    maxlift.exercise?.variants?.at(0)?.loadType,
  );
  console.log(
    "maxlift exercise defaultvariant loadtype",
    maxlift.exercise?.defaultVariant?.loadType,
  );
  if (
    maxlift.exercise?.variants?.at(0)?.loadType ==
    (ExerciseLoadType.loaded || ExerciseLoadType.bodyweight)
  ) {
    bodyweight = athlete?.weight ? Number(athlete.weight) : 75;
  } else {
    bodyweight = 0;
  }

  switch (maxlift.type) {
    case MaxLiftType._1RM:
      estimated1RMValue = Number(maxlift.value);
      break;
    case MaxLiftType._3RM:
      estimated1RMValue =
        (bodyweight + Number(maxlift.value)) / (0.01 * rpeTable[0][2]);
      break;
    case MaxLiftType._5RM:
      estimated1RMValue =
        (bodyweight + Number(maxlift.value)) / (0.01 * rpeTable[0][4]);
      break;
    case MaxLiftType._6RM:
      estimated1RMValue =
        (bodyweight + Number(maxlift.value)) / (0.01 * rpeTable[0][5]);
      break;
    case MaxLiftType._8RM:
      estimated1RMValue =
        (bodyweight + Number(maxlift.value)) / (0.01 * rpeTable[0][7]);
      break;
    case MaxLiftType._10RM:
      estimated1RMValue =
        (bodyweight + Number(maxlift.value)) / (0.01 * rpeTable[0][9]);
      break;
  }
  return estimated1RMValue
    ? Math.round(estimated1RMValue * 10) / 10 - bodyweight
    : undefined;
}

/**
 * Method to compute the percentage of 1RM [%] from the rpe-reps table
 * @param reps repetition number from 1 to 15
 * @param rpe rep from 6.5 to 10 at 0.5 increments
 * @param rpeTable actual instance of rpe table (2D array)
 * @returns Given a reps number and an rpe, returns the % of the 1RM as a number from 1 to 100
 */
export function calculatePercentage1RM(
  reps: number,
  rpe: number,
  rpeTable: number[][],
): number | undefined {
  if (reps < 1 || reps > 15 || rpe < 6.5 || rpe > 10 || !rpeTable) {
    console.error("Invalid reps, RPE values, or RPE table.");
    return undefined;
  }

  const rpeIndex = 7 - Math.round((rpe - 6.5) * 2);
  const repsIndex = reps - 1;
  const percentage1RM = rpeTable[rpeIndex][repsIndex];

  return percentage1RM;
}

//TODO: substitute BaseValue with Value

/**
 * Fallback method when no available computational methods are present
 */
export function computeUndefined(
  programLines: ProgramLine[],
): number | undefined {
  return undefined;
}

/*********** VOLUME CALCULATIONS *************/
/**
 * Calculates total sets on the provided program lines
 */
export function calculateTotalSets(programLines: ProgramLine[]): number {
  return programLines.reduce((totalSets, line) => {
    const setsValue =
      line.setsValue ?? line.setsComputedValue ?? line.setsSupposedValue ?? 0;

    totalSets += setsValue;

    return totalSets;
  }, 0);
}

/**
 * Calculates total reps on the provided program lines
 */
export function calculateTotalReps(programLines: ProgramLine[]): number {
  return programLines.reduce((totalReps, line) => {
    const repsValue =
      line.repsValue ?? line.repsComputedValue ?? line.repsSupposedValue ?? 0;
    const setsValue =
      line.setsValue ?? line.setsComputedValue ?? line.setsSupposedValue ?? 0;

    totalReps += repsValue * setsValue;

    return totalReps;
  }, 0);
}

/**
 * Calculates total volume on the provided program lines
 * Note: it only accepts loads with "kg" units, not %.
 */
export function calculateTotalVolume(programLines: ProgramLine[]): number {
  return programLines.reduce((totalVolume, line) => {
    const repsValue =
      line.repsValue ?? line.repsComputedValue ?? line.repsSupposedValue ?? 0;
    const setsValue =
      line.setsValue ?? line.setsComputedValue ?? line.setsSupposedValue ?? 0;
    const loadValue =
      line.loadValue ?? line.loadComputedValue ?? line.loadSupposedValue ?? 0;

    totalVolume += repsValue * setsValue * loadValue;

    return totalVolume;
  }, 0);
}

/*********** INTENSITY CALCULATIONS *************/
/**
 * Computes the maximum intensity as the maximum load of the passed lines.
 * Overloaded method: if a maxlift is passed computes the max intensity as load/1RM
 * @param programLines
 * @returns
 */
export function calculateMaxIntensity(programLines: ProgramLine[]): number;
export function calculateMaxIntensity(
  programLines: ProgramLine[],
  maxLift: MaxLift,
): number;
export function calculateMaxIntensity(
  programLines: ProgramLine[],
  maxLift?: MaxLift,
): number {
  if (programLines.length === 0) {
    return 0;
  }

  // Find the maximum loadBaseValue among the lines
  const maxLoadBaseValue = programLines.reduce((max, line) => {
    const loadBaseValue = parseFloat(
      (line.loadBaseValue || "0").replace(/[^0-9.]/g, ""),
    );

    return isNaN(loadBaseValue) ? max : Math.max(max, loadBaseValue);
  }, 0);

  if (maxLift && maxLift.type === MaxLiftType._1RM) {
    // If maxLift is of type 1RM, compute Intensity = maxLoadBaseValue / maxLift.value
    const maxLiftValue = parseFloat(maxLift.value || "0");
    return maxLiftValue !== 0 ? maxLoadBaseValue / maxLiftValue : 0;
  } else {
    // If no maxLift return the load
    return maxLoadBaseValue;
  }
}

/**
 * Computes the cumulative intensity from an array of program lines provided
 * TODO: implement calculations also with 1RM
 * NOTE: no chart is necessary for this
 * @param programLines
 * @returns
 */
export function calculateCumulativeIntensity(
  programLines: ProgramLine[],
): number {
  if (programLines.length === 0) {
    return 0;
  }

  const cumulativeIntensity = programLines.reduce(
    (totalCumulatedIntensity, line) => {
      const load = parseFloat(
        (line.loadBaseValue || "0").replace(/[^0-9.]/g, ""),
      );
      const sets = parseInt(line.setsBaseValue || "0", 10);

      // If load or sets are NaN, ignore the line
      if (!isNaN(load) && !isNaN(sets)) {
        const lineIntensity = load * sets;
        return totalCumulatedIntensity + lineIntensity;
      } else {
        return totalCumulatedIntensity;
      }
    },
    0,
  );

  return cumulativeIntensity;
}

/**
 * Computes the mean intensity over the provided program lines
 * @param programLines
 * @returns
 */
export function calculateMeanIntensity(programLines: ProgramLine[]): number {
  const cumulativeIntensity = calculateCumulativeIntensity(programLines);
  const totalSets = calculateTotalSets(programLines);

  if (totalSets === 0) {
    return 0;
  }

  // Compute and return the ratio
  const meanIntensity = cumulativeIntensity / totalSets;
  return meanIntensity;
}
