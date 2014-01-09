modules.wiki = {
	name: "Wiki",
	dText: "Wiki",
	pages: [
		{ path_name: "/wiki/", params: { edit: true }, options: { isEditing: true } }
	],
	loaded: false,
	loadModule: function(mOptions) {
		this.loaded = true;
		var module_name = this.name;
		var dbg = function() {
			utils.dbg(module_name, arguments);
		};

		dbg("[Init] Loading module");
		// Loading all functions used

		var prependBBCode = function() {
			var urlBBCodeButtons = { host: pageUrl.host, path: "/tags/" };
			var wikiEdit = $("#wiki_edit form");
			dbg("[prependBBCode] Started");

			if(wikiEdit && wikiEdit.length) {
				wikiEdit.find("textarea").addClass("bbcode-target");
				utils.grabPage(urlBBCodeButtons, function(data) {
					wikiEdit.before($(data).find(".bbsmiles"));
					$(document).trigger("reactivate_keydown_listenner");
					dbg("[prependBBCode] Ready");
				});
			}
		};

		dbg("[Init] Starting");
		// Execute functions

		if(mOptions.isEditing) {
			prependBBCode();
		}

		dbg("[Init] Ready");
	}
};