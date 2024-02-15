import { describe, expect, test } from "vitest";
import {
    Program,
    ProgramCompactView,
    ProgramExercise,
    ProgramLine,
  } from "@/helpers/programs/program";
import { convertProgramToCompactView } from "../converters";
import { Exercise, ExerciseVariant } from "@/helpers/exercises/exercise";

describe("Test @/helpers/programs/converters", () => {
    // Data to test functions
    const program: Program = new Program({
      uid: "rand-uid",
      name: "test program",
      isProgramTemplate: false,
      programExercises: [
        new ProgramExercise({
          scheduleWeek: "1",
          scheduleDay: "1",
          scheduleOrder: 1,
          exercise: new Exercise({
            name: "sqaut"
          }),
          exerciseVariant: new ExerciseVariant({
            name: "fermo in buca"
          }),
          lines: [
            new ProgramLine({
              setsBaseValue: "3",
              repsBaseValue: "5/8",
              loadBaseValue: "50kg/70kg",
              rpeBaseValue: "5",
              requestFeedbackText: true,
            
            }),
            new ProgramLine({
              uid: "uidline2",
              loadBaseValue: "100kg",
            }),
          ],
        }),
        new ProgramExercise({
          scheduleWeek: "2",
          scheduleDay: "1",
          scheduleOrder: 1,
          exercise: new Exercise({
            name: "panca"
          }),
          exerciseVariant: new ExerciseVariant({
            name: "deloading"
          }),
          lines: [
            new ProgramLine({
              setsBaseValue: "3",
              repsBaseValue: "5",
              loadBaseValue: "50kg",
              rpeBaseValue: "5",
              requestFeedbackText: true,
            }),
          ],
        }),
        new ProgramExercise({
          scheduleWeek: "3",
          scheduleDay: "1",
          scheduleOrder: 1,
          exercise: new Exercise({
            name: "panca"
          }),
          exerciseVariant: new ExerciseVariant({
            name: "deloading"
          }),
          lines: [
            new ProgramLine({
              setsBaseValue: "4",
              repsBaseValue: "6",
              loadBaseValue: "60kg",
              rpeBaseValue: "5",
              requestFeedbackText: true,
            }),
          ],
        }),
      ],
    });
  
    test("convertProgramToCompactView", () => {
        
        const expectedResult =
            {
                days: [{
                    dayName: "1",
                    exercises: [
                        {
                            exerciseFullName: "sqaut - fermo in buca",
                            weekSchemas: [
                                {
                                    weekName: "1",
                                    schemas: ["50kg/70kg 5/8x3s @5", "100kg 1x1s"]
                                }
                            ]
                        },
                        {
                            exerciseFullName: "panca - deloading",
                            weekSchemas: [
                                {
                                    weekName: "2",
                                    schemas: ["50kg 5x3s @5"]
                                },
                                {
                                    weekName: "3",
                                    schemas: ["60kg 6x4s @5"]
                                }
                          
                            ]
                        }
                    ]
                }]
            }
        ;
        
    
        const compactView: ProgramCompactView = convertProgramToCompactView(program);
        expect(compactView).toStrictEqual(expectedResult);
    });
    
    
});

