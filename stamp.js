/** -*- coding: utf-8 -*-
 * @fileoverview simple bitset
 *
 */
'use strict'

export class Stamp {
    // 整数値は Number.MAX_SAFE_INTEGER まで取れるが、シフトやビット演算は32ビットまで
    static #width = 30 //
    #bits = [0, 0, 0, 0]
    #count = 0

    constructor(str) {
        if (str) {
            this.#bits = str.split(',').map(s => {
                return parseInt(s, 16)
            })

            for (let d of this.#bits) {
                for (let m = 1<<(Stamp.#width-1); m != 0; m >>= 1) {
                    if (d & m)
                        this.#count++
                }
            }
        }
    }

    static #indexToPos(index) {
        return [Math.floor(index / Stamp.#width),
                1 << (index % Stamp.#width)]
    }

    get count() {
        return this.#count
    }

    set(index) {
        let [off, mask] = Stamp.#indexToPos(index)

        if (!(this.#bits[off] & mask))
            this.#count++

        this.#bits[off] |= mask
    }

    unset(index) {
        let [off, mask] = Stamp.#indexToPos(index)

        if (this.#bits[off] & mask)
            this.#count--

        this.#bits[off] &= ~mask
    }

    isset(index) {
        let [off, mask] = Stamp.#indexToPos(index)

        return (this.#bits[off] & mask) != 0
    }

    toString() {
        return this.#bits.map(d => d.toString(16)).join(',')
    }
}
