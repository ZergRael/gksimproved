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

		var userId = utils.getUserId();

		dbg("[Init] Loading module");
		// Loading all functions used

		var badgesData = [
			{	// Snatched -- 0
				badges: [ 
					{ url: "firstsnatched", trigger: 1, tip: "First Snatch : Vous avez compl&eacute;t&eacute; votre 1er torrent !" },
					{ url: "novicesnatched", trigger: 10, tip: "Novice Snatcher : Vous avez t&eacute;l&eacute;charg&eacute; plus de 10 Torrents" },
					{ url: "hundredsnatched", trigger: 100, tip: "100 Snatched : Vous avez d&eacute;j&agrave; compl&eacute;t&eacute; 100 Torrents" },
					{ url: "goodsnatched", trigger: 500, tip: "Snatcher confirm&eacute; : Vous avez t&eacute;l&eacute;charg&eacute; plus de 500 Torrents" },
					{ url: "mastersnatched", trigger: 1000, tip: "Master Snatcher : Vous avez t&eacute;l&eacute;charg&eacute; plus de 1000 Torrents" }
				],
				name: "snatched",
				func: function() {
					if(!modules.global.isDataUsable("real_stats") || !gData.get("real_stats", "real_snatched")) {
						modules.global.parseRealStats(function() {
							badgesData[0].val = gData.get("real_stats", "real_snatched");
							set_badge_row(0);
						});
					}
					return gData.get("real_stats", "real_snatched");
				}
			},
			{	// Seeds -- 1
				badges: [ 
					{ url: "aurabegginer", trigger: 10, tip: "Aura Beginner : Vous avez eu 10 torrents en seed" },
					{ url: "aurarookie", trigger: 100, tip: "Aura Rookie : Vous avez eu 100 torrents en seed" },
					{ url: "auraexpert", trigger: 300, tip: "Aura Expert : Vous avez eu 300 torrents en seed" },
					{ url: "auramaster", trigger: 500, tip: "Aura Master : Vous avez eu 500 torrents en seed" },
					{ url: "auragod", trigger: 1000, tip: "Aura God : Vous avez eu 1000 torrents en seed" }
				],
				dom: "#contenu .upload:first",
				regex: /([\d,]+)/,
				name: "seeds"
			},
			{	// Uploads -- 2
				badges: [ 
					{ url: "uploadbegginer", trigger: 1, tip: "Upload Beginner : Vous avez upload&eacute; votre premier torrent" },
					{ url: "uploadrookie", trigger: 10, tip: "Upload Rookie : Vous avez upload&eacute; au moins 10 torrents" },
					{ url: "uploadeur", trigger: 100, tip: "UpLoadeur : Vous avez upload&eacute; au moins 100 torrents" },
					{ url: "awesomeuploader", trigger: 500, tip: "Awesome Uploader : Vous avez upload&eacute; au moins 500 torrents" },
					{ url: "uploadmaster", trigger: 1000, tip: "Upload Master : Vous avez upload&eacute; au moins 1000 torrents" }
				],
				p_nth: 17,
				modifier: { ".usr-invited_by": 1 },
				regex: /(\d+)/,
				name: "uploads"
			},
			{	// Forum posts -- 3
				badges: [ 
					{ url: "timide", trigger: 1, tip: "Timide : Vous avez fait votre premier Post" },
					{ url: "forumeur", trigger: 100, tip: "Pro ? : D&eacute;ja 100 Posts sur le forum !" },
					{ url: "forumateur", trigger: 500, tip: "Forumateur : D&eacute;j&agrave 500 Posts sur le forum..." },
					{ url: "grandmalade", trigger: 1000, tip: "Grand Malade : D&eacute;j&agrave; 1000 Posts sur le forum..." },
					{ url: "hugochavez", tip: "Hugo Chavez personnifi&eacute; : Dafuq ???" }
				],
				p_nth: 10,
				regex: /([\d,]+) \//,
				name: "forum"
			},
			{	// Twits received -- 4
				badges: [ 
					{ url: "followed", trigger: 50, tip: "Followed : Vous avez &eacute;t&eacute; twitt&eacute; 50 fois" },
					{ url: "lightened", trigger: 100, tip: "Lightened : Vous avez &eacute;t&eacute; twitt&eacute; 100 fois" },
					{ url: "mosttwitted", trigger: 200, tip: "Most Twitted : Vous avez &eacute;t&eacute; twitt&eacute; 200 fois" },
					{ url: "spotted", trigger: 500, tip: "Spotted : Vous avez &eacute;t&eacute; twitt&eacute; 500 fois" },
					{ url: "twitterowner", trigger: 1000, tip: "Twitter Owner : Vous avez &eacute;t&eacute; twitt&eacute; 1000 fois" }
				],
				dom: "#contenu .separate",
				regex: /([\d,]+)/,
				name: "twits_rec"
			},
			{	// Requests added -- 5
				badges: [ 
					{ url: "firstrequest", trigger: 1, tip: "First Request : Vous avez effectu&eacute; votre 1&egrave;re requ&ecirc;te" },
					{ url: "requesttatator", trigger: 10, tip: "Request Tatator : Vous avez effectu&eacute; au moins 10 requ&ecirc;tes" },
					{ url: "requestlover", trigger: 50, tip: "Request Lover : Vous avez effectu&eacute; 50 requ&ecirc;tes" },
					{ url: "requestaddict", trigger: 100, tip: "Request Addict : Vous avez effectu&eacute; 100 requ&ecirc;tes" },
					{ url: "requesteater", trigger: 200, tip: "Request Eater : Vous avez effectu&eacute; 200 requ&ecirc;tes" }
				],
				p_nth: 18,
				modifier: { ".usr-invited_by": 1 },
				regex: /([\d,]+) \//,
				name: "req_added"
			},
			{	// Wiki edits -- 6
				badges: [ 
					{ url: "wikibeginner", trigger: 1, tip: "Wiki Beginner : 1 Article cr&eacute;&eacute; ou &eacute;dit&eacute" },
					{ url: "wikiuser", trigger: 10, tip: "Wiki User : 10 Articles cr&eacute;&eacute;s ou &eacute;dit&eacute;s" },
					{ url: "wikiexpert", trigger: 50, tip: "Wiki Expert : 50 Articles cr&eacute;&eacute;s ou &eacute;dit&eacute;s" },
					{ url: "wikicrazy", trigger: 100, tip: "Wiki Crazy : 100 Articles cr&eacute;&eacute;s ou &eacute;dit&eacute;s" },
					{ url: "wikimaster", trigger: 250, tip: "Wiki Master : 250 Articles cr&eacute;&eacute;s ou &eacute;dit&eacute;s" }
				],
				dom: "#contenu",
				regex: /([\d,]+) Wiki/,
				name: "wiki_edits"
			},
			{	// DL/Ratio -- 7
				badges: [ 
					{ url: "actionnaireovh", tip: "Actionnaire OVH : Vous avez compris le principe du ratio !" },
					{ url: "hadopiwanted", tip: "Hadopi Wanted : Un bon ratio et un bon upload, &ccedil;a se f&ecirc;te" },
					{ url: "actionnairewd", tip: "Actionnaire Western Digital : Vous allez remplir vos disques durs bien vite &agrave; cette vitesse" },
					{ url: "datacenterowner", tip: "Datacenter Owner : Vous &ecirc;tes un gros consommateur de torrents" }/*,
					{ url: "epenis", tip: "E-p&eacute;nis : Vous aimez faire des concours hein ? },
					{ url: "eboobz", tip: "E-Boobz : Vous aimez faire des concours hein ?" }*/
				],
				name: "dl_ratio"
			},
			{	// Karma -- 8
				badges: [ 
					{ url: "padawan", trigger: 1000, tip: "Padawan : +1000 de karma atteint" },
					{ url: "karmafull", trigger: 10000, tip: "Karma Stocker : Vous aimez conserver votre Karma" },
					{ url: "maitrezen", trigger: 50000, tip: "Maitre Zen : +50 000 de karma atteint" },
					{ url: "karmamaster", trigger: 100000, tip: "Karma Master : +100 000 de karma atteint" },
					{ url: "karmajedi", trigger: 500000, tip: "Yoda : + 500 000 de karma atteint !" }
				],
				val: utils.getKarmaTotal(),
				name: "karma"
			},
			{	// Requests filled -- 9
				badges: [ 
					{ url: "firstfiller", trigger: 1, tip: "First Filled : Vous avez fill&eacute; votre 1&egrave;re requ&ecirc;te" },
					{ url: "filleravise", trigger: 10, tip: "Filler Avis&eacute; : Vous avez fill&eacute; 10 requ&ecirc;tes" },
					{ url: "fillerfou", trigger: 50, tip: "Filler Fou : Vous avez fill&eacute; 50 requ&ecirc;tes" },
					{ url: "fillerexpert", trigger: 100, tip: "Filler Expert : Vous avez fill&eacute; 100 requ&ecirc;tes" },
					{ url: "fillermaster", trigger: 200, tip: "Filler Master : Vous avez fill&eacute; 200 requ&ecirc;tes" }
				],
				p_nth: 18,
				modifier: { ".usr-invited_by": 1 },
				regex: /\/ ([\d,]+)/,
				name: "req_fill"
			},
			{	// IRC words -- 10
				badges: [ 
					{ url: "ircnoob", trigger: 1000, tip: "IRC N00b : Vos premiers 1000 mots sur IRC, bienvenue !" },
					{ url: "ircuser", trigger: 5000, tip: "IRC User : Avec 5000 mots, on commence &agrave; vous conna&icirc;tre" },
					{ url: "ircexpert", trigger: 10000, tip: "IRC Expert : Vous avez d&eacute;j&agrave; &eacute;crit 10000 mots, vous &ecirc;tes un habitu&eacute;" },
					{ url: "ircaddict", trigger: 50000, tip: "IRC Addict : 50000 mots ! Grand orateur !" },
					{ url: "ircgod", trigger: 100000, tip: "IRC God : 100000 mots ! On entend que vous !" }
				],
				name: "irc_w"
			}
		];

		var badgesReqParse = [
			{ url: "/users/" + userId, sections: [1, 2, 3, 5, 8, 9] },
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
			// Parsing string to int
			$.each(badgesData, function(row, badgeBlock) {
				if(badgeBlock.strVal !== undefined) {
					badgeBlock.val = utils.strToInt(badgeBlock.strVal);
				}
				else if(badgeBlock.func) {
					badgeBlock.val = badgeBlock.func();
				}
			});
			// Inserting into DOM
			$.each(badgesData, function(row, badgeBlock) {
				set_badge_row(row);
			});
			dbg("[progress] Ended");
		};

		var set_badge_row = function(row) {
			badgeBlock = badgesData[row];
			if(badgeBlock.val !== undefined) {
				$("tbody tr").eq(row).find("td:not(:first)").each(function(i) {
					var badge = badgeBlock.badges[i];
					if(!badge || !badge.trigger) {
						return;
					}
					$(this).find(".gksi_progress").remove();
					$(this).append('<div class="gksi_progress"><div class="gksi_progress_area"><div class="gksi_progress_bar' + (badgeBlock.val >= badge.trigger ? ' gksi_valid' : '') + '" style="width: ' + (badgeBlock.val >= badge.trigger ? badge.trigger : badgeBlock.val) / badge.trigger * 100 + '%"></div><div class="gksi_progress_numbers">' + (badgeBlock.val >= badge.trigger ? badge.trigger : Math.round(badgeBlock.val)) + '/' + badge.trigger + '</div></div></div>');
				});
			}
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
		};

		var show_missing_tips = function() {
			if(!opt.get(module_name, "show_tip")) {
				return;
			}

			dbg("[show_tip] Showing missing tooltips");
			$("tbody tr").each(function(i_s) {
				$(this).find("td:not(:first)").each(function(i) {
					var b = badgesData[i_s].badges[i];
					if(!b || !b.tip) {
						return;
					}

					var img = $(this).find("img");
					if(img.attr("src").indexOf("soon") == -1 && !img.hasClass("halfOpacity")) {
						return;
					}
					img.tipTip({maxWidth: "auto", edgeOffset: 10, content: b.tip});
				});
			});
		};

		dbg("[Init] Starting");
		// Execute functions

		if(!mOptions.checkId || pageUrl.path.match(/(\d+)/)[1] == userId)
		{
			parse_progress();
			opt.setCallback(module_name, "progress", function(state) {
				if(state) {
					parse_progress();
				}
				else {
					$(".gksi_progress").remove();
				}
			})
		}

		show_missing_images();
		show_missing_tips();
		opt.setCallback(module_name, "show_img", function(state) {
			if(state) {
				show_missing_images();
			}
			else {
				$(".halfOpacity").attr("src", "https://s.gks.gs/static/images/badges/soon.png");
				$(".halfOpacity").removeClass("halfOpacity");
			}
		})
		opt.setCallback(module_name, "show_tip", function(state) {
			if(state) {
				show_missing_tips();
			}
			else {
				$(".halfOpacity, [src$='soon.png']").tipTip({maxWidth: "auto", edgeOffset: 10, content: "Badge soon"});
			}
		})

		dbg("[Init] Ready");
	}
};