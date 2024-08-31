const fs = require("fs");
const path = require("path");
const log4js = require("log4js");

const logDirectory = path.join(__dirname, "../log");
const logFile = path.join(logDirectory, "app.log");

if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

log4js.configure({
  appenders: {
    out: {
      type: "stdout",
      layout: {
        type: "pattern",
        pattern: "%d{yyyy-MM-dd hh:mm:ss} [%p] %c - %m",
      },
    },
    app: {
      type: "file",
      filename: logFile,
      layout: {
        type: "pattern",
        pattern: "%d{yyyy-MM-dd hh:mm:ss} [%p] %c - %m",
      },
    },
  },
  categories: {
    default: {
      appenders: ["out", "app"],
      level: "debug",
    },
  },
});

const logger = log4js.getLogger();
logger.level = process.env.LOG_LEVEL || "debug";

module.exports = logger;
