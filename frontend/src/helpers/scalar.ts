// ----- Functions related to Date -----

import { matchNumberUnsignedInteger } from "./regex";

/**
 * Clean a date from its timezone offset.
 *
 * @param date if provided, date to clean from timezone, otherwise new date instance.
 * @returns the date cleaned from the user timezone.
 */
export function dateGetWithoutTimezone(date?: Date | string) {
  const dateToClean = date ? new Date(date) : new Date();
  return new Date(
    dateToClean.getTime() - dateToClean.getTimezoneOffset() * 60000,
  );
}

// ----- Functions related to String -----

/**
 * Given a string, return the text that comes immediately after.
 *
 * Example of next texts:
 *  - "a"       ->  "b"
 *  - "ZZ"      ->  "AAA"
 *  - "59"      ->  "60"
 *  - "text_43" -> "text_44"
 * Note that last character in string must be in set [a-zA-Z0-9].
 *
 * @param text input text.
 * @returns string occurring immediately after input text.
 */
export function stringGetNext(text: string) {
  // Check text pattern
  const matchedText = /(.*?)([a-zA-Z]+|[0-9]+)$/.exec(text);
  if (!matchedText) return undefined;

  // Keep only interesting part
  const [, textBeginning, textEnding] = matchedText;
  let replacedEnding = "";

  // Handle differently text ending with number or text
  if (matchNumberUnsignedInteger(textEnding))
    replacedEnding = String(Number(textEnding) + 1);
  else {
    // Convert the string to an array of characters
    const chars = textEnding.split("");
    if (chars.length <= 0) return undefined;

    // Get the last character and increment it
    let lastChar = chars.pop();
    const saveChars = [];

    // Check for special cases (like 'z' and 'Z')
    while (lastChar == "z" || lastChar == "Z") {
      saveChars.push(lastChar == "Z" ? "A" : "a");
      lastChar = chars.pop();
    }
    if (lastChar)
      saveChars.push(String.fromCharCode(lastChar.charCodeAt(0) + 1));
    else saveChars.push(saveChars.at(-1) == "Z" ? "A" : "a");

    // Convert the array back to a string
    replacedEnding = chars.join("") + saveChars.reverse().join("");
  }

  return textBeginning + replacedEnding;
}
