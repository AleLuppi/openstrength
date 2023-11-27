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
