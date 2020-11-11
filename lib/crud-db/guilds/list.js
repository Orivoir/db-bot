class GuildsList {

  constructor(crud) {

    this.crud = crud;
    this.connection = this.crud.connection;
    this.cache = this.crud.cache;
    this.reducers = this.crud.reducers;
  }

  get items() {

    const discordCacheGuilds = this.connection.guilds.cache.array();

    discordCacheGuilds.forEach(discordGuild => {
      this.cache.servers.add( discordGuild )
    });

    return this.cache.servers.entities;
  }

}

module.exports = GuildsList;
