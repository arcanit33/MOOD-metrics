interface Person {
  name: string;
  age: number;
}

function greet(person: Person): void {
  console.log(`Hello, ${person.name}!`);
}

class Animal {
  protected name: string;
  private age: number;

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }

  protected getName(): string {
    return this.name;
  }

  getAge(): number {
    return this.age;
  }

  eat(food: string): void {
    console.log(`${this.name} is eating ${food}.`);
  }

  private sleep(): void {
    console.log(`${this.name} is sleeping.`);
  }
}

class Dog extends Animal {
  private breed: string;

  constructor(name: string, age: number, breed: string) {
    super(name, age);
    this.breed = breed;
  }

  bark(): void {
    console.log("Woof!");
  }

  getInfo(): string {
    return `Name: ${this.name}, Age: ${this.getAge()}, Breed: ${this.breed}`;
  }

  wagTail(): void {
    console.log(`${this.name} is wagging its tail.`);
  }
}

abstract class Shape {
  protected color: string;

  constructor(color: string) {
    this.color = color;
  }

  abstract getArea(): number;
  abstract getPerimeter(): number;

  getColor(): string {
    return this.color;
  }

  private draw(): void {
    console.log(`Drawing a ${this.color} shape.`);
  }
}

class Rectangle extends Shape {
  private width: number;
  private height: number;

  constructor(color: string, width: number, height: number) {
    super(color);
    this.width = width;
    this.height = height;
  }

  getArea(): number {
    return this.width * this.height;
  }

  getPerimeter(): number {
    return 2 * (this.width + this.height);
  }

  isSquare(): boolean {
    return this.width === this.height;
  }

  private rotate(): void {
    console.log(`Rotating the rectangle.`);
  }
}

class Circle extends Shape {
  private radius: number;

  constructor(color: string, radius: number) {
    super(color);
    this.radius = radius;
  }

  getArea(): number {
    return Math.PI * Math.pow(this.radius, 2);
  }

  getPerimeter(): number {
    return 2 * Math.PI * this.radius;
  }

  getCircumference(): number {
    return 2 * Math.PI * this.radius;
  }

  private collapse(): void {
    console.log(`Collapsing the circle.`);
  }
}

export { Person, greet, Animal, Dog, Shape, Rectangle, Circle };
