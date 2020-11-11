class EntryCreate {

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
      throw new TypeError('can create entries only on TextChannel');
    }

  }

  send(content) {

    if( typeof content === "object" ) {
      content = JSON.stringify( content );
    }

    return this.discordChannel.send( content );
  }

}

module.exports = EntryCreate;
