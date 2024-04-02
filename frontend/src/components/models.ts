/***********************/
/***** TABLE SHEET *****/
/***********************/

export interface TableSheetCell {
  row: number;
  col: number;
  values: (string | number | boolean)[];
}

export interface TableSheetCellConfig {
  // range of rows and columns it affects
  rowFrom?: number | undefined;
  rowTo?: number | undefined;
  colFrom?: number | undefined;
  colTo?: number | undefined;

  // row and column span for the cell
  rowSpan?: number; // default: 1
  colSpan?: number; // default: 1

  // horizontal and vertical alignment
  justify?: "left" | "center" | "right"; // default: "left"
  align?: "top" | "middle" | "bottom"; // default: "top"

  // supporting content
  placeholder?: string; // TODO
  stringPrefix?: string; // TODO
  stringSuffix?: string; // TODO

  // validation rules
  validation?: (val: string | number) => boolean | string; // TODO

  // allow selection of values from a list, optionally allowing outsiders
  selectionList?: []; // TODO
  selectionAllowNew?: boolean; // TODO default: false

  // whether to allow value editing directly inside the cell
  inlineEdit?: boolean; // default: false

  // highlight the cell
  highlight?: boolean; // TODO default: false

  // display values inside chips
  useChip?: boolean | "single" | "multiple"; // default: false

  // optional styles
  class?: string;
  style?: string;
}
