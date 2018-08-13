import Projection from 'ol/proj/Projection.js';

import Feature from 'ol/Feature.js';

import { unByKey } from 'ol/Observable.js';

//import { easeOut } from 'ol/easing.js';

import Point from 'ol/geom/Point.js';

import VectorLayer from 'ol/layer/Vector.js';

//import { fromLonLat } from 'ol/proj.js';

import VectorSource from 'ol/source/Vector.js';

import { Circle as CircleStyle, Fill, Text, Stroke, Style } from 'ol/style.js';

import { toStringXY, createStringXY, format } from 'ol/coordinate';

import Map from 'ol/Map.js';

import View from 'ol/View.js';

import { defaults } from 'ol/control/util.js';

import TileLayer from 'ol/layer/Tile.js';

import ImageLayer from 'ol/layer/Image.js';

//import TileWMS from 'ol/source/TileWMS.js';

import ImageWMS from 'ol/source/ImageWMS.js';

import Attribution from 'ol/control/Attribution.js';

import Control from 'ol/control/Control.js';

//import FullScreen from 'ol/control/FullScreen.js';

import OverviewMap from 'ol/control/OverviewMap.js';

import Rotate from 'ol/control/Rotate.js';

import ScaleLine from 'ol/control/ScaleLine.js';

import MousePosition from 'ol/control/MousePosition.js';

import Zoom from 'ol/control/Zoom.js';

//import ZoomSlider from 'ol/control/ZoomSlider.js';

//import ZoomToExtent from 'ol/control/ZoomToExtent.js';

import DragZoom from 'ol/interaction/DragZoom.js';

import Draw from 'ol/interaction/Draw.js';

import Overlay from 'ol/Overlay.js';

import RegularShape from 'ol/style/RegularShape.js';

import MultiPoint from 'ol/geom/MultiPoint.js';

import { Cluster } from 'ol/source.js';




//import {getCenter} from 'ol/extent.js';




import GeoJSON from 'ol/format/GeoJSON.js';







import { click, pointerMove, altKeyOnly } from 'ol/events/condition.js';

import Select from 'ol/interaction/Select.js';




import DragBox from 'ol/interaction/DragBox.js';

import { platformModifierKeyOnly } from 'ol/events/condition.js';




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

const initZoom = 9.5;










function threeHoursAgo() {

    return new Date(Math.round(Date.now() / 3600000) * 3600000 - 3600000 * 3);

}

//var extent = transformExtent([-126, 24, -66, 50], 'EPSG:4326', 'EPSG:3857');

var startDate = threeHoursAgo();

var frameRate = 0.5; // frames per second

var animationId = null;










//공통




// 객체를 문자열로 변환

function objToString(obj) {

    var str = '';

    for (var p in obj) {

        if (obj.hasOwnProperty(p)) {

            str += p + '::' + obj[p] + '\n';

        }

    }

    return str;

}

// 지정된 범위의 정수 1개를 랜덤하게 반환하는 함수

// n1 은 "하한값", n2 는 "상한값"

function randomRange(n1, n2) {

    return Math.floor((Math.random() * (n2 - n1 + 1)) + n1);

}




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

    //    new TileLayer({

    //          source: new Stamen({

    //            layer: 'terrain'

    //          })

    //    }),

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

            serverType: 'geoserver',

            url: 'http://35.194.126.109:8080/geoserver/wafer/wms'

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

    center: centerpoint,    //getCenter(extent)

    zoom: initZoom

})




var map;

map = new Map({

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

// 포인트 표출 방식1

var vectorLayer = new VectorLayer({

    source: vectorSource,

    style: new Style({

        image: icons[0]

    })

});







var j = 1;

document.getElementById('add').addEventListener('click', function (evt) {

    addDefectPoint(20);

});







document.getElementById('addBulk').addEventListener('click', function (evt) {

    addDefectPoint(100000);

});







function addDefectPoint(defNum) {




    //방식 1

    var feature, geometry;

    var features = new Array(defNum);

    var defPos = new Array(defNum);

    var pos = [0, 0]

    for (let x = 0; x < defNum;) {

        pos = [Math.random() + (-5.45), Math.random() + (1.23)];

        if (Math.pow(pos[0] - centerpoint[0], 2) + Math.pow(pos[1] - centerpoint[1], 2) < r2) {

            defPos[x] = pos;

            x++;

        }

    }



    for (var k = 0; k < defNum; ++j, k++) {

        geometry = new Point(defPos[k]);

        var feature = new Feature(geometry);

        feature.setProperties({

            'styleId': j

        });

        features[k] = feature;

    }

    vectorSource.addFeatures(features);





    //방식 2

    //    var featureCount = defNum;

    //    var features = [];

    //    var geometries = [];

    //    var feature, point;

    //    var pos = [0,0];

    //    

    //    var multiPoint = new MultiPoint(pos,'XY');

    //    geometries.push(multiPoint);

    //    

    //    for (i = 0; i < featureCount; ++i) {

    //        pos = [Math.random() + (-5.45), Math.random() + (1.23)];

    //        if ( Math.pow(pos[0]-centerpoint[0],2) + Math.pow(pos[1]-centerpoint[1],2) < r2 ) {

    //            point = new Point(pos);

    //            geometries[0].appendPoint(point);

    //        }

    //    }

    //

    //        vectorSource.addFeature(new Feature({

    //            geometry: geometries[0],

    //            styleId: 0

    //        }));








}







map.addLayer(vectorLayer);













// 팝업 띄우기 

function defectInfoPop(evt, feature) {

    const element = popup.getElement();

    const coordinate = evt.coordinate;

    const currPos = toStringXY(coordinate);

    var featureInfo = feature.get('styleId');

    var featureCount = feature.get('clusterCount');

    var content;

    if (featureInfo != null) {

        content = '<p>현재 위치의 결함정보는:</p><code>' + featureInfo + '</code>';

    } else if (featureCount != null) {

        content = '<p>상세정보를 보시려면 Cluster 기능을 해제해 주세요.</p><code>클러스터 묶음: ' + featureCount + '개</code>';

    } else {

        return;

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

            for (var i = 0; i < features.length; i++) {

                defectInfoPop(evt, features[i]);

            }

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

    if (IsCheck == true) {

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

    style: function (feature) {

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

onClick('enable', function () {

    window.open('http://' + location.hostname + ':8090/Apps/index3d.html', '3DViewWaferMap');




});







//timeline




function updateInfo() {

    var el = document.getElementById('timeinfo');

    el.innerHTML = startDate.toISOString();

    addDefectPoint(20);

}




// 현재기준 3시간 전부터 15분 간격으로 표출

function setTime() {

    startDate.setMinutes(startDate.getMinutes() + 15);

    if (startDate > Date.now()) {

        startDate = threeHoursAgo();

    }

    //layers[1].getSource().updateParams({'TIME': startDate.toISOString()});

    updateInfo();

}

//setTime();




var stop = function () {

    if (animationId !== null) {

        window.clearInterval(animationId);

        animationId = null;

    }

};




var play = function () {

    stop();

    animationId = window.setInterval(setTime, 1000 / frameRate);

};




var startButton = document.getElementById('play');

startButton.addEventListener('click', play, false);




var stopButton = document.getElementById('pause');

stopButton.addEventListener('click', stop, false);




//updateInfo();













var createDieText = function (feature, resolution) {




    return new Text({

        text: feature.getProperties().dieId,

        fill: new Fill({ color: 'white' }),

    });

}




const defectDieTemp = ['id_10_11', 'id_23_11', 'id_43_16', 'id_41_09', 'id_02_41',

    'id_10_14', 'id_23_21', 'id_43_24', 'id_41_08', 'id_02_37',

    'id_10_21', 'id_23_50', 'id_43_44', 'id_41_10', 'id_02_27',

    'id_10_16', 'id_23_18', 'id_43_33', 'id_41_14', 'id_02_21',

    'id_10_41', 'id_23_05', 'id_43_21', 'id_41_30', 'id_02_33',

    'id_10_31', 'id_23_34', 'id_43_13', 'id_41_40', 'id_02_01',]



var createDieColor = function (feature, resolution, showDefect) {



    if (!showDefect) {

        return new Fill({

            color: 'rgba(0, 0, 255, 0.1)'

        });

    } else {

        // 임의로 지정된 값이 일치하면

        if (defectDieTemp.indexOf(feature.getProperties().dieId) >= 0)

            return new Fill({

                color: 'rgba(0, 0, 0, 0.8)'

            });

        else {

            return new Fill({

                color: 'rgba(0, 0, 255, 0.1)'

            });

        }

    }

}




// DIE 표출



var showDefectDie = false;

function dieStyleFunction(feature, resolution) {

    return [

        /* We are using two different styles for the polygons:
    
         *  - The first style is for the polygons themselves.
    
         *  - The second style is to draw the vertices of the polygons.
    
         *    In a custom `geometry` function the vertices of a polygon are
    
         *    returned as `MultiPoint` geometry, which will be used to render
    
         *    the style.
    
         */

        new Style({

            stroke: new Stroke({

                color: 'blue',

                width: 1

            }),

            text: createDieText(feature, resolution),

            fill: createDieColor(feature, resolution, showDefectDie)

        })

        //    ,

        //    new Style({

        //      image: new CircleStyle({

        //        radius: 1.5,

        //        fill: new Fill({

        //          color: 'orange'

        //        })

        //      }),

        //      geometry: function(feature) {

        //        // return the coordinates of the first ring of the polygon

        //        var coordinates = feature.getGeometry().getCoordinates()[0];

        //        return new MultiPoint(coordinates);

        //      }

        //    })

    ]
};




var geojsonObject = {

    'type': 'FeatureCollection',

    'crs': {

        'type': 'name',

        'properties': {

            'name': 'EPSG:4326'

        }

    },

    'features': [




    ]

};







function addDieItem(dieId, coord, arr) {

    arr.push({

        'type': 'Feature',

        'geometry': {

            'type': 'Polygon',

            'coordinates': [coord]

        },

        'properties': {

            'dieId': dieId,

            'dieName': 'DIE 이름' + dieId,

            'dieAttr1': 'DIE 속성1' + dieId,

            'dieAttr2': 'DIE 속성2' + dieId,

            'dieAttr3': 'DIE 속성3' + dieId,

            'dieAttr4': 'DIE 속성4' + dieId,

            'dieAttr5': 'DIE 속성5' + dieId,

            'dieAttr6': 'DIE 속성6' + dieId,

            'dieAttr7': 'DIE 속성7' + dieId,

            'dieAttr8': 'DIE 속성8' + dieId,

            'dieAttr9': 'DIE 속성9' + dieId,

            'dieAttr10': 'DIE 속성10' + dieId

        }

    });

}




const r2 = Math.pow((baseMapMaxXY[0] - baseMapMinXY[0]) / 2, 2);










function makeDies(dieSizeX, dieSizeY) {

    //좌측 하단부터 그리기 시작

    var adjX = baseMapMinXY[0];  // - centerpoint[0]; //+0.1

    var adjY = baseMapMinXY[1];  //- centerpoint[1];   //+0.1






    for (var i = 0; i < 55; i++) {

        for (var j = 0; j < 55; j++) {

            // x2 + y2 < r2 인 경우만 표시하게 해서 원안에 들어가게 함

            if (Math.pow(adjX - centerpoint[0] + dieSizeX / 2 + dieSizeX * i, 2) + Math.pow(adjY - centerpoint[1] + dieSizeY / 2 + dieSizeY * j, 2) < r2 - dieSizeX) {

                var coord = [[adjX + dieSizeX * i, adjY + dieSizeY * j], [adjX + dieSizeX * i + dieSizeX, adjY + dieSizeY * j],

                [adjX + dieSizeX * i + dieSizeX, adjY + dieSizeY * j + dieSizeY],

                [adjX + dieSizeX * i, adjY + dieSizeY * j + dieSizeY], [adjX + dieSizeX * i, adjY + dieSizeY * j]];




                addDieItem('id_' + i + '_' + j, coord, geojsonObject.features);

                //                   alert(Math.pow(adjX+ dieSizeX*i, 2)+Math.pow(adjY+ dieSizeY*i,2));

            }

        }

    }

}




makeDies(0.02, 0.02);




var dieSource = new VectorSource({

    features: (new GeoJSON()).readFeatures(geojsonObject)

});




var dielayer = new VectorLayer({

    source: dieSource,

    style: dieStyleFunction

});




map.addLayer(dielayer);













// 마우스로 Feature 선택







var select = null; // ref to currently selected interaction




// select interaction working on "singleclick"

var selectSingleClick = new Select();




// select interaction working on "click"

var selectClick = new Select({

    condition: click

});




// select interaction working on "pointermove"

var selectPointerMove = new Select({

    condition: pointerMove

});




var selectAltClick = new Select({

    condition: function (mapBrowserEvent) {

        return click(mapBrowserEvent) && altKeyOnly(mapBrowserEvent);

    }

});




var selectElement = document.getElementById('type2');




var changeInteraction = function () {

    if (select !== null) {

        map.removeInteraction(select);

    }

    var value = selectElement.value;

    if (value == 'singleclick') {

        select = selectSingleClick;

    } else if (value == 'click') {

        select = selectClick;

    } else if (value == 'pointermove') {

        select = selectPointerMove;

    } else if (value == 'altclick') {

        select = selectAltClick;

    } else {

        select = null;

    }

    if (select !== null) {

        map.addInteraction(select);

        select.on('select', function (e) {

            document.getElementById('status').innerHTML = '&nbsp;' +

                e.target.getFeatures().getLength() +

                ' selected features (last operation selected ' + e.selected.length +

                ' and deselected ' + e.deselected.length + ' features)';

            // DIE 정보 보여줌

            //showInfo(e.selected[0].getProperties());  

        });

    }

};







/**

 * onchange callback on the select element.

 */

selectElement.onchange = changeInteraction;

changeInteraction();










// Ctl + Drag 로 multi feature select 




// a normal select interaction to handle click

var selectDrag = new Select();

map.addInteraction(selectDrag);

var selectedFeatures = selectDrag.getFeatures();




// a DragBox interaction used to select features by drawing boxes

var dragBox = new DragBox({

    condition: platformModifierKeyOnly

});




map.addInteraction(dragBox);




dragBox.on('boxend', function () {

    // features that intersect the box are added to the collection of

    // selected features

    var extent = dragBox.getGeometry().getExtent();

    dieSource.forEachFeatureIntersectingExtent(extent, function (feature) {

        selectedFeatures.push(feature);

    });

});




// clear selection when drawing a new box and when clicking on the map

dragBox.on('boxstart', function () {

    selectedFeatures.clear();

    //다른 선택도 다 지움  

    if (select !== null) {

        map.removeInteraction(select);

    }

});




var infoBox = document.getElementById('info');




selectedFeatures.on(['add', 'remove'], function () {

    var names = selectedFeatures.getArray().map(function (feature) {

        return feature.getProperties().dieName;

    });

    var selObjs = selectedFeatures.getArray().map(function (feature) {

        return feature.getProperties();

    });

    if (names.length > 0) {

        infoBox.innerHTML = names.join(', ');

        // 배열 모두 넘어감

        showInfo(selObjs);






    } else {

        infoBox.innerHTML = 'No features selected';

    }

});










// 기능: 마우스 포인터무스시에 정보 보여주기

var infoDie = document.getElementById('infoDie');




function showInfo(selObject) {

    //var features = map.getFeaturesAtPixel(event.pixel);

    if (!selObject) {

        infoDie.innerText = '';

        infoDie.style.opacity = 0;

        return;

    }

    var properties;

    if (selObject.length > 1) {

        for (let i = 0; i < selObject.length; i++) {

            properties += objToString(selObject[i]);

        }



    } else {

        properties = objToString(selObject[0]);

        //        infoDie.innerText = objToString(properties);

        //        infoDie.style.opacity = 1;

    }

    infoDieArea.value = properties;



}







// 리셋, 클리어, 초기화

document.getElementById('reset').addEventListener('click', function (evt) {




    vectorSource.clear();

    vsource.clear();

    showDefectDie = false;

    dielayer.setStyle(dieStyleFunction);



    // 팝업 없애기  

    const element = popup.getElement();

    $(element).popover('destroy');



});




// 특정 DIE 스타일 변경



document.getElementById('changeColor').addEventListener('click', function (evt) {

    showDefectDie = true;

    dielayer.setStyle(dieStyleFunction);

});
