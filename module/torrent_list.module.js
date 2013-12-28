modules.torrent_list = {
	name: "torrent_list",
	dText: "Liste torrents",
	pages: [
		{ path_name: "/", options: { buttons: '#sort', canRefresh: true, canMark: true, canFilter: true, canSort: true } },
		{ path_name: "/browse/", options: { buttons: '#sort p', canRefresh: true, canMark: true, canFilter: true, canSort: true } },
		{ path_name: "/sphinx/", options: { buttons: 'form[name="getpack"] div', canFilter: true, canSort: true } },
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

		var torrentList = [];
		var tagTorrents = function(torrentLines) {
			dbg("[tagTorrents] Scanning torrents");
			var bookmarksList = gData.get("bookmarks", "torrents");
			var bookmarksIdsList = gData.get("bookmarks", "bookmarkIds");
			var jumpMe = true;
			torrentLines.each(function() {
				if(jumpMe) {
					jumpMe = false;
					return;
				}
				jumpMe = true;

				var node = $(this);
				var t = {node: node, name: node.find("strong").text(), status: {}, shown: true, nextNode: node.next()};
				var imgs = node.find("img");
				$.each(imgs, function() {
					if(bookmarksList) {
						var imgId = $(this).attr("id");
						if(imgId) {
							var id = imgId.substring(6);
							t.id = id;
							if(bookmarksList.indexOf(id) != -1) {
								if(bookmarksIdsList && bookmarksIdsList[id]) {
									node.find("img:first").after($('<a href="#"><img src="' + chrome.extension.getURL("images/bookmark.png") + '" /></a>').click(function() {
										$(this).remove();
										utils.grabPage({host: pageUrl.host, path: "/ajax.php", params: {action: "del", type: "delbookmark", tid: bookmarksIdsList[id]}}, function(data) {
											bookmarksList.splice(bookmarksList.indexOf(id), 1);
											gData.set("bookmarks", "torrents", bookmarksList);
											delete bookmarksIdsList[id];
											gData.set("bookmarks", "bookmarkIds", bookmarksIdsList);
											insertScript("del_bookmark_" + id, function() {
												Notifier.success("Bookmark supprimé", 'Suppression OK');
											}, true);
										});
										return false;
									}));
								}
								else {
									node.find("img:first").after('<img src="' + chrome.extension.getURL("images/bookmark.png") + '" />');
								}
								t.status.bookmark = true;
							}
						}
					}
					switch($(this).attr("alt")) {
						case "New !":
							t.status.new = true;
							break;
						case "Nuke ! ":
							t.status.nuke = true;
							break;
						case "FreeLeech":
							t.status.freeleech = true;
							break;
						case "Scene":
							t.status.scene = true;
					}
				});
				t.status.string = "";
				torrentList.push(t);
			});
			dbg("[tagTorrents] Ended scanning");
			return torrentLines;
		};
		modules.endless_scrolling.preInsertion = tagTorrents;

		var filtersChanged = function() {
			refreshFilterSet();
			dbg("[Filters] Filters ready");
			applyFilters();
			dbg("[Filters] Done");
		};

		var basicFilters = {freeleech: 0, scene: 0};
		var stringFilters = {original: "", ready: false};
		var refreshFilterSet = function() {
			basicFilters = {freeleech: opt.get(module_name, "filter_fl"), scene: opt.get(module_name, "filter_scene")};
			var stringFilterString = $("#filter_string").val();
			onlyReq = 0;
			var noFilterActive = true;
			for(filter in basicFilters) {
				if(basicFilters[filter] == 1) {
					onlyReq++;
				}
				if(basicFilters[filter] > 0) {
					noFilterActive = false;
				}
			}
			if(stringFilterString != stringFilters.original) {
				stringFilters = compileStringFilter(stringFilterString);
			}
			if(stringFilters.ready) {
				noFilterActive = false;
			}
			if(noFilterActive) {
				$("#torrent_marker_button").show();
				$("#torrent_finder_button").show();
			}
			else {
				$("#torrent_marker_button").hide();
				$("#torrent_finder_button").hide();
			}
		};

		var onlyReq;
		var applyFilters = function() {
			var showTorrents = [];
			var hideTorrents = [];
			var caseSensitive = opt.get(module_name, "case_sensitive");
			var defaultShown = onlyReq == 0;
			$.each(torrentList, function(i, t) {
				var shouldShow = defaultShown;

				// Basic filters
				var requiredOnlys = onlyReq;
				for(filter in basicFilters) {
					var filterStatus = basicFilters[filter];
					if(filterStatus == 1) {
						if(t.status[filter]) {
							if(--requiredOnlys == 0) {
								shouldShow = true;
							}
						}
					}
					else if(filterStatus == 2) {
						if(t.status[filter]) {
							shouldShow = false;
						}
					}
				}

				// String filter
				if(shouldShow && stringFilters.ready) {
					shouldShow = caseSensitive ? t.name.indexOf(stringFilters.proper) == -1 : t.name.toLowerCase().indexOf(stringFilters.proper) == -1
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

		var compileStringFilter = function(str) {
			var compiledFilter = {original: str, proper: "", ready: false};
			compiledFilter.proper = (opt.get(module_name, "case_sensitive") ? str : str.toLowerCase()).trim();
			if(compiledFilter.proper != "") {
				compiledFilter.ready = true;
			}
			return compiledFilter;
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
			var now = siteRelativeDate;
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
						refreshDate();
						recalcAgeColumn();
					}
					else {
						dbg("[auto_refresh] No data");
					}
				});
			}, 60000);
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
						$("#torrent_list").append(tagTorrents(insertionData));
						refreshDate();
						addAutogetColumn();
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

		var MAX_WIDTH = 300, MIN_HEIGHT = 154, WANTED_HEIGHT = 317;
		var whitelistUrls = ["thetvdb.com", "allocine.fr", "tvrage.com", "betaseries.com"];
		var previewTorrent = function(e) {
			if(!opt.get(module_name, "preview")) {
				return;
			}
			var torrentId = $(this).attr("id").substring(6);

			if(e.type == "mouseleave") {
				dbg("[preview] Remove");
				$("#gksi_preview_" + torrentId).remove();
			}
			else {
				var pos = $(this).offset();
				$("#global").after('<div id="gksi_preview_' + torrentId + '" class="gksi_preview"><img src="' + chrome.extension.getURL("images/loading.gif") + '" /></div>');
				$("#gksi_preview_" + torrentId).offset({top: pos.top - 6, left: pos.left - 38});
				dbg("[preview] Fetch torrent info");
				utils.grabPage({ host: pageUrl.host, path: "/torrent/" + torrentId + "/" }, function(data) {
					var previewDiv = $("#gksi_preview_" + torrentId);
					if(!previewDiv.length) {
						dbg("[preview] Abort !");
						return;
					}

					var imgs = [];
					$(data).find("#prez img").each(function() {
						imgs.push($(this).attr("src"));
					});
					$(data).find("#summary img").each(function() {
						imgs.push($(this).attr("src"));
					});

					if(!imgs.length) {
						previewDiv.remove();
						return;
					}

					dbg("[preview] Got torrent info with some imgs");
					var img = new Image(), i = 0, maybeSrc = false, forceSmall = false;
					img.onload = function() {
						for(url in whitelistUrls) {
							if(this.src.indexOf(whitelistUrls[url]) != -1) { forceSmall = true; }
						}
						if(this.height <= MIN_HEIGHT && ++i < imgs.length) {
							dbg("[preview] Too small");
							this.src = imgs[i];
						}
						else if(this.height > MIN_HEIGHT && this.height <= WANTED_HEIGHT && !forceSmall) {
							dbg("[preview] Meh :: size [" + this.width + "x" + this.height + "] Keep it, it may be useful");
							maybeSrc = this.src;
							if(++i < imgs.length) {
								this.src = imgs[i];
							}
							else {
								dbg("[preview] No images left, fallback")
								forceSmall = true;
								this.onload();
							}
						}
						else if(this.height > WANTED_HEIGHT || forceSmall) {
							dbg("[preview] Perfect :: size [" + this.width + "x" + this.height + "]");
							var top = pos.top, scrollTop = (document.body.scrollTop || document.documentElement.scrollTop), windowHeight = $(window).height(), resizedHeight = (this.width > 300 ? this.height * (300 / this.width) : this.height);
							if(top + resizedHeight + 4 > scrollTop + windowHeight) {
								top = (scrollTop + windowHeight) - resizedHeight - 4;
							}
							previewDiv.offset({ top: top, left: pos.left - 6 - Math.min(this.width, MAX_WIDTH) });
							$("#gksi_preview_" + torrentId + " img").attr("src", this.src);
						}
						else if(maybeSrc) {
							dbg("[preview] Ok, backup to maybeSrc");
							forceSmall = true;
							this.src = maybeSrc;
						}
						else {
							dbg("[preview] Nothing was big enough");
							previewDiv.remove();
						}
					};
					img.src = imgs[i];
				});
			}
		};

		var siteRelativeDate = utils.getSiteRelativeDate();
		var refreshDate = function() {
			siteRelativeDate = utils.getSiteRelativeDate();
		};

		var markerButton =  '<a id="torrent_marker_button" href="#">Marquer torrent</a> |';
		var finderButton = '<a id="torrent_finder_button" href="#">Retrouver torrent</a> | ';
		var filterButtons = '<span class="g_filter g_filter_' + opt.get(module_name, "filter_fl") + '" opt="filter_fl">Freeleech</span> | <span class="g_filter g_filter_' + opt.get(module_name, "filter_scene") + '" opt="filter_scene">Scene</span> |';
		var stringFilterInput = '<input type="text" id="filter_string" placeholder="Exclure" size="12" />| ';
		var bookmarkButton = '<a href="#" id="bookmarkvisibletorrents">Bookmarker 40 premiers</a> | ';
		var refreshButton = '<input id="auto_refresh" type="checkbox" ' + (opt.get(module_name, "auto_refresh") ? 'checked="checked" ' : ' ') + '/><label for="auto_refresh">Auto refresh</label> | ';
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
			if(opt.get(module_name, "exclude_string")) {
				buttons += stringFilterInput;
			}
		}

		$(mOptions.buttons).prepend(buttons + bookmarkButton);
		$("#bookmarkvisibletorrents").click(BookmarkVisibleTorrents);
		$("#torrent_marker_button").click(mark_first_torrent);
		$("#torrent_finder_button").click(find_marked_torrent);

		// FreeLeech torrents filtering
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

		$("#filter_string").on("change", filtersChanged).on("keydown", function(e) {
			if(e.which == 13) { e.preventDefault(); }
		}).on("keyup", function(e) {
			if(e.which == 13) { filtersChanged(); }
		});

		$("#auto_refresh").change(function() {
			opt.set(module_name, "auto_refresh", $(this).prop("checked"));
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
		tagTorrents($("tbody tr"));
		filtersChanged();
		columnSorter();
		addAutogetColumn();
		addAgeColumn();

		$("#torrent_list").on("mouseenter", "a", showTorrentComments)
			.on("click", "a.autoget_link", autogetOnClick)
			.on("mouseenter mouseleave", 'img[alt="+"]', previewTorrent);

		startAutorefresh();

		$(document).on("endless_scrolling_insertion_done", function() {
			dbg("[endless_scrolling] Module specific functions");
			$("#find_marked_torrent_span").remove();
			refreshDate();
			addAutogetColumn();
			addAgeColumn();
			applyFilters();
			$(document).trigger("es_dom_process_done");
		});

		dbg("[Init] Ready");
	}
};