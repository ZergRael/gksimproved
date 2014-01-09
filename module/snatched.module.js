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
		};

		dbg("[Init] Loading module");

		var torrentList = [];
		var tagTorrents = function(torrentLines) {
			dbg("[TorrentTag] Scanning");
			$(torrentLines).each(function() {
				var node = $(this);
				var t = {node: node, status: {}, shown: true};
				node.find("td").each(function(i) {
					if(i === 0) {
						t.name = $(this).text();
						if(t.name == "Torrent Supprimé") {
							t.name = null;
							t.status.deleted = true;
						}
					}
					else if(i == 1 && $(this).find('img').attr('src') == "https://s.gks.gs/static/themes/sifuture/img/validate.png") {
						t.status.seeding = true;
					}
					else if(i == 2) {
						t.ul = Number($(this).attr("data-filesize"));
					}
					else if(i == 3) {
						t.dl = Number($(this).attr("data-filesize"));
					}
					else if(i == 4) {
						t.rdl = Number($(this).attr("data-filesize"));
					}
					else if(i == 5) {
						t.seedtime = dateToInt($(this).text());
						$(this).attr("data-duration", t.seedtime);
						if($(this).text() != "Non Complété") {
							t.status.completed = true;
						}
						if($(this).find("img").length) {
							t.status.hnr = true;
						}
					}
					else if(i == 6) {
						var text = $(this).text();
						t.ratio = (text == "--" ? 0 : (text == "∞" ? 999999999 : Number(text.replace(',', ''))));
						$(this).attr("data-ratio", t.ratio);
					}
				});
				node.data("t", t);
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
		};

		var applyFilters = function() {
			var showTorrents = [];
			var hideTorrents = [];
			$.each(torrentList, function(i, t) {
				var shouldShow = true;

				// Basic filters
				for(var filter in basicFilters) {
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

		var dateToInt = function(str) {
			if(str == "Non Complété") {
				return 0;
			}
			var regStr = str.match(/(?:(\d+) années?)?(?:, )?(?:(\d+) mois)?(?:, )?(?:(\d+) semaines?)?(?:, )?(?:(\d+) jours?)?(?:, )?(?:(\d+) heures?)?(?:, )?(?:(\d+) minutes?)?(?:, )?(?:(\d+) secs?)?/);
			return ((regStr[1] ? Number(regStr[1]) : 0) * 31104000 + (regStr[2] ? Number(regStr[2]) : 0) * 2592000 + (regStr[3] ? Number(regStr[3]) : 0) * 604800 + (regStr[4] ? Number(regStr[4]) : 0) * 86400 + (regStr[5] ? Number(regStr[5]) : 0) * 3600 + (regStr[6] ? Number(regStr[6]) : 0) * 60 + (regStr[7] ? Number(regStr[7]) : 0));
		};

		var addSorter = function() {
			insertScript("native_tablesorter", function() {
				$.tablesorter.addParser({
					id: 'duration',
					is: function(s) {
						return false;
					},
					format: function(s, table, cell, cellIndex) {
						var data, $cell = $(cell);
						return $cell.attr('data-duration') || s;
					},
					type: 'numeric'
				});
				$.tablesorter.addParser({
					id: 'ratio',
					is: function(s) {
						return false;
					},
					format: function(s, table, cell, cellIndex) {
						var data, $cell = $(cell);
						return $cell.attr('data-ratio') || s;
					},
					type: 'numeric'
				});

				$('.tablesorter').tablesorter({
					widgets: ['zebra'],
					widgetOptions : {
						zebra : [ 'normal-row', 'alt-row' ]
					},
					headers: {
						//0 // Name
						1: {sorter: false}, // Seeding
						2: {sorter: 'filesize'}, // UL
						3: {sorter: 'filesize'}, // DL
						4: {sorter: 'filesize'}, // RDL
						5: {sorter: 'duration'}, // Seedtime
						6: {sorter: 'ratio'},
						7: {sorter: false} // DL button
					}
				});
			});
		};

		var updateSorter = function() {
			insertScript("table_sorting", function() {
				$(".tablesorter").trigger("update");
			}, true);
		};

		var maxPage = modules["endless_scrolling"].maxPage, thisPage = modules["endless_scrolling"].thisPage;
		var canGrabAllPages = (!pageUrl.params || pageUrl.params.page === 0);
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
					torrentsTR = $(data).find(".table100 tbody tr");
					if(torrentsTR && torrentsTR.length) {
						dbg("[AllPagesGrab] Got data - Inserting");
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
						updateSorter();
						applyFilters();
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

		$(mOptions.buttons).after(torrentButtons);

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
		addSorter();
		filtersChanged();

		$(document).on("endless_scrolling_insertion_done", function() {
			dbg("[endless_scrolling] Module specific functions");
			updateSorter();
			applyFilters();
			canGrabAllPages = false;
			$("#grabAllPagesSpan").remove();
			$(document).trigger("es_dom_process_done");
		});

		dbg("[Init] Ready");
	}
};
