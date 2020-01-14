/**
 * Created by kingfun on 2016/1/17.
 */
EMCloudFile = (function(EMCloudFile) {
    EMCloudFile.getSettings = function () {
        return PDCommon.getData('settings');
    };
    EMCloudFile.setSettings = function (obj) {
        return PDCommon.setData('settings', obj);
    };
    EMCloudFile.WindowMove = function (x, y) {
        PDInterface.doAction("WindowMove", {x: x, y: y});
    };
    EMCloudFile.WindowCommand = function (cmd) {
        PDInterface.doAction("WindowCommand", {cmd: cmd});
    };
    /*EMCloudFile.HasNote = function (name,　callback){
        callback = callback || function () {};
        var id = PDInterface.doAction("HasNote", {name: name},function (ret) {
            if (ret.success == false) {
                callback(false, 404);
                return;
            } else {
                callback(ret.result.success);
            }
        });
    }*/
    EMCloudFile.DownloadNote = function (name, url, post, callback){
        callback = callback || function () {};
        var id = PDInterface.doAction("DownloadNote", {name: name, url: url, post:post},function (ret) {
            //console.log(id + ' ' + JSON.stringify(ret));
            if (ret.success == false) {
                callback(false, 404);
                return;
            }
            if (ret.result.status >= 0) {
                if (ret.result.success == false) {
                    callback(false, ret.result.code);
                }
                else if (ret.result.status == 200) {
                    callback(true, ret.result.response);
                } else {
                    callback(false, ret.result.status);
                }
                PDInterface.cancelAction(id);
            } /*else {
                callback(true, {flag: ret.result.status, progress: ret.result.progress});
            }*/
        }, true);
    }
    EMCloudFile.RemoveNote = function (name, cb){
        PDInterface.doAction("RemoveNote", {name: name}, cb);
    }
    EMCloudFile.SetNoteDetail = function (name, note, cb) {
        PDInterface.doAction("SetNoteDetail", {name: name,note:note}, cb);
    }
    EMCloudFile.GetNoteDetail = function (name, cb) {
        cb = cb||function(){};
        PDInterface.doAction("GetNoteDetail", {name: name}, function (ret) {
            if (ret.success == false)
                cb(false);
            else
                cb(ret.result);
        });
    }
    EMCloudFile.ClearNoteCache = function (cb) {
        cb = cb || function(){};
        var success = true;
        PDCommon.DirectoryRemove('%notes%', function (ret) {
            if (!ret || !ret.result)
                success = false;
            PDCommon.DirectoryRemove('%app_web%', function (ret) {
                if (success == true)
                    success = ret && ret.result;
                PDCommon.DirectoryRemove('%app_attachment%', function (ret) {
                    if (success == true)
                        success = ret && ret.result;
                    cb(success);
                });
            });
        });
    }
    EMCloudFile.NoteUnzip = function (name, cb) {
        cb = cb || function(){};
        PDInterface.doAction("NoteUnzip", {name: name}, function (ret) {
            if (ret.success == false)
                cb(false);
            else
                cb(ret.result);
        });
    }
    EMCloudFile.ZipDirectoryFiles = function (directory, file, cb) {
        PDInterface.doAction("ZipDirectoryFiles", {dir:directory, file:file}, function (ret) {
            if (ret.success == false)
                cb(false);
            else
                cb(ret.result);
        });
    }
    EMCloudFile.ExpandFileName = function (file, cb) {
        PDInterface.doAction("ExpandFileName", {file:file}, function (ret) {
            if (ret.success == false)
                cb(false);
            else
                cb(ret.result);
        });
    }
    return EMCloudFile;
})(typeof EMCloudFile === 'undefined' ? {} : EMCloudFile);
