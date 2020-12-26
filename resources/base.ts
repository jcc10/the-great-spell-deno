/**
 * Abstract resource, used for elements, used for domain, realm, and reagent runes.
 */
export abstract class Resource {
  /**
     * Used when takeing a node from a resource
     */
  abstract take(): number | Promise<number>;
  /**
     * Used when checking the node value in a resource
     */
  abstract check(): number | Promise<number>;
  /**
     * Used to place a node into a resource
     * @param nodeValue node value being sent to resource
     */
  abstract put(nodeValue: number | null): void;
}
