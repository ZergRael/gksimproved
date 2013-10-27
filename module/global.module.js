modules.global = {
	name: "global",
	dText: "Global",
	loaded: false,
	loadModule: function(mOptions) {
		this.loaded = true;
		var module_name = this.name;
		var dbg = function(str) {
			utils.dbg(module_name, str);
		};

		dbg("[Init] Loading module");
		// Loading all functions used

		var listenToCtrlEnter = function() {
			dbg("[CtrlEnterValidator] Listening to keys");
			$('textarea').live('keydown', function(e) {
				if(!opt.get(module_name, "form_validation") || (!e.ctrlKey && !e.metaKey)) {
					return;
				}

				if (e.which == 13) {
					var submitButton = $(this).closest('form').find('input[type=submit]');
					if(!submitButton.length) {
						submitButton = $(this).closest('tbody').find('input[value=" Envoyer "]');
					}
					submitButton.click();
				}
			});
		};

		var listenToBBCodeShortcuts = function() {
			dbg("[BBCodeShortcuts] Listening to keys");
			$("form textarea").live('keydown', function(e) {
				if(!opt.get(module_name, "bbcode_shortcuts") || (!e.ctrlKey && !e.metaKey)) {
					return;
				}

				if(!$(".bbsmiles").length) {
					return;
				}

				var bbcode = false;
				switch(e.which) {
					case 66: // B
						bbcode = '.bbcode-b';
						break;
					case 73: // I
						bbcode = '.bbcode-i';
						break;
					case 85: // U
						bbcode = '.bbcode-u';
						break;
					case 81: // Q
						bbcode = '.bbcode-quote';
						break;
					default:
						return;
				}

				e.preventDefault();
				dbg("[BBCodeShortcuts] Got a BBCode key : " + bbcode);
				var i = 1;
				var dom_smileys = $(this);
				while(dom_smileys.siblings(".bbsmiles").length == 0 && i < 4) {
					dom_smileys = dom_smileys.parent();
					i++;
				}
				dom_smileys.siblings(".bbsmiles").find(bbcode).click();
			});
		};

		var getOptionChilds = function(module_name, parent) {
			var childs = [];
			$.each(opt.options[module_name], function(option, oData) {
				if(oData.parent && oData.parent == parent) {
					childs.push(option);
					childs.concat(getOptionChilds(module_name, option));
				}
			});
			return childs;
		};

		var createOptionInput = function(module_name, option_name, oData) {
			var optionHtml = "";
			if(oData.type == 'select') {
				var optionChoices = "";
				$.each(oData.choices, function(k, optionChoice) {
					optionChoices += '<option value="' + optionChoice + '"' + (oData.val == optionChoice ? ' selected="selected"' : '') + '>' + optionChoice + '</option>';
				});
				optionHtml = '<select id="gksi_' + module_name + '_' + option_name + '" ' + (oData.parent && !opt.get(module_name, oData.parent) ? 'disabled="disabled" ': '') + '>' + optionChoices + '</select><label for="gksi_' + module_name + '_' + option_name + '"' + (oData.tooltip ? ' title="' + oData.tooltip + '"' : '') + '>' + oData.dispText + '</label><br />';
			}
			else if(oData.type == 'text') {
				optionHtml = '<input type="text" id="gksi_' + module_name + '_' + option_name + '" ' + (oData.parent && !opt.get(module_name, oData.parent) ? 'disabled="disabled" ': '') + 'value="' + opt.get(module_name, option_name) + '"' + ' size="' + oData.width + '"/> <input id="gksi_' + module_name + '_' + option_name + '_savebutton" type="button" value="Ok"/> <label for="gksi_' + module_name + '_' + option_name + '"' + (oData.tooltip ? ' title="' + oData.tooltip + '"' : '') + '>' + oData.dispText + '</label><br />';
			}
			else {
				optionHtml = '<input type="checkbox" id="gksi_' + module_name + '_' + option_name + '" ' + (oData.parent && !opt.get(module_name, oData.parent) ? 'disabled="disabled" ': '') + (opt.get(module_name, option_name) ? 'checked="checked"' : '') + '/><label for="gksi_' + module_name + '_' + option_name + '"' + (oData.tooltip ? ' title="' + oData.tooltip + '"' : '') + '>' + oData.dispText + '</label><br />';
			}
			if(oData.sub_options) {
				var subOptionHtml = "";
				$.each(oData.sub_options, function(s_option, s_oData) {
					if(s_oData.showInOptions) {
						subOptionHtml += '<span id="gksi_' + module_name + '_' + option_name + '_' + s_option + '_span"><input type="checkbox" id="gksi_' + module_name + '_' + option_name + '_' + s_option + '" ' + (opt.sub_get(module_name, option_name, s_option) ? 'checked="checked"' : '') + '/><label for="gksi_' + module_name + '_' + option_name + '_' + s_option + '"' + (s_oData.tooltip ? ' title="' + s_oData.tooltip + '"' : '') + '>' + s_oData.dispText + '</label><br /></span>';
					}
				});
				optionHtml += '<div id="gksi_' + module_name + '_s_' + option_name + '" class="gksi_options_sub">' + subOptionHtml + '</div>';
			}
			return '<span id="gksi_' + module_name + '_' + option_name + '_span">' + optionHtml + '</span>';
		};

		var createOptionsFrame = function() {
			var optionsFrameData = "";
			// Full options pannel
			var optionsFrameHeader = '<div class="gksi_options_header_button">Tout</div>';

			dbg("[Options] Building frame");
			$.each(opt.options, function(module_name, options) {
				var optionsSection = '<div id="gksi_options_data_' + module_name + '" class="gksi_options_section"><div class="gksi_frame_section_header">' + modules[module_name].dText + '</div>';
				var showSection = false;
				$.each(options, function(option, oData) {
					if(oData.showInOptions) {
						optionsSection += createOptionInput(module_name, option, oData);
						showSection = true;
					}
				});
				optionsSection += '</div>';
				if(showSection) {
					// If there is no options to be shown for this section, just skip the whole div
					optionsFrameHeader += '<div class="gksi_options_header_button" section="' + module_name + '">' + modules[module_name].dText + '</div>';
					optionsFrameData += optionsSection;
				}
			});

			var onCloseCallback = function() {
				var section = $(".gksi_options_header_button_selected").attr("section");
				opt.set(module_name, "options_section", section);
			}

			// { id, classes, title, header, data, relativeToId, relativeToObj, relativeToWindow, top, left, css, buttons = [ /* close is by default */ { b_id, b_text, b_callback} ], underButtonsText }
			var copyright = '<a href="/forums.php?action=viewtopic&topicid=6336">GKSi</a> by <a href="/users/2360140">ZergRael</a>'
			appendFrame({ id: "options", title: "GKSi Options", data: optionsFrameData, relativeToId: "navigation", top: 8, left: 230, header: optionsFrameHeader, onCloseCallback: onCloseCallback, underButtonsText: copyright });

			$.each(opt.options, function(module_name, options) {
				if(!$("#gksi_options_data_" + module_name).length) {
					// Since the section is not even shown, don't cycle through all options
					return;
				}

				$.each(options, function(option, oData) {
					if(oData.showInOptions) {
						var childs = getOptionChilds(module_name, option);

						if(!oData.type || oData.type == 'select') {
							$("#gksi_" + module_name + "_" + option).change(function() {
								var state = null;
								if($(this).is('select')) {
									state = $(this).val();
								}
								else {
									state = $(this).attr("checked") == "checked" ? true : false;
								}
								opt.set(module_name, option, state);
								utils.dbg(module_name, "[" + option + "] is " + opt.get(module_name, option));
								if(oData.callback) {
									oData.callback(state);
								}
								if(oData.sub_options) {
									if(state) {
										$("#gksi_" + module_name + "_s_" + option).slideDown();
									}
									else {
										$("#gksi_" + module_name + "_s_" + option).slideUp();
									}
								}

								if(childs.length) {
									$.each(childs, function(i, child) {
										if(state) {
											$("#gksi_" + module_name + "_" + child).attr("disabled", false);
										}
										else {
											$("#gksi_" + module_name + "_" + child).attr("checked", false);
											$("#gksi_" + module_name + "_" + child).triggerHandler("change");
											$("#gksi_" + module_name + "_" + child).attr("disabled", true);
										}
									});
								}
							});
						}
						else if(oData.type == 'text') {
							$("#gksi_" + module_name + "_" + option + "_savebutton").click(function() {
								var val = $("#gksi_" + module_name + "_" + option).val();
								if(oData.regex) {
									if(!oData.regex.test(val)) {
										opt.set(module_name, option, oData.defaultVal);
										$("#gksi_" + module_name + "_" + option).val(opt.get(module_name, option))
										return;
									}
								}
								opt.set(module_name, option, val);
								utils.dbg(module_name, "[" + option + "] is " + opt.get(module_name, option));
								if(oData.callback) {
									oData.callback(state);
								}
							});
						}

						if(oData.sub_options) {
							$.each(oData.sub_options, function(s_option, s_oData) {
								$("#gksi_" + module_name + "_" + option + "_" + s_option).change(function() {
									if(s_oData.showInOptions) {
										opt.sub_set(module_name, option, s_option, $(this).attr("checked") == "checked" ? true : false);
										utils.dbg(module_name, "[" + option + "][" + s_option + "] is " + opt.sub_get(module_name, option, s_option));
									}
								});
							});
							if(!opt.get(module_name, option)) {
								$("#gksi_" + module_name + "_s_" + option).hide();
							}
						}

						if(oData.parent) {
							$("#gksi_" + module_name + "_" + option + "_span").hover(function() {
								$("#gksi_" + module_name + "_" + oData.parent + "_span").addClass("gksi_option_required");
							}, function() {
								$("#gksi_" + module_name + "_" + oData.parent + "_span").removeClass("gksi_option_required");
							});
						}
					}
				});
			});

			$(".gksi_options_header_button").hover(function() {
				$(".gksi_options_header_button").removeClass("gksi_options_header_button_selected");
				$(this).addClass("gksi_options_header_button_selected");
					
				var section = $(this).attr("section");
				if(section) {
					$(".gksi_options_section").hide();
					$("#gksi_options_data_" + section).show();
				}
				else {
					$(".gksi_options_section").show();
				}
			}, function() {
			});

			var section = opt.get(module_name, "options_section");
			if(section) {
				$(".gksi_options_header_button[section=" + section + "]").trigger("mouseenter");
			}
			else {
				$(".gksi_options_header_button:first-child").trigger("mouseenter")
			}

			dbg("[Options] Frame ready");
		};

		var timeOffset = 24 * 60 * 60 * 1000;
		var isStatUsable = function(stat) {
			return new Date().getTime() < (gData.get(stat, "last_check") + timeOffset);
		};
		modules.global.isStatUsable = isStatUsable;

		var insertRealStats = function() {
			if(!opt.get(module_name, "real_upload")) {
				return;
			}

			dbg("[real_stats] Started");
			if(!isStatUsable("real_stats")) {
				parseRealStats(writeRealStats(gData.get("real_stats", "real_upload"), gData.get("real_stats", "real_download"), gData.get("real_stats", "real_ratio"), gData.get("real_stats", "real_buffer")));
			}
			else {
				writeRealStats(gData.get("real_stats", "real_upload"), gData.get("real_stats", "real_download"), gData.get("real_stats", "real_ratio"), gData.get("real_stats", "real_buffer"));
			}
		};

		var writeRealStats = function(uploadStr, downloadStr, ratioStr, bufferStr) {
			dbg("[real_stats] Insert " + uploadStr + " / " + downloadStr + " / " + ratioStr);
			$("#userlink li:nth(1) span:nth(0)").after(' / <span class="uploaded">' + uploadStr + '</span>');
			$("#userlink li:nth(1) span:nth(2)").after(' / <span class="downloaded">' + downloadStr + '</span>');
			var ratioClass = Math.round(ratioStr * 10);
			$("#userlink li:nth(2) span:nth(0)").after(' / <span class="r' + (ratioClass >= 20 ? '20' : (ratioClass >= 10 ? '10' : '0' + ratioClass)) + '">' + ratioStr + '</span>');
			if($("#user_real_buffer").length) {
				$("#user_real_buffer").addClass(bufferStr > 0 ? 'uploaded' : 'downloaded').text(bufferStr);
			}
		};

		var parseRealStats = function(callback) {
			dbg("[real_stats] Grab pages & parse");
			var snatchedUrl = { host: pageUrl.host, path: "/m/peers/snatched", params: { page: 0 }, cancelQ: true };
			var maxPage = 0, realUpload = 0, readDownload = 0, realSnatched = 0, grabbedPages = 0;
			utils.grabPage(snatchedUrl, function(data) {
				var pager_align = $(data).find(".pager_align a");
				$.each(pager_align, function(i, pageUrl) {
					var pageId = pageUrl.href.match(/\d+/);
					if(!pageId.length) {
						return;
					}
					maxPage = Math.max(maxPage, Number(pageId[0]));
				});

				$(data).find("td[data-filesize]:nth-child(3n)").each(function() {
					realUpload += Number($(this).attr("data-filesize"));
				});

				$(data).find("td[data-filesize]:nth-child(5n)").each(function() {
					readDownload += Number($(this).attr("data-filesize"));
				});

				$(data).find("td:nth-child(6n)").each(function() {
					realSnatched += ($(this).text() != "Non Complété");
				});

				for(var i = 1; i <= maxPage; i++) {
					snatchedUrl.params.page = i;
					utils.grabPage(snatchedUrl, function(data) {
						$(data).find("td[data-filesize]:nth-child(3n)").each(function() {
							realUpload += Number($(this).attr("data-filesize"));
						});

						$(data).find("td[data-filesize]:nth-child(5n)").each(function() {
							readDownload += Number($(this).attr("data-filesize"));
						});

						$(data).find("td:nth-child(6n)").each(function() {
							realSnatched += ($(this).text() != "Non Complété");
						});
					}, function(){
						grabbedPages++;
						if(grabbedPages >= maxPage) {
							var realRatio = Math.round((realUpload / readDownload) * 100) / 100;
							var realBuffer = realUpload - readDownload;
							var uploadUnit = 0, downloadUnit = 0, bufferUnit = 0;
							while(realUpload > 1024) {
								uploadUnit++;
								realUpload /= 1024.0;
							}
							while(readDownload > 1024) {
								downloadUnit++;
								readDownload /= 1024.0;
							}
							while(realBuffer > 1024 || realBuffer < -1024) {
								bufferUnit++;
								realBuffer /= 1024.0;
							}
							var realUploadStr = Math.round(realUpload * 1000) / 1000 + " " + utils.sizeUnits[uploadUnit];
							var realDownloadStr = Math.round(readDownload * 1000) / 1000 + " " + utils.sizeUnits[downloadUnit];
							var realBufferStr = Math.round(realBuffer * 1000) / 1000 + " " + utils.sizeUnits[bufferUnit];
							dbg("[real_stats] Insert");
							gData.set("real_stats", "real_upload", realUploadStr);
							gData.set("real_stats", "real_download", realDownloadStr);
							gData.set("real_stats", "real_buffer", realBufferStr);
							gData.set("real_stats", "real_ratio", realRatio);
							gData.set("real_stats", "real_snatched", realSnatched);
							gData.set("real_stats", "last_check", new Date().getTime());
							if(callback)
								callback();
						}
					});
				}
			});
		};
		modules.global.parseRealStats = parseRealStats;

		var fetchBookmarks = function(force) {
			if(!force && new Date().getTime() < (gData.get("bookmarks", "last_check") + timeOffset)) {
				return;
			}
			dbg("[fetchBookmarks] Grab bookmarks");
			var snatchedUrl = { host: pageUrl.host, path: "/bookmark/" };
			utils.grabPage(snatchedUrl, function(data) {
				modules.global.parseBookmarks($(data).find("#torrent tbody:first tr"));
			});
		}

		var parseBookmarks = function(torrents) {
			gData.set("bookmarks", "last_check", new Date().getTime());
			if(!torrents.length) {
				dbg("[parseBookmarks] No bookmarks found - Bail out");
				gData.set("bookmarks", "torrents", []);
				return;
			}

			var torrentIds = [];
			var bookmarkIds = {};
			torrents.each(function() {
				var torrentLink = $(this).find("a:nth(1)").attr("href");
				var torrentId = torrentLink.substring(9, torrentLink.lastIndexOf('/'));
				torrentIds.push(torrentId);
				var bookmarkLink = $(this).find("a:nth(0)").attr("onclick");
				bookmarkIds[torrentId] = bookmarkLink.substring(8, bookmarkLink.indexOf("\","));
			});
			gData.set("bookmarks", "torrents", torrentIds);
			gData.set("bookmarks", "bookmarkIds", bookmarkIds);
			dbg("[parseBookmarks] Found " + torrentIds.length + " bookmarks");
		};
		modules.global.parseBookmarks = parseBookmarks;

		var addSeachButtons = function() {
			if(!opt.get(module_name, "search_buttons")) {
				return;
			}

			dbg("[searchButtons] Setting listeners");
			$("#searchbars .inline").each(function() {
				var searchDiv = $(this);
				searchDiv.prepend('<div class="search_button"></div>');
				searchDiv.find("input").on("keyup paste", function() {
					var t = $(this);
					setTimeout(function() {
						onSearchInput(t.val(), searchDiv);
					}, 100);
				});
			});
		};

		var onSearchInput = function(val, searchDiv) {
			if(val != "" && val != "Torrents" && val != "Requests" && val != "Summary" && val != "Forums" && val != "Wiki" && val != "Logs") {
				var button = searchDiv.find(".search_button");
				if(!button.hasClass("search_button_usable")) {
					button.addClass("search_button_usable").click(function() {
						$(this).parents("form").submit();
						dbg("[searchButtons] Submit");
					});
				}
			}
			else {
				searchDiv.find(".search_button").removeClass("search_button_usable").off("click");
			}
		};

		var refreshBookmarksOnBookmark = function() {
			$("a[onclick]").live("click", function() {
				var aLink = $(this);
				if(aLink.attr("onclick").indexOf("booktorrent") != -1) {
					dbg("[bookmarkRefresh] Bookmark added - Force refresh");
					fetchBookmarks(true);
					if($(this).parent().hasClass("added")) {
						var cross = $(this).parents("tr").prev().find("td:nth(1) img:nth(0)");
						if(cross && gData.get("bookmarks", "torrents").indexOf(cross.attr("id").substring(6)) == -1) {
							cross.after('<img src="' + chrome.extension.getURL("images/bookmark.png") + '" />');
						}
					}
				}
				if(aLink.attr("onclick").indexOf("delbookmark") != -1) {
					dbg("[bookmarkRefresh] Bookmark deleted - Force refresh");
					fetchBookmarks(true);
				}
			});
		};

		var showBuffer = function() {
			if(!$("#user_buffer").length) {
				var bufferVal = utils.strToSize($("#userlink .uploaded:first").text()).koTot - utils.strToSize($("#userlink .downloaded:first").text()).koTot;
				var bufferUnit = 0;
				while(bufferVal > 1024 || bufferVal < -1024) {
					bufferUnit++;
					bufferVal /= 1024.0;
				}
				var bufferText = '<span class="' + (bufferVal > 0 ? 'uploaded' : 'downloaded') + '">' + (Math.round(bufferVal * 1000) / 1000) + " " + utils.sizeUnits[bufferUnit] + '</span>';
				if(opt.get(module_name, "real_upload") && gData.get("real_stats", "real_buffer")) {
					bufferText += ' / <span id="user_real_buffer" class="' + (gData.get("real_stats", "real_buffer") > 0 ? 'uploaded' : 'downloaded') + '">' + gData.get("real_stats", "real_buffer") + '</span>';
				}
				$(this).after('<li id="user_buffer">Buffer: ' + bufferText + '</li>');
			}
			else {
				$("#user_buffer").show();
			}
		};

		dbg("[Init] Starting");
		// Execute functions

		var optionsFrameButtons = '<li><a href="#" id="options_gksi">GKSi Options</a></li>';
		$("#navig_bloc_user ul").append(optionsFrameButtons);
		$("#options_gksi").click(function() {
			if($("#gksi_options").length) {
				var optionsFrame = $("#gksi_options");
				if(optionsFrame.is(":visible")) {
					optionsFrame.hide();
				}
				else {
					optionsFrame.show();
				}
			}
			else {
				createOptionsFrame();
			}
			return false;
		});
		if(opt.get(module_name, "buffer")) {
			$("#userlink li:nth(1)").hover(showBuffer, function() {
				$("#user_buffer").hide();
			});
		}

		listenToCtrlEnter();
		listenToBBCodeShortcuts();
		insertRealStats();
		fetchBookmarks();
		addSeachButtons();
		refreshBookmarksOnBookmark();

		dbg("[Init] Ready");
	}
};