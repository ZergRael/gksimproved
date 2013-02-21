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

if($.browser.mozilla) {
	var chrome = {
		extension: {
			getURL: function(str) {
				return self.options[str];
			}
		}
	};
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

	var hash = url.match("#.*$");
	if(hash) {
		parsedUrl.hash = (hash ? hash[0] : hash);
		url = url.replace(parsedUrl.hash, "");
	}

	if(url.indexOf("?") == -1 && url.indexOf("&") == -1 && url.indexOf("=") == -1) {
		return parsedUrl;
	}

	if(url.indexOf("?") == -1) {
		parsedUrl.cancelQ = true;
		if(url.indexOf("&") == -1) {
			parsedUrl.cancelAmp = true;
			lastPathBit = parsedUrl.path.match(/\/(\w*)$/);
			if(lastPathBit.length) {
				parsedUrl.path = parsedUrl.path.replace(lastPathBit[1], "");
				url = lastPathBit[1] + url;
			}
		}
	}
	url = url.replace("?", "");

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

	var craftUrl = parsedUrl.host + parsedUrl.path + (parsedUrl.cancelQ ? (parsedUrl.cancelAmp ? "" : "&") : '?');
	var i = 0;
	$.each(parsedUrl.params, function (k, v) {
		craftUrl += (i == 0 ? '' : '&') + k + (v != undefined ? "=" + v : '');
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
		success: function(data, status, jXHR) {
			var ajaxedUrl = parseUrl(this.url);
			var page_number = ajaxedUrl && ajaxedUrl.params && ajaxedUrl.params.page || 0;
			callback(data, Number(page_number));
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
		success: function(data, status, jqXHR) {
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

// { id, classes, title, data, relativeToId, top, left, buttons = [ /* close is by default */ { b_id, b_text, b_callback} ] }
var appendFrame = function(o) {
	// Build custom buttons
	var additionnalButtons = '';
	if(o.buttons) {
		 $.each(o.buttons, function(i, button) {
			additionnalButtons += '<input type="button" id="gksi_' + o.id + '_' + button.b_id + '" class="fine" value=" ' + button.b_text + ' "> ';
		})
	}

	// Build entire frame
	var gksi_frame = '<div id="gksi_' + o.id + '" class="gksi_frame' + (o.classes ? ' ' + o.classes : '') + '"><p class="separate">' + o.title + '</p>' +
		'<div id="gksi_' + o.id + '_data" class="gksi_frame_data">' + o.data +
		'<div id="gksi_' + o.id + '_buttons" class="gksi_frame_buttons">' + (additionnalButtons.length ? additionnalButtons : '' ) + '<input type="button" id="gksi_' + o.id + '_close" class="fine" value=" Fermer "></div>' +
		(o.underButtonsText ? '<div id="gksi_copyright">' + o.underButtonsText + '</div>': '') +
		'</div></div>';

	// Binding
	$("#navigation").append(gksi_frame);

	// Buttons managment and callbacks
	$("#gksi_" + o.id + "_close").click(function() {
		$("#gksi_" + o.id).remove();
		return false;
	});
	if(additionnalButtons.length) {
		$.each(o.buttons, function(i, button) {
			if(button.b_callback) {
				$("#gksi_" + o.id + "_" + button.b_id).click(function() {
					button.b_callback($("#gksi_" + o.id + "_data"), "#gksi_" + o.id);
					return false;
				});
			}
		});
	}

	// Position correction on resize
	if(o.relativeToId && !opt.get("global", "allow_frame_css")) {
		$(window).resize(function() {
			var toOffset = $("#" + o.relativeToId).offset();
			$("#gksi_" + o.id).offset({ top: toOffset.top + o.top, left: toOffset.left + o.left });
		});
		$(window).trigger("resize");
	}

	// Background-color correction
	var transparentCss = "rgba(0, 0, 0, 0)";
	if($(".gksi_frame_data").css("background-color") == transparentCss) {
		dbg("[frame_builder] Can't find background-color");
		var cssTries = [ "#navigation", "#centre", "#navig_bloc_user", "#header" ];
		$.each(cssTries, function(i, cssId) {
			if($(cssId).css("background-color") != transparentCss) {
				dbg("[frame_builder] Took " + cssId + " background-color");
				appendCSS('.gksi_frame_data { background-color: ' + $(cssId).css("background-color") + '; } ');
				return false;
			}
		});
	}
};

// Custom CSS insertion
var appendCSS = function(css) {
	$("#gksi_css").append(css);
};

// Default GKSi CSS
var insertCSS = function() {
	dbg("Inserting custom CSS");
	$("head").append("<style id='gksi_css'>" +
		"#backTopButton { display:none; text-decoration:none; position:fixed; bottom:10px; right:10px; overflow:hidden; width:39px; height:39px; border:none; text-indent:100%; background:url(" + chrome.extension.getURL("images/to_top_small.png") + ") no-repeat; } " +
		".gksi_frame { z-index: 10; position: absolute; } " +
		".gksi_frame_section { border-bottom: 1px solid; font-weight: bold; padding-top: 6px; } " +
		".gksi_frame_buttons { padding-top: 9px; text-align: center; } " +
		".gksi_frame_data { width: auto; padding: 12px; } " +
		//"#gksi_suggest { } " +
		//"#gksi_suggest_data { } " +
		//"#gksi_options { } " +
		//"#gksi_options_data { } " +
		"#gksi_copyright { text-align: right; font-size: 0.8em; margin-top: -11px; } " +
		".gksi_progress_area { margin-top: 4px; display: inline-block; width: 90px; border-radius: 2px; padding: 1px; border: 1px solid gray; font-size: 9px; } " +
		".gksi_progress_bar { background-color: orange; height: 11px; border-radius: 1px; margin-bottom: -11px; } " +
		".gksi_progress_numbers { position: relative; } " +
		".gksi_valid { background-color: lightgreen; } " +
		".halfOpacity { opacity: 0.4; } " +
		".resume_endless_scrolling { font-size: 1.4em; font-weight: bold; } " +
		".gksi_edit_title { display: block; width: 100%; margin-top: 12px; } " +
		".gksi_edit_textarea { display: block; width: 100%; min-height: 240px; min-width: 360px; margin-right: -4px!important; } " +
		".bold { font-weight: bold; } " +
		"</style>");
};

// Custom divs insertion & funcs
var ignoreScrolling = false, avoidEndlessScrolling = false;
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
		global: {
			form_validation: 	{ defaultVal: true, showInOptions: true, dispText: "Validation des formulaires avec ctrl+entrée" },
			bbcode_shortcuts: 	{ defaultVal: true, showInOptions: true, dispText: "Raccourcis BBCodes avec ctrl" },
			allow_frame_css: 	{ defaultVal: false, showInOptions: true, dispText: "Laisser le CSS positionner les fenêtres GKSi" }
		},
		endless_scrolling : {
			endless_scrolling: 	{ defaultVal: true, showInOptions: true, dispText: "Endless scrolling sur les pages compatibles" },
			adapt_url: 			{ defaultVal: true, showInOptions: true, dispText: "Adapter l'url en fonction de la page vue avec l'ES" },
			pause_scrolling: 	{ defaultVal: false, showInOptions: true, dispText: "Pauser l'ES lorsqu'arrivé en fond de page" }
		},
		torrent_list: {
			imdb_suggest: 		{ defaultVal: false, showInOptions: true, dispText: "Suggestions de recherche grâce à IMDB" },
			filtering_fl: 		{ defaultVal: false, showInOptions: false }
		},
		snatched: {
			filtering_deleted: 	{ defaultVal: true, showInOptions: false },
			filtering_seed:     {defaultVal: false, showInOption: false}
		},
		twits: {
			twit_auto_complete: { defaultVal: true, showInOptions: true, dispText: "Auto-complétion des twits" },
			twit_color: 		{ defaultVal: true, showInOptions: true, dispText: "Coloration et lien automatique sur les twits" }
		},
		pins: {
			filter_expensive: 	{ defaultVal: false, showInOptions: true, dispText: "Cacher les pin's trop chers" },
			filter_bought: 		{ defaultVal: false, showInOptions: true, dispText: "Cacher les pin's déjà achetés" }
		},
		forums: {
			hide_signatures: 	{ defaultVal: false, showInOptions: true, dispText: "Cacher les signatures par défaut" }
		},
		torrent: {
			quick_comment: 		{ defaultVal: true, showInOptions: true, dispText: "Afficher la boite de commentaire rapide sur les fiches torrent" },
			comment_mp_title: 	{ defaultVal: "[Torrent #%id_torrent%] Commentaires désactivés", showInOptions: false },
			comment_mp_text: 	{ defaultVal: "Salutations !\n\nIl semblerait qu'un des torrents que vous avez posté n'accepte pas les commentaires :\n[url=%url_torrent%]%titre_torrent%[/url]\n\nSerait-il possible d'y remédier ?\n[url=https://gks.gs/m/account/paranoia]Réglage de la paranoïa[/url]\n\nMerci :)", showInOptions: false }
		},
		badges: {
			progress: 			{ defaultVal: false, showInOptions: true, dispText: "Afficher la progression sous les badges" },
			show_img: 			{ defaultVal: false, showInOptions: true, dispText: "Afficher toutes les images des badges" }
		},
		logs: {
			auto_refresh: 		{ defaultVal: false, showInOptions: false }
		}
	},
	get: function(m, o) {
		return this.options[m][o].val;
	},
	set: function(m, o, v) {
		this.options[m][o].val = v;
		storage.set(m, this.options[m]);
	},
	setCallback: function(m, o, c) {
		this.options[m][o].callback = c;
	},
	setData: function(m, o, name, data) {
		this.options[m][o][name] = data;
	},
	load: function() {
		$.each(this.options, function(m, opts) {
			var values = storage.get(m);
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