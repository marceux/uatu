const winston = require('winston');
const json2csv = require('json2csv');
const uatu = require('../src/index');

// Array of all redis instance addresses
const instances = [
  {
    host: '0.0.0.0',
    label: 'Test',
  },
];

// keys (or name of data) we are matching for inside `info`
const keys = [
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
    'host',
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

uatu({ instances }).getInfo(keys, callback);
