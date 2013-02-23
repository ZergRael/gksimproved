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
		{ path_name: "/", options: { buttons: '#sort' } },
		{ path_name: "/browse/", options: { buttons: '#sort p' } },
		{ path_name: "/sphinx/", options: { buttons: 'form[name="getpack"] div', canSuggest: true } },
	],
	loaded: false,
	loadModule: function(mOptions) {
		this.loaded = true;
		var module_name = this.name;
		var dbg = function(str) {
			_dbg(module_name, str);
		}

		dbg("[Init] Loading module");

		var filterFL = function() {
			if(!opt.get(module_name, "filtering_fl")) {
				return;
			}

			dbg("[FLFilter] Scanning for FL");
			var hideNext = false;
			var odd = true;
			var removeHead = false;
			$("tbody tr").each(function() {
				if($(this).hasClass("head_torrent")) {
					// Remove head if ajax or already found
					if(removeHead) {
						$(this).hide();
					}
					else {
						removeHead = true;
					}
					return;
				}

				odd = !odd;
				
				if(odd && hideNext) {
					hideNext = false;
					$(this).hide();
					return;
				}

				var imgs = $(this).find("img");
				var hideMe = true;
				$.each(imgs, function() {
					if($(this).attr("alt") == "FreeLeech") {
						hideMe = false;
						return false;
					}
				});
				if(hideMe) {
					hideNext = true;
					$(this).hide();
				}
			});
			dbg("[FLFilter] Ended filtering");
		};

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
					if(!dateMatch.length) { // This should never happen
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
			dbg("[AgeCol] Ended");
		};

		var suggestMore = function() {
			var searchQuery = $("#searchinput").val();
			if(searchQuery) {
				dbg("[QuerySuggest] Query : " + searchQuery);
				// Try to get some results from IMDB: 4 + 4 max
				grabPage({ host: "https://thetabx.net", path: "/gksi/imdbproxy/get/" + encodeURIComponent(searchQuery) + "/2" }, function(data) {
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
							suggestionsStr += '<a href="' + craftUrl({ host: url.host, path: url.path, params: { q: encodeURIComponent(movieName) } }) + '">' + movieName + '</a><br />';
						}
					});
					appendFrame({ title: "GKSi IMDB Suggestions", data: suggestionsStr, id: "suggest", relativeToId: "searchinput", top: -14, left: 400 });
					if(opt.get(module_name, "imdb_auto_add") && modules.endless_scrolling.maxPage === true) {
						dbg("[QueryTranslate] Looks like we can grab bestTranslation [" + imdb.translateBest + "] results");
						var bestMatchUrl = url;
						bestMatchUrl.params.q = encodeURIComponent(imdb.translateBest); // From remote translation analysis - levenshtein
						$("#torrent_list").before('<p class="pager_align page_loading"><img src="' + chrome.extension.getURL("images/loading.gif") + '" /><br />Recherche supraluminique des traductions</p>');
						grabPage(bestMatchUrl, function(data) {
							var dataFrame = $(data).find("#torrent_list");
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
								filterFL();
								addAgeColumn();
							}
							else {
								dbg("[QueryTranslate] Or maybe not (no results)");
							}
							dbg("[QueryTranslate] Ended");
							$(".page_loading").remove();
						});
					}
				}, 'json');
			}
		};

		var torrentButtons = '<input id="filter_fl" type="checkbox" ' + (opt.get(module_name, "filtering_fl") ? 'checked="checked" ' : ' ') + '/><label for="filter_fl">Afficher les FL uniquement</label> | ';

		dbg("[Init] Starting");
		// Adding buttons
		$(mOptions.buttons).prepend(torrentButtons);

		// FreeLeech torrents filtering
		$("#filter_fl").change(function() {
			opt.set(module_name, "filtering_fl", $(this).attr("checked") == "checked" ? true : false);
			dbg("[FilterFL] is " + opt.get(module_name, "filtering_fl"));
			if(opt.get(module_name, "filtering_fl")) {
				filterFL();
				$(document).trigger("es_dom_process_done");
			}
			else {
				dbg("[FLFilter] Unfiltering FL");
				$("#torrent_list tr").show();
				dbg("[FLFilter] Ended unfiltering");
				$(document).trigger("es_dom_process_done");
			}
		});
		filterFL();
		addAgeColumn();

		if(mOptions.canSuggest && opt.get(module_name, "imdb_suggest")) {
			suggestMore();
		}

		$(document).on("endless_scrolling_insertion_done", function() {
			dbg("[endless_scrolling] Module specific functions");
			filterFL();
			addAgeColumn();
			$(document).trigger("es_dom_process_done");
		});

		dbg("[Init] Ready");
	}
};