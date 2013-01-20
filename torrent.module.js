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
modules.torrent = {
	name: "torrent",
	pages: [
		{ path_name: "/torrent/\\d+/.*/?", options: { buttons: '#torrent_comments', loading: '#torrent_comments p:last' } }
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

		appendNativeScript("https://s.gks.gs/static/js/forums.js?v=2");

		var torrentId = url.path.match(/\/torrent\/(\d+)/)[1];

		var quick_comment = opt.get(module_name, "quick_comment");
		var appendQuickComment = function() {
			$("#quickpost").remove();
			if(!quick_comment || !$(mOptions.loading).find('a').length) {
				return;
			}

			dbg("[QuickComment] Grabbing quickcomment textarea");
			$(mOptions.loading).hide();
			$(mOptions.loading).after('<p class="pager_align page_loading"><img src="' + chrome.extension.getURL("images/loading.gif") + '" /><br />Protonisation des entrailles du quick comment</p>');
			var urlQuickComment = { host: url.host, path: "/com/", params: { id: torrentId } };

			grabPage(urlQuickComment, function(data) {
				$(".page_loading").remove();
				$(mOptions.loading).after($(data).find("#com"));
				$("#twit_autoc").trigger("reactivateKeydownListenner");
			});
		};

		dbg("[Init] Starting");
		// Execute functions

		var buttons = '<input id="quick_comment" type="checkbox" ' + (quick_comment ? 'checked="checked" ' : ' ') + '/> Quick comment direct';
		$(mOptions.buttons).before(buttons);

		$("#quick_comment").change(function() {
			quick_comment = $(this).attr("checked") == "checked" ? true : false;
			dbg("[QuickComment] is " + quick_comment);
			opt.set(module_name, "quick_comment", quick_comment);

			if(quick_comment) {
				appendQuickComment();
			}
			else {
				$("#com").remove();
				$(mOptions.loading).show();
			}
		});

		appendQuickComment();

		dbg("[Init] Ready");
	}
};