import { describe, expect, test } from 'vitest';
import { ProgramLine } from '../program';

describe('Test helpers/programs/program', () => {
  describe("'ProgramLine' computed values", () => {
    describe('load-related tests', () => {
      // Reference data
      const lineTest = new ProgramLine({
        setsBaseValue: '3',
        repsBaseValue: '5/8',
        loadBaseValue: '50kg/70kg',
        rpeBaseValue: '5',
        requestFeedbackText: true,
        setsReference: new ProgramLine({
          setsBaseValue: '8',
          repsBaseValue: '5',
          loadBaseValue: '50 kg',
          rpeBaseValue: '8',
          requestFeedbackText: true,
        }),
        repsReference: new ProgramLine({
          setsBaseValue: '8',
          repsBaseValue: '5',
          loadBaseValue: '50 kg',
          rpeBaseValue: '8',
          requestFeedbackText: true,
        }),
        loadReference: new ProgramLine({
          setsBaseValue: '8',
          repsBaseValue: '5',
          rpeBaseValue: '8',
          requestFeedbackText: true,
        }),
      });
      const loadComputedValues = (line: ProgramLine) =>
        Object.fromEntries(
          [
            'loadRequire',
            'loadValue',
            'loadComputedValue',
            'loadSupposedValue',
            'loadRangeMin',
            'loadRangeMax',
            'loadOperation',
          ].map((key) => [key, line[key as keyof ProgramLine]])
        );

      test("load '100kg'", () => {
        const lineUnderTest = lineTest.duplicate();
        lineUnderTest.loadBaseValue = '100kg';
        const expected = {
          loadRequire: false,
          loadValue: 100,
          loadComputedValue: undefined,
          loadSupposedValue: undefined,
          loadRangeMin: undefined,
          loadRangeMax: undefined,
          loadOperation: undefined,
        };
        expect(loadComputedValues(lineUnderTest)).toMatchObject(expected);
      });

      test("load '70%' with reference '100kg'", () => {
        const lineUnderTest = lineTest.duplicate();
        lineUnderTest.loadBaseValue = '70%';
        lineUnderTest.loadReference = new ProgramLine({
          loadBaseValue: '100kg',
        });
        const expected = {
          loadRequire: false,
          loadValue: 70,
          loadComputedValue: 70,
          loadSupposedValue: undefined,
          loadRangeMin: undefined,
          loadRangeMax: undefined,
          loadOperation: '*0.7',
        };
        expect(loadComputedValues(lineUnderTest)).toMatchObject(expected);
      });

      test("load '?'", () => {
        const lineUnderTest = lineTest.duplicate();
        lineUnderTest.loadBaseValue = '?';
        const expected = {
          loadRequire: true,
          loadValue: undefined,
          loadComputedValue: undefined,
          loadSupposedValue: undefined,
          loadRangeMin: undefined,
          loadRangeMax: undefined,
          loadOperation: undefined,
        };
        expect(loadComputedValues(lineUnderTest)).toMatchObject(expected);
      });

      test("load '100kg/103kg'", () => {
        const lineUnderTest = lineTest.duplicate();
        lineUnderTest.loadBaseValue = '100kg/103kg';
        const expected = {
          loadRequire: true,
          loadValue: undefined,
          loadComputedValue: undefined,
          loadSupposedValue: 101.5,
          loadRangeMin: 100,
          loadRangeMax: 103,
          loadOperation: undefined,
        };
        expect(loadComputedValues(lineUnderTest)).toMatchObject(expected);
      });

      test("load '30%/50%' with reference '120kg'", () => {
        const lineUnderTest = lineTest.duplicate();
        lineUnderTest.loadBaseValue = '30%/50%';
        lineUnderTest.loadReference = new ProgramLine({
          loadBaseValue: '120kg',
        });
        const expected = {
          loadRequire: true,
          loadValue: undefined,
          loadComputedValue: undefined,
          loadSupposedValue: 48,
          loadRangeMin: 36,
          loadRangeMax: 60,
          loadOperation: '*0.4',
        };
        expect(loadComputedValues(lineUnderTest)).toMatchObject(expected);
      });

      test("load '(100kg)'", () => {
        const lineUnderTest = lineTest.duplicate();
        lineUnderTest.loadBaseValue = '(100kg)';
        const expected = {
          loadRequire: true,
          loadValue: undefined,
          loadComputedValue: undefined,
          loadSupposedValue: 100,
          loadRangeMin: undefined,
          loadRangeMax: undefined,
          loadOperation: undefined,
        };
        expect(loadComputedValues(lineUnderTest)).toMatchObject(expected);
      });

      test("load '(50%)' with reference '120kg'", () => {
        const lineUnderTest = lineTest.duplicate();
        lineUnderTest.loadBaseValue = '(50%)';
        lineUnderTest.loadReference = new ProgramLine({
          loadBaseValue: '120kg',
          rpeBaseValue: '8',
          requestFeedbackText: true,
        });
        const expected = {
          loadRequire: true,
          loadValue: undefined,
          loadComputedValue: undefined,
          loadSupposedValue: 60,
          loadRangeMin: undefined,
          loadRangeMax: undefined,
          loadOperation: undefined,
        };
        expect(loadComputedValues(lineUnderTest)).toMatchObject(expected);
      });

      test("load '-10kg' with reference '100kg'", () => {
        const lineUnderTest = lineTest.duplicate();
        lineUnderTest.loadBaseValue = '-10kg';
        lineUnderTest.loadReference = new ProgramLine({
          loadBaseValue: '100kg',
          rpeBaseValue: '8',
          requestFeedbackText: true,
        });
        const expected = {
          loadRequire: false,
          loadValue: 90,
          loadComputedValue: 90,
          loadSupposedValue: undefined,
          loadRangeMin: undefined,
          loadRangeMax: undefined,
          loadOperation: '-10',
        };
        expect(loadComputedValues(lineUnderTest)).toMatchObject(expected);
      });

      test("load '-20%' with reference '100kg'", () => {
        const lineUnderTest = lineTest.duplicate();
        lineUnderTest.loadBaseValue = '-20%';
        lineUnderTest.loadReference = new ProgramLine({
          loadBaseValue: '100kg',
        });
        const expected = {
          loadRequire: false,
          loadValue: 80,
          loadComputedValue: 80,
          loadSupposedValue: undefined,
          loadRangeMin: undefined,
          loadRangeMax: undefined,
          loadOperation: '*0.8',
        };
        expect(loadComputedValues(lineUnderTest)).toMatchObject(expected);
      });

      test("load '-10kg' with reference '50kg/150kg'", () => {
        const lineUnderTest = lineTest.duplicate();
        lineUnderTest.loadBaseValue = '-10kg';
        lineUnderTest.loadReference = new ProgramLine({
          loadBaseValue: '50kg/150kg',
        });
        const expected = {
          loadRequire: false,
          loadValue: undefined,
          loadComputedValue: undefined,
          loadSupposedValue: 90,
          loadRangeMin: undefined,
          loadRangeMax: undefined,
          loadOperation: '-10',
        };
        expect(loadComputedValues(lineUnderTest)).toMatchObject(expected);
      });

      test("load '-20%' with reference '50kg/150kg'", () => {
        const lineUnderTest = lineTest.duplicate();
        lineUnderTest.loadBaseValue = '-20%';
        lineUnderTest.loadReference = new ProgramLine({
          loadBaseValue: '50kg/150kg',
        });
        const expected = {
          loadRequire: false,
          loadValue: undefined,
          loadComputedValue: undefined,
          loadSupposedValue: 80,
          loadRangeMin: undefined,
          loadRangeMax: undefined,
          loadOperation: '*0.8',
        };
        expect(loadComputedValues(lineUnderTest)).toMatchObject(expected);
      });

      test("load '-10kg' with reference 'undefined'", () => {
        const lineUnderTest = lineTest.duplicate();
        lineUnderTest.loadBaseValue = '-10kg';
        lineUnderTest.loadReference = new ProgramLine({
          loadValue: undefined,
          loadComputedValue: undefined,
          loadSupposedValue: undefined,
          rpeBaseValue: '8',
          requestFeedbackText: true,
        });
        const expected = {
          loadRequire: false,
          loadValue: undefined,
          loadComputedValue: undefined,
          loadSupposedValue: undefined,
          loadRangeMin: undefined,
          loadRangeMax: undefined,
          loadOperation: '-10',
        };
        expect(loadComputedValues(lineUnderTest)).toMatchObject(expected);
      });

      test("load '-20%' with reference 'undefined'", () => {
        const lineUnderTest = lineTest.duplicate();
        lineUnderTest.loadBaseValue = '-20%';
        lineUnderTest.loadReference = new ProgramLine({
          loadValue: undefined,
          loadComputedValue: undefined,
          loadSupposedValue: undefined,
          rpeBaseValue: '8',
          requestFeedbackText: true,
        });
        const expected = {
          loadRequire: false,
          loadValue: undefined,
          loadComputedValue: undefined,
          loadSupposedValue: undefined,
          loadRangeMin: undefined,
          loadRangeMax: undefined,
          loadOperation: '*0.8',
        };
        expect(loadComputedValues(lineUnderTest)).toMatchObject(expected);
      });

      test("load 'W1-10kg' with reference '50kg/150kg'", () => {
        const lineUnderTest = lineTest.duplicate();
        lineUnderTest.loadBaseValue = 'W1-10kg';
        lineUnderTest.loadReference = new ProgramLine({
          loadBaseValue: '50kg/150kg',
        });
        const expected = {
          loadRequire: false,
          loadValue: undefined,
          loadComputedValue: undefined,
          loadSupposedValue: 90,
          loadRangeMin: undefined,
          loadRangeMax: undefined,
          loadOperation: '-10',
        };
        expect(loadComputedValues(lineUnderTest)).toMatchObject(expected);
      });

      test("load 'W1-20%' with reference 'undefined'", () => {
        const lineUnderTest = lineTest.duplicate();
        lineUnderTest.loadBaseValue = 'W1-20%';
        lineUnderTest.loadReference = new ProgramLine({
          loadValue: undefined,
          loadComputedValue: undefined,
          loadSupposedValue: undefined,
          rpeBaseValue: '8',
          requestFeedbackText: true,
        });
        const expected = {
          loadRequire: false,
          loadValue: undefined,
          loadComputedValue: undefined,
          loadSupposedValue: undefined,
          loadRangeMin: undefined,
          loadRangeMax: undefined,
          loadOperation: '*0.8',
        };
        expect(loadComputedValues(lineUnderTest)).toMatchObject(expected);
      });

      test("load 'W1-10%' with reference '50kg/150kg'", () => {
        const lineUnderTest = lineTest.duplicate();
        lineUnderTest.loadBaseValue = 'W1-10%';
        lineUnderTest.loadReference = new ProgramLine({
          loadBaseValue: '50kg/150kg',
        });
        const expected = {
          loadRequire: false,
          loadValue: undefined,
          loadComputedValue: undefined,
          loadSupposedValue: 90,
          loadRangeMin: undefined,
          loadRangeMax: undefined,
          loadOperation: '*0.9',
        };
        expect(loadComputedValues(lineUnderTest)).toMatchObject(expected);
      });
    });

    describe('reps-related tests', () => {
      // Reference data
      const lineTest = new ProgramLine({
        setsBaseValue: 'W1-3',
        repsBaseValue: '5/8',
        loadBaseValue: '50kg/70kg',
        rpeBaseValue: '5',
        requestFeedbackText: true,
        setsReference: new ProgramLine({
          setsBaseValue: '8',
          repsBaseValue: '5',
          loadBaseValue: '50 kg',
          rpeBaseValue: '8',
          requestFeedbackText: true,
        }),
        repsReference: new ProgramLine({
          setsBaseValue: '8',
          repsBaseValue: '5',
          loadBaseValue: '50 kg',
          rpeBaseValue: '8',
          requestFeedbackText: true,
        }),
        loadReference: new ProgramLine({
          setsBaseValue: '8',
          repsBaseValue: '5',
          loadBaseValue: '50 kg',
          rpeBaseValue: '8',
          requestFeedbackText: true,
        }),
      });
      const repsComputedValues = (line: ProgramLine) =>
        Object.fromEntries(
          [
            'repsRequire',
            'repsValue',
            'repsComputedValue',
            'repsSupposedValue',
            'repsRangeMin',
            'repsRangeMax',
            'repsOperation',
          ].map((key) => [key, line[key as keyof ProgramLine]])
        );

      test("reps '3'", () => {
        const lineUnderTest = lineTest.duplicate();
        lineUnderTest.repsBaseValue = '3';
        const expected = {
          repsRequire: false,
          repsValue: 3,
          repsComputedValue: undefined,
          repsSupposedValue: undefined,
          repsRangeMin: undefined,
          repsRangeMax: undefined,
          repsOperation: undefined,
        };
        expect(repsComputedValues(lineUnderTest)).toMatchObject(expected);
      });

      test("reps '(3)'", () => {
        const lineUnderTest = lineTest.duplicate();
        lineUnderTest.repsBaseValue = '(3)';
        const expected = {
          repsRequire: true,
          repsValue: undefined,
          repsComputedValue: undefined,
          repsSupposedValue: 3,
          repsRangeMin: undefined,
          repsRangeMax: undefined,
          repsOperation: undefined,
        };
        expect(repsComputedValues(lineUnderTest)).toMatchObject(expected);
      });

      test("reps '3/4'", () => {
        const lineUnderTest = lineTest.duplicate();
        lineUnderTest.repsBaseValue = '3/4';
        const expected = {
          repsRequire: true,
          repsValue: undefined,
          repsComputedValue: undefined,
          repsSupposedValue: 3.5,
          repsRangeMin: 3,
          repsRangeMax: 4,
          repsOperation: undefined,
        };
        expect(repsComputedValues(lineUnderTest)).toMatchObject(expected);
      });

      test("reps '?'", () => {
        const lineUnderTest = lineTest.duplicate();
        lineUnderTest.repsBaseValue = '?';
        const expected = {
          repsRequire: true,
          repsValue: undefined,
          repsComputedValue: undefined,
          repsSupposedValue: undefined,
          repsRangeMin: undefined,
          repsRangeMax: undefined,
          repsOperation: undefined,
        };
        expect(repsComputedValues(lineUnderTest)).toMatchObject(expected);
      });

      test("reps 'MAX-1' with reference '20'", () => {
        const lineUnderTest = lineTest.duplicate();
        lineUnderTest.repsBaseValue = 'MAX-1';
        lineUnderTest.repsReference = new ProgramLine({
          setsBaseValue: '8',
          repsBaseValue: '20',
          loadBaseValue: '50 kg',
          rpeBaseValue: '8',
          requestFeedbackText: true,
        });
        const expected = {
          repsRequire: false,
          repsValue: 19,
          repsComputedValue: 19,
          repsSupposedValue: undefined,
          repsRangeMin: undefined,
          repsRangeMax: undefined,
          repsOperation: '-1',
        };
        expect(repsComputedValues(lineUnderTest)).toMatchObject(expected);
      });

      test("reps '-1' with reference '3'", () => {
        const lineUnderTest = lineTest.duplicate();
        lineUnderTest.repsBaseValue = '-1';
        lineUnderTest.repsReference = new ProgramLine({
          setsBaseValue: '8',
          repsBaseValue: '3',
          loadBaseValue: '50 kg',
          rpeBaseValue: '8',
          requestFeedbackText: true,
        });
        const expected = {
          repsRequire: false,
          repsValue: 2,
          repsComputedValue: 2,
          repsSupposedValue: undefined,
          repsRangeMin: undefined,
          repsRangeMax: undefined,
          repsOperation: '-1',
        };
        expect(repsComputedValues(lineUnderTest)).toMatchObject(expected);
      });

      test("reps '-1' with reference '(3)'", () => {
        const lineUnderTest = lineTest.duplicate();
        lineUnderTest.repsBaseValue = '-1';
        lineUnderTest.repsReference = new ProgramLine({
          repsBaseValue: '(3)',
          loadBaseValue: '50 kg',
          rpeBaseValue: '8',
          requestFeedbackText: true,
        });
        const expected = {
          repsRequire: false,
          repsValue: undefined,
          repsComputedValue: undefined,
          repsSupposedValue: 2,
          repsRangeMin: undefined,
          repsRangeMax: undefined,
          repsOperation: '-1',
        };
        expect(repsComputedValues(lineUnderTest)).toMatchObject(expected);
      });

      test("reps '-1' with reference 'undefined'", () => {
        const lineUnderTest = lineTest.duplicate();
        lineUnderTest.repsBaseValue = '-1';
        lineUnderTest.repsReference = new ProgramLine({
          setsBaseValue: '8',
          repsBaseValue: undefined,
          repsValue: undefined,
          repsComputedValue: undefined,
          repsSupposedValue: undefined,
          loadBaseValue: '50 kg',
          rpeBaseValue: '8',
          requestFeedbackText: true,
        });
        const expected = {
          repsRequire: false,
          repsValue: undefined,
          repsComputedValue: undefined,
          repsSupposedValue: undefined,
          repsRangeMin: undefined,
          repsRangeMax: undefined,
          repsOperation: '-1',
        };
        expect(repsComputedValues(lineUnderTest)).toMatchObject(expected);
      });

      test("reps 'W1-1' with reference 'undefined'", () => {
        const lineUnderTest = lineTest.duplicate();
        lineUnderTest.repsBaseValue = '-1';
        lineUnderTest.repsReference = new ProgramLine({
          repsBaseValue: undefined,
          repsValue: undefined,
          repsComputedValue: undefined,
          repsSupposedValue: undefined,
          requestFeedbackText: true,
        });
        const expected = {
          repsRequire: false,
          repsValue: undefined,
          repsComputedValue: undefined,
          repsSupposedValue: undefined,
          repsRangeMin: undefined,
          repsRangeMax: undefined,
          repsOperation: '-1',
        };
        expect(repsComputedValues(lineUnderTest)).toMatchObject(expected);
      });
    });

    describe('sets-related tests', () => {
      // Reference data
      const lineTest = new ProgramLine({
        setsBaseValue: '3',
        repsBaseValue: '5/8',
        loadBaseValue: '50kg/70kg',
        rpeBaseValue: '5',
        requestFeedbackText: true,
        setsReference: new ProgramLine({
          setsBaseValue: '8',
          repsBaseValue: '5',
          loadBaseValue: '50 kg',
          rpeBaseValue: '8',
          requestFeedbackText: true,
        }),
        repsReference: new ProgramLine({
          setsBaseValue: '8',
          repsBaseValue: '5',
          loadBaseValue: '50 kg',
          rpeBaseValue: '8',
          requestFeedbackText: true,
        }),
        loadReference: new ProgramLine({
          setsBaseValue: '8',
          repsBaseValue: '5',
          loadBaseValue: '50 kg',
          rpeBaseValue: '8',
          requestFeedbackText: true,
        }),
      });
      const setsComputedValues = (line: ProgramLine) =>
        Object.fromEntries(
          [
            'setsRequire',
            'setsValue',
            'setsComputedValue',
            'setsSupposedValue',
            'setsRangeMin',
            'setsRangeMax',
            'setsOperation',
          ].map((key) => [key, line[key as keyof ProgramLine]])
        );

      test("sets '3'", () => {
        const lineUnderTest = lineTest.duplicate();
        lineUnderTest.setsBaseValue = '3';
        const expected = {
          setsRequire: false,
          setsValue: 3,
          setsComputedValue: undefined,
          setsSupposedValue: undefined,
          setsRangeMin: undefined,
          setsRangeMax: undefined,
          setsOperation: undefined,
        };
        expect(setsComputedValues(lineUnderTest)).toMatchObject(expected);
      });

      test("sets '(3)'", () => {
        const lineUnderTest = lineTest.duplicate();
        lineUnderTest.setsBaseValue = '(3)';
        const expected = {
          setsRequire: true,
          setsValue: undefined,
          setsComputedValue: undefined,
          setsSupposedValue: 3,
          setsRangeMin: undefined,
          setsRangeMax: undefined,
          setsOperation: undefined,
        };
        expect(setsComputedValues(lineUnderTest)).toMatchObject(expected);
      });

      test("sets '3/4'", () => {
        const lineUnderTest = lineTest.duplicate();
        lineUnderTest.setsBaseValue = '3/4';
        const expected = {
          setsRequire: true,
          setsValue: undefined,
          setsComputedValue: undefined,
          setsSupposedValue: 3.5,
          setsRangeMin: 3,
          setsRangeMax: 4,
          setsOperation: undefined,
        };
        expect(setsComputedValues(lineUnderTest)).toMatchObject(expected);
      });

      test("sets '?'", () => {
        const lineUnderTest = lineTest.duplicate();
        lineUnderTest.setsBaseValue = '?';
        const expected = {
          setsRequire: true,
          setsValue: undefined,
          setsComputedValue: undefined,
          setsSupposedValue: undefined,
          setsRangeMin: undefined,
          setsRangeMax: undefined,
          setsOperation: undefined,
        };
        expect(setsComputedValues(lineUnderTest)).toMatchObject(expected);
      });

      test("sets '-1' with reference '3'", () => {
        const lineUnderTest = lineTest.duplicate();
        lineUnderTest.setsBaseValue = '-1';
        lineUnderTest.setsReference = new ProgramLine({
          setsBaseValue: '3',
          repsBaseValue: '3',
          loadBaseValue: '50 kg',
          rpeBaseValue: '8',
          requestFeedbackText: true,
        });
        const expected = {
          setsRequire: false,
          setsValue: 2,
          setsComputedValue: 2,
          setsSupposedValue: undefined,
          setsRangeMin: undefined,
          setsRangeMax: undefined,
          setsOperation: '-1',
        };
        expect(setsComputedValues(lineUnderTest)).toMatchObject(expected);
      });

      test("sets '-1' with reference '(3)'", () => {
        const lineUnderTest = lineTest.duplicate();
        lineUnderTest.setsBaseValue = '-1';
        lineUnderTest.setsReference = new ProgramLine({
          setsBaseValue: '(3)',
          loadBaseValue: '50 kg',
          rpeBaseValue: '8',
          requestFeedbackText: true,
        });
        const expected = {
          setsRequire: false,
          setsValue: undefined,
          setsComputedValue: undefined,
          setsSupposedValue: 2,
          setsRangeMin: undefined,
          setsRangeMax: undefined,
          setsOperation: '-1',
        };
        expect(setsComputedValues(lineUnderTest)).toMatchObject(expected);
      });

      test("sets '-1' with reference 'undefined'", () => {
        const lineUnderTest = lineTest.duplicate();
        lineUnderTest.setsBaseValue = '-1';
        lineUnderTest.setsReference = new ProgramLine({
          setsBaseValue: undefined,
          setsValue: undefined,
          setsComputedValue: undefined,
          setsSupposedValue: undefined,
          loadBaseValue: '50 kg',
          rpeBaseValue: '8',
          requestFeedbackText: true,
        });
        const expected = {
          setsRequire: false,
          setsValue: undefined,
          setsComputedValue: undefined,
          setsSupposedValue: undefined,
          setsRangeMin: undefined,
          setsRangeMax: undefined,
          setsOperation: '-1',
        };
        expect(setsComputedValues(lineUnderTest)).toMatchObject(expected);
      });

      test("sets 'W1-1' with reference 'undefined'", () => {
        const lineUnderTest = lineTest.duplicate();
        lineUnderTest.setsBaseValue = 'W1-1';
        lineUnderTest.setsReference = new ProgramLine({
          setsBaseValue: undefined,
          setsValue: undefined,
          setsComputedValue: undefined,
          setsSupposedValue: undefined,
          requestFeedbackText: true,
        });
        const expected = {
          setsRequire: false,
          setsValue: undefined,
          setsComputedValue: undefined,
          setsSupposedValue: undefined,
          setsRangeMin: undefined,
          setsRangeMax: undefined,
          setsOperation: '-1',
        };
        expect(setsComputedValues(lineUnderTest)).toMatchObject(expected);
      });
    });

    describe('rpe-related tests', () => {
      // Reference data
      const lineTest = new ProgramLine({
        setsBaseValue: '3',
        repsBaseValue: '5/8',
        loadBaseValue: '50kg/70kg',
        rpeBaseValue: '5',
        requestFeedbackText: true,
        setsReference: new ProgramLine({
          setsBaseValue: '8',
          repsBaseValue: '5',
          loadBaseValue: '50 kg',
          rpeBaseValue: '8',
          requestFeedbackText: true,
        }),
        repsReference: new ProgramLine({
          setsBaseValue: '8',
          repsBaseValue: '5',
          loadBaseValue: '50 kg',
          rpeBaseValue: '8',
          requestFeedbackText: true,
        }),
        loadReference: new ProgramLine({
          setsBaseValue: '8',
          repsBaseValue: '5',
          loadBaseValue: '50 kg',
          rpeBaseValue: '8',
          requestFeedbackText: true,
        }),
        rpeReference: new ProgramLine({
          setsBaseValue: '8',
          repsBaseValue: '5',
          loadBaseValue: '50 kg',
          rpeBaseValue: '9',
          requestFeedbackText: true,
        }),
      });
      const rpeComputedValues = (line: ProgramLine) =>
        Object.fromEntries(
          [
            'rpeRequire',
            'rpeValue',
            'rpeComputedValue',
            'rpeSupposedValue',
            'rpeRangeMin',
            'rpeRangeMax',
            'rpeOperation',
          ].map((key) => [key, line[key as keyof ProgramLine]])
        );

      test("rpe '8'", () => {
        const lineUnderTest = lineTest.duplicate();
        lineUnderTest.rpeBaseValue = '8';
        const expected = {
          rpeRequire: false,
          rpeValue: 8,
          rpeComputedValue: undefined,
          rpeSupposedValue: undefined,
          rpeRangeMin: undefined,
          rpeRangeMax: undefined,
          rpeOperation: undefined,
        };
        expect(rpeComputedValues(lineUnderTest)).toMatchObject(expected);
      });

      test("rpe '(8)'", () => {
        const lineUnderTest = lineTest.duplicate();
        lineUnderTest.rpeBaseValue = '(8)';
        const expected = {
          rpeRequire: true,
          rpeValue: undefined,
          rpeComputedValue: undefined,
          rpeSupposedValue: 8,
          rpeRangeMin: undefined,
          rpeRangeMax: undefined,
          rpeOperation: undefined,
        };
        expect(rpeComputedValues(lineUnderTest)).toMatchObject(expected);
      });

      test("rpe '7/8'", () => {
        const lineUnderTest = lineTest.duplicate();
        lineUnderTest.rpeBaseValue = '7/8';
        const expected = {
          rpeRequire: true,
          rpeValue: undefined,
          rpeComputedValue: undefined,
          rpeSupposedValue: 7.5,
          rpeRangeMin: 7,
          rpeRangeMax: 8,
          rpeOperation: undefined,
        };
        expect(rpeComputedValues(lineUnderTest)).toMatchObject(expected);
      });

      test("rpe '?'", () => {
        const lineUnderTest = lineTest.duplicate();
        lineUnderTest.rpeBaseValue = '?';
        const expected = {
          rpeRequire: true,
          rpeValue: undefined,
          rpeComputedValue: undefined,
          rpeSupposedValue: undefined,
          rpeRangeMin: undefined,
          rpeRangeMax: undefined,
          rpeOperation: undefined,
        };
        expect(rpeComputedValues(lineUnderTest)).toMatchObject(expected);
      });

      test("rpe '-1' with reference '9'", () => {
        const lineUnderTest = lineTest.duplicate();
        lineUnderTest.rpeBaseValue = '-1';
        lineUnderTest.rpeReference = new ProgramLine({
          setsBaseValue: '3',
          repsBaseValue: '3',
          loadBaseValue: '50 kg',
          rpeBaseValue: '9',
          requestFeedbackText: true,
        });
        const expected = {
          rpeRequire: false,
          rpeValue: 8,
          rpeComputedValue: 8,
          rpeSupposedValue: undefined,
          rpeRangeMin: undefined,
          rpeRangeMax: undefined,
          rpeOperation: '-1',
        };
        expect(rpeComputedValues(lineUnderTest)).toMatchObject(expected);
      });

      test("rpe '-1' with reference '(9)'", () => {
        const lineUnderTest = lineTest.duplicate();
        lineUnderTest.rpeBaseValue = '-1';
        lineUnderTest.rpeReference = new ProgramLine({
          setsBaseValue: '3',
          loadBaseValue: '50 kg',
          rpeBaseValue: '(9)',
          requestFeedbackText: true,
        });
        const expected = {
          rpeRequire: false,
          rpeValue: undefined,
          rpeComputedValue: undefined,
          rpeSupposedValue: 8,
          rpeRangeMin: undefined,
          rpeRangeMax: undefined,
          rpeOperation: '-1',
        };
        expect(rpeComputedValues(lineUnderTest)).toMatchObject(expected);
      });

      test("rpe '-1' with reference 'undefined'", () => {
        const lineUnderTest = lineTest.duplicate();
        lineUnderTest.rpeBaseValue = '-1';
        lineUnderTest.rpeReference = new ProgramLine({
          rpeBaseValue: undefined,
          rpeValue: undefined,
          rpeComputedValue: undefined,
          rpeSupposedValue: undefined,
          loadBaseValue: '50 kg',
          requestFeedbackText: true,
        });
        const expected = {
          rpeRequire: false,
          rpeValue: undefined,
          rpeComputedValue: undefined,
          rpeSupposedValue: undefined,
          rpeRangeMin: undefined,
          rpeRangeMax: undefined,
          rpeOperation: '-1',
        };
        expect(rpeComputedValues(lineUnderTest)).toMatchObject(expected);
      });

      test("rpe 'W1-1' with reference 'undefined'", () => {
        const lineUnderTest = lineTest.duplicate();
        lineUnderTest.rpeBaseValue = 'W1-1';
        lineUnderTest.rpeReference = new ProgramLine({
          rpeBaseValue: undefined,
          rpeValue: undefined,
          rpeComputedValue: undefined,
          rpeSupposedValue: undefined,
          requestFeedbackText: true,
        });
        const expected = {
          rpeRequire: false,
          rpeValue: undefined,
          rpeComputedValue: undefined,
          rpeSupposedValue: undefined,
          rpeRangeMin: undefined,
          rpeRangeMax: undefined,
          rpeOperation: '-1',
        };
        expect(rpeComputedValues(lineUnderTest)).toMatchObject(expected);
      });
    });
  });
});
