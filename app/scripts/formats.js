var locale = d3.locale({
  "decimal": ",",
  "thousands": "\xa0",
  "grouping": [3],
  "currency": ["", " kr"],
  "dateTime": "%A %e %B %Y kl. %X",
  "date": "%d.%m.%Y",
  "time": "%H:%M:%S",
  "periods": ["AM", "PM"],
  "days": ["måndag", "tisdag", "onsdag", "torsdag", "fredag", "lördag", "söndag"],
  "shortDays": ["må", "ti", "ons", "to", "fre", "lö", "sö"],
  "months": ["januari", "februari", "mars", "april", "maj", "juni", "juli", "augusti", "september", "oktober", "november", "december"],
  "shortMonths": ["jan", "feb", "mars", "apr", "maj", "jun", "jul", "aug", "sept", "okt", "nov", "dec"]
})
var formatMillionSEK = function(d) {
	return locale.numberFormat(".2s")(d)
		.replace('k', ' tKr')
		.replace('M', ' Mkr'); 
}
var formatInSentence = function(d) {
	return locale.numberFormat(".3s")(d)
		.replace('k', '&nbsp;000 kronor')
		.replace('M', '&nbsp;miljoner kronor'); 
}
var formatPercent = function(d) {
  return locale.numberFormat("%")(d);
}
var formatPercentInSentence = function(d) {
  return locale.numberFormat("%")(d)
    .replace('%', ' procent');
}