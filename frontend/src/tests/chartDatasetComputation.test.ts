import { expect, test, describe } from "vitest";
import {
  calculatePercentage1RM,
  calculateRepsFromTable,
  calculateRpeFromTable,
  estimateMissingLineProps,
} from "../chartDatasetComputations";
import { ProgramLine } from "@/helpers/programs/program";
import { MaxLift } from "@/helpers/maxlifts/maxlift";

/****************************/
/***** Line computation *****/
/****************************/

describe("Test on calculations from rpeTable", () => {
  test("'calculatePercentage1RM' test line 2 of excel sheet", () => {
    expect(calculatePercentage1RM(3, 9)).toBe(89);
  });

  test("'calculatePercentage1RM' test line 3 of excel sheet", () => {
    expect(calculatePercentage1RM(8.5, 8.5)).toBe(73.5);
  });

  test("'calculateRepsFromTable' test line 6 of excel sheet", () => {
    expect(calculateRepsFromTable(82, 8)).toBe(5);
  });

  test("'calculateRepsFromTable' test line 7 of excel sheet", () => {
    expect(calculateRepsFromTable(81.67, 9)).toBe(6);
  });

  test("'calculateRepsFromTable' test line 10 of excel sheet", () => {
    expect(calculateRepsFromTable(83, 8.5)).toBe(5);
  });

  test("'calculateRepsFromTable' test line 11 of excel sheet", () => {
    expect(calculateRepsFromTable(85, 8)).toBe(4);
  });

  test("'calculatePercentage1RM' test line 14 of excel sheet", () => {
    expect(calculatePercentage1RM(3, 9.5)).toBe(91);
  });

  test("'calculatePercentage1RM' test line 15 of excel sheet", () => {
    expect(calculatePercentage1RM(3, 9.75)).toBe(92);
  });

  test("'calculatePercentage1RM' test line 16 of excel sheet", () => {
    expect(calculatePercentage1RM(3.5, 7.5)).toBe(83.5);
  });

  test("'calculateRpeFromTable' test line 17 of excel sheet", () => {
    expect(calculateRpeFromTable(83, 5)).toBe(9);
  });
  test("'calculateRpeFromTable' test line 18 of excel sheet", () => {
    expect(calculateRpeFromTable(87, 3)).toBe(8.5);
  });
});

describe("Test on calculations for line estimation", () => {
  test("TEST LINE 2 ", () => {
    const maxlift = new MaxLift({
      value: "150",
    });
    const lineToTest = new ProgramLine({
      setsBaseValue: "3",
      repsBaseValue: "3",
      rpeBaseValue: "9",
      loadReference: maxlift,
    });
    const lineResult = estimateMissingLineProps(
      lineToTest,
      Number(maxlift.value),
    );

    expect(lineResult?.loadBaseValue).toBe("89%");
    expect(lineResult?.loadValue).toBe(133.5);
  });

  test("TEST LINE 3 ", () => {
    const maxlift = new MaxLift({
      value: "150",
    });
    const lineToTest = new ProgramLine({
      setsBaseValue: "3",
      repsBaseValue: "7/10",
      rpeBaseValue: "8.5",
      loadReference: maxlift,
    });

    expect(lineToTest?.repsSupposedValue).toBe(8.5);
    expect(lineToTest?.rpeValue).toBe(8.5);
    expect(lineToTest?.loadComputedValue).toBe(undefined);
    const lineResult = estimateMissingLineProps(
      lineToTest,
      Number(maxlift.value),
    );

    expect(lineResult?.loadBaseValue).toBe("73.5%");
    expect(lineResult?.loadValue).toBe(110.25);
  });

  test("TEST LINE 4 ", () => {
    const maxlift = new MaxLift({
      value: "150",
    });
    const lineToTest = new ProgramLine({
      setsBaseValue: "3",
      repsBaseValue: "5",
      loadReference: maxlift,
    });
    const lineResult = estimateMissingLineProps(
      lineToTest,
      Number(maxlift.value),
    );
    expect(lineResult?.loadBaseValue).toBe(undefined);
  });

  test("TEST LINE 5 ", () => {
    const maxlift = new MaxLift({
      value: "150",
    });
    const lineToTest = new ProgramLine({
      setsBaseValue: "3",
      rpeBaseValue: "8",
      loadReference: maxlift,
    });
    const lineResult = estimateMissingLineProps(
      lineToTest,
      Number(maxlift.value),
    );
    expect(lineResult?.loadBaseValue).toBe(undefined);
  });

  test("TEST LINE 6 ", () => {
    const maxlift = new MaxLift({
      value: "150",
    });
    const lineToTest = new ProgramLine({
      setsBaseValue: "3",
      rpeBaseValue: "8",
      loadBaseValue: "123kg",
      loadReference: maxlift,
    });

    expect(lineToTest?.loadValue).toBe(123);
    const lineResult = estimateMissingLineProps(
      lineToTest,
      Number(maxlift.value),
    );

    if (lineResult?.loadValue) {
      expect((100 * lineResult?.loadValue) / Number(maxlift.value)).toBe(82);
    }
    expect(lineResult?.repsValue).toBe(5);
  });

  test("TEST LINE 7 ", () => {
    const maxlift = new MaxLift({
      value: "150",
    });
    const lineToTest = new ProgramLine({
      setsBaseValue: "3",
      rpeBaseValue: "9",
      loadBaseValue: "120kg/125kg",
      loadReference: maxlift,
    });

    expect(lineToTest?.loadSupposedValue).toBe(122.5);
    const lineResult = estimateMissingLineProps(
      lineToTest,
      Number(maxlift.value),
    );

    if (lineResult?.loadSupposedValue) {
      expect(
        ((100 * lineResult?.loadSupposedValue) / Number(maxlift.value)).toFixed(
          2,
        ),
      ).toBe("81.67");
    }
    expect(lineResult?.repsValue).toBe(6);
  });
  test("TEST LINE 8 ", () => {
    const maxlift = new MaxLift({
      value: "150",
    });
    const lineToTest = new ProgramLine({
      setsBaseValue: "3",
      rpeBaseValue: "8.5",
      loadReference: maxlift,
    });

    const lineResult = estimateMissingLineProps(
      lineToTest,
      Number(maxlift.value),
    );

    expect(lineResult?.repsValue).toBe(undefined);
    expect(lineResult?.loadValue).toBe(undefined);
  });

  test("TEST LINE 9 ", () => {
    const maxlift = new MaxLift({
      value: "150",
    });
    const lineToTest = new ProgramLine({
      setsBaseValue: "3",
      loadBaseValue: "125kg",
      loadReference: maxlift,
    });

    const lineResult = estimateMissingLineProps(
      lineToTest,
      Number(maxlift.value),
    );

    expect(lineResult?.repsValue).toBe(undefined);
    if (lineResult?.loadValue) {
      expect(
        ((100 * lineResult?.loadValue) / Number(maxlift.value)).toFixed(2),
      ).toBe("83.33");
    }
  });

  test("TEST LINE 10 ", () => {
    const maxlift = new MaxLift({
      value: "150",
    });
    const lineToTest = new ProgramLine({
      setsBaseValue: "3",
      rpeBaseValue: "8.5",
      repsBaseValue: "5",
      loadBaseValue: "83%",
      loadReference: maxlift,
    });

    const lineResult = estimateMissingLineProps(
      lineToTest,
      Number(maxlift.value),
    );
    expect(lineResult?.loadComputedValue).toBe(124.5);
  });

  test("TEST LINE 11 ", () => {
    const maxlift = new MaxLift({
      value: "150",
    });
    const lineToTest = new ProgramLine({
      setsBaseValue: "3",
      rpeBaseValue: "8",
      repsBaseValue: "4",
      loadBaseValue: "84%/86%",
      loadReference: maxlift,
    });

    const lineResult = estimateMissingLineProps(
      lineToTest,
      Number(maxlift.value),
    );
    expect(lineResult?.loadSupposedValue).toBe(127.5);
  });

  test("TEST LINE 12 ", () => {
    const maxlift = new MaxLift({
      value: "150",
    });
    const lineToTest = new ProgramLine({
      setsBaseValue: "3",
      rpeBaseValue: "7",

      loadReference: maxlift,
    });

    const lineResult = estimateMissingLineProps(
      lineToTest,
      Number(maxlift.value),
    );
    expect(lineResult?.loadValue).toBe(undefined);
    expect(lineResult?.repsValue).toBe(undefined);
  });

  test("TEST LINE 13 ", () => {
    const maxlift = new MaxLift({
      value: "150",
    });
    const lineToTest = new ProgramLine({
      setsBaseValue: "3",
      loadBaseValue: "88%",

      loadReference: maxlift,
    });

    const lineResult = estimateMissingLineProps(
      lineToTest,
      Number(maxlift.value),
    );
    expect(lineResult?.loadValue).toBe(132);
  });

  test("TEST LINE 14 ", () => {
    const maxlift = new MaxLift({
      value: "150",
    });
    const lineToTest = new ProgramLine({
      setsBaseValue: "3",
      repsBaseValue: "3",
      rpeBaseValue: "9/10",
      loadReference: maxlift,
    });

    const lineResult = estimateMissingLineProps(
      lineToTest,
      Number(maxlift.value),
    );
    expect(lineResult?.loadValue).toBe(136.5);
  });

  test("TEST LINE 15", () => {
    const maxlift = new MaxLift({
      value: "150",
    });
    const lineToTest = new ProgramLine({
      setsBaseValue: "3",
      repsBaseValue: "3",
      rpeBaseValue: "9.5/10", //TODO: 9/10
      loadReference: maxlift,
    });

    expect(lineToTest?.rpeSupposedValue).toBe(9.75);
    const lineResult = estimateMissingLineProps(
      lineToTest,
      Number(maxlift.value),
    );
    expect(lineResult?.loadComputedValue).toBe(138);
  });

  test("TEST LINE 16", () => {
    const maxlift = new MaxLift({
      value: "150",
    });
    const lineToTest = new ProgramLine({
      setsBaseValue: "3",
      repsBaseValue: "3/4",
      rpeBaseValue: "7.5",
      loadReference: maxlift,
    });

    const lineResult = estimateMissingLineProps(
      lineToTest,
      Number(maxlift.value),
    );
    expect(lineResult?.loadComputedValue).toBe(125.25);
  });

  test("TEST LINE 17", () => {
    const maxlift = new MaxLift({
      value: "150",
    });
    const lineToTest = new ProgramLine({
      setsBaseValue: "3",
      repsBaseValue: "5",
      loadBaseValue: "83%",
      loadReference: maxlift,
    });

    const lineResult = estimateMissingLineProps(
      lineToTest,
      Number(maxlift.value),
    );
    expect(lineResult?.rpeValue).toBe(9);
    expect(lineResult?.loadValue).toBe(124.5);
  });

  test("TEST LINE 18", () => {
    const maxlift = new MaxLift({
      value: "150",
    });
    const lineToTest = new ProgramLine({
      setsBaseValue: "3",
      repsBaseValue: "3",
      loadBaseValue: "87%",
      loadReference: maxlift,
    });

    const lineResult = estimateMissingLineProps(
      lineToTest,
      Number(maxlift.value),
    );
    expect(lineResult?.rpeValue).toBe(8.5);
    expect(lineResult?.loadValue).toBe(130.5);
  });
});
