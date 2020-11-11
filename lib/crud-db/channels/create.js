class ChannelCreate {

  constructor(connection) {
    this.connection = connection;
  }

  /**
   * @return Promise<GuildChannel>
   */
  execute({
    guild,
    name,
    type,
    parent=null // CategoryChannel | SnowFlake
  }) {

    return guild.channels.create(
      name,
      {
        type: type || "text",
        parent: parent || undefined
      }
    );

  }

}

module.exports = ChannelCreate;
