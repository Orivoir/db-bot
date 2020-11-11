/**
 * @see /test/cache-json.test.js
 */

const pathResolver = require('path');
const fs = require('fs');

class JsonCache {

  static get ABS_PATH_CACHES() {
    return pathResolver.join(__dirname, "./store");
  }

  static GET_ABS_PATH_FILE( filename ) {

    return pathResolver.join(
      JsonCache.ABS_PATH_CACHES,
      (JsonCache.PARSE_FILENAME( filename ) + ".json")
    );

  }

  static EXISTS_FILE( filename ) {

    const path = JsonCache.GET_ABS_PATH_FILE( filename );

    return !!fs.existsSync( path );
  }

  static PARSE_FILENAME( filename ) {

    if( /\.json$/.test(filename) ) {
      filename = filename.split('.json');
      filename.pop();
      filename = filename.join('.json');
      return filename;
    } else {
      return filename;
    }
  }

  constructor( filename ) {
    this.filename = filename;

    if( !fs.existsSync( this.pathFile ) ) {
      this.write({});
    } else {

      const stat = fs.statSync( this.pathFile );

      if( stat.isSymbolicLink() ) {
        throw new TypeError('filename cant be symbolickLink should be a file');
      }

      if( !stat.isFile() ) {
        throw new TypeError('filename exists but should be a file');
      }

    }
  }

  destroy() {

    if( this.isDestroy ) return false;

    this.isDestroy = true;
    fs.unlinkSync( this.pathFile );
    return true;
  }

  get filename() {
    return this._filename;
  }
  set filename(filename) {

    if( typeof filename !== "string" ) {
      throw new TypeError('filename should be a string value')
    }

    filename =  JsonCache.PARSE_FILENAME( filename );

    this._filename = filename;

  }

  get pathFile() {

    return pathResolver.join( JsonCache.ABS_PATH_CACHES, ( this.filename + ".json" ) );
  }

  write( data ) {

    fs.writeFileSync(
      this.pathFile,
      JSON.stringify( data ),
      {
        encoding: "utf-8"
      }
    );

  }

  clear() {
    this.write( {} );
  }

  get read() {

    return JSON.parse(
      fs.readFileSync(
        this.pathFile,
        { encoding: "utf-8" }
      )
    );
  }

};

module.exports = JsonCache;
