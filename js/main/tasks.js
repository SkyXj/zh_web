$(document).ready(function () {

});
var all_status = ['全部','正在上传','正在下载','已完成'];
var app = angular.module('cloud', []);
app.filter('mySearch', ['$sce',function($sce){
    return function (collection, keyname) {
        if (keyname == undefined || keyname == '')
            return collection;

        var pos = keyname.indexOf('|');
        if (pos == -1)
            return collection;

        var filter_status = keyname.substr(0, pos);
        for (var i in all_status){
            if (filter_status == all_status[i]){
                filter_status = parseInt(i);
                break;
            }
        }
        keyname = keyname.substr(pos + 1);
        var output = [];
        angular.forEach(collection, function (item) {
            var status_ok = true;
            if (filter_status > 0){
                status_ok = filter_status == item.status;
            }
            if (status_ok && item.title.indexOf(keyname) != -1)
                output.push(item);
        });
        return output;
    }
}]);
app.filter('wordHighlight', ['$sce',function($sce){
    //var sce = $sce;
    return function(content,match) {
        content = content + '';
        if (match == undefined || match == '') {
            return $sce.trustAsHtml(content);
        }
        //content = $sce.getTrustedHtml(content);
        //var reg = new　RegExp('('+match+')','g');
        //if (reg)
        //  content = content.replace(reg,'<span class="highlight">$1</span>');
        //else
        content = content.replace(match, '<span class="highlight">'+match+'</span>');
        return $sce.trustAsHtml(content);
    }
}]);
app.controller('all', function ($scope) {
    $scope.select_status = '全部';
    $scope.status = all_status;

    var tasks = PDCommon.getData('tasks');
    if (!tasks.length) tasks = [];

    for (var i = 0; i < tasks.length; i ++){
        delete tasks[i].taskId;
        delete tasks[i].$$hashKey;
        if (tasks[i].status != 3)
            tasks[i].status = 0;
        getItemIcon(tasks[i]);
    }
    $scope.tasks = tasks;
    restartTasks();

    $scope.on_update = window.top.onTaskUpdate;

    $scope.addTask = function (task) {
        getItemIcon(task);
        $scope.tasks.splice(0, 0, task);
        PDCommon.resetData('tasks',tasks);
        if (task.down)
            addNewDownloadTask(task);
        else
            addNewUploadTask(task);
    }
    $scope.clickExplorer = function (task, e) {
        if (task.progress < 100)
            return;
        if (!PDCommon.FileExists2(task.file))
            PDTools.notify('文件不存在，或已被删除', 5000);
        else
            PDCommon.FileExplorer2(task.file);
    }

    $scope.clickStart = function (task) {
        if (task.down){
            var count = 0;
            if (getTaskDownloading() > 5){
                for (var i = 0; i < $scope.tasks.length; i ++){
                    if ($scope.tasks[i].down && $scope.tasks[i].taskId){
                        if (count == 4){
                            pauseTask($scope.tasks[i], false);
                            break;
                        }else{
                            count ++;
                        }
                    }

                }
            }
            startDownload(task);
        }else{
            var count = 0;
            if (getTaskUploading() > 5){
                for (var i = 0; i < $scope.tasks.length; i ++){
                    if (!$scope.tasks[i].down && $scope.tasks[i].taskId){
                        if (count == 4){
                            pauseTask($scope.tasks[i], false);
                            break;
                        }else{
                            count ++;
                        }
                    }

                }
            }
            startUpload(task);
        }
    }
    $scope.clickPause = function (task) {
        pauseTask(task, true);
    }
    $scope.clickRemove = function (task) {
        if (task.status != 3){
            var text = '删除任务？';
            if (task.down) text = '删除任务会删除下载中的文件，要继续吗？';

            PDTools.showConfirm(text, function (ok) {
                if (ok){
                    pauseTask(task, true, function () {
                        del();
                        if (task.down)
                            PDCommon.FileDelete(task.file);
                        $scope.$apply();
                    });
                }
            });
        }else{
            del();
        }
        function del() {

            for (var i  = 0; i < $scope.tasks.length; i ++){
                if (task == $scope.tasks[i]){
                    $scope.tasks.splice(i, 1);
                    PDCommon.resetData('tasks', $scope.tasks);
                    break;
                }
            }
        }

    }

    function restartTasks() {
        for (var i = 0; i < $scope.tasks.length; i ++){
            if ($scope.tasks[i].pause || !!$scope.tasks[i].error)
                continue;
            if ($scope.tasks[i].status == 0){
                if ($scope.tasks[i].down){
                    if (getTaskDownloading() < 5)
                        startDownload($scope.tasks[i]);
                }else{
                    if (getTaskUploading() < 5)
                        startUpload($scope.tasks[i]);
                }
            }
        }
    }
    function getTaskDownloading() {
        var count = 0;
        for (var i  = 0; i < $scope.tasks.length; i ++){
            if ($scope.tasks[i].down && $scope.tasks[i].status == 1){
                count ++;
            }
        }
        return count;
    }
    function getTaskUploading() {
        var count = 0;
        for (var i  = 0; i < $scope.tasks.length; i ++){
            if (!$scope.tasks[i].down && $scope.tasks[i].status == 1){
                count ++;
            }
        }
        return count;
    }
    function addNewDownloadTask(task) {
        if (task.down){
            if (getTaskDownloading() < 5){
                startDownload(task);
            }
        } else {
            if (getTaskUploading < 5){
                startUpload(task);
            }
        }

    };
    function addNewUploadTask(task) {
        if (getTaskUploading() < 5){
            startUpload(task);
        }
    }
    function startDownload(task) {
        delete task.error;
        delete task.pause;
        task.status = 1;
        task.taskId = PDCommon.UrlDownload(task.url, '', task.file, function (success, res) {
            if (success == false){
                onError(res);
            }else{
                if (typeof res == 'object'){
                    var progress = res.progress;
                    onProgress(progress);
                } else {
                    //var result = JSON.parse(res)
                    onComplete();
                }
            }
        });
        function onError(code) {
            task.status = 0;
            task.error = code;
            delete task.taskId;
            PDCommon.resetData('tasks', $scope.tasks);
            restartTasks();
            $scope.$apply();
        }
        function onProgress(progress) {
            if (task.progress != progress){
                task.progress = progress;
                PDCommon.resetData('tasks', $scope.tasks);
                $scope.$apply();
            }
        }
        function onComplete() {
            task.status = 3;
            task.progress = 100;
            PDCommon.resetData('tasks', $scope.tasks);
            restartTasks();

            var file = task.file;
            task.file = file.replace(/\.emdowntemp$/, '');
            PDCommon.FileMove2(file, task.file);
            $scope.$apply();
        }
    }
    function startUpload(task, cb) {
        cb = cb || function(){};
        delete task.error;
        delete task.pause;
        task.status = 1;
        var post = {
            disk_no: '1', //task.disk
            token: PDSoap.getToken(),
            folder_id: task.parent,
            name: task.title
        }
        
        task.taskId = PDCommon.UrlUpload2(task.url, task.file, 'file', post, function (success, res) {
            if (success == false){
                onError(res);
            }else{
                if (typeof res == 'object'){
                    var progress = res.progress;
                    onProgress(progress);
                } else {
                    var result;
                    try {
                        result = JSON.parse(res)
                    }catch (e){}
                    onComplete(result);
                }
            }
        });
        function onError(code) {
            task.status = 0;
            task.error = code;
            delete task.taskId;
            PDCommon.resetData('tasks', $scope.tasks);
            restartTasks();
            cb(false);
            $scope.$apply();
        }
        function onProgress(progress) {
            if (task.progress != progress){
                task.progress = progress;
                PDCommon.resetData('tasks', $scope.tasks);
                $scope.on_update(task.folder_id, false, task.file, progress);
                $scope.$apply();
            }
        }
        function onComplete(result) {
            if (result && result.errcode == 201) {
                window.top.location.href = './main.html';
                return;
            }

            task.status = 3;
            task.progress = 100;
            PDCommon.resetData('tasks', $scope.tasks);
            restartTasks();

            $scope.on_update(task.folder_id, false, task.file, 100);

            cb(true, result);
            $scope.$apply();
        }
    }
    function pauseTask(task, force, cb) {
        cb = cb || function(){};
        var taskId = task.taskId;
        delete task.taskId;
        task.status = 0;
        if (force)
            task.pause = true;
        else
            delete task.pause;

        if (taskId){
            PDCommon.UrlDownloadOrUploadCancel(taskId, cb);
            restartTasks();
        } else {
            cb();
        }
        PDCommon.resetData('tasks', $scope.tasks);
    }

    ////////////////////////////////////////
    function getItemIcon(task) {
        var ext = task.title;
        ext = ext.toLowerCase();
        ext = ext.match('\.([^\.]+)$');
        if (ext)
            ext = ext[1];
        else
            ext = '';

        var media = ['avi','mpeg','rmvb','mov','asf','qt','wav','mp3','mp4','.3gp','mid','wav'];
        var image = ['gif','bmp','jpg','jpeg','svg','swf', 'mag'];
        var word = ['doc','docx'];
        var excel = ['xls','xlsx'];
        var ppt = ['ppt','pptx'];
        var zip = ['zip','7zp','rar'];
        var text = ['txt','sql','rtf','h','c','cpp','cc'];

        if (isFile(ext, media))
            task.icon = 'images/file_media.png';
        else if (isFile(ext, image))
            task.icon = 'images/file_image.png';
        else if (isFile(ext, word))
            task.icon = 'images/file_word.png';
        else if (isFile(ext, excel))
            task.icon = 'images/file_ppt.png';
        else if (isFile(ext, zip))
            task.icon = 'images/file_zip.png';
        else if (isFile(ext, text))
            task.icon = 'images/file_text.png';
        else
            task.icon = 'images/file_unknown.png';

        function isFile(ext, all) {
            for (var i in all){
                if (all[i] == ext)
                    return true;
            }
            return false;
        }
    }
});

function addUploadTask(disk_index, folder_id, file, on_update) {
    var $scope = $('[ng-controller=all]').scope();
    if (typeof file == 'object'){
        var dir = file;
        PDTools.showLoading();
        var file_tasks = [];

        create_dir(dir, folder_id, function (success, message) {
            if (!success) {
                PDTools.showLoading(false);
                PDTools.notify(message);
            }else{
                PDTools.showLoading(false);
                $scope.on_update(folder_id, false);
                for (var i = 0; i < file_tasks.length; i ++){
                    addFileTask(file_tasks[i].file, file_tasks[i].folder_id);
                }
                $scope.$apply();
            }
        })

        function create_dir(dir, parent, cb) {
            create(getName(dir.path), parent, function (success, id) {
                if (!success){
                    cb (false, id);
                    return;
                }
                check(0, function (success, message) {
                    if (!success)
                        cb (false, message);
                    else
                        cb(true);
                });
                function check(pos, cb) {
                    if (!dir.children || pos >= dir.children.length){
                        cb(true);
                        return;
                    }
                    if (typeof dir.children[pos] == 'object'){
                        create_dir(dir.children[pos], id, function (success, message) {
                            if (!success)
                                cb (false, message);
                            else
                                check(pos+1, cb);
                        });
                    }else{
                        file_tasks.push({file:dir.children[pos], folder_id: id});
                        check(pos+1, cb);
                    }
                }
            });
        }
        function create(name,parent, cb) {
            PDSoap.ajax({
                url: '/cloudfile/file/create',
                type: 'POST',
                data:{
                    disk_no: '1', //task.disk
                    token: PDSoap.getToken(),
                    folder_parent: parent,
                    name: name
                },
                complete: function () {},
                error: function () {
                    cb(false, '网络错误');
                },
                success: function (result) {
                    if (result.errcode > 0){
                        cb(false, result.errmsg);
                        return;
                    }
                    if (!result.data.id){
                        cb(false, '创建目录失败:id');
                        return;
                    }
                    cb(true, result.data.id);
                }
            })
        }
        function getName(dir) {
            dir = dir.replace(/\\/g,'/');
            if (dir[dir.length - 1] == '/')
                dir = dir.substring(0, dir.length - 1);
            return dir.match('/([^/]+)$')[1];
        }
        return;
    }else{
        addFileTask(file, folder_id);
        $scope.$apply();
    }

    function addFileTask(file, folder_id) {
        var file_name = file.match(/[\/\\]+([^\/\\]*)$/)[1];
        var task = {
            url: 'http://'+PDSoap.getHost() + '/cloudfile/file/upload',
            title: file_name,//'13123.avi',
            parent: folder_id,
            file:file,
            progress: 0,
            down:false,
            status: 0, //0:等待 1: 正在上传或下载  3：完成
            fun_update: on_update
        };
        $scope.addTask(task);
    }

}
function addDownloadTask(disk_index, dir, tasks) {
    var $scope = $('[ng-controller=all]').scope();

    for (var i in tasks){
        tasks[i].name = tasks[i].name.replace(/[\\\/:\*\?"<>|']/g, '-');
    }

    dir = dir.replace(/\\/g,'/');

    var file_tasks = [];
    getTaskFile(dir, tasks, file_tasks, function (success, message) {
        if (!success){
            PDTools.notify(message);
            return;
        }
        for (var i = 0; i < file_tasks.length; i ++){
            var task = file_tasks[i];
            var file = makeName(task.folder_parent, task.is_folder, task.name);
            if (task.is_folder){
                if (!PDCommon.DirectoryCreate2(file.file)){
                    PDTools.notify('创建目录错误：'+ file.file);
                }
                file_tasks[i].file = file.file;
                file_tasks.splice(i, 1);
                i --;
            }else{
                file.file += ".emdowntemp";
                file_tasks[i].file = file.file;
                if (!PDCommon.FileCreate2(file.file)){
                    PDTools.notify('创建文件错误：'+ file.file);
                    file_tasks.splice(i, 1);
                    i --;
                }
            }
        }
        var ids = '';
        for (var i = 0; i < file_tasks.length; i ++){
            ids += file_tasks[i].id + ',';
        }
        if (ids == '') return;
        ids = ids.substring(0, ids.length - 1);
        getUrl(ids, function (success, files) {
            if (!success){
                for (var i = 0; i < file_tasks.length; i ++){
                    PDCommon.FileDelete(file_tasks[i].file);
                }
                PDTools.notify('获取下载地址出错');
                return;
            }

            var count  = 0;
            for (var i = 0; i < file_tasks.length; i ++){
                var url = '';
                for (var j in files){
                    if (file_tasks[i].id == files[j].id)
                        url = files[j].url;
                }
                if (url != ''){
                    if (url.indexOf('http') !=0 ){
                        url = 'http://'+PDSoap.getHost()+url;
                    }
                    var file = file_tasks[i].file;
                    var file_name = file_tasks[i].name;//file.match(/[\/\\]+([^\/\\]*)$/)[1];
                    var task = {
                        title: file_tasks[i].name,//'13123.avi',
                        file:file_tasks[i].file,
                        url: url,
                        progress: 0,
                        down:true,
                        folder: file_tasks[i].folder_parent,
                        status: 0 //0:等待 1: 正在上传或下载  3：完成
                    };
                    count ++;
                    $scope.addTask(task);
                }else{
                    PDCommon.FileDelete(file_tasks[i].file);
                }
            }
            if (count < file_tasks.length){
                PDTools.notify('有'+(file_tasks.length - count)+'个文件下载地址获取失败');
            }
            $scope.$apply();
        });

    });

    function getTaskFile(folder_parent, tasks, file_tasks, cb) {
        folder_parent = folder_parent.replace(/\\/g, '/');
        getAllFiles(0, function (success, message) {
            cb(success, message);
        });
        function getAllFiles(pos, cb_return) {
            if (pos >= tasks.length){
                cb_return(true);
                return;
            }
            if (tasks[pos].is_folder){
                var file = tasks[pos];
                file.folder_parent = folder_parent;
                file_tasks.push(file);

                getFiles(tasks[pos].id, function (files, message) {
                    if (files == false){
                        cb_return(false, message);
                        return;
                    }

                    var file = makeName(folder_parent, true, tasks[pos].name);
                    getTaskFile(folder_parent + '/' + file.name, files, file_tasks, function (success, message) {
                        if (!success){
                            cb_return(success, message);
                            return;
                        }
                        getAllFiles(pos + 1, cb_return);
                    });
                });
            } else {
                var file = tasks[pos];
                file.folder_parent = folder_parent;
                file_tasks.push(file);
                getAllFiles(pos + 1, cb_return);
            }

        }
    }
    function getFiles(parent, cb) {
        PDSoap.ajax({
            url: '/cloudfile/file/get',
            data:{
                token: PDSoap.getToken(),
                disk_no: 1,
                folder_parent: parent
            },
            complete: function () {},
            error: function () {
                cb(false, '网络错误');
            },
            success: function (result) {
                if (result.errcode > 0){
                    cb(false, result.errmsg);
                    return;
                }
                cb(result.data.files);
            }
        })
    }
    function getUrl(ids, cb) {
        PDSoap.ajax({
            url: '/cloudfile/file/download_url',
            type: 'POST',
            data:{
                token: PDSoap.getToken(),
                id: ids
            },
            complete: function () {},
            error: function () {
                cb(false, '通信错误');
            },
            success: function (result) {
                if (result.errcode > 0){
                    cb(false, result.errmsg);
                    return;
                }
                cb(true, result.data.files);
            }
        })
    }
    function makeName(dir_parent, is_folder, name, cb) {
        //dir_parent
        if (dir_parent.lastIndexOf('/') == dir_parent.length - 1)
            dir_parent = dir_parent.substring(0, dir_parent.length - 1);


        for (var i = 1; i < 1000000; i ++){
            var name_real = name;
            if (is_folder){
                if (i == 1)
                    name_real = name_real;
                else
                    name_real = name_real + '('+i+')';

                var file = dir_parent + '/' + name_real;
                if (!PDCommon.FileExists2(file)){
                    return {file:file,name:name_real};
                }
            }else{
                if (i == 1) {
                    name_real = name_real;
                } else {
                    var index = name_real.lastIndexOf('.');
                    if (index == -1)
                        name_real = name_real + '('+i+')';
                    else
                        name_real = name_real.replace(/(.*)\.([^\.]+)$/, '$1('+i+').$2');
                }

                var file = dir_parent + '/' + name_real;
                if (!PDCommon.FileExists2(file) && !PDCommon.FileExists2(file + '.emdowntemp')){
                    return {file:file,name:name_real};
                }
            }

        }
        return {file:dir_parent + '/' + name, name:name};
    }
    function getRelativePath(parent, folder_path) {
        parent = parent.replace(/\\/g, '/');

        var arr = folder_path.split('/');
        var folder = '';
        for (var i in arr){
            var arr2 = arr[i].split('|');
            if (arr2.length != 2){
                PDTools.notify('获取目录数据失败');
                return;
            }
            folder += arr2[0] + '/';
        }
        if (folder.length > 0)
            folder = folder.substring(0, folder.length - 1);

        folder = folder.replace(/\\/g, '/');
        if (folder.indexOf(parent) == 0){
            folder = folder.substring(parent.length);

        }
        if (folder.length > 0 && folder[0] == '/')
            folder = folder.substring(1);
        return folder;
    }

}

