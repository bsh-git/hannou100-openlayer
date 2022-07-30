/// -*- coding: utf-8 -*-
// view Hannou 100 mountains using openlayers.
//
//import './style.css'
//import javascriptLogo from './javascript.svg'

import GeoJSON from 'ol/format/GeoJSON';
import Map from 'ol/Map';
import View from 'ol/View';
import XYZ from 'ol/source/XYZ';
import {fromLonLat, toLonLat} from 'ol/proj';
import {Attribution, defaults as defaultControls} from 'ol/control';
import {Circle, Fill, RegularShape, Stroke, Style} from 'ol/style';
import Overlay from 'ol/Overlay'
import {Vector as VectorSource} from 'ol/source';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import {Pointer as PointerInteraction, defaults as defaultInteractions,} from 'ol/interaction';
import {toStringHDMS} from 'ol/coordinate';

const GEOJSONFILE = 'hannou100.geojson'

const image = new RegularShape({
    radius: 12,
    points: 3,
    fill: new Fill({color: [255, 0, 0, 0.6]}),
    stroke: null,
})

const styles = {
    'Point': new Style({image: image}),
}

const styleFunction = function (feature) {
  return styles[feature.getGeometry().getType()];
};


const popup = new Overlay({
    element: document.getElementById('popup')
})

const attribution = new Attribution({
    collapsible: true,
});

function readJson() {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type','text/json; charset=UTF-8');

    fetch(GEOJSONFILE, myHeaders)
        .then(response => response.json())
        .then(json => {
            let vectorSource = new VectorSource({
                features: new GeoJSON().readFeatures(json)
            });

            map.addLayer(new VectorLayer({
                source: vectorSource,
//                style: styleFunction,
                style: new Style({
                    image: image
                })
            }))
        })
}

class Inspection extends PointerInteraction {
  constructor() {
    super({
      handleDownEvent: handleDownEvent,
//      handleDragEvent: handleDragEvent,
      handleMoveEvent: handleMoveEvent,
//      handleUpEvent: handleUpEvent,
    });

    /**
     * @type Coordinate
     * @private
     */
    this.coordinate_ = null;

    /**
     * @type {string|undefined}
     * @private
     */
    this.cursor_ = 'pointer';

    /**
     * @type {Feature}
     * @private
     */
    this.feature_ = null;

    /**
     * @type {string|undefined}
     * @private
     */
    this.previousCursor_ = undefined;
  }
}

/**
 * @param evt Event.
 */
function handleMoveEvent(evt) {
    if (this.cursor_) {
        const map = evt.map;
        const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
            return feature;
        });
        const element = evt.map.getTargetElement();
        if (feature) {
            if (element.style.cursor != this.cursor_) {
                this.previousCursor_ = element.style.cursor;
                element.style.cursor = this.cursor_;
            }
            let name = feature.get('name')
            let number = feature.get('number')

            document.getElementById('mtname').innerHTML = `${number}. ${name}`

        } else {
            document.getElementById('mtname').innerHTML = ""

            if (this.previousCursor_ !== undefined) {
                element.style.cursor = this.previousCursor_;
                this.previousCursor_ = undefined;
            }
        }

        let hdms = toStringHDMS(toLonLat(evt.coordinate), 2);
        document.getElementById('coordinate').innerHTML = hdms
    }
}

/**
 * @param evt Event.
 */
function handleDownEvent(evt) {
    const map = evt.map;
    const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
        return feature;
    });
    const element = popup.getElement()

    $(element).popover('dispose')
    if (feature) {
        let number = feature.get('number')
        let name = feature.get('name')
        let alt = feature.get('altitude')
        let lat = feature.get('latitude')
        let lon = feature.get('longitude')

        let urls = ""
        let u = feature.get('url1')
        if (u) {
            urls += `<a href="${u}" target="_blank">Yamareco</a> `
        }
        u = feature.get('url2')
        if (u) {
            urls += `<a href="${u}" target="_blank">Yamap</a>`
        }

        popup.setPosition(evt.coordinate)
        $(element).popover({
            container: element,
            placement: 'top',
            html: true,
            title: `${number} ${name}`,
            content: `${alt} m<br>北緯 ${lat}<br>東経 ${lon}<br>${urls}`
        })
        $(element).popover('show')
    }
    return false
}


var map = new Map({
    target: 'map',
    renderer: ['canvas', 'dom'],
    interactions: defaultInteractions().extend([new Inspection()]),
    layers: [
        new TileLayer({
            source: new XYZ({
                //        url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                url: "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",
                attributions: '<ul><li><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAA3NCSVQICAjb4U/gAAAACXBIWXMAAAHGAAABxgEXwfpGAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAhNQTFRF////AP//AICAgP//AFVVQECA////K1VVSbbbYL/fJ05idsTYJFtbbcjbJllmZszWWMTOIFhoHlNiZszTa9DdUcHNHlNlV8XRIVdiasrUHlZjIVZjaMnVH1RlIFRkH1RkH1ZlasvYasvXVsPQH1VkacnVa8vWIVZjIFRjVMPQa8rXIVVkXsXRsNveIFVkIFZlIVVj3eDeh6GmbMvXH1ZkIFRka8rWbMvXIFVkIFVjIFVkbMvWH1VjbMvWIFVlbcvWIFVla8vVIFVkbMvWbMvVH1VkbMvWIFVlbcvWIFVkbcvVbMvWjNPbIFVkU8LPwMzNIFVkbczWIFVkbsvWbMvXIFVkRnB8bcvW2+TkW8XRIFVkIlZlJVloJlpoKlxrLl9tMmJwOWd0Omh1RXF8TneCT3iDUHiDU8LPVMLPVcLPVcPQVsPPVsPQV8PQWMTQWsTQW8TQXMXSXsXRX4SNX8bSYMfTYcfTYsfTY8jUZcfSZsnUaIqTacrVasrVa8jTa8rWbI2VbMvWbcvWdJObdcvUdszUd8vVeJaee87Yfc3WgJyjhqGnitDYjaarldPZnrK2oNbborW5o9bbo9fbpLa6q9ndrL3ArtndscDDutzfu8fJwN7gwt7gxc/QyuHhy+HizeHi0NfX0+Pj19zb1+Tj2uXk29/e3uLg3+Lh3+bl4uXj4ufl4+fl5Ofl5ufl5ujm5+jmySDnBAAAAFp0Uk5TAAECAgMEBAYHCA0NDg4UGRogIiMmKSssLzU7PkJJT1JTVFliY2hrdHZ3foSFhYeJjY2QkpugqbG1tre5w8zQ09XY3uXn6+zx8vT09vf4+Pj5+fr6/P39/f3+gz7SsAAAAVVJREFUOMtjYKA7EBDnwCPLrObS1BRiLoJLnte6CQy8FLHLCzs2QUG4FjZ5GbcmBDDjxJBXDWxCBrb8aM4zbkIDzpLYnAcE9VXlJSWlZRU13koIeW57mGx5XjoMZEUqwxWYQaQbSzLSkYGfKFSe0QMsX5WbjgY0YS4MBplemI4BdGBW+DQ11eZiymfqQuXZIjqwyadPNoSZ4L+0FVM6e+oGI6g8a9iKNT3o8kVzNkzRg5lgl7p4wyRUL9Yt2jAxVh6mQCogae6GmflI8p0r13VFWTHBQ0rWPW7ahgWVcPm+9cuLoyy4kCJDzCm6d8PSFoh0zvQNC5OjDJhQopPPJqph1doJBUD5tnkbZiUEqaCnB3bTqLTFG1bPn71kw4b+GFdpLElKIzRxxgYgWNYc5SCENVHKeUaltHdXx0dZ8uBI1hJ2UUDgq82CM2MwKeibqAvSO7MCABq0wXEPiqWEAAAAAElFTkSuQmCC"> <li><a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a></ul>'
            })
        }),
    ],
    controls: defaultControls({attribution: false}).extend([attribution]),
    view: new View({
        center: fromLonLat([139.2122, 35.8875]),
        zoom: 12
    })
});

map.addOverlay(popup)

readJson()
