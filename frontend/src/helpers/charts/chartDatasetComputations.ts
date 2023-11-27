import { ProgramLine } from "../programs/program";

/*********** VOLUME CALCULATIONS *************/
//TODO: substitute BaseValue with ComputedValue

/**
 * Calculates total sets on the provided program lines
 */
export function calculateTotalSets(programLines: ProgramLine[]): number {
  return programLines.reduce((totalSets, line) => {
    // Convert to integer or default to 0 if NaN
    const setsBaseValue = parseInt(line.setsBaseValue ?? "0", 10);

    totalSets += setsBaseValue;

    return totalSets;
  }, 0);
}

/**
 * Calculates total reps on the provided program lines
 */
export function calculateTotalReps(programLines: ProgramLine[]): number {
  return programLines.reduce((totalReps, line) => {
    // Convert to integer or default to 0 if NaN

    const repsBaseValue = parseInt(line.repsBaseValue ?? "0", 10);
    const setsBaseValue = parseInt(line.setsBaseValue ?? "0", 10);

    totalReps += repsBaseValue * setsBaseValue;

    return totalReps;
  }, 0);
}

/**
 * Calculates total volume on the provided program lines
 * Note: it only accepts loads with "kg" units, not %.
 */
export function calculateTotalVolume(programLines: ProgramLine[]): number {
  return programLines.reduce((totalVolume, line) => {
    const repsBaseValue = parseInt(line.repsBaseValue ?? "0", 10);
    const setsBaseValue = parseInt(line.setsBaseValue ?? "0", 10);
    const loadBaseValue = parseFloat(
      (line.loadBaseValue || "0").replace(/[^0-9.]/g, ""),
    );

    totalVolume += repsBaseValue * setsBaseValue * loadBaseValue;

    return totalVolume;
  }, 0);
}

/**
 * Computes the maximum intensity as the maximum load of the passed lines.
 * TODO: implement calculations with load/1RM
 * @param programLines
 * @returns
 */
export function calculateMaxIntensity(programLines: ProgramLine[]): number {
  if (programLines.length === 0) {
    return 0;
  }
  const maxIntensity = programLines.reduce((max, line) => {
    //TODO: improve checking if 1RM exist
    const loadBaseValue = parseFloat(
      (line.loadBaseValue || "0").replace(/[^0-9.]/g, ""),
    );

    if (!isNaN(loadBaseValue)) {
      return Math.max(max, loadBaseValue);
    } else {
      return max;
    }
  }, 0);

  return maxIntensity;
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
