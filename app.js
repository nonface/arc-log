import { resolve } from 'path';
import { readFile } from 'fs/promises';

function getLogLineItems(logLine) {
  const [timeStamp, message] = logLine?.split(' ');
  const messageId = parseInt(message.split('#')[0], 16);

  return { timeStamp: timeStamp.replace(/\(|\)/g, ''), messageId };
};

function getDuration(logArray) {
  const { timeStamp: begginingTimeStamp } = getLogLineItems(logArray[0]);
  const { timeStamp: endingTimeStamp } = getLogLineItems(
    logArray[logArray.length - 1]
  );

  return endingTimeStamp - begginingTimeStamp;
};

function printLog(duration, logArray) {
  const printFormat = logArray.reduce((acc, { messageId, frequency }, index) => {
    if (index === 0) {
      return `${duration.toFixed(0)}\n\n${messageId}: ${frequency.toFixed(1)}`;
    }

    return `${acc}\n\n${messageId}: ${frequency.toFixed(1)}`;
  }, '');

  console.log(printFormat);
};

(async function parseLog(logPath) {
  const logMap = new Map();
  const log = await readFile(resolve(logPath), 'utf8');
  const logArray = log.split(/\r?\n|\r|\n/g).slice(0, -1);
  const duration = getDuration(logArray);

  logArray.forEach((logLine) => {
    const { messageId } = getLogLineItems(logLine);
    const existingEntry = logMap.get(messageId);

    logMap.set(messageId, (existingEntry || 0) + 1);
  });

  const totals = Array.from(logMap)
    .map(([messageId, count]) => ({ messageId, frequency: count / duration }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5);

  printLog(duration, totals);
})('interview-data.log.txt');
