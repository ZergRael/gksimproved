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
	pages: [
		{ path_name: "/m/peers/snatched", options: { buttons: '#contenu > a:first', loading: '.pager_align' } }
	],
	loaded: false,
	loadModule: function(mOptions) {
		this.loaded = true;
		var module_name = this.name;
		var dbg = function(str) {
			_dbg(module_name, str);
		}

		dbg("[Init] Loading module");

		var endlessScrolling = opt.get(module_name, "endless_scrolling");
		var scrollOffset = 160;
		var backTopButtonOffset = 100;
		var loadingPage = false;
		var nextPage = (url.params && url.params.page ? Number(url.params.page) + 1 : 1);
		var jOnScroll = function() {
			if(endlessScrolling && ! ignoreScrolling) {
				dbg("[EndlessScrolling] Scrolled");
				if((document.body.scrollTop + window.innerHeight > document.body.scrollHeight - scrollOffset) && !loadingPage) {
					dbg("[EndlessScrolling] Loading next page");
					loadingPage = true;

					var nextUrl = url;
					nextUrl.cancelQ = true;
					nextUrl.params = nextUrl.params ? nextUrl.params : {};
					nextUrl.params.page = nextPage;
					$(mOptions.loading).before('<p class="pager_align page_loading"><img src="' + chrome.extension.getURL("images/loading.gif") + '" /><br />Réticulation des méta-données de la page suivante</p>');
					grabPage(nextUrl, function(data) {
						torrentsTR = $(data).find(".table100 tbody tr")
						dbg("[EndlessScrolling] Grab ended")
						if(torrentsTR && torrentsTR.length) {
							dbg("[EndlessScrolling] Got data - Inserting")
							$(".table100 tbody").append(filterDeleted(torrentsTR));
							sortData();
							nextPage++;
							loadingPage = false;
							$(".page_loading").remove();
						}
						else {
							dbg("[EndlessScrolling] No more data");
							$(".page_loading").text("Plus rien en vue cap'tain !");
						}
					});
				}

				if(document.body.scrollTop > backTopButtonOffset) {
					$("#backTopButton").show();
				}
				else {
					$("#backTopButton").hide();
				}
			}
		};

		var filteringDeleted = opt.get(module_name, "filtering_deleted");
		var filterDeleted = function(data) {
			if(!filteringDeleted) {
				return data;
			}

			dbg("[DeleteFilter] Scanning for deleted");
			$(data).each(function() {
				if($(this).find("td").first().text() == "Torrent Supprimé") {
					$(this).hide();
				}
			});
			dbg("[DeleteFilter] Ended filtering");
			return data;
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

		var grabAllPages = function() {
			$("#endless_scrolling").attr("disabled", "disabled");
			loadingPage = true;

			dbg("[AllPagesGrab] Loading all pages");
			var nextUrl = url;
			nextUrl.cancelQ = true;
			nextUrl.params = nextUrl.params ? nextUrl.params : {};

			var maxPage = Number($(".pager_align").first().text().split("|").pop()) - 1;
			if(maxPage == 0) {
				dbg("[AllPagesGrab] Not enough pages");
				return;
			}

			dbg("[AllPagesGrab] Grabbing started");
			$(mOptions.loading).before('<p class="pager_align page_loading"><img src="' + chrome.extension.getURL("images/loading.gif") + '" /><br />Hachage positronique de l\'ensemble des pages</p>');
			for(var i = 1; i <= maxPage; i++) {
				nextUrl.params.page = i;
				dbg("[AllPagesGrab] Grabbing page " + i);
				var pageLoaded = 0;
				grabPage(nextUrl, function(data) {
					torrentsTR = $(data).find(".table100 tbody tr")
					if(torrentsTR && torrentsTR.length) {
						dbg("[AllPagesGrab] Got data - Inserting")
						$(".table100 tbody").append(filterDeleted(torrentsTR));
					}
					else {
						dbg("[AllPagesGrab] No more data");
						$(".page_loading").text("Plus rien en vue cap'tain !");
					}
					pageLoaded++;
					if(pageLoaded == maxPage) {
						$(".page_loading").remove();
						dbg("[AllPagesGrab] Grabbing ended");
						sortData();
					}
				});
			}
			
		};

		var torrentButtons = ' | <input id="filter_deleted" type="checkbox" ' + (filteringDeleted ? 'checked="checked" ' : ' ') + '/> Cacher les supprimés | <input id="endless_scrolling" type="checkbox" ' + (endlessScrolling ? 'checked="checked" ' : ' ') + '/> Endless scrolling | <a href="javascript:false" id="grabAllPages">Récupérer toutes les pages</a>';
		var colSortButtons = [ {n: 1, id: "sortName", nom: "Nom"}, {n: 3, id: "sortUL", nom: "UL"}, {n: 4, id: "sortDL", nom: "DL"}, {n: 5, id: "sortRDL", nom: "Real DL"}, {n: 6, id: "sortST", nom: "SeedTime"}, {n: 7, id: "sortRatio", nom: "Ratio"}
		];
		$.each(colSortButtons, function(k, v) {
			$(".table100 thead tr th:nth-child(" + v.n + ")").html('<a id="' + v.id + '" class="sortCol" href="javascript:false;">' + v.nom + '</a>');
		});

		dbg("[Init] Starting");
		// Adding buttons
		$(mOptions.buttons).after(torrentButtons);

		// Deleted torrents filtering
		$("#filter_deleted").change(function() {
			filteringDeleted = $(this).attr("checked") == "checked" ? true : false;
			dbg("[DeleteFilter] is " + filteringDeleted);
			opt.set(module_name, "filtering_deleted", filteringDeleted);
			if(filteringDeleted) {
				filterDeleted($(".table100 tbody tr"));
			}
			else {
				dbg("[DeleteFilter] Unfiltering FL");
				$(".table100 tbody tr").show();
				dbg("[DeleteFilter] Ended unfiltering");
			}
		});
		filterDeleted($(".table100 tbody tr"));
		
		// Endless scrolling
		$("#endless_scrolling").change(function() {
			endlessScrolling = $(this).attr("checked") == "checked" ? true : false;
			dbg("[EndlessScrolling] is " + endlessScrolling);
			opt.set(module_name, "endless_scrolling", endlessScrolling);
		});
		$(document).scroll(jOnScroll);

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
		});

		// No reason to show grabber if not on first page
		if(!url.params || (url.params && !url.params.page)) {
			$("#grabAllPages").click(grabAllPages);
		}

		dbg("[Init] Ready");
	}
};
