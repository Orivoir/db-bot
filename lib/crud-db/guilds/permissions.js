const ROLES = require('./../../../store/roles.json');

class GuildPermissions {

  constructor( guild, connection ) {

    this.guild = guild;
    this.connection = connection;

    this.isMember = !!this.guild.me;

    if( this.isMember ) {
      this.permissions = this.guild.me.permissions
        .toArray()
        .filter( perm => ROLES.includes(perm) )
    }

  }

  get isAdmin() {
    return this.isMember && this.permissions.includes("ADMINISTRATOR");
  }

  get createDb() {
    return this.isMember && (this.permissions.includes( "MANAGE_CHANNELS" ) || this.isAdmin);
  }

  get deleteDb() {
    return this.isMember && (this.permissions.includes( "MANAGE_CHANNELS" ) || this.isAdmin) ;
  }

  get readDb() {
    return this.isMember;
  }

  get createEntries() {
    return this.isMember && (this.permissions.includes( "SEND_MESSAGES" ) || this.isAdmin);
  }

  get readEntries() {
    return this.isMember && (this.permissions.includes( "VIEW_CHANNEL" ) || this.isAdmin);
  }

  get deleteEntries() {
    return this.isMember && (this.permissions.includes( "MANAGE_MESSAGES" ) || this.isAdmin);
  }

  get updateEntries() {
    return this.isMember && (this.permissions.includes( "MANAGE_MESSAGES" ) || this.isAdmin);
  }

};

module.exports = GuildPermissions;
