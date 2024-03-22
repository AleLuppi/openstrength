import { ExerciseLoadType } from 'src/helpers/exercises/exercise';
import { MaxLift, MaxLiftType } from 'src/helpers/maxlifts/maxlift';
import { ProgramLine } from 'src/helpers/programs/program';
import { numberRoundToDecimal } from 'src/helpers/scalar';

/**
 * Define RPE-reps table.
 * Each value is a percentage of 1RM.
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
 * Estimate 1RM value based on exercise type and rpe table for a given maxlift.
 *
 * @param maxlift max lift to be used for the estimation.
 * @param rpeTable optional rpe-reps table to override default one.
 * @returns the estimated 1RM value
 */
export function estimate1RMfromNRM(
  maxlift: MaxLift,
  rpeTable: number[][] = rpeRepsTable
): number | undefined {
  // Check inputs
  if (
    maxlift.value == undefined ||
    typeof Number(maxlift.value) !== 'number' ||
    !maxlift.type ||
    !rpeTable
  ) {
    return undefined;
  }

  // Set body weight
  let bodyweight = 0;
  if (
    maxlift.exercise?.defaultVariant?.loadType &&
    [ExerciseLoadType.loaded, ExerciseLoadType.bodyweight].includes(
      maxlift.exercise?.defaultVariant?.loadType
    )
  ) {
    bodyweight = maxlift.athlete?.weight ? Number(maxlift.athlete?.weight) : 75;
  }

  // Compute estimated 1RM value
  let usefulRpeRepstableValue = undefined;
  switch (maxlift.type) {
    case MaxLiftType._3RM:
      usefulRpeRepstableValue = rpeTable[0][2];
      break;
    case MaxLiftType._5RM:
      usefulRpeRepstableValue = rpeTable[0][4];
      break;
    case MaxLiftType._6RM:
      usefulRpeRepstableValue = rpeTable[0][5];
      break;
    case MaxLiftType._8RM:
      usefulRpeRepstableValue = rpeTable[0][7];
      break;
    case MaxLiftType._10RM:
      usefulRpeRepstableValue = rpeTable[0][9];
      break;
  }

  // Get correct output result
  if (usefulRpeRepstableValue != undefined) {
    const estimated1RMValue =
      (bodyweight + Number(maxlift.value)) / (0.01 * usefulRpeRepstableValue);
    return numberRoundToDecimal(
      numberRoundToDecimal(estimated1RMValue, 1) - bodyweight,
      2
    );
  }
  return undefined;
}

/**
 * Method to compute the percentage of 1RM [%] from the rpe-reps table
 * @param reps repetition number from 1 to 15
 * @param rpe rpe from 6.5 to 10 at 0.5 increments
 * @param rpeTable actual instance of rpe table (2D array)
 * @returns Given a reps number and an rpe, returns the % of the 1RM as a number from 1 to 100
 */
export function calculatePercentage1RM(
  reps: number,
  rpe: number,
  rpeTable: number[][] = rpeRepsTable
): number | undefined {
  if (reps < 1 || reps > 15 || rpe < 6.5 || rpe > 10 || !rpeTable) {
    console.error('Invalid reps, RPE values, or RPE table.');
    return undefined;
  }

  const floorReps = Math.floor(reps);
  const ceilReps = Math.ceil(reps);

  const floorRpe = Math.floor(rpe);
  const ceilRpe = Math.ceil(rpe);

  if (floorReps === ceilReps && floorRpe === ceilRpe) {
    // Integer reps, use the table directly
    const rpeIndex = 7 - Math.round((rpe - 6.5) * 2);
    const repsIndex = floorReps - 1;
    return rpeTable[rpeIndex][repsIndex];
  } else {
    // Fractional reps, interpolate between the two nearest integer reps
    const rpeIndex = 7 - Math.round((rpe - 6.5) * 2);
    const floorRepsIndex = floorReps - 1;
    const ceilRepsIndex = ceilReps - 1;

    const floorPercentage = rpeTable[rpeIndex][floorRepsIndex];
    const ceilPercentage = rpeTable[rpeIndex][ceilRepsIndex];

    // Linear interpolation
    const fraction = reps - floorReps;
    return floorPercentage + (ceilPercentage - floorPercentage) * fraction;
  }
}

/**
 * Method to compute the number of reps given a % of the RM and rpe
 * @param percentage from 0 to 100, indicates load/1RM
 * @param rpe rpe from 6.5 to 10 at 0.5 increments
 * @param rpeTable actual instance of rpe table (2D array)
 * @returns number of reps for that specific load% and RPE
 */
export function calculateRepsFromTable(
  percentage: number,
  rpe: number,
  rpeTable: number[][] = rpeRepsTable
): number | undefined {
  if (
    percentage < 0 ||
    percentage > 100 ||
    rpe < 6.5 ||
    rpe > 10 ||
    !rpeTable
  ) {
    console.error('Invalid percentage, RPE values, or RPE table.');
    return undefined;
  }

  const rpeIndex = 7 - Math.round((rpe - 6.5) * 2);
  const row = rpeTable[rpeIndex];

  // Find the two nearest percentages
  let lowerIndex = 0;
  let upperIndex = row.length - 1;

  for (let i = 0; i < row.length; i++) {
    if (row[i] === percentage) {
      // Exact match, return the corresponding reps
      return i + 1;
    }

    if (row[i] < percentage && row[i] > row[lowerIndex]) {
      lowerIndex = i;
    } else if (row[i] > percentage && row[i] < row[upperIndex]) {
      upperIndex = i;
    }
  }

  const lowerPercentage = row[lowerIndex];
  const upperPercentage = row[upperIndex];

  const lowerReps = lowerIndex + 1;
  const upperReps = upperIndex + 1;

  // Linear interpolation
  const fraction =
    (percentage - lowerPercentage) / (upperPercentage - lowerPercentage);
  const reps = lowerReps + fraction * (upperReps - lowerReps);

  // Round to the nearest integer
  return Math.round(reps);
}

/**
 * Method to compute the rpe given a % of the RM and reps
 * @param percentage from 0 to 100, indicates load/1RM
 * @param reps reps number
 * @param rpeTable actual instance of rpe table (2D array)
 * @returns rpe from 6.5 to 10 at 0.5 increments
 */
export function calculateRpeFromTable(
  percentage: number,
  reps: number,
  rpeTable: number[][] = rpeRepsTable
): number | undefined {
  if (
    percentage < 0 ||
    percentage > 100 ||
    reps < 1 ||
    reps > 15 ||
    !rpeTable
  ) {
    console.error('Invalid percentage, reps values, or RPE table.');
    return undefined;
  }

  const repsIndex = reps - 1;
  const column = rpeTable.map((row) => row[repsIndex]);

  // Iterate over the row to find the closest value to the provided percentage
  const closestIndex = column
    .map((value, index) => ({ index, diff: Math.abs(value - percentage) }))
    .reduce((min, current) => (current.diff < min.diff ? current : min)).index;

  const rpe = 6.5 + 0.5 * (7 - closestIndex);

  return rpe;
}

/**
 * Fallback method when no available computational methods are present
 */
export function computeUndefined(): number | undefined {
  return undefined;
}

/************ COMPLETE LINE COMPUTATIONS ************/
/**
 * Computes or estimates the remaining parameters of a line
 */
export function estimateMissingLineProps(
  programLine: ProgramLine,
  maxliftValue: number
): ProgramLine | undefined {
  const line = programLine.duplicate();

  const load =
    line.loadValue ??
    line.loadComputedValue ??
    line.loadSupposedValue ??
    undefined;
  const reps =
    line.repsValue ??
    line.repsComputedValue ??
    line.repsSupposedValue ??
    undefined;
  const rpe =
    line.rpeValue ??
    line.rpeComputedValue ??
    line.rpeSupposedValue ??
    undefined;

  //TODO: Ensure load is a percentage (if in kg, transform into a percentage)
  let loadPercentage = undefined;
  if (load) {
    loadPercentage = 100 * (load / maxliftValue);
  }

  if (loadPercentage && reps && !rpe) {
    const estimatedRpe = calculateRpeFromTable(loadPercentage, reps);
    line.rpeBaseValue = `${estimatedRpe}`;
  } else if (!loadPercentage && reps && rpe) {
    const estimatedLoad = calculatePercentage1RM(reps, rpe);
    //line.loadBaseValue = `${estimatedLoad}%`;

    line.loadBaseValue = estimatedLoad
      ? (Math.round(estimatedLoad * 100) / 100).toString() + '%'
      : undefined;
  } else if (loadPercentage && !reps && rpe) {
    const estimatedReps = calculateRepsFromTable(loadPercentage, rpe);
    line.repsBaseValue = `${estimatedReps}`;
  }

  return line;
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
 * Compute the max intensity in kg.
 *
 * @param programLines lines from which max intensity shall be retrieved.
 * @returns max intensity.
 */
export function calculateMaxIntensityKg(programLines: ProgramLine[]): number {
  if (programLines.length === 0) {
    return 0;
  }

  // Find the maximum load as [kg] value among the lines
  const maxIntensity = programLines.reduce((max, line) => {
    const load =
      line.loadValue ?? line.loadComputedValue ?? line.loadSupposedValue ?? 0;
    return isNaN(load) ? max : Math.max(max, load);
  }, 0);

  return maxIntensity;
}

/**
 * Compute the average intensity in percentage.
 *
 * @param programLines lines from which average intensity shall be retrieved.
 * @returns average intensity.
 */
export function calculateAverageIntensityKg(
  programLines: ProgramLine[]
): number {
  if (programLines.length === 0) {
    return 0;
  }

  const loadValues = programLines
    .map(
      (line) =>
        line.loadValue ?? line.loadComputedValue ?? line.loadSupposedValue ?? 0
    )
    .filter((value) => value !== null && !isNaN(value) && value !== 0);

  const sum = loadValues.reduce((accumulator, value) => accumulator + value, 0);
  const averageIntensity = loadValues.length > 0 ? sum / loadValues.length : 0;

  return averageIntensity;
}
