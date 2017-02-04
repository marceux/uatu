const moment = require('moment');
const Redis = require('ioredis');

const parseInfo = require('./parseInfo');

class Uatu {
  constructor({ instances }) {
    // Bind methods to "this" (just in case)
    this.getInfo = this.getInfo.bind(this);
    this.makeConnection = this.makeConnection.bind(this);
    this.forEachInstance = this.forEachInstance.bind(this);

    // Containers for our errors and instances
    this.instances = instances;
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
        reject({
          host,
          label,
          description,
          error: new Error(`Connection failed for ${label} (${description})`),
        });
      });

      redis.on('connect', () => {
        // Resolve with a redis connection with other properties
        resolve({ redis, description, host, label });
      });
    });
  }

  forEachInstance(resolve, reject) {
    // map the instances to connections, and then map those promises
    // to resolve and reject functions
    this.instances
      .map(this.makeConnection)
      .map(promise => promise.then(resolve, reject));
  }

  getInfo(keys, resolve, reject) {
    const instanceResolve = ({ host, label, description, redis }) => {
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

          // Reject with the record and error
          reject(record);
        } else {
          // We are calling the resolve callback with the merged record and parsed info
          resolve(Object.assign(record, parseInfo(info, keys)));
        }

        redis.disconnect();
      });
    };

    const instanceReject = (err) => reject(err);

    // Iterate over all instances, in case there were errors, use the "reject" callback
    this.forEachInstance(instanceResolve, instanceReject);
  }
}

module.exports = Uatu;
