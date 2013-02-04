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
		
		var createOptionsFrame = function() {
			var optionsFrameData = "";
			dbg("[Options] Building frame");
			$.each(opt.options, function(module_name, options) {
				optionsFrameData += '<div id="gksi_options_data_' + module_name + '"><div class="gksi_frame_section">' + modules[module_name].dText + '</div>';
				$.each(options, function(option, oData) {
					if(oData.showInOptions) {
						optionsFrameData += '<input type="checkbox" id="gksi_' + module_name + '_' + option + '" ' + (opt.get(module_name, option) ? 'checked="checked"' : '') + '/><label for="gksi_' + module_name + '_' + option + '"' + (oData.tooltip ? ' title="' + oData.tooltip + '"' : '') + '>' + oData.dispText + '</label><br />';
					}
				});
				optionsFrameData += '</div>';
			});

			// { id, classes, title, data, relativeToId, top, left, underButtonsText }
			var copyright = '<a href="/forums.php?action=viewtopic&topicid=6336">GKSi</a> by <a href="/users/2360140">ZergRael</a>'
			appendFrame({ id: "options", title: "GKSi Options", data: optionsFrameData, relativeToId: "navigation", top: 8, left: 230, underButtonsText: copyright });

			$.each(opt.options, function(module_name, options) {
				if(!$("#gksi_options_data_" + module_name + " input").length) {
					$("#gksi_options_data_" + module_name).remove();
					return;
				}
				$.each(options, function(option, oData) {
					if(oData.showInOptions) {
						$("#gksi_" + module_name + "_" + option).change(function() {
							opt.set(module_name, option, $(this).attr("checked") == "checked" ? true : false);
							_dbg(module_name, "[" + option + "] is " + opt.get(module_name, option));
							if(oData.callback) {
								oData.callback(opt.get(module_name, option));
							}
						});
					}
				});
			});
			dbg("[Options] Frame ready");
		};

		var getKarmaTotal = function() {
			if(!$("#userlink .karma").length) {
				return -1;
			}
			var kMatches = $("#userlink .karma").text().match(/(\d*),?(\d+).(\d+)/);
			return (kMatches[1] ? Number(kMatches[1]) * 1000 : 0) + (kMatches[2] ? Number(kMatches[2]) : 0) + (kMatches[3] ? Number(kMatches[3]) * 0.01 : 0);
		}

		var getUserId = function() {
			if(!$("#userlink a:first").length) {
				return -1;
			}
			return $("#userlink a:first").attr("href").match(/\d+/)[0];
		}

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