import { Explosion } from "../explosion.ts";
import { Resource } from "./base.ts";
/**
 * Used for realm runes.
 */
export class RealmResource extends Resource {
  private readonly value;
  constructor(value: number | null) {
    super();
    this.value = value;
  }
  take(): number {
    if (!this.value) {
      throw new Explosion(
        "You attempted to take a node from a realm that doesn't have one.",
      );
    }
    return this.value;
  }
  check(): number {
    if (!this.value) {
      throw new Explosion(
        "You attempted to take a node from a realm that doesn't have one.",
      );
    }
    return this.value;
  }
  put(nodeValue: number | null) {
    return;
  }
}
