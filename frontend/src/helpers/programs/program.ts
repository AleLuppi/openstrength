import { DocumentReference } from "firebase/firestore";
import {
  doAddDoc,
  doUpdateDoc,
  doDeleteDoc,
} from "@/helpers/database/readwrite";
import {
  dbCollections,
  dbSubcollections,
} from "@/helpers/database/collections";
import { User, CoachUser, AthleteUser, UserRole } from "@/helpers/users/user";
import { Exercise, ExerciseVariant } from "@/helpers/exercises/exercise";
import { MaxLift } from "@/helpers/maxlifts/maxlift";
import {
  matchNumberFractionInteger,
  matchNumberFractionPercentageFloat,
  matchNumberIntegerInBrackets,
  matchNumberOptionallySignedPercentageFloat,
  matchNumberSignedFloatWithOptionalUnit,
  matchNumberSignedInteger,
  matchNumberUnsignedFloatWithOptionalUnit,
  matchNumberUnsignedInteger,
} from "@/helpers/regex";
import { convertProgramToDayBlocks } from "@/helpers/programs/converters";

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
  isTemplate?: boolean;
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
  repsReference?: ProgramLine | MaxLift;
  loadBaseValue?: string;
  loadReference?: ProgramLine | MaxLift;
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
 * Frozen program object.
 */
export type ProgramForzenView = {
  athlete: string;
  name: string;
  description: string | undefined;
  startedOn: Date | undefined;
  finishedOn: Date | undefined;
  isTemplate: boolean;
  weekdays: {
    weekName: string;
    dayName: string;
    exercises: {
      exerciseName: string;
      variantName: string;
      note?: string;
      schema: string[];
      schemaNote: string[];
      textFeedback: boolean[];
      videoFeedback: boolean[];
    }[];
  }[];
  frozenOn: Date;
};

/**
 * Compact program object.
 */
export type ProgramCompactView = {
  week: string;
  day: string;
  exercises: {
    exercise: string;
    schemas: string[];
  }[];
}[];

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

  // Program is a template if athlete is dummy
  public get isTemplate() {
    return !this.athlete || this.athlete.isDummy;
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
   * @param saveFrozenView if true, create a snapshot of the program and save it.
   * @param onSuccess function to execute when operation is successful.
   * @param onError function to execute when operation fails.
   */
  saveNew({
    program,
    saveFrozenView = false,
    onSuccess,
    onError,
  }: {
    program?: Program;
    saveFrozenView?: boolean;
    onSuccess?: Function;
    onError?: Function;
  } = {}) {
    const programToSave = program || this;
    programToSave.createdOn = new Date();
    programToSave.lastUpdated = new Date();
    addDocProgram(programToSave, { onSuccess: onSuccess, onError: onError });
    if (saveFrozenView) programToSave.freeze({ save: true });
  }

  /**
   * Update an existing program on database.
   *
   * @param program element that shall be updated.
   * @param saveFrozenView if true, create a snapshot of the program and save it.
   * @param onSuccess function to execute when operation is successful.
   * @param onError function to execute when operation fails.
   */
  saveUpdate({
    program,
    saveFrozenView = false,
    onSuccess,
    onError,
  }: {
    program?: Program;
    saveFrozenView?: boolean;
    onSuccess?: Function;
    onError?: Function;
  } = {}) {
    const programToUpdate = program || this;
    programToUpdate.lastUpdated = new Date();
    updateDocProgram(programToUpdate, {
      onSuccess: onSuccess,
      onError: onError,
    });
    if (saveFrozenView) programToUpdate.freeze({ save: true });
  }

  /**
   * Store a new program on database, or update if already exists.
   *
   * @param program element that shall be saved or updated.
   * @param saveFrozenView if true, create a snapshot of the program and save it.
   * @param onSuccess function to execute when operation is successful.
   * @param onError function to execute when operation fails.
   */
  save({
    program,
    saveFrozenView = false,
    onSuccess,
    onError,
  }: {
    program?: Program;
    saveFrozenView?: boolean;
    onSuccess?: Function;
    onError?: Function;
  } = {}) {
    const programToSave = program || this;
    if (programToSave.uid)
      programToSave.saveUpdate({
        saveFrozenView: saveFrozenView,
        onSuccess: onSuccess,
        onError: onError,
      });
    else
      programToSave.saveNew({
        saveFrozenView: saveFrozenView,
        onSuccess: onSuccess,
        onError: onError,
      });
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

  /**
   * Remove the program from database.
   *
   * @param program element that shall be removed.
   * @param onSuccess function to execute when operation is successful.
   * @param onError function to execute when operation fails.
   */
  remove({
    program,
    onSuccess,
    onError,
  }: {
    program?: Program;
    onSuccess?: Function;
    onError?: Function;
  } = {}) {
    // Ensure program is mapped onto a database document
    const programToDelete = program || this;
    if (!programToDelete.uid) {
      onError?.();
      return;
    }

    // Delete the program
    doDeleteDoc(dbCollections.programs, programToDelete.uid, {
      onSuccess: onSuccess,
      onError: onError,
    });
  }

  /**
   * Get all lines of the program.
   *
   * @returns list of all lines in the program.
   */
  getLines() {
    return this.programExercises?.reduce(
      (allLines: ProgramLine[], programExercise) =>
        programExercise.lines
          ? [...allLines, ...programExercise.lines]
          : allLines,
      [],
    );
  }

  /**
   * Get a frozen view of the program.
   *
   * @param program element that shall be frozen.
   * @param save if true, save frozen view to database.
   */
  freeze({
    program,
    save = false,
  }: {
    program?: Program;
    save?: boolean;
  } = {}): ProgramForzenView {
    const programToFreeze = program ?? this;
    const frozenView: ProgramForzenView = {
      athlete: programToFreeze.athlete?.referenceName ?? "",
      name: programToFreeze.name ?? "",
      description: programToFreeze.description,
      startedOn: programToFreeze.startedOn,
      finishedOn: programToFreeze.finishedOn,
      weekdays: convertProgramToDayBlocks(programToFreeze),
      isTemplate: programToFreeze.isTemplate ?? false,
      frozenOn: new Date(),
    };
    if (save && programToFreeze.uid)
      addDocProgramFrozen(frozenView, programToFreeze.uid);
    return frozenView;
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
  repsReference?: ProgramLine | MaxLift;
  loadBaseValue?: string;
  loadReference?: ProgramLine | MaxLift;
  rpeBaseValue?: string;
  rpeReference?: ProgramLine;

  // Additional line info
  note?: string;
  requestFeedbackText?: boolean;
  requestFeedbackVideo?: boolean;

  /***** Computed Properties *****/
  // Reference values when reference can be line or max lift
  public get refLoadValue() {
    if (this == this.loadReference) return undefined;
    return this.loadReference instanceof ProgramLine
      ? this.loadReference.loadValue ??
          this.loadReference.loadComputedValue ??
          this.loadReference.loadSupposedValue
      : Number(this.loadReference?.value);
  }
  public get refRepsValue() {
    if (this == this.repsReference) return undefined;
    return this.repsReference instanceof ProgramLine
      ? this.repsReference.repsValue ??
          this.repsReference.repsComputedValue ??
          this.repsReference.repsSupposedValue
      : Number(this.repsReference?.value);
  }

  // Values
  public get setsValue(): number | undefined {
    if (this.setsBaseValue && matchNumberUnsignedInteger(this.setsBaseValue))
      return parseInt(this.setsBaseValue);
    else return this.setsComputedValue;
  }
  public get repsValue(): number | undefined {
    if (this.repsBaseValue && matchNumberUnsignedInteger(this.repsBaseValue))
      return parseInt(this.repsBaseValue);
    else return this.repsComputedValue;
  }
  public get loadValue(): number | undefined {
    if (this.loadBaseValue) {
      if (matchNumberUnsignedFloatWithOptionalUnit(this.loadBaseValue))
        return parseFloat(this.loadBaseValue);
      else if (
        matchNumberOptionallySignedPercentageFloat(this.loadBaseValue) ||
        matchNumberSignedFloatWithOptionalUnit(this.loadBaseValue)
      )
        return this.loadComputedValue;
    }

    return undefined;
  }
  public get rpeValue(): number | undefined {
    if (this.rpeBaseValue && matchNumberUnsignedInteger(this.rpeBaseValue)) {
      const parsedRPE = parseInt(this.rpeBaseValue);
      return parsedRPE >= 0 && parsedRPE <= 10 ? parsedRPE : undefined;
    } else return this.rpeComputedValue;
  }

  // Computed values
  get setsComputedValue(): number | undefined {
    if (this.setsReference?.setsValue) {
      if (this.setsOperation && matchNumberSignedInteger(this.setsOperation)) {
        const operationValue = parseInt(this.setsOperation);
        return this.setsReference.setsValue + operationValue;
      }
    } else return undefined;
  }
  //TODO: add case from rpe table (load and rpe present)
  get repsComputedValue(): number | undefined {
    if (this.repsReference && this.refRepsValue) {
      if (this.repsOperation && matchNumberSignedInteger(this.repsOperation)) {
        const operationValue = parseInt(this.repsOperation);
        return this.refRepsValue + operationValue;
      }
    } else return undefined;
  }
  get loadComputedValue(): number | undefined {
    if (this.loadReference && this.refLoadValue) {
      if (
        this.loadOperation?.trim() &&
        this.loadBaseValue &&
        !matchNumberFractionPercentageFloat(this.loadBaseValue)
      ) {
        if (this.loadOperation.trim().startsWith("*"))
          return (
            this.refLoadValue * parseFloat(this.loadOperation.split("*")[1])
          );
        else if (matchNumberSignedFloatWithOptionalUnit(this.loadOperation))
          return this.refLoadValue + parseFloat(this.loadOperation);
      } else return undefined;
    }

    return undefined;
  }
  get rpeComputedValue(): number | undefined {
    if (this.rpeReference?.rpeValue) {
      if (this.rpeOperation && matchNumberSignedInteger(this.rpeOperation)) {
        const operationValue = parseInt(this.rpeOperation);
        const computedValue = this.rpeReference.rpeValue + operationValue;

        // Ensure the computed value is between 0 and 10
        return Math.max(0, Math.min(10, computedValue));
      }
    } else return undefined;
  }

  // Operations
  get setsOperation(): string | undefined {
    if (this.setsBaseValue) {
      const [, operationPart] =
        this.setsBaseValue.match(/(?:[^\d\s+-]+)?([+-]\d+)$/) || [];
      return operationPart ? operationPart : undefined;
    } else return undefined;
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
    if (this.loadBaseValue) {
      const trailingOperationPattern = /^.*([+-]\d*\.?\d*%|[+-]\d*\.?\d*kg)$/;

      const kgMatch = matchNumberSignedFloatWithOptionalUnit(
        this.loadBaseValue,
      );
      const percentageMatch = matchNumberOptionallySignedPercentageFloat(
        this.loadBaseValue,
      );
      const percentageRangeMatch = matchNumberFractionPercentageFloat(
        this.loadBaseValue,
      );
      const trailingOperationMatch = this.loadBaseValue.match(
        trailingOperationPattern,
      );

      if (kgMatch) {
        // Case: Explicit kg value like "+10kg" or "-20kg"
        return `${parseInt(kgMatch[1]) >= 0 ? "+" : ""}${kgMatch[1]}`;
      } else if (percentageRangeMatch) {
        // Case: Percentage range like "70%/73%"
        const average =
          (parseFloat(percentageRangeMatch[1]) +
            parseFloat(percentageRangeMatch[2])) /
          2 /
          100;
        return `*${average}`;
      } else if (percentageMatch) {
        // Case: Single percentage like "+20%" or "70%"
        const result: number = parseFloat(percentageMatch[1]) / 100;
        if (this.loadBaseValue[0] === "-" || this.loadBaseValue[0] === "+") {
          return `*${1.0 + result}`;
        } else {
          return `*${result}`;
        }
      } else if (trailingOperationMatch) {
        // Case: Trailing operation like "W2-30%" or "W1+24%"
        const operationValue = trailingOperationMatch[1];
        if (operationValue.endsWith("kg")) {
          const result: number = parseFloat(operationValue);
          return `${result}`;
        } else if (operationValue.endsWith("%")) {
          const result: number = parseFloat(operationValue) / 100;

          if (operationValue[0] === "-" || operationValue[0] === "+") {
            return `*${1.0 + result}`;
          }
        }
      } else {
        // Case: No specific pattern, return as is
        return undefined;
      }
    }

    return undefined;
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

  // Supposed values
  get setsSupposedValue(): number | undefined {
    if (this.setsBaseValue && matchNumberFractionInteger(this.setsBaseValue)) {
      const [secondNumber, firstNumber] = matchNumberFractionInteger(
        this.setsBaseValue,
      )!
        .slice(1, 3)
        .map(Number);
      return (secondNumber + firstNumber) / 2;
    } else if (
      this.setsBaseValue &&
      matchNumberIntegerInBrackets(this.setsBaseValue)
    ) {
      return parseInt(matchNumberIntegerInBrackets(this.setsBaseValue)?.at(1)!);
    } else if (this.setsOperation) {
      const referenceValue =
        this.setsReference?.setsComputedValue ??
        this.setsReference?.setsSupposedValue;
      if (referenceValue) {
        return referenceValue + parseInt(this.setsOperation);
      } else {
        const referenceSupposedValue = this.setsReference?.setsSupposedValue;
        return referenceSupposedValue
          ? referenceSupposedValue + parseInt(this.setsOperation)
          : undefined;
      }
    } else return undefined;
  }
  get repsSupposedValue(): number | undefined {
    if (this.repsBaseValue && matchNumberFractionInteger(this.repsBaseValue)) {
      const [secondNumber, firstNumber] = matchNumberFractionInteger(
        this.repsBaseValue,
      )!
        .slice(1, 3)
        .map(Number);
      return (secondNumber + firstNumber) / 2;
    } else if (
      this.repsBaseValue &&
      matchNumberIntegerInBrackets(this.repsBaseValue)
    ) {
      return parseInt(matchNumberIntegerInBrackets(this.repsBaseValue)?.at(1)!);
    } else if (this.repsOperation) {
      const referenceValue = this.refRepsValue;
      return referenceValue
        ? referenceValue + parseInt(this.repsOperation)
        : undefined;
    } else return undefined;
  }
  get loadSupposedValue(): number | undefined {
    const kgRangeRegex = /^(\d*)kg\/(\d*)kg$/;
    const kgValueRegex = /^\((\d*kg)\)$/;
    const kgSimpleRegex = /^([+-]?\d*\.?\d+)kg$/; // e.g. +20kg
    const percentRangeRegex = /^(\d*)%\/(\d*)%$/;
    const percentValueSupposedRegex = /^\((\d*%)\)$/;
    const percentageSimpleRegex = /^([+-]?\d*\.?\d+)%$/; // e.g. +20%
    const trailingOperationPattern = /^.*([+-]\d*\.?\d*%|[+-]\d*\.?\d*kg)$/; //e.g. W1-20% or W1+5kg

    const matchKgRange = this.loadBaseValue?.match(kgRangeRegex);
    const matchKgValue = this.loadBaseValue?.match(kgValueRegex);
    const matchKgSimple = this.loadBaseValue?.match(kgSimpleRegex);
    const matchPercentRange = this.loadBaseValue?.match(percentRangeRegex);
    const matchPercentValueSupposed = this.loadBaseValue?.match(
      percentValueSupposedRegex,
    );
    const matchPercentageSimple = this.loadBaseValue?.match(
      percentageSimpleRegex,
    );
    const matchTrailingOperation = this.loadBaseValue?.match(
      trailingOperationPattern,
    );

    if (matchKgRange) {
      const [, first, second] = matchKgRange;
      return (parseInt(second) + parseInt(first)) / 2;
    }

    if (matchKgValue) {
      const [, content] = matchKgValue;
      return parseInt(content);
    }

    if (matchKgSimple && this.refLoadValue !== undefined) {
      if (
        this.loadOperation !== undefined &&
        (this.loadOperation.startsWith("+") ||
          this.loadOperation.startsWith("-"))
      ) {
        return this.refLoadValue + parseFloat(this.loadOperation);
      } else {
        return undefined;
      }
    }

    if (matchPercentageSimple && this.refLoadValue !== undefined) {
      if (
        this.loadOperation !== undefined &&
        this.loadOperation.startsWith("*")
      ) {
        return this.refLoadValue * parseFloat(this.loadOperation.split("*")[1]);
      } else {
        return undefined;
      }
    }

    if (matchPercentRange && this.refLoadValue !== undefined) {
      const [, firstPercent, secondPercent] = matchPercentRange;
      return (
        ((parseFloat(secondPercent) / 100) * this.refLoadValue +
          (parseFloat(firstPercent) / 100) * this.refLoadValue) /
        2
      );
    }

    if (matchPercentValueSupposed && this.refLoadValue !== undefined) {
      const [, content] = matchPercentValueSupposed;
      return (parseFloat(content) / 100) * this.refLoadValue;
    }

    if (matchTrailingOperation && this.refLoadValue !== undefined) {
      const operationValue = matchTrailingOperation[1];
      if (operationValue.endsWith("kg")) {
        const result: number = parseFloat(operationValue);
        return this.refLoadValue + result;
      } else if (operationValue.endsWith("%")) {
        const result: number = parseFloat(operationValue) / 100;

        if (operationValue[0] === "-" || operationValue[0] === "+") {
          return (1 + result) * this.refLoadValue;
        }
      }
    }

    return undefined;
  }
  get rpeSupposedValue(): number | undefined {
    if (this.rpeBaseValue && matchNumberFractionInteger(this.rpeBaseValue)) {
      const [secondNumber, firstNumber] = matchNumberFractionInteger(
        this.rpeBaseValue,
      )!
        .slice(1, 3)
        .map(Number);
      return (secondNumber + firstNumber) / 2;
    } else if (
      this.rpeBaseValue &&
      matchNumberIntegerInBrackets(this.rpeBaseValue)
    ) {
      return parseInt(matchNumberIntegerInBrackets(this.rpeBaseValue)?.at(1)!);
    } else if (this.rpeOperation !== undefined) {
      const referenceValue =
        this.rpeReference?.rpeComputedValue ??
        this.rpeReference?.rpeSupposedValue;
      if (referenceValue !== undefined) {
        return referenceValue + parseInt(this.rpeOperation);
      } else {
        const referenceSupposedValue = this.rpeReference?.rpeSupposedValue;
        return referenceSupposedValue !== undefined
          ? referenceSupposedValue + parseInt(this.rpeOperation)
          : undefined;
      }
    } else {
      return undefined;
    }
  }

  // Requires
  get setsRequire(): boolean {
    if (
      this.setsBaseValue !== undefined &&
      /^(\\?|\(\d*\)|\d*\/\d*|\?)$/.test(this.setsBaseValue)
    ) {
      return true;
    } else {
      return false;
    }
  }
  get repsRequire(): boolean {
    if (
      this.repsBaseValue !== undefined &&
      /^(\\?|\(\d*\)|\d*\/\d*|\?)$/.test(this.repsBaseValue)
    ) {
      return true;
    } else {
      return false;
    }
  }
  get loadRequire(): boolean {
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
  get rpeRequire(): boolean {
    if (
      this.rpeBaseValue !== undefined &&
      /^(\\?|\(\d*\)|\d*\/\d*|\?)$/.test(this.rpeBaseValue)
    ) {
      return true;
    } else {
      return false;
    }
  }

  // Range min and max
  get setsRangeMin(): number | undefined {
    if (this.setsBaseValue && matchNumberFractionInteger(this.setsBaseValue)) {
      const minPart = matchNumberFractionInteger(this.setsBaseValue)?.at(1);
      return minPart ? parseInt(minPart) : undefined;
    } else return undefined;
  }
  get repsRangeMin(): number | undefined {
    if (this.repsBaseValue && matchNumberFractionInteger(this.repsBaseValue)) {
      const minPart = matchNumberFractionInteger(this.repsBaseValue)?.at(1);
      return minPart ? parseInt(minPart) : undefined;
    } else return undefined;
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
      if (this.loadReference !== undefined && this.refLoadValue !== undefined) {
        const [, minPercent] = this.loadBaseValue.match(/^(\d*)%\//) || [];
        if (minPercent !== undefined) {
          const parsedMinPercent = parseFloat(minPercent);
          return isNaN(parsedMinPercent)
            ? undefined
            : (parsedMinPercent / 100) * this.refLoadValue;
        }
      }
    }

    return undefined;
  }
  get rpeRangeMin(): number | undefined {
    if (this.rpeBaseValue && matchNumberFractionInteger(this.rpeBaseValue)) {
      const minPart = matchNumberFractionInteger(this.rpeBaseValue)?.at(1);
      return minPart ? parseInt(minPart) : undefined;
    } else return undefined;
  }
  get setsRangeMax(): number | undefined {
    if (this.setsBaseValue && matchNumberFractionInteger(this.setsBaseValue)) {
      const maxPart = matchNumberFractionInteger(this.setsBaseValue)?.at(2);
      return maxPart ? parseInt(maxPart) : undefined;
    } else return undefined;
  }
  get repsRangeMax(): number | undefined {
    if (this.repsBaseValue && matchNumberFractionInteger(this.repsBaseValue)) {
      const maxPart = matchNumberFractionInteger(this.repsBaseValue)?.at(2);
      return maxPart ? parseInt(maxPart) : undefined;
    } else return undefined;
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
      if (this.loadReference !== undefined && this.refLoadValue !== undefined) {
        const [, maxPercent] = this.loadBaseValue.match(/^\d*%\/(\d*)%$/) || [];
        if (maxPercent !== undefined) {
          const parsedMaxPercent = parseFloat(maxPercent);
          return isNaN(parsedMaxPercent)
            ? undefined
            : (parsedMaxPercent / 100) * this.refLoadValue;
        }
      }
    }

    return undefined;
  }
  get rpeRangeMax(): number | undefined {
    if (this.rpeBaseValue && matchNumberFractionInteger(this.rpeBaseValue)) {
      const maxPart = matchNumberFractionInteger(this.rpeBaseValue)?.at(2);
      return maxPart ? parseInt(maxPart) : undefined;
    } else return undefined;
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
  doAddDoc(dbCollections.programs, programObj, {
    onSuccess: (docRef: DocumentReference) => {
      program.uid = docRef.id;
      onSuccess?.(docRef);
    },
    onError: onError,
  });
}

/**
 * Store frozen program on database.
 *
 * @param programView element to store on database.
 * @param programId reference program id where frozen view should be saved.
 * @param onSuccess function to execute when operation is successful.
 * @param onError function to execute when operation fails.
 */
export function addDocProgramFrozen(
  programView: ProgramForzenView,
  programId: string,
  { onSuccess, onError }: { onSuccess?: Function; onError?: Function } = {},
) {
  doAddDoc(
    `${dbCollections.programs}/${programId}/${dbSubcollections.programSnapshots}`,
    programView,
    {
      onSuccess: onSuccess,
      onError: onError,
    },
  );
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
    doUpdateDoc(dbCollections.programs, docId, programObj, {
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
      (out: { [key: string]: any }[], exerciseToSpread) => {
        const { uid, program, exerciseVariant, lines, ...exerciseObj } =
          exerciseToSpread;
        const flatExercise = {
          ...exerciseObj,
          exercise: exerciseToSpread.exerciseVariant?.uid,
        };
        let linesToStore = lines;
        if (!linesToStore || !linesToStore.length)
          linesToStore = [new ProgramLine()];
        return [
          ...out,
          ...linesToStore.map((lineToSpread) => {
            const { programExercise, ...lineObj } = lineToSpread;
            const referenceAndType = {
              setsReference: lineToSpread.setsReference?.uid,
              repsReference: lineToSpread.repsReference?.uid,
              repsReferenceType: (lineToSpread.repsReference
                ? lineToSpread.repsReference instanceof MaxLift
                  ? "maxlift"
                  : "line"
                : undefined) as "maxlift" | "line" | undefined,
              loadReference: lineToSpread.loadReference?.uid,
              loadReferenceType: (lineToSpread["loadReference"]
                ? lineToSpread.loadReference instanceof MaxLift
                  ? "maxlift"
                  : "line"
                : undefined) as "maxlift" | "line" | undefined,
              rpeReference: lineToSpread.rpeReference?.uid,
            };
            return {
              ...flatExercise,
              ...lineObj,
              ...referenceAndType,
            };
          }),
        ];
      },
      [],
    ),
  };

  return flatProgram;
}

/**
 * Create a program instance from a flat program object.
 *
 * This function expands a flattened version of a program into an actual Program instance.
 * The Program instance has some dependencies to other classes defined elsewhere.
 * One can pass clues to this method to resolve these outside class instances, but it
 * might not be always possible. Therefore, one may need to take care of assignment
 * outside of this function.
 * The arguments that could not be properly assigned are:
 *  - Program.coach (try to infer from coachId)
 *  - Program.athlete (try to infer from athleteId)
 *  - Program.programExercises[number].exercise (try to infer from lines[number].exercise)
 *  - Program.programExercises[number].variant (try to infer from lines[number].exercise)
 *  - Program.programExercises[number].lines[number].loadReference/repsReference/setsReference/rpeReference
 *      (try to infer from lines[number].loadReference/repsReference/setsReference/rpeReference when MaxLift type)
 *
 * @param flatProgram program flattened to key-value pairs object, as per flatting method.
 * @param users optional list of users to try resolve user-related exernal references.
 * @param exercises optional list of exercises to try resolve exercise-related external references.
 * @param maxlifts optional list of max lifts to try resolve maxlift-related external references.
 * @param storeUnresolved if provided, store unassigned references inside the variable.
 * @returns program instance.
 */
export function unflattenProgram(
  flatProgram: ReturnType<typeof flattenProgram>,
  users?: (User | CoachUser | AthleteUser)[],
  exercises?: Exercise[],
  maxlifts?: MaxLift[],
  storeUnresolved?: {
    coach?: [Program, string];
    athlete?: [Program, string];
    exercises?: [ProgramExercise, string][];
    maxlifts?: [
      ProgramLine,
      {
        loadReference?: string;
        repsReference?: string;
      },
    ][];
  },
): Program {
  // Get all program exercises and lines
  const programExercises: ProgramExercise[] = [];
  flatProgram.lines?.forEach((fullLineInfo) => {
    const {
      exercise,
      scheduleWeek,
      scheduleDay,
      scheduleOrder,
      exerciseNote,
      setsReference,
      repsReference,
      repsReferenceType,
      loadReference,
      loadReferenceType,
      rpeReference,
      ...lineInfo
    } = fullLineInfo;
    const currentExercise = programExercises.find(
      (programExercise) =>
        programExercise.scheduleWeek == scheduleWeek &&
        programExercise.scheduleDay == scheduleDay &&
        programExercise.scheduleOrder == scheduleOrder,
    );
    const anyLines = Object.values(lineInfo).some((val) => val != undefined);
    if (currentExercise) {
      if (anyLines)
        (currentExercise.lines = currentExercise.lines || []).push(
          new ProgramLine({
            programExercise: currentExercise,
            ...lineInfo,
          }),
        );
    } else {
      const currentVariant = exercises
        ?.reduce(
          (out: ExerciseVariant[], oneExercise) =>
            out.concat(oneExercise.variants ?? []),
          [],
        )
        .find((variant) => variant.uid == exercise);
      programExercises.push(
        new ProgramExercise({
          scheduleWeek: scheduleWeek,
          scheduleDay: scheduleDay,
          scheduleOrder: scheduleOrder,
          exerciseNote: exerciseNote,
          exercise: currentVariant?.exercise,
          exerciseVariant: currentVariant,
          lines: anyLines ? [new ProgramLine({ ...lineInfo })] : [],
        }),
      );
      if (storeUnresolved && !currentVariant && exercise)
        (storeUnresolved.exercises = storeUnresolved.exercises || []).push([
          programExercises.at(-1)!,
          exercise,
        ]);
    }
  });

  // Correct references in program lines
  const programLines = programExercises.reduce(
    (out: { [key: string]: ProgramLine }, programExercise) => {
      const currLines =
        programExercise.lines?.reduce(
          (out: { [key: string]: ProgramLine }, line) => {
            if (line.uid) out[line.uid] = line;
            return out;
          },
          {},
        ) ?? {};
      return { ...out, ...currLines };
    },
    {},
  );
  flatProgram.lines?.forEach((fullLineInfo) => {
    const currLine = programLines[fullLineInfo.uid];
    if (!currLine) return;
    currLine.loadReference =
      fullLineInfo.loadReferenceType === "maxlift"
        ? maxlifts?.find((maxlift) => maxlift.uid == fullLineInfo.loadReference)
        : fullLineInfo.loadReferenceType === "line"
        ? programLines[fullLineInfo.loadReference]
        : undefined;
    currLine.repsReference =
      fullLineInfo.repsReferenceType === "maxlift"
        ? maxlifts?.find((maxlift) => maxlift.uid == fullLineInfo.repsReference)
        : fullLineInfo.repsReferenceType === "line"
        ? programLines[fullLineInfo.repsReference]
        : undefined;
    currLine.setsReference = programLines[fullLineInfo.setsReference];
    currLine.rpeReference = programLines[fullLineInfo.rpeReference];
    if (
      storeUnresolved &&
      !currLine.loadReference &&
      fullLineInfo.loadReferenceType === "maxlift" &&
      fullLineInfo.loadReference
    )
      (storeUnresolved.maxlifts = storeUnresolved.maxlifts || []).push([
        currLine,
        { loadReference: fullLineInfo.loadReference },
      ]);
    if (
      storeUnresolved &&
      !currLine.repsReference &&
      fullLineInfo.repsReferenceType === "maxlift" &&
      fullLineInfo.repsReference
    )
      (storeUnresolved.maxlifts = storeUnresolved.maxlifts || []).push([
        currLine,
        { repsReference: fullLineInfo.repsReference },
      ]);
  });

  // Build up complete program
  const outProgram = new Program({
    uid: flatProgram.uid,
    name: flatProgram.name,
    description: flatProgram.description,
    labels: flatProgram.labels,
    coach: users?.find(
      (user) =>
        user.role === UserRole.coach && user.uid === flatProgram.coachId,
    ) as CoachUser,
    athlete: users?.find(
      (user) =>
        user.role === UserRole.athlete && user.uid === flatProgram.athleteId,
    ) as AthleteUser,
    startedOn: flatProgram.startedOn,
    finishedOn: flatProgram.finishedOn,
    createdOn: flatProgram.createdOn,
    lastUpdated: flatProgram.lastUpdated,
    programExercises: programExercises,
  });
  if (storeUnresolved && !outProgram.coach && flatProgram.coachId)
    storeUnresolved.coach = [outProgram, flatProgram.coachId];
  if (storeUnresolved && !outProgram.athlete && flatProgram.athleteId)
    storeUnresolved.athlete = [outProgram, flatProgram.athleteId];
  return outProgram;
}
