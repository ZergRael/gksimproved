var DEBUG = true;

// At this point, libs with most common functions are loaded
// Options are ready but not loaded

// Debug print function for the main, will be overwriten in modules
var dbg = function(str) {
	utils.dbg("main", str);
};

// Firefox hacks to simulate chrome APIs
var isChrome = true;
if(typeof chrome == "undefined") {
	isChrome = false;
	var chrome = {
		extension: {
			getURL: function(str) {
				return self.options[str];
			}
		}
	};
}

$(document).trigger("gksi_started");
dbg("[Init] Loading general funcs");
// Only DOM modifying functions are here

// Import a javascript file from the site if we need it elsewhere (jQ function doesn't seem to work as intended)
var appendNativeScript = function (jsFileName) {
	$("body").append($("<script>", { type: "text/javascript", src: jsFileName }));
	dbg("[NativeScript] Append " + jsFileName);
};

// Insert script into DOM - Escape sandboxing
var insertScript = function (id, f, removeAfterUse) {
	document.body.appendChild(
		$("<script>", { id: id, type: "text/javascript" }).text("(" + f.toString() + ")(jQuery)").get(0)
	);
	if(removeAfterUse) {
		$("#" + id).remove();
	}
};

// Builds our specific frames from a frame object :
// { id, classes, title, header, data, relativeToId, relativeToObj, relativeToWindow, top, left, css, buttons = [ /* close is by default */ { b_id, b_text, b_callback} ], onCloseCallback, underButtonsText }, removeOnOutsideClick
var appendFrame = function(o) {
	// Build custom buttons
	var additionnalButtons = '';
	if(o.buttons) {
		$.each(o.buttons, function(i, button) {
			additionnalButtons += '<input type="button" id="gksi_' + o.id + '_' + button.b_id + '" class="fine" value=" ' + button.b_text + ' "> ';
		});
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
		if(o.onCloseCallback) {
			o.onCloseCallback();
		}
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

	if(o.css) {
		$.each(o.css, function(key, value) {
			frame.css(key, value);
		});
		frame.css("overflow", "auto");
	}

	// Position correction on resize
	if(!opt.get("global", "allow_frame_css")) {
		if(o.relativeToId) {
			$(window).resize(function() {
				var toOffset = $("#" + o.relativeToId).offset();
				frame.offset({ top: toOffset.top + o.top, left: toOffset.left + o.left });
			});
			$(window).trigger("resize");
		}

		if(o.relativeToObj) {
			$(window).resize(function() {
				var toOffset = o.relativeToObj.offset();
				frame.offset({ top: toOffset.top + o.top, left: toOffset.left + o.left });
			});
			$(window).trigger("resize");
		}

		if(o.relativeToWindow) {
			$(window).resize(function() {
				var topOffset = (document.body.scrollTop || document.documentElement.scrollTop);
				var leftOffset = (document.body.scrollLeft || document.documentElement.scrollLeft);
				if(o.top === true) {
					o.top = $(window).height() / 2 - frame.height() / 2;
				}
				if(o.left === true) {
					o.left = $(window).width() / 2 - frame.width() / 2;
				}
				frame.offset({ top: topOffset + o.top + ($("#entete").css("position") == "fixed" ? $("#entete").height() : 0), left: leftOffset + o.left });
			});
			$(window).trigger("resize");
		}
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

	if(o.removeOnOutsideClick) {
		$(document).one("click", function() {
			frame.remove();
		});
		frame.on("click", function(e) {
			e.stopPropagation();
		});
	}
};

// Default GKSi CSS
var insertCSS = function() {
	dbg("Inserting custom CSS");
	$("head").append("<style id='gksi_css'>" +
		// Back to top button
		"#backTopButton { display:none; text-decoration:none; position:fixed; bottom:10px; right:10px; overflow:hidden; width:39px; height:39px; border:none; text-indent:100%; background:url(" + chrome.extension.getURL("images/" + opt.get("endless_scrolling", "button_style") + "/to_top_small.png") + ") no-repeat; } " +
		// Endless scrolling pauser button
		"#esPauseButton { display:none; text-decoration:none; position:fixed; bottom:10px; right:42px; overflow:hidden; width:26px; height:39px; border:none; text-indent:100%; } " +
		".esButtonPaused { background:url(" + chrome.extension.getURL("images/" + opt.get("endless_scrolling", "button_style") + "/endless_scrolling_paused.png") + ") no-repeat; } " +
		".esButtonActive { background:url(" + chrome.extension.getURL("images/" + opt.get("endless_scrolling", "button_style") + "/endless_scrolling_active.png") + ") no-repeat; } " +

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
		"#gksi_options_data { min-height: 96px; } " +
		".gksi_options_header_button { display: inline-block; background-color:#f5f5f5; border:1px solid #dedede; border-top:1px solid #eee; border-left:1px solid #eee; font-weight:bold; color:#565656; cursor:pointer; padding:5px 10px 6px 7px; } " +
		".gksi_options_header_button_selected { background-color:#6299c5; color:#fff; } " +
		".gksi_options_sub { font-size: 0.9em; padding-left: 12px; } " +
		".gksi_options_sub input { margin:2px; } " +
		".gksi_option_required { text-decoration: underline; } " +
		"#gksi_copyright { text-align: right; font-size: 0.8em; margin-top: -11px; } " +
		".gksi_edit_title { display: block; width: 100%; margin-top: 12px; } " +
		".gksi_edit_textarea { display: block; width: 100%; min-height: 240px; min-width: 360px; margin-right: -4px!important; } " +
		"#gksi_marker { max-width: 310px; } " +

		// Badges
		".gksi_progress_area { margin-top: 4px; display: inline-block; width: 90px; border-radius: 2px; padding: 1px; border: 1px solid gray; font-size: 9px; } " +
		".gksi_progress_bar { background-color: orange; height: 11px; border-radius: 1px; margin-bottom: -11px; } " +
		".gksi_progress_numbers { position: relative; } " +
		".gksi_valid { background-color: lightgreen; } " +

		// Torrent list columns
		".age_torrent_head { width: 40px; text-align: center; font-weight: bold; } " +
		".age_torrent_0 { width: 40px; text-align: center; } " +
		".age_torrent_1 { width: 40px; text-align: center; background-color: #f6f6f6; } " +
		".autoget_torrent_head { width: 26px; text-align: center; font-weight: bold; } " +
		".autoget_torrent_0 { width: 26px; text-align: center; } " +
		".autoget_torrent_1 { width: 26px; text-align: center; background-color: #f6f6f6; } " +
		".torrent_mark_found { background-color: lightgreen !important; } " +

		// Aura
		"#gksi_aura_controls thead th { width: 33%; } " +
		"#gksi_aura_controls tbody td { vertical-align: inherit; } " +
		".gksi_aura_result { font-weight: bold; } " +

		// Misc
		".halfOpacity { opacity: 0.4; } " +
		".resume_endless_scrolling { font-size: 1.4em; font-weight: bold; } " +
		".bold { font-weight: bold; } " +
		".search_button { display: inline-block; position: relative; top: 3px; left: 19px; width: 16px; height: 17px; margin-left: -16px; } " +
		".search_button_usable { cursor: pointer; } " +
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

dbg("[Init] Starting the engine");
// Parse our url string from the browser
var pageUrl = utils.parseUrl(window.location.href);
// Load all options
opt.load();
// Load global saved data
gData.load();
// Insert custom CSS and divs
insertCSS();
insertDivs();
// Each module will be inserted in the modules object for an easier inter-modules communication
var modules = {};
// Print some url debug to make sure the parser is not going nuts
dbg(pageUrl);
dbg(utils.craftUrl(pageUrl));
// Each .module.js from the manifest will now be read by the javascript engine
// then the loader will launch them if the url is matching
dbg("[Init] Ready");