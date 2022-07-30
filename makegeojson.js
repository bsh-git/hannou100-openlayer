#!/usr/bin/env node
/** -*- coding: utf-8 -*-
 * @fileoverview application on nodejs
 *
 */
'use strict'

import module from "module";
const require = module.createRequire(import.meta.url);

import GetOpt from 'node-getopt'
import {fromLonLat} from 'ol/proj.js'
const fs = require("fs");


const RE1 = /(\d+)°\s*(\d+)'\s*([0-9.]+)"/
const RE2 = /(\d+)度\s*(\d+)分\s*([0-9.]+)秒/

function lonlatToFloat(str) {
    let m = str.match(RE1) || str.match(RE2)

    if (!m)
        throw `Bad coordinate ${str}`

    return parseInt(m[1]) + parseInt(m[2]) / 60.0 + parseFloat(m[3]) / 3600.0 
}

function makeFeature(no, name, alt, yamareco, yamap, lat, lon) {
    let latf = lonlatToFloat(lat)
    let lonf = lonlatToFloat(lon)

    let props = {
        "number": parseInt(no),
        "name": name,
        "altitude": alt,
        "latitude": lat,
        "longtitude": lon,
    }

    if (yamareco != '' && yamareco != '-') {
        props['url1'] = yamareco
    }
    if (yamap != '' && yamap != '-') {
        props['url2'] = yamap
    }

    return {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": fromLonLat([lonf, latf])
        },
        "properties": props
    }

}



const opts = GetOpt.create(
    [
//        ['f', 'foo', 'foo option'],
//        ['b', 'bar=ARG', 'bar option']
    ]).setHelp(
        "Usage: node makegeojson.js INPUT.tsv\n")
      .bindHelp()
const args = opts.parseSystem();

function test() {
    console.log(lonlatToFloat("35°52'15\""))
    console.log(lonlatToFloat("35°52'15.3\""))
    console.log(lonlatToFloat("35度52分15.3秒"))
    console.log(makeFeature("1", "日向沢の峰", "1356",
                            "https://www.yamareco.com/modules/yamainfo/ptinfo.php?ptid=3017",
                            "https://yamap.com/landmarks/9059",
                            "35°51'55\"", "139°06'04\""
                           ))
}

/*
 *
 */



//test()


if (args.argv.length <= 0) {
    opts.showHelp()
    process.exit(1)
}

let features = []

let content = fs.readFileSync(args.argv[0], 'utf8')
for (let line of content.split('\n')) {
    let a = line.split('\t')
    if (a.length >= 7 && a[5] !== '' && a[6] !== '') {
        features.push(makeFeature(...a))
    }
}

console.log(JSON.stringify({"type": "FeatureCollection", "features": features}, null, 2))
