export = Postgre;
/**
 * Helper to work with Postgres DB.
 */
declare class Postgre {
    /**
     *
     * @returns {string[]}
     * @private
     */
    private static _checkRequirements;
    /**
     *
     * @param {object} config
     */
    constructor(config: object);
    /**
     *
     * @param {object} config
     * @private
     */
    private _validateConfig;
    options: {
        default: {
            port: number;
        };
    };
    connections: {};
    /**
     * Open connect to DB
     * @param {string} dbName
     * @returns {Promise<*>}
     * @private
     */
    private _openConnect;
    /**
     * query db
     * @param {string} query
     * @param [{ [key: string]: any }] params
     * @param {string} dbName
     * @returns {Promise<*>}
     */
    query(query: string, params: { [key: string]: any }, dbName: string): Promise<any>;
    /**
     *
     * @private
     */
    private _finishTest;
}
