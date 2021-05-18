// const _ = require('lodash')
const fs = require('fs');

class DataLayer {
  constructor(config) {
    this._config = config;

    this._type = null;
    if (this._config.mongo) {
      this._type = 'MONGO';
      if (!this._config.mongo.uri) throw new Error('URI not set.');
      if (!this._config.mongo.db) throw new Error('DB not set.');
      if (!this._config.mongo.poolSize) throw new Error('Pool Size not set.');

      process.env.HULK_MONGO_URI = this._config.mongo.uri;
      process.env.HULK_MONGO_DB = this._config.mongo.db;
      process.env.HULK_MONGO_SSL = this._config.mongo.ssl;
      process.env.HULK_MONGO_POOLSIZE = this._config.mongo.poolSize;
    } else {
      throw new Error('Database not defined.');
    }
  }

  get Model() {
    if (this._type === 'MONGO') {
      return require('./mongo/model');
    }
    throw new Error('Model Type not defined: ' + String(this._type));
  }

  get Service() {
    if (this._type === 'MONGO') {
      return require('./mongo/service');
    }
    throw new Error('Service Type not defined: ' + String(this._type));
  }

  build() {
    let service = null;
    let services = {};
    fs.readdirSync(`${this._config.servicesPath}/`).forEach(file => {
      service = require(`${this._config.servicesPath}/${file}`);
      services[service.serviceName] = service;
    });
    return services;
  }
}

module.exports = config => new DataLayer(config);
