const moment = require('moment');
const Redis = require('ioredis');

const parseInfo = require('./parseInfo');

module.exports = (options) => {
  // get our options values
  const { instances } = options;

  return {
    getInfo: (keys, callback) => {
      // Iterate over all the instances
      instances.forEach(({ host, label, description }) => {
        const redis = new Redis({ host });

        redis.info((err, info) => {
          // Set the record object
          const record = {
            timestamp: moment().startOf('minute').toISOString(),
            host,
            label,
            description,
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
          callback(null, Object.assign(record, parseInfo(info, keys)));

          // Disconnect our Redis instance
          redis.disconnect();
        });
      });

      return this;
    },
  };
};
