const moment = require('moment');

const fetchRedisInfo = require('./fetchRedisInfo');
const parseInfo = require('./parseInfo');

module.exports = (address, keys, callback) => {
  fetchRedisInfo(address, (err, info) => {
    // Set the record object
    const record = {
      timestamp: moment().startOf('minute').toISOString(),
      address,
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
  });
};