// Options array, getters and setters
var opt = {
	options: {
		global: {
			form_validation:    { defaultVal: true, showInOptions: true, dispText: "Validation des formulaires avec ctrl+entrée" },
			bbcode_shortcuts:   { defaultVal: true, showInOptions: true, dispText: "Raccourcis BBCodes avec ctrl" },
			allow_frame_css:    { defaultVal: false, showInOptions: true, dispText: "Laisser le CSS positionner les fenêtres GKSi" },
			real_upload:        { defaultVal: false, showInOptions: true, dispText: "Afficher les stats réelles (UP/DL/Ratio) dans l'entête" },
			buffer:             { defaultVal: true, showInOptions: true, dispText: "Afficher le buffer en mouseover sur les statistiques" },
			search_buttons:     { defaultVal: false, showInOptions: true, dispText: "Transforme les loupes en boutons dans les champs de recherche de l'entête" },
			options_section:    { defaultVal: false, showInOptions: false }
		},
		endless_scrolling : {
			endless_scrolling:  { defaultVal: true, showInOptions: true, dispText: "Endless scrolling sur les pages compatibles", sub_options: {
				main:        { defaultVal: true, showInOptions: true, dispText: "Page d'accueil", tooltip: "https://gks.gs/" },
				browse:      { defaultVal: true, showInOptions: true, dispText: "Torrents : Parcourir", tooltip: "https://gks.gs/browse/" },
				sphinx:      { defaultVal: true, showInOptions: true, dispText: "Torrents : Recherche", tooltip: "https://gks.gs/sphinx/" },
				viewforum:   { defaultVal: true, showInOptions: true, dispText: "Forums : Liste des topics", tooltip: "https://gks.gs/forums.php?action=viewforum" },
				viewtopic:   { defaultVal: true, showInOptions: true, dispText: "Forums : Lecture de topic", tooltip: "https://gks.gs/forums.php?action=viewtopic" },
				snatched:    { defaultVal: true, showInOptions: true, dispText: "Snatched : Liste", tooltip: "https://gks.gs/m/peers/snatched" },
				logs:        { defaultVal: true, showInOptions: true, dispText: "Logs : Liste", tooltip: "https://gks.gs/logs/" },
				req:         { defaultVal: true, showInOptions: true, dispText: "Requests : Liste", tooltip: "https://gks.gs/req/" },
				images:      { defaultVal: true, showInOptions: true, dispText: "Images : Liste", tooltip: "https://gks.gs/m/images/" },
				uploads:     { defaultVal: true, showInOptions: true, dispText: "Uploads : Liste", tooltip: "https://gks.gs/m/uploads/" },
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
			filtering_fl:       { defaultVal: false, showInOptions: false },
			filtering_scene:    { defaultVal: false, showInOptions: false },
			auto_refresh:       { defaultVal: false, showInOptions: false },
			auto_refresh_color: { defaultVal: "#ffa500", showInOptions: true, type: "text", width: 5, regex: /^#[0-9A-Fa-f]{3}$|^#[0-9A-Fa-f]{6}$/, dispText: "Couleur (hexa) de la mise en avant des lignes lors de l'auto-refresh" },
			age_column:         { defaultVal: false, showInOptions: true, dispText: "Ajout d'une colonne d'age du torrent" },
			autoget_column:     { defaultVal: false, showInOptions: true, dispText: "Colonne de boutons d'ajout direct à l'autoget" },
			torrent_marker:     { defaultVal: false, showInOptions: false },
			t_marker_button:    { defaultVal: true, showInOptions: true, dispText: "Afficher les boutons torrent marker/finder" },
			direct_comments:    { defaultVal: false, showInOptions: true, dispText: "Afficher les commentaires au survol" },
			preview:            { defaultVal: false, showInOptions: true, dispText: "Afficher un apercu de la fiche torrent au survol" },
			exclude_string:     { defaultVal: true, showInOptions: true, dispText: "Afficher un champ de filtrage par chaîne de caractères" },
			case_sensitive:     { defaultVal: true, showInOptions: true, dispText: "Prendre en compte la casse", parent: "exclude_string", indicateParent: true }
		},
		snatched: {
			filtering_deleted:  { defaultVal: true, showInOptions: false },
			filtering_seed:     { defaultVal: false, showInOption: false },
			filtering_no_comp:  { defaultVal: false, showInOption: false },
			filtering_no_hnr:   { defaultVal: false, showInOption: false }
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
			scroll_correction:  { defaultVal: false, showInOptions: true, dispText: "Corriger le scrolling " }
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
		utils.storage.set(m, this.options[m]);
	},
	// Sets value(v) for module(m) & option(o) & sub option(s)
	sub_set: function(m, o, s, v) {
		this.options[m][o].sub_options[s].val = v;
		utils.storage.set(m, this.options[m]);
	},
	// Sets on change callback(c) for module(m) & option(o)
	setCallback: function(m, o, c) {
		this.options[m][o].callback = c;
	},
	// Appends pure nammed(name) data to module(m) & option(o)
	setData: function(m, o, name, data) {
		this.options[m][o][name] = data;
	},
	// Populate all options values by extracting from localStorage or default value
	load: function() {
		$.each(this.options, function(m, opts) {
			var values = utils.storage.get(m);
			$.each(opts, function(o, v) {
				opt.options[m][o].val = (values && values[o] != undefined ? values[o] : v.defaultVal);
				if(v.sub_options) {
					$.each(v.sub_options, function(s_o, s_v) {
						opt.options[m][o].sub_options[s_o].val = (values && values[o + '_' + s_o] != undefined ? values[o + '_' + s_o] : s_v.defaultVal);
					});
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
		}
	},
	set: function(m, o, v) {
		this.data[m][o] = v;
		utils.storage.data_set(m, this.data[m]);
	},
	get: function(m, o) {
		return this.data[m][o];
	},
	load: function() {
		$.each(this.data, function(m, data) {
			var values = utils.storage.data_get(m);
			$.each(data, function(o, v) {
				gData.data[m][o] = (values && values[o] != undefined ? values[o] : v);
			});
		});
	}
};