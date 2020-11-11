class GuildCreate {

  constructor( connection ) {

    this.connection = connection;

  }

  execute( guildname ) {
    return this.connection.guilds.create( guildname );
  }

}

module.exports = GuildCreate;