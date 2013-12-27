modules.peers = {
	name: "peers",
	pages: [
		{ path_name: "/m/peers/", options: { buttons: '#mypeers' } }
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

		var tagTorrents = function() {
			dbg("[TorrentTag] Scanning");
			$(".table100 tbody tr").each(function() {
				if($(this).find("td:nth(4)").first().text() == "0.00 Ko/s") {
					$(this).addClass("t_inactive");
				}
			});
			dbg("[TorrentTag] Ended scanning");
		};

		var maxPage = modules.endless_scrolling.maxPage, thisPage = modules.endless_scrolling.thisPage;
		var grabAllPages = function() {
			loadingPage = true;

			dbg("[AllPagesGrab] Loading all pages");
			var nextUrl = utils.clone(pageUrl);
			nextUrl.cancelQ = true;
			nextUrl.cancelAmp = true;
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
				utils.grabPage(nextUrl, function(data, pageNumber) {
					torrentsTR = $(data).find(".table100 tbody tr")
					if(torrentsTR && torrentsTR.length) {
						dbg("[AllPagesGrab] Got data (" + pageNumber + "/" + maxPage + ") - Inserting")
						$(".table100 tbody").append(torrentsTR);
					}
					else {
						dbg("[AllPagesGrab] No more data");
						$(".page_loading").text("Plus rien en vue cap'tain !");
					}
					pageLoaded++;
					if(pageLoaded == maxPage) {
						$(".page_loading").remove();
						dbg("[AllPagesGrab] Grabbing ended");
						tagTorrents();
						onEndlessDone();
						calcTotals();
						$(document).trigger("es_dom_process_done");
					}
				});
			}
			dbg("[AllPagesGrab] Stop endless scrolling");
			$("#grabAllPagesSpan").hide();
			stopEndlessScrolling = true;
			return false;
		};

		var totalCalcd = false;
		var calcTotals = function() {
			if(totalCalcd) {
				return;
			}

			dbg("[CalcTotals] Started");
			totalCalcd = true;

			var speedTotal = 0;
			$(".table100 tbody tr").each(function() {
				speedTotal += Number($(this).find("td:nth(4)").first().text().match(/[\d\.]+/)[0]);
			});

			dbg("[CalcTotals] Got speed " + speedTotal);
			$(".table100 tr:nth(0) th:nth(4)").text("↑ " + Math.round(speedTotal) + " Ko/s");
		};

		var onEndlessDone = function() {
			insertScript("table_sorting", function() {
				$("#mypeers").trigger("update");
			}, true);
		};

		var onFilterActiveChange = function() {
			opt.set(module_name, "filtering_active", $(this).prop("checked"));
			dbg("[ActiveFilter] is " + opt.get(module_name, "filtering_active"));
			if(opt.get(module_name, "filtering_active")) {
				filterActive();
				$(document).trigger("es_dom_process_done");
			}
			else {
				dbg("[DeleteFilter] Unfiltering deleted");
				unFilter();
				dbg("[DeleteFilter] Ended unfiltering");
				$(document).trigger("es_dom_process_done");
			}
		};

		var filterActive = function() {
			if(!opt.get(module_name, "filtering_active")) {
				return;
			}

			dbg("[FilterActive] Hiding inactive");
			$(".t_inactive").hide();
		};

		var unFilter = function() {
			$(".t_inactive").show();
			dbg("[Filter*] Showing");
		};

		var filterButtons = '<input id="filter_active" type="checkbox" ' + (opt.get(module_name, "filtering_active") ? 'checked="checked" ' : ' ') + '/><label for="filter_active">Cacher inactifs</label>';
		var grabAllButton = '<span id="grabAllPagesSpan"> | <a href="#" id="grabAllPages">Récupérer toutes les pages</a></span>';

		dbg("[Init] Starting");
		// Execute functions
		tagTorrents();

		$(mOptions.buttons).before(filterButtons + grabAllButton);
		$("#grabAllPages").click(grabAllPages);

		$("#filter_active").change(onFilterActiveChange);
		filterActive();

		$(document).on("endless_scrolling_insertion_done", function() {
			dbg("[endless_scrolling] Module specific functions");
			dbg("[endless_scrolling] Updating table sorting");
			tagTorrents();
			onEndlessDone();
			filterActive();
			if(modules.endless_scrolling.done) {
				calcTotals();
			}
			$("#grabAllPagesSpan").hide();
			$(document).trigger("es_dom_process_done");
		});

		dbg("[Init] Ready");
	}
};