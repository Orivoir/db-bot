const EntriesList = require('./list');
const EntryCreate = require('./create');
const EntryUpdate = require('./update');
const EntryFetch = require('./fetch');
const EntryDelete = require('./delete');

class Entries {

  constructor(crud) {

    this.crud = crud;

    this.list = new EntriesList(crud);
    this.create = new EntryCreate(crud);
  }

  getList(reduceChannel) {

    if( typeof reduceChannel !== "object" ) {
      throw new TypeError('get entries list arg1 should be channel object');
    }

    return new Promise( (resolve,reject) => {

      this.crud.guilds.channels.$resolve(
        reduceChannel.content.id
      )
      .then( discordChannel => {

        this.list.discordChannel = discordChannel;

        this.list.get()
        .then( discordMessages => {

          resolve(
            discordMessages.array()
            .map( discordMessage => (
              this.crud.reducers.message( discordMessage )
            ) )
          );

        } )
        .catch( error => reject(error) )

      } )
      .catch( error => reject( error ) );

    } );
  }

  create( channel, content ) {

    this.create.discordChannel = channel;

    return new Promise((resolve,reject) => {

      this.create.send( content )
      .then( discordMessage => (
        resolve( this.crud.reducers.message( discordMessage ) )
      ) )
      .catch( error => reject( error ) );

    });

  }

  update( channel, reduceMessage, newContent ) {

    return new Promise( (resolve,reject) => {

      this.$resolve(
        channel,
        reduceMessage.content.id
      )
      .then( discordMessage => {

        new EntryUpdate(discordMessage)
        .execute( newContent )
        .then( discordMessageUpdate => {

          resolve(
            this.crud.reducers.message( discordMessageUpdate )
          );

        } )
        .catch( error => reject( error ) );

      } )
      .catch( error => reject( error ) )

    } );

  }

  delete( channel, reduceMessage ) {

    return new Promise( (resolve,reject) => {

      this.$resolve(
        channel,
        reduceMessage.content.id
      )
      .then( discordMessage => {

        new EntryDelete(discordMessage)
        .execute()
        .then( discordMessageDelete => {

          resolve(
            this.crud.reducers.message( discordMessageDelete )
          );

        } )
        .catch( error => reject( error ) );

      } )
      .catch( error => reject( error ) )

    } );
  }

  /**
   * @param {Discord.TextChannel} channel
   * @param {SnowFlake} messageId
   * @return {Promise<Discord.Message>}
   */
  $resolve( channel, messageId ) {
    return new EntryFetch(messageId, channel).get();
  }

}

module.exports = Entries;
