const logger = require('./lib/logger');

const auth = require('./lib/auth');

const handlerStatus = require('./lib/status');
const handlerMessages = require('./lib/messages-status');
const handlerChannels = require('./lib/channels-status');

const getChannel = require('./lib/get-channel');
const getChannelsFetch = require('./lib/get-channels-fetch');
const getPermissionsChannel = require('./lib/get-channels-permissions');

const scanMessages = require('./lib/scan-messages');

const createChannel = require('./lib/create-channel');
const cloneChannel = require('./lib/clone-channel');

const fs = require('fs');
const path = require('path');

let listFetched = require('./channel-fetched.json');

class Dbiscord {

  constructor( token, dbname ) {

    this.token = token;
    this.isLogged = false;
    this.dbname = dbname;

    this.handlerCallback = [];

    this.channelsCache = null;
  }

  getIsAdmin( db ) {

    const channel = this.getDb( db );

    if( !channel ) {
      throw new Error('database not found');
    } else {
      return getPermissionsChannel( channel ).isAdmin
    }

  }

  get servers() {

    if( !this.client ) {

      throw new Error('client is not logged');
    }

    const guilds = [];

    return new Promise( (resolve,reject) => {

      this.dbList.then( list => {

        list.toArray().forEach( channel => {

          if( !guilds.find( g => g.id === channel.server.id ) ) {
            guilds.push( channel.server );
          }

          guilds.has = function( serverName ) {
            return guilds.find( g => g.name === serverName );
          }

          resolve( guilds );

        } )

      } )
      .catch( error => reject( error ) );

    } );

  }

  saveChannelsFetched( list ) {

    if( list instanceof Array ) {
      list.forEach( channel => {

        if(!listFetched.includes( channel.id )) {

          listFetched.push( channel.id );
        }

      } );
    } else {
      listFetched.forEach( () => listFetched.pop() );
    }

    fs.writeFile(
      path.join( __dirname, "./channel-fetched.json" ),
      JSON.stringify(  (listFetched instanceof Array ? listFetched: []) ),
      error => {
        if( error ) {
          throw new Error(`write file at ./channel-fetched.json ${error.code} => ${error.message}`);
        }
      }
    );

  }

  get dbList() {

    if( !this.client ) {
      throw new Error('client is not logged');
    }

    if( !!this.channelsCache ) {

      return new Promise( (resolve,reject) => {
        resolve( this.channelsCache )
      } )
    }

    const list = {};
    let listArray = [];

    let serverId = null;

    this.client.guilds.cache.array()
    .map( guild => guild.channels.cache.array() )
    .forEach( channels => listArray.push( ...channels ) );

    if( serverId ) {
      listArray = listArray.filter( channel => channel.server.id === serverId);
    }

    return new Promise( (resolve,reject) => {

      getChannelsFetch(
        this.client,
        listFetched.filter( channelId => (
          !listArray.find( channel => channel.id === channelId)
        ) )
      )
      .then( responses => {

        responses.forEach( channel => {
          if( !listArray.find( cha => cha.id === channel.id ) ) {
            if( !serverId || serverId === channel.id ) {
              listArray.push( channel );
            }
          }
        } );

        listArray = listArray
        .filter( channel => channel.isText() )
        .map( channel => this.reduceChannel( channel ) );

        listArray
        .forEach(channelReduce => {
          if(typeof  list[channelReduce.name] === "object" ) {
            list[channelReduce.id] = channelReduce;
          } else {
            list[channelReduce.name] = channelReduce;
          }

        });

        list.toArray = function() {
          return listArray;
        };

        list.append = function( channel ) {
          listArray.push( channel );
        };

        list.delete = function( channel ) {
          listArray = listArray.filter( c => c.id !== channel.id );
        };

        list.has = function( dbname, isSensitive=true ) {

          if( !isSensitive ) {
            dbname = dbname.toLocaleLowerCase();
          }

          return listArray.find( item => (
            (isSensitive ? item.name: item.name.toLocaleLowerCase()) === dbname
          ) );
        };

        this.saveChannelsFetched( list.toArray() );

        this.channelsCache = list;
        resolve( list );

      } )
      .catch( error => {
        // clear cache channel already fetched
        // assumed catch as a or many channel remove
        this.saveChannelsFetched( null );
        reject(error);
      } );

    } );

  }

  removeDb( db ) {

    if( !this.isLogged ) {
      throw new Error('client is not logged');
    }

    if( typeof db === "string" ) {

      db = { id: db };
    }

    const channel = getChannel( this.client, { id: db.id } );

    return new Promise( (resolve,reject) => {

      if( !channel || !(channel.delete instanceof Function) ) {

        resolve( {
          success: false,
          details: `db ${db.id} not found`,
          id: db.id
        } );

      } else {

        channel.delete(true)
        .then( () => {

          resolve( {
            success: true
          } );

        } )
        .catch( error => {
          resolve({
            success: false,
            details: error.message,
            id: db.id
          });
        } )
      }


    } );

  }

  reduceUser( user ) {

    if( !user ) return null;

    return {
      id: user.id,
      username: user.username,
      createdAt: user.createdTimestamp
    };
  }

  reduceGuild( guild ) {

    return {
      id: guild.id,
      name: guild.name,
      createAt: guild.createdTimestamp,
      owner: this.reduceUser(guild.owner?.user),
      fetchDb: dbname => (
        new Promise((resolve,reject) => (
          this.dbList
          .then( channels => (
            resolve(channels.toArray().find( channel => (
              channel.name === dbname && channel.server.id === guild.id
            ) ) )
          ) )
          .catch( error => reject( error ) )
        ) )
      )
    };
  }

  reduceChannel( channel ) {

    return {
      id: channel.id,
      name: channel.name,
      type: channel.type,
      server: this.reduceGuild( channel.guild )
    };
  }

  reduceMessage( message ) {

    const reducer = mssg => ({
      id: mssg.id, // SnowFlake
      content: mssg.content,
      createAt: mssg.createdTimestamp,
      lastUpdateAt: mssg.editedTimestamp,
      isDeletable: mssg.deletable,
      isUpdatable: mssg.editable,
      owner: this.reduceUser(mssg?.author),
      getData: () => JSON.parse( mssg.content ),
      delete: mssg.delete.bind( mssg )
    });

    return message instanceof Array ?
      message.map( m => reducer( m ) ):
      reducer( message )
    ;

  }

  scanDb( db, {onPart, onFinish, onError, isFilter=true, before=null} ) {

    if( !this.client ) {

      throw new Error('client is not logged');
    }

    const channel = this.getDb( db );

    if( channel ) {

      scanMessages(channel, {
        onPart: onPart instanceof Function ? onPart :() => {},
        onFinish: onFinish instanceof Function ? onFinish: () => {},
        onError: onError instanceof Function ? onError: () => {},
        filter: message => {

          if( !isFilter )
            return true;

          const {content} = message;

          try {
            JSON.parse( content );
            return true;
          } catch( SyntaxError ) {
            return false;
          }

        },
        map: message => this.reduceMessage(message),
        options: {
          limit: 3,
          before
        }
      })
    } else {

      onError({ details: "database not found" });
    }

  }

  add( db, content ) {

    if( !this.isLogged ) {

      throw new Error('client is not logged');
    }

    if( typeof content === "string" ) {

      try {
        content = JSON.parse( content );
      } catch( SyntaxError ) {
        throw new TypeError( "content should be a JSON object" );
      }
    }

    const channel = this.getDb( db );

    if( !channel ) {

      throw new Error('database not found');
    } else {

      const contentString = JSON.stringify( content );

      return new Promise( (resolve,reject) => {
        channel.send( contentString, {content: contentString} )
        .then( message => {
          resolve( {success: true, id: message.id} );
        } )
        .catch( error => {
          reject({success: false, code: error.code, message: error.message});
        } )

      } );
    }
  }

  getEntry( db, entryId ) {

    if( !this.client ) {
      throw new TypeError('client is not logged');
    }

    const channel = this.getDb( db );

    if( !channel ) {

      throw new Error('database not exists');
    } else {

      return new Promise( (resolve,reject) => {
        this.client.messages.fetch( entryId )
          .then( message => resolve( this.reduceMessage( message ) ) )
          .catch( error => reject( error ) )
        ;
      } );
    }
  }

  deleteEntry( db, entryId ) {

    if( !this.client ) {
      throw new TypeError('client is not logged');
    }

    const channel = this.getDb( db );

    if( !channel ) {

      throw new Error('database not exists');
    } else {

      return new Promise( (resolve,reject) => (
        this.client.messages.fetch( entryId )
          .then( message => (
            message.delete()
            .then( () => resolve( {
              success: true,
              entry: this.reduceMessage( message )
            } ) )
            .catch( error => reject( { success: false, code: error.code, message: error.message } ) )
          ) )
          .catch( error => reject( { success: false, code: error.code, message: error.message } ) )
      ) );
    }

  }

  updateEntry( db, {
    id,
    content
  } ) {
    if( !this.client ) {
      throw new TypeError('client is not logged');
    }

    const channel = this.getDb( db );

    if( typeof content === "string" ) {
      try {
        JSON.parse( content );
      } catch( SyntaxError ) {
        throw new TypeError('content of entry should be JSON object');
      }
    } else if( typeof content === "object" ) {
      content = JSON.stringify(content);
    }

    if( !channel ) {

      throw new Error('database not exists');
    } else {

      return new Promise( (resolve,reject) => {
        this.client.messages.fetch( id )
          .then( message => {

            message.edit( content, { content } )
            .then( messageUpdated => resolve( this.reduceMessage( messageUpdated ) ) )
            .catch( error => reject( error ) )

          } )
          .catch( error => reject( error ) )
        ;
      } );
    }
  }

  getHandlerWatchDb( message ) {

    return this.handlerCallback.filter( handler => (
      handler.channel.id === message.channel.id
    ) );

  }

  emitHandlerMessage( data, backName ) {

    const handlers = this.getHandlerWatchDb(
      data instanceof Array ? data[0]: data
    );

    handlers.forEach( handler => {

      const cb = (handler.callbacks||{})[backName];

      if( cb instanceof Function ) {
        cb( this.reduceMessage( data ) );
      }

    } );

  }

  removeChannelFetched( channelId ) {

    listFetched = listFetched.filter( cId => cId !== channelId );

    fs.writeFile(
      path.join( __dirname, "./channel-fetched.json" ),
      JSON.stringify(  (listFetched instanceof Array ? listFetched: []) ),
      error => {
        if( error ) {
          throw new Error(`write file at ./channel-fetched.json ${error.code} => ${error.message}`);
        }
      }
    );

  }

  fireHandlers() {

    handlerStatus(this.client, {
      onError: error => {

        if( this.isLogged ) {
          logger(
            'discord',
            'error',
            `${error.code} => ${error.message}`
          );
          this.isLogged = false;
        }
      },
      onReady: () => {
        if( !this.isLogged ) {
          this.isLogged = true;
          logger('discord', 'success', `${client.user.username} is re connected`);
        }
      }
    });

    handlerMessages(this.client, {
      onCreate: message => {
        this.emitHandlerMessage( message, "onNewEntry" );
      },
      onDelete: message => {
        this.emitHandlerMessage( message, "onRemoveEntry" );

      },
      onDeleteGroups: collectionMessage => {
        this.emitHandlerMessage(
          collectionMessage.array(),
          "onRemoveGroupEntries"
        );
      },
      onUpdate: (oldMessage, newMessage) => {
        this.emitHandlerMessage(
          [oldMessage,newMessage],
          "onUpdateEntry"
        );

      }
    });

    handlerChannels(this.client,{
      onDelete: channel => {
        // upgrade cache channels id for next fetch
        this.removeChannelFetched( channel.id );

        if( this.channelsCache ) {

          this.channelsCache.delete( this.reduceChannel(channel) );
        }

      },
      onCreate: channel => {
        // add new channel from cache for next fetch

        channel = this.reduceChannel( channel );
        this.saveChannelsFetched( [ channel ] );

        if( this.channelsCache ) {
          this.channelsCache.append( channel );
        }
      }
    });

  }

  auth() {

    if( !this.token ) {
      throw new TypeError('token should be not empty string value');
    }

    return new Promise( (resolve, reject) => {

      auth( {token: this.token} )
        .then( client => {

          this.client = client;
          this.isLogged = true;

          logger('discord', 'success', `${client.user.username} is logged`);

          this.fireHandlers();

          resolve( this );

        }  )
        .catch( error => {

          logger(
            'discord',
            'error',
            `${error.code} => ${error.message}`
          );

          reject( error );
        } )
      ;

    } );

  }

  getDb( db ) {

    if( typeof db === "string" ) {
      db = {
        id: db
      };
    }

    if( typeof db !== "object" ) {
      throw new Error('arg1 database is required')
    }

    if( this.channelsCache ) {

      const reduceChannel = this.channelsCache.toArray().find( channel => {
        return channel[ (db.name ? "name": "id") ] === (db.name||db.id);
      } );

      // fetch real channel
      return getChannel( this.client, {id: reduceChannel.id} );

    } else {

      return getChannel( this.client, {id: db.id} );
    }
  }

  regenerate( db ) {

    let countFetched = 0;
    let countRemove = 0;
    let countFail = 0;
    let isFinishFetch = false;

    return new Promise( (resolve,reject) => {
      this.scanDb(db, {
        onPart: messages => {

          countFetched += messages.length;

          messages.forEach( mssg => {
            mssg.delete()
            .then( () => {
              countRemove++;
              logger('discord', 'success', `entry delete`);

              if( isFinishFetch && ( countRemove - countFail ) >= countFetched ) {
                resolve({
                  count: {
                    remove: countRemove,
                    entries: countFetched,
                    fail: countFail,
                  },
                  isAllRemove: countFail === 0
                });
              }
            } )
            .catch( error => {
              countFail++;
              logger('discord', 'error', `entry cant delete ${error.code} => ${error.message}`)
            } )
          } )
        },
        onFinish: () => {
          isFinishFetch = true;

          if( countFetched === 0 ) {
            resolve({ success: true, details: "db already empty" })
          }
        },
        onError: error => reject( error ),
        isFilter: false
      } );

    } );
  }

  createDb( dbname, server ) {

    return new Promise( (resolve, reject) => {

      this.client.guilds.fetch( server.id, false, true )
      .then( guild => {

        createChannel( guild, {
          name: dbname
        } )
        .then( guildChannel => {
          resolve( this.reduceGuild( guildChannel ) );
        } )
        .then( error => {
          reject( error );
        } );

      } )
      .catch( error => reject( error ) );

    } );
  }

  watch( db, {
    onNewEntry,
    onRemoveEntry,
    onRemoveGroupEntries,
    onUpdateEntry
  } ) {

    const channel = this.getDb( db );

    if( !channel ) {
      throw new Error('database not found');
    }

    this.handlerCallback.push({
      channel: this.reduceChannel( channel ),
      callbacks: {
        onNewEntry,
        onRemoveEntry,
        onRemoveGroupEntries,
        onUpdateEntry
      }
    })
  }

  get token() {
    return this._token;
  }
  set token(token) {
    this._token = (typeof token === "string" && token.length > 0) ? token: null;
  }

};

module.exports = Dbiscord;
