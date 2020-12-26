import { Explosion } from "./../explosion.ts";
import { Resource } from "./base.ts";
import { Deque } from "./../deque/deque.ts";

class LeftThreadWrapper extends Resource {
  private nodeThread: Deque<number>;
  constructor(nodeThread: Deque<number>) {
    super();
    this.nodeThread = nodeThread;
  }
  take(): number {
    try {
      return this.nodeThread.popLeft();
    } catch {
      throw new Explosion("The node thread is empty!");
    }
  }
  check(): number {
    let x = null;
    try {
      x = this.nodeThread.popLeft();
      this.nodeThread.pushLeft(x);
    } catch {
      throw new Explosion("The node thread is empty!");
    }
    return x;
  }
  put(value: number | null) {
    if(value == null){
      return;
    }
    this.nodeThread.pushLeft(value);
  }
}
class RightThreadWrapper extends Resource {
  private nodeThread: Deque<number>;
  constructor(nodeThread: Deque<number>) {
    super();
    this.nodeThread = nodeThread;
  }
  take(): number {
    try {
      return this.nodeThread.pop();
    } catch {
      throw new Explosion("The node thread is empty!");
    }
  }
  check(): number {
    let x = null;
    try {
      x = this.nodeThread.pop();
      this.nodeThread.push(x);
    } catch {
      throw new Explosion("The node thread is empty!");
    }
    return x;
  }
  put(value: number | null) {
    if(value == null){
      return;
    }
    this.nodeThread.push(value);
  }
}

/**
 * Used for domain runes.
 */
export class NodeThread {
  private nodeThread: Deque<number> = new Deque<number>();
  left(): Resource {
    return new LeftThreadWrapper(this.nodeThread);
  }
  right(): Resource {
    return new RightThreadWrapper(this.nodeThread);
  }
}
