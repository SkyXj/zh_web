function Main_InitButtons($scope) {
    $scope.clickSettings = function (e) {
        $scope.dialog = {
            show: true,
            icon: 'images/settings2.png',
            title: '设置',
            src: 'settings.html?area='+$scope.area,
            width: 480,
            height: 340,
        }
    }
    $scope.clickShape = function (e) {
        //var win = window.top.open('settings_shape.html?area='+$scope.area,'popupwindow','width=480,height=330');
        //return;
        $scope.dialog = {
            show: true,
            icon: 'images/chart2.png',
            title: '图形设置',
            src: 'settings_shape.html?area='+$scope.area,
            width: 480,
            height: $scope.area == 0 ? 310 : 330,
        }
        /*if (PDDrawer.getViewer().sceneModePicker.viewModel.sceneMode == Cesium.SceneMode.SCENE3D){
            PDDrawer.getViewer().sceneModePicker.viewModel.sceneMode = Cesium.SceneMode.SCENE2D;
        }else{
            PDDrawer.getViewer().sceneModePicker.viewModel.sceneMode = Cesium.SceneMode.SCENE3D;
        }*/
    }
    $scope.clickSave = function (e) {
        $scope.dialog = {
            show: true,
            icon: 'images/save2.png',
            title: '保存',
            src: 'save_sel.html?area='+$scope.area,
            width: 380,
            height: 240
        }
        $('.dialog_bk iframe').bind("load", function (e) {
            $(this).unbind(e);
            setTimeout(check, 100);
            function check() {
                var win = $('.dialog_bk iframe')[0].contentWindow;
                if (!win){
                    setTimeout(check, 100);
                    return;
                }
                win.init($scope.shape, function (ret) {
                    onCloseDialog();
                    PDDrawer.save(ret);
                });
            }
        })

        //PDDrawer.save();
        /*html2canvas(document.querySelector(".materials_color")).then(canvas => {
            //document.body.appendChild(canvas)
            var str = canvas.toDataURL();
            str = str.substr('data:image/png;base64,'.length);


            //str = new PDBase64().decode(str);
            PDCommon.FileWrite('E:/1.png', str, true, function (res) {
                if (!res || !res.success || !res.result.success)
                    PDTools.notify('写文件失败');
            })
        });*/
    }
    $scope.clickRefresh = function (e) {
        PDDrawer.refresh($scope.settings.sources[$scope.settings.cur_source].transform);
    }
    $scope.clickFitView = function () {
        if (!PDDrawer.autoFit()){
            $scope.navigateTo($scope.posInit.lng, $scope.posInit.lat);
        }
    }
    $scope.clickColorSettings = function () {
        if (!$scope.settings.area[$scope.area].material)
            return;
        $scope.dialog = {
            show: true,
            icon: 'images/color2.png',
            title: '颜色设置',
            src: 'settings_material.html?area='+$scope.area,
            width: 480,
            height: 400,
        };
        return;
    }
    
    $scope.clickClear = function (e) {
        PDTools.showConfirm('删除所有图形?', true, function (ok) {
            if (!ok)
                return;
            for (var i = 0; i < $scope.shape.length; i ++){
                PDDrawer.removeShape($scope.shape[i].no);
                $scope.shape.splice(i, 1);
                i --;
            }
            $scope.$apply();
        });
    };
    $scope.clickFullScreen = function (e) {
        $scope.full_screen = !$scope.full_screen;
        window.top.FullScreen($scope.full_screen, window);
    }

    //////////////////////
    $scope.clickDialogClose = function () {
        if (!$scope.dialog)
            $scope.dialog = {};
        $scope.dialog.show = false;
        $scope.dialog.src = '';
    }
    ///////////////////////
    
}