import ts from "typescript";

export type AttributeDeclaration =
  | ts.PropertyDeclaration
  | ts.ParameterDeclaration
  | ts.GetAccessorDeclaration;

export type MethodDeclaration = ts.MethodDeclaration;

export type ClassesWithMetrics<ClassType> = {
  classes: ClassType[];
  mif: number;
  aif: number;
  mhf: number;
  ahf: number;
  pof: number;
};
