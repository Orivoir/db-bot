const ChannelsList = require('./list');
const ChannelCreate = require('./create');
const ChannelFetch = require('./fetch');
const ChannelDelete = require('./delete');
const ChannelUpdate = require('./update');

const Entries = require('./../entries/entries');

class Channels {

  constructor(crud) {

    this.crud = crud;
    this.list = new ChannelsList( this.crud );
    this.create = new ChannelCreate( this.crud );

    this.entries = new Entries( this.crud );
  }

  getEntries( reduceChannel ) {

    if(
      typeof reduceChannel !== "object" ||
      reduceChannel.constructor.name !== "StdReducer"
    ) {
      throw new TypeError('delete channel arg1 should be a channel');
    }

    return new Promise( (resolve,reject) => {

      this.$resolve( reduceChannel.content.id )
      .then( discordChannel => {

        resolve(
          this.entries.getList( discordChannel )
        );

      } )
      .catch( error => reject(error) );

    } );

  }

  createEntry( reduceChannel, content ) {

    if(
      typeof reduceChannel !== "object" ||
      reduceChannel.constructor.name !== "StdReducer"
    ) {
      throw new TypeError('delete channel arg1 should be a channel');
    }

    return new Promise( (resolve,reject) => {

      this.$resolve( reduceChannel.content.id )
      .then( discordChannel => {

        this.entries.create(
          discordChannel,
          content
        )
        .then( reduceMessage => resolve( reduceMessage ) )
        .catch( error => reject( error ) );

      } )
      .catch( error => reject(error) );

    } );

  }

  updateEntry( reduceChannel, reduceMessage, newContent ) {

    if(
      typeof reduceChannel !== "object" ||
      reduceChannel.constructor.name !== "StdReducer"
    ) {
      throw new TypeError('delete channel arg1 should be a channel');
    }

    return new Promise( (resolve,reject) => {

      this.$resolve( reduceChannel.content.id )
      .then( discordChannel => {

        this.entries.update(
          discordChannel,
          reduceMessage,
          newContent
        )
        .then( reduceMessageUpdate => (
          resolve(reduceMessageUpdate)
        ) )
        .catch( error => reject( error ) )

      } )
      .catch( error => reject(error) );

    } );

  }

  deleteEntry( reduceChannel, reduceMessage ) {

    if(
      typeof reduceChannel !== "object" ||
      reduceChannel.constructor.name !== "StdReducer"
    ) {
      throw new TypeError('delete channel arg1 should be a channel');
    }

    return new Promise( (resolve,reject) => {

      this.$resolve( reduceChannel.content.id )
      .then( discordChannel => {

        this.entries.delete(
          discordChannel,
          reduceMessage
        )
        .then( reduceMessageDelete => (
          resolve( reduceMessageDelete )
        ) )
        .catch( error => reject( error ) );

      } )
      .catch( error => reject(error) );

    } );

  }

  getList( reduceGuild ) {

    return new Promise( (resolve, reject ) => {

      this.crud.guilds.$resolve( reduceGuild )
      .then( discordGuild => {
          resolve(
            this.list.get( discordGuild )
          );
      } )
      .catch( error => reject( error ) );

    } );

  }

  create(optionsCreate) {

    return new Promise( (resolve,reject) => {

      this.create.execute(optionsCreate)
      .then( discordGuildChannel => {

        const reduceGuildChannel = this.crud.reducers.channel( discordGuildChannel );

        this.crud.cache.channels.add( reduceGuildChannel );

        resolve( reduceGuildChannel );
      } )
      .error( error => reject( error ) );

    } );

  }

  delete(reduceChannel) {

    return new Promise( (resolve,reject) => {

      this.$resolve( reduceChannel.content.id )
      .then( discordChannel => {

        new ChannelDelete(
          discordChannel,
          this.crud.connection
        )
        .execute()
        .then( discordChannelDelete => {

          const reduceChannelDelete = this.crud.reducers.channel( discordChannelDelete );

          this.crud.cache.channels.delete( reduceChannelDelete );

          resolve( reduceChannelDelete );

        } )
        .catch( error => reject( error ) );

      } )
      .catch( error => {
        reject( error );
      } )

    } );

  }

  update( reduceChannel, optionsUpdate ) {

    this.$resolve( reduceChannel.content.id )
    .then( discordChannel => {

      new ChannelUpdate( discordChannel, optionsUpdate )
      .execute()
      .then( discordChannelUpdate => {

        const reduceChannelUpdate = this.crud.reducers.channel( discordChannelUpdate );

        this.crud.cache.channels.delete( reduceChannel );
        this.crud.cache.add( reduceChannelUpdate );

        resolve( reduceChannelUpdate );

      } )
      .catch( error => reject( error ) )

    } )
  }

  /**
   * @return {Promise<Discord.Channel>}
   */
  $resolve( channelId ) {
    return new ChannelFetch(
      channelId,
      this.crud.connection
    ).get();

  }

};

module.exports = Channels;
