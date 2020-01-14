function AddExceptionPoint(dev_id, data){
    var $scope = $('[ng-controller=all]').scope();
    $scope.onAddExceptionPoint(dev_id, data);
    $scope.$apply();
}
function AddExceptionInfo(data) {
    var $scope = $('[ng-controller=all]').scope();
    $scope.onAddExceptionInfo(data);
    $scope.$apply();
}
function Main_InitPanels($scope) {
    $scope.shape_expand = false;
    $scope.error_expand = false;
    $scope.error_tab = 1;
    $scope.statistic_expand = false;
    $scope.statistic_tab = 1;
    $scope.panel = {};
    initPointInfo();
    $scope.clickShapeOffset = function (shape) {
        if (shape.angle == undefined || shape.angle < 0 || shape.angle > 360){
            PDTools.notify('偏移角度在0~360之间');
            return;
        }
        if (shape.distance == undefined || shape.distance < -6378137 || shape.distance > 6378137){
            PDTools.notify('偏移距离在-6378137~6378137之间');
            return;
        }
        PDDrawer.offsetShape(shape.no, shape.angle, shape.distance);
    }
    $scope.clickShapeRemove = function (shape) {
        PDTools.showConfirm('删除图形？', true, function(ok){
            if (!ok) return;
            for (var i= 0; i < $scope.shape.length; i ++){
                if ($scope.shape[i].no == shape.no){
                    $scope.shape.splice(i--, 1);
                }
            }
            $scope.$apply();
            PDDrawer.removeShape(shape.no);
        });
    }
    $scope.$watch('shape_all', function (val, valOld, $scope) {
        if (val == undefined) return;
        for (var i= 0; i < $scope.shape.length; i ++){
            if ($scope.shape[i].show != val){
                $scope.shape[i].show = val;
            }
        }
        //PDDrawer.updateShow(shape_param);
    });
    $scope.$watch('shape', function (val, valOld, $scope) {
        if ($scope.delay_update_shape_show){
            clearTimeout($scope.delay_update_shape_show);
        }
        $scope.delay_update_shape_show = setTimeout(update, 500);
        function update(){
            $scope.delay_update_shape_show = undefined;
            var shape_param = {};
            for (var i= 0; i < val.length; i ++){
                shape_param[val[i].no] = val[i].show;
            }
            PDDrawer.updateShow(shape_param);
        }
    }, true);
    
    $scope.viewShape = function (shape) {
        PDDrawer.autoFit([PDDrawer.getShape(shape.no)]);
    }

    $scope.panel.error = {point:[], info:[]};
    $scope.onAddExceptionPoint = function (dev_id,data) {
        var point = {
            name:data.name,
            value: data.val,
            dev_id: dev_id,
            time: data.time,
            lng: parseFloat(data.lng),
            lat: parseFloat(data.lat),
            colorString: getColor($scope, data.name),
            pos_show: '('+parseFloat(data.lng).toFixed(4)+', '+parseFloat(data.lat).toFixed(4)+')'
        }
        $scope.panel.error.point.push(point);

    }
    $scope.onAddExceptionInfo = function (data) {
        var info = {
            title: data.title,
            text: data.text
        }
        $scope.panel.error.info.push(info);
        $scope.dialog = {
            show: true,
            icon: 'images/warning2.png',
            title: '警告',
            src: 'window_show.html?text='+encodeURIComponent(info.text),
            width: 280,
            height: 190
        };
    }
    //$scope.onAddExceptionPoint('file_0', {name:'丁烯浓度',time:'2018-08-09 20:30:30',lng:114.514,lat:38.0215,val:4.3});

    $scope.dblClickError = function (item) {
        $scope.error_expand = false;
        var alt = PDDrawer.getViewer().scene.globe.ellipsoid.cartesianToCartographic(PDDrawer.getViewer().camera.positionWC).height;
        if (alt > 5000)
            alt = 5000;
        var pos = PDDrawer.getOffsetPos(item.dev_id, item.time, item.lng, item.lat);
        PDDrawer.getViewer().camera.flyTo({
            destination : Cesium.Cartesian3.fromDegrees(pos.lng, pos.lat, 0),
            orientation:{
                heading : Cesium.Math.toRadians(0),
                pitch : Cesium.Math.toRadians(-60),
                roll : 0.0
            },
            duration: 0.5,
            complete: function () {
                var total = alt;
                var tick = total / 100;
                var cur = 0;
                setTimeout(roate, 10);
                function roate() {
                    cur += tick;
                    if (cur > total) {
                        var times = 0;
                        setTimeout(flash, 500);
                        return;
                        function flash() {
                            if (times ++ > 6)
                                return;
                            PDDrawer.changeShapeColor(item.dev_id, item.lng, item.lat, times % 2 == 0 ? 'rgba(255,0,0,1.0)':undefined);
                            setTimeout(flash, 500);
                        }
                    }
                    //PDDrawer.getViewer().camera.rotateUp(Cesium.Math.toRadians(tick));
                    //PDDrawer.getViewer().camera.moveDown(1);
                    PDDrawer.getViewer().camera.moveBackward(tick);
                    setTimeout(roate, 10);
                }

            }
        });
    }

    function initPointInfo() {
        $scope.panel.point_show = false;
        $(document).click(function (e) {
            if (!$scope.panel.point_show) return;
            var pt_in = false;
            if ($(e.toElement).closest(".point_info").length == 0){
                $scope.panel.point_show = false;
                $scope.$apply();
                if ($scope.panel.point_fun_when_close){
                    $scope.panel.point_fun_when_close();
                    delete $scope.panel.point_fun_when_close;
                }
            }
        });
        //viewer.camera.flyTo({destination : Cesium.Cartesian3.fromDegrees(-75.62898254394531, 40.02804946899414, 6.0)});
        var handler = new Cesium.ScreenSpaceEventHandler( PDDrawer.getViewer().scene.canvas );
        //设置单击事件的处理句柄
        handler.setInputAction( function( mouse ) {
            var pick = PDDrawer.getViewer().scene.pick( mouse.position );
            if ( Cesium.defined( pick )  ) {
                console.log( pick.id);
                var info = getShape(pick.id);
                if (!info) return;
                clickShape(info, mouse.position);
            }else{
            }
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK );//); //Cesium.ScreenSpaceEventType.MOUSE_MOVE
        /*handler.setInputAction( function( movement ) {
         //console.log(movement.endPosition.x + ' ' + movement.endPosition.y);
         var pick = that._viewer.scene.pick( movement.endPosition );
         if ( Cesium.defined( pick )  ) {
         console.log( pick.id);
         }else{
         //console.log('no');
         }
         }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);*/
        function getShape(id) {
            if (id.indexOf(PDConfig.const.GEOMETRY_PREFIX_EXTEND) == 0)
                return false;
            var ret = id.match(/^(.*)_([0-9]*)_([0-9]*)$/);
            if (!ret && ret.length < 4)
                return false;
            else
                return {no:ret[1], pos: parseInt(ret[2]), index: parseInt(ret[3])};
        }
        function clickShape(info, position) {
            var shape = PDDrawer.getShape(info.no);
            if (!shape || info.pos >= shape.data.length || shape.names.length != shape.data[info.pos].val.length) return;

            if (position.x + $('.point_info').width() > window.innerWidth )
                $scope.panel.point_x = position.x - $('.point_info').width();
            else
                $scope.panel.point_x = position.x;
            if (position.y + $('.point_info').height() > window.innerHeight)
                $scope.panel.point_y = position.y - $('.point_info').height();
            else
                $scope.panel.point_y = position.y;

            $scope.panel.point_show = true;
            $scope.panel.point_mouse_x = parseFloat(shape.data[info.pos].pos.lng.toFixed(5));
            $scope.panel.point_mouse_y = parseFloat(shape.data[info.pos].pos.lat.toFixed(5));
            $scope.panel.point_time = shape.data[info.pos].time;



            var items = [];
            for (var i = 0; i < shape.names.length; i ++){
                if (isShow(shape.names[i]))
                    items.push({
                        name: shape.names[i],
                        value: shape.data[info.pos].val[i],
                        sel: i == info.index,
                        colorString: getColor($scope,shape.names[i])
                    });
                function isShow(name){
                    var material = $scope.settings.area[$scope.area].material;
                    for (var i in material){
                        if (name == material[i].name && material[i].has != false && material[i].show != false)
                            return true;
                    }
                    return false;
                }
            }
            $scope.panel.point_item = items;
            $scope.$apply();

            //PDDrawer.changeShapeColor(shape.no, shape.data[info.pos].pos.lng, shape.data[info.pos].pos.lat, 'rgba(255,0,0,1.0)');
            PDDrawer.changeShapeColor(shape.no, shape.data[info.pos].pos.lng, shape.data[info.pos].pos.lat, 0.3);
            $scope.panel.point_fun_when_close = function () {
                PDDrawer.changeShapeColor(shape.no, shape.data[info.pos].pos.lng, shape.data[info.pos].pos.lat);
            }


        }
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