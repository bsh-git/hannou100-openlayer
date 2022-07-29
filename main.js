/// -*- coding: utf-8 -*-
// view Hannou 100 mountains using openlayers.
//
//import './style.css'
//import javascriptLogo from './javascript.svg'

import GeoJSON from 'ol/format/GeoJSON';
import Map from 'ol/Map';
import View from 'ol/View';
import XYZ from 'ol/source/XYZ';
import {fromLonLat} from 'ol/proj';
import {Attribution, defaults as defaultControls} from 'ol/control';
import {Circle, Stroke, Style} from 'ol/style';
import {Vector as VectorSource} from 'ol/source';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';

const image = new Circle({
    radius: 10,
    fill: null,
    stroke: new Stroke({color: 'red', width: 3}),
})

const styles = {
    'Point': new Style({image: image}),
}

const styleFunction = function (feature) {
  return styles[feature.getGeometry().getType()];
};

const Hannou100 = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": fromLonLat([
                    139.1011111111111,
                    35.86527777777778
                ])
            },
            "properties": {
                "name": "\u65e5\u5411\u6ca2\u306e\u5cf0",
                "altitude": "1356"
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": fromLonLat([
                    139.11583333333334,
                    35.88638888888889
                ])
            },
            "properties": {
                "name": "\u6709\u9593\u5c71",
                "altitude": "1214"
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": fromLonLat([
                    139.10833333333332,
                    35.875
                ])
            },
            "properties": {
                "name": "\u4ec1\u7530\u5c71",
                "altitude": "1211"
            }
        },

    ]
}


const vectorSource = new VectorSource({
    features: new GeoJSON().readFeatures(Hannou100)
})

const attribution = new Attribution({
    collapsible: true,
});

var map = new Map({
    target: 'map',
    renderer: ['canvas', 'dom'],
    layers: [
        new TileLayer({
            source: new XYZ({
                //        url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                url: "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",
                attributions: '<ul><li><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAA3NCSVQICAjb4U/gAAAACXBIWXMAAAHGAAABxgEXwfpGAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAhNQTFRF////AP//AICAgP//AFVVQECA////K1VVSbbbYL/fJ05idsTYJFtbbcjbJllmZszWWMTOIFhoHlNiZszTa9DdUcHNHlNlV8XRIVdiasrUHlZjIVZjaMnVH1RlIFRkH1RkH1ZlasvYasvXVsPQH1VkacnVa8vWIVZjIFRjVMPQa8rXIVVkXsXRsNveIFVkIFZlIVVj3eDeh6GmbMvXH1ZkIFRka8rWbMvXIFVkIFVjIFVkbMvWH1VjbMvWIFVlbcvWIFVla8vVIFVkbMvWbMvVH1VkbMvWIFVlbcvWIFVkbcvVbMvWjNPbIFVkU8LPwMzNIFVkbczWIFVkbsvWbMvXIFVkRnB8bcvW2+TkW8XRIFVkIlZlJVloJlpoKlxrLl9tMmJwOWd0Omh1RXF8TneCT3iDUHiDU8LPVMLPVcLPVcPQVsPPVsPQV8PQWMTQWsTQW8TQXMXSXsXRX4SNX8bSYMfTYcfTYsfTY8jUZcfSZsnUaIqTacrVasrVa8jTa8rWbI2VbMvWbcvWdJObdcvUdszUd8vVeJaee87Yfc3WgJyjhqGnitDYjaarldPZnrK2oNbborW5o9bbo9fbpLa6q9ndrL3ArtndscDDutzfu8fJwN7gwt7gxc/QyuHhy+HizeHi0NfX0+Pj19zb1+Tj2uXk29/e3uLg3+Lh3+bl4uXj4ufl4+fl5Ofl5ufl5ujm5+jmySDnBAAAAFp0Uk5TAAECAgMEBAYHCA0NDg4UGRogIiMmKSssLzU7PkJJT1JTVFliY2hrdHZ3foSFhYeJjY2QkpugqbG1tre5w8zQ09XY3uXn6+zx8vT09vf4+Pj5+fr6/P39/f3+gz7SsAAAAVVJREFUOMtjYKA7EBDnwCPLrObS1BRiLoJLnte6CQy8FLHLCzs2QUG4FjZ5GbcmBDDjxJBXDWxCBrb8aM4zbkIDzpLYnAcE9VXlJSWlZRU13koIeW57mGx5XjoMZEUqwxWYQaQbSzLSkYGfKFSe0QMsX5WbjgY0YS4MBplemI4BdGBW+DQ11eZiymfqQuXZIjqwyadPNoSZ4L+0FVM6e+oGI6g8a9iKNT3o8kVzNkzRg5lgl7p4wyRUL9Yt2jAxVh6mQCogae6GmflI8p0r13VFWTHBQ0rWPW7ahgWVcPm+9cuLoyy4kCJDzCm6d8PSFoh0zvQNC5OjDJhQopPPJqph1doJBUD5tnkbZiUEqaCnB3bTqLTFG1bPn71kw4b+GFdpLElKIzRxxgYgWNYc5SCENVHKeUaltHdXx0dZ8uBI1hJ2UUDgq82CM2MwKeibqAvSO7MCABq0wXEPiqWEAAAAAElFTkSuQmCC"> <li><a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a></ul>'
            })
        }),
        new VectorLayer({
            source: vectorSource,
            style: styleFunction,
        }),
    ],
    controls: defaultControls({attribution: false}).extend([attribution]),
    view: new View({
        center: fromLonLat([139.1011, 35.8653]),
        zoom: 15
    })
});


