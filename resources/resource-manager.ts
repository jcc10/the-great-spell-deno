import { Explosion } from "./../explosion.ts";
import { Resource } from "./base.ts";
import { DomainResource } from "./domain.ts";
import { RealmResource } from "./realm.ts";

export class ResourceManager {
  private resourceMap = new Map<string, Resource>();

  private preloadRunes() {
    //Realms
    this.resourceMap.set("*", new RealmResource(2));
    this.resourceMap.set("#", new RealmResource(1));
    this.resourceMap.set("@", new RealmResource(0));
    //Domains
    this.resourceMap.set("%", new DomainResource());
    this.resourceMap.set("$", new DomainResource());
    this.resourceMap.set("!", new DomainResource());
    this.resourceMap.set("~", new DomainResource());
  }

  constructor(
    fire: number,
    water: number,
    earth?: number,

  ) {
    this.preloadRunes();
    this.resourceMap.get("%")?.put(fire);
    this.resourceMap.get("$")?.put(water);
    this.resourceMap.get("~")?.put(earth ? earth : null);
  }

  addResource(rune: string, resource: Resource){
    this.resourceMap.set(rune, resource);
  }

  async take(resourceRune: string): Promise<number> {
    const resource = this.resourceMap.get(resourceRune);
    if (!resource) {
      throw new Explosion("The spell has unknown runes!");
    }
    return await resource.take();
  }
  async check(resourceRune: string): Promise<number> {
    const resource = this.resourceMap.get(resourceRune);
    if (!resource) {
      throw new Explosion("The spell has unknown runes!");
    }
    return await resource.check();
  }
  put(resourceRune: string, value: number | null) {
    const resource = this.resourceMap.get(resourceRune);
    if (!resource) {
      throw new Explosion("The spell has unknown runes!");
    }
    resource.put(value);
  }
}
