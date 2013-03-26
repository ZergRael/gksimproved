// This file is part of GKSimproved.

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
			_dbg(module_name, str);
		}

		dbg("[Init] Loading module");

		var tagTorrents = function() {
			dbg("[TorrentTag] Scanning");
			$(".table100 tbody tr").each(function() {
				var t = $(this);
				$(this).find("td").each(function(i) {
					if(i == 0 && $(this).text() == "Torrent Supprimé") {
						t.addClass("t_deleted");
					}
					if(i == 1 && $(this).find('img').attr('src') == "https://s.gks.gs/static/themes/sifuture/img/validate.png") {
						t.addClass("t_seeding");
					}
					if(i == 5 && $(this).text() == "Non Complété") {
						t.addClass("t_not_completed");
					}
				})
			});
			dbg("[TorrentTag] Ended scanning");
		};

		var filterDeleted = function() {
			if(!opt.get(module_name, "filtering_deleted")) {
				return;
			}

			dbg("[DeleteFilter] Scanning for deleted");
			$(".t_deleted").hide();
			dbg("[DeleteFilter] Ended filtering");
		};

		var filterInSeed = function() {
			if(!opt.get(module_name, "filtering_seed")) {
				return;
			}

			dbg("[SeedFilter] Scanning for seeding");
			$(".t_seeding").hide();
			dbg("[SeedFilter] Ended filtering");
		};

		var filterNonCompleted = function() {
			if(!opt.get(module_name, "filtering_no_comp")) {
				return;
			}

			dbg("[NCFilter] Scanning for non completed");
			$(".t_not_completed").hide();
			dbg("[NCFilter] Ended filtering");
		};

		var unFilter = function() {
			$(".table100 tbody tr").each(function() {
				var t = $(this);
				if(!((t.hasClass("t_deleted") && opt.get(module_name, "filtering_deleted")) || (t.hasClass("t_seeding") && opt.get(module_name, "filtering_seed")) || (t.hasClass("t_not_completed") && opt.get(module_name, "filtering_no_comp")))) {
					t.show();
				}
			});
		};

		var maxPage = false;
		var getMaxPage = function() {
			if(!mOptions.lastPage) {
				return;
			}

			var pagesList = $(mOptions.lastPage);
			if(!pagesList.length || !pagesList.text().match(/\S/)) {
				maxPage = true;
			}
			else {
				var lastPageRegex = mOptions.lastPageRegex ? mOptions.lastPageRegex : /(\d+) ?$/;
				var lastPageMatch = pagesList.text().match(lastPageRegex);
				if(!lastPageMatch) {
					maxPage = true
				}
				else {
					maxPage = Number(lastPageMatch[1]) + (mOptions.pageModifier ? mOptions.pageModifier : 0);
				}
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

		var canGrabAllPages = (!url.params || url.params.page == 0);
		var grabAllPages = function() {
			loadingPage = true;

			dbg("[AllPagesGrab] Loading all pages");
			var nextUrl = url;
			nextUrl.cancelQ = true;
			nextUrl.params = nextUrl.params ? nextUrl.params : {};

			if(maxPage === true) {
				dbg("[AllPagesGrab] Not enough pages");
				return;
			}

			dbg("[AllPagesGrab] Grabbing started");
			$(mOptions.loading).before('<p class="pager_align page_loading"><img src="' + chrome.extension.getURL("images/loading.gif") + '" /><br />Hachage positronique de l\'ensemble des pages</p>');
			for(var i = 1; i < maxPage; i++) {
				nextUrl.params.page = i;
				dbg("[AllPagesGrab] Grabbing page " + i);
				var pageLoaded = 1;
				grabPage(nextUrl, function(data) {
					torrentsTR = $(data).find(".table100 tbody tr")
					if(torrentsTR && torrentsTR.length) {
						dbg("[AllPagesGrab] Got data - Inserting")
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
						filterDeleted();
						filterInSeed();
						filterNonCompleted();
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

		var torrentButtons = ' | <input id="filter_deleted" type="checkbox" ' + (opt.get(module_name, "filtering_deleted") ? 'checked="checked" ' : ' ') + '/><label for="filter_deleted">Cacher les supprimés</label> ' + ' | <input id="filter_seed" type="checkbox" ' + (opt.get(module_name, "filtering_seed") ? 'checked="checked" ' : ' ') + '/><label for="filter_seed">Cacher les torrents en seed</label> ' + ' | <input id="filter_no_comp" type="checkbox" ' + (opt.get(module_name, "filtering_no_comp") ? 'checked="checked" ' : ' ') + '/><label for="filter_no_comp">Cacher les non completés</label> ' + (canGrabAllPages ? '<span id="grabAllPagesSpan"> | <a href="#" id="grabAllPages">Récupérer toutes les pages</a></span>' : '');
		var colSortButtons = [ {n: 1, id: "sortName", nom: "Nom"}, {n: 3, id: "sortUL", nom: "UL"}, {n: 4, id: "sortDL", nom: "DL"}, {n: 5, id: "sortRDL", nom: "Real DL"}, {n: 6, id: "sortST", nom: "SeedTime"}, {n: 7, id: "sortRatio", nom: "Ratio"}
		];
		$.each(colSortButtons, function(k, v) {
			$(".table100 thead tr th:nth-child(" + v.n + ")").html('<a id="' + v.id + '" class="sortCol" href="#">' + v.nom + '</a>');
		});

		dbg("[Init] Starting");
		// Adding buttons
		$(mOptions.buttons).after(torrentButtons);

		getMaxPage();
		tagTorrents();

		// Deleted torrents filtering
		$("#filter_deleted").change(function() {
			opt.set(module_name, "filtering_deleted", $(this).attr("checked") == "checked" ? true : false);
			dbg("[DeleteFilter] is " + opt.get(module_name, "filtering_deleted"));
			if(opt.get(module_name, "filtering_deleted")) {
				filterDeleted();
				$(document).trigger("es_dom_process_done");
			}
			else {
				dbg("[DeleteFilter] Unfiltering deleted");
				unFilter();
				dbg("[DeleteFilter] Ended unfiltering");
				$(document).trigger("es_dom_process_done");
			}
		});
		filterDeleted();

		$("#filter_seed").change(function() {
			opt.set(module_name, "filtering_seed", $(this).attr("checked") == "checked" ? true : false);
			dbg("[SeedFilter] is " + opt.get(module_name, "filtering_seed"));
			if(opt.get(module_name, "filtering_seed")) {
				filterInSeed();
				$(document).trigger("es_dom_process_done");
			}
			else {
				dbg("[SeedFilter] Unfiltering Seeding");
				unFilter();
				dbg("[SeedFilter] Ended unfiltering");
				$(document).trigger("es_dom_process_done");
			}
		});
		filterInSeed();

		$("#filter_no_comp").change(function() {
			opt.set(module_name, "filtering_no_comp", $(this).attr("checked") == "checked" ? true : false);
			dbg("[NCFilter] is " + opt.get(module_name, "filtering_no_comp"));
			if(opt.get(module_name, "filtering_no_comp")) {
				filterNonCompleted();
				$(document).trigger("es_dom_process_done");
			}
			else {
				dbg("[NCFilter] Unfiltering non completed");
				unFilter();
				dbg("[NCFilter] Ended unfiltering");
				$(document).trigger("es_dom_process_done");
			}
		});
		filterNonCompleted();

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

		$(document).on("endless_scrolling_insertion_done", function() {
			dbg("[endless_scrolling] Module specific functions");
			tagTorrents();
			filterDeleted();
			filterInSeed();
			filterNonCompleted();
			sortData();
			canGrabAllPages = false;
			$("#grabAllPagesSpan").remove();
			$(document).trigger("es_dom_process_done");
		});

		dbg("[Init] Ready");
	}
};
