class ChannelDelete {

  constructor(discordChannel, connection) {

    this.discordChannel = discordChannel;
    this.connection = connection;
  }

  /**
   * @return {Promise<Channel>}
   */
  execute() {

    return this.discordChannel.delete();
  }

}

module.exports = ChannelDelete;
