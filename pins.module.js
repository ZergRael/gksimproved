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
			_dbg(module_name, str);
		};

		dbg("[Init] Loading module");
		// Loading all functions used

		var karma = false;
		var getKarmaTotal = function() {
			var kMatches = $(".karma").text().match(/(\d*),?(\d+).(\d+)/);
			karma = (kMatches[1] ? Number(kMatches[1]) * 1000 : 0) + (kMatches[2] ? Number(kMatches[2]) : 0) + (kMatches[3] ? Number(kMatches[3]) * 0.01 : 0);
		}

		var filter_expensive = opt.get(module_name, "filter_expensive");
		var hideExpensivePins = function() {
			if(!filter_expensive) {
				return;
			}

			dbg("[HideExpensive] Hiding some");
			$("#pins tbody td").each(function() {
				if($(this).text().indexOf("Pas assez de Karma") != -1) {
					$(this).hide();
				}
			});
		}

		dbg("[Init] Starting");
		// Execute functions

		$(".nav a").click(function() {
			var tab = $(this).attr("href");
			$(".gksi_buttons").remove();
			if(tab == "#pins") {
				hideExpensivePins();
			}
		});

		if(url.params && url.params.tab == mOptions.tab) {
			hideExpensivePins();
		}

		opt.setCallback(module_name, "filter_expensive", function(state) {
			filter_expensive = state;

			if(filter_expensive) {
				hideExpensivePins();
			}
			else {
				dbg("[HideExpensive] Show them all");
				$("#pins tbody td").show();
			}
		});

		dbg("[Init] Ready");
	}
};