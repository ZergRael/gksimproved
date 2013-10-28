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
						refreshFilters(true);
						forceIdLinks();
					}
					else {
						dbg("[auto_refresh] No data");
					}
				});
			}, mOptions.auto_refresh_interval);
		};

		var filtersArray = {
			"uploads_filter":      { className: "log_upload" },
			"delete_filter":       { className: "log_upload_delete" },
			"edit_filter":         { className: "log_upload_edit" },
			"request_filter":      { className: "log_requests_new" },
			"request_fill_filter": { className: "log_requests_filled" },
			"summary_edit_filter": { className: "log_summary_edit" },
			"summary_new_filter":  { className: "log_summary_new" }
		};

		var initFilters = function() {
			$.each(filtersArray, function(filter, filterData) {
				filterData.show = !opt.get(module_name, filter);
				filterData.lastStatus = filterData.show;
			})
		};

		var refreshFilters = function(notAnInput) {
			dbg("[*_filter] Refresh");
			$.each(filtersArray, function(filter, filterData) {
				filterData.show = !opt.get(module_name, filter);
				if(notAnInput || filterData.show != filterData.lastStatus) {
					if(filterData.show) {
						$("#log_list span." + filterData.className).parents("tr").show();
					}
					else {
						$("#log_list span." + filterData.className).parents("tr").hide();
					}
					filterData.lastStatus = filterData.show;
				}
			});
			dbg("[*_filter] Done");
			$(document).trigger("es_dom_process_done");
		};

		var forceIdLinks = function() {
			dbg("[id_links] Refresh");
			$(".log_upload, .log_upload_edit").each(function() {
				$(this).html($(this).html().replace(/Torrent (\d+)/, 'Torrent <a href="/torrent/$1/">$1</a>'));
			});
			$(".log_summary_new, .log_summary_edit").each(function() {
				$(this).html($(this).html().replace(/Summary (\d+)/, 'Summary <a href="/summary/id=$1">$1</a>'));
			});
			$(".log_requests_new").each(function() {
				$(this).html($(this).html().replace(/Request : ([^<]+)/, 'Request : <a href="/req/?q=$1">$1</a>'));
			});
			$(".log_requests_filled").each(function() {
				$(this).html($(this).html().replace(/Request ([^<]+) filled./, 'Request <a href="/req/?q=$1">$1</a> filled.'));
			});
			dbg("[id_links] Done");
		};

		var updateBottomText = function() {
			var bottomP = $("#contenu p:last");
			if(!$("#filtered_text").length) {
				bottomP.html(bottomP.html().trim());
				bottomP.append('<span id="filtered_text"></span>');
				dbg("[bottomText] Ready");
			}
			$("#filtered_text").text(", " + ($("tbody tr:visible").length - 1) + " après filtrage.");
			dbg("[bottomText] Updated");
		};

		dbg("[Init] Starting");
		// Execute functions

		var buttons = '<input id="uploads_filter" class="gksi_filter" type="checkbox" ' + (!opt.get(module_name, "uploads_filter") ? 'checked="checked" ' : ' ') + '/><label for="uploads_filter">Uploads</label> | ';
		buttons += '<input id="delete_filter" class="gksi_filter" type="checkbox" ' + (!opt.get(module_name, "delete_filter") ? 'checked="checked" ' : ' ') + '/><label for="delete_filter">Delete</label> | ';
		buttons += '<input id="edit_filter" class="gksi_filter" type="checkbox" ' + (!opt.get(module_name, "edit_filter") ? 'checked="checked" ' : ' ') + '/><label for="edit_filter">Edits</label> | ';
		buttons += '<input id="request_filter" class="gksi_filter" type="checkbox" ' + (!opt.get(module_name, "request_filter") ? 'checked="checked" ' : ' ') + '/><label for="request_filter">Requests</label> | ';
		buttons += '<input id="request_fill_filter" class="gksi_filter" type="checkbox" ' + (!opt.get(module_name, "request_fill_filter") ? 'checked="checked" ' : ' ') + '/><label for="request_fill_filter">Requests filled</label> | ';
		buttons += '<input id="summary_edit_filter" class="gksi_filter" type="checkbox" ' + (!opt.get(module_name, "summary_edit_filter") ? 'checked="checked" ' : ' ') + '/><label for="summary_edit_filter">Summary edit</label> | ';
		buttons += '<input id="summary_new_filter" class="gksi_filter" type="checkbox" ' + (!opt.get(module_name, "summary_new_filter") ? 'checked="checked" ' : ' ') + '/><label for="summary_new_filter">Summary new</label> | ';
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

		$(".gksi_filter").change(function() {
			opt.set(module_name, $(this).attr("id"), !$(this).prop("checked"));
			refreshFilters();
			$(document).trigger("scroll");
			if(pageUrl.params && pageUrl.params.q) {
				updateBottomText();
			}
		});

		if(opt.get(module_name, "auto_refresh")) {
			dbg("[auto_refresh] Starting");
			autoRefresh();
		}

		$(document).on("endless_scrolling_insertion_done", function() {
			dbg("[endless_scrolling] Module specific functions");
			refreshFilters(true);
			forceIdLinks();
			$(document).trigger("scroll");
		});

		initFilters();
		refreshFilters(true);
		forceIdLinks();

		if(pageUrl.params && pageUrl.params.q) {
			updateBottomText();
		}

		dbg("[Init] Ready");
	}
};