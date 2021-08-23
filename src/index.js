// const _ = require('lodash')
const fs = require('fs');

class DataLayer {
  constructor(config) {
    this._config = config;

    process.env.HULK_MONGO_URI = this._config.uri;
    process.env.HULK_MONGO_DB = this._config.db;
    process.env.HULK_MONGO_SSL = this._config.ssl;
    process.env.HULK_MONGO_POOLSIZE = this._config.poolSize;

    this.services = null
  }

  get Model() {
    return require('./mongo/model');
  }

  get Service() {
    return require('./mongo/service');
  }

  build() {
    if (!this.services) {
      let service = null
      this.services = {}
      fs.readdirSync(`${this._config.servicesPath}/`).forEach(file => {
        service = require(`${this._config.servicesPath}/${file}`)
        this.services[service.serviceName] = service;
      })
    }
    return this.services
  }

  closeConnections() {
    const key = Object.keys(this.services)[0]
    this.services[key].closeDatabaseConnection()
  }
}

module.exports = config => new DataLayer(config)
