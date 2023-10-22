import { DocumentReference } from "firebase/firestore";
import { doAddDoc, doUpdateDoc } from "@/helpers/database/readwrite";
import { programsCollection } from "@/helpers/database/collections";
import { ExerciseVariant } from "../exercises/exercise";

/**
 * Training program properties.
 */
export type ProgramProps = {
  // Basic program info
  uid?: string;
  name?: string;
  description?: string;
  labels?: string[];

  // Program composition
  lines?: ProgramLine[];

  // Program status
  coachId?: string;
  athleteId?: string;
  startedOn?: Date;
  finishedOn?: Date;

  // App specific info
  createdOn?: Date;
  lastUpdated?: Date;

  // Computed info
  isOngoing?: boolean;
};

/**
 * Program line properties.
 */
export type ProgramLineProps = {
  // Basic program line info
  uid?: string;

  // Father program instance
  program?: Program;

  // Schedule info
  week?: string | number;
  day?: string | number;

  // Exercise-related info
  exercise?: ExerciseVariant;
};

/**
 * Training program entity.
 *
 * @public
 */
export class Program {
  // Basic program info
  uid?: string;
  name?: string;
  description?: string;
  labels?: string[];

  // Program composition
  lines?: ProgramLine[];

  // Program status
  coachId?: string;
  athleteId?: string;
  startedOn?: Date;
  finishedOn?: Date;

  // App specific info
  createdOn?: Date;
  lastUpdated?: Date;

  // Check if program is currently in progress by athlete
  public get isOngoing() {
    // Program is ongoing if it has been started but not finished yet
    return Boolean(this.startedOn) && !this.finishedOn;
  }

  constructor({
    uid,
    name,
    description,
    labels,
    lines,
    coachId,
    athleteId,
    startedOn,
    finishedOn,
    createdOn,
    lastUpdated,
  }: ProgramProps = {}) {
    this.uid = uid;
    this.name = name;
    this.description = description;
    this.labels = labels;
    this.lines = lines;
    this.coachId = coachId;
    this.athleteId = athleteId;
    this.startedOn = startedOn;
    this.finishedOn = finishedOn;
    this.createdOn = createdOn;
    this.lastUpdated = lastUpdated;
  }

  saveNew({
    // TODO
    program,
    onSuccess,
    onError,
  }: {
    program?: Program;
    onSuccess?: Function;
    onError?: Function;
  } = {}) {
    addDocProgram(program || this, { onSuccess: onSuccess, onError: onError });
  }

  saveUpdate({
    // TODO
    program,
    onSuccess,
    onError,
  }: {
    program?: Program;
    onSuccess?: Function;
    onError?: Function;
  } = {}) {
    updateDocProgram(program || this, {
      onSuccess: onSuccess,
      onError: onError,
    });
  }
}

/**
 * Program line entity.
 *
 * @public
 */
export class ProgramLine {
  // Basic program line info
  uid?: string;

  // TODO

  constructor({ uid }: ProgramLineProps = {}) {
    // TODO
    this.uid = uid;
  }
}

/**
 * Store program on database.
 *
 * @param program program info to store on database.
 * @param onSuccess function to execute when operation is successful.
 * @param onError function to execute when operation fails.
 */
export function addDocProgram(
  program: Program,
  { onSuccess, onError }: { onSuccess?: Function; onError?: Function } = {},
) {
  const { uid: _, ...programObj } = program;
  doAddDoc(programsCollection, programObj, {
    addUserId: true,
    onSuccess: (docRef: DocumentReference) => {
      onSuccess?.();
      program.uid = docRef.id;
    },
    onError: onError,
  });
}

/**
 * Update program on database.
 *
 * @param program program to store on database.
 * @param onSuccess function to execute when operation is successful.
 * @param onError function to execute when operation fails.
 */
export function updateDocProgram(
  user: Program,
  { onSuccess, onError }: { onSuccess?: Function; onError?: Function } = {},
) {
  const { uid: docId, ...programObj } = user;
  programObj.lastUpdated = new Date();
  if (docId)
    doUpdateDoc(programsCollection, docId, programObj, {
      addUserId: true,
      onSuccess: (docRef: DocumentReference) => {
        onSuccess?.(docRef);
      },
      onError: onError,
    });
  else onError?.();
}
