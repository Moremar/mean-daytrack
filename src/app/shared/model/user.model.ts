export class User {

  constructor(
    public id: string,
    public email: string
  ) {}

  pretty(): string {
    return `User((${this.id}, ${this.email})`;
  }
}
