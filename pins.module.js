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
	pages: [
		{ path_name: "/karma/", options: { tab: 'pins', buttons: '.nav' } }
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

		var hidingExpensive = opt.get(module_name, "filter_expensive");
		var hideExpensivePins = function() {
			if(!hidingExpensive) {
				return;
			}

			dbg("[HideExpensive] Hiding some");
			$("#pins tbody td").each(function() {
				if($(this).text().indexOf("Pas assez de Karma") != -1) {
					$(this).hide();
				}
			});
		}

		var addPinsButtons = function() {
			var buttons = '<div class="gksi_buttons"><input id="filter_expensive" type="checkbox" ' + (hidingExpensive ? 'checked="checked" ' : ' ') + '/> Cacher les pins trop chers</div>';
			$(mOptions.buttons).after(buttons);

			$("#filter_expensive").change(function() {
				hidingExpensive = $(this).attr("checked") == "checked" ? true : false;
				dbg("[HideExpensive] is " + hidingExpensive);
				opt.set(module_name, "filter_expensive", hidingExpensive);

				if(hidingExpensive) {
					hideExpensivePins();
				}
				else {
					dbg("[HideExpensive] Show them all");
					$("#pins tbody td").show();
				}
			});
			dbg("[HideExpensive] Ready");
		}

		dbg("[Init] Starting");
		// Execute functions

		$(".nav a").click(function() {
			var tab = $(this).attr("href");
			$(".gksi_buttons").remove();
			if(tab == "#pins") {
				addPinsButtons();
				hideExpensivePins();
			}
		});

		if(url.params && url.params.tab == mOptions.tab) {
			addPinsButtons();
			hideExpensivePins();
		}

		dbg("[Init] Ready");
	}
};