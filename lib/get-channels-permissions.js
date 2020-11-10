
module.exports = function( channel ) {

  const roles = [];

  channel.guild.me.roles.cache.array().forEach(role => {

    role.permissions.toArray().forEach( permissionName => {

      if( !roles.includes( permissionName ) ) {
        roles.push( permissionName );
      }

    });

  });

  roles.ican = permissionName => {
    return roles.includes( permissionName?.toLocaleUpperCase() );
  };

  roles.isAdmin = roles.includes( "ADMINISTRATOR" );

  return roles;

};
