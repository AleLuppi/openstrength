/***** Common regex patterns *****/
const stringAlphanumeric = /^\s*([a-zA-Z0-9]+)\s*$/;
const numberUnsignedInteger = /^\s*(\d+)\s*$/;
const numberUnsignedFloat = /^\s*(\d+[.,]?\d*)\s*$/;
const numberUnsignedFloatWithUnit = /^\s*(\d+[.,]?\d*)\s*(\w+)\s*$/;
const numberUnsignedFloatWithOptionalUnit = /^\s*(\d+[.,]?\d*)\s*(\w*)\s*$/;
const numberUnsignedPercentageInteger = /^\s*(\d+)\s*%\s*$/;
const numberUnsignedPercentageFloat = /^\s*(\d+[.,]?\d*)\s*%\s*$/;
const numberSignedInteger = /^\s*([+-]\s?\d+)\s*$/;
const numberSignedFloat = /^\s*([+-]\s?\d+[.,]?\d*)\s*$/;
const numberSignedFloatWithUnit = /^\s*([+-]\s?\d+[.,]?\d*)\s*(\w+)\s*$/;
const numberSignedFloatWithOptionalUnit =
  /^\s*([+-]\s?\d+[.,]?\d*)\s*(\w*)\s*$/;
const numberSignedPercentageInteger = /^\s*([+-]\s?\d+)\s*%\s*$/;
const numberSignedPercentageFloat = /^\s*([+-]\s?\d+[.,]?\d*)\s*%\s*$/;
const numberOptionallySignedInteger = /^\s*([+-]?\s?\d+)\s*$/;
const numberOptionallySignedFloat = /^\s*([+-]?\s?\d+[.,]?\d*)\s*$/;
const numberOptionallySignedPercentageInteger = /^\s*([+-]?\s?\d+)\s*%\s*$/;
const numberOptionallySignedPercentageFloat =
  /^\s*([+-]?\s?\d+[.,]?\d*)\s*%\s*$/;
const numberFractionInteger = /^\s*(\d+)\s*\/\s*(\d+)\s*$/;
const numberFractionFloat = /^\s*(\d+[.,]?\d*)\s*\/\s*(\d+[.,]?\d*)\s*$/;
const numberFractionPercentageFloat =
  /^\s*(\d+[.,]?\d*)\s*%\s*\/\s*(\d+[.,]?\d*)\s*%\s*$/;
const numberIntegerInBrackets = /^\s*\(\s*(\d+)\s*\)\s*$/;
const numberFloatInBrackets = /^\s*\(\s*(\d+[.,]?\d*)\s*\)\s*$/;

/***** Use common regex patterns *****/
export function matchStringAlphanumeric(s: string) {
  return stringAlphanumeric.exec(s);
}

export function matchNumberUnsignedInteger(s: string) {
  return numberUnsignedInteger.exec(s);
}

export function matchNumberUnsignedFloat(s: string) {
  return numberUnsignedFloat.exec(s);
}

export function matchNumberUnsignedFloatWithUnit(s: string) {
  return numberUnsignedFloatWithUnit.exec(s);
}

export function matchNumberUnsignedFloatWithOptionalUnit(s: string) {
  return numberUnsignedFloatWithOptionalUnit.exec(s);
}

export function matchNumberUnsignedPercentageInteger(s: string) {
  return numberUnsignedPercentageInteger.exec(s);
}

export function matchNumberUnsignedPercentageFloat(s: string) {
  return numberUnsignedPercentageFloat.exec(s);
}

export function matchNumberSignedInteger(s: string) {
  return numberSignedInteger.exec(s);
}

export function matchNumberSignedFloat(s: string) {
  return numberSignedFloat.exec(s);
}

export function matchNumberSignedFloatWithUnit(s: string) {
  return numberSignedFloatWithUnit.exec(s);
}

export function matchNumberSignedFloatWithOptionalUnit(s: string) {
  return numberSignedFloatWithOptionalUnit.exec(s);
}

export function matchNumberSignedPercentageInteger(s: string) {
  return numberSignedPercentageInteger.exec(s);
}

export function matchNumberSignedPercentageFloat(s: string) {
  return numberSignedPercentageFloat.exec(s);
}

export function matchNumberOptionallySignedInteger(s: string) {
  return numberOptionallySignedInteger.exec(s);
}

export function matchNumberOptionallySignedFloat(s: string) {
  return numberOptionallySignedFloat.exec(s);
}

export function matchNumberOptionallySignedPercentageInteger(s: string) {
  return numberOptionallySignedPercentageInteger.exec(s);
}

export function matchNumberOptionallySignedPercentageFloat(s: string) {
  return numberOptionallySignedPercentageFloat.exec(s);
}

export function matchNumberFractionInteger(s: string) {
  return numberFractionInteger.exec(s);
}

export function matchNumberFractionFloat(s: string) {
  return numberFractionFloat.exec(s);
}

export function matchNumberFractionPercentageFloat(s: string) {
  return numberFractionPercentageFloat.exec(s);
}

export function matchNumberIntegerInBrackets(s: string) {
  return numberIntegerInBrackets.exec(s);
}

export function matchNumberFloatInBrackets(s: string) {
  return numberFloatInBrackets.exec(s);
}
