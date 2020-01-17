//new Cesium.UrlTemplateImageryProvider();

var dataCount = 0;
// xj add 专为html定制 *****************************start***********************************
function test(){
    //setname
    AdapterOnCmd({'cmd':'SetName','dev_id':'100','dev_name':'voc走航','data':['TVOC浓度','丁烯浓度']});
    AdapterOnCmd({'cmd':'SetName','dev_id':'100','dev_name':'voc走航','data':['TVOC浓度']});
    $.get("js/main/zh_real.json", function (data) {
        var i=0;
        var interval=setInterval(function () {
            i++;
            // console.log('定时运行：' + i + '次')
            var point={'cmd':'AddPoint','dev_id':'100','data':{'time':'2020-01-09 13:50:11','lng':'113','lat':'23','values':[1100,1500]}};
            // var point={'cmd':'AddPoint','dev_id':'100','data':{'time':'2020-01-09 13:50:11','lng':'113','lat':'23','values':[700]}};
            point.data.lng=data[i].lng;
            point.data.lat=data[i].lat;
            point.data.time=data[i].time;
            // point.data.values=[data[i].values[0].value*100];
            AdapterOnCmd(point);
            if(i==10){
                clearInterval(interval);
            }
        }, 500)      

        // data.slice(0,5).forEach(element => {
        //     var point={'cmd':'AddPoint','dev_id':'100','data':{'time':'2020-01-09 13:50:11','lng':'113','lat':'23','values':[113]}};
        //     point.data.lng=element.lng;
        //     point.data.lat=element.lat;
        //     point.data.time=element.time;
        //     point.data.values=[element.values[0].value*100];
        //     AdapterOnCmd(point);
        // });
    }, "json");
}

test();
// xj add 专为html定制 *****************************start***********************************



function AdapterOnCmd(cmd) {
    setTimeout(action, 200);
    function action() {
        var $scope = $('[ng-controller=all]').scope();
        if (!$scope){
            setTimeout(action, 500);
            return;
        }
        //console.info(cmd);
        if (cmd.cmd == 'Start'){
            //$scope.settings.cur_source = cmd.data['map'];
            $scope.navigateTo(cmd.data['lng'], cmd.data['lat']);
            $scope.$apply();
        } else if (cmd.cmd == 'SetName'){
            if (PDDrawer.setDevice(cmd["dev_id"], cmd["dev_name"], cmd['data'])){
                $scope.shape.push({
                    name: cmd["dev_name"],
                    no: cmd["dev_id"],
                    show: true
                });
            }
        } else if (cmd.cmd == 'AddPoint'){
            if ($scope.settings.area[$scope.area].mode == PDConfig.const.MODE_REALTIME){
                $("#mytest").append(cmd['dev_id']+":"+ cmd.data['time']+":TVOC:"+ cmd.data['values'][0]);
                $("#mytest").append("</br>");
                var ret = PDDrawer.addDevicePoint(cmd['dev_id'], cmd.data['time'], cmd.data['lng'], cmd.data['lat'], cmd.data['values']);
                if (ret &&  ret.length == 2 && ret.shape){
                    //debugger;
                    PDDrawer.autoFit([ret.shape]);
                }
                if (ret &&  ret.shape){
                    var found = false;
                    for (var i = 0; i < $scope.shape.length; i ++){
                        if ($scope.shape[i].no == ret.shape.no){
                            found = true;
                            break;
                        }
                    }
                    if (!found){
                        $scope.shape.push({
                            no: ret.shape.no,
                            name: ret.shape.name,
                            show: true
                        });
                    }
                }
            }
        } else if (cmd.cmd == 'AddExceptionPoint'){
            if (cmd['data'])
                AddExceptionPoint(cmd['dev_id'], cmd['data']);
        } else if (cmd.cmd == 'AddExceptionInfo'){
            if (cmd['data'])
                AddExceptionInfo(cmd['data']);
        }
    }

}
function onCloseDialog() {
    $scope = $('[ng-controller=all]').scope();
    $scope.clickDialogClose();
    $scope.$apply();
}
function onShapeChange(settings, file) {
    $scope = $('[ng-controller=all]').scope();
    if (file){
        onSettingsChange(settings);
        setTimeout(function () {
            $scope.onLoadFile(file, function (success) {
            });
            $scope.$apply();
        }, 10);
    }else{
        onSettingsChange(settings);
    }
}
function onColorChange(settings) {
    var $scope = $('[ng-controller=all]').scope();
    delete $scope.settings.area[$scope.area].material_single; //合并时如果数组减少，是不删除的
    onSettingsChange(settings);

    setTimeout(function(){
        var $scope = $('[ng-controller=all]').scope();
        var val = $scope.settings;
        PDDrawer.setMaterial(val.area[$scope.area].material, val.area[$scope.area].alpha, undefined, val.area[$scope.area].material_single);
        $scope.refreshAllShape();
    }, 20); // onSettingsChange 10毫秒后才生效，所以要等20毫秒
}
function onFactory(cmd, file) {
    PDContextMenu.onFactoryData(cmd, file);
}
function onArea(cmd, file) {
    var $scope = $('[ng-controller=all]').scope();
    PDMainArea.onAreaData($scope, cmd, file);
}
function onWind(cmd, file) {
    PDContextMenu.onWindData(cmd, file);
}

function onSettingsChange(settings) {
    $scope = $('[ng-controller=all]').scope();
    setTimeout(function () {
        $scope.onSettingsChange(settings);
        $scope.$apply();
    }, 10);
}
var app = angular.module('map', ['PDMenu']);
app.controller('all', function ($scope){
    //return;
    if (PDTools.getQuery(window.location.href, 'area') == '1')
        $scope.area = 1;
    else
        $scope.area = 0;

    $scope.color_settings_show = false;

    $scope.settings = PDCommon.getData('settings');
    $scope.settings = PDConfig.default($scope.settings, $scope.area);

    $scope.settings.area[$scope.area].mode = PDConfig.const.MODE_REALTIME;
    for (var i in $scope.settings.area[$scope.area].material){
        $scope.settings.area[$scope.area].material[i].has = false;
        $scope.settings.area[$scope.area].material[i].show = true;
    }
    PDConfig.resetSettings($scope.settings, $scope.area);
    if ($scope.settings.material){
        for (var i in $scope.settings.material)
        $scope.settings.material[i].colorString = $scope.settings.material[i].colorString.replace(/#/g, '');
    }

    $scope.sources = [];
    for (var i in PDMap.source ) {
        if (PDMap.source[i].satellite)
            $scope.sources.push({
                name: PDMap.source[i].name,
                sate: true,
                transform: PDMap.source[i].transform,
                provider: PDMap.source[i].satellite
            });
        if (PDMap.source[i].normal)
            $scope.sources.push({
                name: PDMap.source[i].name,
                sate: false,
                transform: PDMap.source[i].transform,
                provider: PDMap.source[i].normal
            });
    }
    for (var i in PDMap.source ) {
        if (PDMap.source[i].offline){
            for (var j in PDMap.source[i].offline){
                var url = PDMap.source[i].offline[j].url;
                url = url.replace(/\{dir\}/g, encodeURIComponent($scope.settings.map_offline_dir));
                PDMap.source[i].offline[j].url = url;
                PDMap.source[i].offline[j] = new Cesium.UrlTemplateImageryProvider(PDMap.source[i].offline[j]);
            }

            $scope.sources.push({
                name: PDMap.source[i].name,
                offline: true,
                transform: PDMap.source[i].transform,
                provider: PDMap.source[i].offline
            });
        }
    }

    var viewer = new Cesium.Viewer('cesiumContainer',{
        baseLayerPicker:false,
        timeline:false,
        homeButton:false,//归位
        fullscreenButton:false,
        scene3DOnly: true,
        sceneMode : Cesium.SceneMode.SCENE3D,
        sceneModePicker:false, //2D 3D切换
        infoBox:false,
        navigationInstructionsInitiallyVisible:false,
        navigationHelpButton:false,
        geocoder:false,
        shouldAnimate:true,
        animation: false,
        selectionIndicator:false, //是否显示选中地图元素标识控件
        //projectionPicker: true
        //imageryProvider : $scope.settings.sources[0].provider[0]//mapbox//providerImage
    });
    PDDrawer.setViewer(viewer);
    ////////////////
    //显示坐标
    /*$scope.lastHeadingPitchRoll = undefined;
    var handler = new Cesium.ScreenSpaceEventHandler(PDDrawer.getViewer().scene.canvas);
    handler.setInputAction(function (movement) {
        var cartesian = PDDrawer.getViewer().scene.camera.pickEllipsoid(movement.endPosition, ellipsoid);
        var ellipsoid = PDDrawer.getViewer().scene.globe.ellipsoid;
        if (cartesian) { //能获取，显示坐标
            var cartographic = ellipsoid.cartesianToCartographic(cartesian);
            $scope.lastDesnation = cartographic;
            //var coords = '经度' + Cesium.Math.toDegrees(cartographic.longitude).toFixed(2) + ', ' + '纬度' + Cesium.Math.toDegrees(cartographic.latitude).toFixed(2) + ' '
            //    + '高度' + Math.ceil(PDDrawer.getViewer().camera.positionCartographic.height);
            //console.log(coords);
        } else { //不能获取不显示
            $scope.lastDesnation = undefined;
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE );*/
    //PDDrawer.getViewer().scene.screenSpaceCameraController.enableTranslate = false;
    //PDDrawer.getViewer().scene.screenSpaceCameraController.maximumMovementRatio = 0.8;

    PDDrawer.getViewer().camera.moveEnd.addEventListener(function() {
        var pitch = Cesium.Math.toDegrees(PDDrawer.getViewer().camera.pitch);
        if (pitch > -5 && PDDrawer.getViewer().entities){
            PDDrawer.getViewer().zoomTo(PDDrawer.getViewer().entities);
        }
    });
    $scope.clickTest = function () {
        PDDrawer.getViewer().camera.lookUp();
    };
    //////////////
    $scope.$watch('settings', function (val, valOld, $scope) {
        if (val.cur_source != valOld.cur_source){
            if ($scope.area = 0)
                onSourceChange(4, valOld.cur_source);
            else
                onSourceChange(2, valOld.cur_source);
//onSourceChange(val.cur_source, valOld.cur_source);
        }
        /*if (val.data_file != valOld.data_file){
            if (PDCommon.FileExists2(val.data_file)){
                try{
                    loadDataFromFile(val.data_file);
                }catch (e){
                    PDTools.notify('失败：'+e);
                }
            }
        }*/
        var need_fresh = false;
        var areaNew = val.area[$scope.area];
        var areaOld = valOld.area[$scope.area];
        if (val.area[$scope.area].shape != valOld.area[$scope.area].shape){
            console.log('char+++++++++++++++++++'+val.area[$scope.area].shape);
            if (val.area[$scope.area].shape != undefined){
                PDDrawer.setMaterial(undefined, undefined, val.area[$scope.area].shape);
                need_fresh = true;
            }
        }
        if (val.area[$scope.area].mode != valOld.area[$scope.area].mode){
            var mode = val.area[$scope.area].mode;
            setTimeout(function () { //直接在这儿操作splice会失败，可能angulajs对array进行了拦截操作
                if (!$scope.shape) $scope.shape = [];
                if (mode == PDConfig.const.MODE_REALTIME){
                    for (var i = 0; i < $scope.shape.length; i ++){
                        if ($scope.shape[i].file){
                            PDDrawer.removeShape($scope.shape[i].no);
                            $scope.shape.splice(i, 1);
                            i --;
                        }
                    }
                } else {
                    for (var i = 0; i < $scope.shape.length; i ++){
                        if (!$scope.shape[i].file){
                            PDDrawer.removeShape($scope.shape[i].no);
                            $scope.shape.splice(i, 1);
                            i --;
                        }
                    }
                }
            }, 10);
        }
        if (areaNew.show){
            if (!areaOld.show || areaNew.show.zoom != areaOld.show.zoom){
                PDDrawer.setAspectRatioWhileFileMode(areaNew.show.aspect_ratio_enable?areaNew.show.aspect_ratio:0);
                PDDrawer.setZoom(areaNew.show.zoom);
                need_fresh = true;
            }
            if (!areaOld.show || areaNew.show.aspect_ratio_enable != areaOld.show.aspect_ratio_enable || areaNew.show.aspect_ratio != areaOld.show.aspect_ratio){
                PDDrawer.setAspectRatioWhileFileMode(areaNew.show.aspect_ratio_enable?areaNew.show.aspect_ratio:0);
                need_fresh = true;
            }
            if (!areaOld.show || areaNew.show.view_fit_enable != areaOld.show.view_fit_enable || areaNew.show.view_fit_angle1 != areaOld.show.view_fit_angle1
                || areaNew.show.view_fit_angle2 != areaOld.show.view_fit_angle2 ){

                if (areaNew.show.view_fit_enable){
                    var heading = parseFloat(areaNew.show.view_fit_angle2);
                    var pitch = 0 - parseFloat(areaNew.show.view_fit_angle1);
                    PDDrawer.getViewer().camera.setView({
                        //destination : cartesianPosition,
                        orientation: {
                            heading : Cesium.Math.toRadians(heading), // east, default value is 0.0 (north)
                            pitch : Cesium.Math.toRadians(pitch),    // default value (looking down)
                            roll : 0.0                             // default value
                        }
                    });
                }
            
                PDDrawer.setAuoFitParam(areaNew.show.view_fit_enable, areaNew.show.view_fit_angle1, areaNew.show.view_fit_angle2);
            }
        }
        /***********************/
        PDDrawer.setShapeParam(areaNew.shape_dot_width, areaNew.shape_path_width, areaNew.shape_path_color);
        if (areaNew.shape == PDConfig.const.SHAPE_PATH &&
            (areaNew.shape_path_color != areaOld.shape_path_color || areaNew.shape_path_width != areaOld.shape_path_width)
        ){
            need_fresh = true;
        }
        if (areaNew.shape == PDConfig.const.SHAPE_DOT && areaNew.shape_dot_width != areaOld.shape_dot_width){
            need_fresh = true;
        }
        if (need_fresh){
            $scope.refreshAllShape();
        }
        /***********************/
        if (areaNew.wind != areaOld.wind || areaNew.wind.width != areaOld.wind.width || areaNew.wind.height != areaOld.wind.height
            || areaNew.wind.length_min != areaOld.wind.length_min || areaNew.wind.length_ratio != areaOld.wind.length_ratio){
                PDContextMenu.freshWind();
        }
        /***********************/
        if (areaNew.animate.enable_elapse != areaOld.animate.enable_elapse || areaNew.animate.elapse != areaOld.animate.elapse){
            PDDrawer.updateLoadingAnimate(areaNew.animate.enable_elapse?areaNew.animate.elapse:0);
        }
        if (areaNew.animate.show_vehicle != areaOld.animate.show_vehicle){
            PDDrawer.updateShow(undefined, areaNew.animate.show_vehicle);
        }

    }, true);
    function onSourceChange(index, old) {
        if (index > $scope.sources.length - 1)
            return;

        var cur_area = $scope.settings.area[$scope.area];

        PDDrawer.updateLoadingAnimate(cur_area.animate.enable_elapse?cur_area.animate.elapse:0);
        PDDrawer.setMaterial(cur_area.material, cur_area.alpha, cur_area.shape, cur_area.material_single);
        PDDrawer.setAspectRatioWhileFileMode(cur_area.show.aspect_ratio_enable?cur_area.show.aspect_ratio:0);
        PDDrawer.setAuoFitParam(cur_area.show.view_fit_enable, cur_area.show.view_fit_angle1, cur_area.show.view_fit_angle2);
        PDDrawer.setZoom(cur_area.map_zoom);
        PDDrawer.setFunPosTransform($scope.sources[$scope.settings.cur_source].transform);
        PDDrawer.updateShow(undefined, cur_area.animate.show_vehicle);
        PDDrawer.setFunUpdateMaterial(function (material, material_single_only) {
            if (material != undefined){
                var count = 0;
                for (var i in material){
                    if (material[i].has && material[i].show)
                        count ++;
                }
                if (count > 1){
                    $scope.materials_color_all_show = true;
                    $scope.materials_color_single_show = false;
                }

                $scope.settings.area[$scope.area].material = material;
                PDConfig.resetSettings($scope.settings, $scope.area);
            }
            if (material_single_only != undefined){
                if (material_single_only && cur_area.material_single.show){
                    $scope.materials_color_all_show = false;
                    $scope.materials_color_single_show = true;
                }
                else{
                    $scope.materials_color_all_show = true;
                    $scope.materials_color_single_show = false;
                }
            }
            $scope.$apply();
        });

        PDDrawer.getViewer().imageryLayers.removeAll(true);
        for (var i = 0; i < $scope.sources[index].provider.length; i ++){
            PDDrawer.getViewer().imageryLayers.addImageryProvider($scope.sources[index].provider[i]);
        }
        
        
        
        /*PDDrawer.getViewer().imageryLayers.addImageryProvider(new Cesium.TileCoordinatesImageryProvider(
            {
                //tilingScheme: pdTilingScheme
                tilingScheme: new Cesium.WebMercatorTilingScheme()
            }
        ));*/
        /*PDDrawer.getViewer().imageryLayers.addImageryProvider(new Cesium.TileCoordinatesImageryProvider(
            {
                //tilingScheme: pdTilingScheme,
                color: Cesium.Color.RED,
                tilingScheme: new Cesium.WebMercatorTilingScheme()
            }
        ));*/
    }
    var entityNavigationImage;
    var source = PDTools.getQuery(window.location.href, 'map');
    if (source == '')
        source = 0;
    else
        source = parseInt(source);
    $scope.settings.cur_source = source;
    onSourceChange(source, -1);
    
    
    $scope.onSettingsChange = function (settings) {
        PDCommon.Change($scope.settings, settings);
        PDConfig.resetSettings($scope.settings, $scope.area);
    }
    $scope.onLoadFile = function (file, cb) {
        loadDataFromFile(file, cb);
    }
    function loadDataFromFile(file, cb) {
        function test() {
            function computeCircle(radius) {
                var positions = [];
                for (var i = 0; i < 360; i++) {
                    var radians = Cesium.Math.toRadians(i);
                    positions.push(new Cesium.Cartesian2(
                        radius * Math.cos(radians), radius * Math.sin(radians)));
                }
                return positions;
            }

            function computeStar(arms, rOuter, rInner) {
                var angle = Math.PI / arms;
                var length = 2 * arms;
                var positions = new Array(length);
                for (var i = 0; i < length; i++) {
                    var r = (i % 2) === 0 ? rOuter : rInner;
                    positions[i] = new Cesium.Cartesian2(
                        Math.cos(i * angle) * r, Math.sin(i * angle) * r);
                }
                return positions;
            }
            function computeHot(radius) {
                var positions = [];
                for (var i = 0; i < 360; i++) {
                    var radians = Cesium.Math.toRadians(i);
                    if ( i > 0 && i < 180){
                        positions.push(new Cesium.Cartesian2(radius * Math.cos(radians), radius * Math.sin(radians)));
                    }else{
                        //positions.push(new Cesium.Cartesian2(
                        //    radius * Math.cos(radians), radius * Math.sin(radians)));
                    }

                }
                return positions;
            }
            /*var redEllipse = PDDrawer.getViewer().entities.add({
             name : 'Yellow ellipsoid outline',
             position: Cesium.Cartesian3.fromDegrees(116.0, 39, 10.0),
             ellipsoid : {
             radii : new Cesium.Cartesian3(200000.0, 200000.0, 300000.0),
             fill : true,
             outline : true,
             outlineColor : Cesium.Color.YELLOW,
             slicePartitions : 24, //横向切割线
             stackPartitions : 36  //纵向切割线
             }
             });*/
            var TetrahedronGeometry = function(){
                var negativeRootTwoOverThree = -Math.sqrt(2.0) / 3.0;
                var negativeOneThird = -1.0 / 3.0;
                var rootSixOverThree = Math.sqrt(6.0) / 3.0;

                //四面体的四个顶点
                var positions = new Float64Array(4 * 3);

                // position 0
                positions[0] = 0.0;
                positions[1] = 0.0;
                positions[2] = 1.0;

                // position 1
                positions[3] = 0.0;
                positions[4] = (2.0 * Math.sqrt(2.0)) / 3.0;
                positions[5] = negativeOneThird;

                // position 2
                positions[6] = -rootSixOverThree;
                positions[7] = negativeRootTwoOverThree;
                positions[8] = negativeOneThird;

                // position 3
                positions[9] = rootSixOverThree;
                positions[10] = negativeRootTwoOverThree;
                positions[11] = negativeOneThird;

                var attributes = new Cesium.GeometryAttributes({
                    position : new Cesium.GeometryAttribute({
                        componentDatatype : Cesium.ComponentDatatype.DOUBLE,
                        componentsPerAttribute : 3,
                        values : positions
                    })
                });

                //顶点索引
                var indices = new Uint16Array(4 * 3);

                // back triangle
                indices[0] = 0;
                indices[1] = 1;
                indices[2] = 2;

                // left triangle
                indices[3] = 0;
                indices[4] = 2;
                indices[5] = 3;

                // right triangle
                indices[6] = 0;
                indices[7] = 3;
                indices[8] = 1;

                // bottom triangle
                indices[9] = 2;
                indices[10] = 1;
                indices[11] = 3;

                //包围球
                var boundingSphere = new Cesium.BoundingSphere(new Cesium.Cartesian3(0.0,0.0,0.0),1.0);

                var geometry = Cesium.GeometryPipeline.computeNormal(new Cesium.Geometry({
                    attributes: attributes,
                    indices: indices,
                    primitiveType: Cesium.PrimitiveType.TRIANGLES,
                    boundingSphere: boundingSphere
                }));

                this.attributes = geometry.attributes;
                this.indices = geometry.indices;
                this.primitiveType = geometry.primitiveType;
                this.boundingSphere = geometry.boundingSphere;
                this._workerName = 'createGeometry';
                //this.boundingSphere = Cesium.BoundingSphere.fromVertices(positions);
            };

            var scene = PDDrawer.getViewer().scene;
            var ellipsoid = PDDrawer.getViewer().scene.globe.ellipsoid;

            //模型矩阵
            var result = [];
            var modelMatrix = Cesium.Matrix4.multiplyByUniformScale(
                Cesium.Matrix4.multiplyByTranslation(
                    Cesium.Transforms.eastNorthUpToFixedFrame(ellipsoid.cartographicToCartesian(
                        Cesium.Cartographic.fromDegrees(116.0, 39.0))),
                    new Cesium.Cartesian3(0.0, 0.0, 200000.0), result),
                500000.0, result);

            //四面体的实例
            var instance = new Cesium.GeometryInstance({
                geometry : new TetrahedronGeometry(),
                modelMatrix : modelMatrix,
                attributes : {
                    color : Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.WHITE)    //白色
                }
            });

            //加入场景
            /*scene.primitives.add(new Cesium.Primitive({
             geometryInstances : instance,
             appearance : new Cesium.PerInstanceColorAppearance({
             flat : true,
             translucent : false
             })
             }));*/
            //PDDrawer.getViewer().zoomTo(PDDrawer.getViewer().entities);
            return;
        }

        if (!file || !PDCommon.FileExists2(file)){
            //$scope.navigateTo(116.38, 39.9);
            cb(false);
            return;
        }
        PDCommon.FileRead(file, true, function (res) {
            //PDTools.notify('加载数');
            if (!res || !res.success){
                PDTools.notify('加载数据失败');
                cb(false);
                return;
            }
            var text = res.result.data;
            text = new PDBase64().decode(text, 'utf-8');
            PDTools.showLoading(true, true);
            setTimeout(function () {
                var name = PDTools.getFileName(file);
                if (name.match(/\./))
                    name = name.match(/(.*)\.[^\.]*/)[1];
                PDDrawer.drawNavigationImageFromFile(file, name, text, function (success, no, shapes_remove) {
                    PDTools.showLoading(false, true);
                    if (!success){
                        //PDTools.notify('错误');
                        cb(false);
                        return;
                    }
                    if (!$scope.shape)
                        $scope.shape = [];
                    $scope.shape.push({
                        name: name,
                        file: file,
                        no: no,
                        show: true
                    });
                    if (shapes_remove && shapes_remove.length > 0){
                        for (var i in shapes_remove){
                            PDDrawer.removeShape(shapes_remove[i]);
                            for (var j in $scope.shape){
                                if (shapes_remove[i] == $scope.shape[j].no){
                                    $scope.shape.splice(j, 1);
                                    break;
                                }
                            }
                        }
                    }
                    $scope.$apply();
                    cb(true);
                });
            }, 1000);
        });
    }

    $scope.posInit = {lng:116.38, lat:39.9};
    $scope.navigateTo = function (lng, lat) {
        //viewer.camera.setView({
        //    destination: Cesium.Rectangle.fromDegrees(114.591, -45.837, 148.970, -5.730)
        //});
        $scope.posInit = {lng:lng, lat:lat};
        //con
        if ($scope.sources[$scope.settings.cur_source].transform){
            var ret = $scope.sources[$scope.settings.cur_source].transform(lng, lat);
            lng = ret.x;
            lat = ret.y;
        }
        var pos = [];
        pos.push(lng);
        pos.push(lat - 0.1);
        pos.push(lng);
        pos.push(lat);
        pos.push(lng);
        pos.push(lat + 0.1);

        var entityCity = PDDrawer.getViewer().entities.add({
            name : 'city',
            polyline : {
                //坐标点，不指定高度
                positions : Cesium.Cartesian3.fromDegreesArray(pos),
                material : Cesium.Color.RED,
                width: 0.01,
                show:true
            }
        });
        PDDrawer.getViewer().zoomTo(PDDrawer.getViewer().entities);
        setTimeout(function () {
            if (PDDrawer.getViewer().entities.contains(entityCity))
                PDDrawer.getViewer().entities.remove(entityCity);
        }, 5000);

    }
    $scope.refreshAllShape = function(){
        if ($scope.refreshAllShapeTimer)
            clearTimeout($scope.refreshAllShapeTimer);
        $scope.refreshAllShapeTimer = setTimeout(function(){
            PDDrawer.refresh();
        }, 100);
    }
    Main_InitButtons($scope);
    Main_InitPanels($scope);
    Main_InitMenus($scope);
    Main_InitPointSelect($scope);
    Main_InitAreaSelect($scope);

    $scope.shape = [];
    /*$scope.shape[$scope.shape.length] = {
        name: '大家后阿萨德发射点发',
        file: '',
        no: 1
    };
    $scope.shape[$scope.shape.length] = {
        name: '大家后阿萨德发射点发',
        file: '',
        no: 1
    };*/
    if (false){
        var canvas = PDDrawer.getViewer().scene.canvas;
        var handler = new Cesium.ScreenSpaceEventHandler(canvas);
        handler.setInputAction(function (movement) {
            var ellipsoid = PDDrawer.getViewer().scene.globe.ellipsoid;
            var cartesian = PDDrawer.getViewer().scene.camera.pickEllipsoid(movement.endPosition, ellipsoid);
            if (cartesian) { //能获取，显示坐标
                var cartographic = ellipsoid.cartesianToCartographic(cartesian);
                $scope.mouse_lng_lat.lng = Cesium.Math.toDegrees(cartographic.longitude).toFixed(8);
                $scope.mouse_lng_lat.lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(8);
                $scope.mouse_lng_lat.height = PDDrawer.getViewer().camera.positionCartographic.height;
                var res = coordtransform.wgs84togcj02($scope.mouse_lng_lat.lng, $scope.mouse_lng_lat.lat);
                if (res) {
                    res = coordtransform.gcj02tobd09(res[0], res[1]);
                    $scope.mouse_lng_lat2 = {lng:res[0], lat:res[1]};
                }
            } else { //不能获取不显示
                $scope.mouse_lng_lat = {lng:'-',lat:'-',height:'-'};
            }
            $scope.$apply();
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        $scope.mouse_lng_lat = {};
        $scope.mouse_lng_lat2 = {};
        $scope.mouse_lng_lat = true;
    }
});

