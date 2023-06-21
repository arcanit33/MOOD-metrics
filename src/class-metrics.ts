import { PropertyMetrics } from "./property-metrics";
import { AttributeDeclaration, MethodDeclaration } from "./types";

export class ClassMetrics {
  className = "";
  classPath = "";
  parentClass = "";
  doi = 0;
  noc = 0;
  methods = new PropertyMetrics<MethodDeclaration>("methods");
  attributes = new PropertyMetrics<AttributeDeclaration>("attributes");
}
