/**
 * Created by PDTech-PC on 2017/4/3.
 */
if (typeof PDTools === 'undefined')
    PDTools = {};
PDTools.notify = function (text, delay) {
    /*if (window.top != window){
        return window.top.frames.PDTools.notify(text, delay);
    }*/
    if (typeof (delay) == 'undefined')
        delay = 1000;
    if ($('.pdnotify_container').length === 0){
        var node = $('<p class="pdnotify_container"><span class="pdnotify"></span></p>');
        node.css('position', 'fixed');
        node.css('left', '0');
        node.css('right', '0');
        node.css('bottom', '0');
        node.css('top', '0');
        node.css('padding-top', '65px');
        node.css('display', 'none');
        node.css('margin', '0');
        node.css('z-index', '99999999');
        node.css('background-color', 'rgba(0, 0, 0, 0.5)');

        node.css('text-align', 'center');
        node.find('.pdnotify').css('height', '25px');
        node.find('.pdnotify').css('line-height', '25px');
        node.find('.pdnotify').css('background-color', 'rgba(255, 106, 0, 0.95)');
        node.find('.pdnotify').css('border-radius', '20px');
        //node.find('.pdnotify').css('border', '1px solid darkgoldenrod');
        node.find('.pdnotify').css('padding', '30px 60px');
        node.find('.pdnotify').css('color', '#fff');
        node.find('.pdnotify').css('font-weight', 'bold');
        node.find('.pdnotify').css('font-size', '18px');
        //node.find('.pdnotify').css('top', '10px');
        //node.find('.pdnotify').css('position', 'absolute');
        $('body').append(node);
    }
    $('.pdnotify_container .pdnotify').html(text);
    $('.pdnotify_container').fadeIn('fast', function () {
        setTimeout(function () {
            $('.pdnotify_container').fadeOut('fast');
        }, delay);
    });
};
PDTools.showLoading = function (show, self) {
    if (self != true && window.top != window){
        return window.top.frames.PDTools.showLoading(show);
    }
    if (show !== false)
        show  = true;
    if ($('.pdloading_container').length === 0){
        var path = window.location.href;
        path = path.match('://[^/]*(/[^/]*/).*')[1];

        var node = $('<div class="pdloading_container"><img class="image"></div>');
        node.css('position', 'fixed');
        node.css('left', '0');
        node.css('right', '0');
        node.css('bottom', '0');
        if (self == true)
            node.css('top', '0px');
        else
            node.css('top', '0px');
        node.css('padding-top', '35px');
        node.css('z-index', '99999999');
        node.css('display', 'none');
        node.css('background-color', 'rgba(0, 0, 0, 0.1)');
        node.css('text-align', 'center');
        node.find('.image').css('width', '100px');
        node.find('.image').css('height', '9px');
        node.find('.image').css('position', 'absolute');
        node.find('.image').css('top', '48%');
        node.find('.image').attr('src', path + 'images/loading.gif');
        $('body').append(node);
    }
    if (show)
        $('.pdloading_container').fadeIn('fast');
    else
        $('.pdloading_container').fadeOut('fast');
};
PDTools.checkLogin = function (xhr) {
    if (xhr.getResponseHeader('PDLogin') == '1' || xhr.responseText == 'PDLogin'){
        var path = window.location.href;
        path = path.match('://[^/]*(/[^/]*/).*')[1];
        window.top.location.href = path + 'login.html';
    } 
};
PDTools.clone = function (obj) {
    var o;
    if (typeof obj == "object") {
        if (obj === null) {
            o = null;
        } else {
            if (obj instanceof Array) {
                o = [];
                for (var i = 0, len = obj.length; i < len; i++) {
                    o.push(this.clone(obj[i]));
                }
            } else {
                o = {};
                for (var j in obj) {
                    o[j] = this.clone(obj[j]);
                }
            }
        }
    } else {
        o = obj;
    }
    return o;
}
PDTools.showDialog = function (title, text, cbClose) {
    var html = '<div id="dialog_msg">\
        <div id="windowHeader">编辑</div>\
        <div style="overflow: hidden;margin: 10px">\
        <div style="height: 50px;">\
        <p class="text" style="text-align: center;font-size: 14px;font-weight: bold">内容</p>\
        </div>\
        <div style="margin-top: 5px;">\
        <input id="Cancel" jqxControl="button" type="button" value="取消" style="margin-left: 5px;width: 60px;height: 30px;float:right" >\
        <input id="OK" jqxControl="button" type="button" value="确认" style="margin-left: 35px;width: 60px;height: 30px;float:right" >\
        </div>\
        </div>\
        </div>';
    var win = $(html);
    var windowSettings = {width: 300, height: 160};
    win.PDModalWindow(windowSettings);
    win.PDModalWindow('open');
    var ok = false;
    win.unbind('close').bind('close',function () {
        cbClose = cbClose || function () {};
        cbClose(ok);
        //win.remove();
    });
    win.on('open',function () {
        win.find('#windowHeader').children('div:eq(0)').html(title);
        win.find('.text').html(text);
    });
    win.find('#OK').jqxButton({template:'warning'});
    win.find('#Cancel').jqxButton({template:'default'}); //success
    win.find('#OK').click(function () {
        ok = true;
        win.PDModalWindow('close');
    });
    win.find('#Cancel').click(function () {
        ok = false;
        win.PDModalWindow('close');
    });
    return;
}
PDTools.showConfirm = function (text, win_self, cb) {
    if (typeof win_self == 'function'){
        cb = win_self;
        win_self = false;
    }
    cb = cb || function(){};
    if (win_self == false && window.top != window){
        return window.top.frames.PDTools.showConfirm(text, cb);
    }
    var confirm = $('.pdwebconfirm_');
    if (confirm.length == 0){
        var div = '<div class="pdwebconfirm_" style="position: fixed;left:0;top:0px;bottom:0;right:0;background: rgba(255, 255, 255, 0.5);z-index: 999999991">\
            <div style="position:absolute;width: 300px;left: calc(50% - 150px);top:calc(50% - 80px);background: #fff;border-radius: 4px 4px 0 0;box-shadow: 0 0 10px #000;">\
                <div class="caption" style="background: #f4f4f4;display: flex;flex-direction: row;border-bottom: 1px solid #eee;">\
                    <img style="width:18px;height:18px;margin: 8px 2px 0 8px;" src="images/warning2.png" />\
                    <p style="padding: 8px 2px; flex-grow: 1;"></p>\
                    <img class="close" src="images/close2.png" style="width: 24px;height: 24px;margin: 4px;"/>\
                </div>\
                <div style="padding: 20px">\
                    <p class="pdwebconfirm_text" style="font-size: 14px">adfasdf</p>\
                    <div style="display: flex;flex-direction: row;margin-top: 20px">\
                        <p style="flex-grow: 1"></p>\
                        <p class="ok" style="border-color: #4898d5;border-radius:3px;background-color: #3E87FF;padding: 5px 20px;color: #fff;cursor: pointer">确认</p>\
                        <p class="cancel" style="border-color: #f1f1f1;border-radius:3px;background-color: #dedede;padding: 5px 20px;margin-left:10px;cursor: pointer">取消</p>\
                </div>\
                </div>\
            </div>\
        </div>';
        confirm = $(div);
        confirm.find('.caption').css({'background':'url(images/dialog_title.png','background-size': '100% 100%'});
        $('body').append(confirm);
    }
    confirm.find('.close').unbind('click').bind('click', function () {
        confirm.fadeOut('fast');
        cb(false);
    });
    confirm.find('.cancel').unbind('click').bind('click', function () {
        confirm.fadeOut('fast');
        cb(false);
    });
    confirm.find('.ok').unbind('click').bind('click', function () {
        confirm.fadeOut('fast');
        cb(true);
    });
    confirm.find('.pdwebconfirm_text').html(text);
    confirm.fadeIn();
}
PDTools.formatDate = function (d, time) {
    var s = '';
    s += d.getFullYear();
    s += '-';
    s += d.getMonth() > 8 ? (d.getMonth()+1) : ('0'+(d.getMonth()+1));
    s += '-';
    s += d.getDate() > 9 ? d.getDate() : ('0'+d.getDate());
    if (time == true){
        s += ' ';
        s += d.getHours() > 9 ? d.getHours() : ('0'+d.getHours());
        s += ':';
        s += d.getMinutes() > 9 ? d.getMinutes() : ('0'+d.getMinutes());
        s += ':';
        s += d.getSeconds() > 9 ? d.getSeconds() : ('0'+d.getSeconds());
    }
    return s;
}
PDTools.getFileName = function (path){
    var index = path.indexOf('\\');
    while (index != -1){
        path = path.substr(index + 1);
        index = path.indexOf('\\');
    }
    index = path.indexOf('/');
    while (index != -1){
        path = path.substr(index + 1);
        index = path.indexOf('/');
    }
    return path;
}

//PDTools.statistic('visitor', 'standard_download', bzbh, 1);
PDTools.statistic = function (user, op, op_data, count) {
    PDSTManager.getServerHost(function (ret) {
        if (!ret.success || !ret.result || !ret.result.host){
            PDTools.notify('接口错误');
            return;
        }
        var pdHost = ret.result.host;
        var data = {
            op: op,
            op_user: user,
            op_data: op_data
        };
        if (op === 'standard_download'){
            var url = pdHost + '/index.php/stitem/addBrowseCount?bzbh='+encodeURIComponent(op_data);
        } else {
            var url = pdHost + '/index.php/ststatistic/';
            if (count != undefined) {
                count = parseInt(count);
                count = count > 0 ? count : 1;
                url += 'updateCount';
                data['op_count'] = parseInt(count);
            } else {
                url += 'add';
                data['op_count'] = 0;
            }
        }
        PDTools.ajax({
            url: url,
            type: 'post',
            data: JSON.stringify(data),
            dataType: 'json',
            complete: function () {},
            error: function () {
                console.error('statistic error: '+op+' '+data);
            }
        });
    });
}

PDTools.ajax = function (obj) {
    obj.xhrFields = {withCredentials: true};
    obj.crossDomain = true;
    var errorOld = obj.error;
    obj.error = function (xhr) {
        PDTools.checkLogin(xhr);
        if (errorOld)
            errorOld(arguments[0],arguments[1],arguments[2]);
    }
    $.ajax(obj);
};

PDTools.cutTime = function (str) {
    str = str.replace(/\..*$/, '');
    return str;
}
PDTools.getQuery = function (url, name){
    if (name == undefined){
        name = url;
        url = window.location.href;
    }
    var val = url.match("http[s]?://[^/]+/.*[&\\?]"+name+"=([^&]*)");
    if (val != null && val.length >= 2)
        return decodeURIComponent(val[1]);
    else
        return "";
}
PDTools.getHost = function () {
    var host = window.location.href;
    host = host.match('^(https?://[^/]*)/.*$')[1];
    return host;
}
PDTools.getScreenPosition = function (obj) {
    if (!obj.length || !obj.find)
        obj = $(obj);

    var win = window;
    var xOffset = 0;
    var yOffset = 0;
    while(true){
        if (win.parent != win){
            xOffset += $(win.frameElement).offset().left - $(win.parent.document).scrollLeft();
            yOffset += $(win.frameElement).offset().top - $(win.parent.document).scrollTop();
            win = win.parent;
        }else{
            break;
        }
    }
    xOffset += obj.offset().left - $(window.document).scrollLeft();
    yOffset += obj.offset().top - $(window.document).scrollTop();
    return {left:xOffset, top: yOffset, right: xOffset + obj.outerWidth(), bottom: yOffset + obj.outerHeight()};
}
PDTools.convertToScreenPosition = function (x, y) {
    var win = window;
    var xOffset = 0;
    var yOffset = 0;
    while(true){
        if (win.parent != win){
            xOffset += $(win.frameElement).offset().left - $(win.parent.document).scrollLeft();
            yOffset += $(win.frameElement).offset().top - $(win.parent.document).scrollTop();
            win = win.parent;
        }else{
            break;
        }
    }
    return {x: xOffset + x, y: yOffset + y};
}
PDTools.reload = function () {
    window.location.href = window.location.href;
}
PDTools.generateGuid = function () {
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    function S4() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }
};

PDTools.UnicodeToUtf8 = function(unicode) {
    var uchar;
    var utf8str = "";
    var i;
    for(i=0; i<unicode.length;i+=2){
        uchar = (unicode[i]<<8) | unicode[i+1];        //UNICODE为2字节编码，一次读入2个字节 
        utf8str = utf8str + String.fromCharCode(uchar);  //使用String.fromCharCode强制转换 
    }
    return utf8str;
}
PDTools.Utf8ToUnicode = function(strUtf8) {
    var i,j;
    var uCode;
    var temp = new Array();
    for(i=0,j=0; i<strUtf8.length; i++){
        uCode = strUtf8.charCodeAt(i);
        if(uCode<0x100){         //ASCII字符 
            temp[j++] = 0x00;
            temp[j++] = uCode;
        }else if(uCode<0x10000){
            temp[j++] = (uCode>>8)&0xff;
            temp[j++] = uCode&0xff;
        }else if(uCode<0x1000000){
            temp[j++] = (uCode>>16)&0xff;
            temp[j++] = (uCode>>8)&0xff;
            temp[j++] = uCode&0xff;
        }else if(uCode<0x100000000){
            temp[j++] = (uCode>>24)&0xff;
            temp[j++] = (uCode>>16)&0xff;
            temp[j++] = (uCode>>8)&0xff;
            temp[j++] = uCode&0xff;
        }else{
            break;
        }
    }
    temp.length = j;
    return temp;
}
