modules.snatched = {
	name: "snatched",
	dText: "Snatched",
	pages: [
		{ path_name: "/m/peers/snatched", options: { buttons: '#contenu > a:first', loading: '.pager_align', lastPage: ".pager_align:first" } }
	],
	loaded: false,
	loadModule: function(mOptions) {
		this.loaded = true;
		var module_name = this.name;
		var dbg = function(str) {
			utils.dbg(module_name, str);
		}

		dbg("[Init] Loading module");

		var torrentList = [];
		var tagTorrents = function(torrentLines) {
			dbg("[TorrentTag] Scanning");
			$(torrentLines).each(function() {
				var node = $(this);
				var t = {node: node, status: {}, shown: true};
				node.find("td").each(function(i) {
					if(i == 0 && $(this).text() == "Torrent Supprimé") {
						t.status.deleted = true;
					}
					if(i == 1 && $(this).find('img').attr('src') == "https://s.gks.gs/static/themes/sifuture/img/validate.png") {
						t.status.seeding = true;
					}
					if(i == 5 && $(this).text() != "Non Complété") {
						t.status.completed = true;
					}
					if(i == 5 && $(this).find("img").length) {
						t.status.hnr = true;
					}
				});
				torrentList.push(t);
			});
			dbg("[TorrentTag] Ended scanning");
			return torrentLines;
		};
		modules.endless_scrolling.preInsertion = tagTorrents;

		var filtersChanged = function() {
			refreshFilterSet();
			applyFilters();
		};

		var basicFilters = {deleted: 2, seeding: 0, completed: 0, hnr: 0};
		var refreshFilterSet = function() {
			basicFilters = {deleted: opt.get(module_name, "filter_deleted"), seeding: opt.get(module_name, "filter_seed"), completed: opt.get(module_name, "filter_complete"), hnr:opt.get(module_name, "filter_hnr") };
		}

		var applyFilters = function() {
			var showTorrents = [];
			var hideTorrents = [];
			$.each(torrentList, function(i, t) {
				var shouldShow = true;

				// Basic filters
				var requiredOnlys = onlyReq;
				for(filter in basicFilters) {
					var filterStatus = basicFilters[filter];
					if(filterStatus == 1) {
						if(!t.status[filter]) {
							shouldShow = false;
						}
					}
					else if(filterStatus == 2) {
						if(t.status[filter]) {
							shouldShow = false;
						}
					}
				}

				if(shouldShow && !t.shown) {
					t.shown = true;
					showTorrents.push(t.node, t.nextNode);
				}
				if(!shouldShow && t.shown) {
					t.shown = false;
					hideTorrents.push(t.node, t.nextNode);
				}
			});

			if(showTorrents.length > 0) {
				dbg("[Filters] Showing some " + showTorrents.length);
				$.each(showTorrents, function() { $(this).show(); });
			}
			if(hideTorrents.length > 0) {
				dbg("[Filters] Hiding some " + hideTorrents.length);
				$.each(hideTorrents, function() { $(this).hide(); });
			}
		};

		var bytesToInt = function(str) {
			var splitted = str.split(" ");
			if(splitted.length != 2) {
				return str;
			}

			var oInt = Number(splitted[0]);
			if(splitted[1] == "Mo") {
				return oInt * 1024;
			}
			if(splitted[1] == "Go") {
				return oInt * 1048576;
			}
			if(splitted[1] == "To") {
				return oInt * 1073741824;
			}
			return oInt;
		}

		var dateToInt = function(str) {
			if(str == "Non Complété") {
				return 0;
			}
			var regStr = str.match(/(?:(\d+) années?)?(?:, )?(?:(\d+) mois)?(?:, )?(?:(\d+) semaines?)?(?:, )?(?:(\d+) jours?)?(?:, )?(?:(\d+) heures?)?(?:, )?(?:(\d+) minutes?)?(?:, )?(?:(\d+) secs?)?/);
			return ((regStr[1] ? Number(regStr[1]) : 0) * 31104000 + (regStr[2] ? Number(regStr[2]) : 0) * 2592000 + (regStr[3] ? Number(regStr[3]) : 0) * 604800 + (regStr[4] ? Number(regStr[4]) : 0) * 86400 + (regStr[5] ? Number(regStr[5]) : 0) * 3600 + (regStr[6] ? Number(regStr[6]) : 0) * 60 + (regStr[7] ? Number(regStr[7]) : 0))
		}

		var sort = false;
		var sortData = function() {
			if(!sort) {
				return;
			}

			var sortFunc = false;
			switch(sort) {
				case "sortName":
					sortFunc = function(a, b) {
						var aN = $(a).find("td:nth-child(1) a").text();
						var bN = $(b).find("td:nth-child(1) a").text();
						return order == "desc" ? (aN > bN ? -1 : 1) : (aN > bN ? 1 : -1);
					};
					break;
				case "sortUL":
					sortFunc = function(a, b) {
						var aN = $(a).find("td:nth-child(3)").text();
						var bN = $(b).find("td:nth-child(3)").text();
						return order == "desc" ? (bytesToInt(aN) > bytesToInt(bN) ? -1 : 1) : (bytesToInt(aN) > bytesToInt(bN) ? 1 : -1);
					};
					break;
				case "sortDL":
					sortFunc = function(a, b) {
						var aN = $(a).find("td:nth-child(4)").text();
						var bN = $(b).find("td:nth-child(4)").text();
						return order == "desc" ? (bytesToInt(aN) > bytesToInt(bN) ? -1 : 1) : (bytesToInt(aN) > bytesToInt(bN) ? 1 : -1);
					};
					break;
				case "sortRDL":
					sortFunc = function(a, b) {
						var aN = $(a).find("td:nth-child(5)").text();
						var bN = $(b).find("td:nth-child(5)").text();
						return order == "desc" ? (bytesToInt(aN) > bytesToInt(bN) ? -1 : 1) : (bytesToInt(aN) > bytesToInt(bN) ? 1 : -1);
					};
					break;
				case "sortST":
					sortFunc = function(a, b) {
						var aN = $(a).find("td:nth-child(6)").text();
						var bN = $(b).find("td:nth-child(6)").text();
						return order == "desc" ? (dateToInt(aN) > dateToInt(bN) ? -1 : 1) : (dateToInt(aN) > dateToInt(bN) ? 1 : -1);
					};
					break;
				case "sortRatio":
					sortFunc = function(a, b) {
						var aN = $(a).find("td:nth-child(7)").text();
						var bN = $(b).find("td:nth-child(7)").text();
						aN = (aN == "--" ? 0 : (aN == "∞" ? 999999999 : Number(aN)));
						bN = (bN == "--" ? 0 : (bN == "∞" ? 999999999 : Number(bN)));
						return order == "desc" ? (aN > bN ? -1 : 1) : (aN > bN ? 1 : -1);
					};
					break;
			}
			$(".table100 tbody").html($(".table100 tbody tr").sort(sortFunc));
		};

		var maxPage = modules["endless_scrolling"].maxPage, thisPage = modules["endless_scrolling"].thisPage;
		var canGrabAllPages = (!pageUrl.params || pageUrl.params.page == 0);
		var grabAllPages = function() {
			loadingPage = true;

			dbg("[AllPagesGrab] Loading all pages");
			var nextUrl = utils.clone(pageUrl);
			nextUrl.cancelQ = true;
			nextUrl.params = nextUrl.params ? nextUrl.params : {};

			if(thisPage == maxPage) {
				dbg("[AllPagesGrab] Not enough pages");
				return;
			}

			dbg("[AllPagesGrab] Grabbing started");
			$(mOptions.loading).before('<p class="pager_align page_loading"><img src="' + chrome.extension.getURL("images/loading.gif") + '" /><br />Hachage positronique de l\'ensemble des pages</p>');
			for(var i = 1; i <= maxPage; i++) {
				nextUrl.params.page = i;
				dbg("[AllPagesGrab] Grabbing page " + i);
				var pageLoaded = 0;
				utils.grabPage(nextUrl, function(data) {
					torrentsTR = $(data).find(".table100 tbody tr")
					if(torrentsTR && torrentsTR.length) {
						dbg("[AllPagesGrab] Got data - Inserting")
						$(".table100 tbody").append(tagTorrents(torrentsTR));
					}
					else {
						dbg("[AllPagesGrab] No more data");
						$(".page_loading").text("Plus rien en vue cap'tain !");
					}
					pageLoaded++;
					if(pageLoaded == maxPage) {
						$(".page_loading").remove();
						dbg("[AllPagesGrab] Grabbing ended");
						applyFilters();
						sortData();
						$(document).trigger("es_dom_process_done");
					}
				});
			}
			dbg("[AllPagesGrab] Stop endless scrolling");
			$("#grabAllPagesSpan").remove();
			stopEndlessScrolling = true;
			return false;
		};

		dbg("[Init] Starting");
		// Adding buttons
		var torrentButtons = ' | <span class="g_filter g_filter_' + opt.get(module_name, "filter_deleted") + '" opt="filter_deleted">Supprimés</span> | <span class="g_filter g_filter_' + opt.get(module_name, "filter_seed") + '" opt="filter_seed">En seed</span> | <span class="g_filter g_filter_' + opt.get(module_name, "filter_complete") + '" opt="filter_complete">Completés</span> | <span class="g_filter g_filter_' + opt.get(module_name, "filter_hnr") + '" opt="filter_hnr">Hit&Run</span>' + (canGrabAllPages ? '<span id="grabAllPagesSpan"> | <a href="#" id="grabAllPages">Récupérer toutes les pages</a></span>' : '');
		var colSortButtons = [ {n: 1, id: "sortName", nom: "Nom"}, {n: 3, id: "sortUL", nom: "UL"}, {n: 4, id: "sortDL", nom: "DL"}, {n: 5, id: "sortRDL", nom: "Real DL"}, {n: 6, id: "sortST", nom: "SeedTime"}, {n: 7, id: "sortRatio", nom: "Ratio"}
		];

		$(mOptions.buttons).after(torrentButtons);
		$.each(colSortButtons, function(k, v) {
			$(".table100 thead tr th:nth-child(" + v.n + ")").wrapInner('<a id="' + v.id + '" class="sortCol" href="#">');
		});

		// Sort on column click
		$(".sortCol").click(function() {
			if(sort == $(this).attr("id")) {
				order = (order == "desc" ? "asc" : "desc");
			}
			else {
				sort = $(this).attr("id");
				order = "asc";
			}
			sortData();
			return false;
		});

		// No reason to show grabber if not on first page
		if(canGrabAllPages) {
			$("#grabAllPages").click(grabAllPages);
		}

		$(".g_filter").click(function() {
			var button = $(this);
			var optName = button.attr("opt");
			var optStatus = opt.get(module_name, optName);
			button.removeClass("g_filter_" + optStatus);
			optStatus = ++optStatus > 2 ? 0 : optStatus;
			opt.set(module_name, optName, optStatus);
			dbg("[Filters] " + optName + " is " + opt.get(module_name, optName));
			button.addClass("g_filter_" + optStatus);
			filtersChanged();
			$(document).trigger("es_dom_process_done");
		});

		tagTorrents($(".table100 tbody tr"));
		filtersChanged();

		$(document).on("endless_scrolling_insertion_done", function() {
			dbg("[endless_scrolling] Module specific functions");
			applyFilters();
			sortData();
			canGrabAllPages = false;
			$("#grabAllPagesSpan").remove();
			$(document).trigger("es_dom_process_done");
		});

		dbg("[Init] Ready");
	}
};
