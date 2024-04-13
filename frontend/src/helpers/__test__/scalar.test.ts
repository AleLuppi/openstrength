import { describe, expect, test } from "vitest";
import {
  numberRoundToDecimal,
  stringGetNext,
  stringGetNextFromList,
} from "../scalar";

describe("Test helpers/scalar", () => {
  /******************/
  /***** NUMBER *****/
  /******************/
  describe("NUMBER methods", () => {
    describe("'numberRoundToDecimal' function", () => {
      test("integer number '1' to 2 decimals", () => {
        const res = numberRoundToDecimal(1, 2);
        expect(res).toBeTypeOf("number");
        expect(String(res)).toMatch("1");
      });

      test("number '2.3' to 2 decimals", () => {
        const res = numberRoundToDecimal(2.3, 2);
        expect(res).toBeTypeOf("number");
        expect(String(res)).toMatch("2.3");
      });

      test("number '2.3' to 0 decimals", () => {
        const res = numberRoundToDecimal(2.3, 0);
        expect(res).toBeTypeOf("number");
        expect(String(res)).toMatch("2");
      });

      test("number '5.8' to 2 decimals", () => {
        const res = numberRoundToDecimal(5.8, 2);
        expect(res).toBeTypeOf("number");
        expect(String(res)).toMatch("5.8");
      });

      test("number '5.8' to 0 decimals", () => {
        const res = numberRoundToDecimal(5.8, 0);
        expect(res).toBeTypeOf("number");
        expect(String(res)).toMatch("6");
      });

      test("number '0.123456' to 0 decimals", () => {
        const res = numberRoundToDecimal(0.123456, 0);
        expect(res).toBeTypeOf("number");
        expect(String(res)).toMatch("0");
      });

      test("number '0.123456' to 1 decimals", () => {
        const res = numberRoundToDecimal(0.123456, 1);
        expect(res).toBeTypeOf("number");
        expect(String(res)).toMatch("0.1");
      });

      test("number '0.123456' to 2 decimals", () => {
        const res = numberRoundToDecimal(0.123456, 2);
        expect(res).toBeTypeOf("number");
        expect(String(res)).toMatch("0.12");
      });

      test("number '0.123456' to 3 decimals", () => {
        const res = numberRoundToDecimal(0.123456, 3);
        expect(res).toBeTypeOf("number");
        expect(String(res)).toMatch("0.123");
      });

      test("number '0.123456' to 4 decimals", () => {
        const res = numberRoundToDecimal(0.123456, 4);
        expect(res).toBeTypeOf("number");
        expect(String(res)).toMatch("0.1235");
      });

      test("number '0.123456' to 5 decimals", () => {
        const res = numberRoundToDecimal(0.123456, 5);
        expect(res).toBeTypeOf("number");
        expect(String(res)).toMatch("0.12346");
      });

      test("number '0.123456' to 6 decimals", () => {
        const res = numberRoundToDecimal(0.123456, 6);
        expect(res).toBeTypeOf("number");
        expect(String(res)).toMatch("0.123456");
      });

      test("number '0.123456' to 7 decimals", () => {
        const res = numberRoundToDecimal(0.123456, 7);
        expect(res).toBeTypeOf("number");
        expect(String(res)).toMatch("0.123456");
      });

      test("number '6.478' to -1 decimals", () => {
        const res = numberRoundToDecimal(6.478, -1);
        expect(res).toBeTypeOf("number");
        expect(String(res)).toMatch("6");
      });

      test("number '4.844' to 1.3 decimals", () => {
        const res = numberRoundToDecimal(4.844, 1.3);
        expect(res).toBeTypeOf("number");
        expect(String(res)).toMatch("4.8");
      });

      test("number '4.844' to 1.8 decimals", () => {
        const res = numberRoundToDecimal(4.844, 1.8);
        expect(res).toBeTypeOf("number");
        expect(String(res)).toMatch("4.8");
      });
    });
  });

  /*******************/
  /***** STRING *****/
  /*******************/

  describe("STRING methods", () => {
    /**
     * stringGetNext
     */
    describe("'stringGetNext' function", () => {
      test("basic string 'abc'", () => {
        expect(stringGetNext("abc")).toBe("abd");
      });

      test("basic string 'aBz'", () => {
        expect(stringGetNext("aBz")).toBe("aCa");
      });

      test("basic string 'abZ'", () => {
        expect(stringGetNext("abZ")).toBe("acA");
      });

      test("basic string 'zZzZ'", () => {
        expect(stringGetNext("zZzZ")).toBe("aaAaA");
      });

      test("number string '54'", () => {
        expect(stringGetNext("54")).toBe("55");
      });

      test("number string '39'", () => {
        expect(stringGetNext("39")).toBe("40");
      });

      test("number string '99999'", () => {
        expect(stringGetNext("99999")).toBe("100000");
      });

      test("uncommon string '1, -.3'", () => {
        expect(stringGetNext("1, -.3")).toBe("1, -.4");
      });
    });

    /**
     * stringGetNextFromList
     */
    describe("'stringGetNextFromList' function", () => {
      test("basic string 'abc' with empty list", () => {
        expect(stringGetNextFromList([], "abc")).toBe("abc");
      });

      test("basic string 'abc' with single element list", () => {
        expect(stringGetNextFromList(["abc"], "abc")).toBe("abd");
      });

      test("basic string 'abc' with double element list", () => {
        expect(stringGetNextFromList(["abc", "abd"], "abc")).toBe("abe");
      });

      test("basic string 'aBz' with empty list", () => {
        expect(stringGetNextFromList([], "aBz")).toBe("aBz");
      });

      test("basic string 'aBz' with list of similar elements", () => {
        expect(stringGetNextFromList(["abz", "ABZ", "AbZ", "ABz"], "aBz")).toBe(
          "aBz",
        );
      });

      test("basic string 'aBz' with list of similar elements including 'aBz'", () => {
        expect(
          stringGetNextFromList(["abz", "ABZ", "AbZ", "ABz", "aBz"], "aBz"),
        ).toBe("aCa");
      });

      test("empty string '' with empty list", () => {
        expect(stringGetNextFromList([], "")).toBe("");
      });

      test("empty string '' with non-empty list", () => {
        expect(stringGetNextFromList(["a", "b", "c"], "")).toBe("");
      });

      test("basic string 'zZzZ' with empty list", () => {
        expect(stringGetNextFromList([], "zZzZ")).toBe("zZzZ");
      });

      test("basic string 'zZzZ' with single element list", () => {
        expect(stringGetNextFromList(["zZzZ"], "zZzZ")).toBe("aaAaA");
      });

      test("number string '99999' with uncorrelated list", () => {
        expect(stringGetNextFromList(["100000"], "99999")).toBe("99999");
      });

      test("number string '99999' with short list", () => {
        expect(stringGetNextFromList(["99999", "100000"], "99999")).toBe(
          "100001",
        );
      });

      test("uncommon string '1, -.3' with long list", () => {
        expect(
          stringGetNextFromList(
            [
              "1, -.3",
              "1, -.4",
              "1, -.5",
              "1, -.6",
              "1, -.7",
              "1, -.8",
              "1, -.9",
              "1, -.10",
            ],
            "1, -.3",
          ),
        ).toBe("1, -.11");
      });
    });
  });
});
