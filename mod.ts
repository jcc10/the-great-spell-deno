import { Spell, headerParser, KINDS } from "./spell.ts";

export class TGSParser {
  spells = new Map<string, Spell>();

  constructor(text: string) {
    const lines = text.split("\n");
    let name: string | null = null;
    let mode = /./g;
    let header = "";
    let spellLines: Array<string> = [];
    for (const line of lines) {
      if(name == null){
        const potential = headerParser(line);
        if(potential.kind == KINDS.INVALID)
          continue;
        name = potential.name;
        mode = potential.ending;
        header = line;
        spellLines = [];
      } else {
        if(mode.test(line)){
          const spell = new Spell(spellLines, this.spells, header);
          this.spells.set(name, spell);
          name = null;
          continue;
        }
        spellLines.push(line);
      }
    }
  }

  
}
