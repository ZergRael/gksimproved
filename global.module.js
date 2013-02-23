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
			_dbg(module_name, str);
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
				$(bbcode).click();
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
			var oHtml = '<span id="gksi_' + module_name + '_' + option_name + '_span"><input type="checkbox" id="gksi_' + module_name + '_' + option_name + '" ' + (oData.parent && !opt.get(module_name, oData.parent) ? 'disabled="disabled" ': '') + (opt.get(module_name, option_name) ? 'checked="checked"' : '') + '/><label for="gksi_' + module_name + '_' + option_name + '"' + (oData.tooltip ? ' title="' + oData.tooltip + '"' : '') + '>' + oData.dispText + '</label><br /></span>';
			if(oData.sub_options) {
				oHtml += '<div id="gksi_' + module_name + '_s_' + option_name + '" class="gksi_options_sub">';
				$.each(oData.sub_options, function(s_option, s_oData) {
					if(s_oData.showInOptions) {
						oHtml += '<span id="gksi_' + module_name + '_' + option_name + '_' + s_option + '_span"><input type="checkbox" id="gksi_' + module_name + '_' + option_name + '_' + s_option + '" ' + (opt.sub_get(module_name, option_name, s_option) ? 'checked="checked"' : '') + '/><label for="gksi_' + module_name + '_' + option_name + '_' + s_option + '"' + (s_oData.tooltip ? ' title="' + s_oData.tooltip + '"' : '') + '>' + s_oData.dispText + '</label><br /></span>';
					}
				});
				oHtml += '</div>';
			}
			return oHtml;
		};

		var createOptionsFrame = function() {
			var optionsFrameData = "";
			dbg("[Options] Building frame");
			$.each(opt.options, function(module_name, options) {
				var optionsSection = '<div id="gksi_options_data_' + module_name + '"><div class="gksi_frame_section">' + modules[module_name].dText + '</div>';
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
					optionsFrameData += optionsSection;
				}
			});

			// { id, classes, title, data, relativeToId, top, left, underButtonsText }
			var copyright = '<a href="/forums.php?action=viewtopic&topicid=6336">GKSi</a> by <a href="/users/2360140">ZergRael</a>'
			appendFrame({ id: "options", title: "GKSi Options", data: optionsFrameData, relativeToId: "navigation", top: 8, left: 230, underButtonsText: copyright });

			$.each(opt.options, function(module_name, options) {
				if(!$("#gksi_options_data_" + module_name).length) {
					// Since the section is not even shown, don't cycle through all options
					return;
				}

				$.each(options, function(option, oData) {
					if(oData.showInOptions) {
						var childs = getOptionChilds(module_name, option);

						$("#gksi_" + module_name + "_" + option).change(function() {
							var state = $(this).attr("checked") == "checked" ? true : false;
							opt.set(module_name, option, state);
							_dbg(module_name, "[" + option + "] is " + opt.get(module_name, option));
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
										_dbg(module_name, "[" + option + "][" + s_option + "] is " + opt.sub_get(module_name, option, s_option));
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
			dbg("[Options] Frame ready");
		};

		var getKarmaTotal = function() {
			if(!$("#userlink .karma").length) {
				return -1;
			}
			return Number($("#userlink .karma").text().replace(',', ''));
		};

		var getUserId = function() {
			if(!$("#userlink a:first").length) {
				return -1;
			}
			return $("#userlink a:first").attr("href").match(/\d+/)[0];
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
		this.karma = getKarmaTotal();
		this.userId = getUserId();

		dbg("[Init] Ready");
	}
};