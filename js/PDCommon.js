/**
 * Created by kingfun on 2016/1/17.
 */
PDCommon = (function(PDCommon) {
    PDCommon.Clone = function (obj) {
        var obj_new;
        if (isArray(obj)){
            obj_new = [];
            for (var i = 0; i < obj.length; i ++)
                obj_new[i] = this.Clone(obj[i]);
        } else if (isObject(obj)){
            obj_new = {};
            for (var key in obj)
                obj_new[key] = this.Clone(obj[key]);
        } else{
            obj_new = obj;
        }
        return obj_new;
        function isArray(o) {
            return (o != null && typeof o === 'object' && o instanceof Array);
        }
        function isObject(o) {
            return (o != null && o != undefined && typeof o === 'object' && o instanceof Array == false);
        }
    };
    PDCommon.Change = function(obj, obj_new){
        if (obj_new == undefined) return;
        if (isArray(obj_new)){
            if (!isArray(obj)){
                return obj_new;
            }
            for (var i = 0; i < obj_new.length; i ++){
                var chidl1 = obj[i];
                var child2 = obj_new[i];
                if (child2 == undefined) continue;
                if (isObject(chidl1) && isObject(child2)){
                    chidl1 = PDCommon.Change(chidl1, child2);
                }else if (isArray(chidl1) && isArray(child2)){
                    chidl1 = PDCommon.Change(chidl1, child2);
                } else if (child2 != undefined){
                    obj[i] = obj_new[i];
                }
            }
            return obj;
        }else if (isObject(obj_new)) {
            if (!isObject(obj)) {
                return obj_new;
            }
            for (var key in obj_new){
                var chidl1 = obj[key];
                var child2 = obj_new[key];
                if (isObject(chidl1) && isObject(child2)){
                    chidl1 = PDCommon.Change(chidl1, child2);
                }else if (isArray(chidl1) && isArray(child2)){
                    chidl1 = PDCommon.Change(chidl1, child2);
                } else if (child2 != undefined){
                    obj[key] = obj_new[key];
                }
            }
            return obj;
        } else {
            return obj_new == undefined ? obj : obj_new;
        }
        function isArray(o) {
            if (o == null || o == undefined) return false;
            var is = (o != null && typeof o === 'object' && o instanceof Array);
            if (!is && typeof o === 'object' && getFunName(o.constructor) == 'Array')
                return true;
            return is;
            function getFunName(f) {
                try{
                    return f.toString().match(/function\s*([^(]*)\(/)[1];
                }catch (e){
                    return '';
                }
            }
        }
        function isObject(o) {
            return (o != null && o != undefined && typeof o === 'object' && o instanceof Array == false);
        }
    };
    PDCommon.getData = function (name) {
        if (typeof name !== 'string' || name === '')
            return {};
        var settings = PDInterface.get(name);
        if (settings)
            settings = JSON.parse(settings);
        else
            settings = {};
        return settings;
    };
    PDCommon.clearData = function (match) {
        PDInterface.clear(match);
    };
    PDCommon.setData = function (name,obj) {
        if (typeof name !== 'string' || name === '')
            return false;
        delNGCode(obj);
        var settings = PDCommon.getData(name);
        settings = PDCommon.Change(settings, obj);
        PDInterface.set(name, JSON.stringify(settings));
        function delNGCode(obj) {
            if (typeof obj == 'object'){
                for (var i in obj){
                    if (i == '$$hashKey'){
                        delete obj[i];
                    }else{
                        delNGCode(obj[i]);
                    }
                }
            }
        }
    };
    PDCommon.resetData = function (name, obj) {
        delNGCode(obj);
        PDInterface.set(name, JSON.stringify(obj));
        function delNGCode(obj) {
            if (typeof obj == 'object'){
                for (var i in obj){
                    if (i == '$$hashKey'){
                        delete obj[i];
                    }else{
                        delNGCode(obj[i]);
                    }
                }
            }
        }
    };
    PDCommon.OpenUrl = function (url) {
        var param = {url: url};
        PDInterface.doAction("OpenUrl", param);
    };
    PDCommon.FileSelect = function (file_type, file_name, multi_select, callback) {
        if (typeof(file_name) == 'function'){
            callback = file_name;
            multi_select = false;
            file_name = '';
        } else if (typeof(multi_select) == 'function'){
            callback = multi_select;
            multi_select = false;
        }
        //图片文件|*.jpg;*png|所有文件|*.*|
        var param = {type:file_type, name: file_name, multiselect: multi_select};
        PDInterface.doAction("SelectFile", param, callback);
    };
    PDCommon.DirectorySelect = function (text, callback) {
        if (callback == undefined){
            callback = text;
            text = '';
        }
        PDInterface.doAction("SelectDirectory", {text:text}, callback);
    };
    PDCommon.GetRunDir = function(){
        return PDInterface.getRunDir();
    }
    PDCommon.FileExists = function (files, callback) {
        var param = {files:files}; //files:[] or files:''
        PDInterface.doAction("File_Exists", param, callback);
    };
    PDCommon.FileExists2 = function (file) {
        return PDInterface.fileExists(file);
    };
    PDCommon.FileCreate2 = function (file) {
        return PDInterface.fileCreate(file);
    };
    PDCommon.FileMove2 = function (file, file2) {
        return PDInterface.fileMove(file, file2);
    };
    PDCommon.DirectoryCreate2 = function (dir) {
        return PDInterface.directoryCreate(dir);
    };
    PDCommon.FileExplorer2 = function (file) {
        return PDInterface.fileExplorer(file);
    };
    PDCommon.FileCopy = function (src, dest, callback) {
        var param = {src:src,dest:dest};
        PDInterface.doAction("File_Copy", param, callback);
    };
    PDCommon.FileWrite = function (file, data, base64, callback) {
        if (typeof base64 == 'function'){
            callback = base64;
            base64 = false;
        }
        var param = {file:file,data:data, base64: base64};
        PDInterface.doAction("File_Write", param, callback);
    };
    PDCommon.FileRead = function (file, bom, callback) {
        if (typeof(bom) == 'function'){
            callback = bom;
            bom = false;
        }
        var param = {file:file, bom:bom};
        PDInterface.doAction("File_Read", param, callback);
    };
    PDCommon.FileDelete = function (file, callback) {
        PDInterface.doAction("File_Delete",{file:file}, callback);
    };
    PDCommon.FileOpen = function (file, callback) {
        callback = callback || function(){};
        PDInterface.doAction("File_Open",{file:file}, function (ret) {
            if (ret && ret.success && ret.result == true)
                callback(true);
            else
                callback(false);
        });
    };
    PDCommon.GetFiles = function (dir, max, callback) {
        callback = callback || function(){};
        PDInterface.doAction("GetDirFiles",{dir:dir, max: max}, function (ret) {
            if (ret && ret.success && ret.result)
                callback(ret.result);
            else
                callback(false);
        });

    }
    //PDCommon.DirectoryCreate('C:/', 'sub/sub');
    PDCommon.DirectoryCreate = function (root, dir, callback) {
        PDInterface.doAction("Directory_Create", {root:root,dir:dir}, callback);
    };
    PDCommon.DirectoryRemove = function (dir, callback) {
        PDInterface.doAction("Directory_Remove", {dir:dir}, callback);
    };
    PDCommon.ExpandFileName = function (file, callback) {
        PDInterface.doAction("ExpandFileName", {file:file}, callback);
    };
    PDCommon.DBGetTables = function (file, callback) {
        PDInterface.doAction("DBGetTables", {file:file}, callback);
    };
    PDCommon.DBCreateTable = function (file, table, table_descrpition, callback) {
        PDInterface.doAction("DBCreateTable", {file:file,table:table,table_des:table_descrpition}, callback);
    };
    PDCommon.DBUpdate = function (file, table, data, callback) {
        PDInterface.doAction("DBUpdate", {file:file,table:table,data:data}, callback);
    };
    PDCommon.DBInsert = function (file, table, data, callback) {
        PDInterface.doAction("DBInsert", {file:file,table:table,data:data}, callback);
    };
    PDCommon.DBQuery = function (file, table, key_col_name, c, c2, condition, callback) {
        if (callback == undefined){
            callback = condition;
            condition = "";
        }
        var param = {file:file, table:table, key_col_name:key_col_name, c:c, c2:c2, condition: condition};
        PDInterface.doAction("DBQuery", param, callback);
    };

    PDCommon.UrlUpload = function (url, file, callback) {
        var param = {url:url,file:file};
        PDInterface.doAction("Url_Upload", param, callback);
    };
    PDCommon.UrlUpload2 = function (url, file, form_file_name, post, callback) {
        for (var i in post){
            post[i] = post[i] + '';
        }
        var param = {url:url,file:file, form_file_name:form_file_name,post: post};
        var id = PDInterface.doAction("Url_Upload2", param, function (ret) {
            //console.log(id + ' ' + JSON.stringify(ret));
            if (ret.success == false){
                callback(false, 404);
                return;
            }
            if (ret.result.status >= 0){
                if (ret.result.success == false) {
                    callback(false, ret.result.code);
                }
                else if (ret.result.status == 200){
                    callback(true, ret.result.response);
                } else {
                    callback(false, ret.result.status);
                }
                PDInterface.cancelAction(id);
            } else{
                callback(true, {flag:ret.result.status, progress: ret.result.progress});
            }
        }, true);
        return id;
    };
    PDCommon.UrlSelectFileToUpload = function (url, file_type, callback) {
        PDCommon.FileSelect(file_type, function (res) {
            if (res.success == false || res.result == '') {
                callback(false, 0);
                return;
            }
            var param = {
                url: url,
                file: res.result
            }
            this.UrlUpload2(url, res.result, {}, callback);
        });
    };
    PDCommon.UrlDownload = function (url, file_type, name, callback) {
        var file = '';
        if (file_type == '' || file_type == null){
            file = name;
            return down(file);
        } else {
            PDCommon.FileSelect(file_type, name, function (res) {
                if (res.success == false || res.result == '') {
                    callback(false, 0);
                    return;
                }
                file = res.result;
                return down(file);
            });
        }
        function down(file){
            var param = {
                url: url,
                file: file
            }
            var id = PDInterface.doAction("Url_Download", param, function (ret) {
                if (ret.success == false){
                    callback(false, 404);
                    return;
                }
                if (ret.result.status >= 0){
                    if (ret.result.success == false) {
                        callback(false, ret.result.code);
                    }
                    else if (ret.result.status == 200){
                        callback(true, ret.result.response);
                    } else {
                        callback(false, ret.result.status);
                    }
                    PDInterface.cancelAction(id);
                } else{
                    callback(true, {flag:ret.result.status, progress: ret.result.progress});
                }
            }, true);
            return id;
        }
    };
    PDCommon.UrlDownloadOrUploadCancel = function (id) {
        PDInterface.cancelAction(id);
    }
    PDCommon.PopupMenu = function (param, callback) {
        callback = callback || function () {};
        PDInterface.doAction("PopupMenu", param, function (ret) {
            if (ret.success == false){
                callback(-1);
            }else{
                callback(ret.result.id);
            }
        });
    }
    PDCommon.ExitApp = function (restart) {
        PDInterface.doAction("ExitApp", {restart: restart});
    }
    PDCommon.getUserName = function () {
        return PDInterface.get_user_name();
    }
    return PDCommon;
})(typeof PDCommon === 'undefined' ? {} : PDCommon);
