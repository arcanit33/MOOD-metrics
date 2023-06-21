import ts from "typescript";

import { AttributeDeclaration, MethodDeclaration } from "./types";
import { ClassMetrics } from "./class-metrics";

export class PropertyMetrics<
  T extends AttributeDeclaration | MethodDeclaration
> {
  private readonly atrributesCheckers = [
    ts.isPropertyDeclaration,
    ts.isParameter,
    ts.isGetAccessorDeclaration,
  ];
  private readonly privateModifiers = [
    ts.SyntaxKind.PrivateKeyword,
    ts.SyntaxKind.PrivateIdentifier,
  ];

  privateCount = 0;
  inherited: T[] = [];
  overridden: T[] = [];
  own: T[] = [];

  constructor(private readonly propType: "methods" | "attributes") {}

  private allProps(): T[] {
    return [...this.inherited, ...this.overridden, ...this.own];
  }

  process(parentClassMetrics: ClassMetrics | null, classType: ts.Type) {
    const parentProps = (parentClassMetrics?.[this.propType]?.allProps() ||
      []) as T[];

    for (const property of classType.getProperties()) {
      const propertyDeclaration = property.declarations?.[0] as T;

      if (
        !this.isMethodOrAttributeDeclaration(this.propType, propertyDeclaration)
      ) {
        continue;
      }

      if (this.isPrivate(propertyDeclaration)) {
        this.privateCount += 1;
      }

      const declarationName = propertyDeclaration.name.getText();
      const isInherited = parentProps.some(
        (prop) => prop.name.getText() === declarationName
      );

      if (!isInherited) {
        this.own.push(propertyDeclaration);
        continue;
      }

      const classDeclaration = classType.symbol.declarations![0];

      if (propertyDeclaration.parent === classDeclaration) {
        this.overridden.push(propertyDeclaration);
      } else {
        this.inherited.push(propertyDeclaration);
      }
    }
  }

  length(): number {
    return this.allProps().length;
  }

  private isMethodOrAttributeDeclaration(
    propType: "methods" | "attributes",
    propDecl: ts.Declaration | null
  ): boolean {
    if (!propDecl) return false;

    if (propType === "methods") return !!ts.isMethodDeclaration(propDecl);

    return this.atrributesCheckers.some((is) => is(propDecl));
  }

  private isPrivate(decl: T): boolean {
    return !!decl.modifiers?.some((modifier) =>
      this.privateModifiers.includes(modifier.kind)
    );
  }
}
