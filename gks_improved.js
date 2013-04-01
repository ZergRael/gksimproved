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
var DEBUG = true;

// General debug function
var _dbg = function (section, str) {
	if(DEBUG) {
		var dd = new Date();
		var h = dd.getHours(), m = dd.getMinutes(), s = dd.getSeconds(), ms = dd.getMilliseconds();
		var debugPrepend = "[" + (h < 10 ? '0' + h : h) + ":" + (m < 10 ? '0' + m : m) + ":" + (s < 10 ? '0' + s : s) + ":" + (ms < 100 ? '0' + (ms < 10 ? '0' + ms : ms) : ms) + "] [" + section + "] ";
		if(typeof str == "object") {
			console.log(debugPrepend);
			console.log(str);
		}
		else {
			console.log(debugPrepend + str);
		}
	}
};

// Debug print function for the main, will be overwriten in modules
var dbg = function(str) {
	_dbg("main", str);
};

// Firefox hacks to simulate chrome APIs
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

// Returns an url object from url string - Usable by craftUrl
var parseUrl = function (url) {
	// No need to parse any external link
	var host = url.match("^https:\\/\\/gks.gs");
	if(!host) {
		return false;
	}
	var parsedUrl = {};
	parsedUrl.host = (host ? host[0] : host);
	url = url.replace(parsedUrl.host, "");

	// Parse the path from the url string (/m/account/)
	var path = url.match(/[\-\w\.\/]*\/?/);
	parsedUrl.path = (path ? path[0] : path);
	url = url.replace(parsedUrl.path, "");

	// The hashtag thingie (#post_121212)
	var hash = url.match("#.*$");
	if(hash) {
		parsedUrl.hash = (hash ? hash[0] : hash);
		url = url.replace(parsedUrl.hash, "");
	}

	// Since the urls have a strange build patern between pages, we continue to parse even if it is malformed
	if(url.indexOf("?") == -1 && url.indexOf("&") == -1 && url.indexOf("=") == -1) {
		return parsedUrl;
	}

	if(url.indexOf("?") == -1) {
		// Here, we know the url is malformed, we are going for some hacks
		// Inform the url builder that we won't need a '?' in url
		parsedUrl.cancelQ = true;
		if(url.indexOf("&") == -1) {
			// It's now the url hell, there is at least 1 param since we found a '=', even hackier !
			// Inform the url builder that we won't need a '&' in url
			parsedUrl.cancelAmp = true;
			// Extract the last word from path, we know it was in fact a param
			lastPathBit = parsedUrl.path.match(/\/(\w*)$/);
			if(lastPathBit.length) {
				// Remove it from path
				parsedUrl.path = parsedUrl.path.replace(lastPathBit[1], "");
				// Prepend it to the rest of url string in order to pass the params parser
				url = lastPathBit[1] + url;
			}
		}
	}
	url = url.replace("?", "");

	// Usual params split
	var urlSplit = url.split('&');
	if(!urlSplit.length) {
		return false;
	}

	// Extract params and values
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


// Returns an url string form an url object - Form parseUrl()
var craftUrl = function (parsedUrl) {
	if(!parsedUrl.params) {
		return parsedUrl.host + parsedUrl.path;
	}

	// As seen before, some hacks for malformed urls
	var craftUrl = parsedUrl.host + parsedUrl.path + (parsedUrl.cancelQ ? (parsedUrl.cancelAmp ? "" : "&") : '?');

	// Build the params
	var i = 0;
	$.each(parsedUrl.params, function (k, v) {
		// We don't always have values for each param, but append it anyway
		craftUrl += (i == 0 ? '' : '&') + k + (v != undefined ? "=" + v : '');
		i++;
	});

	// Append the hashtag thingie
	//craftUrl += (parsedUrl.hash ? parsedUrl.hash : '');

	return craftUrl;
};

// Ajax_GET an url object, then callback with data and page_number
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

// Ajax_POST an url object, then callback with data
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

var dateToDuration = function(dateStr) {
	var dateMatch = dateStr.match(/(\d+)\/(\d+)\/(\d+) à (\d+):(\d+)/);
	if(!dateMatch || !dateMatch.length) {
		return false;
	}

	var dur = {};
	dur.now = new Date();
	//new Date(year, month, day, hours, minutes, seconds, milliseconds)
	dur.was = new Date(dateMatch[3], dateMatch[2] - 1, dateMatch[1], dateMatch[4], dateMatch[5]);
	dur.ttDiff = dur.now - dur.was;

	dur.msTot = dur.ttDiff;
	dur.ms = dur.msTot % 1000;
	dur.secTot = dur.msTot / 1000;
	dur.sec = Math.floor(dur.secTot) % 60;
	dur.minTot = dur.secTot / 60;
	dur.min = Math.floor(dur.minTot) % 60;
	dur.hourTot = dur.minTot / 60;
	dur.hour = Math.floor(dur.hourTot) % 24;
	dur.dayTot = dur.hourTot / 24;
	dur.day = Math.floor(dur.dayTot) % 7;
	dur.weekTot = dur.dayTot / 7;
	dur.week = Math.floor(Math.floor(dur.weekTot) % 4.34812141);
	dur.monthTot = dur.weekTot / 4.34812141;
	dur.month = Math.floor(dur.monthTot) % 12;
	dur.yearTot = dur.monthTot / 12;
	dur.year = Math.floor(dur.yearTot);
	return dur;
};

var strToSize = function(sizeStr) {
	var sizeMatches = sizeStr.match(/([\d\.,]+) (\w)o/);
	if(!sizeMatches || !sizeMatches.length) {
		return false;
	}

	var value = Number(sizeMatches[1].replace(',', '')); // In Ko
	switch(sizeMatches[2]) {
		case 'P': value *= 1024;
		case 'T': value *= 1024;
		case 'G': value *= 1024;
		case 'M': value *= 1024;
	}

	var size = {};
	size.koTot = value;
	size.ko = Math.floor(size.koTot) % 1024;
	size.moTot = size.koTot / 1024;
	size.mo = Math.floor(size.moTot) % 1024;
	size.goTot = size.moTot / 1024;
	size.go = Math.floor(size.goTot) % 1024;
	size.toTot = size.goTot / 1024;
	size.to = Math.floor(size.toTot) % 1024;
	return size;
};

// Import a javascript file from the site if we need it elsewhere (jQ function doesn't seem to work as intended)
var appendNativeScript = function (jsFileName) {
	var script = document.createElement("script");
	script.type = "text/javascript";
	script.src = jsFileName;
	dbg("[NativeScript] Append " + jsFileName);
	document.body.appendChild(script);
};

// Insert script into DOM - Escape sandboxing
var insertScript = function (id, f, removeAfterUse) {
	var script = document.createElement("script");
	script.type = "text/javascript";
	script.id = id;
	script.textContent = "(" + f.toString() + ")(jQuery)";
	document.body.appendChild(script);
	if(removeAfterUse) {
		$("#" + id).remove();
	}
};

// Builds our specific frames from a frame object :
// { id, classes, title, header, data, relativeToId, relativeToObj, top, left, maxHeight, maxWidth, buttons = [ /* close is by default */ { b_id, b_text, b_callback} ], underButtonsText }
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
		'<div class="gksi_frame_content">' + (o.header ? '<div class="gksi_frame_header">' + o.header + '</div>' : '') + '<div id="gksi_' + o.id + '_data" class="gksi_frame_data">' + o.data + '</div>' +
		'<div id="gksi_' + o.id + '_buttons" class="gksi_frame_buttons">' + (additionnalButtons.length ? additionnalButtons : '' ) + '<input type="button" id="gksi_' + o.id + '_close" class="fine" value=" Fermer "></div>' +
		(o.underButtonsText ? '<div id="gksi_copyright">' + o.underButtonsText + '</div>': '') +
		'</div></div>';

	// Append
	$("#navigation").append(gksi_frame);

	var frame = $("#gksi_" + o.id);
	// Close button
	$("#gksi_" + o.id + "_close").click(function() {
		frame.remove();
		return false;
	});

	// Custom buttons management and callbacks
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

	if(o.maxWidth || o.maxHeight) {
		if(o.maxHeight) {
			frame.css("maxHeight", o.maxHeight);
		}
		if(o.maxWidth) {
			frame.css("maxWidth", o.maxWidth);
		}
		frame.css("overflow", "auto");
	}

	// Position correction on resize
	if(o.relativeToId && !opt.get("global", "allow_frame_css")) {
		$(window).resize(function() {
			var toOffset = $("#" + o.relativeToId).offset();
			frame.offset({ top: toOffset.top + o.top, left: toOffset.left + o.left });
		});
		$(window).trigger("resize");
	}

	if(o.relativeToObj && !opt.get("global", "allow_frame_css")) {
		$(window).resize(function() {
			var toOffset = o.relativeToObj.offset();
			frame.offset({ top: toOffset.top + o.top, left: toOffset.left + o.left });
		});
		$(window).trigger("resize");
	}

	// Background-color correction
	var transparentCss = "rgba(0, 0, 0, 0)", transparentCssFirefox = "transparent";
	if($(".gksi_frame_content").css("background-color") == transparentCss || $(".gksi_frame_data").css("background-color") == transparentCssFirefox) {
		dbg("[frame_builder] Can't find background-color");
		// Go up as much as needed to find some non-transparent color
		var cssTries = [ "#navigation", "#centre", "#navig_bloc_user", "#header" ];
		$.each(cssTries, function(i, cssId) {
			if($(cssId).css("background-color") != transparentCss && $(cssId).css("background-color") != transparentCssFirefox) {
				dbg("[frame_builder] Took " + cssId + " background-color");
				// Instead of creating style on frame, let's append to our custom CSS area
				appendCSS('.gksi_frame_content { background-color: ' + $(cssId).css("background-color") + '; } ');
				return false;
			}
		});
	}
};

// Default GKSi CSS
var insertCSS = function() {
	dbg("Inserting custom CSS");
	$("head").append("<style id='gksi_css'>" +
		// Back to top button
		"#backTopButton { display:none; text-decoration:none; position:fixed; bottom:10px; right:10px; overflow:hidden; width:39px; height:39px; border:none; text-indent:100%; background:url(" + chrome.extension.getURL("images/to_top_small.png") + ") no-repeat; } " +
		// Endless scrolling pauser button
		"#esPauseButton { display:none; text-decoration:none; position:fixed; bottom:10px; right:42px; overflow:hidden; width:26px; height:39px; border:none; text-indent:100%; } " +
		".esButtonPaused { background:url(" + chrome.extension.getURL("images/endless_scrolling_paused.png") + ") no-repeat; } " +
		".esButtonActive { background:url(" + chrome.extension.getURL("images/endless_scrolling_active.png") + ") no-repeat; } " +

		// Frames
		".gksi_frame { z-index: 10; position: absolute; } " +
		".gksi_frame_content { width: auto; padding: 12px; } " +
		".gksi_frame_header { padding-top: 6px; padding-bottom: 6px; } " +
		//".gksi_frame_data { } " +
		".gksi_frame_section_header { border-bottom: 1px solid; font-weight: bold; padding-top: 6px; } " +
		".gksi_frame_buttons { padding-top: 9px; text-align: center; } " +
		//"#gksi_suggest { } " +
		//"#gksi_suggest_data { } " +
		//"#gksi_options { } " +
		"#gksi_options_data { min-height: 90px; } " +
		".gksi_options_header_button { background-color:#f5f5f5; border:1px solid #dedede; border-top:1px solid #eee; border-left:1px solid #eee; font-weight:bold; color:#565656; cursor:pointer; padding:5px 10px 6px 7px; } " +
		".gksi_options_header_button_selected { background-color:#6299c5; color:#fff; } " +
		".gksi_options_sub { font-size: 0.9em; padding-left: 12px; } " +
		".gksi_options_sub input { margin:2px; } " +
		".gksi_option_required { text-decoration: underline; } " +
		"#gksi_copyright { text-align: right; font-size: 0.8em; margin-top: -11px; } " +
		".gksi_edit_title { display: block; width: 100%; margin-top: 12px; } " +
		".gksi_edit_textarea { display: block; width: 100%; min-height: 240px; min-width: 360px; margin-right: -4px!important; } " +

		// Badges
		".gksi_progress_area { margin-top: 4px; display: inline-block; width: 90px; border-radius: 2px; padding: 1px; border: 1px solid gray; font-size: 9px; } " +
		".gksi_progress_bar { background-color: orange; height: 11px; border-radius: 1px; margin-bottom: -11px; } " +
		".gksi_progress_numbers { position: relative; } " +
		".gksi_valid { background-color: lightgreen; } " +

		// Torrent list columns
		".age_torrent_head { width: 40px; text-align: center; font-weight: bold; } " +
		".age_torrent_0 { width: 40px; text-align: center; } " +
		".age_torrent_1 { width: 40px; text-align: center; background-color: #f6f6f6; } " +
		".torrent_mark_found { background-color: lightgreen !important; } " +

		// Aura
		"#gksi_aura_controls thead th { width: 33%; } " +
		"#gksi_aura_controls tbody td { vertical-align: inherit; } " +
		".gksi_aura_result { font-weight: bold; } " +

		// Misc
		".halfOpacity { opacity: 0.4; } " +
		".resume_endless_scrolling { font-size: 1.4em; font-weight: bold; } " +
		".bold { font-weight: bold; } " +
		"</style>");
};

// Custom CSS insertion, mostly used by the frame builder
var appendCSS = function(css) {
	$("#gksi_css").append(css);
};

// Custom divs insertion & funcs
var ignoreScrolling = false, pauseEndlessScrolling = false, stopEndlessScrolling = false;
var insertDivs = function() {
	// The back to top button - We build it on init and show it when needed
	$("#global").append('<a id="esPauseButton" class="esButtonActive" href="#"></a><a id="backTopButton" href="#"></a>');
	$("#backTopButton").click(function() {
		ignoreScrolling = true;
		$("html, body").animate({ scrollTop: 0 }, 800, "swing", function() {
			ignoreScrolling = false;
		});
		$(this).hide();
		$("#esPauseButton").hide();
		return false;
	});
	$("#esPauseButton").click(function() {
		if(pauseEndlessScrolling) {
			$("#esPauseButton").removeClass("esButtonPaused");
			$("#esPauseButton").addClass("esButtonActive");
			pauseEndlessScrolling = false;
		}
		else {
			$("#esPauseButton").removeClass("esButtonActive");
			$("#esPauseButton").addClass("esButtonPaused");
			pauseEndlessScrolling = true;
		}
		return false;
	});
};

// Storage functions
var storage = {
	// Inserts a complete module in localStorage
	set: function(module, opts) {
		// This tempStore is used to avoid storage of the whole module, we only need values, not dispText..
		var tempStore = {};
		$.each(opts, function(o, v) {
			tempStore[o] = v.val;
			if(v.sub_options) {
				$.each(v.sub_options, function(s_o, s_v) {
					tempStore[o + '_' + s_o] = s_v.val;
				});
			}
		});
		localStorage.setItem(module, JSON.stringify(tempStore));
	},
	// Returns a complete module, only used by opt.load()
	get: function(module) {
		return JSON.parse(localStorage.getItem(module));
	}
}

// Options
var opt = {
	options: {
		global: {
			form_validation:    { defaultVal: true, showInOptions: true, dispText: "Validation des formulaires avec ctrl+entrée" },
			bbcode_shortcuts:   { defaultVal: true, showInOptions: true, dispText: "Raccourcis BBCodes avec ctrl" },
			allow_frame_css:    { defaultVal: false, showInOptions: true, dispText: "Laisser le CSS positionner les fenêtres GKSi" }
		},
		endless_scrolling : {
			endless_scrolling:  { defaultVal: true, showInOptions: true, dispText: "Endless scrolling sur les pages compatibles", sub_options: {
				main:        { defaultVal: true, showInOptions: true, dispText: "Page d'accueil", tooltip: "https://gks.gs/" },
				browse:      { defaultVal: true, showInOptions: true, dispText: "Torrents : Parcourir", tooltip: "https://gks.gs/browse/" },
				sphinx:      { defaultVal: true, showInOptions: true, dispText: "Torrents : Recherche", tooltip: "https://gks.gs/sphinx/" },
				viewforum:   { defaultVal: true, showInOptions: true, dispText: "Forums : Liste des topics", tooltip: "https://gks.gs/forums.php?action=viewforum" },
				viewtopic:   { defaultVal: true, showInOptions: true, dispText: "Forums : Lecture de topic", tooltip: "https://gks.gs/forums.php?action=viewtopic" },
				snatched:    { defaultVal: true, showInOptions: true, dispText: "Snatched : Liste", tooltip: "https://gks.gs/m/peers/snatched" },
				logs:        { defaultVal: true, showInOptions: true, dispText: "Logs : Liste", tooltip: "https://gks.gs/logs/" },
				req:         { defaultVal: true, showInOptions: true, dispText: "Requests : Liste", tooltip: "https://gks.gs/req/" },
				images:      { defaultVal: true, showInOptions: true, dispText: "Images : Liste", tooltip: "https://gks.gs/m/images/" },
				uploads:     { defaultVal: true, showInOptions: true, dispText: "Uploads : Liste", tooltip: "https://gks.gs/m/uploads/" },
				dupecheck:   { defaultVal: true, showInOptions: true, dispText: "Dupecheck : Liste", tooltip: "https://gks.gs/dupecheck/" }
			} },
			adapt_url:          { defaultVal: true, showInOptions: true, dispText: "Adapter l'url en fonction de la page vue avec l'ES", parent: "endless_scrolling" },
			pagination_rewrite: { defaultVal: false, showInOptions: true, dispText: "Adapter la pagination en fonction de la page vue avec l'ES", parent: "adapt_url" },
			pause_scrolling:    { defaultVal: false, showInOptions: true, dispText: "Pauser l'ES lorsqu'arrivé en fond de page", parent: "endless_scrolling" }
		},
		torrent_list: {
			imdb_suggest:       { defaultVal: false, showInOptions: true, dispText: "Suggestions de recherche grâce à IMDB" },
			imdb_auto_add:      { defaultVal: false, showInOptions: true, dispText: "Ajouter le résultat de la meilleure correspondance IMDB", parent: "imdb_suggest" },
			filtering_fl:       { defaultVal: false, showInOptions: false },
			age_column:         { defaultVal: false, showInOptions: true, dispText: "Ajout d'une colonne d'age du torrent" },
			torrent_marker:     { defaultVal: false, showInOptions: false },
			direct_comments:    { defaultVal: false, showInOptions: true, dispText: "Afficher les commentaires au survol" }
		},
		snatched: {
			filtering_deleted:  { defaultVal: true, showInOptions: false },
			filtering_seed:     { defaultVal: false, showInOption: false },
			filtering_no_comp:  { defaultVal: false, showInOption: false },
			filtering_no_hnr:   { defaultVal: false, showInOption: false }
		},
		twits: {
			twit_auto_complete: { defaultVal: true, showInOptions: true, dispText: "Auto-complétion des twits" },
			twit_color:         { defaultVal: true, showInOptions: true, dispText: "Coloration et lien automatique sur les twits" }
		},
		pins: {
			filter_expensive:   { defaultVal: false, showInOptions: true, dispText: "Cacher les pin's trop chers" },
			filter_bought:      { defaultVal: false, showInOptions: true, dispText: "Cacher les pin's déjà achetés" },
			sort_price:         { defaultVal: false, showInOptions: true, dispText: "Trier les pins par prix" }
		},
		forums: {
			hidable_sigs:       { defaultVal: false, showInOptions: true, dispText: "Rendre les signatures masquables" },
			hide_signatures:    { defaultVal: false, showInOptions: true, dispText: "Cacher les signatures par défaut", parent: "hidable_sigs" }
		},
		torrent: {
			quick_comment:      { defaultVal: true, showInOptions: true, dispText: "Afficher la boite de commentaire rapide sur les fiches torrent" },
			comment_mp_title:   { defaultVal: "[Torrent #%id_torrent%] Commentaires désactivés", showInOptions: false },
			comment_mp_text:    { defaultVal: "Salutations !\n\nIl semblerait qu'un des torrents que vous avez posté n'accepte pas les commentaires :\n[url=%url_torrent%]%titre_torrent%[/url]\n\nSerait-il possible d'y remédier ?\n[url=https://gks.gs/m/account/paranoia]Réglage de la paranoïa[/url]\n\nMerci :)", showInOptions: false }
		},
		badges: {
			progress:           { defaultVal: false, showInOptions: true, dispText: "Afficher la progression sous les badges" },
			show_img:           { defaultVal: false, showInOptions: true, dispText: "Afficher toutes les images des badges" }
		},
		logs: {
			auto_refresh:       { defaultVal: false, showInOptions: false }
		}
	},
	// Returns value for module(m) & option(o)
	get: function(m, o) {
		return this.options[m][o].val;
	},
	// Returns value for module(m) & option(o) & sub option(s)
	sub_get: function(m, o, s) {
		return this.options[m][o].sub_options[s].val;
	},
	// Sets value(v) for module(m) & option(o)
	set: function(m, o, v) {
		this.options[m][o].val = v;
		storage.set(m, this.options[m]);
	},
	// Sets value(v) for module(m) & option(o) & sub option(s)
	sub_set: function(m, o, s, v) {
		this.options[m][o].sub_options[s].val = v;
		storage.set(m, this.options[m]);
	},
	// Sets on change callback(c) for module(m) & option(o)
	setCallback: function(m, o, c) {
		this.options[m][o].callback = c;
	},
	// Appends pure nammed(name) data to module(m) & option(o)
	setData: function(m, o, name, data) {
		this.options[m][o][name] = data;
	},
	// Populate all options values by extracting from localStorage or default value
	load: function() {
		$.each(this.options, function(m, opts) {
			var values = storage.get(m);
			$.each(opts, function(o, v) {
				opt.options[m][o].val = (values && values[o] != undefined ? values[o] : v.defaultVal);
				if(v.sub_options) {
					$.each(v.sub_options, function(s_o, s_v) {
						opt.options[m][o].sub_options[s_o].val = (values && values[o + '_' + s_o] != undefined ? values[o + '_' + s_o] : s_v.defaultVal);
					});
				}
			});
		});
	}
};

dbg("[Init] Loading modules");
// Parse our url string from the browser
var url = parseUrl(window.location.href);
// Load all options
opt.load();
// Insert custom CSS and divs
insertCSS();
insertDivs();
// Each module will be inserted in the modules object for an easier inter-modules communication
var modules = {};
// Print some url debug to make sure the parser is not going nuts
dbg(url);
dbg(craftUrl(url));
// Each .module.js from the manifest will now be read by the javascript engine
// then the loader will launch them if the url is matching
dbg("[Init] Ready");