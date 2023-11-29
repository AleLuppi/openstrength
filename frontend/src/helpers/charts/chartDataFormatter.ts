import { Program, ProgramLine } from "@/helpers/programs/program";
import { ChartData } from "chart.js";
import { colors } from "quasar";
import { calculateTotalReps } from "./chartDatasetComputations";
const { getPaletteColor, lighten } = colors;

// TODO: find a way to compute all the charts, now only total reps is computed

/**
 * Defines how data should be organized for charts (key is X, value is Y)
 */
interface ExerciseChartData {
  key: string;
  value: number;
}

/**
 * Defines how each dataset should be organizedfor chart (corresponds to a timeseries)
 */
interface ExerciseChartDataset {
  backgroundColor: string;
  borderColor: string;
  data: { key: string; value: number }[];
  parsing: {
    xAxisKey: string;
    yAxisKey: string;
  };
  label: string; // Add a label property
}

/**
 * TODO: remove this method and import from excelconverter or put in a generic service
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
 * TODO: week can be null, also exercise can be null
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

/**
 * Computes the total reps for a single exercise in a program
 * @param program program instance passed
 * @param currentExerciseFullName full exercise name defined as "exerciseName - variantName"
 * @returns
 */
export function computeTotalRepsForExercise(
  program: Program,
  currentExerciseFullName: string,
): ExerciseChartData[] {
  const { weeks, days } = getUniqueWeeksAndDaysForExercise(
    program,
    currentExerciseFullName,
  );

  const data: ExerciseChartData[] = [];

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

    const label = `Week ${week}`;
    data.push({ key: label, value: totalRepsForWeek });
  });

  return data;
}

/**
 * Computes the data for the chart for an array of exercises
 * @param program program instance
 * @param exerciseNames array of currentExerciseFullName
 * @returns
 */
export function computeChartDataForExercises(
  program: Program,
  exerciseNames: string[],
): ExerciseChartDataset[] {
  const datasets: ExerciseChartDataset[] = [];

  exerciseNames.forEach((exerciseName) => {
    const data = computeTotalRepsForExercise(program, exerciseName);

    datasets.push({
      backgroundColor: "", //TODO: clean up, colors are overwritten later
      borderColor: "",
      data: data,
      parsing: {
        xAxisKey: "key",
        yAxisKey: "value",
      },
      label: exerciseName,
    });
  });

  return datasets;
}

/**
 * Format data as required by chart.js
 * @param datasets
 * @returns
 */
export function formatChartDataForChart(
  datasets?: ExerciseChartDataset[],
): ChartData<"line", ExerciseChartData[]> | undefined {
  if (!datasets || datasets.length === 0) {
    console.error("Invalid datasets structure.");
    return undefined;
  }

  // Extract unique labels from datasets
  const uniqueLabels = Array.from(
    new Set(
      datasets.flatMap((dataset) => dataset.data.map((item) => item.key)),
    ),
  );

  const chartData: ChartData<"line", ExerciseChartData[]> = {
    labels: uniqueLabels,
    datasets: datasets.map((dataset, index) => {
      const color = getPaletteColor("chart-color" + (index + 1));
      if (!color) {
        throw new Error("Unable to generate color."); // Enhance error handling
      }

      return {
        ...dataset,
        backgroundColor: color,
        borderColor: lighten(color, 25),
        data: dataset.data,
      };
    }),
  };

  return chartData;
}
