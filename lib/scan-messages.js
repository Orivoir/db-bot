function scanMessages( channel, {
  onPart,
  onFinish,
  onError,
  filter,
  map,
  options,
} ) {

  if( !(channel?.fetch instanceof Function) ) {
    throw new TypeError("channel should be a instance of Discord.Channel");
  }

  options = typeof options === "object" ? options: {
    limit: 10,
    before: null
  };

  const messageManager = channel.messages;

  if( !messageManager ) {

    throw new Error(`entry manager not find on ${channel.name} (${channel.id})`);
  }

  messageManager.fetch({
    limit: options.limit,
    before: options.before || undefined
  })
  .then( collectionMessage => {

    let messages = collectionMessage.array();

    if( messages.length > 0 ) {

      const lastMessage = messages[ messages.length-1 ];

      options.before = lastMessage.id;

      if( filter instanceof Function ) {
        messages = messages.filter( filter );
      }

      if( map instanceof Function ) {

        messages = messages.map( map );
      }

      if( messages.length > 0 ) {
        onPart( messages );
      }

      scanMessages(channel, {
        onPart,
        onFinish,
        onError,
        filter,
        map,
        options
      } );

    } else {
      onFinish();
    }

  } )
  .catch( error => {

    if( error.message === 'Maximum call stack size exceeded' ) {
      // fetch before the first message is exceeded

      onFinish()
    } else {
      onError( {
        code: error.code,
        message: error.message
      } );
    }

  } );

}

module.exports = scanMessages;
