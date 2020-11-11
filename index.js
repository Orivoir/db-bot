const logger = require('./lib/logger');
const auth = require('./lib/auth');
const Crud = require('./lib/crud-db/crud');


class Dbiscord {

  constructor( token ) {

    this.token = token;
    this.isLogged = false;
  }

  auth() {

    if( !this.token ) {
      throw new TypeError('token should be not empty string value');
    }

    return new Promise( (resolve, reject) => {

      auth( {token: this.token} )
        .then( client => {

          this.isLogged = true;

          logger('discord', 'success', `${client.user.username} is logged`);

          resolve(
            new Crud(client)
          );

        }  )
        .catch( error => {

          logger(
            'discord',
            'error',
            `${error.code} => ${error.message}`
          );

          reject( error );

        } );

    } );

  }

  get token() {
    return this._token;
  }
  set token(token) {
    this._token = (typeof token === "string" && token.length > 0) ? token: null;
  }

};

module.exports = Dbiscord;
