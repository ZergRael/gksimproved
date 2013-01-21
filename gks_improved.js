// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
var debug = true;
// General debug function
var _dbg = function (section, str) {
	if(debug) {
		var dd = new Date();
		var debugPrepend = "[" + dd.getHours() + ":" + dd.getMinutes() + ":" + dd.getSeconds() + ":" + dd.getMilliseconds() + "] [" + section + "] ";
		if(typeof str == "object") {
			console.log(debugPrepend);
			console.log(str);
		}
		else {
			console.log(debugPrepend + str);
		}
	}
};

var dbg = function(str) {
	_dbg("main", str);
}

dbg("[Init] Loading general funcs");

// Returns an array with splited url
var parseUrl = function (url) {
	var host = url.match("^https:\\/\\/gks.gs");
	if(!host) {
		return false;
	}
	var parsedUrl = {};
	parsedUrl.host = (host ? host[0] : host);
	url = url.replace(parsedUrl.host, "");

	var path = url.match(/[\-\w\.\/]*\/?/);
	parsedUrl.path = (path ? path[0] : path);
	url = url.replace(parsedUrl.path, "");

	if(url.indexOf("?") == -1 && url.indexOf("&") == -1) {
		return parsedUrl;
	}

	url = url.replace("?", "");

	var hash = url.match("#.*$");
	if(hash) {
		parsedUrl.hash = (hash ? hash[0] : hash);
		url = url.replace(parsedUrl.hash, "");
	}

	var urlSplit = url.split('&');
	if(!urlSplit.length) {
		return false;
	}

	parsedUrl.params = {};
	$.each(urlSplit, function (k, v) {
		if(v == "") {
			return;
		}
		var params = v.split('=');
		parsedUrl.params[params[0]] = params[1];
	});
	return parsedUrl;
};


// Returns a complete url by concat data from parseUrl
var craftUrl = function (parsedUrl) {
	if(!parsedUrl.params) {
		return parsedUrl.host + parsedUrl.path;
	}

	var craftUrl = parsedUrl.host + parsedUrl.path + (parsedUrl.cancelQ ? "&" : '?');
	var i = 0;
	$.each(parsedUrl.params, function (k, v) {
		craftUrl += (i == 0 ? '' : '&') + k + (v ? "=" + v : '');
		i++;
	});
	craftUrl += (parsedUrl.hash ? parsedUrl.hash : '');

	return craftUrl;
};

// Calls callback after ajax on url
var grabPage = function(urlObject, callback) {
	var urlToGrab = craftUrl(urlObject);
	dbg("[Ajax] " + urlToGrab);
	$.ajax({
		type: 'GET',
		url: urlToGrab,
		success: function(data) {
			callback(data);
		},
		error: function(jXHR, status, thrown) {
			dbg("[Ajax] " + status + " : " + thrown);
		}
	});
};

var post = function(urlObject, postData, callback) {
	var urlToGrab = craftUrl(urlObject);
	dbg("[AjaxPost] " + urlToGrab);
	$.ajax({
		type: 'POST',
		data: postData,
		url: urlToGrab,
		success: function(data) {
			callback(data);
		},
		error: function(jXHR, status, thrown) {
			dbg("[AjaxPost] " + status + " : " + thrown);
		}
	});
};

var appendNativeScript = function (jsFileName) {
	var script = document.createElement("script");
	script.type = "text/javascript";
	script.src = jsFileName;
	dbg("[NativeScript] Append " + jsFileName);
	document.body.appendChild(script);
};

// Custom CSS insertion
var insertCSS = function() {
	dbg("Inserting custom CSS");
	$("head").append("<style>" +
		"#backTopButton { display:none; text-decoration:none; position:fixed; bottom:10px; right:10px; overflow:hidden; width:51px; height:51px; border:none; text-indent:100%; background:url(" + chrome.extension.getURL("images/to_top.png") + ") no-repeat; } " +
		"</style>");
};

// Custom divs insertion & funcs
var ignoreScrolling = false;
var insertDivs = function() {
	$("#global").append('<a id="backTopButton" href="#"></a>');
	$("#backTopButton").click(function() {
		ignoreScrolling = true;
		$("html, body").animate({ scrollTop: 0 }, 800, "swing", function() {
			ignoreScrolling = false;
		});
		$(this).hide();
		return false;
	});
};

// Storage functions
var storage = {
	set: function(module, opts) {
		var tempStore = {};
		$.each(opts, function(o, v) {
			tempStore[o] = v.val;
		});
		localStorage.setItem(module, JSON.stringify(tempStore));
	},
	get: function(module) {
		return JSON.parse(localStorage.getItem(module));
	}
}

// Options
var opt = {
	options: {
		torrent_list: {
			endless_scrolling: { defaultVal: false },
			filtering_fl: { defaultVal: false }
		},
		snatched: {
			endless_scrolling: { defaultVal: false },
			filtering_deleted: { defaultVal: true }
		},
		twits: {
			twit_auto_complete: { defaultVal: true },
			twit_color: { defaultVal: true } 
		},
		pins: {
			filter_expensive: { defaultVal: false }
		},
		forums: {
			endless_scrolling: { defaultVal: false }
		},
		torrent: {
			quick_comment: { defaultVal: true }
		},
		request: {
			endless_scrolling: { defaultVal: false }
		}
	},
	get: function(m, o) {
		return this.options[m][o].val;
	},
	set: function(m, o, v) {
		this.options[m][o].val = v;
		storage.set(m, this.options[m]);
	},
	load: function() {
		$.each(this.options, function(m, opts) {
			values = storage.get(m);
			$.each(opts, function(o, v) {
				opt.options[m][o].val = (values && values[o] != undefined ? values[o] : v.defaultVal);
			});
		});
	}
};

dbg("[Init] Loading modules");
var url = parseUrl(window.location.href);
opt.load();
insertCSS();
insertDivs();
var modules = {};
// url debug
dbg(url);
dbg(craftUrl(url));
dbg("[Init] Ready");