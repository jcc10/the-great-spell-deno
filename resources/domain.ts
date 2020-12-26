import { Explosion } from "./../explosion.ts";
import { Resource } from "./base.ts";
/**
 * Used for domain runes.
 */
export class DomainResource extends Resource {
  private value: number | null;
  constructor(initialValue?: number) {
    super();
    this.value = initialValue ? initialValue : null;
  }
  take(): number {
    if (!this.value) {
      throw new Explosion(
        "You attempted to take a node from a domain that doesn't have one.",
      );
    }
    const x = this.value;
    this.value = null;
    return x;
  }
  check(): number {
    if (!this.value) {
      throw new Explosion(
        "You attempted to take a node from a domain that doesn't have one.",
      );
    }
    return this.value;
  }
  put(nodeValue: number | null) {
    this.value = nodeValue;
  }
}
