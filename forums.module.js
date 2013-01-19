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
modules.forums = {
	name: "forums",
	pages: [
		{ path_name: "/forums.php", params: { action: 'viewforum' }, options: { buttons: '.linkbox:first', loading: '.thin table', domList: '.thin tr:last', domData: 'tbody tr', scrollOffset: 180, endOfStream: 'No posts to display!' } },
		{ path_name: "/forums.php", params: { action: 'viewtopic' }, options: { buttons: '.linkbox:first', loading: '.thin table:last', domList: '.thin table:last', domData: '.thin table', scrollOffset: 600 } }
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

		var backTopButtonOffset = 100;
		var loadingPage = false;
		var nextPage = (url.params && url.params.page ? Number(url.params.page) + 1 : 2);
		var endless_scrolling = opt.get(module_name, "endless_scrolling");
		var jOnScroll = function() {
			if(!endless_scrolling || ignoreScrolling) {
				return;
			}

			dbg("[EndlessScrolling] Scrolled");
			if((document.body.scrollTop + window.innerHeight > document.body.scrollHeight - mOptions.scrollOffset) && !loadingPage) {
				dbg("[EndlessScrolling] Loading next page (" + nextPage + ")");
				loadingPage = true;

				var nextUrl = url;
				nextUrl.params = nextUrl.params ? nextUrl.params : {};
				nextUrl.params.page = nextPage;
				$(mOptions.loading).after('<p class="pager_align" id="page_loading"><img src="' + chrome.extension.getURL("images/loading.gif") + '" /><br />Réticulation des méta-données de la page suivante</p>');
				grabPage(nextUrl, function(data) {
					dataGrabbed = $(data).find(mOptions.domData)
					dbg("[EndlessScrolling] Grab ended")
					if(dataGrabbed && dataGrabbed.length && !(mOptions.endOfStream && dataGrabbed.text().indexOf(mOptions.endOfStream) != -1)) {
						dbg("[EndlessScrolling] Got data - Inserting")
						$(mOptions.domList).after(dataGrabbed);
						nextPage++;
						loadingPage = false;
						$(".colhead:not(:first)").remove();
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

		dbg("[Init] Starting");
		// Execute functions

		var buttons = '<div class="gksi_buttons"><input id="endless_scrolling" type="checkbox" ' + (endless_scrolling ? 'checked="checked" ' : ' ') + '/> Endless scrolling</div>';
		$(mOptions.buttons).before(buttons);

		$("#endless_scrolling").change(function() {
			endless_scrolling = $(this).attr("checked") == "checked" ? true : false;
			dbg("[EndlessScrolling] is " + endless_scrolling);
			opt.set(module_name, "endless_scrolling", endless_scrolling);
		});
		$(document).scroll(jOnScroll);

		dbg("[Init] Ready");
	}
};