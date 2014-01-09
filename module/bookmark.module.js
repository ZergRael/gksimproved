modules.bookmark = {
	name: "bookmark",
	pages: [
		{ path_name: "/bookmark/", options: { buttons: '#head_notice_left > a:last'}}
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

		var AutoGetAll = function() {
			dbg("[AutoGetAll] Scanning");
			var actions = [];
			// Autoget is limited to 15 torrents !
			$("#torrent tbody:first tr[id^=book]:lt(15)").each(function(i) {
				var tid = $(this).find(".dl a").attr('href').match(/\d+/)[0];
				actions.push({
					action: "add",
					type: "autoget",
					tid: tid
				});
				if(opt.get(module_name, "delete_get")) {
					var bid = $(this).attr('id').match(/\d+/)[0];
					actions.push({
						action: "del",
						type: "delbookmark",
						tid: bid
					});
				}
			});
			dbg("[AutoGetAll] Sending %d requests", actions.length);
			utils.multiGet(actions, function(){
				dbg("[AutoGetAll] Done");
				insertScript("autoget_notify", function() {
					Notifier.success("Torrents ajouté à l'autoget", 'Ajout Effectué');
				}, true);
				if(opt.get(module_name, "delete_get")) {
					$("#torrent tbody:first tr[id^=book]:lt(15)").remove();
					updateTotal();
				}
			});
			dbg("[AutoGetAll] Sent");
			return false;
		};

		var DelAllCat = function() {
			dbg("[DelAllCat] Scanning category");
			var cat = $("#book a.current").attr('href');
			var actions = [];
			$(cat+" tbody:first tr[id^=book]").each(function(i) {
				var tid = $(this).attr('id').match(/\d+/)[0];
				actions.push({
					action: "del",
					type: "delbookmark",
					tid: tid
				});
			});
			dbg("[DelAllCat] Sending %d requests", actions.length);
			utils.multiGet(actions, function(){
				dbg("[DelAllCat] Done");
				$(cat+" tbody:first tr[id^=book]").remove();
				insertScript("delallcat_notify", function() {
					Notifier.success("Bookmarks supprimés", 'Suppression OK');
				}, true);
			});
			updateTotal();
			dbg("[DelAllCat] Sent");
			return false;
		};

		var updateTotal = function() {
			var t=0,s=0,l=0;
			var torrent = $("#torrent");
			$("tr:hidden", torrent).remove();
			$("tbody:first tr[id^=book]", torrent).each(function(i){
				t += utils.strToSize($(this).find(".size").text()).koTot;
				s += Number($(this).find(".seed").text());
				l += Number($(this).find(".leech").text());
			});
			var result = $("tbody tr#bookresults", torrent);
			var size = utils.strToSize(t+" Ko");
			if(size.toTot > 1) {
				result.find(".size").text(size.toTot.toFixed(2)+" To");
			}
			else if(size.goTot > 1) {
				result.find(".size").text(size.goTot.toFixed(2)+" Go");
			}
			else if(size.moTot > 1) {
				result.find(".size").text(size.moTot.toFixed(2)+" Mo");
			}
			else {
				result.find(".size").text(size.koTot.toFixed(2)+" Ko");
			}
			result.find(".upload").text(s);
			result.find(".download").text(l);
		};

		var setHighlight = function() {
			$("#torrent tbody tr").removeClass('bookmark_highlight');
			$(this).parents("tr").addClass("bookmark_highlight");
		};

		var sortColumnClick = function() {
			if(sort == $(this).attr("id")) {
				order = (order == "desc" ? "asc" : "desc");
			}
			else {
				sort = $(this).attr("id");
				order = "asc";
			}
			sortData();
			return false;
		};

		var order = "desc", sort = "sortDate";
		var sortData = function() {
			if(!sort) {
				return;
			}

			var sortFunc = false;
			switch(sort) {
				case "sortName":
					sortFunc = function(a, b) {
						var aN = $(a).find("td:nth-child(1)").text();
						var bN = $(b).find("td:nth-child(1)").text();
						return order == "desc" ? (aN > bN ? -1 : 1) : (aN > bN ? 1 : -1);
					};
					break;
				case "sortDate":
					sortFunc = function(a, b) {
						var aN = $(a).find("td:nth-child(2)").text();
						var bN = $(b).find("td:nth-child(2)").text();
						return order == "desc" ? (utils.dateToDuration(aN).minTot > utils.dateToDuration(bN).minTot ? -1 : 1) : (utils.dateToDuration(aN).minTot > utils.dateToDuration(bN).minTot ? 1 : -1);
					};
					break;
				case "sortSize":
					sortFunc = function(a, b) {
						var aN = $(a).find("td:nth-child(3)").text();
						var bN = $(b).find("td:nth-child(3)").text();
						return order == "desc" ? (utils.strToSize(aN).koTot > utils.strToSize(bN).koTot ? -1 : 1) : (utils.strToSize(aN).koTot > utils.strToSize(bN).koTot ? 1 : -1);
					};
					break;
				case "sortS":
					sortFunc = function(a, b) {
						var aN = Number($(a).find("td:nth-child(4)").text());
						var bN = Number($(b).find("td:nth-child(4)").text());
						return order == "desc" ? (aN > bN ? -1 : 1) : (aN > bN ? 1 : -1);
					};
					break;
				case "sortL":
					sortFunc = function(a, b) {
						var aN = Number($(a).find("td:nth-child(5)").text());
						var bN = Number($(b).find("td:nth-child(5)").text());
						return order == "desc" ? (aN > bN ? -1 : 1) : (aN > bN ? 1 : -1);
					};
					break;
			}
			$("#torrent tbody:first").html($("#torrent tbody:first tr").sort(sortFunc));
			$(".dl a").click(setHighlight);
		};

		$("#torrent tbody tr td.name a[onclick]").on('click', function(){
			updateTotal();
		});

		dbg("[Init] Starting");
		// Execute functions
		var buttons = [
			' | <a href="#" id="AutoGetAll">AutoGet 15 premiers</a>',
			' <input id="delete_get" type="checkbox" ' + (opt.get(module_name, "delete_get") ? 'checked="checked" ' : ' ') + '/><label for="delete_get">Supprimer après ajout</label>',
			' | <a href="#" id="delallcat">Supprimer ces bookmarks</a>'
		];
		$(mOptions.buttons).after(buttons.join(""));
		var colSortButtons = [ "sortName", "sortDate", "sortSize", "sortS", "sortL" ];
		var i = 0;
		$("#torrent thead td").each(function() {
			if(colSortButtons[i]) {
				$(this).wrapInner('<a id="' + colSortButtons[i] + '" class="sortCol" href="#">');
			}
			i++;
		});

		$("#AutoGetAll").click(AutoGetAll);
		$("#delallcat").click(DelAllCat);
		$("#delete_get").change(function() {
			opt.set(module_name, "delete_get", $(this).is(":checked"));
			dbg("[DeleteGet] is %s", opt.get(module_name, "delete_get"));
		});
		$(".dl a").click(setHighlight);
		$(".sortCol").click(sortColumnClick);

		modules.global.parseBookmarks($("#torrent tbody:first tr"));

		dbg("[Init] Ready");
	}
};
