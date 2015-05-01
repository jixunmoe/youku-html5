jQuery(function(window, $) {
    var $q = $('#q');
    var $auto_q = $('#auto_q');
    var $player = $('#player');

    $.getVideoData(function (data) {
        document.title = data.title + ' - 油库里 HTML5 播放器';
        var urls = data._videoSegsDic;
        var lis = {};
        var keys = Object.keys(urls);
        keys.forEach(function (key) {
            var q = keyName[key] || key;
            var $li = $('<li>').appendTo($q);
            $li.text(q + ' [' + key + ']: ');
            lis[key] = $li;

            urls[key].forEach(function (item, i) {
                $li.append($('<a>').addClass('change-q btn').text('p' + (i + 1) ).attr('href', item.src));
            });
        });

        var defaults = $auto_q.val().split(',').map(function (s) { return s.trim(); });
        var defQ = defaults.filter(function (name) {
            return keys.indexOf(name) !== -1;
        }).shift();
        if (defQ && lis[defQ]) {
            $('.change-q', lis[defQ]).first().click();
        }
    });

    var $auto_next = $('#auto_next');
    var playNextPart = $auto_next.prop.bind($auto_next, 'checked');

    var doSentReady = true;
    $('body').on('click', 'a.change-q', function (e) {
        doSentReady = true;
        var link = $(e.currentTarget);
        $('.change-q.current').removeClass('current');
        link.addClass('current');
        $player.prop('src', link.attr('href'));
        e.preventDefault();
    });

    $player.on('ended', function () {
        if(playNextPart()) {
            console.info('播放下一分p ..');
            $('.change-q.current').next().click();
        }
    });

    $auto_next.change(function () {
        localStorage.auto_next = playNextPart() ? 1 : 0;
    });
    $auto_q.change(function () {
        localStorage.auto_q = $auto_q.val();
    });

    $(window).on('storage', function (e) {
        console.info('Update %s to %s.', e.key, e.newValue);
        switch(e.key) {
            case 'auto_next':
                playNextPart(e.newValue == '1');
                break;

            case 'auto_q':
                $auto_q.val(e.newValue);
                break;

            default:
                console.info('Unknown key changed: %s', e.key);
                break;
        }
    });

    playNextPart(localStorage.auto_next !== '0');
    var auto_q = localStorage.auto_q;
    if (typeof auto_q == 'undefined')
        auto_q = 'hd3,mp4,3gphd';

    $auto_q.val(auto_q);

    // Cross domain:
    // change host to the host name of this script.
    // frame.contentWindow.postMessage({item: 'size', ..}, 'https://host/');
    
    var _cache_origin, _cache_id ;
    function postMsg (ctx, action, id, reply, origin) {
        ctx.postMessage({
            item:  action,
            id:    id,
            type:  '_youku_html5',
            reply: reply
        }, origin || _cache_origin);
    }

    addEventListener('message', function (e) {
        var r = null;

        switch (e.data.item) {
            case '_cache':
                _cache_origin = e.origin;
                _cache_id     = e.data.id;
                break;

            case 'currentTime':
                r = $player.prop('currentTime');
                break;

            case 'next':
                // 播放下一分p
                break;

            case 'hide':
                r = $(String(e.data.selector)).hide().length > 0;
                break;

            case 'show':
                r = $(String(e.data.selector)).hide(e.data.display).length > 0;
                break;

            case 'pause':
                $player[0].pause();
                r = true;
                break;

            case 'paused':
                r = $player[0].paused;
                break;

            case 'size':
                r = { h: $player.height(), w: $player.width() };
                break;

            case 'rmpad':
                $('html,body').css({padding: 0, margin: 0});
                break;
        }

        postMsg(e.source, e.data.item, e.data.id, r, e.origin);
    }, false);

    var maxWait = 4000;
    var initTime;
    function oncePlayerReady () {
        if (doSentReady && window != window.top) {
            if (!_cache_origin) {
                if (!initTime) initTime = +new Date();

                if (new Date() - initTime < maxWait)
                    setTimeout(oncePlayerReady, 200);
                
                return ;
            }
            doSentReady = false;
            postMsg(window.top, 'ready', _cache_id, { h: $player.height(), w: $player.width() });
        }
    }

    $player.on('play', oncePlayerReady);
}.bind(null, window));