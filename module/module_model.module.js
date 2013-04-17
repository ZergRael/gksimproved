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
modules.module_ = {
	name: "module_",
	pages: [
		{ path_name: "/.*/", params: { query: 'value' }, options: { option: 'value' } }
	],
	loaded: false,
	loadModule: function(mOptions) {
		this.loaded = true;
		var module_name = this.name;
		var dbg = function(str) {
			utils.dbg(module_name, str);
		};

		dbg("[Init] Loading module");
		// Loading all functions used

		dbg("[Init] Starting");
		// Execute functions

		var buttons = '<input id="but_id" type="checkbox" ' + (o ? 'checked="checked" ' : ' ') + '/><label for="but_id">Text</label>';
		$(mOptions.buttons).before(buttons);

		$("#but_id").change(function() {
			opt.set(module_name, "o", $(this).attr("checked") == "checked" ? true : false);
			dbg("[o] is " + o);
		});

		dbg("[Init] Ready");
	}
};