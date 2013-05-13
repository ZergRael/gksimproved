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
				optionHtml = '<select id="gksi_' + module_name + '_' + option_name + '" ' + (oData.parent && !opt.get(module_name, oData.parent) ? 'disabled="disabled" ': '') + (opt.get(module_name, option_name) ? 'checked="checked"' : '') + '>' + optionChoices + '</select><label for="gksi_' + module_name + '_' + option_name + '"' + (oData.tooltip ? ' title="' + oData.tooltip + '"' : '') + '>' + oData.dispText + '</label><br />';
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
			var optionsFrameData = "", optionsFrameHeader = "";
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
					optionsFrameHeader += '<span class="gksi_options_header_button" section="' + module_name + '">' + modules[module_name].dText + '</span>';
					optionsFrameData += optionsSection;
				}
			});

			// { id, classes, title, data, relativeToId, top, left, underButtonsText }
			var copyright = '<a href="/forums.php?action=viewtopic&topicid=6336">GKSi</a> by <a href="/users/2360140">ZergRael</a>'
			appendFrame({ id: "options", title: "GKSi Options", data: optionsFrameData, relativeToId: "navigation", top: 8, left: 230, header: optionsFrameHeader, underButtonsText: copyright });

			$.each(opt.options, function(module_name, options) {
				if(!$("#gksi_options_data_" + module_name).length) {
					// Since the section is not even shown, don't cycle through all options
					return;
				}

				$.each(options, function(option, oData) {
					if(oData.showInOptions) {
						var childs = getOptionChilds(module_name, option);

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
				$(".gksi_options_section").hide();
				$("#gksi_options_data_" + $(this).attr("section")).show();
			}, function() {
			});

			dbg("[Options] Frame ready");
		};

		var timeOffset = 24 * 60 * 60 * 1000;
		var insertRealStats = function() {
			if(!opt.get(module_name, "real_upload")) {
				return;
			}

			dbg("[real_stats] Started");
			var now = new Date().getTime();
			if(now > gData.get("real_stats", "last_check") + timeOffset) {
				parseRealStats();
			}
			else {
				writeRealStats(gData.get("real_stats", "real_upload"), gData.get("real_stats", "real_download"), gData.get("real_stats", "real_ratio"));
			}
		};

		var writeRealStats = function(uploadStr, downloadStr, ratioStr) {
			dbg("[real_stats] Insert " + uploadStr + " / " + downloadStr + " / " + ratioStr);
			$("#userlink li:nth(1) span:nth(0)").after(' / <span class="uploaded">' + uploadStr + '</span>');
			$("#userlink li:nth(1) span:nth(2)").after(' / <span class="downloaded">' + downloadStr + '</span>');
			$("#userlink li:nth(2) span:nth(0)").after(' / <span>' + ratioStr + '</span>');
		};

		var parseRealStats = function() {
			dbg("[real_stats] Grab pages & parse");
			var snatchedUrl = { host: pageUrl.host, path: "/m/peers/snatched", params: { page: 0 }, cancelQ: true };
			var maxPage = 0, realUpload = 0, readDownload = 0, grabbedPages = 0;
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

				for(var i = 1; i <= maxPage; i++) {
					snatchedUrl.params.page = i;
					utils.grabPage(snatchedUrl, function(data) {
						$(data).find("td[data-filesize]:nth-child(3n)").each(function() {
							realUpload += Number($(this).attr("data-filesize"));
						});

						$(data).find("td[data-filesize]:nth-child(5n)").each(function() {
							readDownload += Number($(this).attr("data-filesize"));
						});
					}, function(){
						grabbedPages++;
						if(grabbedPages >= maxPage) {
							var realRatio = Math.round((realUpload / readDownload) * 100) / 100;
							var units = ["o", "Ko", "Mo", "Go", "To", "Po"];
							var uploadUnit = 0, downloadUnit = 0;
							while(realUpload > 1024) {
								uploadUnit++;
								realUpload /= 1024.0;
							}
							while(readDownload > 1024) {
								downloadUnit++;
								readDownload /= 1024.0;
							}
							var realUploadStr = Math.round(realUpload * 1000) / 1000 + units[uploadUnit];
							var realDownloadStr = Math.round(readDownload * 1000) / 1000 + units[downloadUnit];
							writeRealStats(realUploadStr, realDownloadStr, realRatio);
							gData.set("real_stats", "real_upload", realUploadStr);
							gData.set("real_stats", "real_download", realDownloadStr);
							gData.set("real_stats", "real_ratio", realRatio);
							gData.set("real_stats", "last_check", new Date().getTime());
						}
					});
				}
			});
		};

		dbg("[Init] Starting");
		// Execute functions

		var optionsFrameButtons = '<ul><a href="#" id="options_gksi">GKSi Options</a></ul>';
		$("#navig_bloc_user").append(optionsFrameButtons);
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

		dbg("[Init] Ready");
	}
};