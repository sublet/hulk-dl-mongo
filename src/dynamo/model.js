const _ = require('lodash');
const database = require('./connect');

class BaseModel {
  constructor(name) {
    this._name = name;
  }

  get ddb() {
    return database.ddb;
  }

  async connect(model) {
    if (!model) throw new Error('Pass model into this method');

    await database.connectToDatabase();

    // console.log(`#### Checking Table: ${process.env.HULK_DYNAMO_DBNAME}_${this._name}`)

    if (
      database.tables.indexOf(
        `${process.env.HULK_DYNAMO_DBNAME}_${this._name}`,
      ) < 0
    ) {
      const tableInput = await this.createTableIndex(model);
      tableInput.ProvisionedThroughput.ReadCapacityUnits = 2;

      // const standardInput = await model.table.create.request()

      // console.log('########################################')
      // console.log('')
      // console.log('tableInput: ')
      // console.dir(tableInput, { depth: 5 });
      // console.log('')
      // console.log('standardInput: ')
      // console.dir(standardInput, { depth: 5 });
      // console.log('')
      // console.log('########################################')

      // if (process.env.NODE_ENV !== 'production') {
      //   console.log('#### Creating table with schema:');
      //   console.dir(tableInput, { depth: 3 });
      // }
      try {
        const results = await database.ddb.createTable(tableInput).promise();
        if (results) {
          console.log(`#### Table ${tableInput.TableName} created.`);
        }
      } catch (e) {
        if (e.message.toLowerCase().indexOf('table already exists') < 0) {
          throw e;
        }
        //  else {
        //   console.log(`#### Table ${tableInput.TableName} already exists.`)
        // }
      }
    }

    return Promise.resolve();
  }

  schema() {
    throw new Error('must override in subclass');
  }

  defaultSchema() {
    return {
      id: database.getId(),
      deleted: {
        type: Boolean,
        default: false,
        required: true,
      },
    };
  }

  build() {
    if (!process.env.HULK_DYNAMO_DBNAME) throw new Error('DB Name not set.');

    let structure = _.extend(this.defaultSchema(), this.schema());

    return database.buildModel(this._name, structure);
  }

  createTableIndex(model) {
    return model.table.create.request();
  }
}

module.exports = BaseModel;
