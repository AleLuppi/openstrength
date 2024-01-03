import type { Exercise, ExerciseVariant } from "@/helpers/exercises/exercise";

/**
 * Reduce a list of exercises to merge variants according to exercise name.
 *
 * @param exercises list of exercises to reduce.
 * @returns unique exercises with concatenated list of variants.
 */
export function reduceExercises(exercises: Exercise[]) {
  return exercises.reduce(
    (exerciseList: Exercise[], currentExercise: Exercise) => {
      const exercise = exerciseList.find(
        (exercise) => exercise.name == currentExercise.name,
      );
      if (exercise) {
        exercise.variants = (exercise.variants ?? []).concat(
          currentExercise.variants ?? [],
        );
        exercise.variants.forEach((variant) => (variant.exercise = exercise));
        return exerciseList;
      } else {
        exerciseList.push(currentExercise);
        return exerciseList;
      }
    },
    [],
  );
}

/**
 * Sort inplace a list of exercises by their name.
 *
 * @param exercises list of exercises to sort.
 * @param sortVariants if true, sort variants inside each exercise too.
 */
export function sortExercises(
  exercises: Exercise[],
  sortVariants: boolean = false,
) {
  // Sort by name
  exercises.sort((itemA, itemB) => {
    const nameA = (itemA.name ?? "").toLowerCase();
    const nameB = (itemB.name ?? "").toLowerCase();
    return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
  });

  // Sort variants if needed
  if (sortVariants)
    exercises.forEach((exercise) => {
      if (exercise.variants) sortExerciseVariants(exercise.variants);
    });
}

/**
 * Sort inplace a list of variants by their name.
 *
 * @param variants list of variants to sort.
 */
export function sortExerciseVariants(variants: ExerciseVariant[]) {
  // Sort by name
  variants.sort((itemA, itemB) => {
    const nameA = (itemA.name ?? "").toLowerCase();
    const nameB = (itemB.name ?? "").toLowerCase();
    return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
  });
}
