function Main_InitAreaSelect($scope) {
    $scope.area_select = {};
    $scope.area_select.show_selection = false;
    $scope.clickAreaSelect = function () {
        
        var center = {x: $(window).width() / 2, y: $(window).height() / 2};
        var ellipsoid = PDDrawer.getViewer().scene.globe.ellipsoid;
        var cartesian = PDDrawer.getViewer().scene.camera.pickEllipsoid(center, ellipsoid);
        if (cartesian){
            var cartographic = ellipsoid.cartesianToCartographic(cartesian);
            PDDrawer.getViewer().camera.setView({
                //destination : Cesium.Cartesian3.fromDegrees(Cesium.Math.toDegrees(cartographic.longitude), Cesium.Math.toDegrees(cartographic.latitude)),
                orientation: {
                    heading : PDDrawer.getViewer().camera.heading, // east, default value is 0.0 (north)
                    pitch : Cesium.Math.toRadians(-90),    // default value (looking down)
                    roll : 0.0                             // default value
                }
            });
        }else{
            PDTools.notify('请先放大地图');
            return;    
        }

        $scope.area_select.show_selection = true;
        $scope.area_select.for_remove = false;
    }
    $scope.clickAreaSelectForRemove = function () {
        $scope.area_select.show_selection = true;
        $scope.area_select.for_remove = true;
    }

    var pos_start = undefined;
    var pos_end = {x:0, y:0};
    var no = 0;
    $scope.area_select.select = {x:0,y:0,width:0,width:0};
    $scope.area_select.for_remove = false;

    $scope.$watch('area_select.show_selection', function(val, old){
        if (val == true){
            //PDDrawer.getViewer().sceneModePicker.viewModel.morphTo2D();
            //PDDrawer.getViewer().sceneModePicker.viewModel.sceneMode = Cesium.SceneMode.SCENE2D;
        }else{
        
        }
    });
    $scope.area_select.mousedown = function (e) {
        if ($scope.area_select.for_remove) return;
        pos_start = {x:e.clientX, y:e.clientY};
    }
    $scope.area_select.mousemove = function (e) {
        if (!$scope.area_select.for_remove){
            if (pos_start == undefined) return;
            pos_end = {x:e.clientX, y:e.clientY};
            $scope.area_select.select = calcRect(pos_start, pos_end);
        } else{
            $scope.area_select.last_hover = PDMainArea.getArea($scope, {x: e.clientX, y: e.clientY});
        }
    }
    $scope.$watch('area_select',function (val, old) {
        if (old.last_hover != val.last_hover ){
            if (old.last_hover)
                PDMainArea.changeColor(old.last_hover, true);
            PDMainArea.changeColor(val.last_hover);
        }
    }, true)
    $scope.area_select.mouseup = function (e) {
        if ($scope.area_select.for_remove) return;

        $scope.area_select.show_selection = false;

        var pos1 = pos_start;//
        pos_start = undefined;
        $scope.area_select.show_selection = false;
        $scope.area_select.select = {x:0,y:0,width:0,width:0};
        pos_end = {x:e.clientX, y:e.clientY};

        var pos = calcRect(pos1, pos_end);
        if (pos.width <= 0 || pos.height <= 0) return;

        var left_top = getLngLat({x:pos.x, y: pos.y});
        var right_top = getLngLat({x:pos.x + pos.width, y: pos.y});
        var left_bottom = getLngLat({x:pos.x, y: pos.y+pos.height});
        var right_bottom = getLngLat({x:pos.x + pos.width, y: pos.y+pos.height});
        if (!left_top || !right_bottom || !left_bottom || !right_top){
            PDTools.notify('请在底图上划框，不要超出地图范围!');
            return;
        }

        inputColor([left_top, right_top, right_bottom, left_bottom], function (colorString, alpha) {
            if (colorString.indexOf('#') == 0)
                colorString = colorString.substr(1);
            PDMainArea.add($scope, left_top, right_top, right_bottom, left_bottom, colorString, alpha);
        });
        function inputColor(pos,cb) {
            $scope.dialog = {
                show: true,
                icon: 'images/color2.png',
                title: '着色设置',
                src: 'window_color_sel.html',
                width: 320,
                height: 260
            };
            $('.dialog_bk iframe').bind("load", function (e) {
                $(this).unbind(e);
                setTimeout(check, 100);
                function check() {
                    var win = $('.dialog_bk iframe')[0].contentWindow;
                    if (!win){
                        setTimeout(check, 100);
                        return;
                    }
                    win.init(pos, cb);
                }
            })
        }
        function getLngLat(pos) {
            var cartesian = PDDrawer.getViewer().scene.camera.pickEllipsoid(pos, ellipsoid);
            var ellipsoid = PDDrawer.getViewer().scene.globe.ellipsoid;
            if (!cartesian)
                return false;

            var cartographic = ellipsoid.cartesianToCartographic(cartesian);
            if (!cartographic) return false;
            var lng = Cesium.Math.toDegrees(cartographic.longitude);
            var lat = Cesium.Math.toDegrees(cartographic.latitude)
            lng = parseFloat(lng.toFixed(5));
            lat = parseFloat(lat.toFixed(5));
            return {lng: lng, lat:lat};
        }
    }
    $scope.area_select.click = function (e) {
        if (!$scope.area_select.for_remove) return;

        $scope.area_select.show_selection = false;

        if ($scope.area_select.last_hover){
            PDTools.showConfirm('是否删除所选区域？',true, function (ok) {
                var id = $scope.area_select.last_hover;
                $scope.area_select.last_hover = false;
                $scope.$apply();
                if (!ok)
                    return;
                PDMainArea.remove($scope,id);
            });
        }
    }
    function calcRect(pos1, pos2) {
        var posLeftTop = {x:pos1.x < pos2.x ? pos1.x : pos2.x, y:pos1.y < pos2.y ? pos1.y : pos2.y};
        var posRightBottom = {x:pos1.x > pos2.x ? pos1.x : pos2.x, y:pos1.y > pos2.y ? pos1.y : pos2.y};

        return {x:posLeftTop.x, y:posLeftTop.y, width: posRightBottom.x - posLeftTop.x, height:posRightBottom.y - posLeftTop.y};
    }
    function getColor($scope, name) {
        for (var i in $scope.settings.area[$scope.area].material){
            if (name == $scope.settings.area[$scope.area].material[i].name){
                return $scope.settings.area[$scope.area].material[i].colorString;
            }
        }
        return '#fff';
    }
}
var PDMainArea = {
    _no: 0,
    _area:[],
    add: function ($scope, left_top, right_top, right_bottom, left_bottom,colorString, alpha) {


        var pos = [];
        pos.push(left_top.lng);
        pos.push(left_top.lat);
        pos.push(right_top.lng);
        pos.push(right_top.lat);
        pos.push(right_bottom.lng);
        pos.push(right_bottom.lat);
        pos.push(left_bottom.lng);
        pos.push(left_bottom.lat);
        var area = {
            id: PDConfig.const.GEOMETRY_PREFIX_EXTEND + PDConfig.const.GEOMETRY_PREFIX_EXTEND_AREA + (this._no++),
            pos: pos,
            colorString: colorString,
            alpha: alpha
        }
        this._area.push(area);
        this._add($scope, area);
    },
    _add: function ($scope, area) {
        var colorString = area.colorString;
        if (colorString.indexOf('#') !=0)
            colorString = '#' + colorString;
        var color = Cesium.Color.fromCssColorString(colorString).withAlpha(area.alpha);
        var instance = new Cesium.GeometryInstance({
            geometry: new Cesium.PolygonGeometry({
                ellipsoid : Cesium.Ellipsoid.WGS84,
                polygonHierarchy  : new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(area.pos)),
                height : 0,
                extrudedHeight: 1
            }),
            id: area.id,
            attributes: {
                color: Cesium.ColorGeometryInstanceAttribute.fromColor(color)
            }
        });
        area.primitive = new Cesium.Primitive({
            geometryInstances: [instance],
            allowPicking: true,
            appearance: new Cesium.PerInstanceColorAppearance({
                flat: true,
                translucent: true,
                faceForward: true
            })
        });
        PDDrawer.getViewer().scene.primitives.add(area.primitive);

    },
    remove: function ($scope, id) {
        for (var i = 0; i < this._area.length; i ++){
            if (this._area[i].id == id){
                PDDrawer.getViewer().scene.primitives.remove(this._area[i].primitive);;
                this._area.splice(i--, 1);
            }
        }
    },
    getArea: function ($scope, point) {
        var that = this;
        var pick = PDDrawer.getViewer().scene.pick( point);

        var last_hover;
        if ( Cesium.defined( pick )  ) {
            last_hover = getArea(pick.id);
        }
        return last_hover?last_hover.id:false;

        function getArea(id) {
            if (id.indexOf(PDConfig.const.GEOMETRY_PREFIX_EXTEND + PDConfig.const.GEOMETRY_PREFIX_EXTEND_AREA) != 0)
                return false;
            for (var i = 0; i < that._area.length; i ++){
                if (that._area[i].id == id){
                    return that._area[i];
                }
            }
        }
    },
    changeColor: function (area_id, recover) {
        console.log('change ' + (recover?'recover':'change'));
        var area;
        for (var i = 0; i < this._area.length; i ++){
            if (this._area[i].id == area_id){
                area = this._area[i];
            }
        }
        if (!area) return;
        var colorString = area.colorString;
        if (colorString.indexOf('#') != 0)
            colorString = '#'+colorString;
        
        var attr = area.primitive.getGeometryInstanceAttributes(area.id);
        if (attr){
            var color = Cesium.Color.fromCssColorString(colorString)
            if (!recover){
                color = color.darken(0.3, new Cesium.Color());
            }else{
                color = color.withAlpha(area.alpha);
            }
            attr.color = Cesium.ColorGeometryInstanceAttribute.toValue(color);
        }
    },
    onAreaData: function ($scope, cmd, file) {
        var that = this;
        if (cmd == 'clear'){
            for (var i = 0; i < that._area.length; i ++){
                PDDrawer.getViewer().scene.primitives.remove(that._area[i].primitive);
                that._area.splice(i--, 1);
            }
        }else if (cmd == 'open'){
            if (!file || !PDCommon.FileExists2(file)){
                PDTools.notify('文件不存在');
                return;
            }
            PDCommon.FileRead(file, true, function (res) {
                //PDTools.notify('加载数');
                if (!res || !res.success) {
                    PDTools.notify('加载数据失败');
                    cb(false);
                    return;
                }
                var text = res.result.data;
                text = new PDBase64().decode(text, 'utf-8');
                PDTools.showLoading(true, true);
                setTimeout(function () {
                    try{
                        load();
                    }catch (e){
                        PDTools.notify('加载数据失败2');
                    }
                    PDTools.showLoading(false, true);
                }, 100);
                function load() {
                    var areas = JSON.parse(text);
                    if (!areas || !areas.length) return;
                    for (var i in areas){
                        var area = areas[i];
                        area.id = PDConfig.const.GEOMETRY_PREFIX_EXTEND+PDConfig.const.GEOMETRY_PREFIX_EXTEND_AREA+(that._no++);
                        that._area.push(area);
                        that._add($scope, area);
                    }
                }
            });
        } else if (cmd == 'save'){
            var areas = [];
            for (var i in that._area){
                areas.push({
                    pos: that._area[i].pos,
                    colorString: that._area[i].colorString,
                    alpha: that._area[i].alpha
                });
            }
            var str = JSON.stringify(areas);
            str = new PDBase64().encode(str, 'utf-8');
            str = PDInterface.stringTranslate(str, 'utf82ascii');

            PDCommon.FileWrite(file, str, true, function (res) {
                if (!res || !res.success || !res.result.success)
                    PDTools.notify('写文件失败');
            })
        }
    }
}