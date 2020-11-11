const CacheEntities = require('./../cache/reducers');
const Reducers = require('./../reducers');

const Guilds = require('./guilds/guilds');

const cache = {
  channels: new CacheEntities('channel'),
  servers: new CacheEntities('guild')
};

class CrudDb {

  constructor( connection ) {

    this.connection = connection;
    this.reducers = new Reducers;
    this.cache = cache;

    this.guilds = new Guilds(this);
  }

  destroy() {
    this.connection.destroy();
  }

};

module.exports = CrudDb;
