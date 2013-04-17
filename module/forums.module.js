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
	dText: "Forums",
	pages: [
		{ path_name: "/forums.php", params: { action: 'viewforum' }, options: { buttons: '.linkbox:first' } },
		{ path_name: "/forums.php", params: { action: 'viewtopic' }, options: { buttons: '.linkbox:first', canHideSig : true } }
	],
	loaded: false,
	loadModule: function(mOptions) {
		this.loaded = true;
		var module_name = this.name;
		var dbg = function(str) {
			utils.dbg(module_name, str);
		};

		dbg("[Init] Loading module");
		// Loading all functions used

		var filterSignatures = function() {
			if(!mOptions.canHideSig || !opt.get(module_name, "hidable_sigs")) {
				return;
			}

			dbg("[hide_signatures] Processing data");
			$(".body div").each(function() {
				$(this).html($(this).html().replace("- - - - -", '<a class="toggleSignature" href="#">- - - - -</a><div class="signature">'));
				$(this).append("</div>");
				if(opt.get(module_name, "hide_signatures")) {
					$(this).find(".signature").hide();
				}
			});

			dbg("[hide_signatures] Process ended");
		};

		dbg("[Init] Starting");
		// Execute functions

		if(mOptions.canHideSig) {
			$(".toggleSignature").live("click", function() {
				dbg("[hide_signatures] Toggle signature");
				$(this).parent().find(".signature").toggle();
				return false;
			});
		}
		filterSignatures();

		$(document).on("endless_scrolling_insertion_done", function() {
			dbg("[endless_scrolling] Module specific functions");
			$(document).trigger("recolor_twits");
			filterSignatures();
			$(document).trigger("es_dom_process_done");
		});

		dbg("[Init] Ready");
	}
};