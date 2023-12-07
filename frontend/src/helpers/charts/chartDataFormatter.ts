import { Program, ProgramLine } from "@/helpers/programs/program";
import { ChartData } from "chart.js";
import { colors } from "quasar";
import {
  calculateTotalReps,
  calculateTotalSets,
  computeUndefined,
} from "./chartDatasetComputations";
import {
  OSAvailableXType,
  OSChartDataRequest,
  OSChartDescriptor,
  OSChartType,
  OSChartVersion,
} from "./chartTypes";
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
  label: string;
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

  // Convert Sets to sorted arrays
  const sortedDays = Array.from(days).sort();
  const sortedWeeks = Array.from(weeks).sort();

  return { days: new Set(sortedDays), weeks: new Set(sortedWeeks) };
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
    const currentExerciseFullName = `${exerciseName}`.trim();

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
export function getUniqueExerciseNames(program: Program): Set<string> {
  const uniqueExerciseNames: Set<string> = new Set();

  program.programExercises?.forEach((exercise) => {
    const exerciseName = exercise.exercise?.name || "";
    const uniqueName = `${exerciseName}`.trim();

    if (uniqueName) {
      uniqueExerciseNames.add(uniqueName as string);
    }
  });

  return uniqueExerciseNames;
}

/**
 * Method to extract program line for given exercises on specific days and weeks.
 * If no days are passed, returns the program lines for the whole week
 */
export function getProgramLines(
  program: Program,
  exerciseFullNames?: string | string[],
  weeks?: string | string[],
  days?: string | string[],
): ProgramLine[] {
  const filteredLines: ProgramLine[] = [];

  // Convert single elements to arrays
  const exerciseNamesArray = Array.isArray(exerciseFullNames)
    ? exerciseFullNames
    : [exerciseFullNames];
  const weeksArray = Array.isArray(weeks) ? weeks : [weeks];
  const daysArray = Array.isArray(days) ? days : [days];

  program.programExercises?.forEach((exercise) => {
    const exerciseName = exercise.exercise?.name || "";
    const currentExerciseFullName = `${exerciseName}`.trim();

    if (
      (!exerciseFullNames ||
        exerciseNamesArray.includes(currentExerciseFullName)) &&
      (!weeks || weeksArray.includes(String(exercise.scheduleWeek))) &&
      (!days || daysArray.includes(String(exercise.scheduleDay)))
    ) {
      const lines = exercise.lines?.slice();

      if (lines) {
        filteredLines.push(...lines);
      }
    }
  });

  return filteredLines;
}

export function getCalculationFunction(
  chartInfo: OSChartDescriptor,
): (lines: ProgramLine[]) => number | undefined {
  if (
    chartInfo.chartVersion === OSChartVersion.TotalReps &&
    chartInfo.chartType == OSChartType.Volume
  ) {
    return calculateTotalReps;
  } else if (
    chartInfo.chartVersion === OSChartVersion.TotalSets &&
    chartInfo.chartType == OSChartType.Volume
  ) {
    return calculateTotalSets;
  }

  //TODO add other charts

  //TODO add a default method
  return computeUndefined;
}

export function computeDataForExercise(
  program: Program,
  currentExerciseFullName: string,
  weeks?: Set<string>,
  days?: Set<string>,
  chartInfo?: OSChartDescriptor,
): ExerciseChartData[] {
  if (!weeks || !days) {
    const { weeks: computedUniqueWeeks, days: computedUniqueDays } =
      getUniqueWeeksAndDaysForExercise(program, currentExerciseFullName);

    if (!weeks) {
      weeks = computedUniqueWeeks;
    }

    if (!days) {
      days = computedUniqueDays;
    }
  }

  const data: ExerciseChartData[] = [];

  //TODO: substitute calculateTotalReps with a default "fallback" method
  const calculationFunction = chartInfo
    ? getCalculationFunction(chartInfo)
    : calculateTotalReps;

  if (chartInfo?.xAxisType === OSAvailableXType.Weeks) {
    weeks.forEach((week) => {
      let totalValueForWeek = 0;
      days?.forEach((day) => {
        const lines = getProgramLines(
          program,
          currentExerciseFullName,
          String(week),
          String(day),
        );

        totalValueForWeek += calculationFunction(lines) ?? 0;
      });

      const label = `Week ${week}`;
      data.push({ key: label, value: totalValueForWeek });
    });
  } else if (chartInfo?.xAxisType === OSAvailableXType.Days) {
    days?.forEach((day) => {
      let totalValueForDay = 0;
      weeks?.forEach((week) => {
        const lines = getProgramLines(
          program,
          currentExerciseFullName,
          String(week),
          String(day),
        );

        totalValueForDay += calculationFunction(lines) ?? 0;
      });

      const label = `Day ${day}`;
      data.push({ key: label, value: totalValueForDay });
    });
  }

  return data;
}

export function computeChartData(
  chartRequest: OSChartDataRequest,
): ExerciseChartDataset[] {
  const datasets: ExerciseChartDataset[] = [];

  if (!chartRequest.chartInfo.xAxisType) {
    chartRequest.chartInfo.xAxisType = OSAvailableXType.Weeks;
  }
  if (!chartRequest.selectedExercises) {
    chartRequest.selectedExercises = getUniqueExerciseNames(
      chartRequest.program,
    );
  }

  chartRequest.selectedExercises?.forEach((exerciseName) => {
    const data = computeDataForExercise(
      chartRequest.program,
      exerciseName,
      chartRequest.selectedWeeks,
      chartRequest.selectedDays,
      chartRequest.chartInfo,
    );

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
export function formatChartData(
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

/**
 * Creates the chart options to be passed to the chart component
 * @param xAxisName
 * @param yAxisName
 * @returns
 */
export function createChartOptions(xAxisName?: string, yAxisName?: string) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        display: true,
        title: {
          display: xAxisName ? true : false,
          text: xAxisName,
        },
      },
      y: {
        type: "linear",
        display: true,
        position: "left",
        title: {
          display: yAxisName ? true : false,
          text: yAxisName,
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
    },
  };
}
