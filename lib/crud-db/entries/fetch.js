const EntryUpdate = require("./update");

class EntryFetch {

  constructor( messageId, discordChannel) {

    this.discordChannel = discordChannel;
    this.crud = crud;
    this.messageId = messageId;

  }

  get() {

    return this.discordChannel.messages.fetch( this.messageId );
  }

}

module.exports = EntryFetch;
