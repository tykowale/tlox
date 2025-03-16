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

  write(str) {
    this.file.write(str);
  }

  writeln(str = '') {
    this.file.write(str + '\n');
  }

  format(format, ...args) {
    this.file.write(util.format(format, ...args));
  }

  formatln(format, ...args) {
    this.file.write(util.format(format, ...args) + '\n');
  }

  flush() {
    if (typeof this.file.flush === 'function') {
      this.file.flush();
    }
  }

  close() {
    this.file.close();
  }
}

module.exports = PrintWriter;
