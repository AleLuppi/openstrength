import { describe, expect, test } from "vitest";
import {
  dataToProgramExercise,
  type ProgramBuilderFilledData,
} from "@/helpers/programs/builder";
import { ProgramExercise, ProgramLine } from "../program";
import { Exercise, ExerciseVariant } from "@/helpers/exercises/exercise";

describe("Test @/helpers/programs/builder", () => {
  /**
   * dataToProgramExercise
   */
  describe("'dataToProgramExercise' function", () => {
    const programBuilderData: ProgramBuilderFilledData[] = [
      {
        data: [
          {
            uid: "123",
            load: "5",
            loadRef: undefined,
            reps: "",
            repsRef: undefined,
            sets: "",
            setsRef: undefined,
            rpe: "",
            rpeRef: undefined,
            requestText: false,
            requestVideo: false,
            note: undefined,
          },
        ],
        exercise: new Exercise({ name: "abc" }),
        variant: new ExerciseVariant({ name: "def" }),
        note: "no",
        week: "1",
        day: "1",
        order: "1",
      },
      {
        data: [],
        exercise: new Exercise({ name: "a" }),
        variant: new ExerciseVariant({ name: "b" }),
        note: undefined,
        week: "3",
        day: "2",
        order: "1",
      },
      {
        data: [
          {
            uid: "123",
            load: "5",
            loadRef: new ProgramLine({
              uid: "lineuid",
              loadBaseValue: "50",
            }),
            reps: "",
            repsRef: undefined,
            sets: "",
            setsRef: undefined,
            rpe: "",
            rpeRef: undefined,
            requestText: false,
            requestVideo: false,
            note: undefined,
          },
        ],
        exercise: new Exercise({ name: "abc" }),
        variant: new ExerciseVariant({ name: "def" }),
        note: "no",
        week: "1",
        day: "1",
        order: "1",
      },
    ];

    test("basic exercise with no references", () => {
      expect(dataToProgramExercise(programBuilderData[0])).toStrictEqual(
        new ProgramExercise({
          scheduleWeek: "1",
          scheduleDay: "1",
          scheduleOrder: 1,
          exercise: new Exercise({ name: "abc" }),
          exerciseVariant: new ExerciseVariant({ name: "def" }),
          exerciseNote: "no",
          lines: [
            new ProgramLine({
              uid: "123",
              loadBaseValue: "5",
              loadReference: undefined,
              repsBaseValue: "",
              repsReference: undefined,
              setsBaseValue: "",
              setsReference: undefined,
              rpeBaseValue: "",
              rpeReference: undefined,
              requestFeedbackText: false,
              requestFeedbackVideo: false,
              note: undefined,
              lineOrder: 0,
            }),
          ],
        }),
      );
    });

    test("basic exercise with no lines", () => {
      expect(dataToProgramExercise(programBuilderData[1])).toStrictEqual(
        new ProgramExercise({
          scheduleWeek: "3",
          scheduleDay: "2",
          scheduleOrder: 1,
          exerciseNote: undefined,
          exercise: new Exercise({ name: "a" }),
          exerciseVariant: new ExerciseVariant({ name: "b" }),
          lines: [],
        }),
      );
    });

    test("basic exercise with some references", () => {
      expect(dataToProgramExercise(programBuilderData[2])).toStrictEqual(
        new ProgramExercise({
          scheduleWeek: "1",
          scheduleDay: "1",
          scheduleOrder: 1,
          exerciseNote: "no",
          exercise: new Exercise({ name: "abc" }),
          exerciseVariant: new ExerciseVariant({ name: "def" }),
          lines: [
            new ProgramLine({
              uid: "123",
              loadBaseValue: "5",
              loadReference: new ProgramLine({
                uid: "lineuid",
                loadBaseValue: "50",
              }),
              repsBaseValue: "",
              repsReference: undefined,
              setsBaseValue: "",
              setsReference: undefined,
              rpeBaseValue: "",
              rpeReference: undefined,
              requestFeedbackText: false,
              requestFeedbackVideo: false,
              note: undefined,
              lineOrder: 0,
            }),
          ],
        }),
      );
    });
  });
});
