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
modules.bookmark = {
	name: "bookmark",
	pages: [
		{ path_name: "/bookmark/", options: { buttons: '#head_notice_left > a:last'}}
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

		var AutoGetAll = function() {
			dbg("[AutoGetAll] Scanning");
			var actions = [];
			// Autoget is limited to 15 torrents !
			$("#torrent tbody:lt(15) tr:not(#bookresults)").each(function(i){
				var tid = $(this).find(".dl a").attr('href').match(/\d+/)[0];
				actions.push({
					action: "add",
					type: "autoget",
					tid: tid
				});
				if(opt.get(module_name, "delete_get"))
				{
					var bid = $(this).attr('id').match(/\d+/)[0];
					actions.push({
						action: "del",
						type: "delbookmark",
						tid: bid
					});
				}
			});
			dbg("[AutoGetAll] Sending "+actions.length+" requests");
			utils.multiGet(actions, function(){
				dbg("[AutoGetAll] Done");
				insertScript("autoget_notify", function(){
					Notifier.success("Torrents ajouté à l'autoget", 'Ajout Effectué');
					if($("#delete_get").is(':checked'))
					{
						$("#torrent tbody:has(tr:not(#bookresults)):lt(15)").remove();
						$('#bookresults').trigger('click');
					}
				}, true);
			});
			dbg("[AutoGetAll] Sent");
		}

		var DelAllCat = function() {
			dbg("[DelAllCat] Scanning category");
			var cat = $("#book a.current").attr('href');
			var actions = [];
			// Could be replaced by $("#book a.current:target tbody tr:not(#bookresults)") with jQuery 1.9 (for :target support)
			$(cat+" tbody tr:not(#bookresults)").each(function(i){
				var tid = $(this).attr('id').match(/\d+/)[0];
				actions.push({
					action: "del",
					type: "delbookmark",
					tid: tid
				});
			});
			dbg("[DelAllCat] Sending "+actions.length+" requests");
			utils.multiGet(actions, function(){
				dbg("[DelAllCat] Done");
				insertScript("delallcat_notify", function(){
					Notifier.success("Bookmarks supprimés", 'Suppression OK');
					var cat = $("#book a.current").attr('href');
					$(cat+" tbody:has(tr:not(#bookresults))").remove();
					$('#bookresults').trigger('click');
				}, true);
			});
			dbg("[DelAllCat] Sent");
		}

		var updateTotal = function(event) {
			var t=0,s=0,l=0;
			$("#torrent tbody tr:not(#bookresults)").each(function(i){
				t += utils.strToSize($(this).find(".size").text()).koTot;
				s += Number($(this).find(".seed").text());
				l += Number($(this).find(".leech").text());
			});
			var result = $("#torrent tbody tr#bookresults");
			var size = utils.strToSize(t+" Ko");
			if(size.toTot > 1) {
				result.find(".size").text(size.toTot.toFixed(2)+" To");
			}
			else if(size.goTot > 1) {
				result.find(".size").text(size.goTot.toFixed(2)+" Go");
			}
			else if(size.MoTot > 1) {
				result.find(".size").text(size.moTot.toFixed(2)+" Mo");
			}
			else {
				result.find(".size").text(size.koTot.toFixed(2)+" Ko");
			}
			result.find(".upload").text(s);
			result.find(".download").text(l);
		}

		dbg("[Init] Starting");
		// Execute functions

		var check = opt.get(module_name, "delete_get") ? 'checked="checked" ' : ' ';
		var buttons = ' | <a href="#" id="AutoGetAll">AutoGet 15 premiers</a>'
					+ ' <input id="delete_get" type="checkbox" ' + check + '/><label for="delete_get">Supprimer après ajout</label>'
					+ ' | <a href="#" id="delallcat">Supprimer ces bookmarks</a>';
		$(mOptions.buttons).after(buttons);

		$("#AutoGetAll").click(AutoGetAll);
		$("#delallcat").click(DelAllCat);
		$("#delete_get").change(function() {
			opt.set(module_name, "delete_get", $(this).is(":checked"));
			dbg("[DeleteGet] is " + opt.get(module_name, "delete_get"));
		});
		$('#bookresults').on('click', updateTotal);

		dbg("[Init] Ready");
	}
};
