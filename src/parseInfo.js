module.exports = (info, keys) => {
  const output = {};

  // Map keys column to matched info data to get values
  const values = keys.map(key => {
    const re = new RegExp(`${key}:(\\S+)`);
    const found = info.match(re);

    if (found) {
      return found[1];
    }

    return undefined;
  });

  for (let i = 0; i < keys.length; i++) {
    const columnName = keys[i];
    const columnValue = values[i];

    output[columnName] = columnValue;
  }

  return output;
};
