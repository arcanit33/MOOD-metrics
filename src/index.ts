import ts from "typescript";
import path from "path";

import { Analyzer } from "./analyzer";

const pathInput = process.argv[2];

if (!pathInput) {
  throw new Error("Path was not provided");
}

const program = ts.createProgram({
  rootNames: [pathInput],
  options: {},
});

const typeChecker = program.getTypeChecker();
const analyzer = new Analyzer(typeChecker);

const files = program
  .getSourceFiles()
  .filter((file) => !path.parse(file.fileName).dir.includes("node_modules"));

const result = analyzer.process(files);

console.log(result);
