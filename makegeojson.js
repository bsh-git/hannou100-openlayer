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
const YAMAP_PT_TYPE = ["", "mountains", "landmarks", ""]



function lonlatToFloat(str) {
    let m = str.match(RE1) || str.match(RE2)

    if (!m) {
        let v = parseFloat(str)
        if (isNaN(v))
            throw `Bad coordinate ${str}`
        let d = Math.floor(v)
        let v2 = v - d
        let m = Math.floor(v2 / (1/60.0))
        let s = (v2 - (m * (1/60.0))) / (1/3600.0)
        s = s.toFixed(4)
        return [v, `${d}°${m}'${s}"`]
    }

    return [parseInt(m[1]) + parseInt(m[2]) / 60.0 + parseFloat(m[3]) / 3600.0 , str]
}

function makeFeature(no, name, alt, yamareco, yamap, lat, lon) {
    let [latf, lats] = lonlatToFloat(lat)
    let [lonf, lons] = lonlatToFloat(lon)

    //console.error("makeFeature: " + [no, lon, lonf, lat, latf].join(" "));

    let props = {
        "number": parseInt(no),
        "name": name,
        "altitude": alt,
        "latitude": lats,
        "longitude": lons,
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
        ['I', 'input-tsv-version=VER', 'format of the TSV file. 1 or 2']
    ]).setHelp(
        "Usage: node makegeojson.js [-I 1|2] INPUT.tsv\n")
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

var tsv_ver = args.options['input-tsv-version']
if (!tsv_ver) {
    tsv_ver = '1'
}
else if (tsv_ver !== '1' && tsv_ver !== '2') {
    console.error("Bad TSV version " + tsv_ver)
    opts.showHelp()
    process.exit(1)
}

let features = []

let content = fs.readFileSync(args.argv[0], 'utf8')

if (tsv_ver == '1') {
    for (let line of content.split('\n')) {
        let a = line.split('\t')
        if (a.length >= 7 && a[5] !== '' && a[6] !== '') {
            features.push(makeFeature(...a))
        }
    }
}
else {
    var last_no
    var lon, lat, elev, yamareco, yamap_typ, yamap, listinfo
    var name
    
    for (let line of content.split('\n')) {
        //console.error(">> " + line)
        let a = line.split('\t')
        if (a.length < 3) continue

        let no = parseInt(a[0])

        if (last_no && no != last_no) {
            flush(last_no, name, lon, lat, elev, yamareco, yamap, yamap_typ)
            name = undefined
        }
        
        switch (a[1]) {
        case "D":
            let peakcorrection
            [lon, lat, elev, yamareco, yamap_typ, yamap, listinfo, peakcorrection] = a.splice(2)
            //console.error("|>" + [no, lon, lat].join(" "))
            break
        case "N":
        case "N1":
        case "N2":
            if (!name)
                name = a[2]
            else
                name = name + "(" + a[2] + ")"
            break
        default:
            console.error("Unknwon type " + a[1])
        }

        last_no = no
    }

    if (name) {
        flush(last_no, name, lon, lat, elev, yamareco, yamap, yamap_typ)
    }
}

function flush(no, name, lon, lat, elev, yamareco, yamap, yamap_typ) {
    //console.error("flush: " + [no, name, lon, lat, yamap, yamap_typ].join(" "))
    let yamareco_url = (yamareco && yamareco !== '-') ? `https://www.yamareco.com/modules/yamainfo/ptinfo.php?ptid=${yamareco}` : ""
    let yamap_url = ""
    if (yamap && yamap !== '-') {
        let pt = YAMAP_PT_TYPE[parseInt(yamap_typ)]
        yamap_url = `https://yamap.com/${pt}/${yamap}`
    }
    features.push(makeFeature(no - 10000 + 1, name, elev, yamareco_url, yamap_url, lat, lon))
}

console.log(JSON.stringify({"type": "FeatureCollection", "features": features}, null, 2))
