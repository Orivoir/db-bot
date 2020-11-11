class EntryUpdate {

  constructor( discordMessage ) {

    this.discordMessage = discordMessage;
  }

  /**
   * @return { Promise<Discord.Message>}
   */
  execute( content ) {

    if( typeof content === "object" ) {

      content = JSON.stringify( content );
    }

    return this.discordMessage.edit( content );
  }
}

module.exports = EntryUpdate;
