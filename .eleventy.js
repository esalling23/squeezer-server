
module.exports = function(eleventyConfig) {
	console.log('config')
  // Specify the input and output directories
  // eleventyConfig.setInputDirectory('./11ty/templates'); // Central template directory
	// console.log('finished input directory')
  // eleventyConfig.setOutputDirectory('_site');

	// console.log('finished setting directories')
	
  // Pass through copy any additional assets
  // eleventyConfig.addPassthroughCopy('11ty/assets'); // For example, if you have static assets
	// console.log('finished copying assets')
	
  // Set the template engine (e.g., Handlebars)
  eleventyConfig.setTemplateFormats(['hbs']);
	console.log('finished setting hbs template')
  
  // Optionally configure other options
  // eleventyConfig.addCollection('myCollection', collection => { ... });

  return {
    dir: {
      input: '_src',
      output: '_site'
    }
  };
};
