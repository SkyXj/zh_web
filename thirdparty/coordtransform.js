/**
 * Created by Wandergis on 2015/7/8.
 * 提供了百度坐标（BD09）、国测局坐标（火星坐标，GCJ02）、和WGS84坐标系之间的转换
 */
//UMD魔法代码
// if the module has no dependencies, the above pattern can be simplified to
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.coordtransform = factory();
    }
}(this, function () {
    //定义一些常量
    var x_PI = 3.14159265358979324 * 3000.0 / 180.0;
    var PI = 3.1415926535897932384626;
    var a = 6378245.0;
    var ee = 0.00669342162296594323;
    /**
     * 百度坐标系 (BD-09) 与 火星坐标系 (GCJ-02)的转换
     * 即 百度 转 谷歌、高德
     * @param bd_lon
     * @param bd_lat
     * @returns {*[]}
     */
    var bd09togcj02 = function bd09togcj02(bd_lon, bd_lat) {
        var bd_lon = +bd_lon;
        var bd_lat = +bd_lat;
        var x = bd_lon - 0.0065;
        var y = bd_lat - 0.006;
        var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_PI);
        var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_PI);
        var gg_lng = z * Math.cos(theta);
        var gg_lat = z * Math.sin(theta);
        return [gg_lng, gg_lat]
    };

    /**
     * 火星坐标系 (GCJ-02) 与百度坐标系 (BD-09) 的转换
     * 即谷歌、高德 转 百度
     * @param lng
     * @param lat
     * @returns {*[]}
     */
    var gcj02tobd09 = function gcj02tobd09(lng, lat) {
        var lat = +lat;
        var lng = +lng;
        var z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * x_PI);
        var theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * x_PI);
        var bd_lng = z * Math.cos(theta) + 0.0065;
        var bd_lat = z * Math.sin(theta) + 0.006;
        return [bd_lng, bd_lat]
    };

    /**
     * WGS84转GCj02
     * @param lng
     * @param lat
     * @returns {*[]}
     */
    var wgs84togcj02 = function wgs84togcj02(lng, lat) {
        var lat = +lat;
        var lng = +lng;
        if (out_of_china(lng, lat)) {
            return [lng, lat]
        } else {
            var dlat = transformlat(lng - 105.0, lat - 35.0);
            var dlng = transformlng(lng - 105.0, lat - 35.0);
            var radlat = lat / 180.0 * PI;
            var magic = Math.sin(radlat);
            magic = 1 - ee * magic * magic;
            var sqrtmagic = Math.sqrt(magic);
            dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
            dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
            var mglat = lat + dlat;
            var mglng = lng + dlng;
            return [mglng, mglat]
        }
    };

    /**
     * GCJ02 转换为 WGS84
     * @param lng
     * @param lat
     * @returns {*[]}
     */
    var gcj02towgs84 = function gcj02towgs84(lng, lat) {
        var lat = +lat;
        var lng = +lng;
        if (out_of_china(lng, lat)) {
            return [lng, lat]
        } else {
            var dlat = transformlat(lng - 105.0, lat - 35.0);
            var dlng = transformlng(lng - 105.0, lat - 35.0);
            var radlat = lat / 180.0 * PI;
            var magic = Math.sin(radlat);
            magic = 1 - ee * magic * magic;
            var sqrtmagic = Math.sqrt(magic);
            dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
            dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
            var mglat = lat + dlat;
            var mglng = lng + dlng;
            return [lng * 2 - mglng, lat * 2 - mglat]
        }
    };

    var transformlat = function transformlat(lng, lat) {
        var lat = +lat;
        var lng = +lng;
        var ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
        ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(lat * PI) + 40.0 * Math.sin(lat / 3.0 * PI)) * 2.0 / 3.0;
        ret += (160.0 * Math.sin(lat / 12.0 * PI) + 320 * Math.sin(lat * PI / 30.0)) * 2.0 / 3.0;
        return ret
    };

    var transformlng = function transformlng(lng, lat) {
        var lat = +lat;
        var lng = +lng;
        var ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
        ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(lng * PI) + 40.0 * Math.sin(lng / 3.0 * PI)) * 2.0 / 3.0;
        ret += (150.0 * Math.sin(lng / 12.0 * PI) + 300.0 * Math.sin(lng / 30.0 * PI)) * 2.0 / 3.0;
        return ret
    };

    /**
     * 判断是否在国内，不在国内则不做偏移
     * @param lng
     * @param lat
     * @returns {boolean}
     */
    var out_of_china = function out_of_china(lng, lat) {
        var lat = +lat;
        var lng = +lng;
        // 纬度3.86~53.55,经度73.66~135.05
        return !(lng > 73.66 && lng < 135.05 && lat > 3.86 && lat < 53.55);
    };

    return {
        bd09togcj02: bd09togcj02,
        gcj02tobd09: gcj02tobd09,
        wgs84togcj02: wgs84togcj02,
        gcj02towgs84: gcj02towgs84
    }
}));
var PDBaiduTile = {
    tileTransform_old: function (x, y, z) {
        var WIDTH = 40075016.685578488; //40075264
        var xPoint1 = x / Math.pow(2, z) * WIDTH;//Math.pow(x, z) * this._width / Math.pow(2, z);
        var xPoint2 = (x+1) / Math.pow(2, z) * WIDTH;
        var yPoint1 = y / Math.pow(2, z) * WIDTH;
        var yPoint2 = (y+1) / Math.pow(2, z) * WIDTH;

        var trans = transformPoint(xPoint1, yPoint1);
        xPoint1 = trans.x;
        yPoint1 = trans.y;
        trans = transformPoint(xPoint2, yPoint2);
        xPoint2 = trans.x;
        yPoint2 = trans.y;

        var xTile1 = xPoint1 / (Math.pow(2, 18-z)) / 256;
        var yTile1 = yPoint1 / (Math.pow(2, 18-z)) / 256;
        var xTile2 = xPoint2 / (Math.pow(2, 18-z)) / 256;
        var yTile2 = yPoint2 / (Math.pow(2, 18-z)) / 256;
        return [{x: xTile1, y: yTile1}, {x: xTile2, y: yTile2}];
        function transformPoint(x, y) {
            x = x - WIDTH / 2;
            y = 0 - y + WIDTH / 2;
            return {x: x, y: y};
        }
    },
    tileTransform: function (x, y, z) {
        //1 6370996.81 2 6378137,6356752.3142
        var R = 6378137; //
        var R2 = 6340752.3142;
        var CONST = 2*Math.PI*R/256/Math.pow(2, 18);// 0.597170781195163726806640625; //0.2985853905975818634033203125;
        var CONST2 = 2*Math.PI*R2/256/Math.pow(2, 18);//0.75;
        var trans = transformPoint(x, y, z);
        var x1 = trans.x*CONST;
        var y1 = trans.y*CONST2;

        trans = transformPoint(x + 1, y + 1, z);
        var x2 = trans.x*CONST;
        var y2 = trans.y*CONST2;
        return [{x: parseFloat(x1), y: parseFloat(y1)}, {x: parseFloat(x2), y: parseFloat(y2)}];

        function transformPoint(x, y, z) {
            //return {x: x - Math.pow(2, z), y: 0 - y + Math.pow(2, z - 1)};
            return {x: x - Math.pow(2, z - 1), y: 0 - y + Math.pow(2, z - 1)};
        }
    },
    getNumberOfXTilesAtLevel : function (level) {
        var r = 0;
        var CONST = 20037508.34; //半个周长
        if (level > 0){
            var countHalf = CONST / Math.pow(2, 18 - level) / 256;
            r = Math.ceil(countHalf) * 2;
        }else{
            r = 1;
        }
        return r;
    },
    getNumberOfYTilesAtLevel: function (level) {
        var r = 0;
        var CONST = 20037508.34; //半个周长
        if (level > 0){
            var countHalf = CONST / Math.pow(2, 18 - level) / 256;
            r = Math.ceil(countHalf) * 2;
        }else{
            r = 1;
        }
        return r;
    },
    tileBaiduToNormal: function (old, level) {
        if (level == 0)
            return;
        if (old.x != undefined){
            var c = this.getNumberOfXTilesAtLevel(level);
            old.x = old.x + c / 2;
            old.y = 0 - old.y + c / 2 - 1;
        }
    },
    tileNormalToBaidu: function (old, level) {
        if (level == 0)
            return;
        if (old.x != undefined){
            var c = this.getNumberOfXTilesAtLevel(level);
            old.x = old.x - c / 2;
            old.y = 0 - old.y + c /2 - 1;
        }
    }
}
var PD_old = false;
var PDProjection = function (es) {
    Cesium.WebMercatorProjection.call(this, es);
    this.project = function (cartographic, result) {
        var r;
        if (PD_old){
            r = this.__proto__.project(cartographic, result);
        }else{
            var res = TileLnglatTransform.TileLnglatTransformBaidu.lnglattoPoint(cartographic.longitude, cartographic.latitude);
            r = new Cesium.Cartesian3(res.pointX, res.pointY, cartographic.height);
        }
        //console.log('project' + JSON.stringify(cartographic) + '=>' + JSON.stringify(r));
        return r;
    }
    this.unproject = function (cartesian, result) {
        var r;
        if (PD_old){
            r = this.__proto__.unproject(cartesian, result);
        }else{
            var res = TileLnglatTransform.TileLnglatTransformBaidu.pointToLnglat(cartesian.x, cartesian.y);
            res.lng *= (Math.PI/180);
            res.lat *= (Math.PI/180);
            r = new Cesium.Cartographic(res.lng, res.lat, cartesian.z);
        }
        //console.log('unproject' + JSON.stringify(cartesian) + '=>' + JSON.stringify(r));
        return r;
    }
}
if (PD_old)
    PDProjection.prototype = new Cesium.WebMercatorProjection();
var pdProjection = new PDProjection(Cesium.Ellipsoid.WGS84);

var PDTilingScheme = function (options) {
    //Cesium.WebMercatorTilingScheme.call(this, options);
    {
        options = Cesium.defaultValue(options, {});

        this._ellipsoid = Cesium.defaultValue(options.ellipsoid, Cesium.Ellipsoid.WGS84);

        this._numberOfLevelZeroTilesX = Cesium.defaultValue(options.numberOfLevelZeroTilesX, 1);
        this._numberOfLevelZeroTilesY = Cesium.defaultValue(options.numberOfLevelZeroTilesY, 1);

        this._projection = pdProjection;//new PDProjection(this._ellipsoid);//new WebMercatorProjection(this._ellipsoid);

        if (Cesium.defined(options.rectangleSouthwestInMeters) &&
            Cesium.defined(options.rectangleNortheastInMeters)) {
            this._rectangleSouthwestInMeters = options.rectangleSouthwestInMeters;
            this._rectangleNortheastInMeters = options.rectangleNortheastInMeters;
        } else {
            var semimajorAxisTimesPi = this._ellipsoid.maximumRadius * Math.PI;
            this._rectangleSouthwestInMeters = new Cesium.Cartesian2(-semimajorAxisTimesPi, -semimajorAxisTimesPi);
            this._rectangleNortheastInMeters = new Cesium.Cartesian2(semimajorAxisTimesPi, semimajorAxisTimesPi);
        }

        var southwest = this._projection.unproject(this._rectangleSouthwestInMeters);
        var northeast = this._projection.unproject(this._rectangleNortheastInMeters);
        this._rectangle = new Cesium.Rectangle(southwest.longitude, southwest.latitude,
            northeast.longitude, northeast.latitude);
    }
    this.getNumberOfXTilesAtLevel = function (level) {
        var r = 0;
        if (PD_old){
            r = this.__proto__.getNumberOfXTilesAtLevel.call(this, level);
        }else{
            r = PDBaiduTile.getNumberOfXTilesAtLevel(level);
        }
        //console.log('getNumberOfXTilesAtLevel ' + level + ' ' + r);
        return r;

    }
    this.getNumberOfYTilesAtLevel = function (level) {
        var r = 0;
        if (PD_old){
            r = this.__proto__.getNumberOfYTilesAtLevel.call(this, level);
        }else{
            r = PDBaiduTile.getNumberOfYTilesAtLevel(level);
        }
        //console.log('getNumberOfYTilesAtLevel ' + level + ' ' + r);
        return r;
    }
    this.positionToTileXY = function (position, level, result) {
        var r;
        var pos;
        if (PD_old){
            pos = position;
            r = this.__proto__.positionToTileXY(position, level, result);
        }else{
            pos = {lng: position.longitude/Math.PI*180, lat: position.latitude/Math.PI*180};
            r = TileLnglatTransform.TileLnglatTransformBaidu.lnglatToTile(pos.lng, pos.lat, level);
            if (!Cesium.defined(result)){
                r = new Cesium.Cartesian2(r.tileX, r.tileY);
                PDBaiduTile.tileBaiduToNormal(r, level);
            }else{
                result.x = r.tileX;
                result.y = r.tileY;
                r = result;
                PDBaiduTile.tileBaiduToNormal(r, level);
            }
        }
        //console.log('positionToTileXY ' + JSON.stringify(r) + ' <= ' + JSON.stringify(pos) + ' level:'+level);
        return r;
    }
    this.rectangleToNativeRectangle = function (rectangle, result) {
        var p = PDCommon.Clone(rectangle);
        var r;
        if (PD_old) {
            r = this.__proto__.rectangleToNativeRectangle(rectangle, result);
        }else{
            var west_south = TileLnglatTransform.TileLnglatTransformBaidu.lnglatToPoint(rectangle.west * Math.PI / 180, rectangle.south * Math.PI / 180);
            var east_north = TileLnglatTransform.TileLnglatTransformBaidu.lnglatToPoint(rectangle.east * Math.PI / 180, rectangle.north * Math.PI / 180);
            if (!Cesium.defined(result)) {
                r = new Cesium.Rectangle(west_south.pointX, west_south.pointY, east_north.pointX, east_north.pointY);
            }else{
                result.west = west_south.pointX;
                result.south = west_south.pointY;
                result.east = east_north.pointX;
                result.north = east_north.pointY;
                r = result;
            }
        }
        //console.log('rectangleToNativeRectangle '+JSON.stringify(p)+' => '+JSON.stringify(r));
        return r;
    }
    this.tileXYToNativeRectangle = function (x, y, level, result){
        var r;
        if (PD_old){
            r = this.__proto__.tileXYToNativeRectangle(x, y, level, result);
        }else{
            var res = this.tileXYToRectangle(x, y, level);
            res.west /= (Math.PI / 180);
            res.south /= (Math.PI / 180);
            res.east /= (Math.PI / 180);
            res.north /= (Math.PI / 180);
            var west_south = TileLnglatTransform.TileLnglatTransformBaidu.lnglatToPoint(res.west, res.south);
            var east_north = TileLnglatTransform.TileLnglatTransformBaidu.lnglatToPoint(res.east, res.north);
            if (!Cesium.defined(result)) {
                r = new Cesium.Rectangle(west_south.pointX, west_south.pointY, east_north.pointX, east_north.pointY);
            }else{
                result.west = west_south.pointX;
                result.south = west_south.pointY;
                result.east = east_north.pointX;
                result.north = east_north.pointY;
                r = result;
            }
        }
        //console.log('tileXYToNativeRectangle '+level+','+x+','+y+' => '+JSON.stringify(r));
        return r;
    }
    this.tileXYToRectangle = function (x, y, level, result){
        var trans = {x:x, y:y};
        PDBaiduTile.tileNormalToBaidu(trans, level);
        var r;
        if (PD_old){
            r = this.__proto__.tileXYToRectangle(x, y, level, result);
        }else{
            var west_south = TileLnglatTransform.TileLnglatTransformBaidu.pixelToLnglat(0, 0, trans.x, trans.y, level);
            var east_north = TileLnglatTransform.TileLnglatTransformBaidu.pixelToLnglat(0, 0, trans.x+1, trans.y + 1, level);
            if (level == 0){
                west_south.lng = -180;
                west_south.lat = -90;
                east_north.lng = 180;
                east_north.lat = 90;
            } else if (level == 1){
                var i = 0;
            }
            west_south.lng = this._convertLng(west_south.lng);
            west_south.lat = this._convertLat(west_south.lat);
            east_north.lng = this._convertLng(east_north.lng);
            east_north.lat = this._convertLat(east_north.lat);
            if (!Cesium.defined(result)) {
                r = new Cesium.Rectangle(west_south.lng, west_south.lat, east_north.lng, east_north.lat);
            }else{
                result.west = west_north.lng;
                result.south = east_south.lat;
                result.east = east_south.lng;
                result.north = west_north.lat;
                r = result;
            }
        }
        //console.log('tileXYToRectangle '+level+','+x+','+y+' => '+JSON.stringify(r));
        return r;
    }
    this._convertLng = function (degree) {
        return fit(degree, -180, 180) * Math.PI / 180;
        function fit(a, b, c) {
            b != null && (a = Math.max(a, b));
            c != null && (a = Math.min(a, c));
            return a
        }
        /*function fit(a, b, c) {
         //return a;
         for (; a > c;) a -= c - b;
         for (; a < b;) a += c - b;
         return a
         }*/
    }
    this._convertLat = function (degree) {
        return fit(degree, -90, 90) * Math.PI / 180;
        function fit(a, b, c) {
            b != null && (a = Math.max(a, b));
            c != null && (a = Math.min(a, c));
            return a
        }
    }
}

if (PD_old)
    PDTilingScheme.prototype = new Cesium.WebMercatorTilingScheme();
var pdTilingScheme = new PDTilingScheme();
pdTilingScheme.ellipsoid = pdTilingScheme._ellipsoid;
pdTilingScheme.rectangle = pdTilingScheme._rectangle;
pdTilingScheme.projection = pdTilingScheme._projection;
/*
function GoogleToBaidu (){
    var baiduX = [0, 0, 1, 3, 6, 12, 24, 49, 98, 197, 395, 790, 1581,
        3163, 6327, 12654, 25308, 50617 ];
    var baiduY = [0, 0, 0, 1, 2, 4, 9, 18, 36, 73, 147, 294, 589,
        1178, 2356, 4712, 9425, 18851 ];
    var googleX = [ 0, 1, 3, 7, 13, 26, 52, 106, 212, 425, 851, 1702,
        3405, 6811, 13623, 27246, 54492, 107917 ];
    var googleY = [ 0, 0, 1, 2, 5, 12, 23, 47, 95, 190, 380, 761,
        1522, 3045, 6091, 12183, 24366, 47261 ];


}
*/
/**
 * 转换瓦片
 * @param dir
 * @param zoom
 */
/*
private static void execute(File dir, int zoom){
    if (dir.isDirectory()) {
        File[] xfs = dir.listFiles();
        for (int i = 0; i < xfs.length; i++) {
            File xf = xfs[i];
            if (xf.isDirectory()) {
                File[] yfs = xf.listFiles();//Y轴为瓦片文件,先替换文件再替换文件夹
                for (int j = 0; j < yfs.length; j++) {
                    File yf = yfs[j];
                    String yName = yf.getName();
                    String path = yf.getParent();
                    String fileType = yName.replaceAll("\\d", "");
                    if (yf.isFile()
                        && yName.matches("^\\d+\\.(png|jpg){1}$")) {//只有png和jpg后缀的文件才替换
                        int newY = googleToBaiduY(Integer.valueOf(yName
                            .replaceAll("\\D", "")), zoom);
                        File yNew = new File(path + File.separator
                            + newY + fileType);
                        yf.renameTo(yNew);
//							System.out.println(yName + "to"
//									+ yNew.getName());
                    }
                }
                int nX = googleToBaiduX(Integer.valueOf(xf.getName()), zoom);
                File newX = new File(xf.getParent() + File.separator
                    + nX);
                xf.renameTo(newX);//X轴为文件夹
                // System.out.println(xf.getName()+"to"+newX.getName());
            }
        }
    }
}
private static int googleToBaiduX(int x, int z) {
    int b = baiduX[z - 1];// 395
    int g = googleX[z - 1];// 11:843,12:1685
    // int gx = g + (x-b);// --- 1587+
    int gx = x - g + b;// --- 1587+
    // 谷歌瓦片行编号=[谷歌参照瓦片行编号+(百度行编号 – 百度参照瓦片行编号)]
    return gx;
}

private static int googleToBaiduY(int y, int z) {
    int b = baiduY[z - 1];// 147
    int g = googleY[z - 1];// 10:
    // int gy = g - (y-b);//
    int gy = g + b - y;//
    // 谷歌瓦片列编号=[谷歌参照瓦片列编号- (百度列编号 – 百度参照瓦片列编号)] //向上，列为递减
    return gy;
}
}
*/