import { DocumentReference } from "firebase/firestore";
import { doAddDoc, doUpdateDoc } from "@/helpers/database/readwrite";
import { Exercise, ExerciseVariant } from "../exercises/exercise";
import { dbCollections } from "@/helpers/database/collections";
import { AthleteUser } from "../users/user";

/**
 * Define available max lift types.
 */
export enum MaxLiftType {
  _1RM = "1RM",
  _3RM = "3RM",
  _5RM = "5RM",
  _6RM = "6RM",
  _8RM = "8RM",
  _10RM = "10RM",
  _maxrep = "Max Reps",
  _maxtime = "Max Time",
}

/**
 * Define how max lift types are split across line values.
 */
export const MaxLiftTypesPerValue: {
  load: MaxLiftType[];
  reps: MaxLiftType[];
  sets: MaxLiftType[];
  rpe: MaxLiftType[];
} = {
  load: [
    MaxLiftType._1RM,
    MaxLiftType._3RM,
    MaxLiftType._5RM,
    MaxLiftType._6RM,
    MaxLiftType._8RM,
    MaxLiftType._10RM,
  ],
  reps: [MaxLiftType._maxrep, MaxLiftType._maxtime],
  sets: [],
  rpe: [],
};

/**
 * Max lift properties.
 */
export type MaxLiftProps = {
  // Basic max lift info
  uid?: string;
  type?: MaxLiftType;
  exercise?: Exercise;
  value?: string; // TODO: add measurement unit
  athlete?: AthleteUser;

  // Max lift status
  coachId?: string;
  athleteId?: string;
  performedOn?: Date;

  // App specific info
  createdOn?: Date;
  lastUpdated?: Date;

  // Computed info
  isCurrent?: boolean;
};

/**
 * Max lift entity.
 *
 * @public
 */
export class MaxLift {
  // Basic max lift info
  uid?: string;
  type?: MaxLiftType;
  exercise?: Exercise;
  variant?: ExerciseVariant;
  athlete?: AthleteUser; //TODO: check
  value?: string; // TODO: add measurement unit

  // Max lift status
  coachId?: string;
  athleteId?: string;
  performedOn?: Date;

  // App specific info
  createdOn?: Date;
  lastUpdated?: Date;

  // Computed info (TODO)
  isCurrent?: boolean;

  constructor({
    uid,
    type,
    exercise,
    value,
    athlete,
    coachId,
    athleteId,
    performedOn,
    createdOn,
    lastUpdated,
    isCurrent,
  }: MaxLiftProps = {}) {
    this.uid = uid;
    this.type = type;
    this.exercise = exercise;
    this.value = value;
    this.athlete = athlete;
    this.coachId = coachId;
    this.athleteId = athleteId;
    this.performedOn = performedOn;
    this.createdOn = createdOn;
    this.lastUpdated = lastUpdated;
    this.isCurrent = isCurrent;
  }

  /**
   * Store a new maxlift on database.
   *
   * @param maxlift element that shall be stored.
   * @param onSuccess function to execute when operation is successful.
   * @param onError function to execute when operation fails.
   */
  saveNew({
    maxlift,
    onSuccess,
    onError,
  }: {
    maxlift?: MaxLift;
    onSuccess?: Function;
    onError?: Function;
  } = {}) {
    const maxliftToUpdate = maxlift || this;
    maxliftToUpdate.createdOn = new Date();
    maxliftToUpdate.lastUpdated = new Date();
    addDocMaxLift(maxliftToUpdate, { onSuccess: onSuccess, onError: onError });
  }

  /**
   * Update an existing maxlift on database.
   *
   * @param maxlift element that shall be updated.
   * @param onSuccess function to execute when operation is successful.
   * @param onError function to execute when operation fails.
   */
  saveUpdate({
    maxlift,
    onSuccess,
    onError,
  }: {
    maxlift?: MaxLift;
    onSuccess?: Function;
    onError?: Function;
  } = {}) {
    const maxliftToUpdate = maxlift || this;
    maxliftToUpdate.lastUpdated = new Date();
    updateDocMaxLift(maxliftToUpdate, {
      onSuccess: onSuccess,
      onError: onError,
    });
  }

  /**
   * Store a new maxlift on database, or update if already exists.
   *
   * @param maxlift element that shall be saved or updated.
   * @param onSuccess function to execute when operation is successful.
   * @param onError function to execute when operation fails.
   */
  save({
    maxlift,
    onSuccess,
    onError,
  }: {
    maxlift?: MaxLift;
    onSuccess?: Function;
    onError?: Function;
  } = {}) {
    const maxliftToSave = maxlift || this;
    if (maxliftToSave.uid)
      maxliftToSave.saveUpdate({ onSuccess: onSuccess, onError: onError });
    else maxliftToSave.saveNew({ onSuccess: onSuccess, onError: onError });
  }
}

/**
 * Store Max lift on database.
 *
 * @param maxlift maxlift info to store on database.
 * @param onSuccess function to execute when operation is successful.
 * @param onError function to execute when operation fails.
 */
export function addDocMaxLift(
  maxlift: MaxLift,
  { onSuccess, onError }: { onSuccess?: Function; onError?: Function } = {}
) {
  const { uid: _, ...maxliftObj } = maxlift;
  const flatMaxliftObj = {
    ...maxliftObj,
    exercise: maxlift.exercise?.name,
  };
  doAddDoc(dbCollections.maxlifts, flatMaxliftObj, {
    onSuccess: (docRef: DocumentReference) => {
      onSuccess?.();
      maxlift.uid = docRef.id;
    },
    onError: onError,
  });
}

/**
 * Update max lift on database.
 *
 * @param maxlift maxlift to store on database.
 * @param onSuccess function to execute when operation is successful.
 * @param onError function to execute when operation fails.
 */
export function updateDocMaxLift(
  maxlift: MaxLift,
  { onSuccess, onError }: { onSuccess?: Function; onError?: Function } = {}
) {
  const { uid: docId, ...maxliftObj } = maxlift;
  const flatMaxliftObj = {
    ...maxliftObj,
    exercise: maxlift.exercise?.name,
  };
  if (docId)
    doUpdateDoc(dbCollections.maxlifts, docId, flatMaxliftObj, {
      onSuccess: (docRef: DocumentReference) => {
        onSuccess?.(docRef);
      },
      onError: onError,
    });
  else onError?.();
}
