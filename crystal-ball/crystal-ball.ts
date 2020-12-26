import { TextProtoReader } from "https://deno.land/std@0.82.0/textproto/mod.ts";
import { BufReader } from "https://deno.land/std@0.82.0/io/bufio.ts";
import { Resource } from "./../resources/base.ts";
export class CrystalBall extends Resource{
  stdIn: TextProtoReader;
  stdOut: Deno.Writer;
  encoder = new TextEncoder();
  constructor(stdIn: Deno.Reader, stdOut: Deno.Writer) {
    super();
    this.stdIn = new TextProtoReader(BufReader.create(stdIn));
    this.stdOut = stdOut;
  }

  private async printRaw(s: string) {
    await this.stdOut.write(this.encoder.encode(s));
    return;
  }

  async check(): Promise<number> {
    return await this.take();
  }
  put(nodeValue: number | null): void {
    console.log(`🔮: ${nodeValue}`);
  }

  async take(): Promise<number> {
    let x: number;
    while (true) {
      this.printRaw(`🔮: `);
      const line = await this.stdIn.readLine();
      if (line == null) {
        continue;
      } else {
        x = parseInt(line);
        if (isNaN(x)) {
          continue;
        } else {
          return x;
        }
      }
    }
  }
}