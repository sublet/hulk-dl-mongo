const dynamoose = require("dynamoose")
const AWS = require('aws-sdk')
const { uuid: uuidv4 } = require('uuidv4')
const Promise = require('bluebird')

/*
 * Notes:
 * https://hackernoon.com/building-a-serverless-rest-api-with-node-js-and-mongodb-2e0ed0638f47
 * https://stackoverflow.com/questions/7034848/mongodb-output-id-instead-of-id
 */

class Connect {
  constructor() {
    this.isConnected = false;
    this._tables = null

    const connectParams = {
      "accessKeyId": process.env.HULK_DYNAMO_KEY,
      "secretAccessKey": process.env.HULK_DYNAMO_SECRET,
      "region": process.env.HULK_DYNAMO_REGION
    }

    AWS.config = new AWS.Config(connectParams)

    this._ddb = new AWS.DynamoDB()
  }

  get connected() {
    return this.isConnected
  }

  get ddb() {
    return this._ddb
  }

  get tables() {
    return this._tables
  }

  async connectToDatabase() {
    if (!this.isConnected) {
      if (process.env.NODE_ENV !== 'production') console.log('## using new database connection');

      try {
        if (!this._tables) await this.fetchTables()
        dynamoose.aws.ddb.set(this._ddb)
        return Promise.resolve()
      } catch(e) {
        throw new Error(e.message)
      }
    } else {
      console.log('=> using existing database connection');
      return Promise.resolve();
    }
  }

  buildModel(name, structure) {
    const schema = new dynamoose.Schema(structure, {
      saveUnknown: false,
      timestamps: true
    });

    return dynamoose.model(name, schema, {
      create: false,
      prefix: `${process.env.HULK_DYNAMO_DBNAME}_`,
      throughput: {
        read: 1,
        write: 1
      }
    })
  }

  getId() {
    return {
      type: String,
      default: uuidv4,
      required: true
    };
  }

  fetchTables() {
    return new Promise((resolve, reject) => {
      if (this._tables) return resolve(this._tables)
      this._ddb.listTables({}, (err, data) => {
        if (err) reject(err)
        if (data && data.TableNames) {
          this._tables = data.TableNames
          resolve()
        }
        reject(new Error('TableNames invalid.'))
      });
    })
  }
}

module.exports = new Connect();
