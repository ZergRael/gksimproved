
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

			refreshTimer = setInterval(function() {
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
						refreshFilters();
					}
					else {
						dbg("[auto_refresh] No data");
					}
				});
			}, mOptions.auto_refresh_interval);
		};

		var filtersArray = { "uploads_filter": "log_upload", "delete_filter": "log_upload_delete", "edit_filter": "log_upload_edit", "request_filter": "log_requests_new" };
		var onFilterChange = function() {
			var changedFilter = $(this).attr("id");
			$("#log_list tr").show();
			$.each(filtersArray, function(filter, logClass) {
				if(filter != changedFilter && $("#" + filter).prop("checked")) {
					$("#" + filter).prop("checked", false);
					opt.set(module_name, filter, false);
				}
			});

			opt.set(module_name, changedFilter, $(this).prop("checked"));
			refreshFilters();
		};

		var refreshFilters = function() {
			dbg("[*_filter] Refresh");
			$.each(filtersArray, function(filter, logClass) {
				if(opt.get(module_name, filter)) {
					$("#log_list span:not(." + logClass + ")").parent().parent().hide();
				}
			});
			dbg("[*_filter] Done");
			$(document).trigger("es_dom_process_done");
		};

		var forceIdLinks = function() {
			dbg("[id_links] Refresh");
			$(".log_upload, .log_upload_edit").each(function() {
				$(this).html($(this).html().replace(/Torrent (\d+)/, 'Torrent <a href="/torrent/$1/">$1</a>'));
				/*var txtUpload = $(this).html();
				var iDmatch = txtUpload.match(/Torrent (\d+)/);
				if(iDmatch) {
					$(this).html(txtUpload.replace(iDmatch[1], '<a href="/torrent/' + iDmatch[1] + '/">' + iDmatch[1] + '</a>'));
				}*/
			});
			dbg("[id_links] Done");
		};

		dbg("[Init] Starting");
		// Execute functions

		var buttons = '<input id="uploads_filter" class="gksi_filter" type="checkbox" ' + (opt.get(module_name, "uploads_filter") ? 'checked="checked" ' : ' ') + '/><label for="uploads_filter">Filtre uploads</label> | ';
		buttons += '<input id="delete_filter" class="gksi_filter" type="checkbox" ' + (opt.get(module_name, "delete_filter") ? 'checked="checked" ' : ' ') + '/><label for="delete_filter">Filtre delete</label> | ';
		buttons += '<input id="edit_filter" class="gksi_filter" type="checkbox" ' + (opt.get(module_name, "edit_filter") ? 'checked="checked" ' : ' ') + '/><label for="edit_filter">Filtre edits</label> | ';
		buttons += '<input id="request_filter" class="gksi_filter" type="checkbox" ' + (opt.get(module_name, "request_filter") ? 'checked="checked" ' : ' ') + '/><label for="request_filter">Filtre requests</label> | ';
		buttons += '<input id="auto_refresh" type="checkbox" ' + (opt.get(module_name, "auto_refresh") ? 'checked="checked" ' : ' ') + '/><label for="auto_refresh">Auto refresh (60secs)</label> | ';
		$(mOptions.buttons).prepend(buttons);

		$("#auto_refresh").change(function() {
			opt.set(module_name, "auto_refresh", $(this).attr("checked") == "checked" ? true : false);
			dbg("[auto_refresh] is " + opt.get(module_name, "auto_refresh"));
			if(opt.get(module_name, "auto_refresh")) {
				autoRefresh();
			}
			else {
				clearInterval(refreshTimer);
			}
		});

		$(".gksi_filter").change(onFilterChange);

		if(opt.get(module_name, "auto_refresh")) {
			dbg("[auto_refresh] Starting");
			autoRefresh();
		}

		$(document).on("endless_scrolling_insertion_done", function() {
			dbg("[endless_scrolling] Module specific functions");
			refreshFilters();
			forceIdLinks();
		});

		refreshFilters();
		forceIdLinks();

		dbg("[Init] Ready");
	}
};