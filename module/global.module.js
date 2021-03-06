modules.global = {
	name: "global",
	dText: "Global",
	loaded: false,
	loadModule: function(mOptions) {
		this.loaded = true;
		var module_name = this.name;
		var dbg = function() {
			utils.dbg(module_name, arguments);
		};

		dbg("[Init] Loading module");
		// Loading all functions used

		var listenToCtrlEnter = function() {
			dbg("[CtrlEnterValidator] Listening to keys");
			$(document).on('keydown', 'textarea', function(e) {
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
			$(document).on('keydown', "form textarea", function(e) {
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
				dbg("[BBCodeShortcuts] Got a BBCode key : %s", bbcode);
				var i = 1;
				var dom_smileys = $(this);
				while(dom_smileys.siblings(".bbsmiles").length === 0 && i < 4) {
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
			return '<span id="gksi_' + module_name + '_' + option_name + '_span"' + (oData.indicateParent ? 'class="gksi_opt_has_parent"' : '') + '>' + optionHtml + '</span>';
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
			};

			var buttons = [ { b_id: "im_export", b_text: "Importer/Exporter", b_callback: createImportExportFrame } ];

			// { id, classes, title, header, data, relativeToId, relativeToObj, relativeToWindow, top, left, css, buttons = [ /* close is by default */ { b_id, b_text, b_callback} ], underButtonsText }
			var copyright = '<a href="/forums.php?action=viewtopic&topicid=6336">GKSi</a> by <a href="/users/2360140">ZergRael</a>';
			appendFrame({ id: "options", title: "GKSi Options", data: optionsFrameData, relativeToId: "navigation", top: 8, left: 230, buttons: buttons, header: optionsFrameHeader, onCloseCallback: onCloseCallback, underButtonsText: copyright });

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
									state = $(this).prop("checked");
								}
								opt.set(module_name, option, state);
								utils.dbg(module_name, "[%s] is %s", option, opt.get(module_name, option));
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
											$("#gksi_" + module_name + "_" + child).prop("disabled", false);
										}
										else {
											$("#gksi_" + module_name + "_" + child).prop("checked", false);
											$("#gksi_" + module_name + "_" + child).triggerHandler("change");
											$("#gksi_" + module_name + "_" + child).prop("disabled", true);
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
										$("#gksi_" + module_name + "_" + option).val(opt.get(module_name, option));
										return;
									}
								}
								opt.set(module_name, option, val);
								utils.dbg(module_name, "[%s] is %s", option, opt.get(module_name, option));
								if(oData.callback) {
									oData.callback(state);
								}
							});
						}

						if(oData.sub_options) {
							$.each(oData.sub_options, function(s_option, s_oData) {
								$("#gksi_" + module_name + "_" + option + "_" + s_option).change(function() {
									if(s_oData.showInOptions) {
										opt.sub_set(module_name, option, s_option, $(this).prop("checked"));
										utils.dbg(module_name, "[%s][%s] is %s", option, s_option, opt.sub_get(module_name, option, s_option));
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
			}, function() {});

			var section = opt.get(module_name, "options_section");
			if(section) {
				$(".gksi_options_header_button[section=" + section + "]").trigger("mouseenter");
			}
			else {
				$(".gksi_options_header_button:first-child").trigger("mouseenter");
			}

			dbg("[Options] Frame ready");
		};

		var createImportExportFrame = function() {
			$("#gksi_options_close").click();

			dbg("[Export] Generate link");
			var savedData = { opt: opt.exportAll(), gData: gData.exportAll() };
			var blob = new Blob([JSON.stringify(savedData)], {type: "application/json"});
			var url  = URL.createObjectURL(blob);

			var frameData = [
				'<div class="gksi_frame_section_header">Exporter</div>',
				'<a href="' + url + '" download="gksi.backup.json">Télécharger l\'export des options</a>',
				'<div class="gksi_frame_section_header">Importer</div>',
				'<input id="import_file" type="file" />',
				'<div id="import_result"></div>'
			];
			appendFrame({ id: "im_export", title: "GKSi Import/Export", data: frameData.join(""), relativeToId: "navigation", top: 8, left: 230 });
			$("#import_file").change(function() {
				var result = $("#import_result");
				dbg("[Import] Got file");
				result.html("Ouverture du fichier");
				var fileInput = $(this).get(0).files[0];
				if(fileInput) {
					var reader = new FileReader();
					reader.onload = function(e) {
						dbg("[Import] Reading file");
						result.html(result.html() + "<br />Lecture en cours");
						var file = e.target.result;
						if(file) {
							var obj = JSON.parse(file);
							if(obj && obj["opt"]) {
								dbg("[Import] Importing opt");
								result.html(result.html() + "<br />Import des options");
								opt.importAll(obj["opt"]);
							}
							if(obj && obj["gData"]) {
								dbg("[Import] Importing gData");
								result.html(result.html() + "<br />Import des données");
								gData.importAll(obj["gData"]);
							}
						}
						result.html(result.html() + "<br />Importation terminée. La page va être rafraîchie.");
						setTimeout(function() { window.location.reload(); }, 5000);
					};
					reader.readAsText(fileInput);
				}
			});
		};

		var timeOffsets = {
			"bookmarks": 24 * 60 * 60 * 1000,
			"real_stats": 24 * 60 * 60 * 1000,
			"episodes": 2 * 60 * 60 * 1000
		};
		var isDataUsable = function(data) {
			return new Date().getTime() < (gData.get(data, "last_check") + timeOffsets[data]);
		};
		modules.global.isDataUsable = isDataUsable;

		var insertRealStats = function() {
			if(!opt.get(module_name, "real_upload")) {
				return;
			}

			dbg("[real_stats] Started");
			if(!isDataUsable("real_stats")) {
				parseRealStats(function() {
					writeRealStats(gData.get("real_stats", "real_upload"), gData.get("real_stats", "real_download"), gData.get("real_stats", "real_ratio"), gData.get("real_stats", "real_buffer"));
				});
			}
			else {
				writeRealStats(gData.get("real_stats", "real_upload"), gData.get("real_stats", "real_download"), gData.get("real_stats", "real_ratio"), gData.get("real_stats", "real_buffer"));
			}
		};

		var writeRealStats = function(uploadStr, downloadStr, ratioStr, bufferStr) {
			dbg("[real_stats] Insert %s/%s/%s/%s", uploadStr, downloadStr, ratioStr, bufferStr);
			$("#userlink li:nth(1) span:nth(0)").after(' / <span class="uploaded">' + uploadStr + '</span>');
			$("#userlink li:nth(1) span:nth(2)").after(' / <span class="downloaded">' + downloadStr + '</span>');
			var ratioClass = Math.round(ratioStr * 10);
			$("#userlink li:nth(2) span:nth(0)").after(' / <span class="r' + (ratioClass >= 20 ? '20' : (ratioClass >= 10 ? '10' : '0' + ratioClass)) + '">' + ratioStr + '</span>');
			if($("#user_real_buffer").length) {
				$("#user_real_buffer").addClass(bufferStr > 0 ? 'uploaded' : 'downloaded').text(bufferStr);
			}
		};

		var parseRealStats = function(callback, retry) {
			dbg("[real_stats] Grab pages & parse");
			var maxPage = gData.get("real_stats", "max_snatched_pages"), actualMaxPage = maxPage, realUpload = 0, realDownload = 0, realSnatched = 0, grabbedPages = 0;

			var appendToVals = function(p, maxP, up, dl, snatched) {
				dbg("[real_stats] page [%d] came back", p);
				actualMaxPage = Math.max(maxP, p);
				realUpload += up;
				realDownload += dl;
				realSnatched += snatched;
				grabbedPages++;
				if(grabbedPages > maxPage) {
					dbg("[real_stats] Last page came in :: We got [%d] pages :: Last pageId displayed was [%d] :: We expected [%d]", grabbedPages, actualMaxPage, maxPage);
					if(actualMaxPage > maxPage) {
						dbg("[real_stats] Try again then");
						gData.set("real_stats", "max_snatched_pages", actualMaxPage);
						if(!retry) {
							parseRealStats(callback, true);
						}
						else {
							dbg("[real_stats] Oops, can't do that. Abort !");
						}
					}
					else {
						dbg("[real_stats] Done ajaxing");
						computeRealStats(realUpload, realDownload, realSnatched);
						if(callback) {
							callback();
						}
					}
				}
			};

			dbg("[real_stats] Fetching [%d] pages", maxPage);
			for (var i = 0; i <= maxPage; i++) {
				parseSnatchedPage(i, appendToVals, 2);
			}
		};
		modules.global.parseRealStats = parseRealStats;

		var parseSnatchedPage = function(page, callback, remainingTries) {
			if(!remainingTries) { return ; }
			dbg("[real_stats] Grabing page [%d] with [%d] tries remaining", page, remainingTries);
			utils.grabPage({ host: pageUrl.host, path: "/m/peers/snatched", params: { page: page }, cancelQ: true }, function(data, returnedPage) {
				var pager_align = $(data).find(".pager_align a");
				var maxPage = 0, realUpload = 0, realDownload = 0, realSnatched = 0;
				if(pager_align.length) {
					$.each(pager_align, function(i, pageUrl) {
						var pageId = pageUrl.href.match(/\d+/);
						if(!pageId.length) {
							return;
						}
						maxPage = Math.max(maxPage, Number(pageId[0]));
					});
				}

				$(data).find("td[data-filesize]:nth-child(3n)").each(function() {
					realUpload += Number($(this).attr("data-filesize"));
				});

				$(data).find("td[data-filesize]:nth-child(5n)").each(function() {
					realDownload += Number($(this).attr("data-filesize"));
				});

				$(data).find("td:nth-child(6n)").each(function() {
					realSnatched += ($(this).text() != "Non Complété");
				});
				if(callback) {
					callback(page, maxPage, realUpload, realDownload, realSnatched);
				}
			}, function() { /* onComplete */ }, function() {
				parseSnatchedPage(page, callback, remainingTries--);
			});
		};

		var computeRealStats = function(realUpload, realDownload, realSnatched) {
			dbg("[real_stats] Computing");
			var realRatio = Math.round((realUpload / realDownload) * 100) / 100;
			var realBuffer = realUpload - realDownload;
			var uploadUnit = 0, downloadUnit = 0, bufferUnit = 0;
			while(realUpload > 1024) {
				uploadUnit++;
				realUpload /= 1024.0;
			}
			while(realDownload > 1024) {
				downloadUnit++;
				realDownload /= 1024.0;
			}
			while(realBuffer > 1024 || realBuffer < -1024) {
				bufferUnit++;
				realBuffer /= 1024.0;
			}
			var realUploadStr = Math.round(realUpload * 1000) / 1000 + " " + utils.sizeUnits[uploadUnit];
			var realDownloadStr = Math.round(realDownload * 1000) / 1000 + " " + utils.sizeUnits[downloadUnit];
			var realBufferStr = Math.round(realBuffer * 1000) / 1000 + " " + utils.sizeUnits[bufferUnit];
			dbg("[real_stats] Save");
			gData.set("real_stats", "real_upload", realUploadStr);
			gData.set("real_stats", "real_download", realDownloadStr);
			gData.set("real_stats", "real_buffer", realBufferStr);
			gData.set("real_stats", "real_ratio", realRatio);
			gData.set("real_stats", "real_snatched", realSnatched);
			gData.setFresh("real_stats");
		};

		var fetchBookmarks = function(force) {
			if(!force && isDataUsable("bookmarks")) {
				return;
			}
			dbg("[fetchBookmarks] Grab bookmarks");
			var snatchedUrl = { host: pageUrl.host, path: "/bookmark/" };
			utils.grabPage(snatchedUrl, function(data) {
				parseBookmarks($(data).find("#torrent tbody:first tr"));
			});
		};
		modules.global.fetchBookmarks = fetchBookmarks;

		var parseBookmarks = function(torrents) {
			gData.setFresh("bookmarks");
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
			dbg("[parseBookmarks] Found %d bookmarks", torrentIds.length);
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
			if(val !== "" && val != "Torrents" && val != "Requests" && val != "Summary" && val != "Forums" && val != "Wiki" && val != "Logs") {
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
			$(document).on("click", "a[onclick]", function() {
				var aLink = $(this);
				if(aLink.attr("onclick").indexOf("booktorrent") != -1) {
					dbg("[bookmarkRefresh] Bookmark added - Force refresh");
					fetchBookmarks(true);
					if($(this).parent().hasClass("added")) {
						var cross = $(this).parents("tr").prev().find("td:nth(1) img:nth(0)");
						if(cross && gData.get("bookmarks", "torrents").indexOf(cross.attr("id").substring(6)) == -1) {
							cross.after('<img class="remove_bookmark_star" src="' + chrome.extension.getURL("images/bookmark.png") + '" />');
						}
					}
				}
				if(aLink.attr("onclick").indexOf("delbookmark") != -1) {
					dbg("[bookmarkRefresh] Bookmark deleted - Force refresh");
					fetchBookmarks(true);
				}
			});
		};

		var bufferEmpty = true;
		var buildBufferDiv = function() {
			$("#userlink li:nth(1)").after('<li id="user_buffer"></li>');
		};

		var buildBuffer = function() {
			if(opt.get(module_name, "buffer")) {
				buildBufferDiv();
				$("#userlink .uploaded, #userlink .downloaded").hover(showBuffer, function() {
					$("#user_buffer").hide();
				});
			}
		};

		var showBuffer = function() {
			if(bufferEmpty) {
				bufferEmpty = false;
				var bufferVal = utils.strToSize($("#userlink .uploaded:first").text()).koTot - utils.strToSize($("#userlink .downloaded:first").text()).koTot;
				dbg("[buffer] Found a dispBuffer of [%s] ko", bufferVal);
				var bufferUnit = 1;
				while(bufferVal > 1024 || bufferVal < -1024) {
					bufferUnit++;
					bufferVal /= 1024.0;
				}
				var bufferText = '<span class="' + (bufferVal > 0 ? 'uploaded' : 'downloaded') + '">' + (Math.round(bufferVal * 1000) / 1000) + " " + utils.sizeUnits[bufferUnit] + '</span>';
				if(opt.get(module_name, "real_upload") && gData.get("real_stats", "real_buffer")) {
					bufferText += ' / <span id="user_real_buffer" class="' + (gData.get("real_stats", "real_buffer").indexOf("-") == -1 ? 'uploaded' : 'downloaded') + '">' + gData.get("real_stats", "real_buffer") + '</span>';
				}
				$("#user_buffer").html("Buffer: " + bufferText);
			}
			else {
				$("#user_buffer").show();
			}
		};

		var checkForNewEpisodes = function(force) {
			if(!opt.get(module_name, "check_episodes") || (!force && isDataUsable("episodes"))) {
				return;
			}

			if(!gData.get("episodes", "shows_list_size")) {
				return;
			}
			var showsList = gData.get("episodes", "shows_list");
			var compressedShowList = {};
			var newEpSelectors = modules.serieswatch.newEpSelectors;
			$.each(showsList, function(showId, showData) {
				compressedShowList[showId] = { name: showData.name, on: showData.on };
				if(showData.on) {
					$.each(newEpSelectors, function(type, selectors) {
						if(!showData[type]) {
							return;
						}
						compressedShowList[showId][type] = 0;
						$.each(selectors, function(i, inputName) {
							if(showData[type].indexOf(inputName) != -1) {
								compressedShowList[showId][type] |= (1 << i);
							}
						});
					});
				}
			});

			dbg("[new_ep] Check new episodes");
			utils.post({ host: "https://api.thetabx.net", path: "/gks/check_new_episodes/1/" + gData.get("episodes", "last_check") }, { tv_shows: compressedShowList }, function(data) {
				dbg("[new_ep] Got data from api");
				if(data && data.status == "OK") {
					dbg("[new_ep] Data is looking good");
					gData.setFresh("episodes");

					if(force) {
						$(".new_ep_refresh").prop("disabled", false);
						gData.set("episodes", "hasUnseenData", false);
					}

					if(data.ep_count === 0) {
						dbg("[new_ep] Nothing new");
						return;
					}

					if(!force) {
						gData.set("episodes", "hasUnseenData", true);
					}
					gData.set("episodes", "episodes_size", data.ep_count);
					gData.set("episodes", "episodes", data.episodes);
					$(document).trigger("gksi_new_episodes");
				}
			});
		};

		var pannelButtonNewPos = -10, pannelButtonOldPos = -58;
		var buildNewEpisodesButton = function() {
			if(opt.get("global", "check_episodes")) {
				dbg("[new_ep] Build dem fixed button");
				var buttonClass = (gData.get("episodes", "hasUnseenData") ? 'new_episodes_new' : 'new_episodes_old');
				$("#contenu").append('<a id="new_episodes_button" class="' + buttonClass + '" href="#"></a>');
				var button = $("#new_episodes_button");
				button.click(toggleNewEpisodesPannel).animate({left: pannelButtonOldPos}).hover(function() {
					if(!button.hasClass("new_episodes_new")) {
						button.stop().animate({left: pannelButtonNewPos});
					}
				}, function() {
					if(!button.hasClass("new_episodes_new")) {
						button.stop().animate({left: pannelButtonOldPos});
					}
				});
				if(gData.get("episodes", "hasUnseenData")) {
					button.animate({left: pannelButtonNewPos});
				}
			}
		};

		var toggleNewEpisodesPannel = function() {
			var pannel = $("#new_episodes_pannel");
			if(pannel.length) {
				if(pannel.is(":visible")) {
					hideNewEpisodesPannel();
				}
				else {
					showNewEpisodesPannel();
				}
			}
			else {
				buildNewEpisodesPannel();
			}
			return false;
		};

		var populateNewEpisodesPannel = function() {
			var showsData = gData.get("episodes", "shows_list");
			var storedEpisodes = gData.get("episodes", "episodes");

			var content = "";
			if(!showsData || !gData.get("episodes", "shows_list_size")) {
				content = 'La liste est vide !<br />N\'oubliez pas de visiter <a href="/serieswatch/">/serieswatch/</a> pour remplir et configurer les séries à suivre.';
			}
			else if(!storedEpisodes || !gData.get("episodes", "episodes_size")) {
				content = 'La liste est vide !<br />Les premières vérifications de nouveaux épisodes peuvent nécessiter quelques heures pour prendre en compte les séries inconnues.';
			}
			else {
				// For some reason, Chrome automatically orders Hash on key value.
				// We need to get the show name, order this, and make a showId array based on this order
				var orderedShowsNames = [];
				$.each(showsData, function(showId, showData) {
					orderedShowsNames.push(showData.name);
				});
				orderedShowsNames.sort();

				var orderedShowsIds = [];
				$.each(showsData, function(showId, showData) {
					$.each(orderedShowsNames, function(i, showName) {
						if(showData.name == showName) {
							orderedShowsIds[i] = showId;
							return;
						}
					});
				});

				$.each(orderedShowsIds, function(i, showId) {
					if(!storedEpisodes[showId]) {
						return;
					}
					var showData = storedEpisodes[showId];
					content += '<div class="new_ep_show_header">' + showsData[showId].name + '</div>';
					$.each(showData, function(i, ep) {
						content += '<div class="new_ep_ep_block"><a class="new_ep_ep_title" href="/torrent/' + ep.id + '/">' + ep.name + '</a></span><div class="new_ep_ep_details"><span class="new_ep_ep_date">' + ep.date + '</span><span class="new_ep_ep_size">' + ep.size + '</span><span class="new_ep_ep_dl"><a href="/get/' + ep.id + '/"><img src="https://s.gks.gs/static/themes/sifuture/img/download.png" /></a></span><span class="new_ep_ep_autoget"><a href="#" class="torrent_action_ajax" action="autoget" torrent_id="' + ep.id + '"><img src="https://s.gks.gs/static/themes/sifuture/img/rss2.png" /></a></span><span class="new_ep_ep_bookmark"><a href="#" class="torrent_action_ajax" action="booktorrent" torrent_id="' + ep.id + '"><img src="' + chrome.extension.getURL("images/bookmark.png") + '" /></a></span></div></div>';
					});
				});
			}

			return content;
		};

		var buildNewEpisodesPannel = function() {
			dbg("[new_ep] Building pannel");
			$("#contenu").append('<div id="new_episodes_pannel"><div class="new_ep_header">GKSi - Derniers épisodes</div><div class="new_ep_content">' + populateNewEpisodesPannel() + '</div><div class="new_ep_buttons"><input type="button" class="new_ep_refresh fine" value=" Rafraîchir " title="Force la récupération des derniers épisodes publiés. En cas d\'absence de résultats, la dernière liste sera conservée" /><input type="button" class="new_ep_clear fine" value=" Vider " /><input type="button" class="new_ep_close fine" value=" Fermer " /></div></div>');

			var pannel = $("#new_episodes_pannel");
			$(".new_ep_refresh").click(function() {
				$(this).prop("disabled", true);
				checkForNewEpisodes(true);
			});
			$(".new_ep_clear").click(function() {
				gData.set("episodes", "episodes_size", 0);
				gData.set("episodes", "episodes", {});
				gData.set("episodes", "hasUnseenData", false);
				$("#new_episodes_pannel .new_ep_content").html(populateNewEpisodesPannel());
			});
			$(".new_ep_close").click(function() {
				hideNewEpisodesPannel();
			});

			pannel.on("click", ".torrent_action_ajax", function(e) {
				dbg("[new_ep] Native func");
				var funct = "function() { AddGet('" + $(this).attr("torrent_id") + "', '" + $(this).attr("action") + "', '" + $(this).parents(".new_ep_ep_details").prev().text() + "'); }";
				insertScript("native_action", funct, true);
				return false;
			}).on("click", function(e) {
				e.stopPropagation();
			});
			$(document).one("click", function() {
				hideNewEpisodesPannel();
			});


			// Background-color correction
			var transparentCss = "rgba(0, 0, 0, 0)", transparentCssFirefox = "transparent";
			if(pannel.css("background-color") == transparentCss || pannel.css("background-color") == transparentCssFirefox) {
				// Go up as much as needed to find some non-transparent color
				var cssTries = [ "#contenu", "#centre", "#navig_bloc_user", "#header" ];
				$.each(cssTries, function(i, cssId) {
					var cssColor = $(cssId).css("background-color");
					if(cssColor != transparentCss && cssColor != transparentCssFirefox) {
						colorRGBA = cssColor.match(/^rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\.\d]+)\s*\)$/i);
						if(colorRGBA) {
							cssColor = "rgba(" + colorRGBA[1] + "," + colorRGBA[2] + "," + colorRGBA[3] + ",1)";
						}
						// Instead of creating style on frame, let's append to our custom CSS area
						appendCSS('#new_episodes_pannel { background-color: ' + cssColor + '; } ');
						return false;
					}
				});
			}

			showNewEpisodesPannel();
		};

		var pannelHiddenPos = -432, displayPos = -2;
		var showNewEpisodesPannel = function() {
			gData.set("episodes", "hasUnseenData", false);
			dbg("[new_ep] Showing pannel");
			$("#new_episodes_pannel").show().animate({left: displayPos});
		};

		var hideNewEpisodesPannel = function() {
			dbg("[new_ep] Hiding pannel");
			var button = $("#new_episodes_button");
			if(button.hasClass("new_episodes_new")) {
				button.removeClass("new_episodes_new").addClass("new_episodes_old");
			}
			button.animate({left: pannelButtonOldPos});
			$("#new_episodes_pannel").animate({left: pannelHiddenPos}).hide(0);
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

		listenToCtrlEnter();
		listenToBBCodeShortcuts();
		insertRealStats();
		buildBuffer();
		fetchBookmarks();
		addSeachButtons();
		refreshBookmarksOnBookmark();
		checkForNewEpisodes();
		buildNewEpisodesButton();

		$(document).on("gksi_new_episodes", function() {
			if($("#new_episodes_button").hasClass("new_episodes_old")) {
				$("#new_episodes_button").removeClass("new_episodes_old").addClass("new_episodes_new").animate({left: pannelButtonNewPos});
			}

			if($("#new_episodes_pannel").length) {
				$("#new_episodes_pannel .new_ep_content").html(populateNewEpisodesPannel());
			}
		});

		dbg("[Init] Ready");
	}
};