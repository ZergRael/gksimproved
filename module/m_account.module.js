modules.m_account = {
	name: "m_account",
	dText: "Account",
	pages: [
		{ path_name: "/m/account/.*" , options: { signature_input: "#quickpost", customMenu_input: "#blockleft", previewDelay: 600 } }
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

		var lastSignatureInput;
		var onSignatureUpdate = function() {
			var input = $(this).val();
			var outputArea = $("#signature_preview");
			if(!outputArea.length) {
				$(this).after('<div id="signature_preview"></div>');
				outputArea = $("#signature_preview");
			}

			var lastInput;
			if(lastSignatureInput != input) {
				utils.delay(function() {
					utils.post({ host: pageUrl.host, path: "/ajax.php", params: { action: "preview" }}, { body: input }, function(data) {
						outputArea.html(data);
					});
				}, mOptions.previewDelay);
				lastSignatureInput = input;
			}
		};

		var lastCustomMenuInput;
		var onCustomMenuUpdate = function() {
			var input = $(this).val();
			if(lastCustomMenuInput != input) {
				utils.delay(function() {
					utils.post({ host: pageUrl.host, path: "/ajax.php", params: { action: "preview" }}, { body: input }, function(data) {
						$("#custom_menu").html(data);
					});
				}, mOptions.previewDelay);
				lastCustomMenuInput = input;
			}
		};

		dbg("[Init] Starting");
		// Execute functions

		if(pageUrl.path == "/m/account/settingsinfos") {
			$(mOptions.signature_input).keyup(onSignatureUpdate);
			$(mOptions.customMenu_input).keyup(onCustomMenuUpdate);
			$(mOptions.signature_input).trigger("keyup");
			lastCustomMenuInput = $(mOptions.customMenu_input).val();
		}

		dbg("[Init] Ready");
	}
};