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
modules.aura = {
	name: "aura",
	pages: [
		{ path_name: "/m/aura/", options: { buttons: '#myauracalc' } }
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

		var calcKarmaGoal = function() {
			$("#gksi_karmagoal_time").text("");
			var input_val = $(this).val().replace(',', '');
			if(!$.isNumeric(input_val)) {
				return;
			}

			input_val = Number(input_val);
			if(input_val > karma) {
				var hours = (input_val - karma) / aura;
				dbg("[karmaGoal] Got [" + hours + "] hours");
				var days = hours / 24;
				var months = days / 30.43;
				$("#gksi_karmagoal_time").text(Math.floor(months) + " mois, " + Math.floor(days % 30.43) + " jours, " + Math.floor(hours % 24) + " heures");
			}
		};
		
		var agProgress = 0;
		var ag = 0;
		var calcAgProgress = function() {
			var size = strToSize($("#myauracalc tfoot td:nth(2)").text());
			if(!size) {
				return;
			}
			dbg("[agProgress] Found [" + size.goTot + "] Go");

			var AGText = $("#myauracalc tfoot td:nth(4)").text();
			ag = Number(AGText.replace(',', ''));
			dbg("[agProgress] Found [" + ag + "] Ag");

			agProgress = ag / size.goTot;
			$("#gksi_auragoal_progression").text(agProgress);
			dbg("[agProgress] Got [" + agProgress + "] Ag/Go");
		};

		var calcAuraGoal = function() {
			$("#gksi_auragoal_go").text("");
			var input_val = $(this).val().replace(',', '');
			if(!$.isNumeric(input_val)) {
				return;
			}

			input_val = Number(input_val);
			if(input_val > aura && (input_val - aura) >= 0.01 && input_val <= 50) {
				//Ag = tan( B / (50 * (2/pi))) * 300
				var goalAg = Math.tan(input_val / (50 * (2 / Math.PI))) * 300;
				var auraGoal = (goalAg - ag) / agProgress;
				dbg("[auraGoal] Got [(" + goalAg + " - " + ag + ") / " + agProgress + "] = [" + auraGoal + "]");
				$("#gksi_auragoal_go").text(Math.round(auraGoal * 100) / 100);
			}
		};

		var lastTorrent = false, ready = true;
		var calcAuraTorrent = function() {
			if(!ready) {
				return;
			}
			ready = false;
			dbg("[auraTorrent] Input change");
			var input_val = $(this).val();
			var urlTorrent = parseUrl($(this).val());
			if(!urlTorrent || lastTorrent == urlTorrent) {
				ready = true;
				return;
			}

			lastTorrent = urlTorrent;
			dbg("[auraTorrent] Fetching torrent info");
			//var duration = dateToDuration("07/01/2012 à 01:13");
			grabPage(urlTorrent, function(data) {
				dbg("[auraTorrent] Got torrent info - Parsing");
				var infos = $(data).find('#contenu div[style="margin-left:50px;"] p');
				var size = strToSize(infos.eq(3).text());
				var date = dateToDuration(infos.eq(6).text());
				var seeds = infos.eq(7).find("strong:nth(0)").text();

				//A = (1-10^(-Ti/4))*Si*(1+sqrt(2)*10^(-((Ni-1)/(7-1))))
				var aTorrent = (1 - Math.pow(10, -date.weekTot / 4)) * size.goTot * (1 + Math.sqrt(2) * Math.pow(10, -((seeds - 1) / (7 - 1))));
				dbg("[auraTorrent] Got [" + size.goTot + "] Go - [" + date.weekTot + "] Weeks [" + seeds + "] Seeds => A = [" + aTorrent + "]");

				var estAg = ag + aTorrent;
				//B = 50 * (2/pi) * arctan (Ag / 300)
				var estAura = 50 * (2 / Math.PI) * Math.atan(estAg / 300);
				dbg("[auraTorrent] ag [" + ag + "] -> [" + estAg + "] | aura [" + aura + "] -> [" + estAura + "]");
				$("#gksi_auratorrent_aura").text(Math.round(estAura * 100) / 100);
				ready = true;
			});
		};

		dbg("[Init] Starting");
		// Execute functions

		var buttons = '<table id="gksi_aura_controls" class="table100 tablesorter" style="width: 100%;" border="1"><thead><tr><th>Calculateur d\'objectif de karma</th><th>Calculateur de palier d\'aura</th><th>Calculateur de changements d\'aura</th></tr></thead><tbody><tr><td>Objectif karma : <input id="gksi_karmagoal_input" type="text" value="1000000"><br>Temps nécessaire estimé : <span id="gksi_karmagoal_time" class="gksi_aura_result"></span></td><td>Objectif aura : <input id="gksi_auragoal_input" type="text" value="49.9"><br>Taux Ag de progression : <span id="gksi_auragoal_progression">Z</span> / Go<br>Go nécessaires estimés : <span id="gksi_auragoal_go" class="gksi_aura_result">Z</span> Go</td><td>Lien vers un torrent à télécharger : <input id="gksi_auratorrent_input" type="text"><br>En seedant ce torrent, votre aura passera à : <span id="gksi_auratorrent_aura" class="gksi_aura_result"></span></td></tr></tbody></table>';
		$(mOptions.buttons).before(buttons);

		$("#gksi_karmagoal_input").keyup(calcKarmaGoal);
		$("#gksi_auragoal_input").keyup(calcAuraGoal);
		$("#gksi_auratorrent_input").keyup(calcAuraTorrent);

		var karma = modules.global.karma;
		dbg("[Karma] Parsed [" + karma + "]");
		var aura = Number($("#userlink li:nth(3)").text().match(/[\d\.]+/)[0]);
		dbg("[Aura] Parsed [" + aura + "]");

		$("#gksi_karmagoal_input").trigger("keyup");
		calcAgProgress();
		$("#gksi_auragoal_input").trigger("keyup");
		$("#gksi_auratorrent_input").trigger("keyup");

		dbg("[Init] Ready");
	}
};