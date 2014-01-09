modules.forums = {
	name: "forums",
	dText: "Forums",
	pages: [
		{ path_name: "/forums.php", params: { action: 'viewforum' }, options: { buttons: '.linkbox:first', isForum: true } },
		{ path_name: "/forums.php", params: { action: 'viewtopic' }, options: { buttons: '.linkbox:first', isTopic: true } }
	],
	loaded: false,
	loadModule: function(mOptions) {
		this.loaded = true;
		var module_name = this.name;
		var dbg = function() {
			utils.dbg(module_name, arguments);
		};

		dbg("[Init] Loading module");
		// Loading all functions used

		var filterSignatures = function() {
			if(!mOptions.isTopic || !opt.get(module_name, "hidable_sigs")) {
				return;
			}

			dbg("[hide_signatures] Processing data");
			$(".body div").each(function() {
				$(this).html($(this).html().replace("- - - - -", '<a class="toggleSignature" href="#">- - - - -</a><div class="signature">'));
				$(this).append("</div>");
				if(opt.get(module_name, "hide_signatures")) {
					$(this).find(".signature").hide();
				}
			});

			dbg("[hide_signatures] Process ended");
		};

		var lastScrolledHash = null;
		var adjustScrolling = function() {
			if(!opt.get(module_name, "scroll_correction") || !mOptions.isTopic || $("#entete").css("position") != "fixed") {
				return;
			}

			var scrollingUrl = utils.parseUrl(window.location.href);
			if(!scrollingUrl.hash || scrollingUrl.hash == lastScrolledHash) {
				return;
			}

			dbg("[adjustScrolling] Found hash : %s", scrollingUrl.hash);
			//$(document).scrollTop($('a[href="#post336526"]').offset().top - $("#entete").height() - 15);

			var hashTarget = $('a[href="' + scrollingUrl.hash + '"]');
			if(hashTarget.length) {
				dbg("[adjustScrolling] Scrolling");
				lastScrolledHash = scrollingUrl.hash;
				$(document).scrollTop(hashTarget.offset().top - $("#entete").height() - 15);
			}
		};

		var duplicateMarkRead = function() {
			if(opt.get(module_name, "duplicate_markread") && mOptions.isForum) {
				var boxes = $(".linkbox");
				boxes.first().append(" -- " + boxes.last().html());
			}
		};

		dbg("[Init] Starting");
		// Execute functions

		if(mOptions.isTopic) {
			$(document).on("click", ".toggleSignature", function() {
				dbg("[hide_signatures] Toggle signature");
				$(this).parent().find(".signature").toggle();
				return false;
			});
		}
		filterSignatures();
		duplicateMarkRead();
		$(document).scroll(function() {
			adjustScrolling();
		});

		$(document).on("endless_scrolling_insertion_done", function() {
			dbg("[endless_scrolling] Module specific functions");
			$(document).trigger("recolor_twits");
			filterSignatures();
			$(document).trigger("es_dom_process_done");
		});

		dbg("[Init] Ready");
	}
};