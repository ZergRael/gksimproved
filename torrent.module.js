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
modules.torrent = {
	name: "torrent",
	dText: "Fiche torrent",
	pages: [
		{ path_name: "/torrent/\\d+/.*/?", options: { loading: '#torrent_comments p:last' } }
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

		appendNativeScript("https://s.gks.gs/static/js/forums.js?v=2");

		var torrentId = url.path.match(/\/torrent\/(\d+)/)[1];
		var torrentName = $("#contenu p[class=separate]:first").text().replace(/\s+$/, "");

		var quick_comment = opt.get(module_name, "quick_comment");
		var canComment = false;
		var appendQuickComment = function() {
			if(!$(mOptions.loading).find('a').length) {
				return;
			}
			canComment = true;
			if(!quick_comment) {
				return;
			}
			$("#quickpost").remove();

			dbg("[QuickComment] Grabbing quickcomment textarea");
			$(mOptions.loading).hide();
			$(mOptions.loading).after('<p class="pager_align page_loading"><img src="' + chrome.extension.getURL("images/loading.gif") + '" /><br />Protonisation des entrailles du quick comment</p>');
			var urlQuickComment = { host: url.host, path: "/com/", params: { id: torrentId } };

			grabPage(urlQuickComment, function(data) {
				$(".page_loading").remove();
				$(mOptions.loading).after($(data).find("#com"));
				$("#twit_autoc").trigger("reactivateKeydownListenner");
			});
		};

		var warnCantComment = function(pseudo) {
			dbg("[WarnComment] Is the user allowing MPs ?");
			$("#warn_cant_comment_area").html('<img src="' + chrome.extension.getURL("images/loading.gif") + '" /><br />Tentative d\'envoi du MP');
			grabPage({ host: url.host, path: "/mailbox/", params: { write: false, receiver: pseudo } }, function(data) {
				if($(data).find("#mailbox_write textarea").length) {
					dbg("[WarnComment] Sending MP");
					var ak = $(data).find("input[name=ak]").val();
					var mailbox_data = { action: "mail_new_send", ak: ak, msgsubject: "[Torrent #" + torrentId + "] Commentaires désactivés", to: pseudo, message_content: "Salutations !\n\nIl semblerait qu'un des torrents que vous avez posté n'accepte pas les commentaires :\n[url=" + craftUrl(url) + "]" + torrentName + "[/url]\n\nSerait-il possible d'y remédier ?\n[url=https://gks.gs/m/account/paranoia]Réglage de la paranoïa[/url]\n\nMerci :)"};
					post({ host: url.host, path: "/mailbox/" }, mailbox_data, function() {
						dbg("[WarnComment] MP sent");
						$("#warn_cant_comment_area").text("Le MP a correctement été envoyé !");
					});
				}
				else {
					dbg("[WarnComment] Nope");
					$("#warn_cant_comment_area").text("Cet utilisateur refuse aussi les MP !");
				}
			});
		};

		var proposeWarn = function() {
			if(!canComment) {
				var uploader = $("#contenu div[style] span[class^=userclass]");
				dbg("[WarnComment] Can't find comments textarea");
				if(uploader.length) {
					$(mOptions.loading).append('<br /><span id="warn_cant_comment_area"><a href="#" id="warn_cant_comment">Prévenir l\'uploadeur par MP automatique ?</a></span>');
					$("#warn_cant_comment").click(function() {
						warnCantComment(uploader.text());
						return false;
					});
				}
				else {
					$(mOptions.loading).append('<br />Impossible de prévenir l\'uploader (anonyme).');
				}
			}
		};

		dbg("[Init] Starting");
		// Execute functions

		opt.setCallback(module_name, "quick_comment", function(state) {
			quick_comment = state;

			if(quick_comment) {
				appendQuickComment();
			}
			else {
				$("#com").remove();
				$(mOptions.loading).show();
			}
		});

		appendQuickComment();
		proposeWarn();

		dbg("[Init] Ready");
	}
};