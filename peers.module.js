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
modules.peers = {
	name: "peers",
	pages: [
		{ path_name: "/m/peers/" }
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

		dbg("[Init] Starting");
		// Execute functions

		$(document).on("endless_scrolling_insertion_done", function() {
			dbg("[endless_scrolling] Module specific functions");
			dbg("[endless_scrolling] Updating table sorting");
			insertScript("table_sorting", function() {
				$("#mypeers").trigger("update");
			}, true);
			$(document).trigger("es_dom_process_done");
		});

		dbg("[Init] Ready");
	}
};