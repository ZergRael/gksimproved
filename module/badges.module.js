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
modules.badges = {
	name: "badges",
	dText: "Badges",
	pages: [
		{ path_name: "/m/badges/", options: {} },
		{ path_name: "/badges/\\d+", options: { checkId: true } }
	],
	loaded: false,
	loadModule: function(mOptions) {
		this.loaded = true;
		var module_name = this.name;
		var dbg = function(str) {
			utils.dbg(module_name, str);
		};

		if(mOptions.checkId) {
			var userId = utils.getUserId();
			if(pageUrl.path.match(/(\d+)/)[1] != userId) {
				return;
			}
		}

		dbg("[Init] Loading module");
		// Loading all functions used

		var badgesData = [
			{	// Snatched -- 0
				badges: [ 
					{ url: "firstsnatched", trigger: 1 },
					{ url: "novicesnatched", trigger: 10 },
					{ url: "hundredsnatched", trigger: 100 },
					{ url: "goodsnatched", trigger: 500 },
					{ url: "mastersnatched", trigger: 1000 }
				],
				dom: "#contenu .separate em",
				regex: /([\d,]+)/,
				name: "snatched"
			},
			{	// Seeds -- 1
				badges: [ 
					{ url: "aurabegginer", trigger: 10 },
					{ url: "aurarookie", trigger: 100 },
					{ url: "auraexpert", trigger: 300 },
					{ url: "auramaster", trigger: 500 },
					{ url: "auragod", trigger: 1000 }
				],
				dom: "#contenu .upload:first",
				regex: /([\d,]+)/,
				name: "seeds"
			},
			{	// Uploads -- 2
				badges: [ 
					{ url: "uploadbegginer", trigger: 1 },
					{ url: "uploadrookie", trigger: 10 },
					{ url: "uploadeur", trigger: 100 },
					{ url: "awesomeuploader", trigger: 500 },
					{ url: "uploadmaster", trigger: 1000 }
				],
				p_nth: 17,
				modifier: { ".usr-invited_by": -1 },
				modifies_val: { 0: true },
				regex: /(\d+)/,
				name: "uploads"
			},
			{	// Forum posts -- 3
				badges: [ 
					{ url: "timide", trigger: 1 },
					{ url: "forumeur", trigger: 100 },
					{ url: "forumateur", trigger: 500 },
					{ url: "grandmalade", trigger: 1000 }
				],
				p_nth: 10,
				regex: /([\d,]+) \//,
				name: "forum"
			},
			{	// Twits received -- 4
				badges: [ 
					{ url: "followed", trigger: 50 },
					{ url: "lightened", trigger: 100 },
					{ url: "mosttwitted", trigger: 200 },
					{ url: "spotted", trigger: 500 },
					{ url: "twitterowner", trigger: 1000 }
				],
				dom: "#contenu .separate",
				regex: /([\d,]+)/,
				name: "twits_rec"
			},
			{	// Requests added -- 5
				badges: [ 
					{ url: "firstrequest", trigger: 1 },
					{ url: "requesttatator", trigger: 10 },
					{ url: "requestlover", trigger: 50 },
					{ url: "requestaddict", trigger: 100 },
					{ url: "requesteater", trigger: 200 }
				],
				p_nth: 18,
				modifier: { ".usr-invited_by": -1 },
				regex: /([\d,]+) \//,
				name: "req_added"
			},
			{	// Wiki edits -- 6
				badges: [ 
					{ url: "wikibeginner", trigger: 1 },
					{ url: "wikiuser", trigger: 10 },
					{ url: "wikiexpert", trigger: 50 },
					{ url: "wikicrazy", trigger: 100 },
					{ url: "wikimaster", trigger: 250 }
				],
				dom: "#contenu",
				regex: /([\d,]+) Wiki/,
				name: "wiki_edits"
			},
			{	// DL/Ratio -- 7
				badges: [ 
					{ url: "actionnaireovh" },
					{ url: "hadopiwanted" },
					{ url: "actionnairewd" },
					{ url: "datacenterowner" }/*,
					{ url: "epenis" },
					{ url: "eboobz" }*/
				],
				dom: false,
				name: "dl_ratio"
			},
			{	// Karma -- 8
				badges: [ 
					{ url: "padawan", trigger: 1000 },
					{ url: "karmafull", trigger: 10000 },
					{ url: "maitrezen", trigger: 50000 },
					{ url: "karmamaster", trigger: 100000 },
					{ url: "karmajedi", trigger: 500000 }
				],
				dom: false,
				val: utils.getKarmaTotal(),
				name: "karma"
			},
			{	// Requests filled -- 9
				badges: [ 
					{ url: "firstfiller", trigger: 1 },
					{ url: "filleravise", trigger: 10 },
					{ url: "fillerfou", trigger: 50 },
					{ url: "fillerexpert", trigger: 100 },
					{ url: "fillermaster", trigger: 200 }
				],
				p_nth: 18,
				modifier: { ".usr-invited_by": -1 },
				regex: /\/ ([\d,]+)/,
				name: "req_fill"
			},
			{	// IRC words -- 10
				badges: [ 
					{ url: "ircnoob", trigger: 1000 },
					{ url: "ircuser", trigger: 5000 },
					{ url: "ircexpert", trigger: 10000 },
					{ url: "ircaddict", trigger: 50000 },
					{ url: "ircgod", trigger: 100000 }
				],
				p_nth: 20,
				modifier: { ".usr-invited_by": -1 },
				regex: /([\d,]+)/,
				name: "irc_w"
			}
		];

		var badgesReqParse = [
			{ url: "/m/peers/snatched", sections: [0] },
			{ url: "/users/" + userId, sections: [1, 2, 3, 5, 8, 9, 10] },
			{ url: "/m/account/twits", sections: [4] },
			{ url: "/m/account/", sections: [6] }
		];

		var parse_progress = function() {
			if(!opt.get(module_name, "progress")) {
				return;
			}

			dbg("[progress] Showing progress");
			
			var lastGrab = false;
			var completedAjaxCalls = 0;
			$.each(badgesReqParse, function(i_url, url_section) {
				utils.grabPage({ host: pageUrl.host, path: url_section.url }, function(data) {
					var jData = $(data);
					$.each(url_section.sections, function(_, i_section) {
						var badgeBlock = badgesData[i_section];

						// Find directly by dom
						if(badgeBlock.dom) {
							badgeBlock.strVal = jData.find(badgeBlock.dom).text().match(badgeBlock.regex)[1];
							dbg("[progress] " + badgeBlock.name + " >> Got value [" + badgeBlock.strVal + "](" + typeof badgeBlock.strVal + ")");
						}

						// Find by p:nth
						if(badgeBlock.p_nth) {
							// p:nth modifiers
							if(badgeBlock.modifier) {
								$.each(badgeBlock.modifier, function(mod_class, mod_value) {
									if(jData.find(mod_class).length) {
										badgeBlock.p_nth += mod_value;
									}
								});
							}
							badgeBlock.strVal = jData.find("#contenu p:nth(" + badgeBlock.p_nth + ")").text().match(badgeBlock.regex)[1];
							dbg("[progress] " + badgeBlock.name + " >> Got value [" + badgeBlock.strVal + "](" + typeof badgeBlock.strVal + ")");
						}
					});
				},
				function() {
					completedAjaxCalls++;
					if(completedAjaxCalls >= badgesReqParse.length) {
						show_progress();
					}
				});
			});

			dbg("[progress] Ended requests");
		};

		var show_progress = function() {
			dbg("[progress] Ajax ended - Process & DOM insert");
			var domTr = $("tbody tr");
			// Parsing string to int
			$.each(badgesData, function(i_section, badgeBlock) {
				if(badgeBlock.strVal !== undefined) {
					badgeBlock.val = utils.strToInt(badgeBlock.strVal);
				}
			});
			// Applying modifiers
			$.each(badgesData, function(i_section, badgeBlock) {
				if(badgeBlock.val !== undefined) {
					if(badgeBlock.modifies_val) {
						$.each(badgeBlock.modifies_val, function(block, minus) {
							if(badgesData[block].val !== undefined) {
								badgesData[block].val += (minus ? -badgeBlock.val : badgeBlock.val);
								dbg("[progress] Modified " + badgesData[block].name + " by " + (minus ? -badgeBlock.val : badgeBlock.val));
							}
						});
					}
				}
			});
			// Inserting into DOM
			$.each(badgesData, function(i_section, badgeBlock) {
				if(badgeBlock.val !== undefined) {
					domTr.eq(i_section).find("td:not(:first)").each(function(i) {
						var badge = badgeBlock.badges[i];
						if(!badge || !badge.trigger) {
							return;
						}
						$(this).append('<div class="gksi_progress"><div class="gksi_progress_area"><div class="gksi_progress_bar' + (badgeBlock.val >= badge.trigger ? ' gksi_valid' : '') + '" style="width: ' + (badgeBlock.val >= badge.trigger ? badge.trigger : badgeBlock.val) / badge.trigger * 100 + '%"></div><div class="gksi_progress_numbers">' + (badgeBlock.val >= badge.trigger ? badge.trigger : Math.round(badgeBlock.val)) + '/' + badge.trigger + '</div></div></div>');
					});
				}
			});
			dbg("[progress] Ended");
		};

		var show_missing_images = function() {
			if(!opt.get(module_name, "show_img")) {
				return;
			}

			dbg("[show_img] Showing missing images");
			$("tbody tr").each(function(i_s) {
				$(this).find("td:not(:first)").each(function(i) {
					var b = badgesData[i_s].badges[i];
					if(!b || !b.url) {
						return;
					}

					var img = $(this).find("img");
					if(img.attr("src").indexOf("soon") == -1) {
						return;
					}

					img.attr("src", "https://s.gks.gs/static/images/badges/" + b.url + ".png");
					img.addClass("halfOpacity");
				});
			});
		}

		dbg("[Init] Starting");
		// Execute functions

		parse_progress();
		opt.setCallback(module_name, "progress", function(state) {
			if(state) {
				parse_progress();
			}
			else {
				$(".gksi_progress").remove();
			}
		})

		show_missing_images();
		opt.setCallback(module_name, "show_img", function(state) {
			if(state) {
				show_missing_images();
			}
			else {
				$(".halfOpacity").attr("src", "https://s.gks.gs/static/images/badges/soon.png");
				$(".halfOpacity").removeClass("halfOpacity");
			}
		})

		dbg("[Init] Ready");
	}
};