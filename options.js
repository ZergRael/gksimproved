// Options array, getters and setters
var opt = {
	options: {
		global: {
			form_validation:    { defaultVal: true, showInOptions: true, dispText: "Validation des formulaires avec ctrl+entrée" },
			bbcode_shortcuts:   { defaultVal: true, showInOptions: true, dispText: "Raccourcis BBCodes avec ctrl" },
			allow_frame_css:    { defaultVal: false, showInOptions: true, dispText: "Laisser le CSS positionner les fenêtres GKSi" },
			real_upload:        { defaultVal: false, showInOptions: true, dispText: "Afficher les stats réelles (UP/DL/Ratio) dans l'entête" },
			buffer:             { defaultVal: true, showInOptions: true, dispText: "Afficher le buffer en mouseover sur les statistiques" },
			search_buttons:     { defaultVal: false, showInOptions: true, dispText: "Transformer les loupes en boutons dans les champs de recherche de l'entête" },
			check_episodes:     { defaultVal: false, showInOptions: true, dispText: "Vérifier la présence de nouveaux épisodes toutes les 2 heures" },
			options_section:    { defaultVal: false, showInOptions: false }
		},
		endless_scrolling : {
			endless_scrolling:  { defaultVal: true, showInOptions: true, dispText: "Endless scrolling sur les pages compatibles", sub_options: {
				main:        { defaultVal: true, showInOptions: true, dispText: "Page d'accueil", tooltip: "https://gks.gs/" },
				browse:      { defaultVal: true, showInOptions: true, dispText: "Torrents : Parcourir", tooltip: "https://gks.gs/browse/" },
				sphinx:      { defaultVal: true, showInOptions: true, dispText: "Torrents : Recherche", tooltip: "https://gks.gs/sphinx/" },
				viewforum:   { defaultVal: true, showInOptions: true, dispText: "Forums : Liste des topics", tooltip: "https://gks.gs/forums.php?action=viewforum" },
				viewtopic:   { defaultVal: true, showInOptions: true, dispText: "Forums : Lecture de topic", tooltip: "https://gks.gs/forums.php?action=viewtopic" },
				forum_search:{ defaultVal: true, showInOptions: true, dispText: "Forums : Recherche", tooltip: "https://gks.gs/forums.php?action=search" },
				snatched:    { defaultVal: true, showInOptions: true, dispText: "Snatched : Liste", tooltip: "https://gks.gs/m/peers/snatched" },
				history_up:  { defaultVal: true, showInOptions: true, dispText: "Historique : Uploads", tooltip: "/my/history/<id_user>/uploads" },
				logs:        { defaultVal: true, showInOptions: true, dispText: "Logs : Liste", tooltip: "https://gks.gs/logs/" },
				req:         { defaultVal: true, showInOptions: true, dispText: "Requests : Liste", tooltip: "https://gks.gs/req/" },
				images:      { defaultVal: true, showInOptions: true, dispText: "Images : Liste", tooltip: "https://gks.gs/m/images/" },
				uploads:     { defaultVal: true, showInOptions: true, dispText: "Uploads : Liste", tooltip: "https://gks.gs/m/uploads/" },
				peers:       { defaultVal: true, showInOptions: true, dispText: "Peers : Liste", tooltip: "https://gks.gs/m/peers/" },
				dupecheck:   { defaultVal: true, showInOptions: true, dispText: "Dupecheck : Liste", tooltip: "https://gks.gs/dupecheck/" },
				reseed:      { defaultVal: true, showInOptions: true, dispText: "Reseed : Liste", tooltip: "https://gks.gs/reseed.php" }
			} },
			adapt_url:          { defaultVal: true, showInOptions: true, dispText: "Adapter l'url en fonction de la page vue avec l'ES", parent: "endless_scrolling" },
			pagination_rewrite: { defaultVal: false, showInOptions: true, dispText: "Adapter la pagination en fonction de la page vue avec l'ES", parent: "adapt_url", indicateParent: true },
			pause_scrolling:    { defaultVal: false, showInOptions: true, dispText: "Pauser l'ES lorsqu'arrivé en fond de page", parent: "endless_scrolling" },
			button_style:       { defaultVal: 'LordVal', showInOptions: true, type: "select", choices: ['LordVal', 'Classic'], dispText: "Style des icônes" }
		},
		torrent_list: {
			imdb_suggest:       { defaultVal: true, showInOptions: true, dispText: "Suggestions de recherche grâce à IMDB" },
			imdb_auto_add:      { defaultVal: false, showInOptions: true, dispText: "Ajouter le résultat de la meilleure correspondance IMDB", parent: "imdb_suggest", indicateParent: true },
			filter_fl:          { defaultVal: 0, showInOptions: false },
			filter_scene:       { defaultVal: 0, showInOptions: false },
			auto_refresh:       { defaultVal: false, showInOptions: false },
			auto_refresh_color: { defaultVal: "#ffa500", showInOptions: true, type: "text", width: 5, regex: /^#[0-9A-Fa-f]{3}$|^#[0-9A-Fa-f]{6}$/, dispText: "Couleur (hexa) de la mise en avant des lignes lors de l'auto-refresh" },
			age_column:         { defaultVal: false, showInOptions: true, dispText: "Ajout d'une colonne d'age du torrent" },
			autoget_column:     { defaultVal: false, showInOptions: true, dispText: "Colonne de boutons d'ajout direct à l'autoget" },
			bookmark_column:    { defaultVal: false, showInOptions: true, dispText: "Colonne de boutons d'ajout direct aux bookmarks" },
			nfo_column:         { defaultVal: false, showInOptions: true, dispText: "Colonne de liens vers le NFO" },
			torrent_marker:     { defaultVal: false, showInOptions: false },
			t_marker_button:    { defaultVal: true, showInOptions: true, dispText: "Afficher les boutons torrent marker/finder" },
			direct_comments:    { defaultVal: false, showInOptions: true, dispText: "Afficher les commentaires au survol" },
			preview:            { defaultVal: false, showInOptions: true, dispText: "Afficher un apercu de la fiche torrent au survol" },
			filter_string:      { defaultVal: true, showInOptions: true, dispText: "Afficher un champ de filtrage par chaîne de caractères" },
		},
		snatched: {
			filter_deleted:  { defaultVal: 2, showInOptions: false },
			filter_seed:     { defaultVal: 0, showInOption: false },
			filter_complete: { defaultVal: 0, showInOption: false },
			filter_hnr:      { defaultVal: 0, showInOption: false }
		},
		twits: {
			twit_auto_complete: { defaultVal: true, showInOptions: true, dispText: "Auto-complétion des twits" },
			twit_color:         { defaultVal: true, showInOptions: true, dispText: "Coloration et lien automatique sur les twits" }
		},
		pins: {
			filter_expensive:   { defaultVal: false, showInOptions: true, dispText: "Cacher les pin's trop chers" },
			filter_bought:      { defaultVal: false, showInOptions: true, dispText: "Cacher les pin's déjà achetés" },
			sort_price:         { defaultVal: false, showInOptions: true, dispText: "Trier les pins par prix" }
		},
		forums: {
			hidable_sigs:       { defaultVal: false, showInOptions: true, dispText: "Rendre les signatures masquables" },
			hide_signatures:    { defaultVal: false, showInOptions: true, dispText: "Cacher les signatures par défaut", parent: "hidable_sigs", indicateParent: true },
			scroll_correction:  { defaultVal: false, showInOptions: true, dispText: "Corriger le scrolling " },
			duplicate_markread: { defaultVal: false, showInOptions: true, dispText: "Copie le 'Marquer les sujets lus' en haut de page" }
		},
		torrent: {
			quick_comment:      { defaultVal: true, showInOptions: true, dispText: "Afficher la boite de commentaire rapide sur les fiches torrent" },
			comment_mp_title:   { defaultVal: "[Torrent #%id_torrent%] Commentaires désactivés", showInOptions: false },
			comment_mp_text:    { defaultVal: "Salutations !\n\nIl semblerait qu'un des torrents que vous avez posté n'accepte pas les commentaires :\n[url=%url_torrent%]%titre_torrent%[/url]\n\nSerait-il possible d'y remédier ?\n[url=https://gks.gs/m/account/paranoia]Réglage de la paranoïa[/url]\n\nMerci :)", showInOptions: false }
		},
		badges: {
			progress:           { defaultVal: false, showInOptions: true, dispText: "Afficher la progression sous les badges" },
			show_img:           { defaultVal: false, showInOptions: true, dispText: "Afficher toutes les images des badges" },
			show_tip:           { defaultVal: false, showInOptions: true, dispText: "Afficher toutes les infobulles des badges" }
		},
		logs: {
			auto_refresh:       { defaultVal: false, showInOptions: false },
			uploads_filter:     { defaultVal: false, showInOptions: false },
			delete_filter:      { defaultVal: false, showInOptions: false },
			edit_filter:        { defaultVal: false, showInOptions: false },
			request_filter:     { defaultVal: false, showInOptions: false },
			request_fill_filter:{ defaultVal: false, showInOptions: false },
			summary_edit_filter:{ defaultVal: false, showInOptions: false },
			summary_new_filter: { defaultVal: false, showInOptions: false }
		},
		aura: {
			ag_column:          { defaultVal: true, showInOptions: true, dispText: "Colonne de rentabilité torrent A/Go" }
		},
		peers: {
			filtering_active:   { defaultVal: false, showInOptions: false }
		},
		bookmark: {
			delete_get:         { defaultVal: true, showInOptions: false }
		}
	},
	// Returns value for module(m) & option(o)
	get: function(m, o) {
		return this.options[m][o].val;
	},
	// Returns value for module(m) & option(o) & sub option(s)
	sub_get: function(m, o, s) {
		return this.options[m][o].sub_options[s].val;
	},
	// Sets value(v) for module(m) & option(o)
	set: function(m, o, v) {
		this.options[m][o].val = v;
		this.save(m);
	},
	// Sets value(v) for module(m) & option(o) & sub option(s)
	sub_set: function(m, o, s, v) {
		this.options[m][o].sub_options[s].val = v;
		this.save(m);
	},
	// Sets on change callback(c) for module(m) & option(o)
	setCallback: function(m, o, c) {
		this.options[m][o].callback = c;
	},
	// Appends pure nammed(name) data to module(m) & option(o)
	setData: function(m, o, name, data) {
		this.options[m][o][name] = data;
	},
	// Sends to storage
	save: function(m) {
		utils.storage.set(m, this.options[m]);
	},
	// Populate all options values by extracting from storage or default value
	load: function(callback) {
		var requiredCallbacks = 0;
		$.each(this.options, function(m, opts) {
			requiredCallbacks++;
			utils.storage.get(m, function(obj) {
				var values = obj[m], legValues;
				if(!values) {
					legValues = utils.storage.legacy.get(m);
					if(legValues) {
						values = legValues;
					}
				}
				$.each(opts, function(o, v) {
					opt.options[m][o].val = (values && values[o] != undefined ? values[o] : v.defaultVal);
					if(v.sub_options) {
						$.each(v.sub_options, function(s_o, s_v) {
							opt.options[m][o].sub_options[s_o].val = (values && values[o + '_' + s_o] != undefined ? values[o + '_' + s_o] : s_v.defaultVal);
						});
					}
				});
				if(legValues) {
					opt.save(m);
					utils.storage.legacy.rm(m);
				}
				if(--requiredCallbacks == 0) {
					callback();
				}
			});
		});
	}
};

var gData = {
	data: {
		badges: {},
		real_stats: {
			real_upload: 0,
			real_download: 0,
			real_buffer: 0,
			real_ratio: 0,
			real_snatched: 0,
			max_snatched_pages: 0,
			last_check: 0
		},
		bookmarks: {
			torrents: [],
			bookmarkIds: {},
			last_check: 0
		},
		episodes: {
			shows_list: {},
			shows_list_size: 0,
			global_conf: {},
			episodes: {},
			episodes_size: 0,
			hasUnseenData: false,
			last_display: 0,
			last_check: new Date().getTime()
		}
	},
	setFresh: function(m) {
		this.set(m, "last_check", new Date().getTime());
	},
	set: function(m, o, v) {
		this.data[m][o] = v;
		this.save(m);
	},
	get: function(m, o) {
		return this.data[m][o];
	},
	save: function(m) {
		utils.storage.data_set(m, this.data[m]);
	},
	load: function(callback) {
		var requiredCallbacks = 0;
		$.each(this.data, function(m, data) {
			requiredCallbacks++;
			utils.storage.data_get(m, function(obj) {
				var values = obj[m], legValues;
				if(!values) {
					legValues = utils.storage.legacy.data_get(m);
					if(legValues) {
						values = legValues;
					}
				}
				$.each(data, function(o, v) {
					gData.data[m][o] = (values && values[o] != undefined ? values[o] : v);
				});
				if(legValues) {
					gData.save(m);
					utils.storage.legacy.data_rm(m);
				}
				if(--requiredCallbacks == 0) {
					callback();
				}
			});
		});
	}
};