/* ----------------------- */
/* --- TYPE DEFINITION --- */
/* ----------------------- */
type RegisteredFitnessData = {
  workoutName: string;
  workoutType: string;
  date: Date;
  tool: string;
  assignedReferenceID: string;
  series: {
    name: string;
    variant: string;
    reps: number;
    load: number | null;
    rpe: number | null;
    rest: number | null;
    repsUnit: string;
    loadUnit: string;
    feedbackID: string;
  }[];
}[];

/* ------------------------- */
/* --- DATA MANIPULATION --- */
/* ------------------------- */

/**
 * Obtain full exercise name from string pieces composing it
 * @param args strings to join
 * @returns full name joined with separator
 */
function _joinExerciseName(...args: string[]): string {
  return args.join(" | ");
}

/**
 * Get full exercise name
 * @param exercise single exercise whose name must be retrieved
 * @returns full name of the exercise
 */
function getExerciseName(
  exercise: RegisteredFitnessData[number]["series"][number],
): string {
  return _joinExerciseName(exercise.name, exercise.variant);
}

/**
 * Compare exercise name against a provided name
 * @param exercise exercise whose name must be tested
 * @param compare base exercise or exercise name to compare with test exercise name
 * @returns true if equal, false otherwise
 */
function compareExerciseName(
  exercise: RegisteredFitnessData[number]["series"][number],
  compare: RegisteredFitnessData[number]["series"][number] | string | string[],
): boolean {
  if (typeof compare === "string") return getExerciseName(exercise) == compare;
  else if (Array.isArray(compare))
    return getExerciseName(exercise) == _joinExerciseName(...compare);
  return getExerciseName(exercise) == getExerciseName(compare);
}

/* ---------------------- */
/* --- POSTPROCESSING --- */
/* ---------------------- */

/**
 * TODO
 * @param series
 * @param filtername
 * @returns
 */
export function computeVolumePerSeries(
  series: RegisteredFitnessData[number]["series"],
  filtername?: string | string[],
): number {
  return series.reduce((_prev: number, _curr) => {
    return (
      _prev +
      (!filtername || compareExerciseName(_curr, filtername)
        ? (_curr.load ?? 0) * _curr.reps
        : 0)
    );
  }, 0);
}

/**
 * TODO
 * @param exercises
 * @param filtername
 * @returns
 */
export function computeVolumeTotal(
  exercises: RegisteredFitnessData,
  filtername?: string | string[],
): number {
  return exercises.reduce(
    (_prev, _curr) => _prev + computeVolumePerSeries(_curr.series, filtername),
    0,
  );
}

/**
 * TODO
 * @param exercises
 * @param dateFrom
 * @param dateTo
 * @param filtername
 * @param resetHours
 * @returns
 */
export function computeVolumeInDateRange(
  exercises: RegisteredFitnessData,
  dateFrom: Date,
  dateTo: Date,
  filtername?: string | string[],
  resetHours: boolean = false,
): number {
  if (resetHours) {
    dateFrom.setHours(0, 0, 0, 0);
    dateTo.setDate(dateTo.getDate() + 1);
    dateTo.setHours(0, 0, 0, 0);
  }
  const filteredExercise = exercises.filter(
    (el) => dateFrom <= el.date && el.date < dateTo,
  );
  return computeVolumeTotal(filteredExercise, filtername);
}
