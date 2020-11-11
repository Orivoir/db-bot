class EntryDelete {

  constructor( discordMessage ) {

    this.discordMessage = discordMessage;
  }

  /**
   * @return { Promise<Discord.Message>}
   */
  execute() {

    return this.discordMessage.delete({
      reason: `silence is golden..`
    });

  }

}

module.exports = EntryDelete;
