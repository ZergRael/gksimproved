modules.pins = {
	name: "pins",
	dText: "Pins",
	pages: [
		{ path_name: "/karma/", options: { tab: 'pins' } }
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

		var tagPins = function() {
			// Tag every pins once and for all, we won't need any further parsing
			$("#pins tbody td").each(function() {
				if($(this).text().indexOf("Pas assez de Karma") != -1) {
					$(this).addClass("tooExpensive");
					$(this).data("price", 1000000);
				}
				else if($(this).text().indexOf("Vous l'avez !") != -1) {
					$(this).addClass("alreadyBought");
					$(this).data("price", 10000000);
				}
				else {
					$(this).data("price", Number($(this).html().match(/([\d,]+) Pts/)[1].replace(',', '')));
				}
			});
		};

		var hideExpensivePins = function() {
			if(!opt.get(module_name, "filter_expensive")) {
				return;
			}

			dbg("[HideExpensive] Hiding some");
			$(".tooExpensive").hide();
		};

		var hideBoughtPins = function() {
			if(!opt.get(module_name, "filter_bought")) {
				return;
			}

			dbg("[HideBought] Hiding some");
			$(".alreadyBought").hide();
		};

		var pinsPerRow = 5;
		var sortPins = function() {
			if(!opt.get(module_name, "sort_price")) {
				return;
			}

			dbg("[sort_price] Sorting");
			var sortFunc = function(a, b) {
				var aN = $(a).data("price");
				var bN = $(b).data("price");
				// Make alphabetical if same price
				if(aN == bN) {
					aN = $(a).text().substr(0, 3);
					bN = $(b).text().substr(0, 3);
				}
				return aN > bN ? 1 : -1;
			};

			$("#pins tbody").html($("#pins tbody td").sort(sortFunc));
			var pinsTd = $("#pins tbody td");
			var neededRows = Math.ceil(pinsTd.length / pinsPerRow);
			for(var i = 0; i < neededRows; i++) {
				pinsTd.slice(i * pinsPerRow, (i + 1) * pinsPerRow).wrapAll("<tr></tr>");
			}
			dbg("[sort_price] Sorted");
		};

		dbg("[Init] Starting");
		// Execute functions

		$(".nav a").click(function() {
			if($(this).attr("href") == "#pins") {
				tagPins();
				hideExpensivePins();
				hideBoughtPins();
				sortPins();
			}
		});

		if(pageUrl.params && pageUrl.params.tab == mOptions.tab) {
			tagPins();
			hideExpensivePins();
			hideBoughtPins();
			sortPins();
		}

		opt.setCallback(module_name, "filter_expensive", function(state) {
			if(state) {
				hideExpensivePins();
			}
			else {
				dbg("[HideExpensive] Show them all");
				$("#pins tbody td.tooExpensive").show();
			}
		});

		opt.setCallback(module_name, "filter_bought", function(state) {
			if(state) {
				hideBoughtPins();
			}
			else {
				dbg("[HideBought] Show them all");
				$("#pins tbody td.alreadyBought").show();
			}
		});

		dbg("[Init] Ready");
	}
};