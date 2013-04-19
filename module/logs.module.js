
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
		{ path_name: "/logs/", options: { buttons: '#head_notice_left', auto_refresh_interval: 60000 } }
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

		var refreshTimer = false;
		var autoRefresh = function() {
			if(pageUrl.params && pageUrl.params.page != "0") {
				dbg("[auto_refresh] Not first page");
				return;
			}

			dbg("[auto_refresh] Grabing this page");
			utils.grabPage(pageUrl, function(data) {
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

		dbg("[Init] Starting");
		// Execute functions

		var buttons = '<input id="auto_refresh" type="checkbox" ' + (opt.get(module_name, "auto_refresh") ? 'checked="checked" ' : ' ') + '/><label for="auto_refresh">Auto refresh (60secs)</label> | ';
		$(mOptions.buttons).prepend(buttons);

		$("#auto_refresh").change(function() {
			opt.set(module_name, "auto_refresh", $(this).attr("checked") == "checked" ? true : false);
			dbg("[auto_refresh] is " + opt.get(module_name, "auto_refresh"));
			if(opt.get(module_name, "auto_refresh")) {
				autoRefresh();
			}
			else {
				clearTimeout(refreshTimer);
			}
		});

		if(opt.get(module_name, "auto_refresh")) {
			dbg("[auto_refresh] Starting");
			refreshTimer = setTimeout(autoRefresh, mOptions.auto_refresh_interval);
		}

		dbg("[Init] Ready");
	}
};