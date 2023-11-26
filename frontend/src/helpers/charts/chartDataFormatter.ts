import {
  Program,
  ProgramExercise,
  ProgramLine,
} from "@/helpers/programs/program";

// Correspond to Y-coordinate of a dataset for a chart.js entry (one exercise)
interface ChartDataset {
  label?: string; // Exercise name
  data: number[]; // actual series
  borderColor?: string; //"rgba(0, 123, 255, 1)"
  backgroundColor?: string; //"rgba(0, 123, 255, 0.2)",
  fill?: boolean; //false,
  cubicInterpolationMode?: string; // "monotone",
  tension?: number; // 0.1,
  yAxisID?: string; // "y",
}

// Correspond to X-coordinate of the dataset
interface ChartLabels {
  labels?: string[];
}

/**
 * TODO: remove this method and import from excelconverter or put in a generic service
 * OK, TESTED. TODO: improve to handle both string and number, "1" and 1 are taken as different values
 * Determines unique day and week names of the program
 */
export function getUniqueDayAndWeekNames(program: Program): {
  days: Set<string | number>;
  weeks: Set<string | number>;
} {
  const days = new Set<string | number>();
  const weeks = new Set<string | number>();

  program.programExercises?.forEach((exercise) => {
    days.add(exercise.scheduleDay as string);
    weeks.add(exercise.scheduleWeek as string);
  });

  return { days, weeks };
}

/**
 * Determines unique day and week names of the program for a given exercise
 */
export function getUniqueWeeksAndDaysForExercise(
  program: Program,
  exerciseFullName: string,
): { weeks: Set<string>; days: Set<string> } {
  const weeks: Set<string> = new Set();
  const days: Set<string> = new Set();

  program.programExercises?.forEach((exercise) => {
    const exerciseName = exercise.exercise?.name || "";
    const exerciseVariantName = exercise.exerciseVariant?.name || "";
    const currentExerciseFullName =
      `${exerciseName} - ${exerciseVariantName}`.trim();

    if (currentExerciseFullName === exerciseFullName) {
      const week = String(exercise.scheduleWeek);
      const day = String(exercise.scheduleDay);

      if (typeof week === "string" || typeof week === "number") {
        weeks.add(String(week));
      }

      if (typeof day === "string" || typeof day === "number") {
        days.add(String(day));
      }
    }
  });

  return { days, weeks };
}

/**
 * Method to get unique exercise names from the program (name considers base exercise and variant)
 */
export function getUniqueExerciseNames(program: Program): {
  uniqueExerciseNames: Set<string>;
} {
  const uniqueExerciseNames: Set<string> = new Set();

  program.programExercises?.forEach((exercise) => {
    const exerciseName = exercise.exercise?.name || "";
    const exerciseVariantName = exercise.exerciseVariant?.name || "";
    const uniqueName = `${exerciseName} - ${exerciseVariantName}`.trim();

    if (uniqueName) {
      uniqueExerciseNames.add(uniqueName as string);
    }
  });

  return { uniqueExerciseNames };
}

/**
 * Method to extract program line for a given exercise on a specific day and week.
 * If no day is passed, returns the program lines for the whole week
 */
export function getProgramLines(
  program: Program,
  exerciseFullName: string,
  week: string | number,
  day?: string | number,
): ProgramLine[] {
  const filteredLines: ProgramLine[] = [];

  program.programExercises?.forEach((exercise) => {
    const exerciseName = exercise.exercise?.name || "";
    const exerciseVariantName = exercise.exerciseVariant?.name || "";
    const currentExerciseFullName =
      `${exerciseName} - ${exerciseVariantName}`.trim();

    if (
      currentExerciseFullName === exerciseFullName &&
      String(exercise.scheduleWeek) === String(week) &&
      (day === undefined || String(exercise.scheduleDay) === String(day))
    ) {
      const lines = exercise.lines?.slice();

      if (lines) {
        filteredLines.push(...lines);
      }
    }
  });

  return filteredLines;
}

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
 * Compute total reps for a single exercise along multiple weeks
 */
import { ChartData } from "chart.js";

export function calculateTotalRepsForExerciseByWeek(
  program: Program,
  currentExerciseFullName: string,
): ChartData<"line", { key: string; value: number }[]> {
  const datasets: ChartData<"line", { key: string; value: number }[]> = {
    datasets: [],
  };

  const { weeks, days } = getUniqueWeeksAndDaysForExercise(
    program,
    currentExerciseFullName,
  );

  const data: { key: string; value: number }[] = [];

  weeks.forEach((week) => {
    let totalRepsForWeek = 0;
    days.forEach((day) => {
      const lines = getProgramLines(
        program,
        currentExerciseFullName,
        String(week),
        String(day),
      );

      totalRepsForWeek += calculateTotalReps(lines);
    });

    data.push({ key: `Week ${week}`, value: totalRepsForWeek });
  });

  datasets.datasets.push({
    data: data,
    parsing: {
      xAxisKey: "key",
      yAxisKey: "value",
    },
  });

  return datasets;
}
