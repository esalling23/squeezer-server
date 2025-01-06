const fs = require('fs')
const path = require('path')

// const getSiteTemplate = (req, res) => {
//   const templateName = req.params.name;
//   const templatePath = path.join(__dirname, '11ty/templates', `${templateName}.hbs`);

//   // Check if the template file exists
//   if (fs.existsSync(templatePath)) {
//     const templateFile = fs.readFileSync(templatePath, 'utf-8');
//     res.set('Content-Type', 'text/plain');
//     res.send(templateFile);
//   } else {
//     res.status(404).send('Template not found');
//   }
// };
 
const getCustomCss = (req, res) => {
  const styleData = {
    backgroundColor: '#ffcc00',
    textColor: '#333333',
    fontFamily: 'Arial, sans-serif',
    headerColor: '#222222',
    fontSize: '16px'
  };

  const cssTemplate = fs.readFileSync(`11ty/templates/${req.params.template}/index.css.hbs`, 'utf8');
  const template = Handlebars.compile(cssTemplate);
  const compiledCSS = template(styleData);

  res.setHeader('Content-Type', 'text/css');
  res.send(compiledCSS);
};

module.exports = {
	getSiteTemplate,
	getCustomCss,
}