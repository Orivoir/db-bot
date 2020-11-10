module.exports = function(channel, name) {

  return new Promise( (resolve,reject) => {

    channel.clone({
      name
    })
    .then( guildChannel => {

      guildChannel.fetch(true)
      .then( channelFetched => {
        resolve( channelFetched )
      } )
      .catch( error => reject(error) );

    } )
    .catch( error => reject(error) );

  } );

};
