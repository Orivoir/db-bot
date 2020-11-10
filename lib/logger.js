const chalk = require('chalk');

const TYPES = {
  "error": "red",
  "info": "cyan",
  "success": "green",
  "warn": "yellow"
};

module.exports = function(channel,type,message) {

  type = type?.toLocaleLowerCase();

  const colorType = TYPES[type] || "white";

  const logType = chalk[colorType]( `[${type}]` );

  console.log(chalk`{cyan.bold [${channel}]} ${logType} {grey.bold [${(new Date).toLocaleString()}]} ${message}`);
};
