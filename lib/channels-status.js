module.exports = function(client, {
  onCreate,
  onDelete,
  onUpdate,
  onPinsUpdate
}) {

  if( onCreate instanceof Function ) {

    client.on('channelCreate', onCreate);
  }

  if( onDelete instanceof Function ) {

    client.on('channelDelete', onDelete);
  }

  if( onUpdate instanceof Function ) {

    client.on('channelUpdate', onUpdate);
  }

  if( onPinsUpdate instanceof Function ) {

    client.on('channelPinsUpdate', onPinsUpdate);
  }

}