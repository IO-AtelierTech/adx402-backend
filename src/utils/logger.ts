import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

import env from "../env";

const logDir = "logs";

// Console format: human-readable
const consoleTransport = new winston.transports.Console({
  // change to info on prod
  level: env.APP_ENV === "production" ? "debug" : "debug",
  format: winston.format.combine(
    ...(env.APP_ENV === "production"
      ? [
        // Production: no color, structured logs for Cloud Run
        winston.format.printf(({ level, message, ...meta }) => {
          return JSON.stringify({
            severity: level,
            message,
            ...meta,
          });
        }),
      ]
      : [
        winston.format.colorize(),
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf(({ level, message, ...meta }) => {
          delete meta.timestamp;
          return `[${level}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""
            }`;
        }),
      ]),
  ),
});

// File format: JSON, daily rotation
const fileTransport = new DailyRotateFile({
  level: "info",
  dirname: logDir,
  filename: "app-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: false,
  maxFiles: "30d", // keep logs for 30 days
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
});

const logger = winston.createLogger({
  transports: [consoleTransport, fileTransport],
  exitOnError: false,
});

export default logger;
