
// Method to generate an object based on css variables
const extractCssVariables = (cssText) => {
  const result = {};
	console.log(cssText)

  // Match content inside :root { } block
  const rootMatch = cssText.match(/:root\s*{([^}]+)}/);
  if (!rootMatch) {
    return result; // Return empty if no :root block is found
  }

  const rootContent = rootMatch[1];

  // Match each --var-name: 'value';
  const varMatches = rootContent.matchAll(/--([\w-]+)\s*:\s*['"]?([^;'"]+)['"]?\s*;/g);

  for (const match of varMatches) {
    const varName = match[1];
    const varValue = match[2];
    result[varName] = varValue;
  }

  return result;
}

const CharCase = {
  KEBAB: 'KEBAB',
  CAMEL: 'CAMEL'
}

const transformKeys = (obj, charCase = CharCase.CAMEL) => {
  const result = {};

  Object.keys(obj).forEach(key => {
    const newKey = charCase === CharCase.CAMEL 
      ? convertKebabToCamelCase(key) 
      : convertCamelToKebabCase(key)
    result[newKey] = obj[key];
  });
  
  return result;
}

const convertKebabToCamelCase = (str) => 
  str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());

// https://stackoverflow.com/a/67243723/15835070
const convertCamelToKebabCase = (str) => 
  str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? "-" : "") + $.toLowerCase())

// Writes css variables object to css string
const writeCssVariables = (variables) => {
	const variableStrings = Object.entries(variables).map(([key, value]) => `--${key}: ${value}; `)
	const styles = `:root {
${variableStrings.join('\n')}
}`;
	return styles;
}

// Parses theme object into css-ready `vars` and `fonts`
const parseTheme = (themeObj = {}) => Object.keys(themeObj).reduce((parsedData, key) => {
  if (!themeObj[key]) return parsedData
  if (typeof themeObj[key] === 'string') {
    return { ...parsedData, vars: { ...parsedData.vars, [key]: themeObj[key] } }
  }

  const isDataFont = typeof themeObj[key] === 'object' 
    && 'family' in themeObj[key]
    && 'url' in themeObj[key]

  if (isDataFont) {
    return {
      ...parsedData,
      vars: { ...parsedData.vars, [key]: themeObj[key].family },
      fonts: [ ...parsedData.fonts, themeObj[key].url ]
    }
  }

  return parsedData
}, { vars: {}, fonts: [] })

module.exports = {
	extractCssVariables,
  CharCase,
	transformKeys,
  parseTheme,
	writeCssVariables
}

