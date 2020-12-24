const Service = require('../lib/baseService')

class BaseService extends Service {
  async create(data) {
    await this.db.connect(this.model) // Connect

    const myObject = new this.model(data);

    return myObject.save()
  }

  async findOne(query) {
    await this.db.connect(this.model) // Connect

    return this.model.query(query).limit(1).exec()
  }

  async readMany(query) {
    await this.db.connect(this.model) // Connect

    return this.model.query(query).exec()
  }
}

module.exports = BaseService;
