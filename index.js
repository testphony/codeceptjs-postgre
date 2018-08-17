
const requireg = require('requireg');
const assert = require('assert');
const camelcaseKeys = require('camelcase-keys');
const pgNamed = require('node-postgres-named');

let PGClient;

/**
 * Хэлпер для работы с базой mysql.
 */
class Postgre extends Helper {
  /**
   *
   * @param {object} config
   */
  constructor(config) {
    super(config);
    PGClient = requireg('pg').Client;
    this._validateConfig(config);
  }

  /**
   *
   * @param {object} config
   * @private
   */
  _validateConfig(config) {
    this.options = {
      default: {
        port: 5432,
      },
    };

    this.connections = {};

    // override defaults with config
    Object.assign(this.options, config);

    if (!this.options.default || !this.options.default.host || !this.options.dbs) {
      throw new Error(`
        PG requires at host and dbs login/password to be set.
        Check your codeceptjs config file to ensure this is set properly
          {
            "helpers": {
              "postgre": {
                "default" : {
                  "host": "YOUR_HOST",
                  "port": "YOUR_PORT",
                  "user": "YOUR_USER",
                  "password": "YOUR_PASSWORD"
                },
                "dbs": {
                  oms: { },
                  universeGatewayDb: {
                    "user": "UNIVERSE_USER",
                    "password": "UNIVERSE_PASSWORD"
                  }
                }
              }
            }
          }
        `);
    }
  }

  /**
   *
   * @returns {string[]}
   * @private
   */
  // eslint-disable-next-line consistent-return
  static _checkRequirements() {
    try {
      requireg('pg');
    } catch (e) {
      return ['pg'];
    }
    // eslint-disable-next-line consistent-return
  }

  /**
   * Открывает коннект к базе.
   * @param {string} dbName
   * @returns {Promise<*>}
   * @private
   */
  _openConnect(dbName) {
    if (this.options.dbs[dbName]) {
      this.options.dbs[dbName] = Object.assign({}, this.options.default, this.options.dbs[dbName]);
      if (typeof this.options.dbs[dbName].user === 'string' && typeof this.options.dbs[dbName].password === 'string') {
        this.connections[dbName] = new PGClient({
          user: this.options.dbs[dbName].user,
          host: this.options.dbs[dbName].host,
          database: dbName,
          password: this.options.dbs[dbName].password,
          port: this.options.dbs[dbName].port,
        });
        pgNamed.patch(this.connections[dbName]);
        return this.connections[dbName].connect();
      }
      throw new Error(`There is no user or password for DB ${dbName} in config`);
    }
    throw new Error(`There is no DB ${dbName} in config`);
  }

  /**
   * Совершает запрос в базу.
   * @param {string} query
   * @param [object] params
   * @param {string} dbName
   * @returns {Promise<*>}
   */
  query(query, params = {}, dbName) {
    if (this.connections[dbName]) {
      return this.connections[dbName].query(query, params)
        .then((res) => {
          if (res.command === 'SELECT') {
            return camelcaseKeys(res.rows);
          }
          return camelcaseKeys(res);
        })
        .catch(err => assert.fail(err));
    }
    return this._openConnect(dbName)
      .then(() => this.connections[dbName].query(query, params)
        .then((res) => {
          if (res.command === 'SELECT') {
            return camelcaseKeys(res.rows);
          }
          return camelcaseKeys(res);
        })
        .catch(err => assert.fail(err)));
  }

  /**
   *
   * @private
   */
  _finishTest() {
    Object.keys(this.connections).forEach((connect) => {
      this.connections[connect].end();
    });
  }
}

module.exports = Postgre;
