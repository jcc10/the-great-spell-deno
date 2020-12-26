import { Explosion } from "./explosion.ts";
export class Domains {
    fire: number | null = null;
    water: number | null = null;
    air: number | null = null;
    earth: number | null = null;
    constructor(fire: number, water: number, earth?: number){
        this.fire = fire;
        this.water = water;
        this.earth = earth ? earth : null;
    }

    /**
     * Returns node energy from domain or realm. If domain, it also empty's the domain.
     * @param symbol domain or realm rune
     */
    take(symbol: string): number {
        let r: number | null;
        switch (symbol) {
            case "%":
                r = this.fire;
                this.fire = null;
                break;
            case "$":
                r = this.water;
                this.water = null;
                break;
            case "!":
                r = this.air;
                this.air = null;
                break;
            case "~":
                r = this.earth;
                this.earth = null;
                break;
            case "*":
                r = 2;
                break;
            case "#":
                r = 1;
                break;
            case "@":
                r = 0;
                break;
            default:
                throw new Explosion(`${symbol} is not a element!`);
        }
        if(r == null){
            throw new Explosion(`${symbol} does not have a node!`);
        }
        return r;
    }

    /**
     * Returns node energy from domain or realm. Does not empty domains.
     * @param symbol domain or realm rune
     */
    check(symbol: string): number {
        let r: number | null;
        switch (symbol) {
        case "%":
            r = this.fire;
            break;
        case "$":
            r = this.water;
            break;
        case "!":
            r = this.air;
            break;
        case "~":
            r = this.earth;
            break;
        case "*":
            r = 2;
            break;
        case "#":
            r = 1;
            break;
        case "@":
            r = 0;
            break;
        default:
            throw new Explosion(`${symbol} is not a element!`);
        }
        if (r == null) {
        throw new Explosion(`${symbol} does not have a node!`);
        }
        return r;
    }

    /**
     * Sets node energy from domain. (Or if realm, voids it.)
     * @param symbol domain or realm rune
     */
    update(symbol: string, value: number) {
        switch (symbol) {
            case "%":
                this.fire = value;
                break;
            case "$":
                this.water = value;
                break;
            case "!":
                this.air = value;
                break;
            case "~":
                this.earth = value;
                break;
            case "*":
            case "#":
            case "@":
                break;
            default:
                throw new Explosion(`${symbol} is not a element!`);
        }
    }
}