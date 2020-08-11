// const _ = require('lodash')
const fs = require('fs')

class DataLayer {
  constructor(config) {
    this._config = config

    process.env.HULK_MONGO_URI = this._config.uri
    process.env.HULK_MONGO_DB = this._config.db
    process.env.HULK_MONGO_SSL = this._config.ssl
    process.env.HULK_MONGO_POOLSIZE = this._config.poolSize
  }
  
  get Model() {
    return require('./db/model')
  }
  
  get Service() {
    return require('./db/service')
  }

  build() {
    let service = null
    let services = {}
    fs.readdirSync(`${this._config.servicesPath}/`).forEach(file => {
      service = require(`${this._config.servicesPath}/${file}`)
      services[service.serviceName] = service
    })
    return services
  }
}

module.exports = config => new DataLayer(config)
