import Projection from 'ol/proj/Projection.js';
import Feature from 'ol/Feature.js';
import { unByKey } from 'ol/Observable.js';
import { easeOut } from 'ol/easing.js';
import Point from 'ol/geom/Point.js';
import VectorLayer from 'ol/layer/Vector.js';
import { fromLonLat } from 'ol/proj.js';
import VectorSource from 'ol/source/Vector.js';
import { Circle as CircleStyle, Fill, Text, Stroke, Style } from 'ol/style.js';
import { toStringXY, createStringXY, format } from 'ol/coordinate';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import { defaults } from 'ol/control/util.js';
import TileLayer from 'ol/layer/Tile.js';
import ImageLayer from 'ol/layer/Image.js';
import TileWMS from 'ol/source/TileWMS.js';
import ImageWMS from 'ol/source/ImageWMS.js';
import Attribution from 'ol/control/Attribution.js';
import Control from 'ol/control/Control.js';
import FullScreen from 'ol/control/FullScreen.js';
import OverviewMap from 'ol/control/OverviewMap.js';
import Rotate from 'ol/control/Rotate.js';
import ScaleLine from 'ol/control/ScaleLine.js';
import MousePosition from 'ol/control/MousePosition.js';
import Zoom from 'ol/control/Zoom.js';
import ZoomSlider from 'ol/control/ZoomSlider.js';
import ZoomToExtent from 'ol/control/ZoomToExtent.js';
import DragZoom from 'ol/interaction/DragZoom.js';
import Draw from 'ol/interaction/Draw.js';
import Overlay from 'ol/Overlay.js';
import RegularShape from 'ol/style/RegularShape.js';
import MultiPoint from 'ol/geom/MultiPoint.js';
import { Cluster } from 'ol/source.js';
//import OLCesium from 'olcs/OLCesium.js';
//import Cesium from '@camptocamp/cesium/Build/Cesium/Cesium.js';
//  window.Cesium = Cesium;
const baseMapMinXY = [-5.4977597552251947, 1.1908671019085781];
const baseMapMaxXY = [-4.4328705800637502, 2.2557562770700228];
//const centerpoint = [-4.90, 1.68];
const centerpoint = [(baseMapMaxXY[0] + baseMapMinXY[0]) / 2, (baseMapMaxXY[1] + baseMapMinXY[1]) / 2];
const waferDiameterBase = 0.3; //30 cm 를 미터로
// 원의 지름 길이가 30 cm 라고 생각할 때 배율을 nano meter 로 환산함 
const mapSizeRatio = waferDiameterBase / (baseMapMaxXY[0] - baseMapMinXY[0]) * 1000000000;
const initZoom = 9;
//const layers = [
//new TileLayer({
//  source: new TileWMS({
//    wrapX: false,
//    url: 'http://localhost:8080/geoserver/wafer/wms',
//    params: {
//      'LAYERS': 'wafer:WaferGroup3',
//      'TILED': true
//    }
//  })
//})
//];

//const layers = [
//    new ImageLayer({
//      source: new ImageWMS({
//        ratio: 1,
//        url: 'http://localhost:8080/geoserver/wafer/wms',
//        params: { 
//          'LAYERS': 'wafer:WaferGroup3',
//          'FORMAT': 'image/png',
//          STYLES: '',    
//          VERSION: '1.1.0'  
//        }
//      })
//    })
//];

//var projection = new Projection({
//  code: 'EPSG:4326',
//  units: 'degrees',
//  axisOrientation: 'neu',
//  global: true
//});
const layers = [
    //        new TileLayer({
    //          source: new TileWMS({
    //              attributions: '© Pixelmap 1:1000000 / Geoserver Cloud',
    ////            crossOrigin: 'anonymous',
    //            params: {
    //              'LAYERS': 'wafer:waferGroup4',
    //              'FORMAT': 'image/png'
    //            },
    //            url: 'http://localhost:8080/geoserver/wafer/wms'
    //          })
    //        })
    //        ,
    new ImageLayer({
        source: new ImageWMS({
            attributions: '© SK Hynix',
            crossOrigin: 'anonymous',
            params: {
                'LAYERS': 'wafer:waferGroup4',
                STYLES: '',
                VERSION: '1.1.0'
            },
            serverType: 'mapserver',
            url: 'http://localhost:8080/geoserver/wafer/wms'
        })
    })
];
// A minimal projection object is configured with only the SRS code and the map
// units. No client-side coordinate transforms are possible with such a
// projection object. Requesting tiles only needs the code together with a
// tile grid of Cartesian coordinates; it does not matter how those
// coordinates relate to latitude or longitude.
const projection = new Projection({
    code: 'EPSG:4326',
    units: 'degrees'
});

var mousePositionControl = new MousePosition({
    className: 'custom-mouse-position',
    target: document.getElementById('location'),
    //coordinateFormat: createStringXY(9),
    coordinateFormat: function (coordinate) {
        var modCoord = [(coordinate[0] - centerpoint[0]) * mapSizeRatio, (coordinate[1] - centerpoint[1]) * mapSizeRatio];
        return format(modCoord, '{x}, {y}', 1);
    },
    undefinedHTML: '&nbsp;'
});

const view = new View({
    projection: projection,
    center: centerpoint,
    zoom: initZoom
})

var map = new Map({
    controls: defaults({
        //          attribution: false
    }).extend([mousePositionControl]),
    layers: layers,
    target: 'map',
    view: view
});
const vsource = new VectorSource({ wrapX: false });
const vector = new VectorLayer({
    source: vsource
});

map.addLayer(vector);
const typeSelect = document.getElementById('type');
let draw; // global so we can remove it later
function addInteraction() {
    const value = typeSelect.value;
    if (value !== 'None') {
        draw = new Draw({
            source: vsource,
            type: typeSelect.value
        });
        map.addInteraction(draw);
    }
}

/**
 * Handle change event.
 */
typeSelect.onchange = function () {
    map.removeInteraction(draw);
    addInteraction();
};

addInteraction();

// 클릭시 초기 위치
function onClick(id, callback) {
    document.getElementById(id).addEventListener('click', callback);
}
onClick('pan-to-centerpoint', function () {
    view.animate({
        center: centerpoint,
        zoom: initZoom,
        duration: 700
    });
    // 팝업 없애기  
    const element = popup.getElement();
    $(element).popover('destroy');
});
// Popup showing the position the user clicked
const popup = new Overlay({
    element: document.getElementById('popup')
});
map.addOverlay(popup);

// 대량 포인트 표출
var iconInfo = [{
    points: 4,
    radius: 3,
    radius2: 0,
    angle: 0
}];

var i;
var iconCount = iconInfo.length;
var icons = new Array(iconCount);
for (i = 0; i < iconCount; ++i) {
    var info = iconInfo[i];
    icons[i] = new RegularShape({
        points: info.points,
        radius: info.radius,
        radius2: info.radius2,
        angle: info.angle,
        fill: new Fill({
            color: 'rgba(255, 0, 0, 0.9)'
        }),
        stroke: new Stroke({
            width: 2,
            color: 'rgba(255, 0, 0, 0.9)'
        }),
    });
}

var vectorSource = new VectorSource();
var vectorLayer = new VectorLayer({
    source: vectorSource,
    style: new Style({
        image: icons[0]
    })
});

var j=1;
document.getElementById('add').addEventListener('click', function (evt) {
    var featureCount = 10;
    var feature, geometry;
    var features = new Array(featureCount);
    for (var k = 0 ; k < featureCount; ++j, k++) {
        var pos = [Math.random() + (-5.45), Math.random() + (1.23)];
        geometry = new Point(pos);
        var feature = new Feature(geometry);
        feature.setProperties({
            'styleId': j
        });
        features[k] = feature;
    }
    vectorSource.addFeatures(features);
});

map.addLayer(vectorLayer);

// 위치 팝업 띄우기 
function defectInfoPop(evt, feature) {
    const element = popup.getElement();
    const coordinate = evt.coordinate;
    const currPos = toStringXY(coordinate);
    var featureInfo = feature.get('styleId');
    var featureCount = feature.get('clusterCount');
    var content;
    if (featureInfo!=null) {
        content = '<p>현재 위치의 결함정보는:</p><code>' + featureInfo + '</code>';
    } else {
        content = '<p>상세정보를 보시려면 Cluster 기능을 해제해 주세요.</p><code>클러스터 묶음: ' + featureCount + '개</code>'
    }
    $(element).popover('destroy');
    popup.setPosition(coordinate);
    $(element).popover({
        placement: 'top',
        animation: false,
        html: true,
        content: content
    });
    $(element).popover('show');
}

map.on('click', function (evt) {
    
    if (typeSelect.value !== 'None') {
        return;
    }
    var info = document.getElementById('info');
    info.innerHTML =
        'Hold on a second, while I catch those defects for you ...';
    window.setTimeout(function () {
        var features = [];
        map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
            features.push(feature);
            return false;
        });
        if (features.length == 1) {
            info.innerHTML = 'Got one defect point!';
            defectInfoPop(evt, features[0]);
        } else if (features.length > 1) {
            info.innerHTML = 'Got ' + features.length + ' Defects';
        } else {
            info.innerHTML = 'Couldn\'t catch a single defect';
        }
    }, 1);
});
map.on('pointermove', function (evt) {
    if (evt.dragging) {
        return;
    }
    var pixel = map.getEventPixel(evt.originalEvent);
    var hit = map.hasFeatureAtPixel(pixel);
    map.getViewport().style.cursor = hit ? 'pointer' : '';
});

// Cluster 기능

var IsCheck = false;
onClick('making-point-group', function () {
 if(IsCheck == true){
   map.removeLayer(clusters)
   map.addLayer(vectorLayer);
   IsCheck = false;
 } else {
   map.removeLayer(vectorLayer)
   map.addLayer(clusters);
   IsCheck = true;
 }
});




const csource = new Cluster({
 distance: 50,
 source: vectorSource
});

const styleCache = {};
const clusters = new VectorLayer({
 source: csource,
 style: function(feature) {
     const size = feature.get('features').length;
     feature.setProperties({
        'clusterCount': size
    });
     let style = styleCache[size];
     if (!style) {

         if (size > 1) {
             style = new Style({
                 image: new RegularShape({
                     points: 4,
                     radius: (size / 5) * 10 + 5,
                     radius2: (size / 5) * 10 + 5,
                     angle: 0,
                     fill: new Fill({
                         color: 'rgba(255, 0, 0, 0.9)'
                     }),
                     stroke: new Stroke({
                         width: 2,
                         color: 'rgba(255, 0, 0, 0.9)'
                     })
                 }),
                 //    radius: (size/5)*10+5,
                 //    stroke: new Stroke({
                 //      color: '#fff'
                 //    }),
                 //    fill: new Fill({
                 //      color: '#C21807'
                 //    })
                 //  }),
                 text: new Text({
                     text: size.toString(),
                     fill: new Fill({
                         color: '#fff'
                     }),
                     stroke: new Stroke({
                         width: 2,
                         color: 'rgba(0,0,0,1)'
                     })
                 })
             });
         } else {
             style = new Style({
                 image: new RegularShape({
                     points: 4,
                     radius: 3,
                     radius2: 0,
                     angle: 0,
                     fill: new Fill({
                         color: 'rgba(255, 0, 0, 0.9)'
                     }),
                     stroke: new Stroke({
                         width: 2,
                         color: 'rgba(255, 0, 0, 0.9)'
                     })
                 })
             });
         }
         styleCache[size] = style;
     }
   return style;
 }
});


//3D 화면 바로가기
onClick('enable', function() {  
  window.open('http://'+location.hostname+':8090/Apps/index3d.html', '3DViewWaferMap');

});