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
		{ path_name: "/", options: { buttons: '#sort', loading: '#pager_index', path: '/browse/' } },
		{ path_name: "/browse/", options: { buttons: '#sort p', loading: '.pager_align' } },
		{ path_name: "/sphinx/", options: { buttons: 'form[name="getpack"] div', loading: '.pager_align', canSuggest: true } },
	],
	loaded: false,
	loadModule: function(mOptions) {
		this.loaded = true;
		var module_name = this.name;
		var dbg = function(str) {
			_dbg(module_name, str);
		}

		dbg("[Init] Loading module");

		var endless_scrolling = opt.get(module_name, "endless_scrolling");
		var scrollOffset = 260;
		var backTopButtonOffset = 100;
		var loadingPage = false;
		var nextPage = (url.params && url.params.page ? Number(url.params.page) + 1 : 1);
		var jOnScroll = function() {
			if(endless_scrolling && ! ignoreScrolling) {
				dbg("[EndlessScrolling] Scrolled");
				if((document.body.scrollTop + window.innerHeight > document.body.scrollHeight - scrollOffset) && !loadingPage) {
					dbg("[EndlessScrolling] Loading next page");
					loadingPage = true;

					var nextUrl = url;
					if(mOptions.path) {
						nextUrl.path = mOptions.path;
					}
					nextUrl.params = nextUrl.params ? nextUrl.params : {};
					nextUrl.params.page = nextPage;
					$(mOptions.loading).before('<p class="pager_align" id="page_loading"><img src="' + chrome.extension.getURL("images/loading.gif") + '" /><br />Réticulation des méta-données de la page suivante</p>');
					grabPage(nextUrl, function(data) {
						torrentsTR = $(data).find("#torrent_list tr")
						dbg("[EndlessScrolling] Grab ended")
						if(torrentsTR && torrentsTR.length) {
							dbg("[EndlessScrolling] Got data - Inserting")
							$("#torrent_list").append(filterFL(torrentsTR, true));
							nextPage++;
							loadingPage = false;
							$("#page_loading").remove();
						}
						else {
							dbg("[EndlessScrolling] No more data");
							$("#page_loading").text("Plus rien en vue cap'tain !");
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

		var filtering_fl = opt.get(module_name, "filtering_fl");;
		var filterFL = function(data, removeHead) {
			if(!filtering_fl) {
				return data;
			}

			dbg("[FLFilter] Scanning for FL");
			var hideNext = false;
			var odd = true;
			$(data).each(function() {
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

				if(!$(this).find("img[src*='freeleech.png']").length) {
					hideNext = true;
					$(this).hide();
				}
			});
			dbg("[FLFilter] Ended filtering");
			return data;
		};

		var imdb_suggest = opt.get(module_name, "imdb_suggest");
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

		var torrentButtons = '<input id="filter_fl" type="checkbox" ' + (filtering_fl ? 'checked="checked" ' : ' ') + '/> Afficher les FL uniquement | <input id="endless_scrolling" type="checkbox" ' + (endless_scrolling ? 'checked="checked" ' : ' ') + '/> Endless scrolling | ';

		dbg("[Init] Starting");
		// Adding buttons
		$(mOptions.buttons).prepend(torrentButtons);

		// FreeLeech torrents filtering
		$("#filter_fl").change(function() {
			filtering_fl = $(this).attr("checked") == "checked" ? true : false;
			dbg("[FilterFL] is " + filtering_fl);
			opt.set(module_name, "filtering_fl", filtering_fl);
			if(filtering_fl) {
				filterFL($("#torrent_list tr"));
			}
			else {
				dbg("[FLFilter] Unfiltering FL");
				$("#torrent_list tr").show();
				dbg("[FLFilter] Ended unfiltering");
			}
		});
		filterFL($("#torrent_list tr"));

		// Endless scrolling
		$("#endless_scrolling").change(function() {
			endless_scrolling = $(this).attr("checked") == "checked" ? true : false;
			dbg("[EndlessScrolling] is " + endless_scrolling);
			opt.set(module_name, "endless_scrolling", endless_scrolling);
		});
		$(document).scroll(jOnScroll);

		if(mOptions.canSuggest && imdb_suggest) {
			suggestMore();
		}

		dbg("[Init] Ready");
	}
};