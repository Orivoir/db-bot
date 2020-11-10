module.exports = function(client, {
  onReady,
  onError,
  onWarn,
  onDebug
}) {

  if( onReady instanceof Function ) {
    client.on('ready', onReady);
  }

  if( onError instanceof Function ) {
    client.on('error', onError);
  }

  if( onWarn instanceof Function ) {
    client.on('warn', onWarn);
  }

  if( onDebug instanceof Function ) {
    client.on('debug', onDebug);
  }

}