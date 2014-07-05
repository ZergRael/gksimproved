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
		var dbg = function() {
			utils.dbg(module_name, arguments);
		};

		dbg("[Init] Loading module");
		// Loading all functions used

		appendNativeScript(_sUrl + "/static/js/forums.js?v=2");

		var torrentId = pageUrl.path.match(/\/torrent\/(\d+)/)[1];
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
			var urlQuickComment = { host: pageUrl.host, path: "/com/", params: { id: torrentId } };

			utils.grabPage(urlQuickComment, function(data) {
				$(".page_loading").remove();
				$(mOptions.loading).after($(data).find("#com"));
				$(document).trigger("reactivate_keydown_listenner");
				dbg("[QuickComment] Quickcomment ready");
			});
		};

		var warnCantComment = function() {
			dbg("[WarnComment] Is the user allowing MPs ?");
			$("#warn_cant_comment_area").html('<img src="' + chrome.extension.getURL("images/loading.gif") + '" /><br />Tentative d\'envoi du MP');
			utils.grabPage({ host: pageUrl.host, path: "/mailbox/", params: { write: false, receiver: pseudo_up } }, function(data) {
				if($(data).find("#mailbox_write textarea").length) {
					dbg("[WarnComment] Sending MP");
					var ak = $(data).find("input[name=ak]").val();
					var mailbox_data = { action: "mail_new_send", ak: ak, msgsubject: replaceCommentText(opt.get(module_name, "comment_mp_title")), to: pseudo_up, message_content: replaceCommentText(opt.get(module_name, "comment_mp_text")) };
					utils.post({ host: pageUrl.host, path: "/mailbox/" }, mailbox_data, function() {
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

		var replacementText = {
			id_torrent: { val: torrentId, text: "Id du torrent" },
			titre_torrent: { val: torrentName, text: "Titre du torrent" },
			url_torrent: { val: utils.craftUrl(pageUrl), text: "URL de la fiche torrent" },
			pseudo: { text: "Pseudo de l'uploadeur" }
		};
		var replaceCommentText = function(text) {
			$.each(replacementText, function(k, v) {
				text = text.replace(new RegExp("%" + k + "%", "g"), v.val);
			});
			return text;
		};

		var pseudo_up = false;
		var proposeWarn = function() {
			if(!canComment) {
				var uploader = $("#contenu div[style] span[class^=userclass]");
				dbg("[WarnComment] Can't find comments textarea");
				if(uploader.length) {
					$(mOptions.loading).append('<br /><span id="warn_cant_comment_area"><a href="#" id="warn_cant_comment">Prévenir l\'uploadeur par MP automatique ?</a> - <a href="#" id="edit_cant_comment_mp">Editer le MP à envoyer</a></span>');
					pseudo_up = uploader.text();
					replacementText.pseudo.val = pseudo_up;
					$("#warn_cant_comment").click(function() {
						warnCantComment();
						return false;
					});
					$("#edit_cant_comment_mp").click(function() {
						buildCantCommentEditFrame();
						return false;
					});
				}
				else {
					$(mOptions.loading).append('<br />Impossible de prévenir l\'uploader (anonyme).');
				}
			}
		};

		var buildCantCommentEditFrame = function() {
			dbg("[edit_mp_comment] Building frame");
			var edit_replacements_available = "Remplacements possibles :<br />";
			$.each(replacementText, function(replacement, data) {
				edit_replacements_available += '<span class="bold">%' + replacement + '%</span> = ' + data.text + ' (exemple: ' + data.val + ')<br />';
			});
			edit_replacements_available += "Les remplacements %patate% non reconnus ne seront pas modifiés";
			var edit_frame_data = '<div>' + edit_replacements_available + '</div><input type="text" id="gksi_edit_cant_comment_title" class="gksi_edit_title" value="' + opt.get(module_name, "comment_mp_title") + '"><textarea id="gksi_edit_cant_comment_text" class="gksi_edit_textarea">' + opt.get(module_name, "comment_mp_text") + '</textarea>';
			var save_callback = function(data, frame_id) {
				dbg("[edit_mp_comment] Checking data");
				var edit_title = $(data).find("#gksi_edit_cant_comment_title");
				var edit_text = $(data).find("#gksi_edit_cant_comment_text");
				if(edit_title.length && edit_text.length) {
					dbg("[edit_mp_comment] Saving data");
					opt.set(module_name, "comment_mp_title", edit_title.val());
					opt.set(module_name, "comment_mp_text", edit_text.val());
				}
				$(frame_id).remove();
			};
			var edit_frame = { id: "edit_cant_comment_mp", title: "KWi : Edition du MP à envoyer", data: edit_frame_data, relativeToId: "torrent_comments", top: -400, left: 0, buttons: [ { b_id: "save", b_text: "Enregistrer", b_callback: save_callback } ] };
			// { id, classes, title, header, data, relativeToId, relativeToObj, relativeToWindow, top, left, css, buttons = [ /* close is by default */ { b_id, b_text, b_callback} ], underButtonsText }
			appendFrame(edit_frame);
			dbg("[edit_mp_comment] Frame built");
		};

		var addBookmarkStar = function() {
			var bookmarkedTorrents = gData.get("bookmarks", "torrents");
			if(bookmarkedTorrents.indexOf(torrentId) != -1) {
				$("#contenu .separate:first").prepend('<img src="' + chrome.extension.getURL("images/bookmark.png") + '" />');
			}

			var suggest_torrent = $("#suggest_torrent li");
			if(suggest_torrent && suggest_torrent.length > 0) {
				suggest_torrent.each(function() {
					var sTorrentId = $(this).find("a:last").attr("href").match(/\/torrent\/(\d+)/)[1];
					if(bookmarkedTorrents.indexOf(sTorrentId) != -1) {
						$(this).find("a:first").after('<img src="' + chrome.extension.getURL("images/bookmark.png") + '" />');
					}
				});
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
		addBookmarkStar();

		dbg("[Init] Ready");
	}
};