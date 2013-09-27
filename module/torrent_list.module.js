modules.torrent_list = {
	name: "torrent_list",
	dText: "Liste torrents",
	pages: [
		{ path_name: "/", options: { buttons: '#sort', canRefresh: true, canMark: true, canFilter: true, canSort: true } },
		{ path_name: "/browse/", options: { buttons: '#sort p', canRefresh: true, canMark: true, canFilter: true, canSort: true } },
		{ path_name: "/sphinx/", options: { buttons: 'form[name="getpack"] div', canSuggest: true, canFilter: true, canSort: true } },
		{ path_name: "/summary/", options: { } },
		{ path_name: "/m/uploads/", options: { canSort: true } }
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
			var bookmarksList = gData.get("bookmarks", "torrents");
			$("tbody tr.head_torrent:not(.page_tagged)").nextAll(":nth-child(2n" + (even ? "+1" : "") + ")").each(function() {
				var classIs = "";
				var torrentTr = $(this);
				var imgs = torrentTr.find("img");
				$.each(imgs, function() {
					if(bookmarksList) {
						var imgId = $(this).attr("id");
						if(imgId) {
							var id = imgId.substring(6);
							if(bookmarksList.indexOf(id) != -1) {
								torrentTr.find("img:first").after('<img src="' + chrome.extension.getURL("images/bookmark.png") + '" />');
								classIs += "t_bookmark ";
							}
						}
					}
					switch($(this).attr("alt")) {
						case "New !":
							classIs += "t_new ";
							break;
						case "Nuke ! ":
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
					torrentTr.addClass(classIs);
					torrentTr.next().addClass(classIs);
				}
			});
			$("tbody tr.head_torrent").addClass("page_tagged");
			even = !even;
			dbg("[tagTorrents] Ended scanning");
		};

		var unfilterFL = function() {
			$("tbody tr" + (opt.get(module_name, "filtering_scene") ? ".t_scene:not(.t_freeleech)" : "")).show();
		};

		var unfilterScene = function() {
			$("tbody tr" + (opt.get(module_name, "filtering_fl") ? ".t_freeleech:not(.t_scene)" : "")).show();
		};

		var applyFilters = function() {
			if(!mOptions.canFilter) {
				return;
			}

			if(opt.get(module_name, "filtering_fl") || opt.get(module_name, "filtering_scene")) {
				$("tbody tr:not(:first):not(.gksi_imdb_head):not(" + (opt.get(module_name, "filtering_fl") ? ".t_freeleech" : "") + (opt.get(module_name, "filtering_scene") ? ".t_scene" : "") + ")").hide();
			}
		};

		var applyStringFilter = function() {
			if(!mOptions.canFilter) {
				return;
			}

			var excludeVal = $("#filter_string").val();
			dbg("[StringFilter] Filtering (" + excludeVal + ")");
			if(excludeVal.trim() == "") {
				$("tbody tr:not(:first):not(.gksi_imdb_head)" + (opt.get(module_name, "filtering_fl") ? ".t_freeleech" : "") + (opt.get(module_name, "filtering_scene") ? ".t_scene" : "")).show();
			}
			else {
				var odd = false;
				$("tbody tr:not(:first):not(.gksi_imdb_head)" + (opt.get(module_name, "filtering_fl") ? ".t_freeleech" : "") + (opt.get(module_name, "filtering_scene") ? ".t_scene" : "")).each(function() {
					var t = $(this);
					if(t.hasClass("head_torrent")) { return; }
					if(odd) {
						odd = false;
						return;
					}
					if(t.find("strong").text().indexOf(excludeVal) != -1) {
						t.hide();
						t.next().hide();
					}
					else {
						t.show();
						t.next().show();
					}
					odd = true;
				});
			}
			dbg("[StringFilter] Done");
		};

		var addAgeColumn = function() {
			if(!opt.get(module_name, "age_column")) {
				return;
			}

			dbg("[AgeCol] Started dating torrents");
			var alreadyDated = false;
			$("tbody tr").each(function() { // Process all data & skip already dated, is strangely faster than processing data before insertion
				if($(this).hasClass("head_torrent")) {
					if($(this).hasClass("age_done")) { // If this td head is already dated, assume the same for the whole page
						dbg("[AgeCol] Already dated page");
						alreadyDated = true;
						return;
					}
					dbg("[AgeCol] Date calculation");
					$(this).find("td:nth(1)").after('<td class="age_torrent_head">Age</td>');
					$(this).addClass("age_done");
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

					// Append our age td
					tds.eq(1).after('<td class="age_torrent_' + ageTdNumber + '">' + simpleDateToDiff(dateMatch) + '</td>');
				}
			});

			if(!$(".age_torrent_head:first").find("a").length && mOptions.canSort) {
				var sortedUrl = utils.clone(pageUrl);
				sortedUrl.path = sortedUrl.path == "/" ? "/browse/" : sortedUrl.path;
				sortedUrl.params = sortedUrl.params || {};
				sortedUrl.params.page = 0;
				sortedUrl.params.sort = (pageUrl.path == "/sphinx/" ? "date" : "id");
				sortedUrl.params.order = "desc";
				if(pageUrl.params && pageUrl.params.sort == (pageUrl.path == "/sphinx/" ? "date" : "id") && pageUrl.params.order != "asc") {
					sortedUrl.params.order = "asc";
				}

				$(".age_torrent_head:first").wrapInner('<a href="' + utils.craftUrl(sortedUrl) + '"></a>');
			}
			dbg("[AgeCol] Ended");
		};

		var recalcAgeColumn = function() {
			if(!opt.get(module_name, "age_column")) {
				return;
			}

			dbg("[AgeCol] Started torrents date recalc");
			var alreadyDated = false;
			$("tbody tr").each(function() {
				if(!$(this).hasClass("head_torrent")) {
					var tds = $(this).find("td");
					if(tds.first().hasClass("alt1")) { // Don't mind the hidden td
						return;
					}
					
					var dateMatch = $(this).next().text().match(/(\d+)\/(\d+)\/(\d+) à (\d+):(\d+)/);
					if(!dateMatch || !dateMatch.length) { // This should never happen
						return;
					}

					// Append our age td
					tds.eq(2).text(simpleDateToDiff(dateMatch));
				}
			});
			dbg("[AgeCol] Ended");
		};

		var simpleDateToDiff = function(dateMatch) {
			// Calculation is done by taking the first not-now date section, in order Y/M/D/h/m
			// At first match, just take the difference between now and torrent date
			// If there's only one unit difference && the date section underneath is still viable, fallback to this smaller date section
			// eg: Date[torrent] = 1/1/2013 23:59, Date[now] = 2/1/2013 1:01 => day_difference() == 1 => fallback to hours => (24 + 1 - 23) => 2h
			// In fact, it's 1h02m but it's closer than 1day
			// In the same thinking process, it can return 24h since it's still viable and more precise than 1day -- Won't return > 24h
			var now = new Date();
			if(now.getFullYear() > dateMatch[3]) {
				return (now.getFullYear() - dateMatch[3]) == 1 && (now.getMonth() + 1 - dateMatch[2]) <= 0 ? (12 + now.getMonth() + 1 - dateMatch[2]) + "mo" : (now.getFullYear() - dateMatch[3]) + "a";
			}
			else if(now.getMonth() + 1 > dateMatch[2]) {
				return (now.getMonth() + 1 - dateMatch[2]) == 1 && (now.getDate() - dateMatch[1]) <= 0 ? ((new Date(dateMatch[3], dateMatch[2] + 1, 0).getDate()) + now.getDate() - dateMatch[1]) + "j" : (now.getMonth() + 1 - dateMatch[2]) + "mo";
			}
			else if(now.getDate() > dateMatch[1]) {
				return (now.getDate() - dateMatch[1]) == 1 && (now.getHours() - dateMatch[4]) <= 0 ? (24 + now.getHours() - dateMatch[4]) + "h" : (now.getDate() - dateMatch[1]) + "j";
			}
			else if(now.getHours() > dateMatch[4]) {
				return (now.getHours() - dateMatch[4]) == 1 && (now.getMinutes() - dateMatch[5]) <= 0 ? (60 + now.getMinutes() - dateMatch[5]) + "min" : (now.getHours() - dateMatch[4]) + "h";
			}
			else if(now.getMinutes() > dateMatch[5]) {
				return (now.getMinutes() - dateMatch[5]) + "min";
			}
			else {
				return "frais";
			}
		};

		var addAutogetColumn = function() {
			if(!opt.get(module_name, "autoget_column")) {
				return;
			}

			dbg("[autoget_column] Started");
			var alreadyProcessed = false;
			$("tbody tr").each(function() { // Process all data & skip already processed, is strangely faster than processing data before insertion
				if($(this).hasClass("head_torrent")) {
					if($(this).hasClass("autoget_done")) { // If this td head is already processed, assume the same for the whole page
						dbg("[autoget_column] Already processed page");
						alreadyProcessed = true;
						return;
					}
					dbg("[autoget_column] Processing");
					$(this).find("td:nth(1)").after('<td class="autoget_torrent_head">Get</td>');
					$(this).addClass("autoget_done");
					alreadyProcessed = false;
				}
				else {
					if(alreadyProcessed) { // Wait until we get to the new page
						return;
					}

					var tds = $(this).find("td");
					if(tds.first().hasClass("alt1")) { // Don't mind the hidden td
						return;
					}

					var autogetTdNumber = 0;
					if(tds.eq(1).hasClass("name_torrent_1")) { // Keep background-color alternance
						autogetTdNumber = 1;
					}

					tds.eq(1).after('<td class="autoget_torrent_' + autogetTdNumber + '"><a href="#" class="autoget_link"><img src="https://s.gks.gs/static/themes/sifuture/img/rss2.png" /></a></td>');
				}
			});
			dbg("[autoget_column] Ended");
		};

		var autogetOnClick = function() {
			var td = $(this).parent().parent().find("td:nth(1)");
			var funct = "function() { AddGet('" + td.find("img:first").attr("id").substring(6) + "', 'autoget', '" + $.trim(td.find("a:first").text()) + "'); }";
			insertScript("autoget_native", funct, true);
			return false;
		};

		var autorefreshInterval;
		var startAutorefresh = function() {
			if(!opt.get(module_name, "auto_refresh") || !mOptions.canRefresh) {
				return;
			}

			autorefreshInterval = setInterval(function() {
				dbg("[auto_refresh] Grabing this page");
				utils.grabPage(pageUrl, function(data) {
					torrentsTR = $(data).find("#torrent_list tr");
					dbg("[auto_refresh] Got data");
					if(torrentsTR && torrentsTR.length) {
						var firstTorrentId = Number($("#torrent_list tr:nth(1)").find("td:nth(1) img:first").attr("id").substring(6));
						var foundFirst = false;
						var insertedTrs = false;
						$(torrentsTR.get().reverse()).each(function() {
							if(!foundFirst && !$(this).find(".alt1").length && !$(this).hasClass("head_torrent") && Number($(this).find("td:nth(1) img:first").attr("id").substring(6)) >= firstTorrentId) {
								foundFirst = true;
								return;
							}
							if(foundFirst && !$(this).hasClass("head_torrent")) {
								var torrentTR = $(this);
								if(!torrentTR.find(".alt1").length) {
									var torrentNameTd = torrentTR.find("td:nth(1)");
									if(opt.get(module_name, "autoget_column")) {
										torrentNameTd.after('<td class="autoget_torrent_1"><a href="#" class="autoget_link"><img src="https://s.gks.gs/static/themes/sifuture/img/rss2.png" /></a></td>');
									}
									if(opt.get(module_name, "age_column")) {
										torrentNameTd.after('<td class="age_torrent_1">frais</td>');
									}
									torrentTR.find("td:nth(1)").css("background-color", opt.get(module_name, "auto_refresh_color"));
								}
								$("#torrent_list tr:first").after(torrentTR);
								$("#torrent_list tr:last").remove();
								insertedTrs = true;
							}
						});
						if(insertedTrs) {
							dbg("[auto_refresh] Inserted torrents");
							$(document).trigger("endless_scrolling_insertion_done");
						}
						else {
							dbg("[auto_refresh] Nothing new");
						}
						recalcAgeColumn();
					}
					else {
						dbg("[auto_refresh] No data");
					}
				});
			}, 60000);
		};

		var suggestMore = function() {
			var searchQuery = $("#searchinput").val();
			if(searchQuery) {
				dbg("[QuerySuggest] Query : " + searchQuery);
				loadingHtml = '<center><img src="' + chrome.extension.getURL("images/loading.gif") + '" /><br />Analyse des entrailles d\'IMDB</center>';
				appendFrame({ title: "GKSi IMDB Suggestions", data: loadingHtml, id: "suggest", relativeToId: "searchinput", top: -14, left: 400 });

				// Try to get some results from IMDB: 4 + 4 max
				utils.grabPage({ host: "https://api.thetabx.net", path: "/imdb/translate/3/" + encodeURIComponent(searchQuery) }, function(imdb) {
					dbg("[QuerySuggest] Got data back");
					if(!imdb.results) {
						$("#gksi_suggest_data").html("Désolé, rien trouvé !");
						return
					}
					var suggestions = [];
					$.each(imdb.results, function(imdbId, movie) {
						dbg("[QuerySuggest] IMDB [ " + imdbId + " ]");
						$.each(movie, function(titleType, title) {
							suggestions.push(title);
						});
					});
					var suggestionsHtml = "";
					$.map(suggestions, function(movieName, i) {
						if($.inArray(movieName, suggestions) === i) {
							suggestionsHtml += '<a href="' + utils.craftUrl({ host: pageUrl.host, path: pageUrl.path, params: { q: encodeURIComponent(movieName) } }) + '">' + movieName + '</a><br />';
						}
					});
					// { id, classes, title, header, data, relativeToId, relativeToObj, relativeToWindow, top, left, css, buttons = [ /* close is by default */ { b_id, b_text, b_callback} ], underButtonsText }
					$("#gksi_suggest_data").html(suggestionsHtml);

					if(opt.get(module_name, "imdb_auto_add") && modules.endless_scrolling.maxPage == 0 && imdb.levenshtein) {
						dbg("[QueryTranslate] Looks like we can grab bestTranslation [" + imdb.levenshtein.bestTitle + "] results");
						var bestMatchUrl = utils.clone(pageUrl);
						bestMatchUrl.params.q = encodeURIComponent(imdb.levenshtein.bestTitle); // From remote translation analysis - levenshtein
						$("#torrent_list").before('<p class="pager_align page_loading"><img src="' + chrome.extension.getURL("images/loading.gif") + '" /><br />Recherche supraluminique des traductions</p>');
						utils.grabPage(bestMatchUrl, function(data) {
							var dataFrame = $(data).find("#torrent_list");
							var header = dataFrame.find("tr:first");
							if(header.length) {
								header.find(".name_torrent_head").text(header.find(".name_torrent_head").text() + " - GKSi IMDB [ " + imdb.levenshtein.bestTitle + " ]");
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
								addAutogetColumn();
								addAgeColumn();
								applyFilters();
								applyStringFilter();
							}
							else {
								dbg("[QueryTranslate] Or maybe not (no results)");
							}
							dbg("[QueryTranslate] Ended");
							$(".page_loading").remove();
						});
					}
					else {
						dbg("[QueryTranslate] Not even trying")
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
						addAutogetColumn();
						addAgeColumn();
						applyFilters();
						applyStringFilter();
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
			if(!mOptions.canSort) {
				return;
			}

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
					appendFrame({ id: "t_comm", title: "Commentaires pour le torrent " + commUrl.params.id, data: $(data).find("#contenu").html(), relativeToWindow: true, top: 20, left: true, css: { minWidth: 500, maxWidth: 780, maxHeight: 600 }, removeOnOutsideClick: true });
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

		var mark_first_torrent = function() {
			var firstTorrentId = Number($("tbody tr:nth(1) td:nth(1) a").attr("href").match(/\/torrent\/(\d+)\//)[1]);
			dbg("[TorrentMark] Marking torrent [" + firstTorrentId + "]");
			opt.set(module_name, "torrent_marker", firstTorrentId);
			$("#torrent_marker_button").remove();
			return false;
		};

		var find_marked_torrent = function() {
			dbg("[TorrentMark] Looking for torrent mark");
			$("#torrent_list").before('<p class="pager_align page_loading"><img src="' + chrome.extension.getURL("images/loading.gif") + '" /><br />Désencapsulation des torrents à la recherche du marqueur</p>');
			findTorrent(1);
			$("#torrent_finder_button").remove();
			return false;
		};

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
		};

		var markerButton =  '<a id="torrent_marker_button" href="#">Marquer torrent</a> |';
		var finderButton = '<a id="torrent_finder_button" href="#">Retrouver torrent</a> | ';
		var filterButtons = '<input id="filter_fl" type="checkbox" ' + (opt.get(module_name, "filtering_fl") ? 'checked="checked" ' : ' ') + '/><label for="filter_fl">Filtre Freeleech</label> |<input id="filter_scene" type="checkbox" ' + (opt.get(module_name, "filtering_scene") ? 'checked="checked" ' : ' ') + '/><label for="filter_scene">Filtre Scene</label> |<input type="text" id="filter_string" placeholder="Exclure" size="12" />| ';
		var bookmarkButton = '<a href="#" id="bookmarkvisibletorrents">Bookmarker 40 premiers</a> | ';
		var refreshButton = '<input id="auto_refresh" type="checkbox" ' + (opt.get(module_name, "auto_refresh") ? 'checked="checked" ' : ' ') + '/><label for="auto_refresh">Auto refresh</label> |';
		var buttons = "";

		dbg("[Init] Starting");

		// Adding buttons
		if(mOptions.canMark && (!pageUrl.params || !pageUrl.params.page || pageUrl.params.page == 0) && (!pageUrl.params || !pageUrl.params.sort || (pageUrl.params.sort == "id" && (!pageUrl.params.order || pageUrl.params.order == "desc"))) && opt.get(module_name, "t_marker_button")) {
			var torrentIdMark = opt.get(module_name, "torrent_marker");
			var firstTorrentId = Number($("tbody tr:nth(1) td:nth(1) a").attr("href").match(/\/torrent\/(\d+)\//)[1]);
			if(torrentIdMark !== false && firstTorrentId - torrentIdMark < 2000) {
				buttons += finderButton;
			}
			buttons += markerButton;
		}
		if(mOptions.canRefresh) {
			buttons += refreshButton;
		}
		if(mOptions.canFilter) {
			buttons += filterButtons;
		}

		$(mOptions.buttons).prepend(buttons + bookmarkButton);
		$("#bookmarkvisibletorrents").click(BookmarkVisibleTorrents);
		$("#torrent_marker_button").click(mark_first_torrent);
		$("#torrent_finder_button").click(find_marked_torrent);

		if(opt.get(module_name, "filtering_fl") || opt.get(module_name, "filtering_scene")) {
			$("#torrent_marker_button").hide();
			$("#torrent_finder_button").hide();
		}

		// FreeLeech torrents filtering
		$("#filter_fl").change(function() {
			opt.set(module_name, "filtering_fl", $(this).attr("checked") == "checked" ? true : false);
			dbg("[FilterFL] is " + opt.get(module_name, "filtering_fl"));
			if(opt.get(module_name, "filtering_fl")) {
				dbg("[FLFilter] Filtering FL");
				applyFilters();
				$("#torrent_marker_button").hide();
				$("#torrent_finder_button").hide();
				dbg("[FLFilter] Ended filtering");
				$(document).trigger("es_dom_process_done");
			}
			else {
				dbg("[FLFilter] Unfiltering FL");
				unfilterFL();
				applyStringFilter();
				$("#torrent_marker_button").show();
				$("#torrent_finder_button").show();
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
				$("#torrent_marker_button").hide();
				$("#torrent_finder_button").hide();
				dbg("[SceneFilter] Ended filtering");
				$(document).trigger("es_dom_process_done");
			}
			else {
				dbg("[SceneFilter] Unfiltering Scene");
				unfilterScene();
				applyStringFilter();
				$("#torrent_marker_button").show();
				$("#torrent_finder_button").show();
				dbg("[SceneFilter] Ended unfiltering");
				$(document).trigger("es_dom_process_done");
			}
		});
		$("#filter_string").on("change", applyStringFilter).on("keydown", function(e) {
			if(e.which == 13) { e.preventDefault(); }
		}).on("keyup", function(e) {
			if(e.which == 13) { applyStringFilter(); }
		});
		$("#auto_refresh").change(function() {
			opt.set(module_name, "auto_refresh", $(this).attr("checked") == "checked" ? true : false);
			dbg("[auto_refresh] is " + opt.get(module_name, "auto_refresh"));
			if(opt.get(module_name, "auto_refresh")) {
				dbg("[auto_refresh] Starting");
				startAutorefresh();
			}
			else {
				dbg("[auto_refresh] Ended");
				clearInterval(autorefreshInterval);
			}
		});
		tagTorrents();
		columnSorter();
		addAutogetColumn();
		addAgeColumn();
		applyFilters();

		$("#torrent_list").on("mouseenter", "a", showTorrentComments);
		$("#torrent_list").on("click", "a.autoget_link", autogetOnClick);

		if(mOptions.canSuggest && opt.get(module_name, "imdb_suggest")) {
			suggestMore();
		}
		startAutorefresh();

		$(document).on("endless_scrolling_insertion_done", function() {
			dbg("[endless_scrolling] Module specific functions");
			$("#find_marked_torrent_span").remove();
			tagTorrents();
			addAutogetColumn();
			addAgeColumn();
			applyFilters();
			applyStringFilter();
			$(document).trigger("es_dom_process_done");
		});

		dbg("[Init] Ready");
	}
};