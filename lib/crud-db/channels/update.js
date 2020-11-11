class ChannelUpdate {

  constructor( guildChannel, optionsUpdate ) {
    this.guildChannel = guildChannel;
    this.optionsUpdate = optionsUpdate;
  }

  /**
   * @return {Promise<GuildChannel>}
   */
  execute() {

    if( !(this.guildChannel.edit instanceof Function) ) {
      throw new TypeError('can update only a guild channel');
    }

    return this.guildChannel.edit(
      this.optionsUpdate, // name, parentId

      // optional string reason update
      `just ${this.optionsUpdate.name || this.optionsUpdate.parentID || "<3"}`
    );
  }

};