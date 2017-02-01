const moment = require('moment');
const Redis = require('ioredis');

const parseInfo = require('./parseInfo');

module.exports = (options) => {
  // get our options values
  const { hosts, infoKeys, callback } = options;

  function fetchInfo(host) {
    const redis = new Redis({ host });

    redis.info((err, info) => {
      // Set the record object
      const record = {
        timestamp: moment().startOf('minute').toISOString(),
        host,
      };

      if (err) {
        try {
          record.error = err.toString();
        } catch (e) {
          record.error = e.toString();
        }
      }

      // We are calling the callback with null and the merged record
      // with the parsed info by the keys
      callback(null, Object.assign(record, parseInfo(info, infoKeys)));

      // Disconnect our Redis instance
      redis.disconnect();
    });
  }

  return {
    monitor: () => {
      hosts.forEach(fetchInfo);
      return this;
    },
  };
};
