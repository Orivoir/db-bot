const Discord = require('discord.js');

module.exports = ({token}) => {

  const client = new Discord.Client;

  return new Promise((resolve,reject) => (

    client.login( token )
      .then( () => resolve(client) )
      .catch( error => reject(error) )

  ) );

};
