class GuildFetch {


  constructor( guildId, connection ) {
    this.guildId = guildId;
    this.connection = connection;
  }

  get() {
    return this.connection.guilds.fetch( this.guildId );
  }

};

module.exports = GuildFetch;
