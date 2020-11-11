class StdReducer {

  constructor(content,type) {

    this.content = content;
    this.type = type;
  }

  getJson() {

    const jsonReducer = {};

    Object.keys( this.content )
    .forEach( attribute => {

      if( this.content[attribute] instanceof StdReducer ) {

        // resolve getJson from instance self inside attribute of this.content
        // resolve detph infinite
        // if an attribute of this.content is ref to other attribute of same object
        // throw too much recursion
        jsonReducer[attribute] = this.content[attribute].getJson();

      } else {
        jsonReducer[ attribute ] = this.content[attribute];
      }

    } )

    return jsonReducer;
  }

  set( key, val ) {
    this.content[key] = val;
  }

};

class DiscordReducers {

  channel( discordChannel ) {

    if( discordChannel instanceof StdReducer ) {
      // already reduce object
      return discordChannel;
    }

    const reduceChannel = this.build(
      discordChannel,
      ["id","name","type"],
      "channel"
    );

    reduceChannel.set(
      "server",
      this.guild( discordChannel.guild )
    );

    return reduceChannel;
  }

  guild( discordGuild ) {

    if( discordGuild instanceof StdReducer ) {
      // already reduce object
      return discordGuild;
    }

    const reduceGuild = this.build(
      discordGuild,
      ["id","name","createAt"],
      "server"
    );

    if( discordGuild.owner && discordGuild.owner.user ) {

      reduceGuild.set(
        "user",
        this.user( discordGuild.owner.user )
      );

    } else {
      reduceGuild.set( "user", null );
    }

    return reduceGuild;
  }

  user( discordUser ) {

    if( discordUser instanceof StdReducer ) {
      // already reduce object
      return discordUser;
    }

    return this.build(
      discordUser,
      ["id","username","createdTimestamp"],
      "user"
    );

  }

  message( discordMessage ) {

    if( discordMessage instanceof StdReducer ) {
      // already reduce object
      return discordMessage;
    }

    const reduceMessage = this.build(
      discordMessage,
      [
        'id', 'content', 'createdTimestamp',
        'deletable', 'editable'
      ],
      "message"
    );

    if( discordMessage.author ) {
      reduceMessage.set(
        'owner',
        this.user( discordMessage.author )
      );
    } else {
      reduceMessage.set(
        'owner',
        null
      );
    }

    reduceMessage.set(
      'channel',
      this.channel( discordMessage.channel )
    );

    return reduceMessage;
  }

  build(
    discordEntity,
    properties,
    type
  ) {

    if( typeof discordEntity !== "object" ) {
      throw new TypeError(`reducer ${type} arg1 should be a object`);
    }

    const entityReduce = {};

    properties.forEach( property => {
      entityReduce[property] = discordEntity[property];
    } );

    return new StdReducer( entityReduce, type );
  }

};

module.exports = DiscordReducers;
