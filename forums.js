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
var loadModule = false;
var forums_authorized = ["/forums.php"];
if($.inArray(url.path[0], forums_authorized) != -1) {
	if(url.params && url.params.action == "viewtopic") {
		loadModule = true;
	}
}

if(loadModule) {
	var module = {name:"forums"};
	var dbg = function(str) {
		_dbg("Forums", str);
	}

	dbg("[Init] Loading module");
	module.buttons = ".bbsmiles";

	var twit_auto_complete = opt.get(module.name, "twit_auto_complete");;
	var autocKey = 9;
	var nChars = 1;
	var pseudos = {};
	var origPseudo = false;
	var lastTry = false;
	var jOnKeydown = function(e) {
		var qp_text = $("#quickpost").val()
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
					if(k.toLowerCase().indexOf(pseudo_s) === 0) {
						dbg("[AutoCTwit] Found a match : " + k);
						lastTry = k.toLowerCase();
						$("#quickpost").val(qp_text.substring(0, at + 1) + k + qp_text.substring(at + 1 + pseudo_s.length, qp_text.length));
						return false;
					}
				});
			}
			else if(origPseudo) {
				var tryAnother = false;
				$.each(pseudos, function(k, v) {
					if(k.toLowerCase().indexOf(lastTry) === 0) {
						tryAnother = true;
						return;
					}
					if(tryAnother && k.toLowerCase().indexOf(origPseudo) === 0) {
						dbg("[AutoCTwit] Found another match : " + k);
						lastTry = k.toLowerCase();
						$("#quickpost").val(qp_text.substring(0, at + 1) + k + qp_text.substring(at + 1 + lastTry.length, qp_text.length));
					}
				});
			}
		}
		else {
			origPseudo = false;
		}
	};

	var twit_color = true;
	var colorizeTwits = function() {
		dbg("[TwitColorize] Colorization start");
		$("div[id^=content]").each(function() {
			var post = $(this);
			var postContent = post.html();
			var at = postContent.indexOf("@");
			while(at != -1) {
				var postContent_end = postContent.substring(at + 1)
				pseudo_s = postContent_end.split(" ", 1)[0].toLowerCase();

				$.each(pseudos, function(k, v) {
					if(k.toLowerCase() === pseudo_s.toLowerCase()) {
						dbg("[TwitColorize] Found a match : " + k);
						post.html(postContent.substring(0, at + 1) + '<a href="' + v.url + '"><span class="' + v.class + '">' + k + '</span></a>' + postContent.substring(at + 1 + pseudo_s.length, postContent.length));
						return false;
					}
				});

				at = postContent.indexOf("@", at + 1);
			}
		});
	};

	$(module.buttons).prepend('<input type="checkbox" id="twit_autoc" ' + (twit_auto_complete ? 'checked="checked"' : '') + '/> Auto-complétion des twits | <input type="checkbox" id="twit_color" ' + (twit_color ? 'checked="checked"' : '') + '/> Coloration des twits <br />')

	$("#twit_autoc").change(function() {
		twit_auto_complete = $(this).attr("checked") == "checked" ? true : false;
		dbg("[AutoCTwit] is " + twit_auto_complete);
		opt.set(module.name, "twit_auto_complete", twit_auto_complete);
	});
	$("#quickpost").keydown(jOnKeydown);
	$('span[class^=userclass]').each(function() {
		pseudos[$(this).text()] = {class: $(this).attr("class"), url: $(this).parent().attr("href")};
	});

	$("#twit_color").change(function() {
		twit_color = $(this).attr("checked") == "checked" ? true : false;
		dbg("[TwitColorize] is " + twit_color);
		opt.set(module.name, "twit_color", twit_color);
	});
	colorizeTwits();
}