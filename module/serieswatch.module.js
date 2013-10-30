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

		var bulkSave = false;
		var saveWatchedList = function() {
			if(bulkSave) {
				return;
			}
			dbg("[save]");
			gData.set("episodes", "global_conf", globalConf);
			gData.set("episodes", "shows_list", watchedList);
			gData.set("episodes", "shows_list_size", watchedListSize);
		};

		var newEpSelectors = modules.serieswatch.newEpSelectors;
		var writeConfig = function() {
			dbg("[store] Showing config options");
			$("#torrent_list tr:nth-child(2n)").each(function() {
				var showId = $.trim($(this).find("td:nth(0)").text());

				var configHeaders = '<input class="watcher_config_show" type="checkbox" ' + (watchedList[showId].on ? 'checked' : '') + ' value="' + showId + '" id="watcher_config_' + showId + '" /><label for="watcher_config_' + showId + '">Suivi</label>', configContent = "";
				$.each(newEpSelectors, function(type, selectors) {
					configHeaders += '<span class="' + type + '_conf" conf_type="' + type + '" show_id="' + showId + '">' + type + '</span>';
					configContent += '<div id="' + type + '_conf_' + showId + '" conf_type="' + type + '" show_id="' + showId + '" class="watcher_config_block">';
					var checkedArray = watchedList[showId][type];
					var confArray = [];
					$.each(selectors, function(i, inputName) {
						confArray.push('<input type="checkbox" ' + (!checkedArray || checkedArray.indexOf(inputName) != -1 ? 'checked' : '') + ' value="' + inputName + '" id="watcher_config_' + type + '_' + showId + '_' + i + '" /><label for="watcher_config_' + type + '_' + showId + '_' + i + '">' + inputName + '</label>');
					});
					configContent += confArray.join("") + '</div>'
				});
				$(this).find("td:nth(1) a:first").after('<div class="watcher_config">' + configHeaders + configContent + '</div>');
				$("span[show_id=" + showId + "]").toggle(watchedList[showId].on);
			});

			$("#torrent_list .watcher_config span").click(function() {
				var block = $("#" + $(this).attr("conf_type") + "_conf_" + $(this).attr("show_id"));
				if(block.is(":visible")) {
					$(".watcher_config_block").hide();
				}
				else {
					$(".watcher_config_block").hide();
					block.show();
				}
			});

			$("#torrent_list .watcher_config input").change(function() {
				if($(this).hasClass("watcher_config_show")) {
					var v = $(this).prop("checked")
					var showId = $(this).val();
					watchedList[showId].on = v;
					$("span[show_id=" + showId + "]").toggle(v);
				}
				else {
					var catChecked = [];
					var parentDiv = $(this).parent();
					var showId = parentDiv.attr("show_id");
					var confType = parentDiv.attr("conf_type");
					parentDiv.find("input").each(function() {
						if($(this).prop("checked")) {
							catChecked.push($(this).attr("value"));
						}
					});
					if(catChecked.length == 0) {
						$(this).prop("checked", true);
						return;
					}
					if(newEpSelectors[confType].length != catChecked.length) {
						watchedList[showId][confType] = catChecked;
					}
					else {
						delete watchedList[showId][confType]
					}
				}
				saveWatchedList();
			});

			var configHeaders = "", configContent = "";
			$.each(newEpSelectors, function(type, selectors) {
				configHeaders += '<span class="' + type + '_conf" conf_type="' + type + '">' + type + '</span>';
				configContent += '<div id="' + type + '_conf_global" conf_type="' + type + '" class="watcher_config_block watcher_config_global_block">';

				var checkedArray = globalConf[type];
				var confArray = [];
				$.each(selectors, function(i, inputName) {
					confArray.push('<input type="checkbox" ' + (!checkedArray || checkedArray.indexOf(inputName) != -1 ? 'checked' : '') + ' value="' + inputName + '" id="watcher_config_' + type + '_' + i + '" /><label for="watcher_config_' + type + '_' + i + '">' + inputName + '</label>');
				});
				configContent += confArray.join("") + '</div>'
			});
			$("#contenu .separate:first").append('<div class="watcher_config watcher_config_global">' + configHeaders + configContent + '</div>');

			$(".watcher_config_global span").click(function() {
				var block = $("#" + $(this).attr("conf_type") + "_conf_global");
				if(block.is(":visible")) {
					$(".watcher_config_global_block").hide();
				}
				else {
					$(".watcher_config_global_block").hide();
					block.show();
				}
			});

			$(".watcher_config_global input").change(function() {
				var catChecked = [];
				var parentDiv = $(this).parent();
				var confType = parentDiv.attr("conf_type");
				parentDiv.find("input").each(function() {
					if($(this).prop("checked")) {
						catChecked.push($(this).attr("value"));
					}
				});
				if(catChecked.length == 0) {
					$(this).prop("checked", true);
					return;
				}
				bulkSave = true;
				$("#torrent_list .watcher_config input[value=" + $(this).val() + "]").prop("checked", $(this).prop("checked")).trigger("change");
				globalConf[confType] = catChecked;
				bulkSave = false;
				saveWatchedList();
			});
		};

		dbg("[Init] Starting");
		// Execute functions

		var globalConf = gData.get("episodes", "global_conf");
		var watchedList = gData.get("episodes", "shows_list");
		var watchedListSize = gData.get("episodes", "shows_list_size");
		storeWatchedShows();
		writeConfig();
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