import { describe } from "vitest";
import {
  Program,
  ProgramExercise,
  ProgramLine,
} from "@/helpers/programs/program";

describe("Test helpers/programs/builder", () => {
  // Data to test functions
  // TODO
  // eslint-disable-next-line
  const program: Program = new Program({
    uid: "rand-uid",
    name: "test program",
    isTemplate: false,
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
});
