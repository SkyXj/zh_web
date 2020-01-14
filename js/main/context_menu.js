angular.module('PDMenu',[]).directive('ngRightClick', function($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs, controller){
            element.bind('contextmenu', function(event) {
                scope.$apply(function() {
                    if(attrs.ngRightClick !== undefined){
                        var fn = $parse(attrs.ngRightClick);
                        var ret =  fn(scope, {$event:event});
                        if (false != ret){ 
                            event.preventDefault();
                        }
                    }
                });
            });
        },
        controller:['$scope', function($scope) {
        }]
    }
});
function Main_InitMenus($scope){
    PDContextMenu.init($scope);

    $(document).click(function (e) {
        if (!$scope.panel.point_show) return;
        var pt_in = false;
        if ($(e.toElement).closest(".point_info").length == 0){
            $scope.panel.point_show = false;
            $scope.$apply();
        }
    });

    $(document).click(function (e) {
        if (!$scope.panel.point_show) return;
        var pt_in = false;
        if ($(e.toElement).closest(".point_info").length == 0){
            $scope.panel.point_show = false;
            $scope.$apply();
        }
    });

    $scope.rightClickMap = function (e) {
        console.log(e);
        var pick = PDDrawer.getViewer().scene.pick( {x:e.clientX, y:e.clientY});
        if ( Cesium.defined( pick )  ) {
            //console.log( '1111 '+pick.id);
            return false;
        }
        var pos = PDContextMenu.getPosition(PDDrawer.getViewer(), e.clientX, e.clientY);
        if (!pos) return;
        PDContextMenu.onMap($scope, pos, e, function (ok) {
            
        });
    }
}
var PDContextMenu = {
    getPosition: function (viewer, x, y) {
        var pt1 = new Cesium.Cartesian2(x,y);
        var pick1= viewer.scene.globe.pick(viewer.camera.getPickRay(pt1), viewer.scene);
        if (!pick1)
            return false;

        //将三维坐标转成地理坐标
        var geoPt1= viewer.scene.globe.ellipsoid.cartesianToCartographic(pick1);
        if (!pick1)
            return false;
        //地理坐标转换为经纬度坐标
        var point1={lng:geoPt1.longitude / Math.PI * 180,lat:geoPt1.latitude / Math.PI * 180};
        return point1;
    },
    _no: 0,
    _factory: [],
    _wind: [],
    _scope: undefined,
    init: function ($scope) {
        this._scope = $scope;
        var that = this;

        $scope.panel.factory_show = false;
        $(document).click(function (e) {
            if ($scope.panel.factory_show && $(e.toElement).closest(".factory_info").length == 0){
                $scope.panel.factory_show = false;
                $scope.$apply();
                if ($scope.panel.factory_fun_when_close){
                    $scope.panel.factory_fun_when_close();
                    delete $scope.panel.factory_fun_when_close;
                }
            }
            if ($scope.panel.wind_show && $(e.toElement).closest(".wind_info").length == 0){
                $scope.panel.wind_show = false;
                $scope.$apply();
                if ($scope.panel.wind_fun_when_close){
                    $scope.panel.wind_fun_when_close();
                    delete $scope.panel.factory_fun_when_close;
                }
            }
        });
        var handler = new Cesium.ScreenSpaceEventHandler( PDDrawer.getViewer().scene.canvas );
        handler.setInputAction( function( mouse ) {
            var pick = PDDrawer.getViewer().scene.pick( mouse.position );
            if ( Cesium.defined( pick )  ) {
                console.log( pick.id);
                var factory = getFactory(pick.id);
                if (factory)
                    clickFactory(factory,  mouse.position);
                var wind = getWind(pick.id);
                if (wind)
                    clickWind(wind, mouse.position);
            }else{
            }
            function clickFactory(factory,  position){
                var $scope = that._scope;

                //that._addFactoryModel(factory, true);

                var panel = $('.factory_info')
                if (position.x + panel.width() > window.innerWidth )
                    $scope.panel.factory_x = position.x - panel.width();
                else
                    $scope.panel.factory_x = position.x;
                if (position.y + panel.height() > window.innerHeight)
                    $scope.panel.factory_y = position.y - panel.height();
                else
                    $scope.panel.factory_y = position.y;

                $scope.panel.factory_cur = {
                    name: factory.name,
                    industry: factory.industry,
                    representative: factory.representative,
                    contact: factory.contact,
                    tel: factory.tel,
                    address: factory.address,
                    product: factory.product,
                    material: factory.material,
                    lng: factory.lng,//parseFloat(factory.lng.toFixed(5)),
                    lat: factory.lat//parseFloat(factory.lat.toFixed(5)),
                }
                $scope.panel.factory_cur.position = '('+parseFloat(factory.lng).toFixed(4)+','+parseFloat(factory.lat).toFixed(4)+')';
                $scope.panel.factory_show = true;
                $scope.panel.factory_fun_when_close = function () {
                    //that._addFactoryModel(factory);
                }
                $scope.$apply();
            }
            function clickWind(wind,  position){
                var $scope = that._scope;

                var panel = $('.wind_info')
                if (position.x + panel.width() > window.innerWidth )
                    $scope.panel.wind_x = position.x - panel.width();
                else
                    $scope.panel.wind_x = position.x;
                if (position.y + panel.height() > window.innerHeight)
                    $scope.panel.wind_y = position.y - panel.height();
                else
                    $scope.panel.wind_y = position.y;

                $scope.panel.wind_direction = wind.direction;
                $scope.panel.wind_speed = wind.speed;

                $scope.panel.wind_show = true;
                $scope.panel.wind_fun_when_close = function () {
                    //that._addFactoryModel(factory);
                }
                $scope.$apply();
            }
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK );
        handler.setInputAction( function( mouse ) {
            var pick = PDDrawer.getViewer().scene.pick( mouse.position );
            if ( Cesium.defined( pick )  ) {
                var factory = getFactory(pick.id);
                if (factory)
                    PDContextMenu.onFactory(factory.name, mouse.position, function (id) {
                        if (id == 0) return;
                        if (id == 1){
                            for (var i = 0; i < that._factory.length; i ++){
                                if (that._factory[i].id == factory.id){
                                    that._factory.splice(i, 1);
                                    var $scope = that._scope;
                                    PDDrawer.getViewer().scene.primitives.remove(factory.model);
                                }
                            }
                        } else if (id == 2){
                            that.onEditFacotry(factory, function(info){
                                for (var i = 0; i < that._factory.length; i ++){
                                    if (that._factory[i].id == factory.id){
                                        PDCommon.Change(that._factory[i], info);
                                        //that._factory[i].material = info.material;
                                    }
                                }
                            });
                        } 
                    })
                var wind = getWind(pick.id);
                if (wind)
                    PDContextMenu.onWind(mouse.position, function (id) {
                        if (id == 0) return;
                        for (var i = 0; i < that._wind.length; i ++){
                            if (that._wind[i].id == wind.id){
                                that._wind.splice(i, 1);
                                var $scope = that._scope;
                                PDDrawer.getViewer().scene.primitives.remove(wind.primitive);
                            }
                        }
                    });
            }else{
            }
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        var fragmentShaderSource =
            'uniform sampler2D colorTexture;\n' +
            'varying vec2 v_textureCoordinates;\n' +
            'uniform vec4 highlight;\n' +
            'void main() {\n' +
            '    vec4 color = texture2D(colorTexture, v_textureCoordinates);\n' +
            '    if (czm_selected()) {\n' +
            '        vec3 highlighted = highlight.a * highlight.rgb + (1.0 - highlight.a) * color.rgb;\n' +
            '        gl_FragColor = vec4(highlighted, 1.0);\n' +
            '    } else { \n' +
            '        gl_FragColor = color;\n' +
            '    }\n' +
            '}\n';
        var stage = PDDrawer.getViewer().scene.postProcessStages.add(new Cesium.PostProcessStage({
            fragmentShader : fragmentShaderSource,
            uniforms : {
                highlight : function() {
                    return new Cesium.Color(1.0, 0.0, 0.0, 0.5);
                }
            }
        }));
        stage.selected = [];
    
        $scope.wind_hover = false;
        $scope.$watch('wind_hover', function(val, old){
            if (old && old.primitive){
                var attr = old.primitive.getGeometryInstanceAttributes(old.id);
                color = Cesium.Color.fromCssColorString('#f00').withAlpha(0.8);
                attr.color = Cesium.ColorGeometryInstanceAttribute.toValue(color);
                //console.log('r');
            }
            if (val && val.primitive){
                var attr = val.primitive.getGeometryInstanceAttributes(val.id);
                color = Cesium.Color.fromCssColorString('#70ceff').withAlpha(0.8);
                attr.color = Cesium.ColorGeometryInstanceAttribute.toValue(color);
                //console.log('s');
            }

        });
        var handler = new Cesium.ScreenSpaceEventHandler(PDDrawer.getViewer().scene.canvas);
        handler.setInputAction(function(movement) {
            var pickedObject = PDDrawer.getViewer().scene.pick(movement.endPosition);
            var wind = false;
            if (Cesium.defined(pickedObject)) {
                if (getFactory(pickedObject.id))
                    stage.selected = [pickedObject.primitive];
                wind = getWind(pickedObject.id);
            } else {
                stage.selected = [];
            }
            if ($scope.wind_hover != wind){
                $scope.wind_hover = wind;
                $scope.$apply();
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        function getFactory(id) {
            if (id.indexOf(PDConfig.const.GEOMETRY_PREFIX_EXTEND+PDConfig.const.GEOMETRY_PREFIX_EXTEND_FACTORY) != 0)
                return false;
            for (var i = 0; i < that._factory.length; i ++){
                if (that._factory[i].id == id){
                    return that._factory[i];
                }
            }
            return false;
        }
        function getWind(id) {
            if (id.indexOf(PDConfig.const.GEOMETRY_PREFIX_EXTEND+PDConfig.const.GEOMETRY_PREFIX_EXTEND_WIND) != 0)
                return false;
            for (var i = 0; i < that._wind.length; i ++){
                if (that._wind[i].id == id){
                    return that._wind[i];
                }
            }
            return false;
        }
    },
    _addFactoryModel: function (factory, silhouette, fly) {
        var $scope = this._scope;
        var oldModel = factory.model;

        var targetPosition = Cesium.Cartesian3.fromDegrees(factory.lng, factory.lat, 0);
        var heading = Cesium.Math.toRadians(90);
        var pitch = Cesium.Math.toRadians(0);
        var roll = 0;//Cesium.Math.toRadians(30);
        var headingPitchRoll = new Cesium.HeadingPitchRoll(heading, pitch, roll);
        var modelMatrix = new Cesium.Matrix4();
        Cesium.Transforms.headingPitchRollToFixedFrame(targetPosition, headingPitchRoll, Cesium.Ellipsoid.WGS84, Cesium.Transforms.eastNorthUpToFixedFrame, modelMatrix);
        factory.model = PDDrawer.getViewer().scene.primitives.add(Cesium.Model.fromGltf({
            id: factory.id,
            url : '/pdlocalpath/resources/factory.gltf',//如果为bgltf则为.bgltf
            modelMatrix : modelMatrix,
            scale : 50,
            allowPicking: true,
            silhouetteColor: Cesium.Color.RED,
            silhouetteSize: !!silhouette?10:0
        }));

        if (oldModel){
            Cesium.when(factory.model.readyPromise).then(function(model) {
                model.activeAnimations.addAll({loop : Cesium.ModelAnimationLoop.REPEAT});
                PDDrawer.getViewer().scene.primitives.remove(oldModel);
            }).otherwise(function(error){});
        }
        if (fly){
            PDDrawer.getViewer().camera.flyTo({
                destination : Cesium.Cartesian3.fromDegrees(factory.lng, factory.lat, 1000),
                orientation:{
                    heading : Cesium.Math.toRadians(0),
                    pitch : Cesium.Math.toRadians(-90),
                    roll : 0.0
                }
            });
        }
    },
    freshWind: function(){
        for (var i in this._wind){
            this._addWindModel(this._wind[i], false);
        }
    },
    _addWindModel: function (wind, fly) {
        var wind_param = $scope.settings.area[$scope.area].wind;
        var modelScale = {
            scale: 5,
            width: 20,
            length: 200,
            height: 50
        };

        var len = wind.speed * wind_param.length_ratio;
        if (len < wind_param.length_min) len = wind_param.length_min;
        var width = wind_param.width;
        if (width < 10) width = 10;

        /*
        var oldModel = wind.model;
        var targetPosition = Cesium.Cartesian3.fromDegrees(wind.lng, wind.lat, 0);
        var heading = Cesium.Math.toRadians(-90 + wind.direction);
        var pitch = Cesium.Math.toRadians(0);
        var roll = 0;//Cesium.Math.toRadians(30);
        var headingPitchRoll = new Cesium.HeadingPitchRoll(heading, pitch, roll);
        var modelMatrix = new Cesium.Matrix4();
        Cesium.Transforms.headingPitchRollToFixedFrame(targetPosition, headingPitchRoll, Cesium.Ellipsoid.WGS84, Cesium.Transforms.eastNorthUpToFixedFrame, modelMatrix);
        modelMatrix = Cesium.Matrix4.multiplyByScale(modelMatrix, new Cesium.Cartesian3(len/modelScale.length, width/modelScale.width, wind_param.height/modelScale.height), new Cesium.Matrix4() );
        wind.model = PDDrawer.getViewer().scene.primitives.add(Cesium.Model.fromGltf({
            id: wind.id,
            url : '/pdlocalpath/resources/Cesium_Air.glb',//如果为bgltf则为.bgltf
            modelMatrix : modelMatrix,
            scale : modelScale.scale,
            allowPicking: true
        }));

        wind.model.readyPromise.then(function (model) {
            model.activeAnimations.addAll({loop : Cesium.ModelAnimationLoop.REPEAT});
            if (oldModel) PDDrawer.getViewer().scene.primitives.remove(oldModel);
        });
        if (fly)
            PDDrawer.getViewer().camera.flyTo({
                destination : Cesium.Cartesian3.fromDegrees(wind.lng, wind.lat, 1000),
                orientation:{
                    heading : Cesium.Math.toRadians(0),
                    pitch : Cesium.Math.toRadians(-90),
                    roll : 0.0
                }
            });
        return;
        */
        
        var old = wind.primitive;
        var angle = wind.direction;
        
        //var distance = width / 2 / Math.cos(angle/180*Math.PI);
        var angle_arrow = 45;

        var pos_arrow_top = PDDrawerHelper.convertDistanceToLogLat2(wind.lng, wind.lat, angle, len + (width*5/6));
        var pos_bottom = {lng: wind.lng, lat: wind.lat};//PDDrawerHelper.convertDistanceToLogLat2(wind.lng, wind.lat, 180 + angle, len / 2);
        var pos_arrow_left = PDDrawerHelper.convertDistanceToLogLat2(pos_arrow_top.lng, pos_arrow_top.lat, 180 + angle + angle_arrow, (width*5/6) /Math.sin(angle_arrow/180*Math.PI));
        var pos_arrow_right = PDDrawerHelper.convertDistanceToLogLat2(pos_arrow_top.lng, pos_arrow_top.lat, 180 + angle - angle_arrow, (width*5/6) /Math.sin(angle_arrow/180*Math.PI));
        var pos_top_left = PDDrawerHelper.convertDistanceToLogLat2(pos_arrow_left.lng, pos_arrow_left.lat, angle + 90, width / 3);
        var pos_top_right = PDDrawerHelper.convertDistanceToLogLat2(pos_arrow_right.lng, pos_arrow_right.lat, angle - 90, width / 3);
        var pos_bottom_left = PDDrawerHelper.convertDistanceToLogLat2(pos_bottom.lng, pos_bottom.lat, angle - 90, width / 2);
        var pos_bottom_right = PDDrawerHelper.convertDistanceToLogLat2(pos_bottom.lng, pos_bottom.lat, angle + 90, width / 2);

        var pos = [];
        pos.push(pos_arrow_top.lng);
        pos.push(pos_arrow_top.lat);
        pos.push(pos_arrow_left.lng);
        pos.push(pos_arrow_left.lat);
        pos.push(pos_top_left.lng);
        pos.push(pos_top_left.lat);
        pos.push(pos_bottom_left.lng);
        pos.push(pos_bottom_left.lat);
        pos.push(pos_bottom_right.lng);
        pos.push(pos_bottom_right.lat);
        pos.push(pos_top_right.lng);
        pos.push(pos_top_right.lat);
        pos.push(pos_arrow_right.lng);
        pos.push(pos_arrow_right.lat);

    
        var instance = new Cesium.GeometryInstance({
            geometry:new Cesium.PolygonGeometry({
                polygonHierarchy :
                    new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(pos)),
                height: wind_param.height,
                extrudedHeight: wind_param.height + 10
            }),
            id: wind.id,
            attributes: {
                color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromCssColorString('#f00').withAlpha(0.8)),
                show : new Cesium.ShowGeometryInstanceAttribute( true )
            }
        });
        wind.primitive = new Cesium.Primitive({
            geometryInstances: [instance],
            allowPicking: true,
            appearance: new Cesium.PerInstanceColorAppearance({
                flat: true,
                translucent: true,
                faceForward: false
            })
        });
        PDDrawer.getViewer().scene.primitives.add(wind.primitive);
        if (old)
            PDDrawer.getViewer().scene.primitives.remove(old);
        if (fly)
            PDDrawer.getViewer().camera.flyTo({
                destination : Cesium.Cartesian3.fromDegrees(wind.lng, wind.lat, 1000),
                orientation:{
                    heading : Cesium.Math.toRadians(0),
                    pitch : Cesium.Math.toRadians(-90),
                    roll : 0.0
                }
            });
        return;

        var angle = wind.direction/180*Math.PI;
        var distance = width / 2 / Math.cos(angle);

        var pos_left_top = PDDrawerHelper.convertDistanceToLogLat2(wind.lng, wind.lat, 360 - angle, distance);
        var pos_left_bottom = PDDrawerHelper.convertDistanceToLogLat2(wind.lng, wind.lat, 180 + angle, distance);
        var pos_right_top = PDDrawerHelper.convertDistanceToLogLat2(wind.lng, wind.lat, angle, distance);
        var pos_right_bottom = PDDrawerHelper.convertDistanceToLogLat2(wind.lng, wind.lat, 180 - angle, distance);

        var west = PDDrawerHelper.convertDistanceToLogLat2(wind.lng, wind.lat, 180 + angle, distance).lng;
        var south = PDDrawerHelper.convertDistanceToLogLat2(wind.lng, wind.lat, 180 + angle, distance).lat;
        var east = PDDrawerHelper.convertDistanceToLogLat2(wind.lng, wind.lat, angle, distance).lng;
        var north = PDDrawerHelper.convertDistanceToLogLat2(wind.lng, wind.lat, angle, distance).lat;

        var pos = [pos_left_top.lng, pos_left_top.lat,pos_right_top.lng, pos_right_top.lat, pos_right_bottom.lng, pos_right_bottom.lat, pos_left_bottom.lng, pos_left_bottom.lat];

        var modelMatrix = new Cesium.Matrix4();
        var targetPosition = Cesium.Cartesian3.fromDegrees(wind.lng, wind.lat, 0);
        var headingPitchRoll = new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(60), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0));
        Cesium.Transforms.headingPitchRollToFixedFrame(targetPosition, headingPitchRoll, Cesium.Ellipsoid.WGS84, Cesium.Transforms.eastNorthUpToFixedFrame, modelMatrix);
        var instance = new Cesium.GeometryInstance({
            geometry: new Cesium.RectangleGeometry({
                ellipsoid : Cesium.Ellipsoid.WGS84,
                rectangle : Cesium.Rectangle.fromDegrees(west, south, east, north),
                height : 0,//wind_param.height
                extrudedHeight: 100
            }),
            id: wind.id,
            //modelMatrix : modelMatrix,
            attributes: {
                color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.BLUE),
                image: Cesium.ColorGeometryInstanceAttribute.fromColor('Image', {
                    image:'/pdlocalpath/images/wind.png'
                })
            }
        });
        var primitive = new Cesium.Primitive({
            geometryInstances: [instance],
            allowPicking: true,
            /*appearance: new Cesium.PerInstanceColorAppearance({
                flat: true,
                translucent: false,
                faceForward: true
            })*/
            appearance: new Cesium.MaterialAppearance({
                material : Cesium.Material.fromType('Image', {
                    image:'/pdlocalpath/images/wind.png'
                }),
                flat: false,
                translucent: true,
                faceForward : true,
                materialSupport: Cesium.MaterialAppearance.MaterialSupport.ALL
            })
            /*appearance: new Cesium.EllipsoidSurfaceAppearance({
                material : Cesium.Material.fromType('Image', {
                    image:'/pdlocalpath/images/wind.png'
                }),
                flat: false,
                translucent: false,
                faceForward : true
            })*/
        });
        PDDrawer.getViewer().scene.primitives.add(primitive);
        PDDrawer.getViewer().camera.flyTo({
            destination : Cesium.Cartesian3.fromDegrees(wind.lng, wind.lat, 1000),
            orientation:{
                heading : Cesium.Math.toRadians(0),
                pitch : Cesium.Math.toRadians(-90),
                roll : 0.0
            }
        });
    },
    onMap: function ($scope, pos, e) {
        var x = e.pageX - $(document).scrollLeft();
        var y = e.pageY - $(document).scrollTop();
        var offset = window.parent.GetIFramePos(window);
        x += offset.left;
        y += offset.top;
        var menu_item = [
            {id: 1, text:'添加工厂信息'},
            {id: 2, text:'添加风向信息'},
        ];
        var that = this;
        PDCommon.PopupMenu({x: x,y: y, item:menu_item},function (id) {
            if (id == 0) return;
            if (id == 1){
                that.onEditFacotry({lng:pos.lng, lat:pos.lat}, function(factory_info){
                    that._factory.push(factory_info);
                    that._addFactoryModel(factory_info, false, true);
                    //var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(pos.lng, pos.lat, 0));
                    that._scope.$apply();
                });
            } else if (id == 2){
                that._WinInput($scope,'添加风向信息', ['风向(0~360)', '风速(m/s)'], ['', ''], ['number', 'number'], function (success,out) {
                    if (!out || !out.length){
                        PDTools.notify('信息输入错误');
                        return;
                    }

                    if (out[0] === undefined || out[0] === ''){
                        PDTools.notify('请输入风向');
                        return;
                    }
                    if (out[0] === undefined || out[1] === ''){
                        PDTools.notify('请输入风速');
                        return;
                    }
                    var direction = parseFloat(out[0]);
                    var speed = parseFloat(out[1]);
                    if (direction < 0 || direction > 360){
                        PDTools.notify('风向必须在0~360之间');
                        return;
                    }
                    if (speed < 0 || speed > 400){
                        PDTools.notify('风速必须在0~400之间');
                        return;
                    }
                    onCloseDialog();
                    $scope.$apply();

                    var wind = {
                        id: PDConfig.const.GEOMETRY_PREFIX_EXTEND+PDConfig.const.GEOMETRY_PREFIX_EXTEND_WIND+(that._no++),
                        direction: direction,
                        speed: speed,
                        lng: pos.lng,
                        lat: pos.lat
                    };
                    that._wind.push(wind);
                    that._addWindModel(wind, true);


                });
            }
        });
    },
    onEditFacotry: function(factory, cb){
        cb = cb || function(){};
        var $scope = this._scope;
        var that = this;
        var edit = factory.name != undefined;
        $scope.dialog = {
            show: true,
            icon: 'images/settings2.png',
            title: edit?'编辑工厂信息':'添加工厂信息',
            src: 'window_factory.html',
            width: 600,
            height: 546
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
                win.init(factory, function(info){
                    onCloseDialog();
                    var factory = {
                        id: PDConfig.const.GEOMETRY_PREFIX_EXTEND+PDConfig.const.GEOMETRY_PREFIX_EXTEND_FACTORY+(that._no++),
                        name: info.name,
                        industry: info.industry,
                        representative: info.representative,
                        contact: info.contact,
                        tel: info.tel,
                        address: info.address,
                        product: info.product,
                        material: info.material,
                        lng: info.lng,
                        lat: info.lat
                    };
                    if (edit)
                        delete factory.id;
                    cb (factory);
                });
            }
        });
        $scope.$apply();
    },
    onFactory: function (name, position, cb) {
        var x = position.x;
        var y = position.y;
        var offset = window.parent.GetIFramePos(window);
        x += offset.left;
        y += offset.top;
        var menu_item = [
            {id: 1, text:'删除 "' + name +'"'},
            {id: 2, text:'编辑 "' + name +'"'},
        ];
        var that = this;
        PDCommon.PopupMenu({x: x,y: y, item:menu_item},function (id) {
            cb(id);
        });
    },
    onWind: function ( position, cb) {
        var x = position.x;
        var y = position.y;
        var offset = window.parent.GetIFramePos(window);
        x += offset.left;
        y += offset.top;
        var menu_item = [
            {id: 1, text:'删除风向标'}
        ];
        var that = this;
        PDCommon.PopupMenu({x: x,y: y, item:menu_item},function (id) {
            cb(id);
        });
    },
    onFactoryData: function (cmd, file) {
        var that = this;
        if (cmd == 'clear'){
            for (var i = 0; i < that._factory.length; i ++){
                var $scope = this._scope;
                PDDrawer.getViewer().scene.primitives.remove(that._factory[i].model);
                that._factory.splice(i--, 1);
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
                    var factories = JSON.parse(text);
                    if (!factories || !factories.length) return;
                    var format_ok = true;
                    for (var i in factories){
                        var factory = factories[i];
                        if (!factory.industry){
                            format_ok = false;
                            continue;
                        }
                        factory.id = PDConfig.const.GEOMETRY_PREFIX_EXTEND+PDConfig.const.GEOMETRY_PREFIX_EXTEND_FACTORY+(that._no++);
                        that._factory.push(factory);
                        that._addFactoryModel(factory, false, false);
                    }
                    if (!format_ok){
                        PDTools.notify('数据格式不正确');
                        return;
                    }
                }
            });
        } else if (cmd == 'save'){
            var factories = [];
            for (var i in that._factory){
                factories.push({
                    name: that._factory[i].name,
                    industry: that._factory[i].industry,
                    representative: that._factory[i].representative,
                    contact: that._factory[i].contact,
                    tel: that._factory[i].tel,
                    address: that._factory[i].address,
                    product: that._factory[i].product,
                    material: that._factory[i].material,
                    lng: that._factory[i].lng,
                    lat: that._factory[i].lat
                });
            }
            var str = JSON.stringify(factories);
            str = new PDBase64().encode(str, 'utf-8');
            str = PDInterface.stringTranslate(str, 'utf82ascii');

            PDCommon.FileWrite(file, str, true, function (res) {
                if (!res || !res.success || !res.result.success)
                    PDTools.notify('写文件失败');
            })
        }
    },
    onWindData: function (cmd, file) {
        var that = this;
        if (cmd == 'clear'){
            for (var i = 0; i < that._wind.length; i ++){
                var $scope = this._scope;
                PDDrawer.getViewer().scene.primitives.remove(that._wind[i].primitive);
                that._wind.splice(i--, 1);
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
                    var winds = JSON.parse(text);
                    if (!winds || !winds.length) return;
                    for (var i in winds){
                        var wind = winds[i];
                        wind.id = PDConfig.const.GEOMETRY_PREFIX_EXTEND+PDConfig.const.GEOMETRY_PREFIX_EXTEND_WIND+(that._no++);
                        that._wind.push(wind);
                        that._addWindModel(wind);
                    }
                }
            });
        } else if (cmd == 'save'){
            var winds = [];
            for (var i in that._wind){
                winds.push({
                    direction: that._wind[i].direction,
                    speed: that._wind[i].speed,
                    lng: that._wind[i].lng,
                    lat: that._wind[i].lat
                });
            }
            var str = JSON.stringify(winds);
            str = new PDBase64().encode(str, 'utf-8');
            str = PDInterface.stringTranslate(str, 'utf82ascii');

            PDCommon.FileWrite(file, str, true, function (res) {
                if (!res || !res.success || !res.result.success)
                    PDTools.notify('写文件失败');
            })
        }
    },
    _WinInput: function ($scope, title, titles, inputs, types, fun) {
        $scope.dialog = {
            show: true,
            icon: 'images/settings2.png',
            title: title,
            src: 'window_input.html?area='+$scope.area,
            width: 280,
            height: 190
        };
        $scope.$apply();
        $('.dialog_bk iframe').bind("load", function (e) {
            $(this).unbind(e);
            setTimeout(check, 100);
            function check() {
                var win = $('.dialog_bk iframe')[0].contentWindow;
                if (!win){
                    setTimeout(check, 100);
                    return;
                }
                win.init(titles,inputs,types,fun);
            }
        })
    }
}