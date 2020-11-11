class ChannelFetch {

  constructor( channelId, connection ) {

    this.channelId = channelId;
    this.connection = connection;
  }

  get() {
    return this.connection.channels.fetch( this.channelId );
  }

}

module.exports = ChannelFetch;
