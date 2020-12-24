const { uuid } = require('uuidv4');
const Service = require('../lib/baseService');

class BaseService extends Service {
  async create(data) {
    if (!data) throw new Error('Data is required');

    await this._model.connect(); // Connect

    if (this._database) return this._database.create(data);
  }

  async createMany() {
    await this._model.connect(); // Connect

    return this._database.insertMany(...arguments);
  }

  async readOne(id) {
    if (!id) throw new Error('id is required');

    await this._model.connect(); // Connect

    const query = {
      _id: id,
    };

    let results = await this._database.findOne(query).exec();
    if (!results) {
      throw new Error('Not found.');
    }
    return results;
  }

  async readMany(
    query,
    { limit = 50, select = null, populate = null, sort = null } = {},
  ) {
    await this._model.connect(); // Connect

    let cursor = this._database.find(query);
    if (limit) cursor.limit(+limit);
    if (populate) populate.map(itm => (cursor = cursor.populate(itm)));
    if (sort) cursor = cursor.sort(sort);
    if (select) cursor = cursor.select(select);
    let results = await cursor.exec();
    return results.map(obj => obj.toClient());
  }

  // https://davidburgos.blog/return-updated-document-mongoose/
  async updateAndReturn(query, updates, options = {}) {
    if (!query) throw new Error('Query is invalid');
    if (!updates) throw new Error('Update are invalid');

    await this._model.connect(); // Connect

    updates.modifiedAt = Date.now();

    options.new = true;
    options.upsert = false;
    options.runValidators = true;

    return this._database.findOneAndUpdate(query, updates, options);
  }

  async createOrUpdate(query, data) {
    if (!query) throw new Error('query is required');
    if (!data) throw new Error('data is required');

    await this._model.connect(); // Connect

    data.modifiedAt = Date.now();

    const insertData = {
      _id: uuid(),
      createdAt: Date.now(),
      deleted: false,
    };

    return this._database
      .findOneAndUpdate(
        query,
        { $set: data, $setOnInsert: insertData },
        { new: true, upsert: true },
      )
      .exec();
  }

  async findOne(query) {
    await this._model.connect(); // Connect

    const results = await this._database.findOne(query).exec();
    return results ? results.toClient() : results;
  }

  async count() {
    await this._model.connect(); // Connect

    return this._database.countDocuments(...arguments).exec();
  }

  async update() {
    await this._model.connect(); // Connect

    return this._database.update(...arguments).exec();
  }

  async updateMany() {
    await this._model.connect(); // Connect

    return this._database.updateMany(...arguments).exec();
  }

  async delete() {
    await this._model.connect(); // Connect

    return this._database.deleteOne(...arguments).exec();
  }

  async deleteMany() {
    await this._model.connect(); // Connect

    return this._database.deleteMany(...arguments).exec();
  }

  async aggregate(params) {
    await this._model.connect(); // Connect

    return this._database.aggregate(params).exec();
  }
}

module.exports = BaseService;
