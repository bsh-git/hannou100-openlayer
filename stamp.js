/** -*- coding: utf-8 -*-
 * @fileoverview simple bitset
 *
 */
'use strict'

export class Stamp {
    // 整数値は Number.MAX_SAFE_INTEGER まで取れるが、シフトやビット演算は32ビットまで
    static #width = 30 //
    bits = [0, 0, 0, 0]

    constructor(str) {
        if (str) {
            this.bits = str.split(',').map(s => {
                return parseInt(s, 16)
            })
        }
    }

    static #indexToPos(index) {
        return [Math.floor(index / Stamp.#width),
                1 << (index % Stamp.#width)]
    }

    set(index) {
        let [off, mask] = Stamp.#indexToPos(index)
        this.bits[off] |= mask
    }

    unset(index) {
        let [off, mask] = Stamp.#indexToPos(index)

        this.bits[off] &= ~mask
    }

    isset(index) {
        let [off, mask] = Stamp.#indexToPos(index)

        return (this.bits[off] & mask) != 0
    }

    toString() {
        return this.bits.map(d => d.toString(16)).join(',')
    }
}
