const moment = require('moment');
const fs = require('fs');

function handleAppendAttempt(err) {
  if (err) {
    console.error(err);
  }
}

function checkDirectorySync(directory) {
  try {
    fs.statSync(directory);
  } catch (e) {
    fs.mkdirSync(directory);
  }
}

function mergePaths(path, nextDir) {
  const mergedPath = `${path}/${nextDir}`;

  // (This is what we call a "side-effect")
  checkDirectorySync(mergedPath);

  return mergedPath;
}

function getLogDirectory(rootDir, callback) {
  // Get the directory nodes we'll be using (YYYY/MM/DD)
  const dirs = [
    moment().format('YYYY'),
    moment().format('MM'),
    moment().format('DD'),
  ];

  // Reduce our nodes, checking their directory existence along the way
  const logDir = dirs.reduce(mergePaths, rootDir);

  // Execute the callback with the final reduced log directory
  callback(undefined, logDir);
}

module.exports = (rootDir, csv) => {
  getLogDirectory(rootDir, (err, logDir) => {
    if (err) {
      throw err;
    }

    // Create log file path
    const minute = moment().startOf('hour').unix();
    const logFile = `${logDir}/${minute}.csv`;

    // Attempt to append the csv + newline to the log file
    fs.appendFile(logFile, `${csv}\r\n`, handleAppendAttempt);
  });
};
