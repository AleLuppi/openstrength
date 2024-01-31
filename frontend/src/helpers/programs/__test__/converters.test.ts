import { describe, expect, test } from "vitest";
import { ProgramExercise, ProgramLine } from "@/helpers/programs/program";
import { MaxLift, MaxLiftType } from "@/helpers/maxlifts/maxlift";
import { convertLineToSchema } from "../converters";


describe("Test @/helpers/programs/converters", ()=>{
    describe("Test convertLineToSchema", ()=>{

        describe("NO REFERENCE", ()=>{
            // Reference data
            const lineTest = new ProgramLine({          
                loadBaseValue: "70kg",
                setsBaseValue: "5",
                repsBaseValue: "5",
                rpeBaseValue: "6.5",           
            });

            test("Test 1: 70kg 5x5s @6.5", () => {
                const lineUnderTest = lineTest.duplicate();
                const expected = "70kg 5x5s @6.5"
                expect(convertLineToSchema(lineUnderTest)).toMatch(expected);
            });
           
            test("Test 2: 70kg 5 @6.5", () => {
                const lineUnderTest = lineTest.duplicate();
                lineUnderTest.setsBaseValue ="";
                const expected = "70kg 5 @6.5"
                expect(convertLineToSchema(lineUnderTest)).toMatch(expected);
            });

            test("Test 3: 5 @6.5", () => {
                const lineUnderTest = lineTest.duplicate();
                lineUnderTest.loadBaseValue ="";
                lineUnderTest.setsBaseValue ="";
                const expected = "5 @6.5"
                expect(convertLineToSchema(lineUnderTest)).toMatch(expected);
            });
        })


        describe("REFERENCE ON LOAD", ()=>{
            // Reference data
            const lineTest = new ProgramLine({          
                loadBaseValue: "70%",
                setsBaseValue: "5",
                repsBaseValue: "5",
                rpeBaseValue: "6.5",
                loadReference: new MaxLift({
                type: MaxLiftType._5RM,
                value: "100",
                }),
            });

            test("Test 1: 70% (5RM) 5x5s @6.5", () => {
                const lineUnderTest = lineTest.duplicate();
                const expected = "70% (5RM) 5x5s @6.5"
                expect(convertLineToSchema(lineUnderTest)).toMatch(expected);
            });

            test("Test 2: 70% (5RM) 5x1s @6.5", () => {
                const lineUnderTest = lineTest.duplicate();
                lineUnderTest.setsBaseValue = "1";
                const expected = "70% (5RM) 5x1s @6.5"
                expect(convertLineToSchema(lineUnderTest)).toMatch(expected);
            });

            test("Test 3: 70% (5RM) 5 @6.5", () => {
                const lineUnderTest = lineTest.duplicate();
                lineUnderTest.setsBaseValue = "";
                const expected = "70% (5RM) 5 @6.5"
                expect(convertLineToSchema(lineUnderTest)).toMatch(expected);
            });

            test("Test 4: 70% 5x5 @6.5", () => {
                const lineUnderTest = lineTest.duplicate();
                lineUnderTest.loadReference= new MaxLift({
                    type: MaxLiftType._1RM,
                    value: "100",
                    });
                const expected = "70% 5x5s @6.5"
                expect(convertLineToSchema(lineUnderTest)).toMatch(expected);
            });

            test("Test 5: 70% 5x5", () => {
                const lineUnderTest = lineTest.duplicate();
                lineUnderTest.loadReference= new MaxLift({
                    type: MaxLiftType._1RM,
                    value: "100",
                    });
                lineUnderTest.rpeBaseValue="";
                const expected = "70% 5x5s"
                expect(convertLineToSchema(lineUnderTest)).toMatch(expected);
            });

            test("Test 6: W1D1L1 -5% 5x5s", () => {
                const lineUnderTest = lineTest.duplicate();
                lineUnderTest.loadBaseValue = "-5%"
                lineUnderTest.loadReference= new ProgramLine({
                    lineOrder: 0,
                    programExercise: new ProgramExercise({
                        scheduleDay: 1,
                        scheduleWeek:1,
                    })
                    });

                lineUnderTest.rpeBaseValue="";
                const expected = "W1D1L1 -5% 5x5s"
                expect(convertLineToSchema(lineUnderTest)).toMatch(expected);
            });

            test("Test 7: W1D1L1 -5kg 5x5s", () => {
                const lineUnderTest = lineTest.duplicate();
                lineUnderTest.loadBaseValue = "-5kg"
                lineUnderTest.loadReference= new ProgramLine({
                    lineOrder: 0,
                    programExercise: new ProgramExercise({
                        scheduleDay: 1,
                        scheduleWeek:1,
                    })
                    });

                lineUnderTest.rpeBaseValue="";
                const expected = "W1D1L1 -5kg 5x5s"
                expect(convertLineToSchema(lineUnderTest)).toMatch(expected);
            });

            })

        
        describe("REFERENCE ON REPS", ()=>{
             // Reference data
             const lineTest = new ProgramLine({          
                loadBaseValue: "70%",
                setsBaseValue: "5",
                repsBaseValue: "-3",            
                repsReference: new MaxLift({
                type: MaxLiftType._maxrep,
                value: "100",
                }),
            });

            test("Test 1: 70% Max Reps-3x5s", () => {
                const lineUnderTest = lineTest.duplicate();
                const expected = "70% Max Reps-3x5s"
                expect(convertLineToSchema(lineUnderTest)).toMatch(expected);
            });

            test("Test 2: 70% Max Time-3x5s", () => {
                const lineUnderTest = lineTest.duplicate();
                lineUnderTest.repsReference= new MaxLift({
                    type: MaxLiftType._maxtime,
                    value: "100",});

                const expected = "70% Max Time-3x5s"
                expect(convertLineToSchema(lineUnderTest)).toMatch(expected);
            });

            test("Test 3: 70% W1D1L1-3x5s", () => {
                const lineUnderTest = lineTest.duplicate();
                lineUnderTest.repsReference= new ProgramLine({
                    lineOrder: 0,
                    programExercise: new ProgramExercise({
                        scheduleDay: 1,
                        scheduleWeek:1,
                    })
                    });
                const expected = "70% W1D1L1-3x5s"
                expect(convertLineToSchema(lineUnderTest)).toMatch(expected);
            });
        })


        describe("REFERENCE ON SETS", ()=>{
             // Reference data
             const lineTest = new ProgramLine({          
                loadBaseValue: "70%",
                setsBaseValue: "-2",
                repsBaseValue: "12",            
            });

            test("Test 1: 70% 12xW1D1L1-2s", () => {
                const lineUnderTest = lineTest.duplicate();
                lineUnderTest.setsReference= new ProgramLine({
                    lineOrder: 0,
                    programExercise: new ProgramExercise({
                        scheduleDay: 1,
                        scheduleWeek:1,
                    })
                    });
                const expected = "70% 12xW1D1L1-2s"
                expect(convertLineToSchema(lineUnderTest)).toMatch(expected);
            });
        })


        describe("REFERENCE ON RPE", ()=>{
             // Reference data
             const lineTest = new ProgramLine({          
                loadBaseValue: "70%",
                setsBaseValue: "3",
                repsBaseValue: "12",  
                rpeBaseValue: "-0.5",
                        
            });

            test("Test 1: 70% 12x3s @W1D1L1-0.5 ", () => {
                const lineUnderTest = lineTest.duplicate();
                lineUnderTest.rpeReference= new ProgramLine({
                    lineOrder: 0,
                    programExercise: new ProgramExercise({
                        scheduleDay: 1,
                        scheduleWeek:1,
                    })
                    });
                const expected = "70% 12x3s @W1D1L1-0.5"
                expect(convertLineToSchema(lineUnderTest)).toMatch(expected);
            });
        })
      
      
        describe("MIXED REFERENCES", ()=>{
             // Reference data
             const lineTest = new ProgramLine({          
                loadBaseValue: "70%",
                setsBaseValue: "-2",
                repsBaseValue: "-1",  
                rpeBaseValue: "-0.5",
                        
            });

            test("Test 1: 70% (5RM) W1D1L1-1xW2D2L2-2s @W3D3L3-0.5", () => {
                const lineUnderTest = lineTest.duplicate();
                lineUnderTest.loadReference= new MaxLift({
                    type: MaxLiftType._5RM
                    })
                    
                lineUnderTest.repsReference= new ProgramLine({
                    lineOrder: 0,
                    programExercise: new ProgramExercise({
                        scheduleDay: 1,
                        scheduleWeek:1,
                    })               
                });

                lineUnderTest.setsReference= new ProgramLine({
                    lineOrder: 1,
                    programExercise: new ProgramExercise({
                        scheduleDay: 2,
                        scheduleWeek:2,
                    })               
                });

                lineUnderTest.rpeReference= new ProgramLine({
                    lineOrder: 2,
                    programExercise: new ProgramExercise({
                        scheduleDay: 3,
                        scheduleWeek:3,
                    })               
                });
                
                const expected = "70% (5RM) W1D1L1-1xW2D2L2-2s @W3D3L3-0.5"
                expect(convertLineToSchema(lineUnderTest)).toMatch(expected);
                    });     
            });
        }) 
       })
