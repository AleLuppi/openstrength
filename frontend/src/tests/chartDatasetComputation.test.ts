import { expect, test } from "vitest";
import { calculatePercentage1RM, calculateRepsFromTable, calculateRpeFromTable } from "@/helpers/charts/chartDatasetComputations";

/****************************/
/***** Line computation *****/
/****************************/

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
    expect(calculatePercentage1RM(3, 9.75)).toBe(91.5);
  });

test("'calculatePercentage1RM' test line 16 of excel sheet", () => {
    expect(calculatePercentage1RM(3.5, 7.5)).toBe(84);
  });

  test("'calculateRpeFromTable' test line 17 of excel sheet", () => {
    expect(calculateRpeFromTable(83, 5)).toBe(8.5);
  });
  test("'calculateRpeFromTable' test line 18 of excel sheet", () => {
    expect(calculateRpeFromTable(87, 3)).toBe(8.5);
  });