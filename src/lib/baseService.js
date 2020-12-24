class Service {
  constructor(model, serviceName) {    
    this._model = model;
    this._serviceName = serviceName;
    this._database = model.build();
  }

  get serviceName() {
    return this._serviceName;
  }

  get db() {
    return this._model
  }

  get model() {
    return this._database
  }

  create() {
    throw new Error('create must be overridden.');
  }

  createMany() {
    throw new Error('createMany must be overridden.');
  }

  readMany() {
    throw new Error('readOne readMany be overridden.');
  }

  findOne() {
    throw new Error('findOne readMany be overridden.');
  }

  count() {
    throw new Error('count count be overridden.');
  }

  update() {
    throw new Error('update count be overridden.');
  }

  updateMany() {
    throw new Error('updateMany count be overridden.');
  }

  delete() {
    throw new Error('delete count be overridden.');
  }

  deleteMany() {
    throw new Error('deleteMany count be overridden.');
  }

  updateAndReturn() {
    throw new Error('updateAndReturn readMany be overridden.');
  }

  createOrUpdate() {
    throw new Error('createOrUpdate readMany be overridden.');
  }
}

module.exports = Service;
