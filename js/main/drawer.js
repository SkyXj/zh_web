var PDDrawer = {
    _no: 0,
    _max_val: 1000000,
    drawNavigationImageFromFile: function (file, name, text, cb) {
        var arr = text.split('\n');
        var data = [];

        var header = arr[0];
        var arr2 = header.split(';');
        arr.splice(0, 1);
        var names = []
        for (var j = 0; j < arr2.length; j ++){
            //arr2[j] = arr2[j].replace(',', ' ');
            if (arr2 && arr2[j] != ''){
                names.push(arr2[j]);
            }
        }
        if (names.length < 3){
            PDTools.notify('无效数据');
            cb(false);
            return;
        }
        var hasTime = false;
        if (names[0] == '时间'){
            hasTime = true;
            names.splice(0, 3);
        }else{
            hasTime = false;
            names.splice(0, 2);
        }
        var that = this;
        var shapes_remove = [];
        if (!checkNames(names, that)){
            PDTools.showConfirm('物质名称不一致，是否清空上一次的图形后继续？', true, function(ok){
                if (!ok){
                    cb(false);
                }else{
                    for (var i = 0; i < that._shapes.length; i++){
                        if (that._shapes[i].file)
                            shapes_remove.push(that._shapes[i].no);
                    }
                    that._material = [];
                    that._material_cache = [];
                    do_file();
                }
            });
        }else{
            do_file();
        }
        return;
        function do_file(){
            var rows = read(arr, names, hasTime);
            //var rows = read(arr, names, hasTime);
            var shape = {
                no:'file_'+that._no ++,
                file:file,
                pos_total: rows.length,
                name:name,
                names: names,
                primitives: [],
                offset: {angle: 0, distance: 0},
                zoom: calcZoom(rows, that._aspect_ratio)
            };
            that._shapes.push(shape);

            var animate = that._animate.elapse != 0;
            var batch =  animate ? 1 :100;
            var elapse = animate ? that._animate.elapse : 10;

            var autofit = calAutoFit(rows); 
            if (animate && autofit){
                autofit.height *= shape.zoom;
                that.autoFit(autofit, function(){
                    handle(0, cb);
                });
            }else{
                handle(0, cb);
            }
            function handle(pos, cb) {
                cb = cb || function(){};
                if (pos > rows.length - 1 || pos > 10000){
                    that._drawImage(shape);
                    that.autoFit([shape]);
                    cb(true, shape.no, shapes_remove);
                    that._updateMaterial(that._material);
                    return;
                }
                //console.log(pos);
                var index = pos;
                for (index = pos; index < pos + batch && index < rows.length; index ++){
                    var row = rows[index];
                    that.addPoint(shape, row.t, row.pos.lng, row.pos.lat, row.vals, false);
                }
                that._drawImage(shape);
                if (animate){
                    //that._viewer.flyTo(shape.primitives[shape.primitives.length - 1]);
                }
                
                setTimeout(function () {
                    handle(index, cb);
                }, elapse);
            }
            function calcZoom(rows, ratio) {
                if (ratio == 0)
                    return that._zoom;
                var box;
                for (var i = 0; i < rows.length; i ++){
                    var row = rows[i];
                    var height = 0;
                    for (var j = 0; j < row.vals.length; j ++){
                        height += row.vals[j];
                    }
                    box = that._changeAutoFitArea(box, row.pos.lng, row.pos.lat, height);
                }
                if (!box || !box.height) return that._zoom;
                var length1 = PDDrawerHelper.getDistance(box.left, box.bottom, box.right, box.bottom);
                var length2 = PDDrawerHelper.getDistance(box.left, box.bottom, box.left, box.top);
                if (length2 > length1)
                    length1 = length2;
                if (length1 <= 0)
                    return that._zoom;
                else
                    return length1 / ratio / box.height;
            }
            function calAutoFit(rows){
                var box;
                for (var i = 0; i < rows.length; i ++){
                    var row = rows[i];
                    var lng = row.pos.lng;
                    var lat = row.pos.lat;
                    if (that._funPosTransform){
                        var pos_transform = that._funPosTransform(lng, lat);
                        lng = pos_transform.x;
                        lat = pos_transform.y;
                    }
    
                    var height = 0;
                    for (var j = 0; j < row.vals.length; j ++){
                        height += row.vals[j];
                    }
                    box = that._changeAutoFitArea(box, lng, lat, height);
                    //console.info(box);
                }
                return box;
            }
            function read(arr, names, hasTime){
                var res = [];
                for (var i = 0; i < arr.length; i ++){
                    var arr2 = arr[i].split(';');
                    var t = '-';
                    if (hasTime) {
                        t = arr2[0];
                        arr2.splice(0, 1);
                    }
                    if (arr2.length != names.length + 2 || arr2[0] == '' || arr2[1] == ''){
                        console.log('无效数据1：'+arr[i]);
                        continue;
                    }
                    var lng = parseFloat(arr2[0]);
                    var lat = parseFloat(arr2[1]);
                    if (lng > 180 || lng < -180){
                        console.log('无效数据2：'+arr[i]);
                        continue;
                    }
                    if (lat > 90 || lat < -90){
                        console.log('无效数据3：'+arr[i]);
                        continue;
                    }
                    var vals = [];
                    for (var j = 2; j < arr2.length; j ++){
                        var val = parseFloat(arr2[j]);
                        if (val < 0) val = 0;
                        if (val > that._max_val) val = that._max_val;
                        vals.push(val);
                    }
                    if (vals.length != names.length){
                        console.log('无效数据4：'+arr[i]);
                        continue;
                    }
                    res.push({
                        t: t,
                        pos: {lng: lng, lat:lat},
                        vals: vals
                    });
                }
                //  for (var i = 0; i < res.length; i ++){
                //     if (i == 0) continue;
                //     if (equalPosition(res[i].pos, res[i - 1].pos)){
                //         res.splice(i - 1, 1);
                //         i --;
                //     }
                // }
                return res;
                function equalPosition (pos1, pos2) {
                    if (equalF(pos1.lng, pos2.lng) && equalF(pos1.lat, pos2.lat))
                        return true;
                    else
                        return false;
                    function equalF(f1, f2) {
                        if (f1 > f2 || f1 < f2)
                            return false;
                        return true;
                    }
                }
            }
        }
        
        function checkNames(names, that){
            var last_names = [];
            for (var i in that._shapes){
                if (that._shapes[i].file){
                    last_names = that._shapes[i].names;
                    break;
                }
            }
            if (last_names.length == 0){
                return true;
            }
            
            if (names.length != last_names.length){
                return false;
            }else{
                for (var i in names){
                    if (names[i] != last_names[i]){
                        return false;
                    }
                }
            }
            return true;
        }
    },
    _animate: {elapse: 0},
    updateLoadingAnimate: function(elapse){
        this._animate.elapse = elapse;
    },
    setDevice: function (dev_id, dev_name, material_names) {
        if (dev_id.indexOf('file_') == 0){
            PDTools.notify('设备ID不能以file_打头');
            return false;
        }
        console.log('set device'+dev_id);
        for (var i = 0; i < this._shapes.length; i++){
            if (dev_id == this._shapes[i].no){
                //PDTools.notify('设备已存在');
                return false;
            }
        }


        //去重复
        for (var i = 0; i < this._xjshapes.length; i++){
            if (dev_id == this._xjshapes[i].no){
                return false;
            }
        }

        var shape = {
            t: PDTools.formatDate(new Date(), true),
            no:dev_id,
            //file:file,
            name:dev_name,
            names: material_names,
            primitives: [],
            offset: {angle: 0, distance: 0},
            zoom: this._zoom,
            show_vehicle: this._vehicle_show
        };
        this._shapes.push(shape);

        //保证对象的互相影响(不确定,采用以下方式)
        var str = JSON.stringify(shape);
        var datatemp = JSON.parse(str); //$为jQuery对象需要引入jQuery包
        this._xjshapes.push(datatemp);

        var found = false;
        for (var i = 0; i < this._devices.length; i ++){
            if (this._devices[i].no == dev_id){
                found  = true;
                break;
            }
        }
        if (!found) this._devices.push({no: dev_id, name: dev_name, names: material_names});
        return shape;
    },
    addDevicePoint: function (dev_id, t, lng, lat, values) {
        dev_id = dev_id;
        var shape;
        for (var i = 0; i < this._shapes.length; i++){
            if (dev_id == this._shapes[i].no){
                shape = this._shapes[i];
                break;
            }
        }
        if (!shape) {
            //PDTools.notify('无设备。走航数据错误！');
            for (var i = 0; i < this._devices.length; i ++){
                if (this._devices[i].no == dev_id){
                    shape = this.setDevice(this._devices[i].no, this._devices[i].name, this._devices[i].names);
                }
            }
        }


        // xjtest
        for (var i = 0; i < this._xjshapes.length; i++){
            if (dev_id == this._xjshapes[i].no){
				if(this._xjshapes[i].dataSave==undefined||!this._xjshapes[i].dataSave){
					this._xjshapes[i].dataSave=[];
				}
			   var rowSave = {time:t,pos:{lng:lng,lat:lat},val:[]};
               for (var j in values){
               rowSave.val[j] = values[j];
               }
			   var str = JSON.stringify(rowSave);
               var data1 = JSON.parse(str);
               

               this._xjshapes[i].dataSave.push(data1);
               break;
            }
        }



        if (shape) {
            shape.new_data = true;
            var len = this.addPoint(shape, t, lng, lat, values, true);
            this._autoSave(shape.no);
            return {length: len, shape: shape};
        } else{ return false; }
    },
    removeAllPoints: function () {
        for (var i = 0; i < this._shapes.length; i++){
            this.removeShape(this._shapes[i].no);
        }
    },
    _devices: [],
    removeShape: function (shape) {
        var id = '';
        if (typeof shape != 'object'){
            for (var i = 0; i < this._shapes.length; i++){
                if (shape == this._shapes[i].no){
                    id = this._shapes[i].no;
                    break;
                }
            }
        }else{
            id = shape.no;
        }

        for (var i = 0; i < this._shapes.length; i++){
            if (id == this._shapes[i].no){
                for (var j = 0; j < this._shapes[i].primitives.length; j ++){
                    if (this._shapes[i].primitives[j])
                        this._viewer.scene.primitives.remove(this._shapes[i].primitives[j]);
                }
                if(this._shapes[i].vehicle)
                    this._viewer.scene.primitives.remove(this._shapes[i].vehicle);
                this._shapes.splice(i, 1);
                return true;
            }
        }
        return false;
    },
    updateShow: function(shape_param, show_vehicle){
        if (shape_param){
            for (var key in shape_param){
                for (var j = 0; j < this._shapes.length; j++) {
                    if (key == this._shapes[j].no){
                        this._shapes[j].show = shape_param[key];
                    }
                }
            }
        }
        if (show_vehicle != undefined){
            this._vehicle_show = show_vehicle;
            for (var j = 0; j < this._shapes.length; j++) {
                this._shapes[j].show_vehicle = show_vehicle;
            }
        }
        for (var i = 0; i < this._shapes.length; i++) {
            var show = this._shapes[i].show != false;
            for (var j in this._shapes[i].primitives){
                var primitive = this._shapes[i].primitives[j];
                primitive.show = show;
                /*for (var k in primitive.geometryInstances){
                    var attr = primitive.getGeometryInstanceAttributes(primitive.geometryInstances[k].id);
                    if (attr)
                        attr.show = new Cesium.ShowGeometryInstanceAttribute( show );
                }*/
            }
            if (this._shapes[i].vehicle){
                this._shapes[i].vehicle.show = (show && this._shapes[i].show_vehicle != false);
                //this._shapes[j].show_vehicle = show_vehicle;
            }
        }
    },
    getShape: function (no) {
        for (var i = 0; i < this._shapes.length; i++) {
            if (no == this._shapes[i].no)
                return this._shapes[i];
        }
        return false;
    },
    addPoint: function (shape, t, lng, lat, values, draw) {
        if (values.length != shape.names.length){
            console.log('非法数据');
            return -1;
        }
        var data;
        if (shape.data != undefined){
            data = shape.data;
        } else {
            shape.data = [];
            data = shape.data;
        }

        var dataSave;
        if (shape.dataSave != undefined){
            dataSave = shape.dataSave;
        } else {
            shape.dataSave = [];
            dataSave = shape.dataSave;
        }
        
        var row = undefined;
        if (data.length > 0 && equalPosition(data[data.length - 1].pos, {lng:lng,lat:lat})){
             var jTVOC= -1; 
             for (var i = 0; i < shape.names.length; i++) {
             if (shape.names[i].trim()=="TVOC") {     
                jTVOC=i;
                break;}
             }
             row = data[data.length - 1];
             row.time = t;
             if (jTVOC < 0 || data[data.length - 1].val[jTVOC] < values[jTVOC]) {
                  for (var i in values){
                 row.val[i] = values[i];
             }
            }

            var rowSave = {time:t,pos:{lng:lng,lat:lat},val:[]};
            for (var i in values){
            rowSave.val[i] = values[i];
            }
            dataSave.push(rowSave);
            //return;
        }else{
            row = {time:t,pos:{lng:lng,lat:lat},val:[]};
            for (var i in values){
            row.val[i] = values[i];
            }
            
            data.push(row);
            dataSave.push(row);

        }
        row.val_update = true;
        if (draw != false)
            this._drawImage(shape);

        return data.length;

        function equalPosition (pos1, pos2) {
            if (equalF(pos1.lng, pos2.lng) && equalF(pos1.lat, pos2.lat))
                return true;
            else
                return false;
            function equalF(f1, f2) {
                if (f1 > f2 || f1 < f2)
                    return false;
                return true;
            }
        }
    },
    refresh: function (shape, cb) {
        var shapes;
        if (!shape)
            shapes = this._shapes;
        else
            shapes = [shape];

        var that = this;

        PDTools.showLoading(true, true);
        setTimeout(function () {
            freshShape(0, function () {
                PDTools.showLoading(false, true);
                if (shape)
                    that.autoFit(shape);
                cb && cb();
            });
        }, 1000);

        function freshShape(index, cb){
            if (index > shapes.length - 1){
                cb(true);
                return;
            }
            shapes[index].autofit = undefined;
            fresh(shapes[index], 0, function () {
                freshShape(index+1, cb);
                return;
            });
        }
        function fresh(shape, pos, cb) {
            if (!shape.data || pos > shape.data.length - 1) {
                cb(true);
                return;
            }else if (pos == 0){
                for (var i in shape.primitives){
                    that._viewer.scene.primitives.remove(shape.primitives[i]);
                }
                shape.primitives = [];
            }
            var i = pos;
            for (; i < pos + 100 && i < shape.data.length; i ++) {
                shape.data[i].val_update = true;
                //console.log('fresh ' + i);
            }
            that._drawImage(shape);
            setTimeout(function () {
                fresh(shape, i, cb);
            }, 100);
        }
    },
    setViewer: function (viewer) {
        this._viewer = viewer;
    },
    getViewer: function(){
        return this._viewer;
    },
    setMaterial: function (material, alpha, shape, material_single) {
        if (material != undefined)
            this._material = material;//PDCommon.Clone(material);
        if (alpha != undefined && alpha >= 10 && alpha <= 100)
            this._alpha = alpha / 100;
        if (shape != undefined)
            this._chart = shape;
        if (material_single != undefined)
            this._material_single = material_single;
    },
    setFunPosTransform: function (funPosTransform) {
        this._funPosTransform = funPosTransform;
    },
    setFunUpdateMaterial: function (fun) {
        this._funUpdateMaterial = fun;
    },
    _material_cache: [],
    _material_single_only_cache: false,
    _updateMaterial(material){
        if (!this._funUpdateMaterial) return;

        var material_single_only = this._material_single.show;
        if (material_single_only != false){
            for (var i in this._shapes){
                if (!this._shapes[i].single_meterial)
                    material_single_only = false;
            }
        }
        
        
        var change = false;
        if (material){
            for (var i = 0; i < this._material.length; i ++){
                if (i > this._material_cache.length - 1){
                    change = true;
                    break;
                }
                if (this._material[i].show != this._material_cache[i].show
                    || this._material[i].name != this._material_cache[i].name
                    || this._material[i].has != this._material_cache[i].has
                    ||this._material[i].colorString != this._material_cache[i].colorString
                ){
                    change = true;
                    break;
                }
            }
            if (change){
                this._material_cache = PDCommon.Clone(material);
                this._funUpdateMaterial(PDCommon.Clone(material));
            }
        }
        if (material_single_only != undefined && this._material_single_only_cache != material_single_only){
            this._material_single_only_cache = material_single_only;
            this._funUpdateMaterial(undefined, material_single_only);
        }  
    },
    setZoom: function (zoom) {
        if (zoom != undefined)
            this._zoom = zoom;
        for (var i = 0; i < this._shapes.length; i++){
            if (!this._shapes[i].file || this._aspect_ratio == 0){
                this._shapes[i].zoom = zoom;
            }
        }
    },
    _autofit_offset: Cesium.Camera.DEFAULT_OFFSET,
    setAuoFitParam: function(enabled, angle1, angle2){
        if (!enabled){
            Cesium.Camera.DEFAULT_OFFSET = this._autofit_offset;
        } else{
            var heading = parseFloat(angle2);
            var pitch = 0 - parseFloat(angle1);
            var offset = new Cesium.HeadingPitchRange(Cesium.Math.toRadians(heading), Cesium.Math.toRadians(pitch), 0);
            Cesium.Camera.DEFAULT_OFFSET = offset;
        }
    },
    setAspectRatioWhileFileMode: function (ratio) {
        this._aspect_ratio = ratio;
        var that = this;
        for (var i = 0; i < this._shapes.length; i++){
            if (this._shapes[i].file){
                this._shapes[i].zoom = calcZoom(this._shapes[i].data, ratio);
            }
        }
        function calcZoom(data, ratio) {
            if (ratio == 0)
                return that._zoom;
            var box;
            for (var i = 0; i < data.length; i ++){
                var lng = parseFloat(data[i].pos.lng);
                var lat = parseFloat(data[i].pos.lat);
                var height = 0;
                for (var j = 2; j < data[i].val.length; j ++){
                    var val = data[i].val[j];
                    height += val;
                }
                box = that._changeAutoFitArea(box, lng, lat, height);
            }
            if (!box || !box.height) return that._zoom;
            var length1 = PDDrawerHelper.getDistance(box.left, box.bottom, box.right, box.bottom);
            var length2 = PDDrawerHelper.getDistance(box.left, box.bottom, box.left, box.top);
            if (length2 > length1)
                length1 = length2;
            return length1 / ratio / box.height;
        }
    },
    setShapeParam: function (dot_width, path_width, path_color_string) {
        if (path_color_string.indexOf('#')!=0)
            path_color_string = '#'+path_color_string;
        this._shape_dot_width = parseFloat(dot_width);
        this._shape_path.width = parseFloat(path_width);
        this._shape_path.colorString = path_color_string;
    },
    autoFit: function (shapes, cb) {
        if (!shapes)
            shapes = this._shapes;

        if (!this._viewer) return false;
        var autofitbox;
        if (shapes.top != undefined){
            autofitbox = shapes;
        }else{
            for (var i in shapes){
                var autofit = shapes[i].autofit;
                if (autofit && shapes[i].show !=false){
                    autofitbox = this._changeAutoFitArea(autofitbox, autofit.left, autofit.top, autofit.height);
                    autofitbox = this._changeAutoFitArea(autofitbox, autofit.right, autofit.top, autofit.height);
                    autofitbox = this._changeAutoFitArea(autofitbox, autofit.right, autofit.bottom, autofit.height);
                    autofitbox = this._changeAutoFitArea(autofitbox, autofit.left, autofit.bottom, autofit.height);
                }
            }
        }
        
        if (!autofitbox) return false;
        if (this._entityToFit)
            this._viewer.entities.remove(this._entityToFit);
        var pos = [];
        pos.push(autofitbox.left);
        pos.push(autofitbox.top);
        pos.push(autofitbox.right);
        pos.push(autofitbox.bottom);
        this._entityToFit = new Cesium.Entity({
            name: 'auto',
            wall: {
                positions: Cesium.Cartesian3.fromDegreesArray(pos),
                maximumHeights: [autofitbox.height, autofitbox.height],
                minimumHeights: [0,0],
                material: Cesium.Color.fromCssColorString('rgba(255,0,0,0.001)'),// Cesium.Color.fromCssColorString('rgba(255,0,0,0.2)'),//
                outline: false,
                outlineColor: Cesium.Color.BLACK
            }
        });
        /*this._entityToFit = new Cesium.Entity({
            name: 'auto',
            rectangle : {
                coordinates : Cesium.Rectangle.fromDegrees(autofitbox.left, autofitbox.bottom, autofitbox.right, autofitbox.top),
                material : Cesium.Color.GREEN.withAlpha(0.5),
                extrudedHeight : autofitbox.height,
                height : 0
            }
        });*/
        this._viewer.entities.add(this._entityToFit);
        //var offset = new Cesium.HeadingPitchRange(Cesium.Math.toRadians(90), Cesium.Math.toRadians(-30), 0);
        //this._viewer.zoomTo(this._entityToFit, offset);
        //Cesium.Camera.DEFAULT_OFFSET = offset;
        Cesium.when(this._viewer.flyTo(this._entityToFit)).then(function(model) {
            if (cb){
                setTimeout(cb, 100);
            }
           
        }).otherwise(function(error){});
        return true;
    },
    getOffsetPos: function (no, t, lng, lat) {
        var that = this;
        for (var i in this._shapes){
            if (no == this._shapes[i].no){
                var shape = this._shapes[i];
                for (var j in shape.data){

                    if (shape.data[j].time == t && equalPosition({lng: lng, lat: lat}, shape.data[j].pos)){
                        var pos = PDDrawerHelper.convertDistanceToLogLat2(shape.data[j].pos.lng, shape.data[j].pos.lat, shape.offset.angle, shape.offset.distance);
                        pos = [pos.lng, pos.lat];
                        if (that._funPosTransform) {
                            var pos_transform = that._funPosTransform(pos[0], pos[1]);
                            pos[0] = pos_transform.x;
                            pos[1] = pos_transform.y;
                        }

                        return {lng: pos[0], lat: pos[1]};
                    }
                }
                break;
            }
        }
        return {lng: lng, lat:lat};
        function equalPosition (pos1, pos2) {
            if (equalF(pos1.lng, pos2.lng) && equalF(pos1.lat, pos2.lat))
                return true;
            else
                return false;
            function equalF(f1, f2) {
                if (f1 > f2 || f1 < f2)
                    return false;
                return true;
            }
        }
    },
    offsetShape: function (no, angle, distance) {
        var shape;
        for (var i = 0; i < this._shapes.length; i++){
            if (no == this._shapes[i].no){
                shape = this._shapes[i];
                shape.offset.angle = angle;
                shape.offset.distance = distance;
                this.refresh(shape);
                break;
            }
        }

    },
    save: function(type){
        /*if (!this._data || this._data.length == 0 || !this._names || this._names.length == 0){
            PDTools.notify('没有数据可以保存');
            return;
        }*/
        var filter;
        var data;
        var names;
        var shape;
        if (type.src){
            filter = 'CSV文件(*.csv)|*.csv;|文本文件(*.txt)|*.txt;';
            // for (var i = 0; i < this._shapes.length; i ++){
            //     if (type.src == this._shapes[i].no){
            //         data = this._shapes[i].dataSave;
            //         names = this._shapes[i].names;
            //         shape = this._shapes[i];
            //         break;
            //     }
            // }
            
            for (var i = 0; i < this._xjshapes.length; i ++){
                if (type.src == this._xjshapes[i].no){
                    var str = JSON.stringify(this._xjshapes[i].dataSave);
                    data = JSON.parse(str);
                    // datatemp = this._xjshapes[i].dataSave;
                    names = this._xjshapes[i].names;
                    shape = this._xjshapes[i];
                    break;
                }
            }
            

            //去重
            for (var i = 0; i < data.length; i++) {
                for (var j = i + 1; j < data.length; j++) {
                    if (data[i].time === data[j].time) {
                        data.splice(j, 1)
                        j--;
                    }
                }
            }

            //排序
            for (var i = 0; i < data.length - 1; i++) {
                for (var j = 0; j < data.length - 1 - i; j++) {
                    if (data[j].time > data[j + 1].time) {
                        var temp = data[j];
                        data[j] = data[j + 1];
                        data[j + 1] = temp;
                    }
                }
            }


        }else if (type.location){
            filter = '图片(*.png)|*.png;';
        } else {return;}

        var that = this;
        var file = new Date();
        file = '污染物'+(1900+file.getYear())+'-'+(file.getMonth()+1)+'-'+file.getDate()+'_'+file.getHours()+'-'+file.getMinutes()+'-'+file.getSeconds();//+'.csv';
        PDCommon.FileSelect(filter, file, function (res) {
            if (!res || !res.result || res.result.file == '')
                return;

            var file = res.result.file.toLowerCase();
            var str = '';
            if (type.src){
                if (!data){
                    PDTools.notify('没有数据');
                    return;
                }

                shape.new_data = false;

                var ext = ['csv','txt'][res.result.filter - 1];
                if (!file.match('\\.'+ext+'$')){
                    file += '.' + ext;
                }
                if (res.result.filter == 1){
                    str = '"时间","经度","纬度",';
                    for (var i in names){
                        str += '"'+names[i]+'",';
                    }
                    str = str.substr(0, str.length - 1);
                    str += "\n";
                    for (var i in data){
                        str += '"'+data[i].time+'",';
                        str += '"'+data[i].pos.lng+'",';
                        str += '"'+data[i].pos.lat+'",';
                        for (var j in data[i].val){
                            str += '"'+data[i].val[j]+'",';
                        }
                        str = str.substr(0, str.length - 1);
                        str += "\n";
                    }

                    str = new PDBase64().encode(str, 'utf-8');
                    str = PDInterface.stringTranslate(str, 'utf82ascii');

                    //str = new PDBase64().decode(str);
                    PDCommon.FileWrite(file, str, true, function (res) {
                        if (!res || !res.success || !res.result.success)
                            PDTools.notify('写文件失败');
                    })
                } else if (res.result.filter == 2){
                    str = '时间;经度;纬度;';
                    for (var i in names){
                        str += names[i]+';';
                    }
                    str = str.substr(0, str.length - 1);
                    str += "\r\n";
                    for (var i in data){
                        str += data[i].time + ';';
                        str += data[i].pos.lng+';';
                        str += data[i].pos.lat+';';
                        for (var j in data[i].val){
                            str += data[i].val[j]+';';
                        }
                        str = str.substr(0, str.length - 1);
                        str += "\r\n";
                    }

                    str = new PDBase64().encode(str, 'utf-8');
                    str = PDInterface.stringTranslate(str, 'utf82ascii');

                    //str = new PDBase64().decode(str);
                    PDCommon.FileWrite(file, str, true, function (res) {
                        if (!res || !res.success || !res.result.success)
                            PDTools.notify('写文件失败');
                    })
                }
            }else if (type.location){
                var ext = 'png';
                if (!file.match('\\.'+ext+'$')){
                    file += '.' + ext;
                }
                
                
                html2canvas(document.querySelector(".materials_color.single"), {backgroundColor: null}).then(canvas => {
                    var canvasSingle = canvas;
                    html2canvas(document.querySelector(".materials_color.all"), {backgroundColor: null}).then(canvas => {
                        that._viewer.render();
                        var canvasMap = that._viewer.canvas;
                        saveImage(canvasMap, canvasSingle, canvas);
                    });
                });
                
              
                function saveImage(canvasMap, canvasSingle, canvasAll) {
                    var canvasBk = document.createElement('canvas');  //准备空画布
                    canvasBk.width = canvasMap.width;
                    canvasBk.height = canvasMap.height;
                    var context = canvasBk.getContext('2d');

                    context.drawImage(canvasMap, 0, 0);
                    if (type.material_show){
                        context.drawImage(canvasSingle, canvasMap.width - canvasSingle.width - 10, canvasMap.height - canvasSingle.height - 10);
                        context.drawImage(canvasAll, canvasMap.width - canvasSingle.width - canvasAll.width - 20, canvasMap.height - canvasAll.height - 10);    
                    }

                    var text = type.time+'  '+type.location;
                    context.textAlign="center";
                    context.font="20px 微软雅黑";
                    var gradient = context.createLinearGradient(0,0,0,30);
                    gradient.addColorStop("0","rgba(228,234,234,1.0)");
                    gradient.addColorStop("1.0","rgba(121,236,253,1.0)");
                    context.fillStyle = gradient;
                    context.strokeStyle="#ffffff";
                    //context.strokeText(text, canvasMap.width/2, 100);
                    context.fillText(text, canvasMap.width/2, 100);
                    context.font="40px 微软雅黑";
                    //context.strokeText(type.title,canvasMap.width/2, 70);
                    context.fillText(type.title, canvasMap.width/2, 70);

                    

                    drawLogo(context, function(success){
                        var angle = Math.atan(canvasBk.width/canvasBk.height);
                        var canvasWaterMark = document.createElement('canvas');  //准备空画布
                        canvasWaterMark.width = canvasBk.width*Math.cos(angle)+canvasBk.height*Math.sin(angle);
                        canvasWaterMark.height = canvasMap.height/Math.cos(angle);
                        var contextWaterMark = canvasWaterMark.getContext('2d');
                        //contextWaterMark.fillStyle = 'rgba(255,0,255,1.0)';
                        //contextWaterMark.fillRect(0,0,canvasWaterMark.width,canvasWaterMark.height);
                        contextWaterMark.textAlign="start";
                        contextWaterMark.font="30px 宋体";
                        contextWaterMark.fillStyle = 'rgba(255,255,255,0.3)';
                        var width = contextWaterMark.measureText('广州禾信仪器股份有限公司').width + 200;
                        var height = 200;
                        for (var pos = 0; pos < canvasWaterMark.width; pos += width){
                            for (var pos2 = 0; pos2 < canvasWaterMark.height; pos2 += height) {
                                contextWaterMark.fillText('广州禾信仪器股份有限公司', pos, pos2);
                            }
                        }

                        //平移让中心点对齐
                        context.translate(0-(canvasWaterMark.width - canvasBk.width)/2, 0 - (canvasWaterMark.height - canvasBk.height)/2);
                        //中心点旋转
                        context.translate(canvasWaterMark.width/2, canvasWaterMark.height/2);
                        context.rotate(-angle);
                        context.translate(0 - canvasWaterMark.width/2, 0 - canvasWaterMark.height/2);
                        context.drawImage(canvasWaterMark, 0, 0);
                        context.translate(canvasWaterMark.width/2, canvasWaterMark.height/2);
                        context.rotate(angle);
                        context.translate(-canvasWaterMark.width/2, -canvasWaterMark.height/2);
                        context.restore();

                        str = canvasBk.toDataURL();
                        str = str.substr('data:image/png;base64,'.length);
                        //str = new PDBase64().decode(str);
                        PDCommon.FileWrite(file, str, true, function (res) {
                            if (!res || !res.success || !res.result.success)
                                PDTools.notify('写文件失败');
                        });
                    });
                }
                function drawLogo(context, cb){
                    var img = new Image();
                    img.src = "./images/logo.png";
                    img.onload = function(){
                        context.drawImage(img, 10, 10, 32, 32);
                        cb(true);        
                    };
                    img.onerror = function(){
                        cb(false);
                    }
                }

                //http://html2canvas.hertzen.com/configuration

                //var str = that._viewer.canvas.toDataURL();
                /*var canvas = $('canvas')[0];
                var gl = canvas.getContext("experimental-webgl", {preserveDrawingBuffer: true});
                var url = canvas.toDataURL();
                */
            }
        });
    },
    _autoSave: function(dev_id){
        var shape;
        for (var i = 0; i < this._shapes.length; i++){
            if (dev_id == this._shapes[i].no && !this._shapes[i].file){
                shape = this._shapes[i];
                break;
            }
        }
        if (!shape) return;

        var names = shape.names;
        var data = shape.dataSave;
        str = '时间;经度;纬度;';
        for (var i in names){
            str += names[i]+';';
        }
        str = str.substr(0, str.length - 1);
        str += "\r\n";
        for (var i in data){
            str += data[i].time + ';';
            str += data[i].pos.lng+';';
            str += data[i].pos.lat+';';
            for (var j in data[i].val){
                str += data[i].val[j]+';';
            }
            str = str.substr(0, str.length - 1);
            str += "\r\n";
        }

        str = new PDBase64().encode(str, 'utf-8');
        str = PDInterface.stringTranslate(str, 'utf82ascii');

        var t = shape.t;
        t = t.replace(/[ ]/g, '_');
        t = t.replace(/:/g, '-');
        var n = shape.name;
        n = n.replace(/[\\\\/:*?\"<>|]/g, '');
        
        var file = PDCommon.GetRunDir();
        file += "data";
        PDCommon.DirectoryCreate2(file);
        file += "\\" + n + ' ' + t + ".txt";

        //str = new PDBase64().decode(str);
        PDCommon.FileWrite(file, str, true, function (res) {
            if (!res || !res.success || !res.result.success)
                PDTools.notify('写文件失败');
        });

    },
    _funUpdateMaterial:undefined,
    _shapes: [],
    _xjshapes:[],
    _material: [],
    _alpha : 0.9,
    _chart: PDConfig.const.SHAPE_PILLAR,
    _aspect_ratio: 0,
    _zoom: 10,
    _shape_dot_width: 10,
    _shape_path:{width: 10, colorString:'#f00'},
    _vehicle_show: true,
    _viewer: undefined,
    _funPosTransform: undefined,
    _entityToFit: undefined,
    _material_single: undefined,
    _test: true,
    _drawImage: function (shape) {
        if (this._test == false){
            this._test = true;
            var that = this;
            var handler = new Cesium.ScreenSpaceEventHandler( this._viewer.scene.canvas );
            //设置单击事件的处理句柄
            handler.setInputAction( function( mouse ) {
                var pick = that._viewer.scene.pick( mouse.position );
                if ( Cesium.defined( pick )  ) {
                    console.log( pick.id);
                }else{
                }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK );//); //Cesium.ScreenSpaceEventType.MOUSE_MOVE
            /*handler.setInputAction( function( movement ) {
                //console.log(movement.endPosition.x + ' ' + movement.endPosition.y);
                var pick = that._viewer.scene.pick( movement.endPosition );
                if ( Cesium.defined( pick )  ) {
                    console.log( pick.id);
                }else{
                    //console.log('no');
                }
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);*/
        }
        if (typeof shape != 'object'){
            for (var i = 0; i < this._shapes.length; i++){
                if (shape == this._shapes[i].no){
                    shape = this._shapes[i];
                    break;
                }
            }
        }
        if (typeof shape != 'object'){
            PDTools.notify('shape 参数错误');
            return;
        }
        //console.log('_drawImage');
        if (!this._viewer){
            PDTools.notify('viewer 错误');
            return;
        }
        var data = shape.data;
        var zoom = shape.zoom;
        var show = true;//shape.show != false;

        if (!data || data.length == 0){
            this.removeShape(shape);
            return;
        }
        var that = this;

        var materielColor = getMaterielColor(shape.names);
        var count_show = 0;
        for (var i in materielColor){
            if (materielColor[i].show)
                count_show ++;
        }
        shape.single_meterial = count_show == 1;
        that._updateMaterial(that._material);
        
        var chart = that._chart;
        if (count_show == 0)
            chart = PDConfig.const.SHAPE_PATH;

        //console.log(data.length);
        for (var i = 0; i < data.length; i ++) {
            //console.log(i);
            {
                //if (chart == PDConfig.const.SHAPE_PATH && shape.file && i < shape.pos_total - 1)
                //    continue;
                if (data[i].val_update != true){
                    data[i].val_update = false;
                    continue;
                }
                data[i].val_update = false;
                //console.log(' ' + i);

                if (chart == PDConfig.const.SHAPE_DOT){
                    del(i);
                    add(i, shape.offset.angle, shape.offset.distance);
                } else if (chart == PDConfig.const.SHAPE_PATH){
                    if (i > 0){
                        add(i - 1, shape.offset.angle, shape.offset.distance);
                    }else{
                        continue;
                    }
                } else{
                    if (i > 0){
                        del(i - 1);
                        add(i - 1, shape.offset.angle, shape.offset.distance);
                    }else{
                        continue;
                    }
                }
            }
            function del(index){
                //return;
                if (index < 0 || index >= shape.primitives.length)
                    return;
                if (shape.primitives[index])
                    that._viewer.scene.primitives.remove(shape.primitives[index]);
                shape.primitives.splice(index, 1);
            }

            function add(index, angle, distance) {
                if (materielColor.length != data[index].val.length){
                    PDTools.notify('错误 color.length != val.length');
                    return;
                }
                var instances0 = [];
                var instances = [];
                var h = 0;
                var h2 = 0;


                var vehicle_azimuth;
                var vehicle_pos;
                var vehicle_off = 0;
                var pos;
                if (chart == PDConfig.const.SHAPE_DOT) {
                    pos = PDDrawerHelper.convertDistanceToLogLat2(data[index].pos.lng, data[index].pos.lat, angle, distance);
                    pos = [pos.lng, pos.lat];
                    if (that._funPosTransform) {
                        var pos_transform = that._funPosTransform(pos[0], pos[1]);
                        pos[0] = pos_transform.x;
                        pos[1] = pos_transform.y;
                    }
                    if (index > 0){
                        vehicle_pos =  {lng: pos[0], lat: pos[1]};
                        var pos_pre = PDDrawerHelper.convertDistanceToLogLat2(data[index-1].pos.lng, data[index-1].pos.lat, angle, distance);
                        pos_pre = [pos_pre.lng, pos_pre.lat];
                        if (that._funPosTransform){
                            var pos_transform = that._funPosTransform(pos_pre[0], pos_pre[1]);
                            pos_pre[0] = pos_transform.x;
                            pos_pre[1] = pos_transform.y;
                        }

                        vehicle_azimuth = PDDrawerHelper.getAzimuth(pos_pre[0], pos_pre[1], vehicle_pos.lng, vehicle_pos.lat);
                        vehicle_off = that._shape_dot_width / 2;
                    }
                }else{
                    pos = PDDrawerHelper.convertDistanceToLogLat2(data[index].pos.lng, data[index].pos.lat, angle, distance);
                    pos = [pos.lng, pos.lat];
                    var pos2 = PDDrawerHelper.convertDistanceToLogLat2(data[index+1].pos.lng, data[index+1].pos.lat, angle, distance);
                    pos.push(pos2.lng);
                    pos.push(pos2.lat);

                    if (that._funPosTransform){
                        var pos_transform = that._funPosTransform(pos[0], pos[1]);
                        pos[0] = pos_transform.x;
                        pos[1] = pos_transform.y;
                        pos_transform = that._funPosTransform(pos[2], pos[3]);
                        pos[2] = pos_transform.x;
                        pos[3] = pos_transform.y;
                    }
                    vehicle_pos = {lng: pos[2], lat:pos[3]};
                    vehicle_azimuth = PDDrawerHelper.getAzimuth(pos[0], pos[1], vehicle_pos.lng, vehicle_pos.lat);
                }

                if (vehicle_azimuth != undefined && !shape.file)
                    updateVehicle(shape, vehicle_azimuth, vehicle_pos, vehicle_off);

                if (chart == PDConfig.const.SHAPE_PATH){
                    shape.autofit = that._changeAutoFitArea(shape.autofit, pos[0], pos[1], 10);
                    shape.autofit = that._changeAutoFitArea(shape.autofit, pos[2], pos[3], 10);

                    var width = that._shape_path.width;
                    //线条
                    //console.log(shape.pos_total + ' ' + index);
                    if (!shape.file || (shape.file && index == shape.pos_total - 2) ){
                        var positions = [];
                        for (var i in data){
                            var p = PDDrawerHelper.convertDistanceToLogLat2(data[i].pos.lng, data[i].pos.lat, angle, distance);
                            p = [p.lng, p.lat];
                            if (that._funPosTransform) {
                                var pos_transform = that._funPosTransform(p[0], p[1]);
                                p = [pos_transform.x, pos_transform.y];
                            }
                            positions.push(p[0]);
                            positions.push(p[1]);
                        }
                        var instance = new Cesium.GeometryInstance({
                            geometry:new Cesium.CorridorGeometry({
                                vertexFormat : Cesium.VertexFormat.POSITION_ONLY,
                                positions : Cesium.Cartesian3.fromDegreesArray(positions),
                                width: width,
                                height: 0,
                                cornerType: Cesium.CornerType.BEVELED
                            }),
                            id: shape.no + '_'+index + '_0',
                            attributes: {
                                color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromCssColorString(that._shape_path.colorString).withAlpha(0.999)),
                                show : new Cesium.ShowGeometryInstanceAttribute( show )
                            }
                        });
                        instances0.push(instance);
                    } 
                    //箭头
                    var len = PDDrawerHelper.getDistance(pos[0], pos[1], pos[2], pos[3]);
                    width = width / 3;
                    if (index % 5 == 0/* && len > 2*width*/){
                        var azimuth = PDDrawerHelper.getAzimuth(pos[0], pos[1], pos[2], pos[3]);
                        var pos_arrow_top = PDDrawerHelper.convertDistanceToLogLat2(pos[0], pos[1], azimuth, len / 2 + width);
                        var pos_arrow_bottom = PDDrawerHelper.convertDistanceToLogLat2(pos[0], pos[1], azimuth, len / 2 - width);
                        var pos1 = PDDrawerHelper.convertDistanceToLogLat2(pos_arrow_bottom.lng, pos_arrow_bottom.lat, azimuth - 90, width/2);
                        var pos2 = PDDrawerHelper.convertDistanceToLogLat2(pos_arrow_bottom.lng, pos_arrow_bottom.lat, azimuth + 90, width/2);
                        var pos3 = pos_arrow_top;
    
                        var instance = new Cesium.GeometryInstance({
                            geometry:new Cesium.PolygonGeometry({
                                polygonHierarchy :
                                    //new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray([pos1.lng, pos1.lat, pos2.lng, pos2.lat, pos3.lng, pos3.lat, pos4.lng, pos4.lat])),
                                    new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray([pos1.lng, pos1.lat, pos2.lng, pos2.lat, pos3.lng, pos3.lat])),
                                height: 0.1,
                            }),
                            id: shape.no + '_'+index + '_1',
                            attributes: {
                                color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromCssColorString('#f00')),
                                show : new Cesium.ShowGeometryInstanceAttribute( show )
                            }
                        });
                        instances.push(instance);
                    }
                    
                }else{
                    for (var i in data[index].val){
                        if (materielColor[i].show == false)
                            continue;
                        if (chart == PDConfig.const.SHAPE_DOT){
                            var colorString = materielColor[i].colorString;
                            if (count_show == 1)
                                colorString = getMaterielSingleColor(data[index].val[i], colorString);

                            if (colorString.indexOf('#') != 0)
                                colorString = '#' + colorString;

                            var top1 = h + data[index].val[i];

                            var width = that._shape_dot_width / 2;
                            var west = PDDrawerHelper.convertDistanceToLogLat2(pos[0], pos[1], 270, width).lng;
                            var south = PDDrawerHelper.convertDistanceToLogLat2(pos[0], pos[1], 180, width).lat;
                            var east = PDDrawerHelper.convertDistanceToLogLat2(pos[0], pos[1], 90, width).lng;
                            var north = PDDrawerHelper.convertDistanceToLogLat2(pos[0], pos[1], 0, width).lat;
                            //continue;

                            shape.autofit = that._changeAutoFitArea(shape.autofit, pos[0], pos[1], top1 * zoom);

                            var color = Cesium.Color.fromCssColorString(formatColorWithAlpha(colorString, that._alpha));
                            var instance = new Cesium.GeometryInstance({
                                geometry: new Cesium.RectangleGeometry({
                                    ellipsoid : Cesium.Ellipsoid.WGS84,
                                    rectangle : Cesium.Rectangle.fromDegrees(west, south, east, north),
                                    height : h*zoom,
                                    extrudedHeight: top1*zoom
                                }),
                                id: shape.no + '_'+index + '_' + i,
                                attributes: {
                                    color: Cesium.ColorGeometryInstanceAttribute.fromColor(color),
                                    show : new Cesium.ShowGeometryInstanceAttribute( show )
                                }
                            });
                            /*var instance = new Cesium.GeometryInstance({
                                geometry: new Cesium.CircleGeometry({
                                    ellipsoid : Cesium.Ellipsoid.WGS84,
                                    center : Cesium.Cartesian3.fromDegrees(pos[0], pos[1]),
                                    radius: that._shape_dot_width / 2,
                                    height : h*zoom,
                                    extrudedHeight: top1*zoom
                                }),
                                id: shape.no + '_'+index + '_' + i,
                                attributes: {
                                    color: Cesium.ColorGeometryInstanceAttribute.fromColor(color)
                                }
                            });*/
                            instances.push(instance);

                            h += data[index].val[i];
                        }else{
                            var colorString = materielColor[i].colorString;
                            if (count_show == 1)
                                colorString = getMaterielSingleColor(data[index].val[i], colorString);

                            if (colorString.indexOf('#') != 0)
                                colorString = '#' + colorString;
                            var bottom1 = h;
                            var top1 = h + data[index].val[i];
                            var bottom2 = bottom1;
                            var top2 = top1;
                            if (chart == PDConfig.const.SHAPE_PILLAR){
                            } else if (chart == PDConfig.const.SHAPE_LINE){
                                bottom2 = h2;
                                top2 = h2 + data[index+1].val[i];
                            }

                            shape.autofit = that._changeAutoFitArea(shape.autofit, pos[0], pos[1], top1 * zoom);
                            shape.autofit = that._changeAutoFitArea(shape.autofit, pos[2], pos[3], top2 * zoom);
                            //console.info(shape.autofit);

                            var color = Cesium.Color.fromCssColorString(formatColorWithAlpha(colorString, that._alpha));
                            var instance = new Cesium.GeometryInstance({
                                geometry:new Cesium.WallGeometry({
                                    positions: Cesium.Cartesian3.fromDegreesArray(pos),
                                    maximumHeights: [top1 * zoom, top2 * zoom],
                                    minimumHeights: [bottom1*zoom, bottom2*zoom]
                                }),
                                id: shape.no + '_'+index + '_' + i,
                                attributes: {
                                    color: Cesium.ColorGeometryInstanceAttribute.fromColor(color),
                                    show : new Cesium.ShowGeometryInstanceAttribute( show )
                                }
                            });

                            instances.push(instance);
                            h += data[index].val[i];
                            h2 += data[index+1].val[i];
                        }


                        function formatColorWithAlpha(colorString, alpha) {
                            var r = colorString.substr(1, 2);
                            var g = colorString.substr(3, 2);
                            var b = colorString.substr(5, 2);
                            r = parseInt(r, 16);
                            g = parseInt(g, 16);
                            b = parseInt(b, 16);
                            if (alpha < 1)
                                return 'rgba('+r+','+g+','+b+','+alpha+')';
                            else
                                return colorString;
                        }

                    }
                }

                if (shape.primitives == undefined) shape.primitives = [];
                if (chart == PDConfig.const.SHAPE_PATH){
                    //线条
                    if (!shape.file){
                        var old;
                        if (shape.primitives.length > 0)
                            old = shape.primitives[0];
                        var primitive = new Cesium.Primitive({
                            geometryInstances: instances0,
                            allowPicking: chart != PDConfig.const.SHAPE_PATH,
                            appearance: new Cesium.PerInstanceColorAppearance({
                                flat: true,
                                translucent: true,
                                faceForward: true
                            })
                        });
                        shape.primitives.splice(0, 1, primitive);
                        that._viewer.scene.primitives.add(primitive);
                        setTimeout(function () {
                            if (old) that._viewer.scene.primitives.remove(old);
                        }, 1);
                    }else{
                        if (instances0.length > 0 ){//index == shape.pos_total - 2){
                            var primitive = new Cesium.Primitive({
                                geometryInstances: instances0,
                                allowPicking: chart != PDConfig.const.SHAPE_PATH,
                                appearance: new Cesium.PerInstanceColorAppearance({
                                    flat: true,
                                    translucent: true,
                                    faceForward: true
                                })
                            });
                            shape.primitives.splice(0, 0, primitive);
                            that._viewer.scene.primitives.add(primitive);
                        }
                    }
                    //箭头
                    if (instances.length > 0){
                        var primitive = new Cesium.Primitive({
                            geometryInstances: instances,
                            allowPicking: chart != PDConfig.const.SHAPE_PATH,
                            appearance: new Cesium.PerInstanceColorAppearance({
                                flat: true,
                                translucent: false,
                                faceForward: true
                            })
                        });
                        shape.primitives.push(primitive);
                        that._viewer.scene.primitives.add(primitive);
                    }
                    
                } else {
                    var primitive = new Cesium.Primitive({
                        geometryInstances: instances,
                        allowPicking: chart != PDConfig.const.SHAPE_PATH,
                        appearance: new Cesium.PerInstanceColorAppearance({
                            flat: true,
                            translucent: that._alpha < 1,
                            faceForward: true
                        })
                    });
                    shape.primitives.splice(index, 0, primitive);
                    that._viewer.scene.primitives.add(primitive);
                }

                //console.log('index '+index + ' ' + shape.primitives.length);
                function updateVehicle(shape, azimuth, pos, off) {
                    var oldVehicle = shape.vehicle;
                    var show = (shape.show != false && shape.show_vehicle != false);
                   
                    var targetPosition = PDDrawerHelper.convertDistanceToLogLat2(pos.lng, pos.lat, azimuth, off + 70); //车长6米 7/2*20
                    targetPosition = Cesium.Cartesian3.fromDegrees(targetPosition.lng, targetPosition.lat, 0);
                    var heading = Cesium.Math.toRadians(azimuth-90);
                    var pitch = Cesium.Math.toRadians(0);
                    var roll = 0;//Cesium.Math.toRadians(30);
                    var headingPitchRoll = new Cesium.HeadingPitchRoll(heading, pitch, roll);
                    var modelMatrix = new Cesium.Matrix4();
                    Cesium.Transforms.headingPitchRollToFixedFrame(targetPosition, headingPitchRoll, Cesium.Ellipsoid.WGS84, Cesium.Transforms.eastNorthUpToFixedFrame, modelMatrix);
                    shape.vehicle = that._viewer.scene.primitives.add(Cesium.Model.fromGltf({
                        id: PDConfig.const.GEOMETRY_PREFIX_EXTEND + PDConfig.const.GEOMETRY_PREFIX_EXTEND_VEHICLE + shape.no,
                        url : '/pdlocalpath/resources/vehicle.gltf',//如果为bgltf则为.bgltf
                        modelMatrix : modelMatrix,
                        scale : 20,
                        allowPicking: false,
                        show: show
                    }));
                    if (oldVehicle){
                        Cesium.when(shape.vehicle.readyPromise).then(function(model) {
                            model.activeAnimations.addAll({loop : Cesium.ModelAnimationLoop.REPEAT});
                            that._viewer.scene.primitives.remove(oldVehicle);
                        }).otherwise(function(error){});
                    }
           
                }
            }
            function getMaterielColor(dataCol) {
                var materiel = [];
                for (var i = 0; i < dataCol.length; i ++){
                    var color = getColor(dataCol[i], i);
                    if (color == false){
                        var colors = [
                            0x53261f,
                            0xfdb933,
                            0x00a6ac,
                            0xf15a22,
                            0xd3c6a6,
                            0x78cdd1,
                            0xb4533c,
                            0xc7a252,
                            0x008792,
                            0xf15a22,
                            0xc1a173,
                            0x5e7c85
                        ];
                        var cl = colors[i % (colors.length)];
                        color = {name: dataCol[i], show: true, color: cl & 0x00ffffff}
                    }

                    var colorString = color.color.toString(16);
                    var padding = '00000000';
                    colorString = padding.substr(0, 6 - colorString.length) + colorString;
                    materiel.push({name: dataCol[i], show:color.show, color: color.color, colorString: colorString});
                }
                for (var i in materiel){
                    var found = false;
                    for (var j in that._material){
                        if (materiel[i].name == that._material[j].name){
                            found = true;
                            break;
                        }
                    }
                    if (found == false)
                        that._material.push(materiel[i]);
                }
                
                for (var i = dataCol.length - 1; i >= 0; i --){
                    for (var j = 0; j < that._material.length; j ++){
                        if (dataCol[i] == that._material[j].name){
                            var temp = that._material[j];
                            temp.has = true;
                            that._material.splice(j, 1);
                            that._material.splice(0, 0, temp);
                            break;
                        }
                    }
                }
                for (var i in that._material){
                    that._material[i].has = false;
                }
                for (var i in that._shapes){
                    for (var j in that._shapes[i].names){
                        for (var k in that._material){
                            if (that._shapes[i].names[j] == that._material[k].name){
                                that._material[k].has = true;
                            }
                        }
                    }
                }
                
                return materiel;

                function getColor(name, index) {
                    if (!that._material)
                        return false;
                    for (var i in that._material) {
                        if (that._material[i].name == name)
                            return that._material[i];
                    }
                    return false;
                }
            }
            function getMaterielSingleColor(val, colorOld) {
                if (!that._material_single || !that._material_single.show){
                    that._updateMaterial(undefined);
                    return colorOld;
                }
                var colorString = that._material_single.color[0].colorString;
                for (var i = that._material_single.color.length - 1; i >= 0; i --){
                    if (val >= that._material_single.color[i].val){
                        colorString = that._material_single.color[i].colorString;
                        break;
                    }

                }
                that._updateMaterial(undefined);
                return colorString;
            }
        }
    },
    hasNewData: function () {
        var has = false;
        for (var i in this._shapes){
            if (!this._shapes[i].file && this._shapes[i].new_data){
                has = true;
            }
        }
        return has;
    },
    changeShapeColor: function (no, lng, lat, colorString) {
        //if (this._chart == PDConfig.const.SHAPE_PATH)
        var that = this;
        for (var i in this._shapes){
            if (no == this._shapes[i].no){
                for (var j in this._shapes[i].data){
                    if (equalPosition({lng: lng, lat: lat}, this._shapes[i].data[j].pos)){
                        change(this._shapes[i], j, colorString);
                        break;
                    }
                }
                break;
            }
        }
        function change(shape, index, colorString) {
            if (index >= shape.primitives.length) return;

            for (var i in shape.data[index].val){
                if (index > shape.primitives.length - 1)
                    continue;
                var attr = shape.primitives[index].getGeometryInstanceAttributes(shape.no + '_'+index + '_' + i);
                if (attr){
                    var color;
                    if (typeof colorString == 'number') {
                        color = Cesium.Color.fromCssColorString(getValColor(shape.names[i], shape.data[index].val[i], shape.single_meterial));
                        //color = color.brighten(colorString, new Cesium.Color());
                        color = color.darken(colorString, new Cesium.Color());
                    } else if (!colorString || colorString == ''){
                        color = Cesium.Color.fromCssColorString(getValColor(shape.names[i], shape.data[index].val[i], shape.single_meterial));
                        color = color.withAlpha(that._alpha);
                    }else{
                        color = Cesium.Color.fromCssColorString(colorString);
                    }
                    attr.color = Cesium.ColorGeometryInstanceAttribute.toValue(color);
                    /*var attributes = primitive.getGeometryInstanceAttributes('an id');
                    attributes.color = Cesium.ColorGeometryInstanceAttribute.toValue(Cesium.Color.AQUA);
                    attributes.show = Cesium.ShowGeometryInstanceAttribute.toValue(true);
                    attributes.distanceDisplayCondition = Cesium.DistanceDisplayConditionGeometryInstanceAttribute.toValue(100.0, 10000.0);
                    attributes.offset = Cesium.OffsetGeometryInstanceAttribute.toValue(Cartesian3.IDENTITY);*/
                }
            }
        }
        function getValColor(name, val, shape_single_meterial) {
            var colorString = '#fff';
            
            if (!!that._material_single && !!that._material_single.show && shape_single_meterial) {//){
                colorString = that._material_single.color[0].colorString;
                for (var i = that._material_single.color.length - 1; i >= 0; i --){
                    if (val >= that._material_single.color[i].val){
                        colorString = that._material_single.color[i].colorString;
                        break;
                    }
                } 
            }else{
                for (var i in that._material){
                    if (that._material[i].name == name) {
                        var colorString = that._material[i].colorString;
                        break;
                    }
                }
            }
            if (colorString.indexOf('#') != 0)
                        colorString = '#' + colorString;
            return colorString;
        }
        function equalPosition (pos1, pos2) {
            if (equalF(pos1.lng, pos2.lng) && equalF(pos1.lat, pos2.lat))
                return true;
            else
                return false;
            function equalF(f1, f2) {
                if (f1 > f2 || f1 < f2)
                    return false;
                return true;
            }
        }
    },
    _changeAutoFitArea: function(autofit, lng, lat, height) {
        if (autofit == undefined)
            autofit = {left: 10000, right: -10000, top: -10000, bottom: 10000, height:0};

        if (lng < autofit.left)
            autofit.left = lng;
        if (lng > autofit.right)
            autofit.right = lng
        if (lat > autofit.top)
            autofit.top = lat;
        if (lat < autofit.bottom)
            autofit.bottom = lat;
        if (height > autofit.height)
            autofit.height = height;

        return autofit;
    }
};
PDDrawerHelper = {
    /******************************/
    //http://www.cosinekitty.com/compass.html
    getAzimuth: function (lng1, lat1, lng2, lat2, oblate) {
        var azimuth = 0;
        var that = this;
        var a = {lon: lng1, lat: lat1, elv: 0};
        var b = {lon: lng2, lat: lat2, elv: 0};
        var ap = this._LocationToPoint(a, oblate);
        var bp = this._LocationToPoint(b, oblate);
        // Let's use a trick to calculate azimuth:
        // Rotate the globe so that point A looks like latitude 0, longitude 0.
        // We keep the actual radii calculated based on the oblate geoid,
        // but use angles based on subtraction.
        // Point A will be at x=radius, y=0, z=0.
        // Vector difference B-A will have dz = N/S component, dy = E/W component.
        var br = RotateGlobe (b, a, bp.radius, ap.radius, oblate);
        if (br.z*br.z + br.y*br.y > 1.0e-6) {
            var theta = Math.atan2(br.z, br.y) * 180.0 / Math.PI;
            azimuth = 90.0 - theta;
            if (azimuth < 0.0) {
                azimuth += 360.0;
            }
            if (azimuth > 360.0) {
                azimuth -= 360.0;
            }
        }

        /*var p = 0;
        if (lng2 >= lng1 && lat2 >= lat1) p = 1;
        else if (lng2 >= lng1 && lat2 < lat1)  p = 2;
        else if (lng2 < lng1 && lat2 <= lat1) p = 3;
        else if (lng2 < lng1 && lat2 >= lat1) p = 4;
        var str = lng1 + ' ' + lat1 + ' '+ lng2 + ' ' + lat2 + ' ';
        console.log(azimuth + ' ' + p + " " + str);
        */
        return azimuth;
        function RotateGlobe (b, a, bradius, aradius, oblate)
        {
            // Get modified coordinates of 'b' by rotating the globe so that 'a' is at lat=0, lon=0.
            var br = {'lat':b.lat, 'lon':(b.lon - a.lon), 'elv':b.elv};
            var brp = that._LocationToPoint(br, oblate);

            // Rotate brp cartesian coordinates around the z-axis by a.lon degrees,
            // then around the y-axis by a.lat degrees.
            // Though we are decreasing by a.lat degrees, as seen above the y-axis,
            // this is a positive (counterclockwise) rotation (if B's longitude is east of A's).
            // However, from this point of view the x-axis is pointing left.
            // So we will look the other way making the x-axis pointing right, the z-axis
            // pointing up, and the rotation treated as negative.

            var alat = -a.lat * Math.PI / 180.0;
            if (oblate) {
                alat = that._GeocentricLatitude(alat);
            }
            var acos = Math.cos(alat);
            var asin = Math.sin(alat);

            var bx = (brp.x * acos) - (brp.z * asin);
            var by = brp.y;
            var bz = (brp.x * asin) + (brp.z * acos);

            return {'x':bx, 'y':by, 'z':bz, 'radius':bradius};
        }
    },
    getDistance: function (lng1, lat1, lng2, lat2, oblate) {
        //http://www.cosinekitty.com/compass.html
        var a = {lon: lng1, lat: lat1, elv: 0};
        var b = {lon: lng2, lat: lat2, elv: 0};
        var ap = this._LocationToPoint(a, oblate);
        var bp = this._LocationToPoint(b, oblate);

        var dx = ap.x - bp.x;
        var dy = ap.y - bp.y;
        var dz = ap.z - bp.z;
        return Math.sqrt (dx*dx + dy*dy + dz*dz);
    },
    _EarthRadiusInMeters: function (latitudeRadians)      // latitude is geodetic, i.e. that reported by GPS
    {
        // http://en.wikipedia.org/wiki/Earth_radius
        var a = 6378137.0;  // equatorial radius in meters
        var b = 6356752.3;  // polar radius in meters
        var cos = Math.cos (latitudeRadians);
        var sin = Math.sin (latitudeRadians);
        var t1 = a * a * cos;
        var t2 = b * b * sin;
        var t3 = a * cos;
        var t4 = b * sin;
        return Math.sqrt ((t1*t1 + t2*t2) / (t3*t3 + t4*t4));
    },
    _GeocentricLatitude: function(lat)
    {
        // Convert geodetic latitude 'lat' to a geocentric latitude 'clat'.
        // Geodetic latitude is the latitude as given by GPS.
        // Geocentric latitude is the angle measured from center of Earth between a point and the equator.
        // https://en.wikipedia.org/wiki/Latitude#Geocentric_latitude
        var e2 = 0.00669437999014;
        var clat = Math.atan((1.0 - e2) * Math.tan(lat));
        return clat;
    },
    _LocationToPoint: function (c, oblate) {
        // Convert (lat, lon, elv) to (x, y, z).
        var lat = c.lat * Math.PI / 180.0;
        var lon = c.lon * Math.PI / 180.0;
        var radius = oblate ? this._EarthRadiusInMeters(lat) : 6371009;
        var clat   = oblate ? this._GeocentricLatitude(lat)  : lat;

        var cosLon = Math.cos(lon);
        var sinLon = Math.sin(lon);
        var cosLat = Math.cos(clat);
        var sinLat = Math.sin(clat);
        var x = radius * cosLon * cosLat;
        var y = radius * sinLon * cosLat;
        var z = radius * sinLat;

        // We used geocentric latitude to calculate (x,y,z) on the Earth's ellipsoid.
        // Now we use geodetic latitude to calculate normal vector from the surface, to correct for elevation.
        var cosGlat = Math.cos(lat);
        var sinGlat = Math.sin(lat);

        var nx = cosGlat * cosLon;
        var ny = cosGlat * sinLon;
        var nz = sinGlat;

        x += c.elv * nx;
        y += c.elv * ny;
        z += c.elv * nz;

        return {'x':x, 'y':y, 'z':z, 'radius':radius, 'nx':nx, 'ny':ny, 'nz':nz};
    },
    _getRadius : function(c, oblate){
        var lat = c.lat * Math.PI / 180.0;
        var lon = c.lon * Math.PI / 180.0;
        var radius = oblate ? this._EarthRadiusInMeters(lat) : 6371009;
        return radius;
    },
    /************************/
    //https://www.cnblogs.com/leejuan/p/5552460.html
    convertDistanceToLogLat: function (lng1, lat1, distance, azimuth) {
        if (azimuth > 360)
            azimuth = azimuth - 360;
        if (azimuth < 0)
            azimuth = 360 + azimuth;

        var EARTH_ARC = 111.199;
        azimuth = rad(azimuth);
        // 将距离转换成经度的计算公式
        var lon = lng1 + (distance * Math.sin(azimuth)) / (EARTH_ARC * Math.cos(rad(lat1)));
        // 将距离转换成纬度的计算公式
        var lat = lat1 + (distance * Math.cos(azimuth)) / EARTH_ARC;
        return {lng:lon, lat:lat};
    },
    /***********************/
    //https://blog.csdn.net/zengmingen/article/details/68490497
    /**
     * 计算另一点经纬度
     *
     * @param lon
     *            经度
     * @param lat
     *            维度
     * @param lonlat
     *            已知点经纬度
     * @param brng
     *            方位角 正北为0度
     * @param dist
     *            距离（米）
     */
    convertDistanceToLogLat2: function (lon, lat, brng, dist) {
        if (!dist)
            return {lng:lon, lat: lat};

        if (brng > 360)
            brng = brng - 360;
        if (brng < 0)
            brng = 360 + brng;
        /*if (brng >= 0 && brng < 90)
            brng = brng;
        else if (brng >= 90 && brng < 180)
            brng = brng;*/
        /*
         * 大地坐标系资料WGS-84 长半径a=6378137 短半径b=6356752.3142 扁率f=1/298.2572236
         */
        /** 长半径a=6378137 */
        var a = 6378137;
        /** 短半径b=6356752.3142 */
        var b = 6356752.3142;
        /** 扁率f=1/298.2572236 */
        var f = 1 / 298.2572236;

        var alpha1 = rad(brng);
        var sinAlpha1 = Math.sin(alpha1);
        var cosAlpha1 = Math.cos(alpha1);

        var tanU1 = (1 - f) * Math.tan(rad(lat));
        var cosU1 = 1 / Math.sqrt((1 + tanU1 * tanU1));
        var sinU1 = tanU1 * cosU1;
        var sigma1 = Math.atan2(tanU1, cosAlpha1);
        var sinAlpha = cosU1 * sinAlpha1;
        var cosSqAlpha = 1 - sinAlpha * sinAlpha;
        var uSq = cosSqAlpha * (a * a - b * b) / (b * b);
        var A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
        var B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));

        var cos2SigmaM=0;
        var sinSigma=0;
        var cosSigma=0;
        var sigma = dist / (b * A), sigmaP = 2 * Math.PI;
        while (Math.abs(sigma - sigmaP) > 1e-12) {
            cos2SigmaM = Math.cos(2 * sigma1 + sigma);
            sinSigma = Math.sin(sigma);
            cosSigma = Math.cos(sigma);
            var deltaSigma = B * sinSigma * (cos2SigmaM + B / 4 * (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)
                - B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM)));
            sigmaP = sigma;
            sigma = dist / (b * A) + deltaSigma;
        }

        var tmp = sinU1 * sinSigma - cosU1 * cosSigma * cosAlpha1;
        var lat2 = Math.atan2(sinU1 * cosSigma + cosU1 * sinSigma * cosAlpha1,
            (1 - f) * Math.sqrt(sinAlpha * sinAlpha + tmp * tmp));
        var lambda = Math.atan2(sinSigma * sinAlpha1, cosU1 * cosSigma - sinU1 * sinSigma * cosAlpha1);
        var C = f / 16 * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha));
        var L = lambda - (1 - C) * f * sinAlpha
            * (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));

        var revAz = Math.atan2(sinAlpha, -tmp); // final bearing

        return({lng:lon+deg(L), lat: deg(lat2)});

        function rad(d) {
            return d * Math.PI / 180.0;
        }
        function deg(x) {
            return x * 180 / Math.PI;
        }

    }
}
