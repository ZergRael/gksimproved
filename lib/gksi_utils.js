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

// Here are all functions used across the modules
// Lib functions
var utils = {
	// General debug function
	dbg: function (section, str) {
		if(DEBUG) {
			var dd = new Date();
			var h = dd.getHours(), m = dd.getMinutes(), s = dd.getSeconds(), ms = dd.getMilliseconds();
			var debugPrepend = "[" + (h < 10 ? '0' + h : h) + ":" + (m < 10 ? '0' + m : m) + ":" + (s < 10 ? '0' + s : s) + ":" + (ms < 100 ? '0' + (ms < 10 ? '0' + ms : ms) : ms) + "] [" + section + "] ";
			// Since we can't concat string and objects, add another line
			if(typeof str == "object") {
				console.log(debugPrepend);
				console.log(str);
			}
			else {
				console.log(debugPrepend + str);
			}
		}
	},

	// Storage functions
	storage: {
		// Inserts a complete module in localStorage
		set: function(module, opts) {
			// This tempStore is used to avoid storage of the whole module, we only need value
			var tempStore = {};
			$.each(opts, function(o, v) {
				tempStore[o] = v.val;
				if(v.sub_options) {
					$.each(v.sub_options, function(s_o, s_v) {
						tempStore[o + '_' + s_o] = s_v.val;
					});
				}
			});
			localStorage.setItem(module, JSON.stringify(tempStore));
		},
		// Returns a complete module, only used by opt.load()
		get: function(module) {
			return JSON.parse(localStorage.getItem(module));
		}
	},

	// Returns an url object from url string - Usable by craftUrl
	parseUrl: function (url) {
		// No need to parse any external link
		var host = url.match("^https:\\/\\/gks.gs");
		if(!host) {
			return false;
		}
		var parsedUrl = {};
		parsedUrl.host = (host ? host[0] : host);
		url = url.replace(parsedUrl.host, "");

		// Parse the path from the url string (/m/account/)
		var path = url.match(/[\-\w\.\/]*\/?/);
		parsedUrl.path = (path ? path[0] : path);
		url = url.replace(parsedUrl.path, "");

		// The hashtag thingie (#post_121212)
		var hash = url.match("#.*$");
		if(hash) {
			parsedUrl.hash = (hash ? hash[0] : hash);
			url = url.replace(parsedUrl.hash, "");
		}

		// Since the urls have a strange build patern between pages, we continue to parse even if it is malformed
		if(url.indexOf("?") == -1 && url.indexOf("&") == -1 && url.indexOf("=") == -1) {
			return parsedUrl;
		}

		if(url.indexOf("?") == -1) {
			// Here, we know the url is malformed, we are going for some hacks
			// Inform the url builder that we won't need a '?' in url
			parsedUrl.cancelQ = true;
			if(url.indexOf("&") == -1) {
				// It's now the url hell, there is at least 1 param since we found a '=', even hackier !
				// Inform the url builder that we won't need a '&' in url
				parsedUrl.cancelAmp = true;
				// Extract the last word from path, we know it was in fact a param
				lastPathBit = parsedUrl.path.match(/\/(\w*)$/);
				if(lastPathBit.length) {
					// Remove it from path
					parsedUrl.path = parsedUrl.path.replace(lastPathBit[1], "");
					// Prepend it to the rest of url string in order to pass the params parser
					url = lastPathBit[1] + url;
				}
			}
		}
		url = url.replace("?", "");

		// Usual params split
		var urlSplit = url.split('&');
		if(!urlSplit.length) {
			return false;
		}

		// Extract params and values
		parsedUrl.params = {};
		$.each(urlSplit, function (k, v) {
			if(v == "") {
				return;
			}
			var params = v.split('=');
			parsedUrl.params[params[0]] = params[1];
		});
		return parsedUrl;
	},

	// Returns an url string form an url object - Form parseUrl()
	craftUrl: function (parsedUrl) {
		if(!parsedUrl.params) {
			return parsedUrl.host + parsedUrl.path;
		}

		// As seen before, some hacks for malformed urls
		var craftedUrl = parsedUrl.host + parsedUrl.path + (parsedUrl.cancelQ ? (parsedUrl.cancelAmp ? "" : "&") : '?');

		// Build the params
		var i = 0;
		$.each(parsedUrl.params, function (k, v) {
			// We don't always have values for each param, but append it anyway
			craftedUrl += (i == 0 ? '' : '&') + k + (v != undefined ? "=" + v : '');
			i++;
		});

		// Append the hashtag thingie
		//craftedUrl += (parsedUrl.hash ? parsedUrl.hash : '');

		return craftedUrl;
	},

	// Ajax_GET an url object, then callback with data and page_number
	grabPage: function(urlObject, callback) {
		var urlToGrab = utils.craftUrl(urlObject);
		this.dbg("utils", "[Ajax] " + urlToGrab);
		$.ajax({
			type: 'GET',
			url: urlToGrab,
			success: function(data, status, jXHR) {
				var ajaxedUrl = utils.parseUrl(this.url);
				var page_number = ajaxedUrl && ajaxedUrl.params && ajaxedUrl.params.page || 0;
				callback(data, Number(page_number));
			},
			error: function(jXHR, status, thrown) {
				this.dbg("utils", "[Ajax] " + status + " : " + thrown);
			}
		});
	},

	// Ajax_POST an url object, then callback with data
	post: function(urlObject, postData, callback) {
		var urlToGrab = utils.craftUrl(urlObject);
		this.dbg("utils", "[AjaxPost] " + urlToGrab);
		$.ajax({
			type: 'POST',
			data: postData,
			url: urlToGrab,
			success: function(data, status, jqXHR) {
				callback(data);
			},
			error: function(jXHR, status, thrown) {
				this.dbg("utils", "[AjaxPost] " + status + " : " + thrown);
			}
		});
	},

	// Date string convertion - Returns now and then date objects & full diff between those objects
	dateToDuration: function(dateStr) {
		var dateMatch = dateStr.match(/(\d+)\/(\d+)\/(\d+) à (\d+):(\d+)/);
		if(!dateMatch || !dateMatch.length) {
			return false;
		}

		var dur = {};
		dur.now = new Date();
		//new Date(year, month, day, hours, minutes, seconds, milliseconds)
		dur.was = new Date(dateMatch[3], dateMatch[2] - 1, dateMatch[1], dateMatch[4], dateMatch[5]);
		dur.ttDiff = dur.now - dur.was;

		dur.msTot = dur.ttDiff;
		dur.ms = dur.msTot % 1000;
		dur.secTot = dur.msTot / 1000;
		dur.sec = Math.floor(dur.secTot) % 60;
		dur.minTot = dur.secTot / 60;
		dur.min = Math.floor(dur.minTot) % 60;
		dur.hourTot = dur.minTot / 60;
		dur.hour = Math.floor(dur.hourTot) % 24;
		dur.dayTot = dur.hourTot / 24;
		dur.day = Math.floor(dur.dayTot) % 7;
		dur.weekTot = dur.dayTot / 7;
		dur.week = Math.floor(Math.floor(dur.weekTot) % 4.34812141);
		dur.monthTot = dur.weekTot / 4.34812141;
		dur.month = Math.floor(dur.monthTot) % 12;
		dur.yearTot = dur.monthTot / 12;
		dur.year = Math.floor(dur.yearTot);
		return dur;
	},

	// Size string convertion - Returns precise size data in To-Go-Mo-Ko
	strToSize: function(sizeStr) {
		var sizeMatches = sizeStr.match(/([\d\.,]+) (\w)o/);
		if(!sizeMatches || !sizeMatches.length) {
			return false;
		}

		var value = Number(sizeMatches[1].replace(',', '')); // In Ko
		switch(sizeMatches[2]) {
			case 'P': value *= 1024;
			case 'T': value *= 1024;
			case 'G': value *= 1024;
			case 'M': value *= 1024;
		}

		var size = {};
		size.koTot = value;
		size.ko = Math.floor(size.koTot) % 1024;
		size.moTot = size.koTot / 1024;
		size.mo = Math.floor(size.moTot) % 1024;
		size.goTot = size.moTot / 1024;
		size.go = Math.floor(size.goTot) % 1024;
		size.toTot = size.goTot / 1024;
		size.to = Math.floor(size.toTot) % 1024;
		return size;
	},

	// Returns parsed total karma
	getKarmaTotal: function() {
		if(!$("#userlink .karma").length) {
			return -1;
		}
		return Number($("#userlink .karma").text().replace(',', ''));
	},

	// Returns parsed userId
	getUserId: function() {
		if(!$("#userlink a:first").length) {
			return -1;
		}
		return $("#userlink a:first").attr("href").match(/\d+/)[0];
	}
};