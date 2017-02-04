const winston = require('winston');
const json2csv = require('json2csv');

const Uatu = require('../src/index');

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

const uatu = new Uatu({ instances });

// Must call getInfo with a resolve callback and a reject callback
uatu.getInfo(keys, instance => console.log(instance), err => console.log(err));
