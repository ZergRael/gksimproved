modules.serieswatch = {
	name: "serieswatch",
	dText: "SeriesWatch",
	pages: [
		{ path_name: "/serieswatch/" }
	],
	loaded: false,
	loadModule: function(mOptions) {
		this.loaded = true;
		var module_name = this.name;
		var dbg = function(str) {
			utils.dbg(module_name, str);
		};

		dbg("[Init] Loading module");
		// Loading all functions used
		if(!opt.get("global", "check_episodes")) {
			dbg("[Init] Not needed. Abort");
			return;
		}

		var storeWatchedShows = function() {
			dbg("[store] Looking for new shows");
			$("#torrent_list tr:nth-child(2n)").each(function() {
				var showId = $.trim($(this).find("td:nth(0)").text());
				if(!watchedList[showId]) {
					watchedList[showId] = { name: $.trim($(this).find("td:nth(1) a:first").text()), on: true };
					watchedListSize++;
				}
			});
			saveWatchedList();
		};

		var removeOnUnfollow = function() {
			if($(this).attr("href").indexOf("&del") != -1) {
				var showId = $.trim($(this).parents("tr").find("td:nth(0)").text());
				if(watchedList[showId]) {
					dbg("[removeShow] Removed " + showId);
					delete watchedList[showId];
					watchedListSize--;
					saveWatchedList();
				}
			}
		};

		var pauseSave = false;
		var saveWatchedList = function() {
			if(pauseSave) {
				return;
			}
			dbg("[save]");
			gData.set("episodes", "global_conf", globalConf);
			gData.set("episodes", "shows_list", watchedList);
			gData.set("episodes", "shows_list_size", watchedListSize);
		};

		var newEpSelectors = modules[module_name].newEpSelectors;
		var displayConfig = function() {
			dbg("[store] Showing config options");
			$(".head_torrent td:nth(1)").after('<td class="watcher_config_head">EW</td>')
			$("#torrent_list tr:nth-child(2n)").each(function() {
				var showId = $.trim($(this).find("td:nth(0)").text());

				var configShow = [], configSelectors = [], configContent = [];
				configShow.push('<span class="watcher_config_show' + (watchedList[showId].on ? ' gksi_valid' : '') + '" show_id="' + showId + '">Suivi</span> ');
				configSelectors.push('<div class="watcher_config_selectorblock">');
				$.each(newEpSelectors, function(type, selectors) {
					configSelectors.push('<span class="watcher_config_selector" conf_type="' + type + '" show_id="' + showId + '">' + type + '</span>');
					configContent.push('<div id="' + type + '_conf_' + showId + '" conf_type="' + type + '" show_id="' + showId + '" class="watcher_config_block">');
					var checkedArray = watchedList[showId][type];
					var confArray = [];
					$.each(selectors, function(i, inputName) {
						confArray.push('<span class="watcher_config_cont' + (!checkedArray || checkedArray.indexOf(inputName) != -1 ? ' gksi_valid' : '') + '" input_name="' + inputName + '">' + inputName + '</span>');
					});
					configContent.push(confArray.join(" ") + '</div>');
				});
				configSelectors.push('</div>');
				$(this).find("td:nth(1)").after('<td class="watcher_config">' + [configShow.join(" "), configSelectors.join(" "), configContent.join("")].join("") + '</td>');
				$("span[show_id=" + showId + "]").toggle(watchedList[showId].on);
			});

			$("#torrent_list .watcher_config_show").click(function() {
				var node = $(this);
				var showId = node.attr("show_id");
				if(node.hasClass("gksi_valid")) {
					node.removeClass("gksi_valid");
					node.next(".watcher_config_selectorblock").hide();
					node.parent().find(".watcher_config_selector").removeClass("gksi_selected");
					node.nextAll(".watcher_config_block").hide();
					watchedList[showId].on = false;
				}
				else {
					node.addClass("gksi_valid");
					node.next(".watcher_config_selectorblock").show();
					watchedList[showId].on = true;
				}
				saveWatchedList();
			});

			$("#torrent_list .watcher_config_selector").click(function() {
				var node = $(this);
				var showId = node.attr("show_id");
				var confType = node.attr("conf_type");
				node.siblings(".watcher_config_selector").removeClass("gksi_selected");
				node.parent().nextAll(".watcher_config_block").hide();
				if(node.hasClass("gksi_selected")) {
					node.removeClass("gksi_selected");
				}
				else {
					node.addClass("gksi_selected");
					$("#" + confType + "_conf_" + showId).show();
				}
			});

			$("#torrent_list .watcher_config_cont").click(function() {
				var node = $(this);
				var showId = node.parent().attr("show_id");
				var confType = node.parent().attr("conf_type");

				var catChecked = [];
				if(node.hasClass("gksi_valid")) {
					node.removeClass("gksi_valid");
				}
				else {
					node.addClass("gksi_valid");
				}

				node.parent().find(".watcher_config_cont").each(function() {
					if($(this).hasClass("gksi_valid")) {
						catChecked.push($(this).attr("input_name"));
					}
				});

				if(catChecked.length == 0) {
					node.addClass("gksi_valid");
					return;
				}

				if(newEpSelectors[confType].length != catChecked.length) {
					watchedList[showId][confType] = catChecked;
				}
				else {
					delete watchedList[showId][confType];
				}
				saveWatchedList();
			});

			var header = $(".watcher_config_head"), timeoutRef;
			$(".watcher_config").hover(function() {
				clearTimeout(timeoutRef);
				header.text("Episode watcher");
				header.css({ width: 375 });
			}, function() {
				timeoutRef = setTimeout(function() {
					$(".watcher_config_selector").removeClass("gksi_selected");
					$(".watcher_config_block").hide();
					header.text("EW");
					header.css({ width: 38 });
				}, 400);
			});
		};

		var displayGlobalConfig = function() {
			var configHeaders = [], configContent = [];
			$.each(newEpSelectors, function(type, selectors) {
				configHeaders.push('<span class="watcher_config_selector_global" conf_type="' + type + '">' + type + '</span>');
				configContent.push('<div id="' + type + '_conf_global" conf_type="' + type + '" class="watcher_config_global_block">');

				var checkedArray = globalConf[type];
				var confArray = [];
				$.each(selectors, function(i, inputName) {
					confArray.push('<span class="watcher_config_cont_global' + (!checkedArray || checkedArray.indexOf(inputName) != -1 ? ' gksi_valid' : '') + '" input_name="' + inputName + '">' + inputName + '</span>');
				});
				configContent.push(confArray.join(" ") + '</div>');
			});
			$("#contenu .separate:first").append('<div class="watcher_config watcher_config_global">' + configHeaders.join(" ") + configContent.join("") + '</div>');

			$(".watcher_config_selector_global").click(function() {
				var node = $(this);
				var confType = node.attr("conf_type");
				node.siblings(".watcher_config_selector_global").removeClass("gksi_selected");
				node.nextAll(".watcher_config_global_block").hide();
				if(node.hasClass("gksi_selected")) {
					node.removeClass("gksi_selected");
				}
				else {
					node.addClass("gksi_selected");
					$("#" + confType + "_conf_global").show();
				}
			});

			$(".watcher_config_cont_global").click(function() {
				var node = $(this);
				var confType = node.parent().attr("conf_type");
				var node = $(this);
				var confType = node.parent().attr("conf_type");
				var turnGreen = !node.hasClass("gksi_valid");

				var catChecked = [];
				if(turnGreen) {
					node.addClass("gksi_valid");
				}
				else {
					node.removeClass("gksi_valid");
				}

				node.parent().find(".watcher_config_cont_global").each(function() {
					if($(this).hasClass("gksi_valid")) {
						catChecked.push($(this).attr("input_name"));
					}
				});

				if(catChecked.length == 0) {
					node.addClass("gksi_valid");
					return;
				}

				pauseSave = true;
				$("#torrent_list .watcher_config_cont[input_name=" + node.attr("input_name") + "]" + (turnGreen ? "" : ".gksi_valid")).click();
				pauseSave = false;
				globalConf[confType] = catChecked;
				saveWatchedList();
			});
		};

		dbg("[Init] Starting");
		// Execute functions

		var globalConf = gData.get("episodes", "global_conf");
		var watchedList = gData.get("episodes", "shows_list");
		var watchedListSize = gData.get("episodes", "shows_list_size");
		storeWatchedShows();
		displayConfig();
		displayGlobalConfig();
		$("#torrent_list a").on("click", removeOnUnfollow);

		dbg("[Init] Ready");
	},
	newEpSelectors: {
		"Format": ["TVPACK", "Episode"],
		"Sous-Titres": ["FASTSUB", "PRO"],
		"Langue": ["VO", "VOSTFR", "FRENCH", "MULTi"],
		"Source": ["HDTV", "PDTV", "DVDRiP", "BRRiP", "BDRiP", "BluRay", "WEB-DL", "WEBRiP"],
		"Reso": ["SD", "720p", "1080p"],
		"Codec": ["XviD", "x264", "H264"]
	}
};