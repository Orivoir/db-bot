module.exports = function(client, {
  onCreate,
  onDelete,
  onDeleteGroups,
  onUpdate,
}) {

  if( onCreate instanceof Function ) {

    client.on('message', onCreate);
  }

  if( onDelete instanceof Function ) {

    client.on('messageDelete', onDelete);
  }

  if( onDeleteGroups instanceof Function ) {

    client.on('messageDeleteGroup', onDeleteGroups);
  }

  if( onUpdate instanceof Function ) {

    client.on('messageUpdate', onUpdate);
  }

}