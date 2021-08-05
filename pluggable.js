const fs = require("fs");
const crypto = require("crypto");

module.exports = class Pluggable {
  #currenHash = null;
  #module = null;
  #path = null;
  #type = null;

  /**
   *
   * @param {string} type script | filter
   * @param {string} path full path
   */
  constructor(type, path) {
    // type variable handling
    if (typeof type !== "string") {
      throw new Error(`Expected type string for type, got ${typeof type}`);
    }
    if (type !== "script" && type !== "filter") {
      throw new Error(`type ${type} not accepted`);
    }
    // path variable handling
    if (typeof path !== "string") {
      throw new Error(`Expected type string for path, got ${typeof path}`);
    }
    if (!fs.existsSync(path)) {
      throw new Error(`Path ${path} does not exist`);
    }
    this.#type = type;
    this.#path = path;
    this.#currenHash = this.#createHash();
    this.#import();
    if (this.#module === null) {
      throw new Error(`Could not load ${typeof path}`);
    }
    try {
      this.command;
    } catch (err) {
      throw new Error("Command variable required for script type");
    }
  }

  /**
   *
   * @param {Client} client
   * @param {string} channel
   * @param {Object} tags
   * @param {string} message
   * @param {boolean} self
   * @param {Storage} storage
   * @returns {boolean}
   */
  execute(client, channel, tags, message, self, storage) {
    if (!this.#matchingHash()) {
      this.#currenHash = this.#createHash();
      this.#import();
    }
    let result = false;
    if (this.#module !== null) {
      try {
        result = this.#module.execute(
          client,
          channel,
          tags,
          message,
          self,
          storage
        );
      } catch (err) {
        console.log(err);
      }
    }
    return result;
  }

  /**
   * direct access to path files
   * @returns {object}
   */
  get direct() {
    if (!this.#matchingHash()) {
      this.#currenHash = this.#createHash();
      this.#import();
    }
    return this.#module;
  }

  /**
   * @returns {boolean} file noted in path exists
   */
  get pathExists() {
    return fs.existsSync(this.#path);
  }

  /**
   * Gets command name
   */
  get command() {
    let result = "";
    if (!this.#matchingHash()) {
      this.#import();
    }
    if (typeof this.#module.command !== "string" && this.#type === "script") {
      throw new Error("No command variable set");
    }
    result = this.#module.command;
    return result;
  }

  /**
   * full path
   */
  get path() {
    return this.#path;
  }

  /**
   * imports file to node
   */
  #import() {
    if (this.pathExists) {
      delete require.cache[require.resolve(this.#path)];
      this.#module = require(this.#path);
    } else {
      this.#module = null;
    }
  }

  /**
   * Generates hash for file
   * @returns {string}
   */
  #createHash() {
    const hashSum = crypto.createHash("sha1");
    let filedata = fs.readFileSync(this.#path, "utf-8", (err, data) => {
      if (err) {
        throw new Error(err);
      }
      return data;
    });
    hashSum.update(filedata);
    return hashSum.digest("hex");
  }

  /**
   * @returns {boolean}
   */
  #matchingHash() {
    return this.#createHash() === this.#currenHash;
  }
};
