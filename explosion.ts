export class Explosion extends Error {
  constructor(reason: string) {
    const mysticReason = `The spell exploded because ${reason}!`;
    super(mysticReason);
  }
}
