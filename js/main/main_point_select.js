function Main_InitPointSelect($scope) {
    $scope.chart = {};
    $scope.chart.show_selection = false;
    $scope.chart.hover = undefined;
    $scope.chart.selection = [];
    $scope.chart.points = [];
    $scope.chart.materials = [];
    $scope.chart.points2 = [];
    $scope.chart.materials2 = [];

    var graphic_bar = undefined;
    $scope.chart.pick = false;
    $scope.chart.bar_width = 0;
    $scope.chart.mousemove = function (e) {
        var pick = PDDrawer.getViewer().scene.pick( {x:e.clientX, y:e.clientY});
        if ( Cesium.defined( pick )  ) {
            $scope.chart.pick = getShape(pick.id);
        }else{
            $scope.chart.pick = false;
        }
        function getShape(id) {
            if (id.indexOf(PDConfig.const.GEOMETRY_PREFIX_EXTEND) == 0)
                return false;
            var ret = id.match(/^(.*)_([0-9]*)_([0-9]*)$/);
            if (!ret && ret.length < 4)
                return false;
            else
                return {no:ret[1], pos: parseInt(ret[2]), index: parseInt(ret[3])};
        }
    }
    $scope.$watch('chart', function (val, old) {
        if (val.show_selection != old.show_selection){
            if (val.show_selection == true){
                $scope.statistic_expand = false;
            }else{
                $scope.statistic_expand = true;
            }
        }
        if (val.pick != old.pick){
            if (old.pick){
                changePickColor(old.pick);
            }
            changePickColor(val.pick, 0.6);
        }
        if (val.points.length != old.points.length){
            setTimeout(freshBar, 100);
        }
        if (val.points2.length != old.points2.length || val.points2.length > 0 && !angular.equals(val.points2[0], old.points2[0])){
            setTimeout(freshPie, 100);
        }
        function freshBar(){
            var labels = [];
            $scope.chart.bar_width = $scope.chart.materials.length * $scope.chart.points.length * 20 + 100;
            $scope.$apply();
            //$scope.chart.bar_width = Math.max($scope.chart.bar_width, 400);
            for (var i in $scope.chart.materials){
                //labels.push($scope.chart.materials[i]);
                //labels.push('物质'+i);
                labels.push(fitLabel($scope.chart.materials[i]));
                function fitLabel(label) {
                    return label;
                    var max = 5;
                    if (label.length > 6)
                        label = label.substr(0, 5) + '...';
                    return label;
                }
            }
            //https://api.hcharts.cn/highcharts#exporting
            //https://jshare.com.cn/demos/hhhhD8
            var series = [];
            for (var i in $scope.chart.points){
                var point = {
                    name: '点'+(parseInt(i) + 1),
                    color: getColor(i),
                    data: []
                };
                for (var j in $scope.chart.materials){
                    point.data.push(parseFloat($scope.chart.points[i].val[$scope.chart.materials[j]]));
                    //if (point.data[point.data.length - 1] == 0)
                    //{
                    //    point.data[point.data.length - 1] = 10;
                    //}
                }
                series.push(point);
            }

            try{
                var chart = Highcharts.chart('chart1',{
                    credits: false,
                    chart: {
                        type: 'column',
                        backgroundColor: 'rgba(0,0,0,0.0)'
                    },
                    title: {
                        text: ''
                    },
                    subtitle: {
                        text: ''
                    },
                    legend:{
                        enabled: false,
                    },
                    exporting:{
                        enabled: false
                    },
                    xAxis: {
                        categories: labels,
                        crosshair: false,
                        //alternateGridColor: 'rgba(0,0,0,0.2)',
                        labels:{
                            format: '<span style="color:#ccc">{value}</span>'
                        },
                        tickLength: 0,
                        lineColor: 'rgba(255,255,255, 0.7)'
                    },
                    yAxis: {
                        min: 0,
                        gridLineWidth: 0,
                        lineWidth: 1,
                        lineColor: 'rgba(255,255,255, 0.7)',
                        labels:{
                            format: '<span style="color:#ccc">{value}</span>'
                        },
                        tickWidth: 1,
                        tickLength: 5,
                        tickPosition: 'inside',
                        title: {
                            text: ''
                        }
                    },
                    tooltip: {
                        enabled: true,
                        formatter: function () {
                            return '<b>' + this.series.name + '</b><br/>' + this.x + ': ' + this.y + '<br/>'
                        }
                    },
                    plotOptions: {
                        column: {
                            borderWidth: 0
                        }
                    },
                    series: series
                });
            }catch(e){
                console.error(e);
            }

        }
        function freshPie(){
            if ($scope.chart.materials2.length == 0 || $scope.chart.points2.length == 0) return;
            var data = [];

            for (var i in $scope.chart.materials2){
                var d = {
                    name: $scope.chart.materials2[i],
                    y: $scope.chart.points2[0].val[$scope.chart.materials2[i]],
                    sliced: false,
                    selected: false,
                    color: getColor(i, $scope.chart.materials2[i])
                }
                data.push(d);
            }
            //https://api.hcharts.cn/highcharts#exporting
            //https://jshare.com.cn/demos/hhhhD8
            try{
                var chart = Highcharts.chart('chart2',{
                    credits: false,
                    chart: {
                        type: 'pie',
                        backgroundColor: 'rgba(0,0,0,0.0)',
                        options3d: {
                            enabled: false,
                            alpha: 45,
                            beta: 0
                        }
                    },
                    title: {
                        text: ''
                    },
                    exporting:{
                        enabled: false
                    },
                    tooltip: {
                        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            depth: 35,
                            dataLabels: {
                                enabled: true,
                                format: '{point.name}'
                            }
                        }
                    },
                    series: [{
                        type: 'pie',
                        name: '浓度占比',
                        borderWidth: 0,
                        dataLabels: {
                            color: '#ccc',
                            style: {
                                color: "contrast",
                                fontSize: "11px",
                                fontWeight: "normal",
                                textOutline: '0px 0px'
                            }
                        },
                        data:data
                    }]
                });
            }catch(e){
                console.error(e);
            }

        }
        function getColor(index, name) {
            index = parseInt(index);
            var colors = [
                '#ffff00',
                '#448aff',
                '#ff0000',
                '#2F4F4F',
                '#00E5EE',
                '#FFFAF0',
                '#8B4726',
                '#EE82EE',
                '#B2DFEE',
                '#FFA500',
                '#9400D3',
                '#FF1493',
            ];
            if (name == undefined){
                return colors[index%colors.length];
            } else{
                for (var i in $scope.settings.area[$scope.area].material) {
                    if (name == $scope.settings.area[$scope.area].material[i].name) {
                        var clr = $scope.settings.area[$scope.area].material[i].colorString;
                        if (clr.indexOf('#') != 0)
                            clr = '#'+clr;
                        return clr;
                    }
                }
            }
            return '#fff';
        }
    }, true);
    $scope.chart.clickSelect = function () {
        $scope.chart.show_selection = true;
    }
    $scope.chart.clickMask  = function (e) {
        e.stopPropagation();
        $scope.chart.show_selection = false;
        if (!$scope.chart.pick) return false;
        var info = PDCommon.Clone($scope.chart.pick);
        $scope.chart.pick = false;

        var shape = PDDrawer.getShape(info.no);
        if (!shape || info.pos >= shape.data.length || shape.names.length != shape.data[info.pos].val.length) return false;

        var point = {
            dev_id: info.no,
            shape_index: info.pos,
            time: shape.data[info.pos].time,
            lng: shape.data[info.pos].pos.lng,
            lat: shape.data[info.pos].pos.lat,
            val:{},
            val_show: {}
        };
        for (var i in shape.data[info.pos].val){
            if (!valShow(shape.names[i])) continue;
            point.val[shape.names[i]] = parseFloat(shape.data[info.pos].val[i].toFixed(5));
            point.val_show[shape.names[i]] = parseFloat(point.val[shape.names[i]].toFixed(5));//.replace(/([^\.]*)(\.[^0]*)[0]*$/, '');
            function valShow(name){
                var material = $scope.settings.area[$scope.area].material;
                for (var i in material){
                    if (material[i].name == name){
                        return material[i].show;
                    }
                }
                return false;
            }
        }

        var points;
        var materials;
        if ($scope.statistic_tab == 1){
            points = $scope.chart.points;
            materials = $scope.chart.materials;
        } else {
            $scope.chart.points2 = [];
            $scope.chart.materials2 = [];
            points = $scope.chart.points2;
            materials = $scope.chart.materials2;
        }

        addNames(shape.names, materials);
        points.push(point);
        mergeNames(points, materials);

        if ($scope.statistic_tab == 2){
            var total = 0;
            for (var i in point.val){
                total += parseFloat(point.val[i]);
            }
            point.val_percent = {};
            for (var i in materials){
                var val = parseFloat(point.val[materials[i]]);
                val = val *100 / total;
                val = parseFloat(val.toFixed(3));
                point.val_percent[materials[i]] = val;
                point.val[materials[i]] = parseFloat(point.val[materials[i]].toFixed(5));
            }
        }

        function addNames(shape_names, materials) {
            var names = [];
            for (var i = 0; i < shape_names.length; i ++){
                var name;
                var all = $scope.settings.area[$scope.area].material;
                for (var j in all){
                    if (shape_names[i] == all[j].name && all[j].show != false){
                        name = all[j].name;
                    }
                }
                if (name)
                    names.push(name);
            }
            
            for (var i in names){
                var found = false;
                for (var j in materials){
                    if (names[i] == materials[j]){
                        found = true;
                        break;
                    }
                }
                if (!found)
                    materials.push(names[i]);
            }
        }
        function mergeNames(points, meterials){
            for (var k = 0; k < meterials.length; k ++){
                var found = false;
                for (var i in points){
                    var point = points[i];
                    for (var key in point.val){
                        if (key == meterials[k])
                            found = true;
                    }
                }
                if (!found){
                    meterials.splice(k--, 1);
                }
            }
            
        }
    }
    $scope.chart.exportBar = function(){
        var filter = 'CSV文件(*.csv)|*.csv;|文本文件(*.txt)|*.txt;';
        var data = [];
        data[0] = ['点'];// ['经度','纬度'];
        for (var i = 0; i < $scope.chart.materials.length; i ++){
            data[0].push($scope.chart.materials[i]);
        }
        for (var i = 0; i < $scope.chart.points.length; i ++){
            var row = [(i+1)+''];
            for (var j = 0; j < $scope.chart.materials.length; j ++){
                //row.push($scope.chart.points[i].lng);
                //row.push($scope.chart.points[i].lat);
                var val = $scope.chart.points[i].val[$scope.chart.materials[j]];
                if (val == undefined)
                    val = 0;
                row.push(val);
            }
            data.push(row);
        }
        var file = new Date();
        file = '柱状图'+(1900+file.getYear())+'-'+(file.getMonth()+1)+'-'+file.getDate()+'_'+file.getHours()+'-'+file.getMinutes()+'-'+file.getSeconds();//+'.csv';
        PDCommon.FileSelect(filter, file, function (res) {
            if (!res || !res.result || res.result.file == '')
            return;

            var file = res.result.file.toLowerCase();
            var str = '';

            if (!data){
                PDTools.notify('没有数据');
                return;
            }

            var ext = ['csv','txt'][res.result.filter - 1];
            if (!file.match('\\.'+ext+'$')){
                file += '.' + ext;
            }
            var str = '';
            if (res.result.filter == 1){
                for (var i in data){
                    var line = ''
                    for (var j in data[i]){
                        line += '"'+data[i][j]+'",';
                    }
                    if (line != '')
                        line = line.substr(0, line.length - 1);
                    line += "\n";
                    str += line;
                }
            }else if (res.result.filter == 2){
                for (var i in data){
                    var line = ''
                    for (var j in data[i]){
                        line += data[i][j]+';';
                    }
                    if (line != '')
                        line = line.substr(0, line.length - 1);
                    line += "\r\n";
                    str += line;
                }
            }

            str = new PDBase64().encode(str, 'utf-8');
            str = PDInterface.stringTranslate(str, 'utf82ascii');
            //str = new PDBase64().decode(str);
            PDCommon.FileWrite(file, str, true, function (res) {
                if (!res || !res.success || !res.result.success)
                    PDTools.notify('写文件失败');
            })
        });
    }
    $scope.chart.exportPie = function(){
        var filter = 'CSV文件(*.csv)|*.csv;|文本文件(*.txt)|*.txt;';
        var data = [];
        data[0] = [];// ['经度','纬度'];
        for (var i = 0; i < $scope.chart.materials2.length; i ++){
            data[0].push($scope.chart.materials2[i]);
        }
        for (var i = 0; i < $scope.chart.points2.length; i ++){
            var row = [];
            var row1 = [];
            for (var j = 0; j < $scope.chart.materials2.length; j ++){
                //row.push($scope.chart.points[i].lng);
                //row.push($scope.chart.points[i].lat);
                var val = $scope.chart.points2[i].val[$scope.chart.materials2[j]];
                if (val == undefined) val = 0;
                var val_percent = $scope.chart.points2[i].val_percent[$scope.chart.materials2[j]];
                if (val_percent == undefined) val_percent = 0;
                val_percent += '%';
                row.push(val);
                row1.push(val_percent);
            }
            data.push(row);
            data.push(row1);
        }
        var file = new Date();
        file = '饼图'+(1900+file.getYear())+'-'+(file.getMonth()+1)+'-'+file.getDate()+'_'+file.getHours()+'-'+file.getMinutes()+'-'+file.getSeconds();//+'.csv';
        PDCommon.FileSelect(filter, file, function (res) {
            if (!res || !res.result || res.result.file == '')
            return;

            var file = res.result.file.toLowerCase();
            var str = '';

            if (!data){
                PDTools.notify('没有数据');
                return;
            }

            var ext = ['csv','txt'][res.result.filter - 1];
            if (!file.match('\\.'+ext+'$')){
                file += '.' + ext;
            }
            var str = '';
            if (res.result.filter == 1){
                for (var i in data){
                    var line = ''
                    for (var j in data[i]){
                        line += '"'+data[i][j]+'",';
                    }
                    if (line != '')
                        line = line.substr(0, line.length - 1);
                    line += "\n";
                    str += line;
                }
            }else if (res.result.filter == 2){
                for (var i in data){
                    var line = ''
                    for (var j in data[i]){
                        line += data[i][j]+';';
                    }
                    if (line != '')
                        line = line.substr(0, line.length - 1);
                    line += "\r\n";
                    str += line;
                }
            }

            str = new PDBase64().encode(str, 'utf-8');
            str = PDInterface.stringTranslate(str, 'utf82ascii');
            //str = new PDBase64().decode(str);
            PDCommon.FileWrite(file, str, true, function (res) {
                if (!res || !res.success || !res.result.success)
                    PDTools.notify('写文件失败');
            })
        });
    }
    if (false){
        for (var i = 0; i < 10; i ++){
            var point = {
                dev_id: 1,
                shape_index: 1,
                lng: 123,
                lat: 123,
                val:{'d':1, 'a':2}
            };

            addNames(['d','a'], $scope.chart.materials);
            addNames(['d','a'], $scope.chart.materials2);

            $scope.chart.points.push(point);
            $scope.chart.points2.push(point);

            function addNames(names, materials) {
                for (var i in names){
                    var found = false;
                    for (var j in materials){
                        if (names[i] == materials[j]){
                            found = true;
                            break;
                        }
                    }
                    if (!found)
                        materials.push(names[i]);
                }
            }
        }

    }
    $scope.chart.dblClickMask = function (e) {
        e.stopPropagation();

        return false;
    }
    $scope.chart.clickList = function (point) {
        point.sel =!point.sel;

        $scope.chart.selection = [];
        for (var i in $scope.chart.points){
            if ($scope.chart.points[i].sel){
                $scope.chart.selection.push($scope.chart.points[i]);
            }

        }
    }
    $scope.chart.clickRemove = function () {
        if ($scope.chart.selection.length == 0) return;
        for (var i = 0; i < $scope.chart.points.length; i ++){
            var found = false;
            for (var j in $scope.chart.selection){
                if ($scope.chart.selection[j] == $scope.chart.points[i]){
                    found = j;
                    break;
                }
            }
            if (found){
                $scope.chart.points.splice(i, 1);
                $scope.chart.selection.splice(j, 1);
                i --;
            }
        }
    }
    $scope.chart.dblClickPoint = function (point) {
        var alt = PDDrawer.getViewer().scene.globe.ellipsoid.cartesianToCartographic(PDDrawer.getViewer().camera.positionWC).height;
        if (alt > 5000)
            alt = 5000;
        var pos = PDDrawer.getOffsetPos(point.dev_id, point.time, point.lng, point.lat);
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
                        flash();
                        return;
                        function flash() {
                            if (times ++ > 6)
                                return;
                            PDDrawer.changeShapeColor(point.dev_id, point.lng, point.lat, times % 2 == 0 ? 'rgba(255,0,0,1.0)':undefined);
                            setTimeout(flash, 500);
                        }
                    }
                    PDDrawer.getViewer().camera.moveBackward(tick);
                    setTimeout(roate, 10);
                }

            }
        });
    }
    function changePickColor(info, brighten) {
        var shape = PDDrawer.getShape(info.no);
        if (!shape || info.pos >= shape.data.length || shape.names.length != shape.data[info.pos].val.length) return;
        PDDrawer.changeShapeColor(shape.no, shape.data[info.pos].pos.lng, shape.data[info.pos].pos.lat, brighten);
    }
}