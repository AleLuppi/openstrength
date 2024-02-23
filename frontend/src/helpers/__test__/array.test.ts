import { describe, expect, test } from "vitest";
import { arrayUniqueValues, arrayOfPairsToObject, arraySort } from "../array";

describe("Test @/helpers/array", () => {
  /**
   * arrayUniqueValues
   */
  describe("'arrayUniqueValues' function", () => {
    // TODO

    test("array of numeric arrays", () => {
      const arr = [
        [1, 1],
        [2, 2],
        [3, 3],
        [1, 1],
        [3, 3],
      ];
      const res = arrayUniqueValues(arr, undefined, true);
      expect(res).toStrictEqual([
        [1, 1],
        [2, 2],
        [3, 3],
      ]);
      expect(res).not.toBe(arr);
    });
  });

  /**
   * arraySort
   */
  describe("'arraySort' function", () => {
    test("already sorted", () => {
      const arr = [1, 2, 3, 4, 5];
      const res = arraySort(arr);
      expect(res).toStrictEqual([1, 2, 3, 4, 5]);
      expect(res).not.toBe(arr);
    });

    test("already sorted, sort inplace", () => {
      const arr = [1, 2, 3, 4, 5];
      const res = arraySort(arr, true);
      expect(res).toStrictEqual([1, 2, 3, 4, 5]);
      expect(res).toBe(arr);
    });

    test("numbers", () => {
      const arr = [10, 2, 5, 8, 19, 4];
      const res = arraySort(arr);
      expect(res).toStrictEqual([2, 4, 5, 8, 10, 19]);
      expect(res).not.toBe(arr);
    });

    test("numbers, sort inplace", () => {
      const arr = [10, 2, 5, 4, 19, 4];
      const res = arraySort(arr, true);
      expect(res).toStrictEqual([2, 4, 4, 5, 10, 19]);
      expect(res).toBe(arr);
    });

    test("numbers as string", () => {
      const arr = ["10", "2", "5", "4", "19", "4"];
      const res = arraySort(arr);
      expect(res).toStrictEqual(["10", "19", "2", "4", "4", "5"]);
    });

    test("texts", () => {
      const arr = ["abc", "bcd", "aaa", "bubu", "a", "bcd"];
      const res = arraySort(arr);
      expect(res).toStrictEqual(["a", "aaa", "abc", "bcd", "bcd", "bubu"]);
    });

    test("texts and numbers as strings", () => {
      const arr = ["abc", "bcd", "1", "20"];
      const res = arraySort(arr);
      expect(res).toStrictEqual(["1", "20", "abc", "bcd"]);
    });

    test("strings and numbers", () => {
      const arr = ["abc", "bcd", 1, 20];
      const res = arraySort(arr);
      expect(res).toStrictEqual(["abc", "bcd", 1, 20]);
    });

    test("numbers, sort by negative", () => {
      const arr = [1, 2, 3, 10, 5, 7];
      const res = arraySort(arr, undefined, (val) => -val);
      expect(res).toStrictEqual([10, 7, 5, 3, 2, 1]);
    });

    test("strings, sort with left pad", () => {
      const arr = ["abc", "bcd", "aaa", "bubu", "a", "bcd"];
      const res = arraySort(arr, undefined, (val) => val.padStart(5, "z"));
      expect(res).toStrictEqual(["bubu", "aaa", "abc", "bcd", "bcd", "a"]);
    });

    test("texts and numbers as strings, sort with left pad", () => {
      const arr = ["5", "number", "20", "a", "4"];
      const res = arraySort(arr, undefined, (val) => val.padStart(5, "0"));
      expect(res).toStrictEqual(["4", "5", "a", "20", "number"]);
    });

    test("numbers, sort by position in array", () => {
      const arr = [1, 2, 3, 10, 5, 7];
      const res = arraySort(arr, undefined, (val, arr) =>
        arr.findIndex((v) => v == val),
      );
      expect(res).toStrictEqual([1, 2, 3, 10, 5, 7]);
    });

    test("numbers, sort by number multiplied by position in array", () => {
      const arr = [2, 3, 1, 10, 5, 7];
      const res = arraySort(
        arr,
        undefined,
        (val, arr) => val * (arr.findIndex((v) => v == val) ?? 100),
      );
      expect(res).toStrictEqual([2, 1, 3, 5, 10, 7]);
    });
  });

  /**
   * arrayOfPairsToObject
   */
  describe("'arrayOfPairsToObject' function", () => {
    test("number pairs", () => {
      const arr: [number, number][] = [
        [1, 2],
        [1, 10],
        [1, 3],
        [1, 5],
        [2, 4],
        [2, 5],
      ];
      const res = arrayOfPairsToObject(arr);
      expect(res).toBeTypeOf("object");
      expect(res).toStrictEqual({ 1: [2, 10, 3, 5], 2: [4, 5] });
    });

    test("string pairs", () => {
      const arr: [string, string][] = [
        ["1", "2"],
        ["1", "10"],
        ["1", "3"],
        ["1", "5"],
        ["2", "4"],
        ["2", "5"],
      ];
      const res = arrayOfPairsToObject(arr);
      expect(res).toBeTypeOf("object");
      expect(res).toStrictEqual({
        1: ["2", "10", "3", "5"],
        2: ["4", "5"],
      });
    });

    test("mixed string and number pairs", () => {
      const arr: [string | number, string | number][] = [
        ["1", "2"],
        [1, "10"],
        ["1", "3"],
        [1, "5"],
        ["2", 4],
        ["2", "5"],
        ["2", "2"],
        [3, 6],
        [1, 8],
      ];
      const res = arrayOfPairsToObject(arr);
      expect(res).toBeTypeOf("object");
      expect(res).toStrictEqual({
        1: ["2", "10", "3", "5", 8],
        2: [4, "5", "2"],
        3: [6],
      });
    });

    test("pairs with repetitions of different type", () => {
      const arr: [string | number, string | number][] = [
        [1, 2],
        [1, "2"],
        [1, 3],
        [1, "3"],
        ["2", "4"],
        ["2", 4],
      ];
      const res = arrayOfPairsToObject(arr);
      expect(res).toBeTypeOf("object");
      expect(res).toStrictEqual({
        1: [2, "2", 3, "3"],
        2: ["4", 4],
      });
    });

    test("pairs with repetitions of same type", () => {
      const arr: [string | number, string | number][] = [
        [1, 2],
        [1, 2],
        [1, 2],
        [1, 3],
        [1, 3],
        ["2", "4"],
        ["2", "4"],
        [2, "4"],
      ];
      const res = arrayOfPairsToObject(arr);
      expect(res).toBeTypeOf("object");
      expect(res).toStrictEqual({
        1: [2, 2, 2, 3, 3],
        2: ["4", "4", "4"],
      });
    });

    test("pairs with repetitions of different type, requiring unique output", () => {
      const arr: [string | number, string | number][] = [
        [1, 3],
        [1, "3"],
        [1, 2],
        [1, "2"],
        ["2", "4"],
        ["2", 4],
      ];
      const res = arrayOfPairsToObject(arr, true);
      expect(res).toBeTypeOf("object");
      expect(res).toStrictEqual({
        1: [2, "2", 3, "3"],
        2: ["4", 4],
      });
    });

    test("pairs with repetitions of same type, requiring unique output", () => {
      const arr: [string | number, string | number][] = [
        [1, 2],
        [1, 2],
        [1, 2],
        [1, 3],
        [1, 3],
        ["2", "4"],
        ["2", "4"],
        [2, "4"],
      ];
      const res = arrayOfPairsToObject(arr, true);
      expect(res).toBeTypeOf("object");
      expect(res).toStrictEqual({
        1: [2, 3],
        2: ["4"],
      });
    });

    test("empty array", () => {
      const arr: [string | number, string | number][] = [];
      const res = arrayOfPairsToObject(arr);
      expect(res).toBeTypeOf("object");
      expect(res).toStrictEqual({});
    });
  });
});
