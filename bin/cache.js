#! /usr/bin/env node

const ParseArgv = require('./lib/parse-argv');
const input = new ParseArgv;

const logger = require('./../lib/logger');

const isClear = input.hasArg( "clear" );
const isDelete = input.hasArg( "delete" );

const JsonCache = require('./../lib/cache/json-cache');

const fs = require('fs');

const existsFileCache = filename => {
  return JsonCache.EXISTS_FILE( filename );
};

const missingParam = paramName => {

  logger(
    'CLI.cache',
    'error',
    `missing param: ${paramName}, should be: ${paramName}=:${paramName}`
  );

  process.exit( 1 );
};

const fileNotExists = filename => {

  logger(
    'CLI.cache',
    'info',
    `cache file ${filename}.json not exists`
  );

  process.exit( null );

};

const deleteFile = filename => {

  // console.log(JsonCache.GET_ABS_PATH_FILE( filename ));

  if( existsFileCache( filename ) ) {

    const absPathFile = JsonCache.GET_ABS_PATH_FILE( filename );

    fs.unlinkSync( absPathFile );

  } else {

    fileNotExists(filename);
  }

};

// arg:
if( isClear ) {
  const file = input.params.find( param => (
    param[0] === "file"
  ) );

  if(!file) {
    missingParam( "file" );
  } else {

    deleteFile( file[1] );

    fs.writeFileSync(
      JsonCache.GET_ABS_PATH_FILE( file[1] ),
      JSON.stringify({}),
      {
        encoding: 'utf-8'
      }
    );

    logger(
      'CLI.cache',
      'success',
      `file ${file[1]} have been clear`
    );

    process.exit(0);

  }

} else if( isDelete ) {

  const file = input.params.find( param => (
    param[0] === "file"
  ) );

  if(!file) {
    // missing param
      // error
    missingParam( "file" );
  } else {

    deleteFile( file[1] );

    logger(
      'CLI.cache',
      'success',
      `file ${file[1]} have been delete`
    );

  }

} else {
// unknown arg:
  // error:

  logger(
    'CLI.cache',
    'error',
    'command missing, should be: delete or clear'
  );

  process.exit( 1 );

}
