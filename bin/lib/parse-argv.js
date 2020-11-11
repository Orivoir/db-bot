class ParseArgv {

  constructor() {

    this.$argv = process.argv.slice( 2, );
  }

  // format: "--xxx"
  static isOption( argv ) {

    argv = argv.trim();
    return argv.slice( 0, 2 ) === "--";
  }

  // format: "xxx=yyy"
  static isParam( argv ) {

    argv = argv.trim();

    const [key,value] = argv.split('=');

    return (
      typeof key === "string" &&
      typeof value === "string" &&
      argv.split('=').length === 2
    );

  }

  // format: "xxx"
  static isArg( argv ) {

    return (
      !ParseArgv.isOption( argv ) &&
      !ParseArgv.isParam( argv )
    );

  }

  hasArg( name ) {
    return !!this.arg.find( arg => arg === name );
  }

  /**
   * @return {string[]}
   */
  get arg() {

    return this.$argv.filter( ParseArgv.isArg )
  }

  /**
   * @return {string[]}
   */
  get options() {

    return this.$argv.filter( ParseArgv.isOption );
  }

  /**
   * @return {string[][]}
   */
  get params() {

    return this.$argv.filter( ParseArgv.isParam )
    .map( param => (
      param.split('=').map( side => side.trim() )
    ) );

  }

}

module.exports = ParseArgv;