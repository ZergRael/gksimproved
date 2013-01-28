
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
modules.logs = {
	name: "logs",
	pages: [
		{ path_name: "/logs/", options: { buttons: '#head_notice_left', loading: '.pager_align', lastPage: '.pager_align', auto_refresh_interval: 60000 } }
	],
	loaded: false,
	loadModule: function(mOptions) {
		this.loaded = true;
		var module_name = this.name;
		var dbg = function(str) {
			_dbg(module_name, str);
		};

		dbg("[Init] Loading module");
		// Loading all functions used

		var auto_refresh = opt.get(module_name, "auto_refresh");
		var refreshTimer = false;
		var autoRefresh = function() {
			if(url.params && url.params.page != "0") {
				dbg("[auto_refresh] Not first page");
				return;
			}

			dbg("[auto_refresh] Grabing this page");
			grabPage(url, function(data) {
				logsTR = $(data).find("tbody tr");
				dbg("[auto_refresh] Got data");
				if(logsTR && logsTR.length) {
					var firstTR = $("tbody tr:nth(1)");
					var foundFirst = false;
					$(logsTR.get().reverse()).each(function() {
						if($(this).text() == firstTR.text()) {
							foundFirst = true;
							return;
						}
						if(foundFirst && !$(this).find(".date_head").length) {
							$("tbody tr:first").after($(this));
							$("tbody tr:last").remove();
						}
					});
				}
				else {
					dbg("[auto_refresh] No data");
				}
			});

			refreshTimer = setTimeout(autoRefresh, mOptions.auto_refresh_interval);
		};

		var endless_scrolling = opt.get(module_name, "endless_scrolling");
		var scrollOffset = 260;
		var backTopButtonOffset = 100;
		var loadingPage = false;
		var wentToPageBottom = false;
		var nextPage = (url.params && url.params.page ? Number(url.params.page) + 1 : 1);
		var jOnScroll = function() {
			if(!endless_scrolling || ignoreScrolling) {
				return;
			}

			if(document[$.browser.mozilla ? "documentElement" : "body"].scrollTop > backTopButtonOffset) {
				$("#backTopButton").show();
			}
			else {
				$("#backTopButton").hide();
			}

			if(maxPage === true || nextPage >= maxPage) {
				return;
			}

			if(document[$.browser.mozilla ? "documentElement" : "body"].scrollTop + window.innerHeight >= document.documentElement.scrollHeight) {
				dbg("[EndlessScrolling] Stop inserting, got to page bottom");
				wentToPageBottom = true;
			}

			dbg("[EndlessScrolling] Scrolled");
			if((document[$.browser.mozilla ? "documentElement" : "body"].scrollTop + window.innerHeight > document.documentElement.scrollHeight - scrollOffset) && !loadingPage) {
				dbg("[EndlessScrolling] Loading next page");
				loadingPage = true;

				var nextUrl = url;
				if(mOptions.path) {
					nextUrl.path = mOptions.path;
				}
				nextUrl.params = nextUrl.params ? nextUrl.params : {};
				nextUrl.params.page = nextPage;
				$(mOptions.loading).before('<p class="pager_align page_loading"><img src="' + chrome.extension.getURL("images/loading.gif") + '" /><br />Réticulation des méta-données de la page suivante</p>');
				grabPage(nextUrl, function(data) {
					logsTR = $(data).find("tbody tr");
					dbg("[EndlessScrolling] Grab ended")
					if(logsTR && logsTR.length) {
						insertAjaxData(logsTR);
					}
					else {
						dbg("[EndlessScrolling] No more data");
						$(".page_loading").text("Plus rien en vue cap'tain !");
					}
				});
			}
		};

		var insertAjaxData = function(data) {
			if(wentToPageBottom) {
				dbg("[EndlessScrolling] Waiting for user confirmation in order to insert more");
				$(".page_loading").html('<a href="#" class="resume_endless_scrolling">Reprendre l\'endless scrolling</a>');
				$(".resume_endless_scrolling").click(function() {
					wentToPageBottom = false;
					insertAjaxData(data);
					return false;
				});
				return;
			}
			dbg("[EndlessScrolling] Got data - Inserting");
			$("tbody").append(data);
			$(".date_head:not(:first)").parent().remove();
			nextPage++;
			loadingPage = false;
			$(".page_loading").remove();
		};

		var maxPage = false;
		var getMaxPage = function() {
			var pagesList = $(mOptions.lastPage);
			if(!pagesList.length) {
				maxPage = true;
			}
			else {
				maxPage = Number(pagesList.text().match(/(\d+) ?$/)[1]);
			}
			dbg("[max_page] " + maxPage);
		};

		dbg("[Init] Starting");
		// Execute functions

		var buttons = '<input id="auto_refresh" type="checkbox" ' + (auto_refresh ? 'checked="checked" ' : ' ') + '/> Auto refresh (60secs) | <input id="endless_scrolling" type="checkbox" ' + (endless_scrolling ? 'checked="checked" ' : ' ') + '/> Endless scrolling | ';
		$(mOptions.buttons).prepend(buttons);

		$("#auto_refresh").change(function() {
			auto_refresh = $(this).attr("checked") == "checked" ? true : false;
			dbg("[auto_refresh] is " + auto_refresh);
			opt.set(module_name, "auto_refresh", auto_refresh);
			if(auto_refresh) {
				autoRefresh();
			}
			else {
				clearTimeout(refreshTimer);
			}
		});
		if(auto_refresh) {
			dbg("[auto_refresh] Starting");
			refreshTimer = setTimeout(autoRefresh, mOptions.auto_refresh_interval);
		}

		if(mOptions.lastPage) {
			getMaxPage();
		}

		$("#endless_scrolling").change(function() {
			endless_scrolling = $(this).attr("checked") == "checked" ? true : false;
			dbg("[endless_scrolling] is " + endless_scrolling);
			opt.set(module_name, "endless_scrolling", endless_scrolling);
		});
		$(document).scroll(jOnScroll);

		dbg("[Init] Ready");
	}
};