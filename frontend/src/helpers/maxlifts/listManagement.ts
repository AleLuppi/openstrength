import { MaxLift, MaxLiftType } from "@/helpers/maxlifts/maxlift";
import { arraySortObjectsByField } from "@/helpers/array";

/**
 * Get a object having exercise name and max lift type as key, and MaxLift instance as value.
 * @param maxlifts list of max lifts.
 * @returns object of indexed max lifts.
 */
export function separateMaxliftPerExerciseAndType(maxlifts: MaxLift[]) {
  const sortedMaxlifts = arraySortObjectsByField(
    maxlifts,
    "performedOn",
  ).reverse();
  return sortedMaxlifts.reduce(
    (
      out: { [key: string]: { [subkey in MaxLiftType]?: MaxLift } },
      maxlift,
    ) => {
      if (!maxlift.exercise?.name || !maxlift.type) return out;
      if (!out[maxlift.exercise.name])
        out[maxlift.exercise.name] = {
          [maxlift.type]: maxlift,
        };
      if (!out[maxlift.exercise.name][maxlift.type])
        out[maxlift.exercise.name][maxlift.type] = maxlift;
      return out;
    },
    {},
  );
}
