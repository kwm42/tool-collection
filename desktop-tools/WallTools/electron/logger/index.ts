import { app } from 'electron';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import log from 'electron-log';

const logDir = join(app.getPath('userData'), 'logs');
if (!existsSync(logDir)) {
  mkdirSync(logDir);
}

log.transports.file.resolvePath = () => join(app.getPath('userData'), 'logs', 'app.log');

export function logMessage(message: string) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  log.info(logMessage);
  console.log(Buffer.from(logMessage, 'utf8').toString());
}
