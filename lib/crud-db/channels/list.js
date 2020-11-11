class ChannelsList {

  constructor(crud) {

    this.crud = crud;
    this.connection = this.crud.connection;
    this.reducers = this.crud.reducers;
    this.cache = this.crud.cache;
  }

  get(guild) {

    const discordChannels = guild.channels.cache.array();

    discordChannels.forEach(discordChannel => {
      this.cache.channels.add(
        this.reducers.channel( discordChannel )
      )
    });

    return this.cache.channels.entities;
  }

};

module.exports = ChannelsList;
