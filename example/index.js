const path = require('path');
const json2csv = require('json2csv');
const writeCSV = require('./writeCSV');
const Uatu = require('../src/index');

// Array of all redis instance addresses
const hosts = [
  '0.0.0.0',
];

// Interval of a minute
const interval = 60000;

// keys (or name of data) we are matching for inside `info`
const infoKeys = [
  'used_memory_human',
  'db0',
  'error',
];

// CSV Columns for log
const csvColumns = [
  'timestamp',
  'address',
  'used_memory_human',
  'db0',
  'error',
];

// Log Directory
const logsDir = path.resolve('./');

const callback = (err, record) => {
  const csv = json2csv({ data: record, fields: csvColumns, hasCSVColumnTitle: false });

  writeCSV(logsDir, csv);
};

const monitor = new Uatu({
  hosts,
  interval,
  infoKeys,
  callback,
});

monitor.launch();
