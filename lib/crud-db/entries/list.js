const { DiscordAPIError } = require("discord.js");

class EntriesList {

  constructor(crud) {
    this.crud = crud;
  }

  get discordChannel() {
    return this._discordChannel;
  }

  set discordChannel(discordChannel) {

    this._discordChannel = discordChannel;

    if(
      typeof this._discordChannel !== "object" ||
      !this._discordChannel.isText()
    ) {
      throw new TypeError('can get list entries only on TextChannel');
    }

  }

  /**
   * @return {Promise<Discord.Collection<SnowFlake,Message>>}
   */
  get() {

    const messageManager = this.discordChannel.messages;

    return messageManager.fetch()
      // .array()
      // .map( discordMessageCache => (
      //   this.crud.reducers.message( discordMessageCache )
      // ) )
    ;

  }

}

module.exports = EntriesList;
