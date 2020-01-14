if (typeof PDTaskAnimate === 'undefined')
    PDTaskAnimate = {};
PDTaskAnimate.show = function (sources, cb) {
    cb = cb || function () {};
    
    var rect = getAbsoluteRect($('.btn_task')[0])
    var ptDestX = (rect.left + rect.right) / 2;
    var ptDestY = (rect.bottom + rect.top) / 2;

    var rectSrc;
    for (var i in sources){
        rectSrc = union(rectSrc, getAbsoluteRect(sources[i]));
    }

    rectSrc = {left:rectSrc.left,right:rectSrc.right,top:rectSrc.top, bottom:rectSrc.bottom};
    $('.mask_animate').show();

    var width = rectSrc.right - rectSrc.left;
    var height = rectSrc.bottom - rectSrc.top;
    var distance = rectSrc.top - ptDestY;
    showRect(rectSrc);
    setTimeout(animate, 30);
    function animate() {
        var moveX = (ptDestX - rectSrc.left) / 10;
        var moveY = (ptDestY - rectSrc.top) / 10;
        if (Math.abs(moveX) < 1) moveX = moveX > 0 ? 1 : -1;
        if (Math.abs(moveY) < 1) moveY = moveY > 0 ? 1 : -1;


        rectSrc.left += moveX;
        rectSrc.top += moveY;

        var continueToShow = true;
        if (rectSrc.top <= ptDestY){
            rectSrc.left = ptDestX;
            rectSrc.top = ptDestY;
            continueToShow = false;
        }

        //(rectSrc.right - rectSrc.left)/width = (rectSrc.top - ptDestY)/distance;
        rectSrc.right = (rectSrc.top - ptDestY)/distance*width + rectSrc.left;
        rectSrc.bottom = (rectSrc.top - ptDestY)/distance*height + rectSrc.top;

        showRect(rectSrc);
        if (continueToShow){
            setTimeout(animate, 30);
        }else{
            $('.mask_animate').hide();
            cb();
        }
    }

    function showRect(rect) {
        //console.log(rect.right + '   ' + rect.top);
        $('.mask_animate').css({left:rect.left, top: rect.top, width:rect.right-rect.left,height:rect.bottom-rect.top});
    }

    function getAbsoluteRect(obj) {
        var rect = obj.getBoundingClientRect();
        var top = document.documentElement.clientTop;
        var left= document.documentElement.clientLeft;
        rect.left -= left;
        rect.right -= left;
        rect.top -= top;
        rect.bottom -= top;
        return rect;
    }

    function union(rect1, rect2) {
        if (rect2 == undefined)
            return rect1;
        if (rect1 == undefined)
            return rect2;
        var rect = {};
        rect.left = rect1.left < rect2.left ? rect1.left : rect2.left;
        rect.top = rect1.top < rect2.top ? rect1.top : rect2.top;
        rect.right = rect1.right > rect2.right ? rect1.right : rect2.right;
        rect.bottom = rect1.bottom > rect2.bottom ? rect1.bottom : rect2.bottom;
        return rect;
    }

}