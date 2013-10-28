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

		var storeWatchedShows = function() {
			dbg("[store] Looking for new shows");
			$("#torrent_list tr:nth-child(2n)").each(function() {
				var showId = $.trim($(this).find("td:nth(0)").text());
				if(!globalWatchedList[showId]) {
					globalWatchedList[showId] = { name: $.trim($(this).find("td:nth(1) a:first").text()) };
					watchedListSize++;
				}
			});
			saveWatchedList();
		};

		var removeOnUnfollow = function() {
			if($(this).attr("href").indexOf("&del") != -1) {
				var showId = $.trim($(this).parents("tr").find("td:nth(0)").text());
				if(globalWatchedList[showId]) {
					dbg("[removeShow] Removed " + showId);
					delete globalWatchedList[showId];
					watchedListSize--;
					saveWatchedList();
				}
			}
		};

		var saveWatchedList = function() {
			dbg("[save]");
			gData.set("episodes", "list", globalWatchedList);
			gData.set("episodes", "list_size", watchedListSize);
		}

		dbg("[Init] Starting");
		// Execute functions

		var globalWatchedList = gData.get("episodes", "list");
		var watchedListSize = gData.get("episodes", "list_size");
		storeWatchedShows();
		$("#torrent_list a").on("click", removeOnUnfollow);

		dbg("[Init] Ready");
	}
};