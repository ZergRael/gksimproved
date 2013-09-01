modules.aura = {
	name: "aura",
	dText: "Aura",
	pages: [
		{ path_name: "/m/aura/", options: { buttons: '#myauracalc' } }
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

		// Time to reach set karma
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

		// Global A progression estimate
		var agProgress = 0;
		var ag500 = 0;
		var ag = 0;
		var calcAgProgress = function() {
			var size = utils.strToSize($("#myauracalc tfoot td:nth(2)").text());
			if(!size) {
				return;
			}
			dbg("[agProgress] Found [" + size.goTot + "] Go");

			var AGText = $("#myauracalc tfoot td:nth(4)").text();
			ag500 = Number(AGText.replace(',', ''));
			dbg("[agProgress] Found [" + ag500 + "] Ag/500");

			// In case we have > 500 torrents, just inverse the aura function
			//B = 50 * (2/pi) * arctan (Ag / 300)
			//B / (50 * (2/pi)) = arctan (Ag / 300)
			//tan(B / (50 * (2/pi))) * 300 = Ag

			ag = Math.tan(aura / (50 * (2 / Math.PI))) * 300;
			dbg("[agProgress] Deduced [" + ag + "] Ag");

			agProgress = ag500 / size.goTot;
			$("#gksi_auragoal_progression").text(agProgress);
			dbg("[agProgress] Got [" + agProgress + "] Ag/Go");
		};

		// DL to reach set aura
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

		// Aura reached by seeding torrent url
		var lastTorrent = false, ready = true;
		var calcAuraTorrent = function() {
			if(!ready) {
				return;
			}
			ready = false;
			dbg("[auraTorrent] Input change");
			var input_val = $(this).val();
			var urlTorrent = utils.parseUrl($(this).val());
			if(!urlTorrent || (lastTorrent && lastTorrent.path == urlTorrent.path)) {
				ready = true;
				return;
			}

			lastTorrent = urlTorrent;
			dbg("[auraTorrent] Fetching torrent info");
			utils.grabPage(urlTorrent, function(data) {
				dbg("[auraTorrent] Got torrent info - Parsing");
				var infos = $(data).find('#contenu div[style="margin-left:50px;"]');
				var size = utils.strToSize(infos.find(".torr-taille").parent().text());
				var date = utils.dateToDuration(infos.find(".torr-add-the").parent().text());
				var seeds = infos.find(".torr-peers").parent().find("strong:nth(0)").text();

				//A = (1-10^(-Ti/4))*Si*(1+sqrt(2)*10^(-((Ni-1)/(7-1))))
				var aTorrent = (1 - Math.pow(10, - date.weekTot / 4)) * size.goTot * (1 + Math.sqrt(2) * Math.pow(10, -((seeds - 1) / (7 - 1))));
				dbg("[auraTorrent] Got [" + size.goTot + "] Go | [" + date.weekTot + "] Weeks | [" + seeds + "] Seeds => A = [" + aTorrent + "]");

				var estAg = ag + aTorrent;
				//B = 50 * (2/pi) * arctan (Ag / 300)
				var estAura = 50 * (2 / Math.PI) * Math.atan(estAg / 300);
				dbg("[auraTorrent] ag [" + ag + "] -> [" + estAg + "] | aura [" + aura + "] -> [" + estAura + "]");
				$("#gksi_auratorrent_aura").text(Math.round(estAura * 1000) / 1000);
				ready = true;
			});
		};

		var updateTableSort = function() {
			dbg("[updateTableSort] Init");
			insertScript("update_tablesorter", function(){
				var table = $('#myauracalc');
				$("thead tr th.tablesorter-header", table).each(function(i){
					$(this).removeClass("tablesorter-header tablesorter-headerSortUp tablesorter-headerSortDown")
					$(this).unbind('click mousedown');
					var div = $(this).find('.tablesorter-header-inner')
					if($(div).length){
						$(this).html( $(div).text() );
					}
				});
				$("thead tr.tablesorter-header", table).removeClass("tablesorter-header");
				$(table).removeClass("tablesorter").unbind('update updateCell addRows sorton appendCache applyWidgetId applyWidgets');

				$('#myauracalc').tablesorter({
					widgets: ['zebra'],
					widgetOptions : {
						zebra : [ 'normal-row', 'alt-row' ]
					},
					sortList: [[5,1]],
					headers: {
						2: {sorter: 'filesize'},
						3: {sorter: false},
					}
				});
			}, true);
			dbg("[updateTableSort] Done");
		};

		var addAgColumn = function() {
			dbg("[addAgColumn] Starting");
			var myauracalc = $('#myauracalc');
			$("thead tr th:last", myauracalc).after("<th class='ag_column'>A/Go</th>");
			var ATot = 0;
			var sizeTot = 0;
			$("tbody tr", myauracalc).each(function(i){
				var tds = $(this).find("td");
				var size = Number(tds.eq(2).attr("data-filesize"))/(1024*1024*1024);
				var A = Number(tds.eq(4).text());
				ATot += A;
				sizeTot += size;
				tds.last().after("<td class='ag_column'>"+(A/size).toFixed(3)+"</td>");
			});
			$("tfoot tr td:last", myauracalc).after("<td class='ag_column'>"+(ATot/sizeTot).toFixed(3)+"</td>");
			updateTableSort();
			dbg("[addAgColumn] Done");
		};

		dbg("[Init] Starting");
		// Execute functions

		var buttons = '<table id="gksi_aura_controls" class="table100 tablesorter" style="width: 100%;" border="1"><thead><tr><th>Calculateur d\'objectif de karma</th><th>Calculateur de palier d\'aura</th><th>Calculateur de changements d\'aura</th></tr></thead><tbody><tr><td>Objectif karma : <input id="gksi_karmagoal_input" type="text" value="500000" placeholder="500000"><br>Temps nécessaire estimé : <span id="gksi_karmagoal_time" class="gksi_aura_result">Bien trop longtemps</span></td><td>Objectif aura : <input id="gksi_auragoal_input" type="text" value="48" placeholder="50"><br>Taux Ag de progression : <span id="gksi_auragoal_progression"></span> / Go <a href="#" title="Cette valeur est calculée à partir de l\'ensemble des caractéristiques de torrents que vous seedez (nombre de seeds et age moyen).\n\nElle permet de déduire la progression de votre aura en fonction d\'une taille en Go. On trouvera généralement une valeur proche de 1. Si vos torrents sont jeunes et très seedés la valeur sera plus faible, et inversement pour des torrents agés et peu seedés.">[?]</a><br>Go nécessaires estimés : <span id="gksi_auragoal_go" class="gksi_aura_result">Bien plus que ça</span> Go</td><td>Lien vers un torrent à télécharger : <input id="gksi_auratorrent_input" type="text" placeholder="https://gks.gs/torrent/45498/"><br>En seedant ce torrent, votre aura passera à : <span id="gksi_auratorrent_aura" class="gksi_aura_result"></span></td></tr></tbody></table><p class="marginleft">Attention, ce système expérimental ne propose que des estimations servant à vous aider dans l\'optimisation de votre aura/karma.<br />Malgré l\'utilisation des formules exactes du calcul d\'aura, ces valeurs sont des approximations basées sur les arrondis de la page.</p><br />';
		$(mOptions.buttons).before(buttons);

		if(opt.get(module_name, "ag_column")) {
			addAgColumn();
		}
		opt.setCallback(module_name, "ag_column", function(state) {
			if(state) {
				addAgColumn();
			}
			else {
				$(".ag_column").remove();
			}
		});

		$("#gksi_karmagoal_input").keyup(calcKarmaGoal);
		$("#gksi_auragoal_input").keyup(calcAuraGoal);
		$("#gksi_auratorrent_input").keyup(calcAuraTorrent);

		var karma = utils.getKarmaTotal();
		dbg("[Karma] Parsed [" + karma + "]");
		var aura = utils.getAura();
		dbg("[Aura] Parsed [" + aura + "]");

		$("#gksi_karmagoal_input").trigger("keyup");
		calcAgProgress();
		$("#gksi_auragoal_input").trigger("keyup");
		$("#gksi_auratorrent_input").trigger("keyup");

		dbg("[Init] Ready");
	}
};