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
			utils.dbg(module_name, str);
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