const moment = require('moment');
const Redis = require('ioredis');

const parseInfo = require('./parseInfo');

class Uatu {
  constructor({ instances }) {
    // Bind methods to "this" (just in case)
    this.end = this.end.bind(this);
    this.getInfo = this.getInfo.bind(this);
    this.makeConnection = this.makeConnection.bind(this);
    this.closeConnection = this.closeConnection.bind(this);
    this.forEachInstance = this.forEachInstance.bind(this);

    // Containers for our errors and instances
    this.instances = instances.map(this.makeConnection);
  }

  makeConnection(instance) {
    // We return the promise of a connection...
    return new Promise((resolve, reject) => {
      const { host, label, description } = instance;

      // Make redis connection object
      const redis = new Redis({ host });

      redis.on('error', () => {
        // We don't want to do retries because we don't have a way to handle them atm
        redis.disconnect();

        // Reject with the error
        reject(new Error(`Connection failed for ${label} (${host})`));
      });

      redis.on('connect', () => {
        // Resolve with a redis connection with other properties
        resolve({ redis, description, host, label });
      });
    });
  }

  closeConnection(callback) {
    return (instance) => {
      // Get our properties
      const { host, label, description, redis } = instance;

      // Use the callback after disconnecting and pass the host, label, description
      redis.disconnect(callback({ host, label, description }));
    };
  }

  forEachInstance(resolve, reject) {
    this.instances.map(promise => promise.then(resolve, reject));
  }

  getInfo(keys, callback) {
    this.forEachInstance(({ host, label, description, redis }) => {
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
      });
    });

    return this;
  }

  end(resolve, reject) {
    // Iterate over all instances, close the connections and use callback
    // in case there were errors, use the "reject" callback
    this.forEachInstance(this.closeConnection(resolve), reject);
  }
}

module.exports = Uatu;
