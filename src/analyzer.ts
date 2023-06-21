import ts from "typescript";

import { ClassesWithMetrics } from "./types";
import { ClassMetrics } from "./class-metrics";

export class Analyzer {
  private readonly classes: ClassMetrics[] = [];

  constructor(private readonly typeChecker: ts.TypeChecker) {}

  process(nodes: ts.Node[]) {
    nodes.forEach((node) => this.processClass(node));

    const {
      methodsCount,
      privateMethodsCount,
      inheritedMethodsCount,
      ownMethodsCount,
      inheritedAndOverridenCount,
      ownMethodsForChildrenCount,

      attributesCount,
      privateAttributesCount,
      inheritedAttributesCount,
      ownAttributesCount,
    } = this.classes.reduce(
      (acc, classObject) => {
        const { methods, attributes } = classObject;

        acc.methodsCount += methods.length();
        acc.privateMethodsCount += methods.privateCount;
        acc.inheritedMethodsCount += methods.inherited.length;
        acc.ownMethodsCount += methods.own.length;
        acc.inheritedAndOverridenCount +=
          methods.inherited.length + methods.overridden.length;
        acc.ownMethodsForChildrenCount += methods.own.length * classObject.noc;

        acc.attributesCount += attributes.length();
        acc.privateAttributesCount += attributes.privateCount;
        acc.inheritedAttributesCount += attributes.inherited.length;
        acc.ownAttributesCount += attributes.own.length;

        return acc;
      },
      {
        methodsCount: 0,
        privateMethodsCount: 0,
        inheritedMethodsCount: 0,
        ownMethodsCount: 0,
        inheritedAndOverridenCount: 0,
        ownMethodsForChildrenCount: 0,

        attributesCount: 0,
        privateAttributesCount: 0,
        inheritedAttributesCount: 0,
        ownAttributesCount: 0,
      }
    );

    return this.prettifyResult({
      classes: this.classes,
      mhf: this.calculateMetric(privateMethodsCount, methodsCount),
      ahf: this.calculateMetric(privateAttributesCount, attributesCount),
      mif: this.calculateMetric(
        inheritedMethodsCount + ownMethodsCount,
        methodsCount
      ),
      aif: this.calculateMetric(
        inheritedAttributesCount + ownAttributesCount,
        attributesCount
      ),
      pof: this.calculateMetric(
        inheritedAndOverridenCount,
        ownMethodsForChildrenCount
      ),
    });
  }

  private calculateMetric(x: number, y: number): number {
    return +(x / y).toFixed(3) || 0;
  }

  private processClass(potentialClass: ts.Node) {
    if (ts.isClassLike(potentialClass)) {
      const classType = this.typeChecker.getTypeAtLocation(potentialClass);
      this.getClassMetrics(classType);
    }

    potentialClass.forEachChild((node) => this.processClass(node));
  }

  private getClassMetrics(classType: ts.Type): ClassMetrics {
    const className = this.typeChecker.typeToString(classType);
    const typeDecl = classType.symbol.declarations?.[0];
    const classPath = typeDecl ? this.getAbsolutePosition(typeDecl) : "";
    const isAlreadyAnalyzed = this.classes.find(
      (classObject) =>
        classObject.className === className &&
        classObject.classPath === classPath
    );

    if (isAlreadyAnalyzed) {
      return isAlreadyAnalyzed;
    }

    const result: ClassMetrics = new ClassMetrics();

    result.className = className;
    result.classPath = classPath;

    const parentClass = this.getParentClass(classType);
    const parentClassMetrics = parentClass && this.getClassMetrics(parentClass);

    if (parentClassMetrics) {
      parentClassMetrics.noc += 1;
      result.doi += 1 + parentClassMetrics.doi;
      result.parentClass = parentClassMetrics.className;
    }

    result.methods.process(parentClassMetrics, classType);
    result.attributes.process(parentClassMetrics, classType);

    this.classes.push(result);
    return result;
  }

  private getParentClass(classType: ts.Type): ts.Type | null {
    const baseTypes = classType.getBaseTypes();

    if (!baseTypes?.length) {
      return null;
    }

    if (baseTypes.length > 1) {
      throw Error(`> 1 base types; not sure which one to pick!`);
    }

    return baseTypes[0];
  }

  private getAbsolutePosition(node: ts.Node): string {
    const file = node.getSourceFile();
    const pos = file.getLineAndCharacterOfPosition(node.getStart());

    return `${file.fileName}:${pos.line + 1}:${pos.character + 1}`;
  }

  private prettifyResult(result: ClassesWithMetrics<ClassMetrics>) {
    return {
      ...result,
      classes: result.classes.map(({ className, parentClass, noc, doi }) => ({
        className,
        parentClass: parentClass || null,
        noc,
        doi,
      })),
      ...result.classes.reduce(
        (acc, { noc, doi }) => {
          if (noc > acc.maxNoc) {
            acc.maxNoc = noc;
          }

          if (doi > acc.maxDoi) {
            acc.maxDoi = doi;
          }

          return acc;
        },
        {
          maxNoc: 0,
          maxDoi: 0,
        }
      ),
    };
  }
}
