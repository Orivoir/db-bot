const JsonCache = require('./json-cache');
const Reducers = require('./../reducers');

class CacheReducerEntities extends JsonCache {

  constructor( type ) {

    // filename
    super( type );

    const reducers = new Reducers;

    this.reducerMethod = reducers[type].bind( reducers );

    if( !(this.reducerMethod instanceof Function) ) {
      throw new TypeError(`CacheEntities type: "${type}" is unknown`);
    }

    this.reducerType = type.toLocaleLowerCase().trim();

    if( !JsonCache.EXISTS_FILE( type ) ) {
      super.write({ items: [] });
    }

  }

  add( entity ) {

    if( typeof entity !== "object" ) {
      throw new TypeError('add cache entity should be a object');
    }

    const reduceEntity = this.reducerMethod( entity );
    const currentEntities = this.entities;

    if( !currentEntities.find( currentEntity => currentEntity.content.id === reduceEntity.content.id ) ) {

      currentEntities.push( reduceEntity );

      super.write( {
        items: currentEntities
      } );

      return reduceEntity;
    }

    return null;
  }

  delete( entity ) {

    if( typeof entity !== "object" ) {
      throw new TypeError('add cache entity should be a object');
    }

    const reduceEntity = this.reducerMethod( entity );
    const currentEntities = this.entities;

    const newEntities = currentEntities.filter( currentEntity => (
      currentEntity.content.id !== reduceEntity.content.id
    ) );

    const countRemoves = currentEntities.length - newEntities.length;

    super.write({
      items: newEntities
    });

    return countRemoves > 0;
  }

  get entities() {
    return super.read.items;
  }

  clear() {
    super.write( { items: [] } );
  }

};

module.exports = CacheReducerEntities;
