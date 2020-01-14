/**
 * Created by kingfun on 2016/1/17.
 */
(function(win){
    if (typeof(win.PDInterface) != "undefined")
        return;
    //////////////////////////
    var PDInterface = function(){
        return new PDInterface.prototype.init();
    }
    PDInterface.prototype = {
        init: function () {
            return this;
        },
        alert: function(message){
            var message = message + '';
            try{
                window.external.Alert(message);
            }catch(e){}
        },
        confirm: function(message){
            var message = message + '';
            try{
                return window.external.Confirm(message);
            }catch(e){}
        },
        log: function(message){
            var message = message + '';
            try{
                window.external.Log(message);
            }catch(e){
            	try{
            		console.log('log:'+message);
            	}catch(e){}
            }
        },
        debug: function(message){
            var message = message + '';
            try{
                window.external.Debug(message);
            }catch(e){
            	try{
            		console.log(message);
            	}catch(e){}
            }
        },
        error: function(message){
            var message = message + '';
            try{
                window.external.Error(message);
            }catch(e){
            	try{
            		console.error(message);
            	}catch(e){}
            }
        },
        set: function(name, str){
            str = str + '';
            name = name + '';
            try{
                window.external.SetData(name, str);
            }catch(e){
                if (localStorage)
                    localStorage[name] = str;
            }
        },
        get: function(name){
            name = name + '';
            try{
                return window.external.GetData(name);
            }catch(e){
                if (localStorage)
                    return localStorage[name];
            }
            return '';
        },
        clear: function (match) {
            try{
                return window.external.ClearData(match);
            }catch(e){
                if (localStorage)
                    return localStorage[match] = undefined;
            }
        },
        getRunDir: function(){
            try{
                return window.external.GetRunDir();
            }catch(e){
                return '';
            }
        },
        fileDelete: function (file) {
            try{
                return window.external.DeleteFile(name);
            }catch(e){
                return false;
            }
        },
        fileExists: function (file) {
            try{
                return window.external.FileExists(file+'');
            }catch(e){
                return false;
            }
        },
        fileCreate: function (file) {
            try{
                return window.external.FileCreate(file+'');
            }catch(e){
                return false;
            }
        },
        fileMove: function (file, file2) {
            try{
                return window.external.FileMove(file+'', file2+'');
            }catch(e){
                return false;
            }
        },
        directoryCreate: function (dir) {
            try{
                return window.external.DirectoryCreate(dir+'');
            }catch(e){
                return false;
            }
        },
        fileExplorer: function (file) {
            try{
                return window.external.FileExplorer(file+'');
            }catch(e){
                return false;
            }
        },
        get_user_name: function () {
            try{
                return window.external.GetUserName();
            }catch(e){
                return '';
            }
        },
        trigger: function(name,data){
            name = name+'';
            if (data)
                data = data+'';
            try{
                if (data)
                    return window.external.OnEvent(name,data);
                else
                    return window.external.OnEvent(name, "");
            }catch(e){}
            return ;
        },
        sleep: function (t) {
            try{
                if (t)
                    return window.external.Sleep(t);
                else
                    return window.external.Sleep(0);
            }catch(e){}
            return ;
        },
        stringTranslate: function (str, method) {
            try{
                return window.external.StringTranslate(str, method);
            }catch(e){}
            return ;
        },
        doAction: function (action, param, callback, persistent){
            var request = action;
            if (typeof (param) === 'function'){
                callback = param;
                param = null;
            }
            if (param != null && typeof(param) == "object")
                request += "?param=" + JSON.stringify(param);
            if (!window.pdQuery){
                var ret = {success: false, code: 100};
                callback = callback || function () {};
                callback(ret);
                return;
            }
            return window.pdQuery({
                request: request,
                persistent: persistent == true ? true : false,
                onSuccess: function(response) {
                    var ret = {success: true};
                    if (response){
                        try{
                            ret.result = JSON.parse(response);
                        } catch(e){
                            ret.result = response;
                        }
                    }
                    if (callback)
                        callback(ret);
                },
                onFailure: function(code, response) {
                    var ret = {success: false, code: code};
                    if (response){
                        try{
                            ret.result = JSON.parse(response);
                        }catch (e){
                            ret.result = response;
                        }
                    }
                    if (callback)
                        callback(ret);
                }
            });
        },
        cancelAction: function (id) {
            window.pdCancelQuery(id);
        }
    };
    PDInterface.prototype.init.prototype = PDInterface.prototype;
    if (typeof(win.PDInterface) == "undefined")
        win.PDInterface = PDInterface();
})(window);
