const logInfo = require('./logInfo');

class Uatu {
  constructor({ hosts, interval, infoKeys, callback }) {
    this.hosts = hosts;
    this.interval = interval;
    this.infoKeys = infoKeys;
    this.callback = callback;
  }

  launch() {
    this.hosts.forEach(host => logInfo(host, this.infoKeys, this.callback));
    setTimeout(this.launch, this.interval);
  }
}

module.exports = Uatu;
