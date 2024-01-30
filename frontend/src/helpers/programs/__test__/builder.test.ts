import { describe, expect, test } from "vitest";
import {
  resetBuilderData,
  dataToProgramExercise,
  type ProgramBuilderFilledData,
  ProgramBuilderData,
} from "@/helpers/programs/builder";
import {
  Program,
  ProgramExercise,
  ProgramLine,
} from "@/helpers/programs/program";
import { Exercise, ExerciseVariant } from "@/helpers/exercises/exercise";

describe("Test @/helpers/programs/builder", () => {
  // Data to test functions
  const program: Program = new Program({
    uid: "rand-uid",
    name: "test program",
    programExercises: [
      new ProgramExercise({
        scheduleWeek: "1",
        scheduleDay: "1",
        scheduleOrder: 1,
        lines: [
          new ProgramLine({
            setsBaseValue: "3",
            repsBaseValue: "5/8",
            loadBaseValue: "50kg/70kg",
            rpeBaseValue: "5",
            requestFeedbackText: true,
            setsReference: new ProgramLine({
              setsBaseValue: "8",
              repsBaseValue: "5",
              loadBaseValue: "50 kg",
              rpeBaseValue: "8",
              requestFeedbackText: true,
            }),
            repsReference: new ProgramLine({
              setsBaseValue: "8",
              repsBaseValue: "5",
              loadBaseValue: "50 kg",
              rpeBaseValue: "8",
              requestFeedbackText: true,
            }),
            loadReference: new ProgramLine({
              setsBaseValue: "8",
              repsBaseValue: "5",

              rpeBaseValue: "8",
              requestFeedbackText: true,
            }),
          }),
          new ProgramLine({
            uid: "uidline2",
            loadBaseValue: "100kg",
          }),
        ],
      }),
    ],
  });
  const programBuilderFilledData: ProgramBuilderFilledData[] = [
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

  /**
   * resetBuilderData
   */
  describe("'resetBuilderData' function", () => {
    test("basic program", async () => {
      const builderData = await resetBuilderData(program);
      const expected: ProgramBuilderData = [
        {
          week: "1",
          day: "1",
          order: "1",
          exercise: undefined,
          variant: "",
          note: "",
          data: [
            {
              uid: expect.stringMatching(/^OS-/),
              load: "50kg/70kg",
              loadRef: new ProgramLine({
                setsBaseValue: "8",
                repsBaseValue: "5",

                rpeBaseValue: "8",
                requestFeedbackText: true,
              }),
              reps: "5/8",
              repsRef: new ProgramLine({
                setsBaseValue: "8",
                repsBaseValue: "5",
                loadBaseValue: "50 kg",
                rpeBaseValue: "8",
                requestFeedbackText: true,
              }),
              sets: "3",
              setsRef: new ProgramLine({
                setsBaseValue: "8",
                repsBaseValue: "5",
                loadBaseValue: "50 kg",
                rpeBaseValue: "8",
                requestFeedbackText: true,
              }),
              rpe: "5",
              rpeRef: undefined,
              note: undefined,
              requestText: true,
              requestVideo: false,
            },
            {
              uid: "uidline2",
              load: "100kg",
              loadRef: undefined,
              reps: undefined,
              repsRef: undefined,
              sets: undefined,
              setsRef: undefined,
              rpe: undefined,
              rpeRef: undefined,
              note: undefined,
              requestText: false,
              requestVideo: false,
            },
          ],
        },
      ];
      expect(builderData).toStrictEqual(expected);
    });
  });

  /**
   * dataToProgramExercise
   */
  describe("'dataToProgramExercise' function", () => {
    test("basic exercise with no references", () => {
      expect(dataToProgramExercise(programBuilderFilledData[0])).toStrictEqual(
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
      expect(dataToProgramExercise(programBuilderFilledData[1])).toStrictEqual(
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
      expect(dataToProgramExercise(programBuilderFilledData[2])).toStrictEqual(
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
