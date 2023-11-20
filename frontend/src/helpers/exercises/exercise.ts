import { DocumentReference } from "firebase/firestore";
import {
  doAddDoc,
  doUpdateDoc,
  doDeleteDoc,
} from "@/helpers/database/readwrite";
import { exercisesCollection } from "@/helpers/database/collections";

/**
 * Define available load types.
 */
export enum ExerciseLoadType {
  weight = "weight",
  time = "time",
}

/**
 * Define available muscle groups.
 */
export enum ExerciseMuscleGroups {
  shoulders = "shoulders",
  chest = "chest",
  core = "core",
  upperback = "upperback",
  lowerback = "lowerback",
  biceps = "biceps",
  triceps = "triceps",
  forearms = "forearms",
  glutes = "glutes",
  quads = "quads",
  harmstrings = "harmstrings",
  calves = "calves",
}

/**
 * Define available equipment.
 */
export enum ExerciseEquipment {
  barbell = "barbell",
  plates = "plates",
  dumbell = "dumbell",
  rack = "rack",
  deadliftplatform = "deadliftplatform",
  bench = "bench",
  bands = "bands",
  steps = "steps",
  dipbelt = "dipbelt",
  machine = "machine",
  bar = "bar",
  parallettes = "parallettes",
}

/**
 * Exercise properties.
 */
export type ExerciseProps = {
  // Basic info
  uid?: string;
  name?: string;

  // Variants
  variants?: ExerciseVariant[];

  // Computed info
  muscleGroups?: string[];
  equipment?: string[];
};

/**
 * Variants properties.
 */
export type ExerciseVariantProps = {
  // Basic info
  uid?: string;
  name?: string;

  // Father exercise instance
  exercise?: Exercise;

  // Variant info
  description?: string;
  loadType?: ExerciseLoadType;
  muscleGroups?: string[];
  equipment?: string[];

  // Additional info
  videoUrl?: string;

  // Computed info
  isDefault?: boolean;
};

/**
 * Exercise entity.
 *
 * @public
 */
export class Exercise {
  // Basic info
  uid?: string;
  name?: string;

  // Variants
  variants?: ExerciseVariant[];
  defaultVariant?: ExerciseVariant;

  // Get all muscle groups in variants
  public get muscleGroups() {
    return [
      ...new Set(
        this.variants?.reduce(
          (outList, variant) => outList.concat(variant.muscleGroups ?? []),
          [] as string[],
        ),
      ),
    ];
  }

  // Get all equipments in variants
  public get equipment() {
    return [
      ...new Set(
        this.variants?.reduce(
          (outList, variant) => outList.concat(variant.equipment ?? []),
          [] as string[],
        ),
      ),
    ];
  }

  constructor({ uid, name, variants }: ExerciseProps = {}) {
    this.uid = uid;
    this.name = name;
    variants?.forEach((variant) => {
      if (!variant.exercise) variant.exercise = this;
    });
    this.variants = variants;
    this.variants ?? this.addDefaultVariant();
    this.defaultVariant = this.variants?.find((variant) => variant.isDefault);
  }

  /**
   * Add a default variant that has no name.
   *
   * @param force if true, force addition of default variant even if already existent.
   */
  addDefaultVariant(force: boolean = false) {
    if (force || !this.variants?.find((variant) => variant.isDefault))
      (this.variants = this.variants || []).push(
        new ExerciseVariant({
          uid: this.uid,
          name: undefined,
          exercise: this,
        }),
      );
  }

  /**
   * Duplicate exercise.
   *
   * @param shallow avoid copying identifying fields such as uid and parent instance.
   * @returns a new exercise with duplicate fields.
   */
  duplicate(shallow: boolean = false) {
    return new Exercise({
      ...this,
      variants: this.variants?.map((variant) => variant.duplicate(shallow)),
      ...(shallow && { uid: undefined, name: undefined }),
    });
  }

  /**
   * Store a new exercise on database.
   *
   * @param exercise element that shall be stored.
   * @param onSuccess function to execute when operation is successful.
   * @param onError function to execute when operation fails.
   */
  saveNew({
    exercise,
    onSuccess,
    onError,
  }: {
    exercise?: Exercise;
    onSuccess?: Function;
    onError?: Function;
  } = {}) {
    addDocExercise(exercise || this, {
      onSuccess: onSuccess,
      onError: onError,
    });
  }

  /**
   * Update the exercise on database.
   *
   * @param exercise element that shall be updated.
   * @param onSuccess function to execute when operation is successful.
   * @param onError function to execute when operation fails.
   */
  saveUpdate({
    exercise,
    onSuccess,
    onError,
  }: {
    exercise?: Exercise;
    onSuccess?: Function;
    onError?: Function;
  } = {}) {
    updateDocExercise(exercise || this, {
      onSuccess: onSuccess,
      onError: onError,
    });
  }

  /**
   * Remove the exercise from database.
   *
   * @param exercise element that shall be removed.
   * @param onSuccess function to execute when operation is successful.
   * @param onError function to execute when operation fails.
   */
  remove({
    exercise,
    onSuccess,
    onError,
  }: {
    exercise?: Exercise;
    onSuccess?: Function;
    onError?: Function;
  } = {}) {
    // Remove each variant, thus remove the exercise
    (exercise || this).variants?.forEach((variant) =>
      variant.remove({ onSuccess: onSuccess, onError: onError }),
    );
  }
}

/**
 * Variant entity.
 *
 * @public
 */
export class ExerciseVariant {
  // Basic info
  uid?: string;
  name?: string;

  // Father exercise instance
  exercise?: Exercise;

  // Variant info
  description?: string;
  loadType?: ExerciseLoadType;
  muscleGroups?: string[];
  equipment?: string[];

  // Additional info
  videoUrl?: string;

  // Check if this variant is default one for exercise
  public get isDefault() {
    return !this.name;
  }

  constructor({
    uid,
    name,
    exercise,
    description,
    loadType,
    muscleGroups,
    equipment,
    videoUrl,
  }: ExerciseVariantProps = {}) {
    this.uid = uid;
    this.name = name;
    this.exercise = exercise;
    this.description = description;
    this.loadType = loadType;
    this.muscleGroups = muscleGroups;
    this.equipment = equipment;
    this.videoUrl = videoUrl;
  }

  /**
   * Duplicate exercise variant.
   *
   * @param shallow avoid copying identifying fields such as uid and parent instance.
   * @returns a new variant with duplicate fields.
   */
  duplicate(shallow: boolean = false) {
    return new ExerciseVariant({
      ...this,
      ...(shallow && { uid: undefined, name: undefined, exercise: undefined }),
    });
  }

  /**
   * Store a new variant on database.
   *
   * @param variant element that shall be stored.
   * @param onSuccess function to execute when operation is successful.
   * @param onError function to execute when operation fails.
   */
  saveNew({
    variant,
    onSuccess,
    onError,
  }: {
    variant?: ExerciseVariant;
    onSuccess?: Function;
    onError?: Function;
  } = {}) {
    addDocExerciseVariant(variant || this, (variant || this).exercise, {
      onSuccess: onSuccess,
      onError: onError,
    });
  }

  /**
   * Update the variant on database.
   *
   * @param variant element that shall be updated.
   * @param onSuccess function to execute when operation is successful.
   * @param onError function to execute when operation fails.
   */
  saveUpdate({
    variant,
    onSuccess,
    onError,
  }: {
    variant?: ExerciseVariant;
    onSuccess?: Function;
    onError?: Function;
  } = {}) {
    updateDocExerciseVariant(variant || this, (variant || this).exercise, {
      onSuccess: onSuccess,
      onError: onError,
    });
  }

  /**
   * Remove the variant from database.
   *
   * @param variant element that shall be removed.
   * @param onSuccess function to execute when operation is successful.
   * @param onError function to execute when operation fails.
   */
  remove({
    variant,
    onSuccess,
    onError,
  }: {
    variant?: ExerciseVariant;
    onSuccess?: Function;
    onError?: Function;
  } = {}) {
    // Ensure variant is mapped onto a database document
    const variantToDelete = variant || this;
    if (!variantToDelete.uid) {
      onError?.();
      return;
    }

    // Delete the variant
    doDeleteDoc(exercisesCollection, variantToDelete.uid, {
      onSuccess: onSuccess,
      onError: onError,
    });
  }
}

/**
 * Store exercise on database.
 *
 * @param exercise element to store on database.
 * @param onSuccess function to execute when operation is successful.
 * @param onError function to execute when operation fails.
 */
export function addDocExercise(
  exercise: Exercise,
  { onSuccess, onError }: { onSuccess?: Function; onError?: Function } = {},
) {
  exercise.variants?.forEach((variant) =>
    addDocExerciseVariant(variant, exercise, {
      onSuccess: onSuccess,
      onError: onError,
    }),
  );
}

/**
 * Store exercise variant on database.
 *
 * @param exerciseVariant element to store on database.
 * @param exercise force a parent exercise for the variant.
 * @param onSuccess function to execute when operation is successful.
 * @param onError function to execute when operation fails.
 */
export function addDocExerciseVariant(
  exerciseVariant: ExerciseVariant,
  exercise?: Exercise,
  { onSuccess, onError }: { onSuccess?: Function; onError?: Function } = {},
) {
  const extendedVariantObj = extractExerciseVariantInfo(
    exerciseVariant,
    exercise,
  );
  doAddDoc(exercisesCollection, extendedVariantObj, {
    addUserId: true,
    onSuccess: (docRef: DocumentReference) => {
      exerciseVariant.uid = docRef.id;
      onSuccess?.(docRef);
    },
    onError: onError,
  });
}

/**
 * Update exercise on database.
 *
 * @param exercise element to update on database.
 * @param onSuccess function to execute when operation is successful.
 * @param onError function to execute when operation fails.
 */
export function updateDocExercise(
  exercise: Exercise,
  { onSuccess, onError }: { onSuccess?: Function; onError?: Function } = {},
) {
  // Update existing variants, or create a new document for new variants
  exercise.variants?.forEach((variant) => {
    if (variant.uid)
      updateDocExerciseVariant(variant, exercise, {
        onSuccess: onSuccess,
        onError: onError,
      });
    else
      addDocExerciseVariant(variant, exercise, {
        onSuccess: onSuccess,
        onError: onError,
      });
  });
}

/**
 * Update exercise variant on database.
 *
 * @param exerciseVariant element to update on database.
 * @param exercise force a parent exercise for the variant.
 * @param onSuccess function to execute when operation is successful.
 * @param onError function to execute when operation fails.
 */
export function updateDocExerciseVariant(
  exerciseVariant: ExerciseVariant,
  exercise?: Exercise,
  { onSuccess, onError }: { onSuccess?: Function; onError?: Function } = {},
) {
  const extendedVariantObj = extractExerciseVariantInfo(
    exerciseVariant,
    exercise,
  );
  const docId = exerciseVariant.uid;
  if (docId)
    doUpdateDoc(exercisesCollection, docId, extendedVariantObj, {
      addUserId: true,
      onSuccess: (docRef: DocumentReference) => {
        onSuccess?.(docRef);
      },
      onError: onError,
    });
  else onError?.();
}

/**
 * Extract the variant info ready to be stored on DB.
 *
 * @param exerciseVariant element from which info shall be extracted.
 * @param exercise force a parent exercise for the variant.
 * @returns an object containing all the variant info.
 */
function extractExerciseVariantInfo(
  exerciseVariant: ExerciseVariant,
  exercise?: Exercise,
) {
  const { uid: _0, name: _1, exercise: _2, ...variantObj } = exerciseVariant;
  const variantExercise =
    exercise ?? exerciseVariant.exercise ?? new Exercise();
  const {
    uid: _3,
    name: _4,
    variants: _5,
    defaultVariant: _6,
    ...exerciseObj
  } = variantExercise;
  const fullVariantObj = {
    ...exerciseObj,
    ...variantObj,
    variant: exerciseVariant.name,
    exercise: variantExercise.name,
  };

  return fullVariantObj;
}

/**
 * Pack the variant info coming from DB.
 *
 * @param exerciseVariant element from which info shall be extracted.
 * @param exercise force a parent exercise for the variant.
 * @returns an object containing all the variant info.
 */
export function packExerciseVariantInfo(
  fullVariantObj: ExerciseProps &
    ExerciseVariantProps & { variant?: string; exercise?: string },
  uid?: string,
) {
  return new Exercise({
    name: fullVariantObj.exercise,
    variants: [
      new ExerciseVariant({
        uid: uid,
        name: fullVariantObj.variant,
        description: fullVariantObj.description,
        loadType: fullVariantObj.loadType,
        muscleGroups: fullVariantObj.muscleGroups,
        equipment: fullVariantObj.equipment,
        videoUrl: fullVariantObj.videoUrl,
      }),
    ],
  });
}
