function SegmentPlayer (_opts) {
	var opts = $.extend({
		segs: []
	}, _opts);

	var player = this;
	var _super = {};
	player.on('update-super', function () {
		$.extend(_super, player.constructor.prototype, player);
	});
	player.trigger('update-super');

	var _jump = false;

	// .src: 更新片源
	var _segs = opts.segs;
	var _playIndex = 0;

	player.duration = function () {
		var total = 0;
		for (var i = 0; i < _segs.length; i++) {
			total += _segs[i].seconds;
		}
		return total;
	};

	player.remainingTime = function () {
		return player.duration() - player.currentTime();
	};

	player.segs = function (segs) {
		if (segs === undefined) {
			return [].slice.call(_segs);
		}

		console.info('区段数据: %s 个分p', segs.length);
		// 更新片源, 先暂停视频
		if (!player.paused)
			player.pause();

		// 取得当前视频时间
		var secs = player.currentTime();
		// 更新片源
		_segs = segs;
		_playIndex = -1;
		player.currentTime(secs);
	};

	player.segIndex = function (index) {
		var _i;
		var _type = typeof index;
		if (_type == 'string')
			index = parseInt(index);

		if (_type == 'number') {
			_i = index | 0;
			if (_i >= 0 && _i < _segs.length) {
				_playIndex = _i;
				playSegment();
			} else {
				throw new Error('Invalid segment index: ' + _i);
			}

			return this;
		}

		return _playIndex;
	};

	player.currentTime = function (seconds) {
		if (seconds === undefined) {
			return toAbsTime(_segs, _playIndex, callSuper('currentTime'));
		}


		var _t = toSegmentTime(_segs, seconds);
		if (_t.index !== _playIndex) {
			// 更换分p, 并锁定时间
			_jump = _t.time;
			_playIndex = _t.index;
			playSegment();
		} else {
			// 分p 不变, 更改时间
			callSuper('currentTime', _t.time);
		}
		player.play();
		return player;
	};

	player.on('play', function () {
		if (_jump === false)
			return ;

		callSuper('currentTime', _jump);
		_jump = false;
	});
	player.on('ended', function () {
		_playIndex ++;
		if (_playIndex < _segs.length) {
			// 播放下一分p
			playSegment();
		} else {
			// 结束
			player.trigger('video-end');
		}
	});

	function playSegment () {
		player.src(_segs[_playIndex].src);
	}

	function toAbsTime (segment, index, seconds) {
		var _i = index|0;
		if (_i >= segment.length)
			return 0;

		var totalSec = seconds;
		while (_i --> 0) {
			totalSec += segment[_i].seconds;
		}

		return totalSec;
	}

	function toSegmentTime (segment, seconds) {
		var _s = seconds | 0;
		var _i = 0;

		if (_s > 0) {
			while (_s > 0) {
				_s -= segment[_i++].seconds;
			}

			_s += segment[--_i].seconds;
		}

		return {
			index: _i,
			time:  _s
		};
	}

	function callSuper (fn) {
		return applySuper(fn, [].slice.call(arguments, 1));
	}

	function applySuper (fn, args) {
		return _super[fn].apply(player, args);
	}
}
videojs.plugin('segment', SegmentPlayer);

$((function($){
	var segs = {};
	var $player = $('#player');

	// FIXME: 从 localStorage 读/
	var selectedQ = 'mp4';
	var p;
	var $qualityList = $('#quality');

	function getKeyName (key) {
		return (keyName[key] || '<未知>') + ' [' + key + ']';
	}

	function segmentPlayer (data) {
		$player.addClass('video-js vjs-default-skin');
		segs = data._videoSegsDic;
		var _t = document.title = data.title + ' - By: ' + data.username + ' - 油库里 HTML5 播放器';

		p = videojs('player', {
			autoplay: true,
			plugins: {
				segment: {}
			}
		}).ready(function () {
			var $q = $('<div class="vjs-time-controls vjs-control"><div class="vjs-quality" aria-live="polite"> --</div></div>');
			var $key = $q.find('.vjs-quality');
			$key.text(getKeyName(selectedQ));

			var keys = Object.keys(segs);

			$qualityList.prop('size', keys.length);
			keys.forEach(function(key){
				$qualityList.append(new Option(getKeyName(key), key, key == selectedQ));
			});

			if (keys.length > 1) {
				$qualityList.insertAfter($key);
				
				$key.addClass('pointer').click(function () {
					$qualityList.toggle();
				});	
				$qualityList.click(function () {
					$qualityList.hide();
				}).change(function () {
					$key.text(getKeyName(this.value));
					$qualityList.hide();
					playQuality(this.value);
				});
			}

			$('#player .vjs-remaining-time').after($q);
		});

		playQuality(selectedQ);
	}

	function playQuality (q) {
		p.pause();
		p.segs(segs[q]);
	}

	$.getVideoData(segmentPlayer);
}));