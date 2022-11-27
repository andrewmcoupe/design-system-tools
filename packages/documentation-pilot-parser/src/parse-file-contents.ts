import { parse } from "@babel/parser";
import * as t from "@babel/types";

export const parseFileContents = (fileContents: string) => {
  if (!fileContents) {
    return;
  }
  const parseResult = parse(fileContents, {
    sourceType: "module",
    plugins: [
      "typescript",
      "jsx",
      ["decorators", { decoratorsBeforeExport: false }],
    ],
  }) as t.File;

  return parseResult;
};
