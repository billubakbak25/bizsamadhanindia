function mapRecord(record, fieldMap) {
  if (!record) {
    return null;
  }

  const output = {};

  Object.entries(fieldMap).forEach(([sourceKey, targetKey]) => {
    output[targetKey] = record[sourceKey];
  });

  return output;
}

function mapRecords(records, fieldMap) {
  return (records || []).map((record) => mapRecord(record, fieldMap));
}

function buildFieldMap(fields) {
  return fields.reduce((accumulator, [sourceKey, targetKey]) => {
    accumulator[sourceKey] = targetKey;
    return accumulator;
  }, {});
}

module.exports = {
  mapRecord,
  mapRecords,
  buildFieldMap,
};
