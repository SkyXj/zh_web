PDSoap = (function(PDSoap) {
    PDSoap.login = function () {
        
    }
    PDSoap.request = function () {
        var soapdata = '<?xml version="1.0" encoding="utf-8"?>';
        soapdata = soapdata + '<soap:Envelope xmlns:q0="http://ecifWebservice" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">';
        soapdata = soapdata + ' <soap:Body>';  soapdata = soapdata + ' <q0:service>';
        soapdata = soapdata + ' <q0:info>&lt;?xml version="1.0" encoding="UTF-8" standalone="yes"?&gt;&lt;PACKAGE VERSION="1.0" TYPE="REQUEST"&gt;&lt;HEAD&gt;&lt;REQUESTTYPE&gt;B0110&lt;/REQUESTTYPE&gt;&lt;/HEAD&gt;&lt;BODY&gt; &lt;MOBILE&gt;';
        soapdata = soapdata + '13333333333';
        soapdata = soapdata + '</MOBILE> </BODY></PACKAGE></q0:info>';
        soapdata = soapdata + ' </q0:service>';
        soapdata = soapdata + ' </soap:Body>';
        soapdata = soapdata + ' </soap:Envelope>';
        $.ajax({
            type:"POST", url:"http://XX.XX.XX.XX/webservice/services/service",
            data:soapdata,
            beforeSend:function(request){
                request.setRequestHeader ("Content-Type","text/xml; charset=gbk");
                request.setRequestHeader ("SOAPAction","http://ecifWebservice/service");
            },
            success:function(result){
                var i = 0;
            },
            error:function(request,errorInfo){
                var i = 0;
            }
        });
    }
    PDSoap.setHost = function (host) {
        PDInterface.set('server_host', host);
    }
    PDSoap.getHost = function () {
        return PDInterface.get('server_host');
    }
    PDSoap.setToken = function (token) {
        PDInterface.set('server_token', token);
    }
    PDSoap.getToken = function () {
        return PDInterface.get('server_token');
    }
    PDSoap.doAction = function (options){
        var host = this.getHost();
        /*
        $.soap({
            url: 'http://'+host+'/services/DocService',
            //SOAPAction: 'http://localhost/services/DocService',
            appendMethodToURL: false,
            method: options.method,
            data: options.data,
            timeout: 5000,
            success: function (soapResponse) {
                if (typeof options.complete == 'function') options.complete();
                var res = soapResponse.toXML();
                if (typeof options.success == 'function') options.success($(res));
            },
            error: function (SOAPResponse) {
                if (typeof options.complete == 'function') options.complete();
                if (typeof options.error == 'function') options.error(SOAPResponse);
            }
        });*/
    }
    PDSoap.ajax = function (obj) {
        if (obj.type == undefined)
            obj.type = 'POST';
        obj.xhrFields = {withCredentials: true};
        obj.crossDomain = true;
        if (!obj.dataType)
            obj.dataType = 'json';
        var errorOld = obj.error;
        var successOld = obj.success;
        obj.error = function (xhr) {
            if (errorOld)
                errorOld(arguments[0],arguments[1],arguments[2]);
        }
        obj.success = function (result) {
            if (result.errcode == 201){
                window.top.location.href = './main.html';
            }else{
                successOld(result);
            }
        }
        $.ajax(obj);
    };
    PDSoap.makePostParam = function (obj) {
        var param = '';
        for (var key in obj){
            param += key + '=';
            param += encodeURIComponent(obj[key]);
            param += '&';
        }
        if (param.length > 1)
            param = param.substring(0, param.length - 1);
        return param;
    }

    return PDSoap;
})(typeof PDSoap === 'undefined' ? {} : PDSoap);