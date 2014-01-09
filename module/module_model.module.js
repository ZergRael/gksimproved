modules.module_ = {
	name: "module_",
	dText: "DisplayedText Module_",
	pages: [
		{ path_name: "/.*/", params: { query: 'value' }, options: { option: 'value' } }
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

		dbg("[Init] Starting");
		// Execute functions

		var buttons = '<input id="but_id" type="checkbox" ' + (o ? 'checked="checked" ' : ' ') + '/><label for="but_id">Text</label>';
		$(mOptions.buttons).before(buttons);

		$("#but_id").change(function() {
			opt.set(module_name, "o", $(this).prop("checked"));
			dbg("[o] is %s", o);
		});

		dbg("[Init] Ready");
	}
};