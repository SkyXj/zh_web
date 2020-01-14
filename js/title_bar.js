/**
 * Created by PDTech-PC on 2017/4/5.
 */
function initTitleBar(dialog) {
    $('.title_bar .btn_close').click(function () {
        EMCloudFile.WindowCommand('close');
    });
    //
    /*var settings = EMCloudFile.getSettings();
    if (settings.skin && settings.skin > 1){
        var skins = ['skin_normal','skin_white','skin_black','skin_blue'];
        $('.'+skins[0]).addClass(skins[settings.skin - 1]);
        $('.'+skins[0]).removeClass(skins[0]);
    }*/

    ///
    $('.title_bar img').attr('draggable', 'false');
    ///////////////////////
    var title_down = false;
    var pos_mousedown = {};
    $('.title_bar .no_caption').bind('mousedown', function () {
        return false;
    }).bind('dblclick',function () {
        return false;
    });
    $('.title_bar').bind('mousedown', function (e) {
        title_down = true;
        pos_mousedown = {x: e.pageX, y: e.pageY};
        var mask = $('.mask_mouse_move');
        if (mask.length == 0){
            mask = $('<div style="display:none;position:fixed;left:0;top:0;right:0;bottom:0;"></div>');
            mask.css('background', 'transparent');
            //mask.css('opacity', '0.1');
            $('body').append(mask);
            mask.on({
                mouseup: function () {
                    title_down = false;
                    mask.hide();
                }
            });
        }
        mask.show();
    });
    $(window).bind('mousemove', function (e) {
        if (title_down == false)
            return;
        var pos2 = {x: e.pageX, y: e.pageY};
        var offset = {x: pos2.x - pos_mousedown.x, y: pos2.y - pos_mousedown.y};
        EMCloudFile.WindowMove(offset.x, offset.y);
    }).bind('dblclick',function (e) {
        if (dialog != false)return;
        var pos = {x:e.pageX, y:e.pageY};
        var bar = $('.title_bar');
        var bar_rect = {
            left: bar.offset().left - $(document).scrollLeft(),
            top: bar.offset().top - $(document).scrollTop()
        };
        bar_rect.right = bar_rect.left + bar.width();
        bar_rect.bottom = bar_rect.top + bar.height();
        if (pos.x >= bar_rect.left && pos.x <= bar_rect.right && pos.y >= bar_rect.top && pos.y <= bar_rect.bottom){
            if (!$('.system_buttons .btn_max').is(":hidden")){
                $('.system_buttons .btn_max').hide();
                $('.system_buttons .btn_restore').show();
                EMCloudFile.WindowCommand('maximize');
            }else{
                $('.system_buttons .btn_max').show();
                $('.system_buttons .btn_restore').hide();
                EMCloudFile.WindowCommand('restore');
            }
        }
        //console.log('dbclick');
    });
    if (dialog == false){
        $('.system_buttons .btn_restore').hide();
        $('.system_buttons .btn_min').click(function () {
            EMCloudFile.WindowCommand('minimize');
        });
        $('.system_buttons .btn_max').click(function () {
            $('.system_buttons .btn_max').hide();
            $('.system_buttons .btn_restore').show();
            EMCloudFile.WindowCommand('maximize');
        });
        $('.system_buttons .btn_restore').click(function () {
            $('.system_buttons .btn_max').show();
            $('.system_buttons .btn_restore').hide();
            EMCloudFile.WindowCommand('restore');
        });
        /*$('.title_bar').dblclick(function () {
            //console.log('dbclick');
            if (!$('.system_buttons .btn_max').is(":hidden")){
                $('.system_buttons .btn_max').hide();
                $('.system_buttons .btn_restore').show();
                EMCloudFile.WindowCommand('maximize');
            }else{
                $('.system_buttons .btn_max').show();
                $('.system_buttons .btn_restore').hide();
                EMCloudFile.WindowCommand('restore');
            }
        });*/
    }else{
        $('.system_buttons .grid_image').hide();
        $('.system_buttons .btn_close').show();
    }

}