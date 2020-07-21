

PDConfig = {
    const:{
        MODE_REALTIME: 0,//显示模式：走航模式
        MODE_FILE:      1,//显示模式：文件模式
        SHAPE_PILLAR: 0,//图形模式
        SHAPE_LINE:   1,
        SHAPE_DOT:    2,
        SHAPE_PATH:   3,
        GEOMETRY_PREFIX_EXTEND: 'pdext_',
        GEOMETRY_PREFIX_EXTEND_FACTORY: 'factory_',
        GEOMETRY_PREFIX_EXTEND_WIND: 'wind_',
        GEOMETRY_PREFIX_EXTEND_VEHICLE: 'vehicle_',
        GEOMETRY_PREFIX_EXTEND_AREA: 'area_',
    },
    default: function (settings, index) {
        if (settings == undefined)
            settings = {};
        if (settings.area == undefined || !settings.area.length)
            settings.area = [];

        if (!settings.area[index])
            settings.area[index] = {};
        //显示模式
        if (settings.area[index].mode == undefined)
            settings.area[index].mode = this.const.MODE_REALTIME;
        //图形模式
        if (settings.area[index].shape == undefined)
            settings.area[index].shape = this.const.SHAPE_PILLAR;

        if (settings.area[index].shape_dot_width == undefined)
            settings.area[index].shape_dot_width = 10;
        if (settings.area[index].shape_path_color == undefined)
            settings.area[index].shape_path_color = '6AFF59';
        if (settings.area[index].shape_path_width == undefined)
            settings.area[index].shape_path_width = 50;
        //文件模式下，自动计算宽高比
        if (settings.area[index].mode_file_auto_height_enable == undefined)
            settings.area[index].mode_file_auto_height_enable = false;
        if (settings.area[index].mode_file_auto_height_value == undefined)
            settings.area[index].mode_file_auto_height_value = 10;
        //高度放大倍数
        if (settings.area[index].map_zoom == undefined)
            settings.area[index].map_zoom = 10;
        //物质颜色
        if (!settings.area[index].material){
            // var standardNames=[];
            settings.area[index].material = PD_INIT_MATERIAL2;
            // if(!settings.area[index].materials||settings.area[index].materials.length<=0){
            //     settings.area[index].materials=[];
            //     for (var i = 0; i < PD_INIT_MATERIALS.length; i++) {
            //         const material = PD_INIT_MATERIALS[i].material;
            //         settings.area[index].materials.push(material);
            //         const name = PD_INIT_MATERIALS[i].name;
            //         standardNames.push(name);
            //     }
            // }
            // window.localStorage["settings"]=JSON.stringify(settings);
            // window.localStorage["standardNames"]=JSON.stringify(standardNames);
        }
        if(!settings.area[index].materials){
            settings.area[index].materials=[];
            for (var i = 0; i < PD_INIT_MATERIALS.length; i++) {
                var material = PD_INIT_MATERIALS[i].material;
                settings.area[index].materials.push(material);
            }
        }
        if(!settings.area[index].standardNames){
            settings.area[index].standardNames=[];
            for (var i = 0; i < PD_INIT_MATERIALS.length; i++) {
                var name = PD_INIT_MATERIALS[i].name;
                settings.area[index].standardNames.push(name);
            }
        }
                    
        if (settings.area[index].alpha == undefined)
            settings.area[index].alpha = 90;
        //物质浓度
        if (!settings.area[index].material_single){
            settings.area[index].material_single = {show:true,color :[
                {val:0,colorString:'4ce600', color:0xff0000},
                {val:200,colorString:'d1ff73', color:0xff0000},
                {val:400,colorString:'e6e600', color:0xff0000},
                {val:600,colorString:'e69800', color:0xff0000},
                {val:1000,colorString:'e60000', color:0xff0000},
                {val:2000,colorString:'c500ff', color:0xff0000},
                {val:4000,colorString:'4c0073', color:0xff0000},
            ]};
        }
        //显示
        if (!settings.area[index].show){
            settings.area[index].show = {
                aspect_ratio_enable: true,
                aspect_ratio: 2,
                zoom: 10,
                view_fit_enable: false,
                view_fit_angle1: 30,
                view_fit_angle2: 0
            };
        }
        //动画
        if (!settings.area[index].animate)
            settings.area[index].animate = {
                enable_elapse: true,
                elapse: 10,
                show_vehicle: true
            };
        //风向
        if (!settings.area[index].wind)
            settings.area[index].wind = {
                length_min: 50,
                width: 50,
                length_ratio: 20,
                height: 500,
                show_speed: false
            };
        //面板
        if (!settings.area[index].panel){
            settings.area[index].panel = {
                shape_show: true,
                error_show: true,
                statistic_show: true,
                area_show: true
            }
        }

        return settings;
    },
    resetSettings: function(settings, index){
        //var area = [];
        //area[index] = settings.area[index];
        var old = PDCommon.getData('settings');
        if (!old) old = {};
        if (!old.area) old.area = [undefined, undefined];
        delete old.area[index];
        old.area[index] = settings.area[index];
        PDCommon.resetData('settings', old);
    }
}

var PD_INIT_MATERIAL = [
    {
        "name": "甲硫醇浓度",
        "show": true,
        "color": 5449247,
        "colorString": "53261f",
        "has": false,
        "search": true,
        "threshold":200,
        "colors":{show:true,color :[
            {valmin:0,valmax:200,colorString:'4ce600', color:0xff0000},
            {valmin:200,valmax:400,colorString:'d1ff73', color:0xff0000},
            {valmin:400,valmax:600,colorString:'e6e600', color:0xff0000},
            {valmin:600,valmax:1000,colorString:'e69800', color:0xff0000},
            {valmin:1000,valmax:2000,colorString:'e60000', color:0xff0000},
            {valmin:2000,valmax:4000,colorString:'c500ff', color:0xff0000},
            {valmin:4000,valmax:100000,colorString:'4c0073', color:0xff0000},
        ]}
    }, {
        "name": "1,3-丁二烯浓度",
        "show": true,
        "color": 16628019,
        "colorString": "fdb933",
        "has": false,
        "search": true,
        "threshold":200,
        "colors":{show:true,color :[
            {valmin:0,valmax:200,colorString:'', color:0xff0000},
            {valmin:200,valmax:400,colorString:'d1ff73', color:0xff0000},
            {valmin:400,valmax:600,colorString:'e6e600', color:0xff0000},
            {valmin:600,valmax:1000,colorString:'e69800', color:0xff0000},
            {valmin:1000,valmax:2000,colorString:'e60000', color:0xff0000},
            {valmin:2000,valmax:4000,colorString:'c500ff', color:0xff0000},
            {valmin:4000,valmax:100000,colorString:'4c0073', color:0xff0000},
        ]}
    }, {
        "name": "丁烯浓度",
        "show": true,
        "color": 42668,
        "search": true,
        "colorString": "00a6ac",
        "threshold":200,
        "colors":{show:true,color :[
            {valmin:0,valmax:200,colorString:'4ce600', color:0xff0000},
            {valmin:200,valmax:400,colorString:'d1ff73', color:0xff0000},
            {valmin:400,valmax:600,colorString:'e6e600', color:0xff0000},
            {valmin:600,valmax:1000,colorString:'e69800', color:0xff0000},
            {valmin:1000,valmax:2000,colorString:'e60000', color:0xff0000},
            {valmin:2000,valmax:4000,colorString:'c500ff', color:0xff0000},
            {valmin:4000,valmax:100000,colorString:'4c0073', color:0xff0000},
        ]},
        "has": false
    }, {
        "name": "丁烷，异丁烷浓度",
        "show": true,
        "color": 15817250,
        "colorString": "f15a22",
        "has": false,
        "search": true,
        "threshold":200,
        "colors":{show:true,color :[
            {valmin:0,valmax:200,colorString:'4ce600', color:0xff0000},
            {valmin:200,valmax:400,colorString:'d1ff73', color:0xff0000},
            {valmin:400,valmax:600,colorString:'e6e600', color:0xff0000},
            {valmin:600,valmax:1000,colorString:'e69800', color:0xff0000},
            {valmin:1000,valmax:2000,colorString:'e60000', color:0xff0000},
            {valmin:2000,valmax:4000,colorString:'c500ff', color:0xff0000},
            {valmin:4000,valmax:100000,colorString:'4c0073', color:0xff0000},
        ]}
    }, {
        "name": "甲硫醚、乙硫醇浓度",
        "show": true,
        "color": 13878950,
        "colorString": "d3c6a6",
        "has": false,
        "search": true,
        "threshold":200,
        "colors":{show:true,color :[
            {valmin:0,valmax:200,colorString:'4ce600', color:0xff0000},
            {valmin:200,valmax:400,colorString:'d1ff73', color:0xff0000},
            {valmin:400,valmax:600,colorString:'e6e600', color:0xff0000},
            {valmin:600,valmax:1000,colorString:'e69800', color:0xff0000},
            {valmin:1000,valmax:2000,colorString:'e60000', color:0xff0000},
            {valmin:2000,valmax:4000,colorString:'c500ff', color:0xff0000},
            {valmin:4000,valmax:100000,colorString:'4c0073', color:0xff0000},
        ]}
    }, {
        "name": "异戊二烯浓度",
        "show": true,
        "color": 7917009,
        "colorString": "78cdd1",
        "has": false,
        "search": true,
        "threshold":200,
        "colors":{show:true,color :[
            {valmin:0,valmax:200,colorString:'4ce600', color:0xff0000},
            {valmin:200,valmax:400,colorString:'d1ff73', color:0xff0000},
            {valmin:400,valmax:600,colorString:'e6e600', color:0xff0000},
            {valmin:600,valmax:1000,colorString:'e69800', color:0xff0000},
            {valmin:1000,valmax:2000,colorString:'e60000', color:0xff0000},
            {valmin:2000,valmax:4000,colorString:'c500ff', color:0xff0000},
            {valmin:4000,valmax:100000,colorString:'4c0073', color:0xff0000},
        ]}
    }, {
        "name": "戊烯浓度",
        "show": true,
        "color": 11817788,
        "colorString": "b4533c",
        "has": false,
        "search": true,
        "threshold":200,
        "colors":{show:true,color :[
            {valmin:0,valmax:200,colorString:'4ce600', color:0xff0000},
            {valmin:200,valmax:400,colorString:'d1ff73', color:0xff0000},
            {valmin:400,valmax:600,colorString:'e6e600', color:0xff0000},
            {valmin:600,valmax:1000,colorString:'e69800', color:0xff0000},
            {valmin:1000,valmax:2000,colorString:'e60000', color:0xff0000},
            {valmin:2000,valmax:4000,colorString:'c500ff', color:0xff0000},
            {valmin:4000,valmax:100000,colorString:'4c0073', color:0xff0000},
        ]}
    }, {
        "name": "戊烷、异戊烷浓度",
        "show": true,
        "color": 13083218,
        "colorString": "c7a252",
        "has": false,
        "search": true,
        "threshold":200,
        "colors":{show:true,color :[
            {valmin:0,valmax:200,colorString:'4ce600', color:0xff0000},
            {valmin:200,valmax:400,colorString:'d1ff73', color:0xff0000},
            {valmin:400,valmax:600,colorString:'e6e600', color:0xff0000},
            {valmin:600,valmax:1000,colorString:'e69800', color:0xff0000},
            {valmin:1000,valmax:2000,colorString:'e60000', color:0xff0000},
            {valmin:2000,valmax:4000,colorString:'c500ff', color:0xff0000},
            {valmin:4000,valmax:100000,colorString:'4c0073', color:0xff0000},
        ]}
    }, {
        "name": "TVOC浓度",
        "show": true,
        "search": true,
        "color": 5449247,
        "colorString": "53261f",
        "threshold":200,
        "colors":{show:true,color :[
            {valmin:0,valmax:200,colorString:'4ce600', color:0xff0000},
            {valmin:200,valmax:400,colorString:'d1ff73', color:0xff0000},
            {valmin:400,valmax:600,colorString:'e6e600', color:0xff0000},
            {valmin:600,valmax:1000,colorString:'e69800', color:0xff0000},
            {valmin:1000,valmax:2000,colorString:'e60000', color:0xff0000},
            {valmin:2000,valmax:4000,colorString:'c500ff', color:0xff0000},
            {valmin:4000,valmax:100000,colorString:'4c0073', color:0xff0000},
        ]},
        "has": false
    }
];


var PD_INIT_MATERIAL2 = [
    {
        "name": "甲硫醇浓度",
        "show": true,
        "color": 5449247,
        "colorString": "53261f",
        "has": false,
        "search": true,
        "threshold":200,
        "colors":{show:true,color :[
            {valmin:0,valmax:200,colorString:'4ce600', color:0xff0000},
            {valmin:200,valmax:400,colorString:'d1ff73', color:0xff0000},
            {valmin:400,valmax:600,colorString:'e6e600', color:0xff0000},
            {valmin:600,valmax:1000,colorString:'e69800', color:0xff0000},
            {valmin:1000,valmax:2000,colorString:'e60000', color:0xff0000},
            {valmin:2000,valmax:4000,colorString:'c500ff', color:0xff0000},
            {valmin:4000,valmax:100000,colorString:'4c0073', color:0xff0000},
        ]}
    }, {
        "name": "1,3-丁二烯浓度",
        "show": true,
        "color": 16628019,
        "colorString": "fdb933",
        "has": false,
        "search": true,
        "threshold":200,
        "colors":{show:true,color :[
            {valmin:0,valmax:200,colorString:'4ce600', color:0xff0000},
            {valmin:200,valmax:400,colorString:'d1ff73', color:0xff0000},
            {valmin:400,valmax:600,colorString:'e6e600', color:0xff0000},
            {valmin:600,valmax:1000,colorString:'e69800', color:0xff0000},
            {valmin:1000,valmax:2000,colorString:'e60000', color:0xff0000},
            {valmin:2000,valmax:4000,colorString:'c500ff', color:0xff0000},
            {valmin:4000,valmax:100000,colorString:'4c0073', color:0xff0000},
        ]}
    }, {
        "name": "丁烯浓度",
        "show": true,
        "search": true,
        "color": 42668,
        "colorString": "00a6ac",
        "threshold":200,
        "colors":{show:true,color :[
            {valmin:0,valmax:200,colorString:'4ce600', color:0xff0000},
            {valmin:200,valmax:400,colorString:'d1ff73', color:0xff0000},
            {valmin:400,valmax:600,colorString:'e6e600', color:0xff0000},
            {valmin:600,valmax:1000,colorString:'e69800', color:0xff0000},
            {valmin:1000,valmax:2000,colorString:'e60000', color:0xff0000},
            {valmin:2000,valmax:4000,colorString:'c500ff', color:0xff0000},
            {valmin:4000,valmax:100000,colorString:'4c0073', color:0xff0000},
        ]},
        "has": false
    }, {
        "name": "丁烷，异丁烷浓度",
        "show": true,
        "color": 15817250,
        "colorString": "f15a22",
        "has": false,
        "search": true,
        "threshold":200,
        "colors":{show:true,color :[
            {valmin:0,valmax:200,colorString:'4ce600', color:0xff0000},
            {valmin:200,valmax:400,colorString:'d1ff73', color:0xff0000},
            {valmin:400,valmax:600,colorString:'e6e600', color:0xff0000},
            {valmin:600,valmax:1000,colorString:'e69800', color:0xff0000},
            {valmin:1000,valmax:2000,colorString:'e60000', color:0xff0000},
            {valmin:2000,valmax:4000,colorString:'c500ff', color:0xff0000},
            {valmin:4000,valmax:100000,colorString:'4c0073', color:0xff0000},
        ]}
    }, {
        "name": "甲硫醚、乙硫醇浓度",
        "show": true,
        "color": 13878950,
        "colorString": "d3c6a6",
        "has": false,
        "search": true,
        "threshold":200,
        "colors":{show:true,color :[
            {valmin:0,valmax:200,colorString:'4ce600', color:0xff0000},
            {valmin:200,valmax:400,colorString:'d1ff73', color:0xff0000},
            {valmin:400,valmax:600,colorString:'e6e600', color:0xff0000},
            {valmin:600,valmax:1000,colorString:'e69800', color:0xff0000},
            {valmin:1000,valmax:2000,colorString:'e60000', color:0xff0000},
            {valmin:2000,valmax:4000,colorString:'c500ff', color:0xff0000},
            {valmin:4000,valmax:100000,colorString:'4c0073', color:0xff0000},
        ]}
    }, {
        "name": "异戊二烯浓度",
        "show": true,
        "color": 7917009,
        "colorString": "78cdd1",
        "has": false,
        "search": true,
        "threshold":200,
        "colors":{show:true,color :[
            {valmin:0,valmax:200,colorString:'4ce600', color:0xff0000},
            {valmin:200,valmax:400,colorString:'d1ff73', color:0xff0000},
            {valmin:400,valmax:600,colorString:'e6e600', color:0xff0000},
            {valmin:600,valmax:1000,colorString:'e69800', color:0xff0000},
            {valmin:1000,valmax:2000,colorString:'e60000', color:0xff0000},
            {valmin:2000,valmax:4000,colorString:'c500ff', color:0xff0000},
            {valmin:4000,valmax:100000,colorString:'4c0073', color:0xff0000},
        ]}
    }, {
        "name": "戊烯浓度",
        "show": true,
        "color": 11817788,
        "colorString": "b4533c",
        "has": false,
        "search": true,
        "threshold":200,
        "colors":{show:true,color :[
            {valmin:0,valmax:200,colorString:'4ce600', color:0xff0000},
            {valmin:200,valmax:400,colorString:'d1ff73', color:0xff0000},
            {valmin:400,valmax:600,colorString:'e6e600', color:0xff0000},
            {valmin:600,valmax:1000,colorString:'e69800', color:0xff0000},
            {valmin:1000,valmax:2000,colorString:'e60000', color:0xff0000},
            {valmin:2000,valmax:4000,colorString:'c500ff', color:0xff0000},
            {valmin:4000,valmax:100000,colorString:'4c0073', color:0xff0000},
        ]}
    }, {
        "name": "戊烷、异戊烷浓度",
        "show": true,
        "color": 13083218,
        "colorString": "c7a252",
        "has": false,
        "search": true,
        "threshold":200,
        "colors":{show:true,color :[
            {valmin:0,valmax:200,colorString:'4ce600', color:0xff0000},
            {valmin:200,valmax:400,colorString:'d1ff73', color:0xff0000},
            {valmin:400,valmax:600,colorString:'e6e600', color:0xff0000},
            {valmin:600,valmax:1000,colorString:'e69800', color:0xff0000},
            {valmin:1000,valmax:2000,colorString:'e60000', color:0xff0000},
            {valmin:2000,valmax:4000,colorString:'c500ff', color:0xff0000},
            {valmin:4000,valmax:100000,colorString:'4c0073', color:0xff0000},
        ]}
    }, {
        "name": "TVOC浓度",
        "show": true,
        "search": true,
        "color": 5449247,
        "colorString": "53261f",
        "threshold":0,
        "colors":{show:true,color :[
            {valmin:0,valmax:200,colorString:'4ce600', color:0xff0000},
            {valmin:200,valmax:400,colorString:'d1ff73', color:0xff0000},
            {valmin:400,valmax:600,colorString:'e6e600', color:0xff0000},
            {valmin:600,valmax:1000,colorString:'e69800', color:0xff0000},
            {valmin:1000,valmax:2000,colorString:'e60000', color:0xff0000},
            {valmin:2000,valmax:4000,colorString:'c500ff', color:0xff0000},
            {valmin:4000,valmax:100000,colorString:'4c0073', color:0xff0000},
        ]},
        "has": false
    }
];

var PD_INIT_MATERIAL3 = [
    {
        "name": "甲硫醇浓度",
        "show": true,
        "color": 5449247,
        "colorString": "53261f",
        "has": false,
        "search": true,
        "threshold":200,
        "colors":{show:true,color :[
            {valmin:0,valmax:200,colorString:'4ce600', color:0xff0000},
            {valmin:200,valmax:400,colorString:'d1ff73', color:0xff0000},
            {valmin:400,valmax:600,colorString:'e6e600', color:0xff0000},
            {valmin:600,valmax:1000,colorString:'e69800', color:0xff0000},
            {valmin:1000,valmax:2000,colorString:'e60000', color:0xff0000},
            {valmin:2000,valmax:4000,colorString:'c500ff', color:0xff0000},
            {valmin:4000,valmax:100000,colorString:'4c0073', color:0xff0000},
        ]}
    }, {
        "name": "1,3-丁二烯浓度",
        "show": true,
        "color": 16628019,
        "colorString": "fdb933",
        "has": false,
        "search": true,
        "threshold":200,
        "colors":{show:true,color :[
            {valmin:0,valmax:200,colorString:'4ce600', color:0xff0000},
            {valmin:200,valmax:400,colorString:'d1ff73', color:0xff0000},
            {valmin:400,valmax:600,colorString:'e6e600', color:0xff0000},
            {valmin:600,valmax:1000,colorString:'e69800', color:0xff0000},
            {valmin:1000,valmax:2000,colorString:'e60000', color:0xff0000},
            {valmin:2000,valmax:4000,colorString:'c500ff', color:0xff0000},
            {valmin:4000,valmax:100000,colorString:'4c0073', color:0xff0000},
        ]}
    }, {
        "name": "丁烯浓度",
        "show": true,
        "search": true,
        "color": 42668,
        "colorString": "00a6ac",
        "threshold":200,
        "colors":{show:true,color :[
            {valmin:0,valmax:200,colorString:'4ce600', color:0xff0000},
            {valmin:200,valmax:400,colorString:'d1ff73', color:0xff0000},
            {valmin:400,valmax:600,colorString:'e6e600', color:0xff0000},
            {valmin:600,valmax:1000,colorString:'e69800', color:0xff0000},
            {valmin:1000,valmax:2000,colorString:'e60000', color:0xff0000},
            {valmin:2000,valmax:4000,colorString:'c500ff', color:0xff0000},
            {valmin:4000,valmax:100000,colorString:'4c0073', color:0xff0000},
        ]},
        "has": false
    }, {
        "name": "丁烷，异丁烷浓度",
        "show": true,
        "color": 15817250,
        "colorString": "f15a22",
        "has": false,
        "search": true,
        "threshold":200,
        "colors":{show:true,color :[
            {valmin:0,valmax:200,colorString:'4ce600', color:0xff0000},
            {valmin:200,valmax:400,colorString:'d1ff73', color:0xff0000},
            {valmin:400,valmax:600,colorString:'e6e600', color:0xff0000},
            {valmin:600,valmax:1000,colorString:'e69800', color:0xff0000},
            {valmin:1000,valmax:2000,colorString:'e60000', color:0xff0000},
            {valmin:2000,valmax:4000,colorString:'c500ff', color:0xff0000},
            {valmin:4000,valmax:100000,colorString:'4c0073', color:0xff0000},
        ]}
    }, {
        "name": "甲硫醚、乙硫醇浓度",
        "show": true,
        "color": 13878950,
        "colorString": "d3c6a6",
        "has": false,
        "search": true,
        "threshold":200,
        "colors":{show:true,color :[
            {valmin:0,valmax:200,colorString:'4ce600', color:0xff0000},
            {valmin:200,valmax:400,colorString:'d1ff73', color:0xff0000},
            {valmin:400,valmax:600,colorString:'e6e600', color:0xff0000},
            {valmin:600,valmax:1000,colorString:'e69800', color:0xff0000},
            {valmin:1000,valmax:2000,colorString:'e60000', color:0xff0000},
            {valmin:2000,valmax:4000,colorString:'c500ff', color:0xff0000},
            {valmin:4000,valmax:100000,colorString:'4c0073', color:0xff0000},
        ]}
    }, {
        "name": "异戊二烯浓度",
        "show": true,
        "color": 7917009,
        "colorString": "78cdd1",
        "has": false,
        "search": true,
        "threshold":200,
        "colors":{show:true,color :[
            {valmin:0,valmax:200,colorString:'4ce600', color:0xff0000},
            {valmin:200,valmax:400,colorString:'d1ff73', color:0xff0000},
            {valmin:400,valmax:600,colorString:'e6e600', color:0xff0000},
            {valmin:600,valmax:1000,colorString:'e69800', color:0xff0000},
            {valmin:1000,valmax:2000,colorString:'e60000', color:0xff0000},
            {valmin:2000,valmax:4000,colorString:'c500ff', color:0xff0000},
            {valmin:4000,valmax:100000,colorString:'4c0073', color:0xff0000},
        ]}
    }, {
        "name": "戊烯浓度",
        "show": true,
        "color": 11817788,
        "colorString": "b4533c",
        "has": false,
        "search": true,
        "threshold":200,
        "colors":{show:true,color :[
            {valmin:0,valmax:200,colorString:'4ce600', color:0xff0000},
            {valmin:200,valmax:400,colorString:'d1ff73', color:0xff0000},
            {valmin:400,valmax:600,colorString:'e6e600', color:0xff0000},
            {valmin:600,valmax:1000,colorString:'e69800', color:0xff0000},
            {valmin:1000,valmax:2000,colorString:'e60000', color:0xff0000},
            {valmin:2000,valmax:4000,colorString:'c500ff', color:0xff0000},
            {valmin:4000,valmax:100000,colorString:'4c0073', color:0xff0000},
        ]}
    }, {
        "name": "戊烷、异戊烷浓度",
        "show": true,
        "color": 13083218,
        "colorString": "c7a252",
        "has": false,
        "search": true,
        "threshold":200,
        "colors":{show:true,color :[
            {valmin:0,valmax:200,colorString:'4ce600', color:0xff0000},
            {valmin:200,valmax:400,colorString:'d1ff73', color:0xff0000},
            {valmin:400,valmax:600,colorString:'e6e600', color:0xff0000},
            {valmin:600,valmax:1000,colorString:'e69800', color:0xff0000},
            {valmin:1000,valmax:2000,colorString:'e60000', color:0xff0000},
            {valmin:2000,valmax:4000,colorString:'c500ff', color:0xff0000},
            {valmin:4000,valmax:100000,colorString:'4c0073', color:0xff0000},
        ]}
    }, {
        "name": "TVOC浓度",
        "show": true,
        "search": true,
        "color": 5449247,
        "colorString": "53261f",
        "threshold":0,
        "colors":{show:true,color :[
            {valmin:0,valmax:200,colorString:'4ce600', color:0xff0000},
            {valmin:200,valmax:400,colorString:'d1ff73', color:0xff0000},
            {valmin:400,valmax:600,colorString:'e6e600', color:0xff0000},
            {valmin:600,valmax:1000,colorString:'e69800', color:0xff0000},
            {valmin:1000,valmax:2000,colorString:'e60000', color:0xff0000},
            {valmin:2000,valmax:4000,colorString:'c500ff', color:0xff0000},
            {valmin:4000,valmax:100000,colorString:'4c0073', color:0xff0000},
        ]},
        "has": false
    }
];


var PD_INIT_MATERIALS=[];
PD_INIT_MATERIALS.push({"name":"标准1","material":PD_INIT_MATERIAL});
PD_INIT_MATERIALS.push({"name":"标准2","material":PD_INIT_MATERIAL2});
PD_INIT_MATERIALS.push({"name":"标准3","material":PD_INIT_MATERIAL3});