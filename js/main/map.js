var PDMap = {};
PDMap.source = {};
PDMap.source.qq = {
    name: "腾讯",
    satellite:[
        //影像地图
        new Cesium.UrlTemplateImageryProvider({
            //http://p2.map.gtimg.com/sateTiles/14/843/635/13489_10161.jpg?version=229
            //http://p3.map.gtimg.com/maptilesv2/18/13383/9245/214130_147931.png?version=20130701 z  /  Math.Floor(x / 16.0)  / Math.Floor(y / 16.0) / x_y.png
            url : 'http://p0.map.gtimg.com/sateTiles/{z}/{x_check}/{y_check}/{x2}_{y2}.jpg?version=229&{tag}',
            subdomains: ['p0','p1','p2','p3'],
            layer: "qqdtImageLayer",
            style: "default",
            format: "image/jpeg",
            tileMatrixSetID: "GoogleMapsCompatible",
            maximumLevel: 3,
            maximumLevel: 18,
            customTags:{
                "x_check": function (obj, x, y, z) {
                    var res = PDMap.source.qq.tileTransform(obj, x, y, z);
                    return Math.floor(res.x / 16.0);
                },
                "y_check": function (obj, x, y, z) {
                    var res = PDMap.source.qq.tileTransform(obj, x, y, z);
                    return Math.floor(res.y / 16.0);
                }
                , "x2": function (obj, x, y, z) {
                    var res = PDMap.source.qq.tileTransform(obj, x, y, z);
                    return res.x;
                }
                ,"y2": function (obj, x, y, z) {
                    var res = PDMap.source.qq.tileTransform(obj, x, y, z);
                    return res.y;
                }
                ,"tag": function (obj, x, y, z) {
                    return z+'-'+x+'-'+y;
                }
            }
        }),
        //中文标记
        new Cesium.UrlTemplateImageryProvider({
            //http://rt0.map.gtimg.com/tile?z=11&x=1683&y=1269&styleid=2&version=255
            url: 'http://rt2.map.gtimg.com/tile?z={z}&x={x2}&y={y2}&styleid=2&version=255',
            subdomains: ['rt0','rt1','rt2','rt3'],
            layer: "qqdtImage2Layer",
            style: "default",
            format: "image/jpeg",
            tileMatrixSetID: "GoogleMapsCompatible",
            maximumLevel: 18,
            customTags:{
                "x2": function (obj, x, y, z) {
                    var res = PDMap.source.qq.tileTransform(obj, x, y, z);
                    return res.x;
                }
                ,"y2": function (obj, x, y, z) {
                    var res = PDMap.source.qq.tileTransform(obj, x, y, z);
                    return res.y;
                }
            }
        })
    ],
    tileTransform: function (obj, x, y, z) {
        return {x:x, y:parseInt( Math.pow(2, z)) - 1 - y};
    },
    transform: function (x, y) {
        var res = coordtransform.wgs84togcj02(x, y);
        if (res)
            return {x: res[0], y:res[1]};
        else
            return {x: x, y: y};
    }
};

PDMap.source.tianditu = {
    name: "国家测绘中心",
    normal: [
        //全球矢量地图服务
        new Cesium.WebMapTileServiceImageryProvider({
            url: "http://t0.tianditu.com/vec_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=vec&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=2459a62bf2fa27e00142b4419de9dcb8",
            layer: "tdtVecBasicLayer",
            style: "default",
            format: "image/jpeg",
            tileMatrixSetID: "GoogleMapsCompatible"
        }),
        //全球矢量中文注记
        new Cesium.WebMapTileServiceImageryProvider({
            url: "http://t0.tianditu.com/cva_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cva&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=2459a62bf2fa27e00142b4419de9dcb8",
            layer: "tdtAnnoLayer",
            style: "default",
            format: "image/jpeg",
            tileMatrixSetID: "GoogleMapsCompatible"
        })
    ],
    satellite:[
        //全球影像地图服务
        new Cesium.WebMapTileServiceImageryProvider({
            url: "http://t0.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=2459a62bf2fa27e00142b4419de9dcb8",
            layer: "tdtBasicLayer",
            style: "default",
            format: "image/jpeg",
            tileMatrixSetID: "GoogleMapsCompatible"
        }),
        //全球影像中文注记
        new Cesium.WebMapTileServiceImageryProvider({
            url: "http://t0.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=2459a62bf2fa27e00142b4419de9dcb8",
            layer: "tdtImageMarkLayer",
            style: "default",
            format: "image/jpeg",
            tileMatrixSetID: "GoogleMapsCompatible"
        })
    ]
};

PDMap.source.google = {
    name: "谷歌", //用太极乐下载，记得是TMS瓦片数据,不要选谷歌啊，百度啊
    offline:[
        //影像地图
        {
            //http://p2.map.gtimg.com/sateTiles/14/843/635/13489_10161.jpg?version=229
            //http://p3.map.gtimg.com/maptilesv2/18/13383/9245/214130_147931.png?version=20130701 z  /  Math.Floor(x / 16.0)  / Math.Floor(y / 16.0) / x_y.png
            //url : 'http://map.polar-day.com/pdlocalpath/mapdata_google?z={z}&x={x}&y={y}',
            url : 'http://map.polar-day.com/pdlocalpath/file?f={dir}/{z}/{x}/{y}.png',
            layer: "qqdtImageLayer",
            style: "default",
            format: "image/png",
            tileMatrixSetID: "GoogleMapsCompatible",
            show: false,
            maximumLevel: 18,
        }
    ],
    tileTransform: function (obj, x, y, z) {
        return {x:x, y:y};
    },
    transform: function (x, y) {
        var res = coordtransform.wgs84togcj02(x, y);
        if (res)
            return {x: res[0], y:res[1]};
        else
            return {x: x, y: y};
    }
};



/*
type=web 地图   http://shangetu0.map.bdimg.com/it/u=x=101237;y=37702;z=19;v=017;type=web&fm=44&udt=20130712
type=sate 卫星图  http://shangetu1.map.bdimg.com/it/u=x=101237;y=37702;z=19;v=009;type=sate&fm=46&udt=20130506
路网：http://online0.map.bdimg.com/tile/?qt=tile&x=101237&y=37702&z=19&styles=sl&v=017&udt=20130712
实时交通信息：http://its.map.baidu.com:8002/traffic/TrafficTileService?level=19&x=99052&y=20189&time=1373790856265&label=web2D&v=017
三维：http://d3.map.baidu.com/resource/mappic/bj/2/3/lv2/1251,1143.jpg?v=001
*/
//http://online1.map.bdimg.com/onlinelabel/?qt=tile&x=49310&y=10242&z=18
//http://online2.map.bdimg.com/tile/?qt=tile&x=790&y=294&z=12&styles=pl&udt=20140613   3~18
PDMap.source.baidu = {
    name: "百度",
    normal:[
        new Cesium.UrlTemplateImageryProvider({
            url : 'http://online1.map.bdimg.com/onlinelabel/?qt=tile&x={x2}&y={y2}&z={z}&p={p}',
            layer: "qqdtImageLayer",
            style: "default",
            format: "image/png",
            tileMatrixSetID: "GoogleMapsCompatible",
            tilingScheme: pdTilingScheme,//new PDTilingScheme({numberOfLevelZeroTilesX:0,numberOfLevelZeroTilesY:0}),
            minimumLevel: 3,
            maximumLevel: 18,
            tileWidth: 256,
            tileHeight: 256,
            customTags:{
                "x2": function (obj, x, y, z) {
                    var res = {x: x, y:y};
                    PDBaiduTile.tileNormalToBaidu(res, z);
                    return res.x;
                },
                "y2": function (obj, x, y, z) {
                    var res = {x: x, y:y};
                    PDBaiduTile.tileNormalToBaidu(res, z);
                    return res.y;
                },
                "p": function (obj, x, y, z) {
                    return x+'-'+y;
                }
            }
        }),
    ],
    offline:[
        /*
        {
            url : 'http://map.polar-day.com/pdlocalpath/file?f={dir}/{tile}_baidu',
            layer: "qqdtImageLayer",
            style: "default",
            format: "image/jpg",
            tileMatrixSetID: "GoogleMapsCompatible",
            minimumLevel: 3,
            maximumLevel: 18,
            tileWidth: 256,
            tileHeight: 254,
            tilingScheme: pdTilingScheme,
            customTags:{
                "tile": function (obj, x, y, z) {
                    var R = 6378137;
                    var CONST = 2*Math.PI*R/256/Math.pow(2, 18);
                    var zoom = 256/CONST;

                    var tile = PDMap.source.baidu.tileTransform(obj, x, y, z);
                    var imgLeftTop = {x:Math.floor(tile[0].x), y:Math.floor(tile[0].y), src:{}, dest:{}};
                    var imgRightTop = {x:Math.floor(tile[1].x), y:Math.floor(tile[0].y), src:{}, dest:{}};
                    var imgLeftBottom = {x:Math.floor(tile[0].x), y:Math.floor(tile[1].y), src:{}, dest:{}};
                    var imgRightBottom = {x:Math.floor(tile[1].x), y:Math.floor(tile[1].y), src:{}, dest:{}};

                    var images = [];
                    //imgLeftTop = {x:Math.floor(tile[0].x), y:Math.floor(tile[0].y)};
                    imgLeftTop.src.left = tile[0].x - imgLeftTop.x;
                    imgLeftTop.src.top =  1 - (tile[0].y - imgLeftTop.y);
                    imgLeftTop.dest = {x:0, y:0};
                    if (imgLeftTop.x < imgRightTop.x) {//编号跨图了
                        imgLeftTop.src.right = 1;
                        imgRightTop.src = {left: 0, right: tile[1].x - imgRightTop.x, top:imgLeftTop.src.top};
                    }else{
                        imgLeftTop.src.right = tile[1].x - imgLeftTop.x;
                    }
                    if (imgLeftTop.y > imgLeftBottom.y) {//跨图了
                        imgLeftTop.src.bottom = 1;
                        imgLeftBottom.src = {top: 0, bottom: 1 - (tile[1].y - imgLeftBottom.y), left: imgLeftTop.src.left};
                    }else{
                        imgLeftTop.src.bottom = 1 - (tile[1].y - imgLeftTop.y);
                    }

                    if (imgRightTop.src.left != undefined) {
                        imgRightTop.src.bottom = imgLeftTop.src.bottom;
                        imgRightTop.dest = {x:imgLeftTop.src.right - imgLeftTop.src.left, y: 0};
                    }
                    if (imgLeftBottom.src.top != undefined){
                        imgLeftBottom.src.right = imgLeftTop.src.right;
                        imgLeftBottom.dest = {x: 0, y: imgLeftTop.src.bottom - imgLeftTop.src.top};
                    }
                    if (imgRightTop.src.left != undefined && imgLeftBottom.src.top != undefined){
                        imgRightBottom.src = {left: imgRightTop.src.left, right: imgRightTop.src.right, top: imgLeftBottom.src.top, bottom: imgLeftBottom.src.bottom};
                        imgRightBottom.dest = {x: imgLeftBottom.src.right - imgLeftBottom.src.left, y: imgRightTop.src.bottom - imgRightTop.src.top};
                    }

                    imgLeftTop = zoom_size(imgLeftTop);
                    imgRightTop = zoom_size(imgRightTop);
                    imgLeftBottom = zoom_size(imgLeftBottom);
                    imgRightBottom = zoom_size(imgRightBottom);
                    function zoom_size(img) {
                        if (img.src.left == undefined)
                            return img;
                        img.dest.width = (img.src.right - img.src.left)*zoom;
                        img.dest.height = (img.src.bottom - img.src.top)*zoom;
                        img.dest.x *= zoom;
                        img.dest.y *= zoom;

                        img.src.left *= 256;
                        img.src.right *= 256;
                        img.src.top *= 256
                        img.src.bottom *= 256;

                        return img;
                    }
                    var images = [];
                    if (imgLeftTop.src.left != undefined) images.push(imgLeftTop);
                    if (imgRightTop.src.left != undefined) images.push(imgRightTop);
                    if (imgLeftBottom.src.left != undefined) images.push(imgLeftBottom);
                    if (imgRightBottom.src.left != undefined) images.push(imgRightBottom);

                    var width = (tile[1].x - tile[0].x)*zoom;
                    var height = (tile[0].y - tile[1].y)*zoom;
                    var str = JSON.stringify({z:z,x:x,y:y, images: images, width: width, height: height});
                    //console.log(z+','+x+','+y+',['+(tile[1].x - tile[0].x)+','+(tile[0].y - tile[1].y)+'] '+tile[0].x + '_' + tile[0].y + '_' + tile[1].x + '_' + tile[1].y);
                    return encodeURIComponent(str);
                }
            }
        }*/
        {
            //用太乐下载，记得是百度瓦片格式,不要选其它格式
            url : 'http://map.polar-day.com/pdlocalpath/file?f={dir}/{z}/{x2}/{y2}.png',
            layer: "qqdtImageLayer",
            style: "default",
            format: "image/png",
            tileMatrixSetID: "GoogleMapsCompatible",
            tilingScheme: pdTilingScheme,
            minimumLevel:3,
            maximumLevel: 18,
            customTags:{
                "x2": function (obj, x, y, z) {
                    var res = {x: x, y:y};
                    PDBaiduTile.tileNormalToBaidu(res, z);
                    return res.x;
                },
                "y2": function (obj, x, y, z) {
                    var res = {x: x, y:y};
                    PDBaiduTile.tileNormalToBaidu(res, z);
                    return res.y;
                },
                "p": function (obj, x, y, z) {
                    return x+'-'+y;
                }
            }
        }
    ],
    tileTransform: function (obj, x, y, z) {
        var tile = PDBaiduTile.tileTransform(x, y, z);
        return tile;
    },
    transform: function (x, y) {
        var res = coordtransform.wgs84togcj02(x, y);
        if (res) {
            res = coordtransform.gcj02tobd09(res[0], res[1]);
            if (res)
                return {x: res[0], y: res[1]};
        }
        return {x: x, y: y};
    }
};
/*PDMap.source.gaode = {
 name: "高德", //用太极乐下载，记得是TMS瓦片数据,不要选谷歌啊，百度啊
 offline:[

 {
 url : 'http://map.polar-day.com/pdlocalpath/file?f={dir}/{z}/{x}/{y}.jpg',
 layer: "qqdtImageLayer",
 style: "default",
 format: "image/jpeg",
 tileMatrixSetID: "GoogleMapsCompatible",
 show: false,
 maximumLevel: 18,
 }
 ],
 tileTransform: function (obj, x, y, z) {
 return {x:x, y:y};
 },
 transform: function (x, y) {
 var res = coordtransform.wgs84togcj02(x, y);
 if (res)
 return {x: res[0], y:res[1]};
 else
 return {x: x, y: y};
 }
 };*/

/*mapbox.streets
 mapbox.light
 mapbox.dark
 mapbox.satellite
 mapbox.streets-satellite
 mapbox.wheatpaste
 mapbox.streets-basic
 mapbox.comic
 mapbox.outdoors
 mapbox.run-bike-hike
 mapbox.pencil
 mapbox.pirates
 mapbox.emerald
 mapbox.high-contrast*/
/*PDMap.source.mapbox = {
    name: 'MpaBox',
    satellite:[
        new Cesium.MapboxImageryProvider({
            mapId: 'satellite',
            accessToken: 'pk.eyJ1Ijoia2luZ2Z1biIsImEiOiJjamNscjg0aWcwZ2R5MndxcWRsNm5tbXZjIn0.k3f0AGnfkluGjMwIruJaIA'
        })
    ]

}*/

