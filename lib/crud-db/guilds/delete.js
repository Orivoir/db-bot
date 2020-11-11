class GuildDelete {

  constructor( guild, connection ) {

    this.guild = guild;
    this.connection = connection;
  }

  execute() {

    return new Promise( (resolve, reject) => {
      this.guild.delete()
      .then( discordGuildDelete => resolve( discordGuildDelete ) )
      .catch( error => reject( error ) )
    } );
  }

};

module.exports = GuildDelete;
