modules.module_ = {
	name: "sphinx",
	dText: "Sphinx",
	pages: [
		{ path_name: "/sphinx/", options: { buttons: 'form[name="getpack"] div' } },
	],
	loaded: false,
	loadModule: function(mOptions) {
		this.loaded = true;
		//var module_name = this.name;
		var module_name = "torrent_list";
		var dbg = function(str) {
			utils.dbg(module_name, str);
		};

		dbg("[Init] Loading module");
		// Loading all functions used

		var suggestMore = function() {
			var searchQuery = $("#searchinput").val();
			if(searchQuery) {
				dbg("[QuerySuggest] Query : " + searchQuery);
				loadingHtml = '<center><img src="' + chrome.extension.getURL("images/loading.gif") + '" /><br />Analyse des entrailles d\'IMDB</center>';
				appendFrame({ title: "GKSi IMDB Suggestions", data: loadingHtml, id: "suggest", relativeToId: "searchinput", top: -14, left: 400 });

				// Try to get some results from IMDB: 4 + 4 max
				utils.grabPage({ host: "https://api.thetabx.net", path: "/imdb/translate/3/" + encodeURIComponent(searchQuery) }, function(imdb) {
					dbg("[QuerySuggest] Got data back");
					if(!imdb.results || imdb.results.length === 0) {
						$("#gksi_suggest_data").html("Désolé, rien trouvé !");
						return;
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

					if(opt.get(module_name, "imdb_auto_add") && modules.endless_scrolling.maxPage === 0 && imdb.levenshtein && imdb.levenshtein.bestTitle) {
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
								$(document).trigger("endless_scrolling_insertion_done");
							}
							else {
								dbg("[QueryTranslate] Or maybe not (no results)");
							}
							dbg("[QueryTranslate] Ended");
							$(".page_loading").remove();
						});
					}
					else {
						dbg("[QueryTranslate] Not even trying");
					}
				});
			}
		};

		var MAX_RESULTS = 8;
		var suggestDiscogsMore = function() {
			var searchQuery = $("#searchinput").val();
			if(searchQuery) {
				dbg("[QuerySuggest] Query : " + searchQuery);
				loadingHtml = '<center><img src="' + chrome.extension.getURL("images/loading.gif") + '" /><br />Analyse des entrailles de Discogs</center>';
				appendFrame({ title: "GKSi - Fiches Discogs", data: loadingHtml, id: "suggest", relativeToId: "searchinput", top: -14, left: 400 });

				// Try to get some results from IMDB: 4 + 4 max
				utils.grabPage({ host: "http://api.discogs.com", path: "/database/search", params: { q: encodeURIComponent(searchQuery), per_page: MAX_RESULTS } }, function(discogs) {
					dbg("[QuerySuggest] Got data back");
					if(!discogs.results || discogs.results.length === 0) {
						$("#gksi_suggest_data").html("Désolé, rien trouvé !");
						return;
					}
					var suggestionsHtml = "";
					$.each(discogs.results, function(_, entry) {
						suggestionsHtml += '<a href="http://discogs.com' + entry.uri + '" target="_blank">[' + entry.type + '] ' + entry.title + '</a><br />';
					});
					// { id, classes, title, header, data, relativeToId, relativeToObj, relativeToWindow, top, left, css, buttons = [ /* close is by default */ { b_id, b_text, b_callback} ], underButtonsText }
					$("#gksi_suggest_data").html(suggestionsHtml);
				});
			}
		};

		dbg("[Init] Starting");
		// Execute functions

		if(opt.get(module_name, "imdb_suggest")) {
			if(pageUrl.params && pageUrl.params.category && pageUrl.params.category == "39") { // FLAC 
				suggestDiscogsMore();
			}
			else {
				suggestMore();
			}
		}

		dbg("[Init] Ready");
	}
};