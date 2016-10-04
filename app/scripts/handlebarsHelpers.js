Handlebars.registerHelper('slugify', function (component, options) {
    var slug = component
    	.replace(/[^\w\s]+/gi, '')
    	.replace(/ +/gi, '-')
    	.replace('åä','a')
    	.replace('ö','o');
    return slug.toLowerCase();

  });