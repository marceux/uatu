const Redis = require('ioredis');

module.exports = (address, callback) => {
  // Redis Connection
  const redis = new Redis({
    host: address,
  });

  redis.info(callback);
};
