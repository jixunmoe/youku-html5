// 浏览器会拒绝 https 发送至 http 的请求 orz
if (location.protocol == 'https:') {
    location.href = location.href.replace('s:', ':');
    throw new Error('Use HTTP; ');
}

var sid = location.search.slice(1);
if (!sid) {
    location.href = '/';
    throw new Error('SID not found.');
}

$.jsonp = function (url, cbName) {
    return $.ajax({
        url: url,
        dataType: 'jsonp',
        jsonp: cbName || 'callback'
    });
};

var _url = 'http://v.youku.com/player/getPlaylist/VideoIDS/' + sid + '/Pf/4/ctype/12/ev/1';
$.getVideoData = function (cbPlayerData) {
    $.jsonp(_url, '__callback').done(function (data) {
        try {
            cbPlayerData($.extend(data.data[0], decodeYouku(data)));
        } catch (err) {
            $('#error').text('抓取播放数据时发生错误: ' + err.message);
        }
    });
};

var keyName = {
    '3gp'  : '渣清',
    '3gphd': '低清',
    'flv'  : '标清',
    'flvhd': '高清',
    'mp4'  : '标清',
    'hd2'  : '高清 2',
    'hd3'  : '高清 3'
};