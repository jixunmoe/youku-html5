// 参见: http://player.youku.com/jsapi
// 部分代码未解析，仅提取核心部分。
var decodeYouku = (function () {
	var b = {mk: {}};
	b.mk.a3 = "b4et";
	b.mk.a4 = "boa4";
	var e = {
	    userCache: {
	        a1: "4",
	        a2: "1"
	    }
	};

	function pa(a) {
	    if (!a) return "";
	    var a = a.toString(),
	        c, b, f, k, e, h = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1];
	    k = a.length;
	    f = 0;
	    for (e = ""; f < k;) {
	        do {
	            c = h[a.charCodeAt(f++) & 255];
	        } while (f < k && -1 == c);

	        if (-1 == c) break;
	        do b = h[a.charCodeAt(f++) & 255];
	        while (f < k && -1 == b);
	        if (-1 == b) break;
	        e += String.fromCharCode(c << 2 | (b & 48) >> 4);
	        do {
	            c = a.charCodeAt(f++) & 255;
	            if (61 == c) return e;
	            c = h[c]
	        } while (f < k && -1 == c);
	        if (-1 == c) break;
	        e += String.fromCharCode((b & 15) << 4 | (c & 60) >> 2);
	        do {
	            b = a.charCodeAt(f++) & 255;
	            if (61 == b) return e;
	            b = h[b]
	        } while (f < k && -1 == b);
	        if (-1 == b) break;
	        e += String.fromCharCode((c & 3) << 6 | b)
	    }
	    return e
	}


	function F(a, c) {
	    for (var b = [], f = 0, k, e = "", h = 0; 256 > h; h++) b[h] = h;
	    for (h = 0; 256 > h; h++) f = (f + b[h] + a.charCodeAt(h % a.length)) % 256, k = b[h], b[h] = b[f], b[f] = k;
	    for (var p = f = h = 0; p < c.length; p++) h = (h + 1) % 256, f = (f + b[h]) % 256, k = b[h], b[h] = b[f], b[f] = k, e += String.fromCharCode(c.charCodeAt(p) ^ b[(b[h] + b[f]) % 256]);
	    return e
	}
	function G(a, c) {
	    for (var b = [], f = 0; f < a.length; f++) {
	        for (var e = 0, e = "a" <= a[f] && "z" >= a[f] ? a[f].charCodeAt(0) - 97 : a[f] - 0 + 26, g = 0; 36 > g; g++) if (c[g] == e) {
	            e = g;
	            break
	        }
	        b[f] = 25 < e ? e - 26 : String.fromCharCode(e + 97)
	    }
	    return b.join("")
	}


	var W = function (a) {
	    this._randomSeed = a;
	    this.cg_hun()
	};
	W.prototype = {
	    cg_hun: function () {
	        this._cgStr = "";
	        for (var a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ/\\:._-1234567890", c = a.length, b = 0; b < c; b++) {
	            var f = parseInt(this.ran() * a.length);
	            this._cgStr += a.charAt(f);
	            a = a.split(a.charAt(f)).join("")
	        }
	    },
	    cg_fun: function (a) {
	        for (var a = a.split("*"), c = "", b = 0; b < a.length - 1; b++) c += this._cgStr.charAt(a[b]);
	        return c
	    },
	    ran: function () {
	        this._randomSeed = (211 * this._randomSeed + 30031) % 65536;
	        return this._randomSeed / 65536
	    }
	};

	var YoukuDecoder = function (a, c) {
	        this._sid = e.userCache.sid;
	        this._seed = a.seed;
	        this._fileType = c;
	        var b = new W(this._seed);
	        this._streamFileIds = a.streamfileids;
	        this._videoSegsDic = {};
	        for (c in a.segs) {
	            for (var f = [], k = 0, g = 0; g < a.segs[c].length; g++) {
	                var h = a.segs[c][g],
	                    p = {};
	                p.no = h.no;
	                p.size = h.size;
	                p.seconds = h.seconds;
	                h.k && (p.key = h.k);
	                p.fileId = this.getFileId(a.streamfileids, c, parseInt(g), b);
	                p.type = c;
	                p.src = this.getVideoSrc(h.no, a, c, p.fileId);
	                f[k++] = p
	            }
	            this._videoSegsDic[c] = f
	        }
	    };

	YoukuDecoder.prototype = {
	    getFileId: function (a, c, b, f) {
	        for (var e in a) if (e == c) {
	            streamFid = a[e];
	            break
	        }
	        if ("" == streamFid) return "";
	        c = f.cg_fun(streamFid);
	        a = c.slice(0, 8);
	        b = b.toString(16);
	        1 == b.length && (b = "0" + b);
	        b = b.toUpperCase();
	        c = c.slice(10, c.length);
	        return a + b + c
	    },
	    getVideoSrc: function (a, c, d, f, k, g) {
	        if (!c.videoid || !d) return "";
	        var h = {
	            flv: 0,
	            flvhd: 0,
	            mp4: 1,
	            hd2: 2,
	            "3gphd": 1,
	            "3gp": 0
	        }[d],
	            p = {
	                flv: "flv",
	                mp4: "mp4",
	                hd2: "flv",
	                "3gphd": "mp4",
	                "3gp": "flv"
	            }[d],
	            i = a.toString(16);
	        1 == i.length && (i = "0" + i);
	        var l = c.segs[d][a].seconds,
	            a = c.segs[d][a].k;
	        if ("" == a || -1 == a) a = c.key2 + c.key1;
	        d = "";
	        c.show && (d = c.show.show_paid ? "&ypremium=1" : "&ymovie=1");
	        c = "/player/getFlvPath/sid/" + e.userCache.sid + "_" + i + "/st/" + p + "/fileid/" + f + "?K=" + a + "&hd=" + h + "&myp=0&ts=" + l + "&ypp=0" + d;
	        f = encodeURIComponent(E(F(G(b.mk.a4 + "poz" + e.userCache.a2, [19, 1, 4, 7, 30, 14, 28, 8, 24, 17, 6, 35, 34, 16, 9, 10, 13, 22, 32, 29, 31, 21, 18, 3, 2, 23, 25, 27, 11, 20, 5, 15, 12, 0, 33, 26]).toString(), e.userCache.sid + "_" + f + "_" + e.userCache.token)));
	        c = c + ("&ep=" + f) + "&ctype=12&ev=1" + ("&token=" + e.userCache.token);
	        c += "&oip=" + b.v.data[0].ip;
	        return "http://k.youku.com" + (c + ((k ? "/password/" + k : "") + (g ? g : "")))
	    }
	};

	var E = btoa;

	function decodeYouku (data) {
		b.v = data;
	    var data_0 = data.data[0];

	    if (!data_0.ep || !data_0.ip) {
	        throw new Error('缺失数据');
	    } else {
	        var c = F(G(b.mk.a3 + "o0b" + e.userCache.a1, [19, 1, 4, 7, 30, 14, 28, 8, 24, 17, 6, 35, 34, 16, 9, 10, 13, 22, 32, 29, 31, 21, 18, 3, 2, 23, 25, 27, 11, 20, 5, 15, 12, 0, 33, 26]).toString(), pa(data_0.ep));

	        if (2 > c.split("_").length) throw new Error('无效数据');
	        else {
	            e.userCache.sid = c.split("_")[0];
	            e.userCache.token = c.split("_")[1];

	            if (null != data_0.error_code)
	            	throw new Error('资源提出异议: ' + data_0.error_code + '(' + data_0.error + ')');

	            return new YoukuDecoder(data_0, this._type);
	        }
	    }
	}

	return decodeYouku;
})();