module.exports = function(client, ids) {

  return Promise.all(
    ids.map( channelId => (
      client.channels.fetch( channelId )
    ) )
  );

}