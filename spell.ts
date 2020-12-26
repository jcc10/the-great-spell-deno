import { Explosion } from "./explosion.ts";
import { Resource } from "./resources/base.ts";
import { NodeThread } from "./resources/node-thread.ts";
import { ResourceManager } from "./resources/resource-manager.ts";

export enum KINDS {
    INVALID,
    BASIC,
    RECURSIVE
}

export interface OptResources {
    nodeThread?: NodeThread;
    crystalBall: Resource;
}

export interface spellMetadata {
    name: string;
    kind: KINDS;
    ending: RegExp;
}

const recursiveHeader = /\(([^\(\[\{\|\n]+)\|%\$\|!\|~\)/g;
const basicHeader = /\[([^\(\[\{\|\n]+)\|%\$\|!\]/g;

export function headerParser(header: string): spellMetadata{
    let matches = recursiveHeader.exec(header);
    if(matches && matches[1]){
        return {
            name: matches[1],
            kind: KINDS.RECURSIVE,
            ending: /\(\)/g,
        }
    }
    matches = basicHeader.exec(header)
    if(matches && matches[1]){
        return {
            name: matches[1],
            kind: KINDS.BASIC,
            ending: /\[\]/g,
        }
    }
    return {
        name: "",
        kind: KINDS.INVALID,
        ending: /./g
    }
}

export class Spell{
    private lines: Array<string>;
    private spells: Map<string, Spell>;
    public readonly kind: KINDS;
    constructor(spell: Array<string>, spellList: Map<string, Spell>, header: string){
        this.lines = spell;
        this.spells = spellList;
        //Header sanity check should go here.
        const md = headerParser(header);
        this.kind = md.kind;
        if(this.kind == KINDS.INVALID) {
            throw new Explosion("Unknown kind of spell scribed!");
        }
    }

    private async runOnce(_fire: number, _water: number, _resources: OptResources, _earth?: number ): Promise<[number|null, number|null]>{
        const resources = new ResourceManager(_fire, _water, _earth);
        const thread = _resources.nodeThread ? _resources.nodeThread : new NodeThread();
        resources.addResource("<", thread.left())
        resources.addResource(">", thread.right())
        if(_resources.crystalBall){
            resources.addResource("?", _resources.crystalBall);
        }

        let skipping = false;
        for(const line of this.lines){
            if(skipping){
                skipping = false;
                continue;
            }
            if(line.length == 3) {
                // Move
                if(line[1] == "^"){
                    resources.put(line[2], await resources.take(line[0]));
                    continue;
                }
                // If
                if(line[2] == "="){
                    // This might be take, but I'm treating it as a check.
                    if(await resources.check(line[0]) == await resources.check(line[1])){
                        skipping = false;
                    } else {
                        skipping = true;
                    }
                    continue;
                }
            } else if(line.length == 4) {
                // Clone
                if(line[1] == "&"){
                    const x = await resources.take(line[0]);
                    resources.put(line[2], x);
                    resources.put(line[3], x);
                    continue;
                }
                // Plus
                if(line[2] == "+"){
                    const x = await resources.take(line[0]);
                    const y = await resources.take(line[1]);
                    resources.put(line[3], (x + y));
                    continue;
                }
                // Minus
                if(line[2] == "-"){
                    const x = await resources.take(line[0]);
                    const y = await resources.take(line[1]);
                    resources.put(line[3], (x - y));
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
                    const L = call.L ? await resources.take(call.L) : undefined;
                    const passedResources: OptResources = {
                        crystalBall: _resources.crystalBall,
                        //nodeThread: thread, // Not passing this currently.
                    };
                    const air = await callee.run(await resources.take(call.N), await resources.take(call.M), passedResources,  L);
                    resources.put(call.Q, air);
                }
            }
            throw new Explosion("The following line of the spell was miss scribed! \n" + line);
        }
        return [await resources.take("!"), await resources.take("~")];
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

    async run(_fire: number, _water: number, _resources:OptResources, _earth?: number): Promise<number|null>{
        let air;
        if(this.kind == KINDS.BASIC){
            air = await this.runBasic(_fire, _water, _resources);
        } else if(this.kind == KINDS.RECURSIVE){
            air = await this.runRecursive(_fire, _water, _resources, _earth);
        } else {
            throw new Explosion("Explosion trying to run code... This should be impossible.")
        }
        return air;
    }

    async runBasic(_fire: number, _water: number, _resources: OptResources): Promise<number|null>{
        const [air] = await this.runOnce(_fire, _water, _resources);
        return air;
    }

    async runRecursive(_fire: number, _water: number, _resources:OptResources, _earth?: number): Promise<number|null>{
        const thread = _resources.nodeThread ? _resources.nodeThread : new NodeThread();
        let earth: number = _earth ? _earth : 0;
        let air: number | null = earth;
        const actualResources: OptResources = {..._resources, nodeThread: thread};
        while(true){
            if(earth <= 0){
                break;
            }
            const out = await this.runOnce(_fire, _water, actualResources);
            earth = out[1] ? out[1] : 0;
            air = out[0];
        }
        return air;
    }
}