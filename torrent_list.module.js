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

		var maxSuggestLang = 4;
		var suggestMore = function() {
			var searchQuery = $("#searchinput").val();
			if(searchQuery) {
				dbg("[QuerySuggest] Query : " + searchQuery);
				grabPage({ host: "https://thetabx.net", path: "/gksi/imdbproxy/get/" + encodeURIComponent(searchQuery) }, function(data) {
					dbg("[QuerySuggest] Got data back");
					var imdb = JSON.parse(data);
					var suggestions = [];
					$.each(imdb, function(lang, sections) {
						dbg("[QuerySuggest] Scanning " + lang + " DB");
						var iSuggests = 0;
						$.each(sections, function(section, movies) {
							$.each(movies, function(i, movie) {
								suggestions.push(movie.title);
								iSuggests++;
								if(iSuggests >= maxSuggestLang) {
									return false;
								}
							});
							if(iSuggests >= maxSuggestLang) {
								return false;
							}
						});
					});
					var suggestionsStr = "";
					$.map(suggestions, function(movieName, i) {
						if($.inArray(movieName, suggestions) === i) {
							suggestionsStr += '<a href="' + craftUrl({ host: url.host, path: url.path, params: { q: encodeURIComponent(movieName) } }) + '">' + movieName + '</a><br />';
						}
					});
					appendFrame({ title: "GKSi IMDB Suggestions", data: suggestionsStr, id: "suggest", relativeToId: "searchinput", top: -8, left: 400 });
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
			}
			else {
				dbg("[FLFilter] Unfiltering FL");
				$("#torrent_list tr").show();
				dbg("[FLFilter] Ended unfiltering");
			}
		});
		filterFL();

		if(mOptions.canSuggest && opt.get(module_name, "imdb_suggest")) {
			suggestMore();
		}

		$(document).on("endless_scrolling_insertion_done", function() {
			dbg("[endless_scrolling] Module specific functions");
			filterFL();
		});

		dbg("[Init] Ready");
	}
};