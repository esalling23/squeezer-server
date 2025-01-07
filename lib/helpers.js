const removeObjNullValues = (obj) => Object.keys(obj).reduce((rObj, key) => ({
  ...rObj,
  ...(obj[key] !== null ? { [key]: obj[key] } : {})
}), {})

module.exports = {
  removeObjNullValues,
}