module.exports = function( client, {name, id=null} ) {

  const channels = client.channels.cache;

  let channel = null;

  for( const map of channels ) {

    const currentChannel = map[1];

    if( typeof id === 'string' ) {

      channel = id === currentChannel.id ? currentChannel: channel;
    } else if( typeof name === "string" ) {

      channel = currentChannel.name === name ? currentChannel: channel;
    }
  }

  return channel;

};