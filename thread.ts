import { Deque } from "./deque/deque.ts";
import { Explosion } from "./explosion.ts";
export class NodeThread {
  private nodeThread: Deque<number> = new Deque<number>();
  constructor() {}

  XLeftArrow(x: number) {
    this.nodeThread.pushLeft(x);
  }

  RightArrowX(x: number) {
    this.nodeThread.push(x);
  }

  LeftArrowX(): number {
    try {
      return this.nodeThread.popLeft();
    } catch {
      throw new Explosion("The node thread being empty!");
    }
  }

  XRightArrow(): number {
    try {
      return this.nodeThread.pop();
    } catch {
      throw new Explosion("The node thread being empty!");
    }
  }
}
