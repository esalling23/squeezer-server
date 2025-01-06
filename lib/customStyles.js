
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

const convertKeysToCamelCase = (obj) => {
  const result = {};

  Object.keys(obj).forEach(key => {
    const camelCaseKey = key.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
    result[camelCaseKey] = obj[key];
  });

  return result;
}

// Writes css variables object to css string
const writeCssVariables = (variables) => {
	const variableStrings = Object.entries(variables).map(([key, value]) => `--${key}: ${value}; `)
	const styles = `:root {
${variableStrings}
}`;
	return styles;
}

module.exports = {
	extractCssVariables,
	convertKeysToCamelCase,
	writeCssVariables
}

