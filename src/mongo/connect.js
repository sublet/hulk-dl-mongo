const mongoose = require('mongoose');
const { uuid } = require('uuidv4');
const Promise = require('bluebird');
const { MongoClient } = require('mongodb');
const autopopulate = require('mongoose-autopopulate');

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

/*
 * Notes:
 * https://hackernoon.com/building-a-serverless-rest-api-with-node-js-and-mongodb-2e0ed0638f47
 * https://stackoverflow.com/questions/7034848/mongodb-output-id-instead-of-id
 */

class Mongo {
  constructor() {
    this.isConnected = false;
    this.database = null

    mongoose.Promise = Promise;
  }

  get connected() {
    return this.isConnected;
  }

  async connectToDatabase() {
    if (!this.isConnected) {
      if (process.env.NODE_ENV !== 'production' && process.env.HULK_DEBUGGER)
        console.log('## using new database connection');

      const options = this._getOptions();

      try {
        this.database = await mongoose.connect(process.env.HULK_MONGO_URI, options);
        this.isConnected = this.database.connections[0].readyState;
      } catch (e) {
        throw new Error(e.message);
      }
    } else {
      if (process.env.NODE_ENV !== 'production' && process.env.HULK_DEBUGGER)
        console.log('=> using existing database connection');
      return Promise.resolve();
    }
  }

  closeConnection() {
    mongoose.connection.close()
    if (process.env.NODE_ENV !== 'production' && process.env.HULK_DEBUGGER)
      console.log('## connection close');
  }

  _getOptions() {
    return {
      dbName: process.env.HULK_MONGO_DB,
      ssl: process.env.HULK_MONGO_SSL === 'true',
      useNewUrlParser: true,
      useUnifiedTopology: true,
      poolSize: process.env.HULK_MONGO_POOLSIZE || 5
    };
  }

  buildModel(name, structure) {
    let schema = new mongoose.Schema(structure, {
      autoIndex: process.env.DISABLE_AUTO_INDEX,
    });

    schema.plugin(autopopulate);

    schema.method('toClient', function () {
      let obj = this.toObject();
      obj.id = obj._id;
      delete obj._id;
      delete obj.deleted;
      delete obj.__v;
      return obj;
    });

    schema.set('toObject', { getters: true });
    schema.set('toJSON', { getters: true });

    return mongoose.model(name, schema);
  }

  getId() {
    return {
      type: String,
      default: uuid,
      required: true,
    };
  }

  async quickConnect() {
    let client = new MongoClient(process.env.HULK_MONGO_URI, {
      promiseLibrary: Promise,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      poolSize: process.env.HULK_MONGO_POOLSIZE || 5,
    });
    await client.connect();
    return { client, db: client.db(process.env.HULK_MONGO_DB) };
  }
}

module.exports = new Mongo();
