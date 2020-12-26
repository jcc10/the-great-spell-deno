import { Domains } from "./domains.ts";
import { Explosion } from "./explosion.ts";
import { NodeThread } from "./thread.ts";
export class SpellInternals {
    private lines: Array<string>;
    constructor(spell: Array<string>, header: string){
        this.lines = spell;
        //Header sanity check should go here.
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
            }
            throw new Explosion("The following line of the spell was miss scribed! \n" + line);
        }
        return [domains.air, domains.earth];
    }

    run(_fire: number, _water: number, _earth?: number, _thread?: NodeThread): number|null{
        const [air] = this.runOnce(_fire, _water, _earth, _thread);
        return air;
    }

    recursive(_fire: number, _water: number, _earth?: number, _thread?: NodeThread): number|null{
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