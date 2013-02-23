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
modules.endless_scrolling = {
	name: "endless_scrolling",
	dText: "Endless scrolling",
	pages: [
		{ path_name: "/", options: { 
			opt_name: "main", loading: '#pager_index', path: '/browse/', domExtract: "#torrent_list tr", domInsertion: "#torrent_list"
		} },
		{ path_name: "/browse/", options: { 
			opt_name: "browse", loading: '.pager_align', lastPage: ".pager_align", domExtract: "#torrent_list tr", domInsertion: "#torrent_list" , pageModifier: -1
		} },
		{ path_name: "/sphinx/", options: { 
			opt_name: "sphinx", loading: '.pager_align', lastPage: ".pager_align", domExtract: "#torrent_list tr", domInsertion: "#torrent_list", canSuggest: true, pageModifier: -1
		} },
		{ path_name: "/forums.php", params: { action: 'viewforum' }, options: { 
			opt_name: "viewforum", loading: '.thin table', lastPage: '.linkbox:nth(2)', loadingAfter: true, domExtract: 'tbody tr', domInsertion: '.thin tr:last', insertAfter: true, scrollOffset: 180, stopInsertBottomOffset: 100, lastPageRegex: /\[(\d+)\]\s*$/, endOfStream: 'No posts to display!'
		} },
		{ path_name: "/forums.php", params: { action: 'viewtopic' }, options: { 
			opt_name: "viewtopic", loading: '.thin table:last', lastPage: '.linkbox', loadingAfter: true, domExtract: '.thin table', domInsertion: '.thin table:last', insertAfter: true, scrollOffset: 600, stopInsertBottomOffset: 100, lastPageRegex: /\[(\d+)\]\s*$/
		} },
		{ path_name: "/m/peers/snatched", options: { 
			opt_name: "snatched", loading: '.pager_align', lastPage: ".pager_align", domExtract: ".table100 tbody tr", domInsertion: ".table100 tbody", cancelQ: true, pageModifier: -1
		} },
		{ path_name: "/logs/", options: { 
			opt_name: "logs", loading: '.pager_align', lastPage: '.pager_align', domExtract: "tbody tr", domInsertion: "tbody", pageModifier: -1
		} },
		{ path_name: "/req/", options: { 
			opt_name: "req", loading: '.pager_align', lastPage: '.pager_align', domExtract: "#requests_list tbody tr:not(:first)", domInsertion: "#requests_list tbody", pageModifier: -1, notListeningToTrigger: true
		} },
		{ path_name: "/m/images/", options: {
			opt_name: "images", loading: '.pager_align', lastPage: '.pager_align', domExtract: "#imageslist div", domInsertion: "#imageslist", cancelQ: true, cancelAmp: true, pageModifier: -1, notListeningToTrigger: true
		} },
		{ path_name: "/m/uploads/", options: {
			opt_name: "uploads", loading: '.pager_align', lastPage: '.pager_align', domExtract: "#torrent_list tr", domInsertion: "#torrent_list", cancelQ: true, cancelAmp: true, pageModifier: -1, notListeningToTrigger: true
		} }
	],
	loaded: false,
	loadModule: function(mOptions) {
		this.loaded = true;
		var module_name = this.name;
		var dbg = function(str) {
			_dbg(module_name, str);
		};

		dbg("[Init] Loading module");
		// Loading all functions used

		var maxPage = false;
		// Try to parse the last page available
		// Returns : false(no idea what page we're at) / int(real url page number) / true(assume we're at last page)
		var getMaxPage = function() {
			if(!mOptions.lastPage) {
				return;
			}

			var pagesList = $(mOptions.lastPage);
			if(!pagesList.length || !pagesList.first().text().match(/\S/)) {
				maxPage = true;
			}
			else {
				var lastPageRegex = mOptions.lastPageRegex ? mOptions.lastPageRegex : /(\d+) ?$/;
				var lastPageMatch = pagesList.first().text().match(lastPageRegex);
				if(!lastPageMatch) {
					maxPage = true
				}
				else {
					maxPage = Number(lastPageMatch[1]) + (mOptions.pageModifier ? mOptions.pageModifier : 0);
				}
			}
		};

		var defaultScrollOffset = 200;
		var backTopButtonOffset = 100;
		var loadingPage = false;
		var wentToPageBottom = false;
		var nextPage = (url.params && url.params.page ? Number(url.params.page) + 1 : 2 + (mOptions.pageModifier ? mOptions.pageModifier : 0));
		var previousLookedPage = nextPage - 1;
		var jOnScroll = function() {
			if(!opt.get(module_name, "endless_scrolling") || !opt.sub_get(module_name, "endless_scrolling", mOptions.opt_name)) {
				return;
			}

			// Damnit Gecko
			var scrollTop = document[$.browser.mozilla ? "documentElement" : "body"].scrollTop;
			if(opt.get(module_name, "adapt_url")) {
				var lookingAtPage = 0;
				// Find out what page we are looking at
				$.each(insertedOffsets, function(topOffset, page) {
					if(scrollTop < topOffset) {
						return false;
					}
					lookingAtPage = page;
				});

				// Looks like we changed page, updates
				if(lookingAtPage != previousLookedPage) {
					dbg("[adapt_url] Looking at page " + lookingAtPage);

					// Update URL
					var thisUrl = url;
					thisUrl.params = thisUrl.params || {};
					thisUrl.params.page = lookingAtPage;
					window.history.replaceState("", "GKS : " + lookingAtPage, craftUrl(thisUrl));

					previousLookedPage = lookingAtPage;
				}
			}

			// ignoreScrolling when backToTop button is pushed || we already grabbed all pages
			if(ignoreScrolling || avoidEndlessScrolling) {
				return;
			}

			// Back to top button management
			if(scrollTop > backTopButtonOffset) {
				$("#backTopButton").show();
			}
			else {
				$("#backTopButton").hide();
			}

			// If we know what page we're at && (we are at last page || the next page is obviously out of boundary)
			if(maxPage !== false && (maxPage === true || nextPage > maxPage)) {
				return;
			}

			// If, at any point in time, the user went to the very bottom the page, wait for confirmation before injection
			if(opt.get(module_name, "pause_scrolling") && scrollTop + window.innerHeight >= document.documentElement.scrollHeight) {
				dbg("[pause_scrolling] Stop inserting, got to page bottom");
				wentToPageBottom = true;
			}

			//dbg("[EndlessScrolling] Scrolled");
			if((scrollTop + window.innerHeight > document.documentElement.scrollHeight - (mOptions.scrollOffset ? mOptions.scrollOffset : defaultScrollOffset)) && !loadingPage) {
				dbg("[EndlessScrolling] Loading next page");
				// Prevent further unneeded fetching
				loadingPage = true;

				// Build the url object for the next page
				var nextUrl = url;
				nextUrl.path = mOptions.path ? mOptions.path : nextUrl.path;
				nextUrl.params = nextUrl.params ? nextUrl.params : {};
				nextUrl.cancelQ = mOptions.cancelQ || nextUrl.cancelQ || false;
				nextUrl.cancelAmp = mOptions.cancelAmp || nextUrl.cancelAmp || false;
				nextUrl.params.page = nextPage;
				var loadingP = '<p class="pager_align page_loading"><img src="' + chrome.extension.getURL("images/loading.gif") + '" /><br />Réticulation des méta-données de la page suivante</p>';

				// Loading gif injection
				if(mOptions.loadingAfter) {
					$(mOptions.loading).after(loadingP);
				}
				else {
					$(mOptions.loading).before(loadingP);
				}

				// Fetching
				grabPage(nextUrl, function(data, page_n) {
					// Extract needed data
					insertionData = $(data).find(mOptions.domExtract)
					dbg("[EndlessScrolling] Grab ended")
					if(insertionData && insertionData.length && !(mOptions.endOfStream && insertionData.text().indexOf(mOptions.endOfStream) != -1)) {
						// We use a generic function we can cycle because of the pause_scrolling
						insertAjaxData(insertionData, page_n);
					}
					else {
						dbg("[EndlessScrolling] No more data");
						$(".page_loading").text("Plus rien en vue cap'tain !");
					}
				});
			}
		};

		var insertedOffsets = {0: previousLookedPage};
		var insertAjaxData = function(data, page_n) {
			if(wentToPageBottom) {
				dbg("[pause_scrolling] Waiting for user confirmation in order to insert more");
				$(".page_loading").html('<a href="#" class="resume_endless_scrolling">Reprendre l\'endless scrolling</a>');
				$(".resume_endless_scrolling").click(function(e) {
					wentToPageBottom = false;
					// For an unknown reason, sometimes this button fucks up, prevent it
					e.preventDefault();
					insertAjaxData(data, page_n);
					return false;
				});
				return;
			}

			// Export data processing in another function in case we need some more parsing in the future
			var processedData = processData(data, page_n);

			// Inject data in the dom
			dbg("[EndlessScrolling] Got data - Inserting");
			if(mOptions.insertAfter) {
				$(mOptions.domInsertion).after(processedData);
			}
			else {
				$(mOptions.domInsertion).append(processedData);
			}
			
			// End the loading and prepare for next page
			nextPage++;
			loadingPage = false;
			$(".page_loading").remove();
			// Tell the other modules that we got some new data to process
			$(document).trigger("endless_scrolling_insertion_done");
			// If the module we are using does not need to process the data, we can build the offsets right now
			// else, we wait for the es_dom_process_done trigger
			if(mOptions.notListeningToTrigger) {
				rebuildInsertedOffsets();
			}
			dbg("[EndlessScrolling] Insertion ended");
		};

		// Returns processed data, ready for injection
		var processData = function(data, page_n) {
			dbg("[data_processor] Found first dom element - Tagging it");
			data.first().addClass("dom_page_start").data("page", page_n);
			return data;
		};

		// Triggered by es_dom_process_done
		// Builds the offsets object we use in order to get the page we are looking at
		var rebuildInsertedOffsets = function() {
			dbg("[adapt_url] Rebuilding offets");
			// There is no .dom_page_start for the original(first) page, but the offset is always 0, so insert it manualy
			insertedOffsets = {0: insertedOffsets[0]};
			// Find the page marker and get the associed offset
			$(".dom_page_start").each(function() {
				var line = $(this);
				// Most browsers can't extract an offset from an hiden dom element
				if(!line.is(":visible")) {
					// Find the closest visible element, going down
					line = line.nextAll(":visible").first();
				}

				insertedOffsets[line.offset().top] = $(this).data("page");
			});
			dbg("[adapt_url] Offsets ready");
		};

		// Returns the offset for a specific page
		var getOffsetByPage = function(pageSearch) {
			dbg("[adapt_url] Looking for page " + pageSearch + " in offsets object");
			var offset = false;
			$.each(insertedOffsets, function(top, page) {
				if(page == pageSearch) {
					offset = top;
					return false;
				}
			});
			return offset;
		};

		dbg("[Init] Starting");
		// Execute functions

		getMaxPage();
		this.maxPage = maxPage;
		dbg("[EndlessScrolling] url relative pages : " + (url.params && url.params.page ? url.params.page : 0) + "/" + maxPage);
		$(document).scroll(jOnScroll);

		// Auto endless scrolling pause if any textarea has been focused - mostly forums usage
		$("textarea").focus(function() {
			if(!wentToPageBottom) {
				dbg("[EndlessScrolling] Focused textarea - Pause endless scrolling");
				wentToPageBottom = true;
			}
		});

		// Remap href links to scroll to offset instead of load a new page
		// We don't modify links, just add a click listenner and prevent the browser to change page if we can scroll
		if(mOptions.lastPage) {
			$(mOptions.lastPage + " a").on("click", function() {
				if(!opt.get(module_name, "adapt_url")) {
					return;
				}

				var href = $(this).attr("href");
				var hrefPage = href.match(/page=(\d+)/);
				if(hrefPage.length) {
					toTop = getOffsetByPage(hrefPage[1]);
					if(toTop !== false) {
						dbg("[adapt_url] Found it. Scrolling to " + toTop);
						$(document).scrollTop(toTop);
						return false;
					}
				}
			});
		}

		// Listen to after dom modifications by other modules
		$(document).on("es_dom_process_done", function() {
			rebuildInsertedOffsets();
		});

		dbg("[Init] Ready");
	},
};