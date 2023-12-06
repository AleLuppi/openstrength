import { DocumentReference } from "firebase/firestore";
import { doAddDoc, doUpdateDoc } from "@/helpers/database/readwrite";
import { programsCollection } from "@/helpers/database/collections";
import { Exercise, ExerciseVariant } from "@/helpers/exercises/exercise";
import { AthleteUser, CoachUser } from "@/helpers/users/user";
import { MaxLift, MaxLiftType } from "../maxlifts/maxlift";

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
  programExercises?: ProgramExercise[];

  // Program status
  coach?: CoachUser;
  athlete?: AthleteUser;
  startedOn?: Date;
  finishedOn?: Date;

  // App specific info
  createdOn?: Date;
  lastUpdated?: Date;

  // Computed info
  coachId?: string;
  athleteId?: string;
  isAssigned?: boolean;
  isOngoing?: boolean;
  isCompleted?: boolean;
};

/**
 * Program line properties.
 */
export type ProgramExerciseProps = {
  // Basic program exercise info
  uid?: string;

  // Father program instance
  program?: Program;

  // Schedule info
  scheduleWeek?: string | number;
  scheduleDay?: string | number;
  scheduleOrder?: string | number;

  // Exercise-related info
  exercise?: Exercise;
  exerciseVariant?: ExerciseVariant;
  exerciseNote?: string;

  // Lines composing exercise
  lines?: ProgramLine[];
};

/**
 * Program line properties.
 */
export type ProgramLineProps = {
  // Basic program line info
  uid?: string;

  // Father program exercise instance
  programExercise?: ProgramExercise;

  // Schedule info
  lineOrder?: number;

  // Line-specific info
  setsBaseValue?: string;
  setsReference?: ProgramLine;
  repsBaseValue?: string;
  repsReference?: ProgramLine;
  loadBaseValue?: string;
  loadReference?: ProgramLine;
  maxliftReference?: MaxLift;
  rpeBaseValue?: string;
  rpeReference?: ProgramLine;

  // Additional line info
  note?: string;
  requestFeedbackText?: boolean;
  requestFeedbackVideo?: boolean;

  // Computed line-specific info
  setsRequire?: boolean;
  setsOperation?: string;
  setsRangeMin?: number;
  setsRangeMax?: number;
  setsValue?: number;
  setsSupposedValue?: number;
  setsComputedValue?: number;

  repsRequire?: boolean;
  repsOperation?: string;
  repsRangeMin?: number;
  repsRangeMax?: number;
  repsValue?: number;
  repsSupposedValue?: number;
  repsComputedValue?: number;

  loadRequire?: boolean;
  loadOperation?: string;
  loadRangeMin?: number;
  loadRangeMax?: number;
  loadValue?: number;
  loadSupposedValue?: number;
  loadComputedValue?: number;

  rpeRequire?: boolean;
  rpeOperation?: string;
  rpeRangeMin?: number;
  rpeRangeMax?: number;
  rpeValue?: number;
  rpeSupposedValue?: number;
  rpeComputedValue?: number;
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
  programExercises?: ProgramExercise[];

  // Program status
  coach?: CoachUser;
  athlete?: AthleteUser;
  startedOn?: Date;
  finishedOn?: Date;

  // App specific info
  createdOn?: Date;
  lastUpdated?: Date;

  // Get reference users ID
  public get coachId() {
    return this.coach?.uid;
  }
  public get athleteId() {
    return this.athlete?.uid;
  }

  // Check if program is assigned to an athlete
  public get isAssigned() {
    // Program is assigned if athlete is known
    return Boolean(this.athleteId);
  }

  // Check if program is currently in progress by athlete
  public get isOngoing() {
    // Program is ongoing if it has been started but not finished yet
    return Boolean(this.startedOn) && !this.finishedOn;
  }
  public get isCompleted() {
    // Program is ongoing if it has been started but not finished yet
    return Boolean(this.finishedOn);
  }

  constructor({
    uid,
    name,
    description,
    labels,
    programExercises,
    coach,
    athlete,
    startedOn,
    finishedOn,
    createdOn,
    lastUpdated,
  }: ProgramProps = {}) {
    this.uid = uid;
    this.name = name;
    this.description = description;
    this.labels = labels;
    programExercises?.forEach((exercise) => {
      if (!exercise.program) exercise.program = this;
    });
    this.programExercises = programExercises;
    this.coach = coach;
    this.athlete = athlete;
    this.startedOn = startedOn;
    this.finishedOn = finishedOn;
    this.createdOn = createdOn;
    this.lastUpdated = lastUpdated;
  }

  /**
   * Store a new program on database.
   *
   * @param program element that shall be stored.
   * @param onSuccess function to execute when operation is successful.
   * @param onError function to execute when operation fails.
   */
  saveNew({
    program,
    onSuccess,
    onError,
  }: {
    program?: Program;
    onSuccess?: Function;
    onError?: Function;
  } = {}) {
    const programToSave = program || this;
    programToSave.createdOn = new Date();
    programToSave.lastUpdated = new Date();
    addDocProgram(programToSave, { onSuccess: onSuccess, onError: onError });
  }

  /**
   * Update an existing program on database.
   *
   * @param program element that shall be updated.
   * @param onSuccess function to execute when operation is successful.
   * @param onError function to execute when operation fails.
   */
  saveUpdate({
    program,
    onSuccess,
    onError,
  }: {
    program?: Program;
    onSuccess?: Function;
    onError?: Function;
  } = {}) {
    const programToUpdate = program || this;
    programToUpdate.lastUpdated = new Date();
    updateDocProgram(programToUpdate, {
      onSuccess: onSuccess,
      onError: onError,
    });
  }

  /**
   * Store a new program on database, or update if already exists.
   *
   * @param program element that shall be saved or updated.
   * @param onSuccess function to execute when operation is successful.
   * @param onError function to execute when operation fails.
   */
  save({
    program,
    onSuccess,
    onError,
  }: {
    program?: Program;
    onSuccess?: Function;
    onError?: Function;
  } = {}) {
    const programToSave = program || this;
    if (programToSave.uid)
      programToSave.saveUpdate({ onSuccess: onSuccess, onError: onError });
    else programToSave.saveNew({ onSuccess: onSuccess, onError: onError });
  }

  /**
   * Duplicate program.
   *
   * @param shallow avoid copying identifying fields such as uid and parent instance.
   * @returns a new program with duplicate fields.
   */
  duplicate(shallow: boolean = false) {
    return new Program({
      ...this,
      programExercises: this.programExercises?.map((programExercise) =>
        programExercise.duplicate(),
      ),
      ...(shallow && {
        uid: undefined,
        name: undefined,
      }),
    });
  }
}

/**
 * Program exercise entity.
 *
 * @public
 */
export class ProgramExercise {
  // Basic program exercise info
  uid?: string;

  // Father program instance
  program?: Program;

  // Schedule info
  scheduleWeek?: string | number;
  scheduleDay?: string | number;
  scheduleOrder?: string | number;

  // Exercise-related info
  exercise?: Exercise;
  exerciseVariant?: ExerciseVariant;
  exerciseNote?: string;

  // Lines composing exercise
  lines?: ProgramLine[];

  constructor({
    uid,
    program,
    scheduleWeek,
    scheduleDay,
    scheduleOrder,
    exercise,
    exerciseVariant,
    exerciseNote,
    lines,
  }: ProgramExerciseProps = {}) {
    this.uid = uid;
    this.program = program;
    this.scheduleWeek = scheduleWeek;
    this.scheduleDay = scheduleDay;
    this.scheduleOrder = scheduleOrder;
    this.exercise = exercise;
    this.exerciseVariant = exerciseVariant;
    this.exerciseNote = exerciseNote;
    lines?.forEach((line) => {
      if (!line.programExercise) line.programExercise = this;
    });
    this.lines = lines;
  }

  /**
   * Duplicate program exercise.
   *
   * @param shallow avoid copying identifying fields such as uid and parent instance.
   * @returns a new program exercise with duplicate fields.
   */
  duplicate(shallow: boolean = false) {
    return new ProgramExercise({
      ...this,
      lines: this.lines?.map((line) => line.duplicate(shallow)),
      ...(shallow && {
        uid: undefined,
        program: undefined,
      }),
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

  // Father program exercise instance
  programExercise?: ProgramExercise;

  // Schedule info
  lineOrder?: number;

  // Line-specific info
  setsBaseValue?: string;
  setsReference?: ProgramLine;
  repsBaseValue?: string;
  repsReference?: ProgramLine;
  loadBaseValue?: string;
  loadReference?: ProgramLine;
  maxliftReference?: MaxLift; //TODO: remove
  rpeBaseValue?: string;
  rpeReference?: ProgramLine;

  // Additional line info
  note?: string;
  requestFeedbackText?: boolean;
  requestFeedbackVideo?: boolean;

  // TODO computed properties
  // TODO continue from here!!!!!!!!!!!!!!!!!!!
  public get setsValue(): number | undefined {
    if (this.setsBaseValue !== undefined && /^\d*$/.test(this.setsBaseValue)) {
      return parseInt(this.setsBaseValue);
    } else {
      return this.setsComputedValue;
    }
  }
  public get repsValue(): number | undefined {
    if (this.repsBaseValue !== undefined && /^\d*$/.test(this.repsBaseValue)) {
      return parseInt(this.repsBaseValue);
    } else {
      return this.repsComputedValue;
    }
  }
  public get loadValue(): number | undefined {
    if (this.loadBaseValue !== undefined && /\d+kg$/.test(this.loadBaseValue)) {
      return parseFloat(this.loadBaseValue);
    }

    if (
      this.loadBaseValue !== undefined &&
      /^\d+%$/.test(this.loadBaseValue) &&
      this.loadReference?.loadValue !== undefined
    ) {
      const percentage = parseFloat(this.loadBaseValue) / 100;
      return percentage * this.loadReference.loadValue;
    }

    return undefined;
  }

  public get rpeValue(): number | undefined {
    if (this.rpeBaseValue !== undefined && /^\d*$/.test(this.rpeBaseValue)) {
      const parsedRPE = parseInt(this.rpeBaseValue);
      return parsedRPE >= 0 && parsedRPE <= 10 ? parsedRPE : undefined;
    } else {
      return this.rpeComputedValue;
    }
  }

  get setsComputedValue(): number | undefined {
    if (
      this.setsReference !== null &&
      this.setsReference?.setsValue !== undefined
    ) {
      if (
        this.setsOperation !== undefined &&
        /^[+-]\d*$/.test(this.setsOperation)
      ) {
        const operationValue = parseInt(this.setsOperation);
        return this.setsReference.setsValue + operationValue;
      }
    } else {
      return undefined;
    }
  }
  //TODO: add case from rpe table (load and rpe present)
  get repsComputedValue(): number | undefined {
    if (
      this.repsReference !== null &&
      this.repsReference?.repsValue !== undefined
    ) {
      if (
        this.repsOperation !== undefined &&
        /^[+-]\d*$/.test(this.repsOperation)
      ) {
        const operationValue = parseInt(this.repsOperation);
        return this.repsReference.repsValue + operationValue;
      }
    } else {
      return undefined;
    }
  }
  get loadComputedValue(): number | undefined {
    if (
      this.loadReference !== undefined &&
      this.maxliftReference?.type !== MaxLiftType._1RM &&
      this.loadReference.loadComputedValue !== undefined
    ) {
      const loadOperationRegex = /^[+-]\d*kg|[+-]\d*%$/;

      if (
        this.loadOperation !== undefined &&
        loadOperationRegex.test(this.loadOperation)
      ) {
        const operationResult =
          this.loadReference.loadComputedValue + parseInt(this.loadOperation) ||
          (parseFloat(this.loadOperation) / 100) *
            parseFloat(this.maxliftReference?.value ?? "0");

        return operationResult;
      }
    }

    return undefined;
  }
  get rpeComputedValue(): number | undefined {
    if (
      this.rpeReference !== null &&
      this.rpeReference?.rpeValue !== undefined
    ) {
      if (
        this.rpeOperation !== undefined &&
        /^[+-]\d*$/.test(this.rpeOperation)
      ) {
        const operationValue = parseInt(this.rpeOperation);
        const computedValue = this.rpeReference.rpeValue + operationValue;

        // Ensure the computed value is between 0 and 10
        return Math.max(0, Math.min(10, computedValue));
      }
    } else {
      return this.rpeSupposedValue;
    }
  }

  get setsOperation(): string | undefined {
    if (this.setsBaseValue !== undefined) {
      const [, operationPart] =
        this.setsBaseValue.match(/(?:[^\d\s+-]+)?([+-]\d+)$/) || [];
      return operationPart ? operationPart : undefined;
    } else {
      return undefined;
    }
  }
  get repsOperation(): string | undefined {
    if (this.repsBaseValue !== undefined) {
      const [, operationPart] = this.repsBaseValue.match(/([+-]\d+).*?$/) || [];
      return operationPart ? operationPart : undefined;
    } else {
      return undefined;
    }
  }

  get loadOperation(): string | undefined {
    if (
      this.loadBaseValue !== undefined &&
      /^.[+-]\d*kg|[+-]\d*%|\d*%$/.test(this.loadBaseValue)
    ) {
      const [, operationPart] =
        this.loadBaseValue.match(/[+-]\d*kg|[+-]\d*%|\d*%$/) || [];
      return operationPart || undefined;
    } else {
      return undefined;
    }
  }
  get rpeOperation(): string | undefined {
    if (this.rpeBaseValue !== undefined) {
      const [, operationPart] =
        this.rpeBaseValue.match(/(?:[^\d\s+-]+)?([+-]\d+)$/) || [];
      return operationPart ? operationPart : undefined;
    } else {
      return undefined;
    }
  }

  get setsSupposedValue(): number | undefined {
    if (
      this.setsBaseValue !== undefined &&
      /^\d*\/\d*$/.test(this.setsBaseValue)
    ) {
      const [secondNumber, firstNumber] = this.setsBaseValue
        .split("/")
        .map(Number);
      return (secondNumber + firstNumber) / 2;
    } else if (
      this.setsBaseValue !== undefined &&
      /^\(\d*\)$/.test(this.setsBaseValue)
    ) {
      return parseInt(this.setsBaseValue.slice(1, -1));
    } else if (this.setsOperation !== undefined) {
      const referenceValue =
        this.setsReference?.setsComputedValue ??
        this.setsReference?.setsSupposedValue;
      if (referenceValue !== undefined) {
        return referenceValue + parseInt(this.setsOperation);
      } else {
        const referenceSupposedValue = this.setsReference?.setsSupposedValue;
        return referenceSupposedValue !== undefined
          ? referenceSupposedValue + parseInt(this.setsOperation)
          : undefined;
      }
    } else {
      return undefined;
    }
  }
  get repsSupposedValue(): number | undefined {
    if (
      this.repsBaseValue !== undefined &&
      /^\d*\/\d*$/.test(this.repsBaseValue)
    ) {
      const [secondNumber, firstNumber] = this.repsBaseValue
        .split("/")
        .map(Number);
      return (secondNumber + firstNumber) / 2;
    } else if (
      this.repsBaseValue !== undefined &&
      /^\(\d*\)$/.test(this.repsBaseValue)
    ) {
      return parseInt(this.repsBaseValue.slice(1, -1));
    } else if (this.repsOperation !== undefined) {
      const referenceValue =
        this.repsReference?.repsComputedValue ??
        this.repsReference?.repsSupposedValue;
      if (referenceValue !== undefined) {
        return referenceValue + parseInt(this.repsOperation);
      } else {
        const referenceSupposedValue = this.repsReference?.repsSupposedValue;
        return referenceSupposedValue !== undefined
          ? referenceSupposedValue + parseInt(this.repsOperation)
          : undefined;
      }
    } else {
      return undefined;
    }
  }

  get loadSupposedValue(): number | undefined {
    const kgRangeRegex = /^\d*kg\/\d*kg$/;
    const kgValueRegex = /^\(\d*kg\)$/;
    const percentRangeRegex = /^\d*%\/\d*%$/;
    const percentValueRegex = /^\(\d*%\)$/;

    if (
      this.loadBaseValue !== undefined &&
      kgRangeRegex.test(this.loadBaseValue)
    ) {
      const [, first, second] =
        this.loadBaseValue.match(/^(\d*)kg\/(\d*)kg$/) || [];
      return (parseInt(second) + parseInt(first)) / 2;
    }

    if (
      this.loadBaseValue !== undefined &&
      kgValueRegex.test(this.loadBaseValue)
    ) {
      const [, content] = this.loadBaseValue.match(/^\((\d*kg)\)$/) || [];
      return parseInt(content);
    }

    if (
      this.loadBaseValue !== undefined &&
      percentRangeRegex.test(this.loadBaseValue)
    ) {
      if (
        this.maxliftReference !== undefined &&
        this.maxliftReference.type === MaxLiftType._1RM &&
        this.maxliftReference.exercise === this.programExercise?.exercise &&
        this.maxliftReference.value !== undefined
      ) {
        const [, firstPercent, secondPercent] =
          this.loadBaseValue.match(/^(\d*)%\/(\d*)%$/) || [];
        return (
          (parseFloat(secondPercent) * parseFloat(this.maxliftReference.value) +
            parseFloat(firstPercent) *
              parseFloat(this.maxliftReference.value)) /
          2
        );
      }
    }

    if (
      this.loadBaseValue !== undefined &&
      percentValueRegex.test(this.loadBaseValue)
    ) {
      if (
        this.maxliftReference !== undefined &&
        this.maxliftReference.type === MaxLiftType._1RM &&
        this.maxliftReference.exercise === this.programExercise?.exercise &&
        this.maxliftReference.value !== undefined
      ) {
        const [, content] = this.loadBaseValue.match(/^\((\d*%)\)$/) || [];
        return (
          (parseFloat(content) / 100) * parseFloat(this.maxliftReference.value)
        );
      }
    }

    return undefined;
  }
  get rpeSupposedValue(): number | undefined {
    if (
      this.rpeBaseValue !== undefined &&
      /^\d*\/\d*$/.test(this.rpeBaseValue)
    ) {
      const [secondNumber, firstNumber] = this.rpeBaseValue
        .split("/")
        .map(Number);
      return Math.round((secondNumber + firstNumber) / 2);
    } else if (
      this.rpeBaseValue !== undefined &&
      /^\(\d*\)$/.test(this.rpeBaseValue)
    ) {
      return parseInt(this.rpeBaseValue.slice(1, -1));
    } else {
      return undefined;
    }
  }

  get requireSets(): boolean {
    if (
      this.setsBaseValue !== undefined &&
      /^(\\?|\(\d*\)|\d*\/\d*|\?)$/.test(this.setsBaseValue)
    ) {
      return true;
    } else {
      return false;
    }
  }
  get requireReps(): boolean {
    if (
      this.repsBaseValue !== undefined &&
      /^(\\?|\(\d*\)|\d*\/\d*|\?)$/.test(this.repsBaseValue)
    ) {
      return true;
    } else {
      return false;
    }
  }

  get requireLoad(): boolean {
    if (
      this.loadBaseValue !== undefined &&
      /^(?:\?|(?:\d+kg\/\d+kg)|(?:\d+%\/\d+%)|(?:\(\d+kg\))|(?:\(\d+%\)))$/.test(
        this.loadBaseValue,
      )
    ) {
      return true;
    } else {
      return false;
    }
  }

  get requireRpe(): boolean {
    if (
      this.rpeBaseValue !== undefined &&
      /^\\?|\\(\d*\\)|\d*\/\d*$/.test(this.rpeBaseValue)
    ) {
      return true;
    } else {
      return false;
    }
  }

  get setsRangeMin(): number | undefined {
    if (
      this.setsBaseValue !== undefined &&
      /^\d*\/\d*$/.test(this.setsBaseValue)
    ) {
      const [minPart] = this.setsBaseValue.match(/^\d*/) || [];
      return minPart ? parseInt(minPart) : undefined;
    } else {
      return undefined;
    }
  }
  get repsRangeMin(): number | undefined {
    if (
      this.repsBaseValue !== undefined &&
      /^\d*\/\d*$/.test(this.repsBaseValue)
    ) {
      const [minPart] = this.repsBaseValue.match(/^\d*/) || [];
      return minPart ? parseInt(minPart) : undefined;
    } else {
      return undefined;
    }
  }
  //TODO substitute check on maxreference from line data to a global method (or within the class?)
  get loadRangeMin(): number | undefined {
    if (
      this.loadBaseValue !== undefined &&
      /^\d*kg\/\d*kg$/.test(this.loadBaseValue)
    ) {
      const [, min] = this.loadBaseValue.match(/^(\d*)kg\/\d*kg$/) || [];
      return min !== undefined ? Number(min) : undefined;
    } else if (
      this.loadBaseValue !== undefined &&
      /^\d*%\/\d*%$/.test(this.loadBaseValue)
    ) {
      if (
        this.maxliftReference !== undefined &&
        this.maxliftReference.type === MaxLiftType._1RM &&
        this.maxliftReference.exercise === this.programExercise?.exercise &&
        this.maxliftReference.value !== undefined
      ) {
        const [, minPercent] = this.loadBaseValue.match(/^(\d*)%\//) || [];
        if (minPercent !== undefined) {
          const parsedMinPercent = parseFloat(minPercent);
          return isNaN(parsedMinPercent)
            ? undefined
            : (parsedMinPercent / 100) *
                parseFloat(this.maxliftReference.value);
        }
      }
    }

    return undefined;
  }
  get rpeRangeMin(): number | undefined {
    if (
      this.rpeBaseValue !== undefined &&
      /^\d*\/\d*$/.test(this.rpeBaseValue)
    ) {
      const [minPart] = this.rpeBaseValue.match(/^\d*/) || [];
      return minPart ? parseInt(minPart) : undefined;
    } else {
      return undefined;
    }
  }

  get setsRangeMax(): number | undefined {
    if (
      this.setsBaseValue !== undefined &&
      /^\d*\/\d*$/.test(this.setsBaseValue)
    ) {
      const [, maxPart] = this.setsBaseValue.match(/\/(\d*)$/) || [];
      return maxPart ? parseInt(maxPart) : undefined;
    } else {
      return undefined;
    }
  }
  get repsRangeMax(): number | undefined {
    if (
      this.repsBaseValue !== undefined &&
      /^\d*\/\d*$/.test(this.repsBaseValue)
    ) {
      const [, maxPart] = this.repsBaseValue.match(/\/(\d*)$/) || [];
      return maxPart ? parseInt(maxPart) : undefined;
    } else {
      return undefined;
    }
  }
  get loadRangeMax(): number | undefined {
    if (
      this.loadBaseValue !== undefined &&
      /^\d*kg\/\d*kg$/.test(this.loadBaseValue)
    ) {
      const [, max] = this.loadBaseValue.match(/^\d*kg\/(\d*)kg$/) || [];
      return max !== undefined ? Number(max) : undefined;
    } else if (
      this.loadBaseValue !== undefined &&
      /^\d*%\/\d*%$/.test(this.loadBaseValue)
    ) {
      if (
        this.maxliftReference !== undefined &&
        this.maxliftReference.type === MaxLiftType._1RM &&
        this.maxliftReference.exercise === this.programExercise?.exercise &&
        this.maxliftReference.value !== undefined
      ) {
        const [, maxPercent] = this.loadBaseValue.match(/^\d*%\/(\d*)%$/) || [];
        if (maxPercent !== undefined) {
          const parsedMaxPercent = parseFloat(maxPercent);
          return isNaN(parsedMaxPercent)
            ? undefined
            : (parsedMaxPercent / 100) *
                parseFloat(this.maxliftReference.value);
        }
      }
    }

    return undefined;
  }
  get rpeRangeMax(): number | undefined {
    if (
      this.rpeBaseValue !== undefined &&
      /^\d*\/\d*$/.test(this.rpeBaseValue)
    ) {
      const [, maxPart] = this.rpeBaseValue.match(/\/(\d*)$/) || [];
      return maxPart ? parseInt(maxPart) : undefined;
    } else {
      return undefined;
    }
  }

  constructor({
    uid,
    programExercise,
    lineOrder,
    setsBaseValue,
    setsReference,
    repsBaseValue,
    repsReference,
    loadBaseValue,
    loadReference,
    maxliftReference,
    rpeBaseValue,
    rpeReference,
    note,
    requestFeedbackText,
    requestFeedbackVideo,
  }: ProgramLineProps = {}) {
    this.uid = uid;
    this.programExercise = programExercise;
    this.lineOrder = lineOrder;
    this.setsBaseValue = setsBaseValue;
    this.setsReference = setsReference;
    this.repsBaseValue = repsBaseValue;
    this.repsReference = repsReference;
    this.loadBaseValue = loadBaseValue;
    this.loadReference = loadReference;
    this.maxliftReference = maxliftReference;
    this.rpeBaseValue = rpeBaseValue;
    this.rpeReference = rpeReference;
    this.note = note;
    this.requestFeedbackText = requestFeedbackText;
    this.requestFeedbackVideo = requestFeedbackVideo;
  }

  /**
   * Duplicate program line.
   *
   * @param shallow avoid copying identifying fields such as uid and parent instance.
   * @returns a new program line with duplicate fields.
   */
  duplicate(shallow: boolean = false) {
    return new ProgramLine({
      ...this,
      ...(shallow && {
        uid: undefined,
        programExercise: undefined,
      }),
    });
  }
}

/**
 * Store program on database.
 *
 * @param program element to store on database.
 * @param onSuccess function to execute when operation is successful.
 * @param onError function to execute when operation fails.
 */
export function addDocProgram(
  program: Program,
  { onSuccess, onError }: { onSuccess?: Function; onError?: Function } = {},
) {
  const { uid, ...programObj } = flattenProgram(program);
  doAddDoc(programsCollection, programObj, {
    onSuccess: (docRef: DocumentReference) => {
      program.uid = docRef.id;
      onSuccess?.(docRef);
    },
    onError: onError,
  });
}

/**
 * Update program on database.
 *
 * @param program element to update on database.
 * @param onSuccess function to execute when operation is successful.
 * @param onError function to execute when operation fails.
 */
export function updateDocProgram(
  program: Program,
  { onSuccess, onError }: { onSuccess?: Function; onError?: Function } = {},
) {
  const { uid, ...programObj } = flattenProgram(program);
  const docId = program.uid;
  if (docId)
    doUpdateDoc(programsCollection, docId, programObj, {
      onSuccess: (docRef: DocumentReference) => {
        onSuccess?.(docRef);
      },
      onError: onError,
    });
  else onError?.();
}

/**
 * Flatten a program to avoid nested class instances
 *
 * @param program instance to flatten.
 * @returns flattened program.
 */
function flattenProgram(program: Program) {
  const { programExercises, coach, athlete, ...programObj } = program;
  const flatProgram = {
    ...programObj,
    coachId: program.coach?.uid,
    athleteId: program.athlete?.uid,
    lines: program.programExercises?.reduce(
      (out: object[], exerciseToSpread) => {
        const { program, exerciseVariant, lines, ...exerciseObj } =
          exerciseToSpread;
        const flatExercise = {
          ...exerciseObj,
          exercise: exerciseToSpread.exerciseVariant?.uid,
        };
        return [
          ...out,
          ...(exerciseToSpread.lines?.map((lineToSpread) => {
            const { uid, programExercise, ...lineObj } = lineToSpread;
            return { ...flatExercise, ...lineObj };
          }) || []),
        ];
      },
      [],
    ),
  };

  return flatProgram;
}
