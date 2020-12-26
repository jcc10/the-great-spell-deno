import { Domains } from "./domains.ts";
import { Explosion } from "./explosion.ts";
import { NodeThread } from "./thread.ts";

export enum KINDS {
    BASIC,
    RECURSIVE
}

export class Spell{
    private lines: Array<string>;
    private spells: Map<string, Spell>;
    public readonly kind: KINDS;
    constructor(spell: Array<string>, spellList: Map<string, Spell>, header: string){
        this.lines = spell;
        this.spells = spellList;
        //Header sanity check should go here.
        if(header[0] == "["){
            this.kind = KINDS.BASIC;
        } else if(header[0] == "("){
            this.kind = KINDS.RECURSIVE;
        } else {
            throw new Explosion("Unknown kind of spell scribed!");
        }
    }

    private runOnce(_fire: number, _water: number, _earth?: number, _thread?: NodeThread): [number|null, number|null]{
        const domains = new Domains(_fire, _water, _earth);
        const thread = _thread ? _thread : new NodeThread();

        let skipping = false;
        for(const line of this.lines){
            if(skipping){
                skipping = false;
                continue;
            }
            if(line.length == 2){
                // Thread Stuff
                if(line[0] == "<"){
                   domains.update(line[1], thread.LeftArrowX());
                    continue;
                }
                if(line[0] == ">"){
                    thread.RightArrowX(domains.take(line[1]));
                    continue;
                }
                if(line[1] == "<"){
                    thread.XLeftArrow(domains.take(line[0]));
                    continue;
                }
                if(line[1] == ">"){
                    domains.update(line[0], thread.XRightArrow());
                    continue;
                }
                // End Thread Stuff
            } else if(line.length == 3) {
                // Move
                if(line[1] == "^"){
                    domains.update(line[2], domains.take(line[0]));
                    continue;
                }
                // If
                if(line[2] == "="){
                    // This might be take, but I'm treating it as a check.
                    if(domains.check(line[0]) == domains.check(line[1])){
                        skipping = false;
                    } else {
                        skipping = true;
                    }
                    continue;
                }
            } else if(line.length == 4) {
                // Clone
                if(line[1] == "&"){
                    const x = domains.take(line[0]);
                    domains.update(line[2], x);
                    domains.update(line[3], x);
                    continue;
                }
                // Plus
                if(line[2] == "+"){
                    const x = domains.take(line[0]);
                    const y = domains.take(line[1]);
                    domains.update(line[3], (x + y));
                    continue;
                }
                // Minus
                if(line[2] == "-"){
                    const x = domains.take(line[0]);
                    const y = domains.take(line[1]);
                    domains.update(line[3], (x - y));
                    continue;
                }
            } else {
                // Cast a spell
                if(line[0] == "{"){
                    const call = this.parseSpellCall(line);
                    const callee = this.spells.get(call.spell);
                    if(!callee){
                        throw new Explosion(`There is no spell called '${call.spell}'!`);
                    }
                    if(callee.kind != call.kind){
                        throw new Explosion(`Wrong kind of spell!`);
                    }
                    const L = call.L ? domains.take(call.L) : undefined;
                    //const air = this.spells.get(call.spell)?.run(domains.take(call.N), domains.take(call.M), L);
                    const air = callee.run(domains.take(call.N), domains.take(call.M), L, thread);
                    domains.update(call.Q, air);
                }
            }
            throw new Explosion("The following line of the spell was miss scribed! \n" + line);
        }
        return [domains.air, domains.earth];
    }

    private parseSpellCall(call: string) {
        let kind: KINDS = KINDS.BASIC;
        let spell = "";
        let first = true;
        let name = true;
        let N: string | null = null;
        let M: string | null = null;
        let breakOne = true;
        let Q: string | null = null;
        let breakTwo = true;
        let L: string | null = null;
        for(const char of call){
            if(first){
                first = false;
                continue;
            }
            if(name){
                if(char == "|"){
                    name = false;
                    continue;
                }
                spell = spell + char;
                continue;
            }
            if(!N){
                N = char;
                continue;
            }
            if(!M){
                M = char;
                continue;
            }
            if(breakOne){
                breakOne = false;
                continue;
            }
            if(!Q){
                Q = char;
                continue;
            }
            if(breakTwo){
                if(char == "}"){
                    kind = KINDS.BASIC;
                    break;
                }
                breakTwo = false;
            }
            if(!L){
                L = char;
                kind = KINDS.RECURSIVE;
                break;
            }

        }
        if(N == null || M == null || Q == null){
            throw new Explosion(`Improper basic spell rune!`);
        }
        if (kind == KINDS.RECURSIVE && L == null) {
            throw new Explosion(`Improper recursive spell rune!`);
        }
        return {kind, spell, N, M, Q, L};
    }

    run(_fire: number, _water: number, _earth?: number, _thread?: NodeThread): number|null{
        let air;
        if(this.kind == KINDS.BASIC){
            air = this.runBasic(_fire, _water, _thread);
        } else if(this.kind == KINDS.RECURSIVE){
            air = this.runRecursive(_fire, _water, _earth, _thread);
        } else {
            throw new Explosion("Explosion trying to run code... This should be impossible.")
        }
        return air;
    }

    runBasic(_fire: number, _water: number, _thread?: NodeThread): number|null{
        const [air] = this.runOnce(_fire, _water, undefined, _thread);
        return air;
    }

    runRecursive(_fire: number, _water: number, _earth?: number, _thread?: NodeThread): number|null{
        const thread = _thread ? _thread : new NodeThread();
        let earth: number = _earth ? _earth : 0;
        let air: number | null = earth;
        while(true){
            if(earth <= 0){
                break;
            }
            const out = this.runOnce(_fire, _water, earth, _thread);
            earth = out[1] ? out[1] : 0;
            air = out[0];
        }
        return air;
    }
}