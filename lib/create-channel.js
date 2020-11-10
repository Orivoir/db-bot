module.exports = function(guild, {
  name,
  type="text",
  userLimit=5
}) {

  const guildChannelManager = guild.channels;

  return guildChannelManager.create(name, {
    type,
    userLimit
  });

};