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
modules.torrent_list = {
	name: "torrent_list",
	dText: "Liste torrents",
	pages: [
		{ path_name: "/", options: { buttons: '#sort', canMark: true, canFilter: true, canSort: true } },
		{ path_name: "/browse/", options: { buttons: '#sort p', canMark: true, canFilter: true, canSort: true } },
		{ path_name: "/sphinx/", options: { buttons: 'form[name="getpack"] div', canSuggest: true, canFilter: true, canSort: true } },
		{ path_name: "/summary/", options: { } },
		{ path_name: "/m/uploads/", options: { } }
	],
	loaded: false,
	loadModule: function(mOptions) {
		this.loaded = true;
		var module_name = this.name;
		var dbg = function(str) {
			utils.dbg(module_name, str);
		}

		dbg("[Init] Loading module");

		var even = false; // :nth-child(2n) doesn't work on odd ES'd pages
		var tagTorrents = function() {
			dbg("[tagTorrents] Scanning torrents");
			$("tbody tr.head_torrent:not(.page_tagged)").nextAll(":nth-child(2n" + (even ? "+1" : "") + ")").each(function() {
				var classIs = "";
				var imgs = $(this).find("img");
				$.each(imgs, function() {
					switch($(this).attr("alt")) {
						case "New !":
							classIs += "t_new ";
							break;
						case "Nuke !":
							classIs += "t_nuke ";
							break;
						case "FreeLeech":
							classIs += "t_freeleech ";
							break;
						case "Scene":
							classIs += "t_scene";
					}
				});

				if(classIs != "") {
					$(this).addClass(classIs);
					$(this).next().addClass(classIs);
				}
			});
			$("tbody tr.head_torrent").addClass("page_tagged");
			even = !even;
			dbg("[tagTorrents] Ended scanning");
		};

		var unfilterFL = function() {
			if(opt.get(module_name, "filtering_scene")) {
				$("tbody tr.t_scene:not(.t_freeleech)").show();
			}
			else {
				$("tbody tr").show();
			}
		}

		var unfilterScene = function() {
			if(opt.get(module_name, "filtering_fl")) {
				$("tbody tr.t_freeleech:not(.t_scene)").show();
			}
			else {
				$("tbody tr").show();
			}
		}

		var applyFilters = function() {
			if(opt.get(module_name, "filtering_fl") || opt.get(module_name, "filtering_scene")) {
				$("tbody tr:not(:first):not(.gksi_imdb_head):not(" + (opt.get(module_name, "filtering_fl") ? ".t_freeleech" : "") + (opt.get(module_name, "filtering_scene") ? ".t_scene" : "") + ")").hide();
			}
		}

		var addAgeColumn = function() {
			if(!opt.get(module_name, "age_column")) {
				return;
			}

			dbg("[AgeCol] Started dating torrents");
			var alreadyDated = false;
			$("tbody tr").each(function() { // Process all data & skip already dated, is strangely faster than processing data before insertion
				if($(this).hasClass("head_torrent")) {
					if($(this).find("td:nth(2)").hasClass("age_torrent_head")) { // If this td head is already dated, assume the same for the whole page
						dbg("[AgeCol] Already dated page");
						alreadyDated = true;
						return;
					}
					dbg("[AgeCol] Date calculation");
					$(this).find("td:nth(1)").after('<td class="age_torrent_head">Age</td>');
					alreadyDated = false;
				}
				else {
					if(alreadyDated) { // Wait until we get to the new page
						return;
					}

					var tds = $(this).find("td");
					if(tds.first().hasClass("alt1")) { // Don't mind the hidden td
						return;
					}
					var ageTdNumber = 0;
					if(tds.eq(1).hasClass("name_torrent_1")) { // Keep background-color alternance
						ageTdNumber = 1;
					}

					var dateMatch = $(this).next().text().match(/(\d+)\/(\d+)\/(\d+) à (\d+):(\d+)/);
					if(!dateMatch || !dateMatch.length) { // This should never happen
						return;
					}

					// Calculation is done by taking the first not-now date section, in order Y/M/D/h/m
					// At first match, just take the difference between now and torrent date
					// If there's only one unit difference && the date section underneath is still viable, fallback to this smaller date section
					// eg: Date[torrent] = 1/1/2013 23:59, Date[now] = 2/1/2013 1:01 => day_difference() == 1 => fallback to hours => (24 + 1 - 23) => 2h
					// In fact, it's 1h02m but it's closer than 1day
					// In the same thinking process, it can return 24h since it's still viable and more precise than 1day -- Won't return > 24h
					var now = new Date();
					var age = "";
					if(now.getFullYear() > dateMatch[3]) {
						age = (now.getFullYear() - dateMatch[3]) == 1 && (now.getMonth() + 1 - dateMatch[2]) <= 0 ? (12 + now.getMonth() + 1 - dateMatch[2]) + "mo" : (now.getFullYear() - dateMatch[3]) + "a";
					}
					else if(now.getMonth() + 1 > dateMatch[2]) {
						age = (now.getMonth() + 1 - dateMatch[2]) == 1 && (now.getDate() - dateMatch[1]) <= 0 ? ((new Date(dateMatch[3], dateMatch[2] + 1, 0).getDate()) + now.getDate() - dateMatch[1]) + "j" : (now.getMonth() + 1 - dateMatch[2]) + "mo";
					}
					else if(now.getDate() > dateMatch[1]) {
						age = (now.getDate() - dateMatch[1]) == 1 && (now.getHours() - dateMatch[4]) <= 0 ? (24 + now.getHours() - dateMatch[4]) + "h" : (now.getDate() - dateMatch[1]) + "j";
					}
					else if(now.getHours() > dateMatch[4]) {
						age = (now.getHours() - dateMatch[4]) == 1 && (now.getMinutes() - dateMatch[5]) <= 0 ? (60 + now.getMinutes() - dateMatch[5]) + "min" : (now.getHours() - dateMatch[4]) + "h";
					}
					else if(now.getMinutes() > dateMatch[5]) {
						age = (now.getMinutes() - dateMatch[5]) + "min";
					}
					else {
						age = "frais";
					}

					// Append our age td
					tds.eq(1).after('<td class="age_torrent_' + ageTdNumber + '">' + age + '</td>');
				}
			});

			if(!$(".age_torrent_head:first").find("a").length && mOptions.canSort) {
				var sortedUrl = utils.clone(pageUrl);
				sortedUrl.path = sortedUrl.path == "/" ? "/browse/" : sortedUrl.path;
				sortedUrl.params = sortedUrl.params || {};
				sortedUrl.params.page = 0;
				sortedUrl.params.sort = "id";
				sortedUrl.params.order = "desc";
				if(pageUrl.params && pageUrl.params.sort == "id" && pageUrl.params.order != "asc") {
					sortedUrl.params.order = "asc";
				}

				$(".age_torrent_head:first").wrapInner('<a href="' + utils.craftUrl(sortedUrl) + '"></a>');
			}
			dbg("[AgeCol] Ended");
		};

		var suggestMore = function() {
			var searchQuery = $("#searchinput").val();
			if(searchQuery) {
				dbg("[QuerySuggest] Query : " + searchQuery);
				// Try to get some results from IMDB: 4 + 4 max
				utils.grabPage({ host: "https://thetabx.net", path: "/gksi/imdbproxy/get/" + encodeURIComponent(searchQuery) + "/2" }, function(data) {
					dbg("[QuerySuggest] Got data back");
					var imdb = JSON.parse(data);
					var suggestions = [];
					$.each(imdb.lang, function(lang, movies) {
						dbg("[QuerySuggest] Scanning " + lang + " DB");
						$.each(movies, function(i, movie) {
							suggestions.push(movie.title);
						});
					});
					var suggestionsStr = "";
					$.map(suggestions, function(movieName, i) {
						if($.inArray(movieName, suggestions) === i) {
							suggestionsStr += '<a href="' + utils.craftUrl({ host: pageUrl.host, path: pageUrl.path, params: { q: encodeURIComponent(movieName) } }) + '">' + movieName + '</a><br />';
						}
					});
					// { id, classes, title, header, data, relativeToId, relativeToObj, relativeToWindow, top, left, css, buttons = [ /* close is by default */ { b_id, b_text, b_callback} ], underButtonsText }
					appendFrame({ title: "GKSi IMDB Suggestions", data: suggestionsStr, id: "suggest", relativeToId: "searchinput", top: -14, left: 400 });

					if(opt.get(module_name, "imdb_auto_add") && modules.endless_scrolling.maxPage == 0 && imdb.translateBest) {
						dbg("[QueryTranslate] Looks like we can grab bestTranslation [" + imdb.translateBest + "] results");
						var bestMatchUrl = utils.clone(pageUrl);
						bestMatchUrl.params.q = encodeURIComponent(imdb.translateBest); // From remote translation analysis - levenshtein
						$("#torrent_list").before('<p class="pager_align page_loading"><img src="' + chrome.extension.getURL("images/loading.gif") + '" /><br />Recherche supraluminique des traductions</p>');
						utils.grabPage(bestMatchUrl, function(data) {
							var dataFrame = $(data).find("#torrent_list");
							var header = dataFrame.find("tr:first");
							if(header.length) {
								header.find(".name_torrent_head").text(header.find(".name_torrent_head").text() + " - GKSi IMDB Suggestions");
								header.addClass("gksi_imdb_head");
							}
							var insertionData = dataFrame.find("tr");
							if(insertionData.length) {
								dbg("[QueryTranslate] Append bestTranslation results");
								if(!$("#torrent_list").length) { // Build the results frame if there was no result on first query
									$("#contenu .center:not(:first)").remove();
									$("#contenu .separate:nth(1)").after(dataFrame).after("<br /><br />");
								}
								else {
									$("#torrent_list").append(insertionData);
								}
								tagTorrents();
								addAgeColumn();
								applyFilters();
							}
							else {
								dbg("[QueryTranslate] Or maybe not (no results)");
							}
							dbg("[QueryTranslate] Ended");
							$(".page_loading").remove();
						});
					}
				});
			}
		};

		var findTorrent = function(pageNumber) {
			$("#find_marked_torrent_span").remove();
			var foundMarkedTorrent = false;
			var torrentIdMark = opt.get(module_name, "torrent_marker");
			var torrentId = Number($("tbody tr:nth(1) td:nth(1) a").attr("href").match(/\/torrent\/(\d+)\//)[1]);
			$("tbody tr:not(:first)").find("td:nth(1) a").each(function() {
				torrentId = Number($(this).attr("href").match(/\/torrent\/(\d+)\//)[1]);
				if(torrentId <= torrentIdMark) {
					dbg("[TorrentMark] Found it !");
					foundMarkedTorrent = true;
					$(".page_loading").remove();
					$(this).parent().addClass("torrent_mark_found");
					$(document).scrollTop($(this).offset().top - window.innerHeight + 21);
					return false;
				}
			});
			if(!foundMarkedTorrent) {
				var urlFinder = utils.clone(pageUrl);
				urlFinder.path = "/browse/";
				urlFinder.params = pageUrl.params || {};
				urlFinder.params.page = pageNumber;
				dbg("[TorrentMark] Grabbing next page");
				utils.grabPage(urlFinder, function(data) {
					var insertionData = $(data).find("#torrent_list tr");
					if(insertionData.length) {
						dbg("[TorrentMark] Insert torrents");
						$("#torrent_list").append(insertionData);
						tagTorrents();
						addAgeColumn();
						applyFilters();
						dbg("[TorrentMark] Blocking endless scrolling");
						avoidEndlessScrolling = true;
						findTorrent(pageNumber + 1);
					}
				});
			}
		};

		var columns_def = {
			1: "name",
			3: "comments",
			4: "size",
			5: "times_completed",
			6: "seeders",
			7: "leechers"
		};
		var columns_def_sphinx = {
			3: "coms",
			4: "size",
			5: "complets",
			6: "seeders",
			7: "leechers"
		};
		var columnSorter = function() {
			if(pageUrl.path == "/sphinx/") {
				columns_def = columns_def_sphinx;
			}

			var sortedUrl = utils.clone(pageUrl);
			sortedUrl.path = sortedUrl.path == "/" ? "/browse/" : sortedUrl.path;
			sortedUrl.params = sortedUrl.params || {};
			sortedUrl.params.page = 0;

			$(".head_torrent:first td").each(function(k, td) {
				if(columns_def[k]) {
					sortedUrl.params.sort = columns_def[k];
					sortedUrl.params.order = "desc";
					if(pageUrl.params && pageUrl.params.sort == columns_def[k] && pageUrl.params.order != "asc") {
						sortedUrl.params.order = "asc";
					}

					$(this).wrapInner('<a href="' + utils.craftUrl(sortedUrl) + '"></a>');
				}
			})
		};

		var showTorrentComments = function() {
			var commLink = $(this)
			if(opt.get(module_name, "direct_comments") && commLink.attr("href").match(/\/com\//) && commLink.text() != "0") {
				var commUrl = utils.parseUrl("https://gks.gs" + commLink.attr("href"));
				utils.grabPage(commUrl, function(data) {
					$("#gksi_t_comm").remove();
					// { id, classes, title, header, data, relativeToId, relativeToObj, relativeToWindow, top, left, css, buttons = [ /* close is by default */ { b_id, b_text, b_callback} ], underButtonsText }
					appendFrame({ id: "t_comm", title: "Commentaires pour le torrent " + commUrl.params.id, data: $(data).find("#contenu").html(), relativeToWindow: true, top: 20, left: true, css: { minWidth: 500, maxWidth: 780, maxHeight: 600 }});
					//$("#gksi_t_comm").find("#gksi_t_comm_data p, #gksi_t_comm_data #com").remove();
					$("#gksi_t_comm_data #com").hide();
					$("#gksi_t_comm_data p:first").click(function() {
						$("#gksi_t_comm_data #com").slideToggle();
					});
					$("#gksi_t_comm").mouseleave(function() {
						$(this).remove();
					});
				});
			}
		};

		var makeTorrentMarkerFrame = function() {
			var markerFrame = { id: "marker", title: "Marqueur de torrents", relativeToId: "torrent_marker_button", top: -180, left: -90 };
			var findMarkedTorrent = '<span id="find_marked_torrent_span"><a id="find_marked_torrent" href="#">Retrouver torrent</a></span>';
			var markFirstTorrent = '<span id="mark_first_torrent_span"><a id="mark_first_torrent" href="#">Marquer torrent</a></span>';

			var torrentIdMark = opt.get(module_name, "torrent_marker");
			var firstTorrentId = Number($("tbody tr:nth(1) td:nth(1) a").attr("href").match(/\/torrent\/(\d+)\//)[1]);
			if(torrentIdMark === false) {
				dbg("[TorrentMark] No marked torrent");
				findMarkedTorrent = '( Pas de marqueur )';
			}
			else if(firstTorrentId - torrentIdMark > 2000) {
				dbg("[TorrentMark] Marked torrent too old");
				findMarkedTorrent = '( Marqueur trop ancien pour être retrouvé )';
			}
			var frameText = "Vous permet de sauvegarder l'id du premier torrent de la liste pour le retrouver plus tard<br /><br />Au dessus de 2000 ids de retard (~2 semaines), le torrent sera considéré trop ancien.<br />Position actuelle : " + (torrentIdMark || 0) + "/" + firstTorrentId;
			markerFrame.data = frameText + "<br /><br /><center>" + markFirstTorrent + "<br />" + findMarkedTorrent + "</center>";
			// { id, classes, title, header, data, relativeToId, relativeToObj, relativeToWindow, top, left, css, buttons = [ /* close is by default */ { b_id, b_text, b_callback} ], underButtonsText }
			appendFrame(markerFrame);

			// Torrent marking
			$("#mark_first_torrent").click(function() {
				var firstTorrentId = Number($("tbody tr:nth(1) td:nth(1) a").attr("href").match(/\/torrent\/(\d+)\//)[1]);
				dbg("[TorrentMark] Marking torrent [" + firstTorrentId + "]");
				$("#mark_first_torrent_span").remove();
				opt.set(module_name, "torrent_marker", firstTorrentId);
				$("#gksi_marker").remove();
				return false;
			});

			// Torrent mark finding
			$("#find_marked_torrent").click(function() {
				dbg("[TorrentMark] Looking for torrent mark");
				$("#torrent_list").before('<p class="pager_align page_loading"><img src="' + chrome.extension.getURL("images/loading.gif") + '" /><br />Désencapsulation des torrents à la recherche du marqueur</p>');
				findTorrent(1);
				$("#gksi_marker").remove();
				return false;
			});
		}

		var BookmarkVisibleTorrents = function() {
			dbg("[BookmarkVisibleTorrents] Scanning");
			var actions = [];
			$("#torrent_list tr:visible a[href^='/get/']:lt(40)").each(function(i){
				var tid = $(this).attr('href').match(/\d+/)[0];
				actions.push({
					action: "add",
					type: "booktorrent",
					tid: tid
				});
			});
			dbg("[BookmarkVisibleTorrents] Sending "+actions.length+" requests");
			utils.multiGet(actions, function(){
				dbg("[BookmarkVisibleTorrents] Done");
				insertScript("autoget_notify", function(){
					Notifier.success("Torrents ajouté aux BookMarks", 'Ajout Effectué');
				}, true);
			});
			dbg("[BookmarkVisibleTorrents] Sent");
		}

		var markerButton = '';
		var torrentButtons = '<input id="filter_fl" type="checkbox" ' + (opt.get(module_name, "filtering_fl") ? 'checked="checked" ' : ' ') + '/><label for="filter_fl">Filtre Freeleech</label> | <input id="filter_scene" type="checkbox" ' + (opt.get(module_name, "filtering_scene") ? 'checked="checked" ' : ' ') + '/><label for="filter_scene">Filtre Scene</label> | ';

		dbg("[Init] Starting");

		// Adding buttons
		if(mOptions.canMark && (!pageUrl.params || !pageUrl.params.page || pageUrl.params.page == 0) && (!pageUrl.params || !pageUrl.params.sort || (pageUrl.params.sort == "id" && (!pageUrl.params.order || pageUrl.params.order == "desc")))) {
			markerButton = '<a id="torrent_marker_button" href="#">Marqueur de torrents</a> | ';
		}

		$(mOptions.buttons).prepend('<a href="#" id="bookmarkvisibletorrents">Ajouter 40 premiers aux BookMarks</a> | ');
		$("#bookmarkvisibletorrents").click(BookmarkVisibleTorrents);

		if(mOptions.canFilter) {
			$(mOptions.buttons).prepend(markerButton + torrentButtons);
		}

		// Torrent marker frame
		$("#torrent_marker_button").click(function() {
			if($("#gksi_marker").length) {
				$("#gksi_marker").remove();
			}
			makeTorrentMarkerFrame();
			return false;
		});

		// FreeLeech torrents filtering
		$("#filter_fl").change(function() {
			opt.set(module_name, "filtering_fl", $(this).attr("checked") == "checked" ? true : false);
			dbg("[FilterFL] is " + opt.get(module_name, "filtering_fl"));
			if(opt.get(module_name, "filtering_fl")) {
				dbg("[FLFilter] Filtering FL");
				applyFilters();
				$("#find_marked_torrent_span").hide();
				dbg("[FLFilter] Ended filtering");
				$(document).trigger("es_dom_process_done");
			}
			else {
				dbg("[FLFilter] Unfiltering FL");
				unfilterFL();
				$("#find_marked_torrent_span").show();
				dbg("[FLFilter] Ended unfiltering");
				$(document).trigger("es_dom_process_done");
			}
		});
		$("#filter_scene").change(function() {
			opt.set(module_name, "filtering_scene", $(this).attr("checked") == "checked" ? true : false);
			dbg("[FilterScene] is " + opt.get(module_name, "filtering_scene"));
			if(opt.get(module_name, "filtering_scene")) {
				dbg("[SceneFilter] Filtering Scene");
				applyFilters();
				$("#find_marked_torrent_span").hide();
				dbg("[SceneFilter] Ended filtering");
				$(document).trigger("es_dom_process_done");
			}
			else {
				dbg("[SceneFilter] Unfiltering Scene");
				unfilterScene();
				$("#find_marked_torrent_span").show();
				dbg("[SceneFilter] Ended unfiltering");
				$(document).trigger("es_dom_process_done");
			}
		});
		tagTorrents();
		if(mOptions.canSort) {
			columnSorter();
		}
		addAgeColumn();
		if(mOptions.canFilter) {
			applyFilters();
		}
		$("#torrent_list").on("mouseenter", "a", showTorrentComments);

		if(mOptions.canSuggest && opt.get(module_name, "imdb_suggest")) {
			suggestMore();
		}

		$(document).on("endless_scrolling_insertion_done", function() {
			dbg("[endless_scrolling] Module specific functions");
			$("#find_marked_torrent_span").remove();
			tagTorrents();
			addAgeColumn();
			applyFilters();
			$(document).trigger("es_dom_process_done");
		});

		dbg("[Init] Ready");
	}
};