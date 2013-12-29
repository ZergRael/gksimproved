var startAll = function() {
	// Insert custom CSS
	insertCSS();
	$.each(modules, function(module_name, m) {
		if(!m.pages) {
			m.loadModule();
			return;
		}

		$.each(m.pages, function(i, p) {
			if(m.loaded) {
				return false;
			}

			if(pageUrl.path.search("^" + p.path_name + "$") != -1) {
				if(!p.params) {
					m.loadModule(p.options);
					return false;
				}

				if(!pageUrl.params) {
					return;
				}

				var validParams = 0;
				$.each(p.params, function(q, v) {
					if(pageUrl.params[q] && (pageUrl.params[q] == v || v == '*')) {
						validParams++;
					}
				});

				if(Object.keys(p.params).length == validParams) {
					m.loadModule(p.options);
				}
			}
		});
	});
	$(document).trigger("scroll").trigger("gksi_ready");
};

var requiredLoads = 2;
var warmUp = function() {
	if(--requiredLoads == 0) {
		startAll();
	}
};

if($("#body").length) {
	dbg("[Loaded] Started");
	// Load all options
	opt.load(warmUp);
	// Load global saved data
	gData.load(warmUp);
}