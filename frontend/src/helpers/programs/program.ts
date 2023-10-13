import { DocumentReference } from "firebase/firestore";
import { doAddDoc, doUpdateDoc } from "@/helpers/database/readwrite";
import { programsCollection } from "../database/collections";

/**
 * Training program properties.
 */
export type ProgramProps = {
  // Default training program info
  uid?: string;
  name?: string;
  description?: string;
  label?: string;

  // Training program status
  current?: boolean;
  assigned?: boolean;
  startedOn?: Date;
  finishedOn?: Date;

  // App specific info
  createdOn?: Date;
  lastUpdated?: Date;

  //TO DO: add lines
};

/**
 * Training program entity.
 *
 * @public
 */
export class Program {
  // Default training program info
  uid?: string;
  name?: string;
  description?: string;
  label?: string;

  // Training program status
  current?: boolean;
  assigned?: boolean;
  startedOn?: Date;
  finishedOn?: Date;

  // App specific info
  createdOn?: Date;
  lastUpdated?: Date;

  constructor({
    uid,
    name,
    description,
    label,
    current,
    assigned,
    startedOn,
    finishedOn,
    createdOn,
    lastUpdated,
  }: ProgramProps = {}) {
    this.uid = uid;
    this.name = name;
    this.description = description;
    this.label = label;
    this.current = current;
    this.assigned = assigned;
    this.startedOn = startedOn;
    this.finishedOn = finishedOn;
    this.createdOn = createdOn;
    this.lastUpdated = lastUpdated;
  }

  saveNew({
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
