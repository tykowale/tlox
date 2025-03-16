const fs = require('fs');
const util = require('util');

/**
 * In creafting interpretors they used javas printwriter class
 * so I figured I'd mimic that behavior and create my own
 * printwriter class
 */
class PrintWriter {
  constructor(fileName, options) {
    this.file = fs.createWriteStream(fileName, options);
  }

  writeln(str = '') {
    this.file.write(str + '\n');
  }
  close() {
    this.file.close();
  }
}

module.exports = PrintWriter;
