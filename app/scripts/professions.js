(function() {
	d3.csv("data/professions.csv", function(err, data) {
		console.log(data)
	})
	app.professionColumns = [
		[
			{
				name: 'Pedagogik och lärarutbildning',
				nameShort: 'Lärare',
				cssClass: 'sort',
				items: [
					{ label: "Förskollärare", column: 'Forskolelarare', baseline: 'GymnSamhv' },
					{ label: "Låg- och mellanstadielärare", column: 'Lagmellanstdlr', baseline: 'GymnSamhv' },
					{ label: "Högstadie- och gymnasielärare", column: 'Amneslarare', baseline: 'GymnSamhv' },
					{ label: "Lärare", column: 'Larare', baseline: 'GymnSamhv' },
					{ label: "Yrkeslärare", column: 'Yrkeslarare', baseline: 'GymnSamhv' }
				]
			},
			{
				name: 'Humaniora och konst',
				nameShort: 'Humaniora, Konst',
				cssClass: 'sort',
				items: [
					{ label: "Humanist", column: 'Humanist', baseline: 'GymnSamhv' },
					{ label: "Konstvetare", column: 'Konstutb', baseline: 'GymnSamhv' },
					{ label: "Teolog", column: 'Teolog', baseline: 'GymnSamhv' }
				]
			},
		],
		[
			{
				name: 'Samhällsvetenskap, juridik, handel och administration',
				nameShort: 'Samhällsv. m.m.',
				cssClass: 'sort',
				items: [
					{ label: "Bibliotekarie och informationsvetare", column: 'Biblinfo', baseline: 'GymnSamhv' },
					{ label: "Ekonom", column: 'Ekonom', baseline: 'GymnSamhv' },
					{ label: "Personalvetare", column: 'Personalvetare', baseline: 'GymnSamhv' },
					{ label: "Jurist", column: 'Jurist', baseline: 'GymnSamhv' },
					{ label: "Journalist", column: 'Journalist', baseline: 'GymnSamhv' },
					{ label: "Psykolog", column: 'Psykolog', baseline: 'GymnSamhv' },
					{ label: "Samhälls- och beteendevetare", column: 'Samhbetvet', baseline: 'GymnSamhv' }
				]
			}
		],
		[
			{
				name: 'Teknik och tillverkning',
				nameShort: 'Teknik',
				cssClass: 'sort',
				items: [
					{ label: "Arkitekt", column: 'Arkitekt', baseline: 'GymnNatv' },
					{ label: "Civilingenjör", column: 'Civ_ing', baseline: 'GymnNatv' },
					{ label: "Högskoleingenjör", column: 'Hgsk_ing', baseline: 'GymnNatv' }
				]
			},
			{
				name: 'Lant- och skogsbruk samt djursjukvård',
				nameShort: 'Lantbruk, Djursjukvård',
				cssClass: 'sort',
				items: [
					{ label: "Agronom", column: 'Agronom', baseline: 'GymnNatv' },
					{ label: "Veterinär", column: 'Veterinar', baseline: 'GymnNatv' }
				]
			},
			{
				name: 'Social omsorg',
				nameShort: 'Social omsorg',
				cssClass: 'sort',
				items: [
					{ label: "Social omsorg ", column: 'Soc_omsorg', baseline: 'GymnSamhv' },
					{ label: "Socionom", column: 'Socionom', baseline: 'GymnSamhv' }
				]
			}
		],
		[
			{
				name: 'Hälso- och sjukvård',
				nameShort: 'Hälso- och sjukvård',
				cssClass: 'sort',
				items: [
					{ label: "Apotekare", column: 'Apotekare', baseline: 'GymnNatv' },
					{ label: "Arbetsterapeut", column: 'Arbterap', baseline: 'GymnSamhv' },
					{ label: "Biomedicinsk analytiker", column: 'Biomed_analyt', baseline: 'GymnSamhv' },
					{ label: "Läkare", column: 'Lakare', baseline: 'GymnNatv' },
					{ label: "Receptarie", column: 'Receptarie', baseline: 'GymnNatv' },
					{ label: "Sjukgymnast", column: 'Sjukgymn', baseline: 'GymnNatv' },
					{ label: "Sjuksköterska", column: 'Sjukskoterska', baseline: 'GymnSamhv' },
					{ label: "Tandhygienist", column: 'Tandhyg', baseline: 'GymnSamhv' },
					{ label: "Tandläkare", column: 'Tandlakare', baseline: 'GymnNatv' }
				]
			}
		],
		[
			{
				name: 'Naturvetenskap, matematik, data',
				nameShort: 'Naturvetenskap',
				cssClass: 'sort',
				items: [
					{ label: "Systemvetare", column: 'Systvet', baseline: 'GymnSamhv' },
					{ label: "Geovetare", column: 'Geovet', baseline: 'GymnNatv' },
					{ label: "Kemist", column: 'Kemist', baseline: 'GymnNatv' },
					{ label: "Fysiker", column: 'Fysiker', baseline: 'GymnNatv' },
					{ label: "Matematiker och statistiker", column: 'Matstat', baseline: 'GymnNatv' },
					{ label: "Biolog", column: 'Biolog', baseline: 'GymnNatv' }
				]
			},
			{
				name: 'Övriga',
				nameShort: 'Sammanräknade',
				cssClass: 'sort',
				items: [
					{ label: "Akademiker, totalt", column: 'Akademiker_totalt', baseline: 'GymnTotal' }
				]
			}
		],
	];

	// Get professions from groups
	app.professions = d3.merge(app.professionColumns.map(function(column) {
		return column.map(function(group) {
			return group;
		});
	}));
})();