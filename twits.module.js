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
modules.twits = {
	name: "twits",
	pages: [
		{ path_name: "/forums.php", params: { action: 'viewtopic' } },
		//{ path_name: "/blog/", params: { id: '*' } }

	],
	loaded: false,
	loadModule: function(mOptions) {
		this.loaded = true;
		var module_name = this.name;
		var dbg = function(str) {
			_dbg(module_name, str);
		};

		dbg("[Init] Loading module");

		var twit_auto_complete = opt.get(module_name, "twit_auto_complete");
		var autocKey = 9;
		var nChars = 1;
		var pseudos = {};
		var origPseudo = false;
		var lastTry = false;
		var jOnKeydown = function(e) {
			dbg("input");
			var qp = $(this)
			var qp_text = qp.val();
			if(twit_auto_complete && e.which == 9) {
				dbg("[AutoCTwit] Trying to autoc");
				var at = qp_text.lastIndexOf("@");
				if(at == -1) {
					return;
				}
				
				e.preventDefault();
				if(!origPseudo && (qp_text[at-1] == undefined || qp_text[at-1] == " " || qp_text[at-1] == "\n")) {
					dbg("[AutoCTwit] Scanning DB");
					var qp_text_end = qp_text.substring(at + 1)
					pseudo_s = qp_text_end.split(" ", 1)[0].toLowerCase();
					if(pseudo_s.length < nChars) {
						return;
					}

					origPseudo = pseudo_s;
					$.each(pseudos, function(k, v) {
						if(k.indexOf(pseudo_s) === 0) {
							dbg("[AutoCTwit] Found a match : " + v.pseudo);
							lastTry = k;
							qp.val(qp_text.substring(0, at + 1) + v.pseudo + qp_text.substring(at + 1 + pseudo_s.length, qp_text.length));
							return false;
						}
					});
				}
				else if(origPseudo) {
					var tryAnother = false;
					$.each(pseudos, function(k, v) {
						if(k.indexOf(lastTry) === 0) {
							tryAnother = true;
							return;
						}
						if(tryAnother && k.indexOf(origPseudo) === 0) {
							dbg("[AutoCTwit] Found another match : " + v.pseudo);
							lastTry = k;
							qp.val(qp_text.substring(0, at + 1) + v.pseudo + qp_text.substring(at + 1 + lastTry.length, qp_text.length));
						}
					});
				}
			}
			else {
				origPseudo = false;
			}
		};

		var twit_color = true;
		var colorizeTwits = function(postId) {
			var postArea = $("div[id^=content]");
			if(arguments.length) {
				postArea = $("#content" + postId);
			}
			dbg("[TwitColorize] Colorization start");
			postArea.each(function() {
				var post = $(this);
				post.html(post.html().replace(/\B@([\w]+)/gi, function(match, m1) {
					var user = pseudos[m1.toLowerCase()];
					if(user) {
						dbg("[TwitColorize] Found a match : " + m1);
						return '@<a href="' + user.url + '"><span class="' + user.class + '">' + m1 + '</span></a>';
					}
					else {
						return match;
					}
				}));
			});
			dbg("[TwitColorize] Colorization ended");
		};

		dbg("[Init] Starting");
		// Adding buttons
		$(".bbsmiles").before('<div style="text-align:right;"><input type="checkbox" id="twit_autoc" ' + (twit_auto_complete ? 'checked="checked"' : '') + '/> Auto-complétion des twits | <input type="checkbox" id="twit_color" ' + (twit_color ? 'checked="checked"' : '') + '/> Coloration des twits <br /></style>')

		// Twit autocomplete
		$("#twit_autoc").change(function() {
			twit_auto_complete = $(this).attr("checked") == "checked" ? true : false;
			dbg("[AutoCTwit] is " + twit_auto_complete);
			opt.set(module_name, "twit_auto_complete", twit_auto_complete);
		});
		$("#quickpost").keydown(jOnKeydown);
		// On edit button click
		$("#forums").on("click", "a[href^=#post]", function() {
			var postId = $(this).attr("href").substr(5);
			// If the editbox poped
			if($("#editbox" + postId).length) {
				dbg("[AutoCTwit] Editbox poped (" + postId + ") - Listening to keydown");
				// Listen for twit autocomplete in editbox
				$("#editbox" + postId).keydown(jOnKeydown);

				var waitMore = function(postId) {
					if($("#editbox" + postId).length) {
						setTimeout(waitMore, 100, postId);
						return;
					}
					else {
						dbg("[TwitColorize] Edit is done - Colorize");
						colorizeTwits(postId);
					}
				}
				var bindEditButton = function() {
					// On edit validation
					$("#bar" + postId + " input:nth(1)").click(function() {
						// Can't track DOM modification event, just wait a reasonnable amount of time to colorize the edited message
						waitMore(postId);
					});
				};
				var bindPrevButton = function() {
					$("#bar" + postId + " input:nth(0)").click(function() {
						bindEditButton();
						bindPrevButton();
					});
				};

				bindEditButton();
				bindPrevButton();
			}
		});

		// Building pseudos hashmap
		$('span[class^=userclass]').each(function() {
			pseudos[$(this).text().toLowerCase()] = { pseudo: $(this).text(), class: $(this).attr("class"), url: $(this).parent().attr("href") };
		});

		// Twit colorization
		$("#twit_color").change(function() {
			twit_color = $(this).attr("checked") == "checked" ? true : false;
			dbg("[TwitColorize] is " + twit_color);
			opt.set(module_name, "twit_color", twit_color);
		});
		colorizeTwits();

		dbg("[Init] Ready");
	}
};