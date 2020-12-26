import { Explosion } from "./explosion.ts";
import { NodeThread } from "./thread.ts";
export class SpellInternals {
    private lines: Array<string>;
    constructor(spell: Array<string>, header: string){
        this.lines = spell;
        //Header sanity check should go here.
    }

    run(_fire: number, _water: number, _earth?: number, _thread?: NodeThread){
        let fire = _fire;
        let water = _water;
        let air = 0;
        let earth = _earth ? _earth : 0;
        const thread = _thread ? _thread : new NodeThread();
        /* ---- HELPER FUNCTIONS ---- */
        function update(symbol: string, value: number){
            switch(symbol){
                case "%":
                    fire = value;
                    break;
                case "$":
                    water = value;
                    break;
                case "!":
                    air = value;
                    break;
                case "~":
                    earth = value;
                    break;
                default:
                    throw new Explosion(`${symbol} is not a element!`);
            }
        }
        function get(symbol: string): number {
            switch (symbol) {
                case "%":
                    return fire;
                case "$":
                    return water;
                case "!":
                    return air;
                case "~":
                    return earth;
                default:
                    throw new Explosion(`${symbol} is not a element!`);
            }
        }
        /* ---- END HELPER FUNCTIONS ---- */

        let skipping = false;
        for(const line of this.lines){
            if(skipping){
                skipping = false;
                continue;
            }
            let processed = false;
            if(line.length == 2){
                // Thread Stuff
                if(line[0] == "<"){
                   update(line[1], thread.LeftArrowX());
                   processed = true;
                }
                if(line[0] == ">"){
                    thread.RightArrowX(get(line[1]));
                    processed = true;
                }
                if(line[1] == "<"){
                    thread.XLeftArrow(get(line[0]));
                    processed = true;
                }
                if(line[1] == ">"){
                    update(line[0], thread.XRightArrow());
                    processed = true;
                }
                // End Thread Stuff
            } else if(line.length == 3) {
                // Move
                if(line[1] == "^"){
                    update(line[2], get(line[0]));
                    // Should 0 empty out?
                    // update(line[0], 0);
                    processed = true;
                }
                if(line[2] == "="){
                    if(get(line[0]) == get(line[1])){
                        skipping = false;
                    } else {
                        skipping = true;
                    }
                    processed = true;
                }
            } else if(line.length == 4) {
                null;
            } else {
                null;
            }
        }
    }
}