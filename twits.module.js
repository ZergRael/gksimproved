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
	dText: "Twits",
	pages: [
		{ path_name: "/forums.php", params: { action: 'viewtopic' }, options: { twit_color: { scanArea: "div[id^=content]" }, twit_autoc: { scanArea: "#quickpost" } } },
		{ path_name: "/blog/", params: { id: '*' }, options: { twit_color: { scanArea: ".blog_comment" }, twit_autoc: { scanArea: "#new_blog_comm" } } }, // Not editable
		{ path_name: "/torrent/\\d+/.*/?", options: { twit_color: { scanArea: ".comtable_content" }, twit_autoc: { scanArea: "#quickpost" } } },
		{ path_name: "/com/", params: { id: '*' }, options: { twit_color: { scanArea: ".comtable_content" }, twit_autoc: { scanArea: "#quickpost" } } }
		//{ path_name: "/com/", params: { editid: '*' }, options: { twit_autoc: { scanArea: "textarea" } } } // Can't autocomplete since we can't build pseudos hashmap
	],
	loaded: false,
	loadModule: function(mOptions) {
		this.loaded = true;
		var module_name = this.name;
		var dbg = function(str) {
			_dbg(module_name, str);
		};

		dbg("[Init] Loading module");

		var autocKey = 9;
		var iPseudo = false;
		var pseudos_matchs = [];
		var jOnKeydown = function(e) {
			var qp = $(this);
			var qp_text = qp.val();
			if(opt.get(module_name, "twit_auto_complete") && e.which == autocKey) {
				dbg("[AutoCTwit] Trying to autoc");

				var matchingAts = qp_text.match(/\B@\w+/g);
				var selStart = $(this).get(0).selectionStart;
				if(!matchingAts || selStart != $(this).get(0).selectionEnd) {
					return;
				}

				dbg("[AutoCTwit] Starting");
				// Find out if the cursor is near a matching at
				var matchingAtToAuto = -1, lastMatchEnd = 0, matchStart = 0;
				$.each(matchingAts, function(i, atPseudo) {
					matchStart = qp_text.indexOf(atPseudo, lastMatchEnd);
					dbg("[AutoCTwit] Finding the right match [" + atPseudo + "] " + matchStart + " <= " + selStart + " <= " + (matchStart + (atPseudo.length + 1)));
					if(matchStart <= selStart && selStart <= matchStart + (atPseudo.length + 1)) {
						matchingAtToAuto = i;
						dbg("[AutoCTwit] Got it !");
						return false;
					}
					lastMatchEnd = matchStart + (atPseudo.length + 1); // Avoid matching the same occurence multiple times and force cycling
				});
				// Cursor is too far away, end it
				if(matchingAtToAuto == -1) {
					return;
				}

				e.preventDefault();
				var textToAutoc = matchingAts[matchingAtToAuto]; // Take match we found
				if(iPseudo === false) {
					dbg("[AutoCTwit] First tab - Build array");
					var lowerOriginalText = textToAutoc.substring(1).toLowerCase(); // Pre lowerCase - Avoid it in loop
					iPseudo = 0; // Reset pos in array - Indicates we're actively rotating through the array
					pseudos_matchs = [];
					$.each(pseudos, function(lowerPseudo, userData) {
						if(lowerPseudo.indexOf(lowerOriginalText) === 0) {
							pseudos_matchs.push("@" + userData.pseudo); // Simple array, easier to loop
						}
					});
					pseudos_matchs.sort(); // Alphabetical sort
					pseudos_matchs.unshift(textToAutoc); // Insert original text at 0
				}

				if(pseudos_matchs.length == 1) {
					return;
				}

				iPseudo = iPseudo >= pseudos_matchs.length - 1 ? 0 : iPseudo + 1;
				dbg("[AutoCTwit] Found a match : [" + textToAutoc + "] > " + pseudos_matchs[iPseudo]);
				qp.val(qp_text.substr(0, matchStart) + pseudos_matchs[iPseudo] + (iPseudo == 0 ? '' : ' ') + qp_text.substr(matchStart + textToAutoc.length + (iPseudo == 1 ? 0 : 1)));
			}
			else {
				iPseudo = false;
			}
		};

		var colorizeTwits = function(postId) {
			if(!opt.get(module_name, "twit_color")) {
				return;
			}
			var postArea = $(mOptions.twit_color.scanArea);
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

		var pseudos = {};
		var buildPseudosHashmap = function() {
			pseudos = {};
			$('span[class^=userclass]').each(function() {
				pseudos[$(this).text().toLowerCase()] = { pseudo: $(this).text(), class: $(this).attr("class"), url: $(this).parent().attr("href") };
			});
		};

		dbg("[Init] Starting");

		// Twit autocomplete
		$(document).on("reactivate_keydown_listenner", function() {
			dbg("[AutoCTwit] Retry to bind");
			$(mOptions.twit_autoc.scanArea).keydown(jOnKeydown);
		});
		if(mOptions.twit_autoc) {
			$(mOptions.twit_autoc.scanArea).keydown(jOnKeydown);
		}

		if(mOptions.twit_color) {
			$(document).on("recolor_twits", function() {
				colorizeTwits();
			});
		}

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
		buildPseudosHashmap();

		// Twit colorization
		if(mOptions.twit_color) {
			colorizeTwits();
		}

		$(document).on("endless_scrolling_insertion_done", function() {
			buildPseudosHashmap();
		});

		dbg("[Init] Ready");
	}
};