const winston = require('winston');
const json2csv = require('json2csv');

const Uatu = require('../src/index');

// Array of all redis instance addresses
const hosts = [
  '0.0.0.0'
];

// Interval of a minute
const interval = 300000;

// keys (or name of data) we are matching for inside `info`
const infoKeys = [
  'used_memory',
  'used_memory_human',
  'db0',
  'error',
];

// Logging Settings
winston.add(winston.transports.File, {
  timestamps: false,
  filename: 'log.csv',
  json: false,
  formatter: (log) => log.message,
});

winston.remove(winston.transports.Console);

const callback = (err, record) => {
  const fields = [
    'timestamp',
    'used_memory',
    'used_memory_human',
    'db0',
    'error',
  ];

  const csv = json2csv({
    data: record,
    del: '\t',
    fields,
    hasCSVColumnTitle: false,
  });

  winston.log('info', csv);
};

const monitor = new Uatu({
  hosts,
  interval,
  infoKeys,
  callback,
});

monitor.launch();
