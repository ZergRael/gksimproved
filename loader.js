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
$.each(modules, function(module_name, m) {
	if(!m.pages) {
		m.loadModule();
		return;
	}

	$.each(m.pages, function(i, u) {
		if(m.loaded) {
			return false;
		}

		if(u.path_name == url.path) {
			if(!u.params) {
				m.loadModule(u.options);
				return false;
			}

			if(!url.params) {
				return;
			}

			$.each(u.params, function(q, v) {
				if(m.loaded) {
					return false;
				}

				var loadModule = false;
				if(url.params[q]) {
					if(url.params[q] == v) {
						m.loadModule(u.options);
						return false;
					}
				}
				if(loadModule) {
					m.loadModule();
				}
			});
		}
	});
});