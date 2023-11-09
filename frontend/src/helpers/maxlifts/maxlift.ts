import { DocumentReference } from "firebase/firestore";
import { doAddDoc, doUpdateDoc } from "@/helpers/database/readwrite";
import { Exercise, ExerciseVariant } from "../exercises/exercise";
import { maxliftsCollection } from "@/helpers/database/collections";

/**
 * Define available max lift types
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
 * Max lift properties (see LiftsMax box in Miro)
 */
export type MaxLiftProps = {
  // Basic max lift info
  uid?: string;
  type?: MaxLiftType;
  exercise?: Exercise;
  value?: string; // TODO: add measurement unit

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
    this.coachId = coachId;
    this.athleteId = athleteId;
    this.performedOn = performedOn;
    this.createdOn = createdOn;
    this.lastUpdated = lastUpdated;
    this.isCurrent = isCurrent;
  }

  saveNew({
    // TODO
    maxlift,
    onSuccess,
    onError,
  }: {
    maxlift?: MaxLift;
    onSuccess?: Function;
    onError?: Function;
  } = {}) {
    addDocMaxLift(maxlift || this, { onSuccess: onSuccess, onError: onError });
  }

  saveUpdate({
    // TODO
    maxlift,
    onSuccess,
    onError,
  }: {
    maxlift?: MaxLift;
    onSuccess?: Function;
    onError?: Function;
  } = {}) {
    updateDocMaxLift(maxlift || this, {
      onSuccess: onSuccess,
      onError: onError,
    });
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
  { onSuccess, onError }: { onSuccess?: Function; onError?: Function } = {},
) {
  const { uid: _, ...maxliftObj } = maxlift;
  doAddDoc(maxliftsCollection, maxliftObj, {
    addUserId: true,
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
  user: MaxLift,
  { onSuccess, onError }: { onSuccess?: Function; onError?: Function } = {},
) {
  const { uid: docId, ...maxliftObj } = user;
  maxliftObj.lastUpdated = new Date();
  if (docId)
    doUpdateDoc(maxliftsCollection, docId, maxliftObj, {
      addUserId: true,
      onSuccess: (docRef: DocumentReference) => {
        onSuccess?.(docRef);
      },
      onError: onError,
    });
  else onError?.();
}
