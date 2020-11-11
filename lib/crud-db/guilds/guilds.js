const GuildsList = require('./list');
const GuildFetch = require('./fetch');
const GuildPermissions = require('./permissions');
const GuildDelete = require('./delete');
const GuildCreate = require('./create');

const Channels = require('./../channels/channels');

class Guilds {

  constructor(crud) {

    this.crud = crud;
    this.list = new GuildsList( this.crud );
    this.create = new GuildCreate( this.crud.connection );

    this.channels = new Channels( crud );
  }

  getChannels( guild ) {

    if(
      typeof guild !== "object" ||
      guild.constructor.name !== "StdReducer"
    ) {
      throw new TypeError('get channels arg1 should be a guild');
    }

    return new Promise( (resolve,reject) => {

        this.$resolve( guild )
        .then( discordGuild => {
          resolve(
            this.channels.getList(discordGuild)
          );
        } )
        .catch( error => reject(error) );

    } );

  }

  createChannel( guild, optionsChannelCreate ) {

    return new Promise((resolve,reject) => {

      this.$resolve( guild )
      .then( discordGuild => {

        optionsChannelCreate.guild = discordGuild;

        this.channels.create( optionsChannelCreate )
        .then( reduceGuildChannel => {
          resolve( reduceGuildChannel )
        } )
        .catch( error => reject( error ) );

      } )
      .catch( error => reject( error ) );

    });
  }

  deleteChannel( reduceChannel ) {

    if(
      typeof reduceChannel !== "object" ||
      reduceChannel.constructor.name !== "StdReducer"
    ) {
      throw new TypeError('delete channel arg1 should be a channel');
    }

    return this.channels.delete(reduceChannel);
  }

  updateChannel( reduceChannel, optionsChannelUpdate ) {

    if(
      typeof reduceChannel !== "object" ||
      reduceChannel.constructor.name !== "StdReducer"
    ) {
      throw new TypeError('delete channel arg1 should be a channel');
    }

    return this.channels.update(
      reduceChannel,
      optionsChannelUpdate
    );

  }

  getList() {
    return this.list.items;
  }

  /**
   * @return {Promise<GuildPermissions>}
   */
  getPermissions( guild ) {

    if( typeof guild !== "object" ) {
      throw new TypeError("get permissions guild arg1 should be a guild");
    }

    return new Promise( (resolve,reject) => {

      const createPermissions = discordGuild => (
        new GuildPermissions( discordGuild, this.crud.connection )
      );

      this.$resolve( guild )
      .then( discordGuild => (
        resolve( createPermissions( discordGuild ) )
      ) )
      .catch( error => reject( error ) );

    } );

  }

  delete( guild ) {

    return new Promise( (resolve,reject) => {

      this.$resolve( guild )
      .then( discordGuild => {

        const gd = new GuildDelete(discordGuild, this.crud.connection);

        gd.execute()
        .then( discordGuildDelete => {

          const reduceGuildDelete = this.crud.reducers.guild( discordGuildDelete );

          this.crud.cache.servers.delete( reduceGuildDelete );

          resolve( reduceGuildDelete );
        } )
        .catch( error => reject( error ) )

      } )
      .catch( error => reject( error ) )

    } );

  }

  create( guildname ) {

    return new Promise((resolve,reject) => {

      this.create.execute( guildname )
      .then( discordGuild => {

        const reduceGuildCreate = this.crud.reducers.guild( discordGuild );

        this.crud.cache.servers.add( discordGuild );

        resolve( reduceGuildCreate );

      } )
      .catch( error => reject( error ) );

    });

  }

  $resolve( guild ) {

    if( typeof guild !== "object" ) {
      throw new TypeError("get permissions guild arg1 should be a guild");
    }

    return new Promise( (resolve,reject) => {

      const gf = new GuildFetch( guild.content.id, this.crud.connection );

      gf.get()
      .then( discordGuild => {
        resolve( discordGuild );
      } )
      .catch( error => {
        reject( error )
      } );

    } );


  }

}

module.exports = Guilds;
